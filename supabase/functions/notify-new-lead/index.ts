import { createClient } from 'npm:@supabase/supabase-js@2';

interface LeadWebhook {
  type?: string;
  table?: string;
  schema?: string;
  record?: { id?: string };
}

interface LeadRecord {
  id: string;
  property_id: string | null;
  client_name: string;
  client_phone: string;
  client_telegram: string | null;
  viewing_date: string;
  viewing_time: string;
  viewing_type: string;
  notes: string | null;
}

interface PropertyRecord {
  id: string;
  title: string;
  deal: string;
  price_amount: number;
  price_currency: string;
  source_platform: string | null;
  source_external_id: string | null;
  source_origin_url: string | null;
  source_contact: string | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function requiredSecret(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required function secret: ${name}`);
  return value;
}

function cleanText(value: string | null | undefined, maxLength = 500): string {
  return (value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength);
}

function getPropertyPageUrl(propertyId: string): string {
  const siteUrl = new URL(requiredSecret('PUBLIC_SITE_URL'));
  if (siteUrl.protocol !== 'https:') {
    throw new Error('PUBLIC_SITE_URL must use HTTPS.');
  }
  return `${siteUrl.origin}/?property=${encodeURIComponent(propertyId)}`;
}

function buildMessage(lead: LeadRecord, property: PropertyRecord | null): string {
  const lines = [
    'Новая заявка с сайта Sharmino',
    `Клиент: ${cleanText(lead.client_name, 120)}`,
    `Телефон: ${cleanText(lead.client_phone, 80)}`,
  ];
  if (lead.client_telegram) lines.push(`Telegram клиента: ${cleanText(lead.client_telegram, 80)}`);
  lines.push(
    `Формат: ${cleanText(lead.viewing_type, 40)}`,
    `Дата и время: ${cleanText(lead.viewing_date, 30)} ${cleanText(lead.viewing_time, 30)}`,
    `ID заявки: ${lead.id}`,
  );
  if (lead.notes) lines.push(`Комментарий: ${cleanText(lead.notes, 700)}`);

  if (!property) {
    lines.push('Объект: не указан или уже удалён');
    return lines.join('\n');
  }

  lines.push(
    '',
    `Объект: ${cleanText(property.title, 200)}`,
    `ID объекта: ${property.id}`,
    `Тип сделки: ${cleanText(property.deal, 40)}`,
    `Цена: ${Number(property.price_amount).toLocaleString('ru-RU')} ${cleanText(property.price_currency, 12)}`,
    `Страница объекта: ${getPropertyPageUrl(property.id)}`,
  );
  if (property.source_platform) lines.push(`Источник: ${cleanText(property.source_platform, 100)}`);
  if (property.source_contact) lines.push(`Контакт источника: ${cleanText(property.source_contact, 200)}`);
  if (property.source_origin_url) lines.push(`Исходная публикация: ${cleanText(property.source_origin_url, 1000)}`);
  if (property.source_external_id) lines.push(`ID у источника: ${cleanText(property.source_external_id, 100)}`);
  return lines.join('\n').slice(0, 3900);
}

async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Telegram sendMessage failed (${response.status}): ${responseText.slice(0, 500)}`);
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const expectedSecret = Deno.env.get('DATABASE_WEBHOOK_SECRET');
  if (!expectedSecret || request.headers.get('x-webhook-secret') !== expectedSecret) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  try {
    const payload = await request.json() as LeadWebhook;
    if (payload.type !== 'INSERT' || payload.table !== 'leads' || payload.schema !== 'public') {
      return new Response('Ignored: unexpected webhook event', { status: 400, headers: corsHeaders });
    }
    const leadId = payload.record?.id;
    if (!leadId) return new Response('Missing lead id', { status: 400, headers: corsHeaders });

    const supabase = createClient(
      requiredSecret('SUPABASE_URL'),
      requiredSecret('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, property_id, client_name, client_phone, client_telegram, viewing_date, viewing_time, viewing_type, notes')
      .eq('id', leadId)
      .single();
    if (leadError) throw leadError;

    let property: PropertyRecord | null = null;
    if (lead.property_id) {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, deal, price_amount, price_currency, source_platform, source_external_id, source_origin_url, source_contact')
        .eq('id', lead.property_id)
        .maybeSingle();
      if (error) throw error;
      property = data;
    }

    const targetChatIds = [...new Set([
      Deno.env.get('TELEGRAM_CHAT_ID') ?? '',
      ...(Deno.env.get('TELEGRAM_ADMIN_CHAT_IDS') ?? '').split(','),
    ].map((chatId) => chatId.trim()).filter(Boolean))];
    if (targetChatIds.length === 0) throw new Error('Configure TELEGRAM_CHAT_ID or TELEGRAM_ADMIN_CHAT_IDS.');

    const message = buildMessage(lead as LeadRecord, property);
    const results = await Promise.allSettled(
      targetChatIds.map((chatId) => sendTelegramMessage(requiredSecret('TELEGRAM_BOT_TOKEN'), chatId, message)),
    );
    const failures = results.flatMap((result, index) =>
      result.status === 'rejected'
        ? [`chat ${targetChatIds[index]}: ${String(result.reason)}`]
        : [],
    );
    if (failures.length > 0) {
      console.error('Telegram lead notification delivery failed.', failures);
      return new Response('Lead stored, but one or more Telegram notifications failed.', {
        status: 502,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ delivered: targetChatIds.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unable to process lead notification webhook.', error);
    return new Response('Unable to process lead notification.', { status: 500, headers: corsHeaders });
  }
});
