import React, { useState, useEffect, useRef } from 'react';
import { DatabaseProperty, BookingRequest, Currency, PreferredContact } from '../../../shared/types';
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  PhoneCall,
  Building2,
  Sparkles,
} from 'lucide-react';

export interface BookingModalProps {
  property?: DatabaseProperty | null;
  currency: Currency;
  language?: Language;
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES: Record<Language, string[]> = {
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
};

const WEEKDAY_NAMES: Record<Language, string[]> = {
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  it: ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'],
};

const QUICK_LABELS: Record<Language, { today: string; tomorrow: string; in3Days: string; selectTime: string; customTime: string }> = {
  ru: { today: 'Сегодня', tomorrow: 'Завтра', in3Days: '+3 дня', selectTime: 'Время визита', customTime: 'Своё время' },
  en: { today: 'Today', tomorrow: 'Tomorrow', in3Days: '+3 days', selectTime: 'Viewing Time', customTime: 'Custom time' },
  it: { today: 'Oggi', tomorrow: 'Domani', in3Days: '+3 giorni', selectTime: 'Orario visita', customTime: 'Altro orario' },
};

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00',
];

const toDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (dateStr: string, lang: Language) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const months: Record<Language, string[]> = {
    ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    it: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
  };
  const weekdays: Record<Language, string[]> = {
    ru: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    it: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
  };
  const monthName = months[lang]?.[m - 1] || months.ru[m - 1];
  const dayName = weekdays[lang]?.[date.getDay()] || weekdays.ru[date.getDay()];
  return `${d} ${monthName} ${y} (${dayName})`;
};

export const BookingModal: React.FC<BookingModalProps> = ({
  property,
  currency,
  language = 'ru',
  isOpen,
  onClose,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+20 ');
  const [preferredContact, setPreferredContact] = useState<PreferredContact>('whatsapp');
  const [viewingDate, setViewingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toDateString(d);
  });
  const [viewingTime, setViewingTime] = useState('14:00');
  const [viewingType, setViewingType] = useState<BookingRequest['viewingType']>(
    property?.deal === 'daily_rent' ? 'rent_reserve' : 'in_person'
  );
  const [notes, setNotes] = useState('');

  // Validation state
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Dropdown states
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [viewMonthDate, setViewMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { data: exchangeRates } = useExchangeRates();

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setIsTimeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDateOpen) setIsDateOpen(false);
        else if (isTimeOpen) setIsTimeOpen(false);
        else onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDateOpen, isTimeOpen, onClose]);

  if (!isOpen) return null;
  const t = translations[language];
  const quick = QUICK_LABELS[language] || QUICK_LABELS.ru;
  const priceDisplay = property ? formatPrice(property, currency, language, exchangeRates) : '';

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    const phoneRegex = /^[\d\s()+-]{8,25}$/;
    return phoneRegex.test(phone) && digits.length >= 8 && digits.length <= 15;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (!clientName.trim()) {
      setNameError(t.nameValidationError);
      hasError = true;
    } else {
      setNameError('');
    }

    if (!validatePhone(clientPhone)) {
      setPhoneError(t.phoneValidationError);
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (hasError) return;

    setLoading(true);

    const customSelectionTag = !property
      ? language === 'ru'
        ? '[Запрос: Персональный подбор недвижимости]'
        : language === 'it'
        ? '[Richiesta: Ricerca personalizzata]'
        : '[Request: Personalized property search]'
      : '';

    const booking: BookingRequest = {
      propertyId: property ? property.id : '',
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      preferredContact,
      viewingDate,
      viewingTime,
      viewingType,
      notes: [customSelectionTag, notes.trim()].filter(Boolean).join('\n'),
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

  // Calendar calculations
  const viewYear = viewMonthDate.getFullYear();
  const viewMonth = viewMonthDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPrevDisabled =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const selectedDateParts = viewingDate.split('-').map(Number);

  const handleSelectDay = (day: number) => {
    const chosen = new Date(viewYear, viewMonth, day);
    setViewingDate(toDateString(chosen));
    setIsDateOpen(false);
  };

  const handleQuickDate = (daysOffset: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    setViewingDate(toDateString(target));
    setViewMonthDate(new Date(target.getFullYear(), target.getMonth(), 1));
    setIsDateOpen(false);
  };

  const getContactMethodLabel = (method: PreferredContact) => {
    switch (method) {
      case 'whatsapp':
        return t.contactMethodWhatsApp;
      case 'telegram':
        return t.contactMethodTelegram;
      case 'phone':
        return t.contactMethodPhone;
    }
  };

  const customNotesPlaceholder = !property
    ? language === 'ru'
      ? 'Бюджет, желаемый район, количество спален, цель покупки/аренды...'
      : language === 'it'
      ? 'Budget, quartiere desiderato, numero di camere, scopo acquisto/affitto...'
      : 'Budget, preferred district, bedrooms, purchase/rental goals...'
    : t.notesPlaceholder;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl my-auto sm:my-8 border border-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Header: Выбранный объект либо карточка общего подбора */}
        <div className="relative bg-gradient-to-r from-sky-600 to-cyan-600 p-4 sm:p-5 text-white rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {property ? (
            <>
              <h2 className="mb-3 pr-8 text-base font-bold">{t.bookingTitle}</h2>
              <div className="flex items-center gap-3 pr-8">
                <OptimizedImage
                  src={property.images?.[0] || ''}
                  alt={property.title}
                  aspectRatioClass="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl border-2 border-white/40 shadow-xs"
                  className="object-cover"
                />
                <div className="min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 mb-1">
                    {property.deal === 'sale'
                      ? t.propertySale
                      : property.deal === 'daily_rent'
                        ? t.propertyDailyRent
                        : t.propertyLongRent}
                  </span>
                  <h3 className="text-sm font-bold leading-tight truncate">
                    {property.title}
                  </h3>
                  <p className="text-xs text-sky-100 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{getDistrictLabel(property.location.district, language)}</span>
                    <span>•</span>
                    <span className="font-bold text-white shrink-0">{priceDisplay}</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 pr-8 py-1">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight">
                  {language === 'ru'
                    ? 'Подбор недвижимости'
                    : language === 'it'
                    ? 'Ricerca personalizzata'
                    : 'Personalized Property Search'}
                </h2>
                <p className="text-xs text-sky-100 mt-1 leading-snug">{t.homeConciergeSubtitle}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6">
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
                {property && (
                  <div className="text-[11px] truncate">
                    <strong>{language === 'ru' ? 'Объект' : 'Property'}:</strong> {property.title}
                  </div>
                )}
                <div className="text-[11px]">
                  <strong>{t.dateLabel}:</strong> {viewingDate} {viewingTime}
                </div>
                <div className="text-[11px]">
                  <strong>{t.clientLabel}:</strong> {clientName} ({clientPhone})
                </div>
                <div className="text-[11px]">
                  <strong>{t.preferredContact}:</strong> {getContactMethodLabel(preferredContact)}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer w-full sm:w-auto"
                >
                  {t.close}
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-3.5">
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
                      className={`p-2 sm:p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
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
                      className={`p-2 sm:p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
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

                {/* 1. Name */}
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
                      onChange={(e) => {
                        setClientName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-hidden focus:bg-white transition ${
                        nameError ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200' : 'border-slate-200 focus:border-sky-500'
                      }`}
                    />
                  </div>
                  {nameError && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{nameError}</p>
                  )}
                </div>

                {/* 2. Phone */}
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
                      onChange={(e) => {
                        setClientPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-hidden focus:bg-white transition ${
                        phoneError ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200' : 'border-slate-200 focus:border-sky-500'
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{phoneError}</p>
                  )}
                </div>

                {/* 3. Preferred Contact Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t.preferredContact}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setPreferredContact('whatsapp')}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        preferredContact === 'whatsapp'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{t.contactMethodWhatsApp}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredContact('telegram')}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        preferredContact === 'telegram'
                          ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-xs ring-1 ring-sky-200'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">{t.contactMethodTelegram}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredContact('phone')}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        preferredContact === 'phone'
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-700 shadow-xs ring-1 ring-cyan-200'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span className="truncate">{t.contactMethodPhone}</span>
                    </button>
                  </div>
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {t.optionalNotes}
                  </label>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={customNotesPlaceholder}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-sky-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Date & Time Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
                  {/* Date Picker Button & Popover */}
                  <div ref={datePickerRef} className="relative">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t.requestedDate}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDateOpen((prev) => !prev);
                        setIsTimeOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl flex items-center justify-between transition cursor-pointer text-left ${
                        isDateOpen ? 'border-sky-500 bg-white ring-2 ring-sky-100 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {formatDisplayDate(viewingDate, language)}
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${isDateOpen ? 'rotate-180 text-sky-600' : ''}`} />
                    </button>

                    {/* Popover Calendar */}
                    {isDateOpen && (
                      <div className="absolute bottom-full mb-2 left-0 z-40 w-[290px] sm:w-[310px] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3 sm:p-3.5 animate-in fade-in zoom-in-95 duration-150 select-none">
                        <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleQuickDate(0)}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-[11px] font-bold transition cursor-pointer text-center"
                          >
                            {quick.today}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDate(1)}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-[11px] font-bold transition cursor-pointer text-center"
                          >
                            {quick.tomorrow}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDate(3)}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-[11px] font-bold transition cursor-pointer text-center"
                          >
                            {quick.in3Days}
                          </button>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <button
                            type="button"
                            disabled={isPrevDisabled}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isPrevDisabled) setViewMonthDate(new Date(viewYear, viewMonth - 1, 1));
                            }}
                            className={`p-1.5 rounded-lg border border-slate-200 transition ${
                              isPrevDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
                            }`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <span className="font-extrabold text-xs text-slate-900">
                            {MONTH_NAMES[language]?.[viewMonth] || MONTH_NAMES.ru[viewMonth]} {viewYear}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewMonthDate(new Date(viewYear, viewMonth + 1, 1));
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-1">
                          {(WEEKDAY_NAMES[language] || WEEKDAY_NAMES.ru).map((dayName, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-slate-400 py-0.5">
                              {dayName}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: firstDayIndex }).map((_, idx) => (
                            <div key={`blank-${idx}`} className="p-1" />
                          ))}

                          {Array.from({ length: daysInMonth }, (_, idx) => {
                            const day = idx + 1;
                            const dayDate = new Date(viewYear, viewMonth, day);
                            dayDate.setHours(23, 59, 59, 999);
                            const isPast = dayDate < today;
                            const isSelected =
                              selectedDateParts[0] === viewYear &&
                              selectedDateParts[1] - 1 === viewMonth &&
                              selectedDateParts[2] === day;
                            const isCurrentDay =
                              today.getFullYear() === viewYear &&
                              today.getMonth() === viewMonth &&
                              today.getDate() === day;

                            return (
                              <button
                                key={`day-${day}`}
                                type="button"
                                disabled={isPast}
                                onClick={() => handleSelectDay(day)}
                                className={`h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition ${
                                  isSelected
                                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                                    : isPast
                                      ? 'text-slate-300 cursor-not-allowed'
                                      : isCurrentDay
                                        ? 'bg-sky-50 text-sky-700 border border-sky-300 font-bold hover:bg-sky-100'
                                        : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Time Picker Button & Popover */}
                  <div ref={timePickerRef} className="relative">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t.requestedTime}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimeOpen((prev) => !prev);
                        setIsDateOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl flex items-center justify-between transition cursor-pointer text-left ${
                        isTimeOpen ? 'border-sky-500 bg-white ring-2 ring-sky-100 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {viewingTime}
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${isTimeOpen ? 'rotate-180 text-sky-600' : ''}`} />
                    </button>

                    {/* Popover Time Grid */}
                    {isTimeOpen && (
                      <div className="absolute bottom-full mb-2 right-0 z-40 w-[260px] sm:w-[280px] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3 animate-in fade-in zoom-in-95 duration-150 select-none">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            {quick.selectTime}
                          </span>
                          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                            {viewingTime}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto no-scrollbar py-0.5">
                          {TIME_SLOTS.map((timeSlot) => (
                            <button
                              key={timeSlot}
                              type="button"
                              onClick={() => {
                                setViewingTime(timeSlot);
                                setIsTimeOpen(false);
                              }}
                              className={`py-1.5 text-xs rounded-xl font-semibold transition cursor-pointer text-center ${
                                viewingTime === timeSlot
                                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                                  : 'bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 border border-slate-200/70'
                              }`}
                            >
                              {timeSlot}
                            </button>
                          ))}
                        </div>

                        <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {quick.customTime}:
                          </span>
                          <input
                            type="time"
                            value={viewingTime}
                            onChange={(e) => setViewingTime(e.target.value)}
                            className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-bold focus:bg-white focus:border-sky-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    )}
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
                className="w-full mt-3 py-3 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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