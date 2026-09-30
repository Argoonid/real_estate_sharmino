import React, { useState } from 'react';
import { useAnonymousProfileStore } from '../model/anonymousProfileStore';
import { translations } from '../../../shared/i18n';
import { useUIStore } from '../../../app/model/uiStore';
import {
  X,
  Share2,
  Upload,
  Copy,
  Check,
  Smartphone,
  Heart,
  Layers,
  Clock,
} from 'lucide-react';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({ isOpen, onClose }) => {
  const favorites = useAnonymousProfileStore((s) => s.favorites);
  const compareIds = useAnonymousProfileStore((s) => s.compareIds);
  const recentViews = useAnonymousProfileStore((s) => s.recentViews);

  const language = useUIStore((s) => s.language);
  const t = translations[language];
  const exportProfileBase64 = useAnonymousProfileStore((s) => s.exportProfileBase64);
  const importProfileData = useAnonymousProfileStore((s) => s.importProfileData);

  const [copiedLink, setCopiedLink] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const base64Code = exportProfileBase64();
  const shareableUrl = `${window.location.origin}${window.location.pathname}#profile=${base64Code}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleImport = () => {
    if (!importInput.trim()) return;
    const result = importProfileData(importInput);
    setImportFeedback({
      success: result.success,
      message: result.success ? t.profileImportSuccess : t.profileImportError,
    });
    if (result.success) {
      setTimeout(() => {
        setImportFeedback(null);
        onClose();
      }, 2000);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">{t.savedProfileTitle}</h3>
              <p className="text-[11px] text-slate-400">{t.savedProfileDescription}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Current profile status pill */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
              <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
              <div className="text-lg font-black text-rose-900">{favorites.length}</div>
              <div className="text-[10px] text-slate-500 font-medium">{t.navFavorites}</div>
            </div>
            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
              <Layers className="w-4 h-4 text-sky-600 mx-auto mb-1" />
              <div className="text-lg font-black text-sky-900">{compareIds.length}</div>
              <div className="text-[10px] text-slate-500 font-medium">{t.navCompare}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <Clock className="w-4 h-4 text-slate-600 mx-auto mb-1" />
              <div className="text-lg font-black text-slate-900">{recentViews.length}</div>
              <div className="text-[10px] text-slate-500 font-medium">{t.historyTab}</div>
            </div>
          </div>

          {/* Share Link Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-sky-600" />
                <span>{t.shareFavorites}</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {t.oneTap}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t.profileShareDescription}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-700 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? t.profileCopied : t.profileCopy}</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>{t.profileImport}</span>
              </span>
            </div>
            <textarea
              rows={3}
              placeholder={t.profileImportPlaceholder}
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-sky-500"
            />
            {importFeedback && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold ${
                  importFeedback.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {importFeedback.message}
              </div>
            )}
            <button
              onClick={handleImport}
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              {t.profileRestore}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
