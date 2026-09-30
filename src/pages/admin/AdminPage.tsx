import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatabaseProperty } from '../../shared/types';
import { Language, translations } from '../../shared/i18n';
import { INITIAL_FILTER } from '../../features/filter-properties/model/filtersStore';
import { SupabaseService, type PropertyUpdate } from '../../shared/api/supabase';
import { getSupabaseClient, isSupabaseConfigured } from '../../shared/api/supabase';
import { ENV } from '../../config/env';
import { getBookingLeads } from '../../services/api';
import { ImageOptimizerService } from '../../services/imageOptimizer';
import { Database, Download, ImageOff, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';

export interface AdminPageProps {
  language: Language;
  onClose: () => void;
  onPropertyUpdated?: () => void;
}

export type AdminPanelProps = AdminPageProps;

type ImageCheck = { ok: boolean; message: string };

function toCsvCell(value: string | null | undefined): string {
  return `"${(value ?? '').replace(/"/g, '""')}"`;
}

export const AdminPage: React.FC<AdminPageProps> = ({ language, onClose, onPropertyUpdated }) => {
  const t = translations[language];
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loginPending, setLoginPending] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'problematic' | 'leads'>('properties');
  const [imageReport, setImageReport] = useState<Record<string, ImageCheck>>({});
  const [imageScanProgress, setImageScanProgress] = useState({ completed: 0, total: 0 });
  const [imageScanError, setImageScanError] = useState('');
  const [imageScanPending, setImageScanPending] = useState(false);

  const adminQuery = useQuery({
    queryKey: ['admin-session'],
    queryFn: () => SupabaseService.getAdminSession(),
    enabled: isSupabaseConfigured(),
    retry: false,
  });

  const propertiesQuery = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => SupabaseService.fetchAllProperties(INITIAL_FILTER, { includeInactive: true }),
    enabled: Boolean(adminQuery.data),
    retry: false,
  });

  const leadsQuery = useQuery({
    queryKey: ['admin-leads'],
    queryFn: getBookingLeads,
    enabled: Boolean(adminQuery.data),
    retry: false,
  });
  const properties = propertiesQuery.data ?? [];
  const problematicProperties = properties.filter((property) => {
    const urls = property.images ?? [];
    return urls.length === 0 || urls.some((url) => imageReport[url]?.ok === false);
  });

  const scanPropertyImages = async () => {
    const urls = Array.from(new Set(properties.flatMap((property) => property.images ?? []).filter(Boolean)));
    setImageScanPending(true);
    setImageScanError('');
    setImageReport({});
    setImageScanProgress({ completed: 0, total: urls.length });

    try {
      const results: Record<string, ImageCheck> = {};
      let nextIndex = 0;
      let completed = 0;
      const workers = Array.from({ length: Math.min(8, urls.length) }, async () => {
        while (nextIndex < urls.length) {
          const index = nextIndex++;
          const url = urls[index];
          results[url] = await ImageOptimizerService.testExternalImageUrl(url, 4000);
          completed += 1;
          if (completed === urls.length || completed % 10 === 0) {
            setImageScanProgress({ completed, total: urls.length });
          }
        }
      });
      await Promise.all(workers);
      setImageReport(results);
    } catch (error) {
      setImageScanError(error instanceof Error ? error.message : t.dataErrorTitle);
    } finally {
      setImageScanPending(false);
    }
  };

  const updateProperty = useMutation({
    mutationFn: ({ id, update }: { id: string; update: PropertyUpdate }) =>
      SupabaseService.updateProperty(id, update),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      onPropertyUpdated?.();
    },
  });

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginPending(true);
    setAuthError('');
    try {
      await SupabaseService.signInAdmin(email.trim(), password);
      await queryClient.invalidateQueries({ queryKey: ['admin-session'] });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t.adminLoginError);
    } finally {
      setLoginPending(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) {
      setAuthError(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['admin-session'] });
  };

  const exportLeads = () => {
    const leads = leadsQuery.data ?? [];
    const rows = [
      ['ID', 'Property ID', 'Name', 'Phone', 'Telegram', 'Viewing date', 'Viewing time', 'Type', 'Notes', 'Status', 'Created at'],
      ...leads.map((lead) => [
        lead.id,
        lead.property_id ?? '',
        lead.client_name,
        lead.client_phone,
        lead.client_telegram ?? '',
        lead.viewing_date,
        lead.viewing_time,
        lead.viewing_type,
        lead.notes ?? '',
        lead.status,
        lead.created_at,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isSupabaseConfigured()) {
    return (
      <AdminShell onClose={onClose} language={language}>
        <p className="text-sm text-rose-700">{ENV.SUPABASE_CONFIG_ERROR}</p>
      </AdminShell>
    );
  }

  if (adminQuery.isLoading) {
    return <AdminShell onClose={onClose} language={language}><p className="text-sm text-slate-600">{t.adminCheckingAccount}</p></AdminShell>;
  }

  if (!adminQuery.data) {
    return (
      <AdminShell onClose={onClose} language={language}>
        <form onSubmit={handleLogin} className="mx-auto max-w-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <ShieldAlert className="h-5 w-5 text-sky-600" />
            <h3 className="font-bold">{t.adminLogin}</h3>
          </div>
          <p className="text-xs text-slate-500">
            {t.adminAccessDescription}
          </p>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t.adminPassword}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          {(authError || adminQuery.error) && (
            <p role="alert" className="text-xs text-rose-600">
              {authError || (adminQuery.error instanceof Error ? adminQuery.error.message : t.adminLoginError)}
            </p>
          )}
          <button
            disabled={loginPending}
            className="w-full rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {loginPending ? t.adminSigningIn : t.adminSignIn}
          </button>
        </form>
      </AdminShell>
    );
  }

  return (
    <AdminShell onClose={onClose} language={language}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-slate-900">{t.adminManageDatabase}</h3>
          <p className="text-xs text-slate-500">{t.adminChangesSaved}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportLeads}
            disabled={!leadsQuery.data?.length}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> {t.adminExportLeads}
          </button>
          <button onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">
            <LogOut className="h-4 w-4" /> {t.adminSignOut}
          </button>
        </div>
      </div>

      {(propertiesQuery.error || leadsQuery.error || updateProperty.error) && (
        <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
          {[propertiesQuery.error, leadsQuery.error, updateProperty.error]
            .filter((error): error is Error => error instanceof Error)
            .map((error) => error.message)
            .join(' · ')}
        </p>
      )}

      <nav className="mb-5 flex flex-wrap gap-2" aria-label={t.navAdmin}>
        {([
          ['properties', t.adminProperties],
          ['problematic', `${t.adminProblematic} (${problematicProperties.length})`],
          ['leads', t.adminLeads],
        ] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            aria-current={activeTab === tab ? 'page' : undefined}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              activeTab === tab ? 'bg-sky-600 text-white' : 'border border-slate-200 bg-white text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'properties' && <section className="mb-8">
        <h4 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
          <Database className="h-4 w-4 text-sky-600" />
          {t.adminProperties} ({properties.length})
        </h4>
        {propertiesQuery.isLoading ? (
          <p className="text-sm text-slate-500">{t.loadingProperties}</p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {properties.map((property: DatabaseProperty) => (
              <div key={property.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{property.title}</p>
                  <p className="text-xs text-slate-500">
                    {property.location.district?.name_ru ?? t.unknownDistrict} · {property.deal} · {property.id}
                  </p>
                </div>
                <button
                  onClick={() => updateProperty.mutate({ id: property.id, update: { is_active: !property.is_active } })}
                  disabled={updateProperty.isPending}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    property.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {property.is_active ? t.activeStatus : t.inactiveStatus}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>}

      {activeTab === 'problematic' && (
        <section className="mb-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="flex items-center gap-2 font-bold text-slate-800">
                <ImageOff className="h-4 w-4 text-rose-600" />
                {t.adminProblematic} ({problematicProperties.length})
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                {t.adminScanDescription}
              </p>
            </div>
            <button
              onClick={() => void scanPropertyImages()}
              disabled={imageScanPending || propertiesQuery.isLoading || properties.length === 0}
              className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {imageScanPending ? t.adminCheckProgress(imageScanProgress.completed, imageScanProgress.total) : t.adminCheckPhotos}
            </button>
          </div>
          {imageScanError && <p role="alert" className="mb-3 text-xs text-rose-700">{imageScanError}</p>}
          {propertiesQuery.isLoading ? (
            <p className="text-sm text-slate-500">{t.loadingProperties}</p>
          ) : problematicProperties.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              {t.adminNoProblematic}
            </p>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {problematicProperties.map((property) => {
                const urls = property.images ?? [];
                const brokenUrls = urls.filter((url) => imageReport[url]?.ok === false);
                const workingCount = urls.filter((url) => imageReport[url]?.ok === true).length;
                const status = urls.length === 0
                  ? t.adminNoPhotos
                  : brokenUrls.length === urls.length
                    ? t.adminAllPhotosFailed
                    : t.adminSomePhotosFailed(brokenUrls.length, urls.length);
                return (
                  <article key={property.id} className="flex flex-wrap items-start justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{property.title}</p>
                      <p className="text-xs text-slate-500">
                        {property.location.district?.name_ru ?? t.unknownDistrict} · {property.id}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-rose-700">
                        {status}{workingCount > 0 && ` · ${t.adminWorkingPhotos(workingCount)}`}
                      </p>
                      {brokenUrls.map((url) => (
                        <p key={url} className="mt-1 break-all text-[11px] text-slate-500">
                          {url} — {imageReport[url]?.message}
                        </p>
                      ))}
                    </div>
                    <button
                      onClick={() => updateProperty.mutate({ id: property.id, update: { is_active: !property.is_active } })}
                      disabled={updateProperty.isPending}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                        property.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {property.is_active ? t.activeStatus : t.inactiveStatus}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'leads' && <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-bold text-slate-800">{t.adminLeads} {leadsQuery.data ? `(${leadsQuery.data.length})` : ''}</h4>
          <button
            onClick={() => {
              void queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
            }}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label={t.adminRefreshLeads}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        {leadsQuery.isLoading ? (
          <p className="text-sm text-slate-500">{t.adminLoadingLeads}</p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {(leadsQuery.data ?? []).map((lead) => (
              <article key={lead.id} className="space-y-1 p-3 text-xs">
                <p className="font-bold text-slate-800">{lead.client_name} · {lead.client_phone}</p>
                <p className="text-slate-500">
                  {t.adminObject}: {lead.property_id ?? t.adminUnspecified} · {lead.viewing_date} {lead.viewing_time} · {lead.status}
                </p>
                {lead.notes && <p className="text-slate-600">{lead.notes}</p>}
              </article>
            ))}
          </div>
        )}
      </section>}
    </AdminShell>
  );
};

function AdminShell({ children, onClose, language }: { children: React.ReactNode; onClose: () => void; language: Language }) {
  const t = translations[language];
  return (
    <section className="mx-auto my-4 w-full max-w-5xl rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-xl sm:p-8">
      <div className="mb-6 flex justify-end">
        <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
          {t.adminReturnCatalog}
        </button>
      </div>
      {children}
    </section>
  );
}
