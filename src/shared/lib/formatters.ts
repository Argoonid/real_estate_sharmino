import { DatabaseProperty, Currency } from '../types';

import type { ExchangeRates } from './exchangeRates';

export const UNLIMITED_PRICE = 1_000_000_000_000;

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates?: ExchangeRates,
): number | null {
  if (!Number.isFinite(amount)) return null;
  if (!rates) return fromCurrency === toCurrency ? amount : null;
  return (amount / rates[fromCurrency]) * rates[toCurrency];
}

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  EGP: 'EGP',
  RUB: '₽',
};

export function formatPricePerSquareMeter(
  property: DatabaseProperty,
  targetCurrency: Currency,
  lang: 'ru' | 'en' | 'it' = 'ru',
  rates?: ExchangeRates,
): string | null {
  const { amount, currency: sourceCurrency, is_price_on_request: isPriceOnRequest } = property.price;
  const area = property.specs.area_sqm;
  if (
    property.deal !== 'sale' ||
    isPriceOnRequest ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isFinite(area) ||
    area <= 0
  ) {
    return null;
  }

  const convertedTotal = convertCurrency(amount, sourceCurrency, targetCurrency, rates);
  const displayCurrency = convertedTotal === null ? sourceCurrency : targetCurrency;
  const unit = lang === 'ru' ? 'м²' : 'm²';
  const rounded = Math.round((convertedTotal ?? amount) / area).toLocaleString(
    lang === 'en' ? 'en-US' : 'ru-RU',
  );

  return `${rounded} ${currencySymbols[displayCurrency]}/${unit}`;
}

export function getBasePriceUSD(
  prop: unknown,
  rates?: ExchangeRates,
): number {
  if (!prop) return 0;
  if (typeof prop === 'number') return isNaN(prop) ? 0 : prop;
  if (typeof prop !== 'object') return 0;

  const property = prop as Partial<DatabaseProperty> & {
    pricing?: { price_usd?: number; is_price_on_request?: boolean };
    price_usd?: number;
  };
  if (property.price) {
    if (property.price.is_price_on_request || property.price.amount <= 0) return 0;
    return convertCurrency(property.price.amount, property.price.currency, 'USD', rates) ?? 0;
  }
  if (typeof property.pricing?.price_usd === 'number') return property.pricing.price_usd;
  if (typeof property.price_usd === 'number') return property.price_usd;
  return 0;
}

export function formatPrice(
  propOrAmount: any,
  targetCurrency: Currency = 'USD',
  lang: 'ru' | 'en' | 'it' = 'ru',
  rates?: ExchangeRates,
): string {
  if (propOrAmount === null || propOrAmount === undefined) {
    if (lang === 'en') return 'Price on request';
    if (lang === 'it') return 'Prezzo su richiesta';
    return 'Цена по запросу';
  }

  let amount = 0;
  let sourceCurrency: Currency = targetCurrency;
  let isRequest = false;
  let deal: string | undefined = undefined;

  try {
    if (typeof propOrAmount === 'number') {
      if (isNaN(propOrAmount) || propOrAmount <= 0) isRequest = true;
      amount = isNaN(propOrAmount) ? 0 : propOrAmount;
      sourceCurrency = 'USD';
    } else if (typeof propOrAmount === 'object') {
      deal = propOrAmount?.deal;
      if (propOrAmount?.price) {
        if (propOrAmount.price?.is_price_on_request || (propOrAmount.price?.amount ?? 0) <= 0) {
          isRequest = true;
        } else {
          amount = propOrAmount.price.amount;
          sourceCurrency = propOrAmount.price.currency;
        }
      } else if (propOrAmount?.pricing) {
        if (propOrAmount.pricing?.is_price_on_request || !propOrAmount.pricing?.price_usd) {
          isRequest = true;
        } else {
          amount = propOrAmount.pricing.price_usd;
          sourceCurrency = 'USD';
        }
      } else if (typeof propOrAmount?.price_usd === 'number') {
        amount = propOrAmount.price_usd;
        sourceCurrency = 'USD';
      } else {
        isRequest = true;
      }
    }
  } catch {
    isRequest = true;
  }

  if (isRequest || amount <= 0) {
    if (lang === 'en') return 'Price on request';
    if (lang === 'it') return 'Prezzo su richiesta';
    return 'Цена по запросу';
  }

  const converted = convertCurrency(amount, sourceCurrency, targetCurrency, rates);
  const displayCurrency = converted === null ? sourceCurrency : targetCurrency;
  const rounded = Math.round(converted ?? amount).toLocaleString('ru-RU');

  let suffix = '';
  if (deal === 'long_term_rent') {
    suffix = lang === 'en' ? ' /mo' : lang === 'it' ? ' /mese' : ' /мес';
  } else if (deal === 'daily_rent') {
    suffix = lang === 'en' ? ' /night' : lang === 'it' ? ' /notte' : ' /сут';
  }

  return `${currencySymbols[displayCurrency] || '$'}${rounded}${suffix}`.trim();
}
