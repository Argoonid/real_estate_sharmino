import { useQuery } from '@tanstack/react-query';
import type { Currency } from '../types';

export type ExchangeRates = Record<Currency, number>;

export const EXCHANGE_RATES_QUERY_KEY = ['exchange-rates', 'USD'] as const;

const requiredCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'EGP', 'RUB'];
const ratesStorageKey = 'sharmino_exchange_rates_v1';
const ratesCacheTtl = 24 * 60 * 60 * 1000;

interface CachedExchangeRates {
  fetchedAt: number;
  rates: ExchangeRates;
}

function readCachedExchangeRates(): CachedExchangeRates | null {
  try {
    const raw = window.localStorage.getItem(ratesStorageKey);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedExchangeRates;
    if (
      !Number.isFinite(cached.fetchedAt) ||
      !cached.rates ||
      requiredCurrencies.some((currency) =>
        !Number.isFinite(cached.rates[currency]) || cached.rates[currency] <= 0
      )
    ) {
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const cached = typeof window === 'undefined' ? null : readCachedExchangeRates();
  if (cached && Date.now() - cached.fetchedAt < ratesCacheTtl) return cached.rates;

  const response = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!response.ok) {
    throw new Error(`Не удалось загрузить курсы валют (HTTP ${response.status}).`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object') {
    throw new Error('Сервис курсов валют вернул некорректный ответ.');
  }

  const result = payload as {
    result?: unknown;
    rates?: Record<string, unknown>;
  };
  if (result.result !== 'success' || !result.rates) {
    throw new Error('Сервис курсов валют не предоставил актуальные курсы.');
  }

  const rates = {} as ExchangeRates;
  for (const currency of requiredCurrencies) {
    const rate = result.rates[currency];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      throw new Error(`В ответе сервиса отсутствует корректный курс ${currency}.`);
    }
    rates[currency] = rate;
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        ratesStorageKey,
        JSON.stringify({ fetchedAt: Date.now(), rates } satisfies CachedExchangeRates),
      );
    } catch {
      console.warn('[ExchangeRates] Could not cache daily rates in browser storage.');
    }
  }
  return rates;
}

export function useExchangeRates() {
  return useQuery({
    queryKey: EXCHANGE_RATES_QUERY_KEY,
    queryFn: fetchExchangeRates,
    staleTime: ratesCacheTtl,
    gcTime: 24 * 60 * 60 * 1000,
    refetchInterval: ratesCacheTtl,
    retry: 2,
  });
}
