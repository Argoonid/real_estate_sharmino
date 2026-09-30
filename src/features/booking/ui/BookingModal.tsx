import React, { useState, useEffect } from 'react';
import { DatabaseProperty, BookingRequest, Currency } from '../../../shared/types';
import { formatPrice } from '../../../shared/lib/formatters';
import { useExchangeRates } from '../../../shared/lib/exchangeRates';
import { dispatchBookingLead } from '../../../services/api';
import { getDistrictLabel, Language, translations } from '../../../shared/i18n';
import { OptimizedImage } from '../../../shared/ui/OptimizedImage';
import {
  X,
  Calendar,
  Clock,
  Phone,
  User,
  Send,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Video,
  Home,
} from 'lucide-react';

export interface BookingModalProps {
  property: DatabaseProperty;
  currency: Currency;
  language?: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  property,
  currency,
  language = 'ru',
  isOpen,
  onClose,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+20 ');
  const [clientTelegram, setClientTelegram] = useState('');
  const [viewingDate, setViewingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [viewingTime, setViewingTime] = useState('14:00');
  const [viewingType, setViewingType] = useState<BookingRequest['viewingType']>(
    property.deal === 'daily_rent' ? 'rent_reserve' : 'in_person'
  );
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { data: exchangeRates } = useExchangeRates();

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const t = translations[language];
  const priceDisplay = formatPrice(property, currency, language, exchangeRates);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      return;
    }

    setLoading(true);

    const booking: BookingRequest = {
      propertyId: property.id,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientTelegram: clientTelegram.trim(),
      viewingDate,
      viewingTime,
      viewingType,
      notes: notes.trim(),
    };

    setSubmitError('');
    try {
      await dispatchBookingLead(booking);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t.bookingRequestFailure);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Header with property thumbnail */}
        <div className="relative bg-gradient-to-r from-sky-600 to-cyan-600 p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="mb-1 pr-8 text-sm font-bold">{t.bookingTitle}</h2>
          <p className="mb-4 pr-8 text-[11px] text-sky-100">{t.bookingSubtitle}</p>
          <div className="flex items-center gap-3 pr-8">
            <OptimizedImage
              src={property.images?.[0] || ''}
              alt={property.title}
              aspectRatioClass="w-16 h-16 shrink-0 rounded-xl border-2 border-white/40 shadow-xs"
              className="object-cover"
            />
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 mb-1">
                {property.deal === 'sale'
                  ? t.propertySale
                  : property.deal === 'daily_rent'
                    ? t.propertyDailyRent
                    : t.propertyLongRent}
              </span>
              <h3 className="text-sm font-bold leading-tight line-clamp-1">
                {property.title}
              </h3>
              <p className="text-xs text-sky-100 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{getDistrictLabel(property.location.district, language)}</span>
                <span>•</span>
                <span className="font-bold text-white">{priceDisplay}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submitted ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{t.bookingRequestSaved}</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  {t.bookingRequestSavedDescription}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{t.requestStatus}</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t.sentToTelegram}
                  </span>
                </div>
                <div className="text-[11px]">
                  <strong>{t.dateLabel}:</strong> {viewingDate} {viewingTime}
                </div>
                <div className="text-[11px]">
                  <strong>{t.clientLabel}:</strong> {clientName} ({clientPhone})
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {t.close}
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                {/* Viewing Type Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t.viewingFormat}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingType('in_person')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        viewingType === 'in_person'
                          ? 'border-sky-600 bg-sky-50 text-sky-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>{t.inPersonViewing}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewingType('online_video')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        viewingType === 'online_video'
                          ? 'border-sky-600 bg-sky-50 text-sky-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>{t.videoTour}</span>
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {t.contactName} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder={t.namePlaceholder}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Phone & Telegram */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t.contactPhone} *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="+20 100 000 0000"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t.contactTelegram}
                    </label>
                    <div className="relative">
                      <Send className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="@username"
                        value={clientTelegram}
                        onChange={(e) => setClientTelegram(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {t.optionalNotes}
                    </label>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder={t.notesPlaceholder}
                      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-sky-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t.requestedDate}
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        aria-label={t.requestedDate}
                        value={viewingDate}
                        onChange={(e) => setViewingDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t.requestedTime}
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="time"
                        required
                        aria-label={t.requestedTime}
                        value={viewingTime}
                        onChange={(e) => setViewingTime(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              {submitError && (
                <p role="alert" className="text-xs text-rose-600">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? t.sendingRequest : t.sendRequest}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
