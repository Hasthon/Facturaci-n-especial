'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (CustomSelectOption | string)[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  id?: string;
  name?: string;
  size?: 'sm' | 'md';
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '-- Seleccionar --',
  required = false,
  disabled = false,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  id,
  name,
  size = 'sm',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalizar opciones
  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const paddingY = size === 'sm' ? 'py-2 px-3 text-xs' : 'py-2.5 px-3.5 text-sm';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Botón Principal (Input simulado) */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full ${paddingY} bg-white dark:bg-slate-800 border rounded-xl text-left outline-none transition-all flex items-center justify-between cursor-pointer font-medium shadow-2xs ${
          isOpen
            ? 'border-purple-600 ring-2 ring-purple-600/15'
            : 'border-gray-200 dark:border-white/10 hover:border-purple-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900' : ''} ${buttonClassName}`}
      >
        <span
          className={`truncate pr-2 ${
            selectedOption ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-400 dark:text-gray-500 font-normal'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Input oculto para formularios HTML estándar */}
      {name && <input type="hidden" name={name} value={value} required={required} />}

      {/* Menú Desplegable con Barra Selectora Morada */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 border border-purple-200 dark:border-white/10 rounded-xl shadow-xl p-1.5 max-h-60 overflow-y-auto space-y-1 animate-in fade-in duration-150 ${dropdownClassName}`}
        >
          {placeholder && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                value === ''
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-purple-600 hover:text-white font-normal'
              }`}
            >
              <span className="truncate">{placeholder}</span>
              {value === '' && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
            </button>
          )}

          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-purple-600 hover:text-white font-medium'
                }`}
              >
                <div className="truncate min-w-0 pr-2">
                  <span className="block truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span
                      className={`text-[10px] block truncate ${
                        isSelected ? 'text-purple-100' : 'text-gray-400 dark:text-gray-400'
                      }`}
                    >
                      {opt.sublabel}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
