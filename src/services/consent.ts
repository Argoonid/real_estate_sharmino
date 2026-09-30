const COOKIE_CONSENT_KEY = 'sharmino_cookie_consent';
export const CONSENT_CHANGED_EVENT = 'sharmino:consent-changed';
export const OPEN_CONSENT_PREFERENCES_EVENT = 'sharmino:open-consent-preferences';
type CookieConsent = 'all' | 'necessary' | 'declined' | 'pending';

export class ConsentService {
  public static openPreferences(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(OPEN_CONSENT_PREFERENCES_EVENT));
    }
  }

  public static getConsentStatus(): CookieConsent {
    if (typeof window === 'undefined') return 'pending';
    try {
      const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
      return value === 'all' || value === 'necessary' || value === 'declined' ? value : 'pending';
    } catch (error) {
      console.error('Unable to read cookie consent preference.', error);
      return 'pending';
    }
  }

  public static setConsent(status: Exclude<CookieConsent, 'pending'>): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, status);
      window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
    } catch (error) {
      console.error('Unable to save cookie consent preference.', error);
    }
  }
}
