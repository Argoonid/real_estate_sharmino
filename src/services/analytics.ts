import { ENV } from '../config/env';
import { ConsentService } from './consent';

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

let initializedId = '';

function hasAnalyticsConsent(): boolean {
  return ConsentService.getConsentStatus() === 'all';
}

function initializeGoogleAnalytics(): boolean {
  const measurementId = ENV.ANALYTICS_ID;
  if (!measurementId || !hasAnalyticsConsent()) return false;

  if (!window.gtag) {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('consent', 'default', { analytics_storage: 'granted' });
  }

  if (initializedId !== measurementId) {
    window.gtag('config', measurementId, { send_page_view: false });
    initializedId = measurementId;
  }
  return true;
}

export function trackPageView(pagePath: string): void {
  if (!hasAnalyticsConsent() || !initializeGoogleAnalytics()) return;
  window.gtag?.('event', 'page_view', {
    page_path: pagePath,
    page_title: document.title,
  });
}

export function revokeAnalyticsConsent(): void {
  if (initializedId) {
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  }
}
