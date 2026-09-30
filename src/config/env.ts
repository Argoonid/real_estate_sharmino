/** Public configuration values supplied at build time. */

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim().replace(/\/+$/, '') ?? '';
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
)?.trim() || (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';
const cartoApiKey = (import.meta.env.VITE_CARTO_API_KEY as string | undefined)?.trim() ?? '';
const analyticsId = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ?? '';

function getSupabaseConfigurationError(): string | null {
  const errors: string[] = [];

  if (!supabaseUrl) {
    errors.push('Set VITE_SUPABASE_URL to your HTTPS Supabase project API URL.');
  } else {
    let parsedUrl: URL | undefined;
    try {
      parsedUrl = new URL(supabaseUrl);
    } catch {
      errors.push('VITE_SUPABASE_URL is invalid. Use the project API URL, not a PostgreSQL connection string.');
    }

    if (
      parsedUrl &&
      (!['https:', 'http:'].includes(parsedUrl.protocol) ||
        parsedUrl.username ||
        parsedUrl.password ||
        (parsedUrl.pathname !== '' && parsedUrl.pathname !== '/') ||
        parsedUrl.search ||
        parsedUrl.hash)
    ) {
      errors.push('VITE_SUPABASE_URL must be the project API URL (for example https://<project-ref>.supabase.co), not a PostgreSQL connection string.');
    }
  }

  if (!supabaseKey) {
    errors.push('Set VITE_SUPABASE_PUBLISHABLE_KEY to a publishable key from Supabase API Keys. A legacy anon key in VITE_SUPABASE_ANON_KEY is also supported.');
  } else if (supabaseKey.startsWith('sb_secret_')) {
    errors.push('VITE_SUPABASE_ANON_KEY contains a secret key. Use a publishable key in VITE_SUPABASE_PUBLISHABLE_KEY; never expose secret keys in a browser app.');
  } else if (!supabaseKey.startsWith('sb_publishable_') && !supabaseKey.startsWith('eyJ')) {
    errors.push('The Supabase API key format is not recognized. Use a publishable key or a legacy anon key.');
  }

  return errors.length > 0 ? errors.join(' ') : null;
}

export const ENV = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseKey,
  SUPABASE_CONFIG_ERROR: getSupabaseConfigurationError(),
  CARTO_API_KEY: cartoApiKey,
  ANALYTICS_ID: /^G-[A-Z0-9]+$/.test(analyticsId) ? analyticsId : '',

  APP_URL: (import.meta.env.APP_URL as string) || (typeof window !== 'undefined' ? window.location.origin : ''),
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
};
