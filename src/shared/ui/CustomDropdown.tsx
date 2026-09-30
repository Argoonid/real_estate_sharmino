import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface CustomDropdownProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  buttonClassName?: string;
  dropdownClassName?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export function CustomDropdown<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  label,
  icon,
  buttonClassName = '',
  dropdownClassName = '',
  className = '',
  variant = 'light',
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const isDark = variant === 'dark';

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer select-none focus:outline-none ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
        } ${isOpen ? 'border-sky-500 ring-2 ring-sky-500/20' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder || '—'}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-sky-500' : 'text-slate-400'
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 sm:right-auto sm:min-w-[190px] mt-1.5 z-50 rounded-2xl p-1.5 shadow-2xl border animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-slate-200'
              : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-800'
          } ${dropdownClassName}`}
        >
          <div className="max-h-60 overflow-y-auto overscroll-contain space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-sky-600/20 text-sky-400 font-bold'
                        : 'bg-sky-50 text-sky-700 font-bold'
                      : isDark
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                    {option.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
