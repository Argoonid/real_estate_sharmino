export interface SmartSearchResult {
  raw: string;
  districts: string[];
  propertyTypes: string[];
  dealTypes: string[];
  bedrooms: number | null;
  features: string[];
  idCode: string | null;
  textTerms: string[];
  isStructuredSearch: boolean;
}

const DISTRICT_STEMS: Array<{ id: string; patterns: RegExp[] }> = [
  { id: 'hadaba', patterns: [/\bхадаб\w*/i, /\bhadab\w*/i] },
  { id: 'naama_bay', patterns: [/\bнаам\w*/i, /\bnaam\w*/i] },
  { id: 'sharks_bay', patterns: [/\bшаркс\w*/i, /\bshark\w*/i] },
  { id: 'nabq_bay', patterns: [/\bнабк\w*/i, /\bnabq\w*/i] },
  { id: 'montazah', patterns: [/\bмонтаз\w*/i, /\bmontaz\w*/i, /\bнасран\w*/i, /\bnasran\w*/i] },
  { id: 'pasha_coast', patterns: [/\bпаш\w*/i, /\bpash\w*/i, /\bтауэр\w*/i, /\btower\w*/i] },
  { id: 'domina_coral', patterns: [/\bдомин\w*/i, /\bdomin\w*/i] },
  { id: 'delta_sharm', patterns: [/\bдельт\w*/i, /\bdelt\w*/i] },
  { id: 'old_market', patterns: [/\bстар\w+\s+город\w*/i, /\bолд\s+маркет\w*/i, /\bold\s+market\w*/i, /\bмайя\w*/i, /\bmaya\w*/i] },
];

const TYPE_STEMS: Array<{ type: string; patterns: RegExp[] }> = [
  { type: 'villa', patterns: [/\bвилл\w*/i, /\bvilla\w*/i, /\bдом\b/i, /\bдома\b/i, /\bкоттедж\w*/i, /\bvillett\w*/i] },
  { type: 'apartment', patterns: [/\bквартир\w*/i, /\bапартамент\w*/i, /\bapart\w*/i, /\bflat\w*/i, /\bappartament\w*/i] },
  { type: 'studio', patterns: [/\bстуди\w*/i, /\bstudio\w*/i, /\bmonolocal\w*/i] },
  { type: 'penthouse', patterns: [/\bпентхаус\w*/i, /\bpenthouse\w*/i, /\battic\w*/i] },
  { type: 'chalet', patterns: [/\bшале\b/i, /\bchalet\w*/i] },
  { type: 'duplex', patterns: [/\bдуплекс\w*/i, /\bduplex\w*/i] },
  { type: 'commercial', patterns: [/\bкоммерц\w*/i, /\bмагазин\w*/i, /\bофис\w*/i, /\bcommercial\w*/i, /\bshop\w*/i, /\bnegozi\w*/i] },
];

const DEAL_STEMS: Array<{ deal: string; patterns: RegExp[] }> = [
  { deal: 'sale', patterns: [/\bкуп\w*/i, /\bпокупк\w*/i, /\bпродаж\w*/i, /\bпродам\b/i, /\bbuy\b/i, /\bsale\b/i, /\bvendit\w*/i, /\bcompr\w*/i] },
  { deal: 'long_term_rent', patterns: [/\bдолгосрочн\w*/i, /\bнадолг\w*/i, /\blong\s*term/i, /\blungo\s*termin\w*/i] },
  { deal: 'daily_rent', patterns: [/\bпосуточн\w*/i, /\bсутк\w*/i, /\bdaily\b/i, /\bvacanz\w*/i, /\bgiornalier\w*/i] },
];

const FEATURE_STEMS: Array<{ feature: string; patterns: RegExp[] }> = [
  { feature: 'sea_view', patterns: [/\bвид\w*\s+на\s+мор\w*/i, /\bмор\w*/i, /\bsea\s*view/i, /\bvista\s*mare/i] },
  { feature: 'beach_access', patterns: [/\bпляж\w*/i, /\bперв\w*\s+лини\w*/i, /\bbeach\w*/i, /\bspiaggi\w*/i] },
  { feature: 'pool', patterns: [/\bбассейн\w*/i, /\bpool\w*/i, /\bpiscin\w*/i] },
  { feature: 'furnished', patterns: [/\bмебел\w*/i, /\bfurnished\w*/i, /\barredat\w*/i] },
];

const STOPWORDS = new Set([
  'в', 'на', 'у', 'с', 'со', 'и', 'по', 'для', 'от', 'до', 'из',
  'in', 'at', 'on', 'per', 'da', 'for', 'of', 'the', 'a', 'an', 'di', 'con',
]);

export function parseSmartSearch(rawQuery: string): SmartSearchResult {
  let q = rawQuery.trim().toLowerCase().replace(/ё/g, 'е');
  const result: SmartSearchResult = {
    raw: rawQuery.trim(),
    districts: [],
    propertyTypes: [],
    dealTypes: [],
    bedrooms: null,
    features: [],
    idCode: null,
    textTerms: [],
    isStructuredSearch: false,
  };

  if (!q) return result;

  // 1. Поиск номеров и ID (например: 40481, S102, 25444, shm_abc123)
  const idMatch = q.match(/\b(shm_[a-z0-9]+|[a-z]{0,2}\d{3,7})\b/i);
  if (idMatch) {
    result.idCode = idMatch[0];
  }

  // 2. Поиск спален и комнат (например: 2 спальни, 3 комнаты, 2к, 1 bed, 2 br)
  const bedMatch = q.match(/\b(\d)\s*(?:спальн\w*|комнат\w*|к\b|br\b|beds?\b|bedrooms?|camere?|stanze?)\b/i);
  if (bedMatch) {
    result.bedrooms = Number.parseInt(bedMatch[1], 10);
    q = q.replace(bedMatch[0], ' ');
  } else {
    const kMatch = q.match(/\b([0-4])к\b/i);
    if (kMatch) {
      result.bedrooms = Number.parseInt(kMatch[1], 10);
      q = q.replace(kMatch[0], ' ');
    }
  }

  // 3. Распознавание районов
  for (const { id, patterns } of DISTRICT_STEMS) {
    for (const pat of patterns) {
      if (pat.test(q)) {
        if (!result.districts.includes(id)) result.districts.push(id);
        q = q.replace(pat, ' ');
        break;
      }
    }
  }

  // 4. Распознавание типов недвижимости
  for (const { type, patterns } of TYPE_STEMS) {
    for (const pat of patterns) {
      if (pat.test(q)) {
        if (!result.propertyTypes.includes(type)) result.propertyTypes.push(type);
        q = q.replace(pat, ' ');
        break;
      }
    }
  }

  // 5. Распознавание типа сделки
  for (const { deal, patterns } of DEAL_STEMS) {
    for (const pat of patterns) {
      if (pat.test(q)) {
        if (!result.dealTypes.includes(deal)) result.dealTypes.push(deal);
        q = q.replace(pat, ' ');
        break;
      }
    }
  }

  // 6. Распознавание удобств и видов
  for (const { feature, patterns } of FEATURE_STEMS) {
    for (const pat of patterns) {
      if (pat.test(q)) {
        if (!result.features.includes(feature)) result.features.push(feature);
        q = q.replace(pat, ' ');
        break;
      }
    }
  }

  // 7. Очистка оставшихся ключевых слов
  const rawWords = q
    .split(/[\s,()\[\]\-_/\\+]+/g)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

  result.textTerms = rawWords;
  result.isStructuredSearch =
    result.districts.length > 0 ||
    result.propertyTypes.length > 0 ||
    result.dealTypes.length > 0 ||
    result.bedrooms !== null ||
    result.features.length > 0 ||
    result.idCode !== null;

  return result;
}