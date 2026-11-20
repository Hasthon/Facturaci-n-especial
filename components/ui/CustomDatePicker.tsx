'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
  id?: string;
  name?: string;
}

const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const DAY_NAMES = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];

export function CustomDatePicker({
  value,
  onChange,
  min,
  max,
  required = false,
  disabled = false,
  placeholder = 'dd-mm-aaaa',
  className = '',
  size = 'sm',
  id,
  name,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number; openUp: boolean }>({
    top: 0,
    left: 0,
    openUp: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parsear fecha seleccionada actual
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    return null;
  }, [value]);

  // Estado para el mes y año en visualización
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (parsedDate) return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
    return new Date();
  });

  // Si cambia el value externo, sincronizar el mes de vista
  useEffect(() => {
    if (parsedDate) {
      setViewDate(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
    }
  }, [value]);

  // Calcular posición fixed para el portal por sobre cualquier modal o contenedor
  const updateCoords = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const calendarHeight = 340;
    const calendarWidth = 288;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < calendarHeight && rect.top > calendarHeight;

    let top = openUp ? rect.top - 6 : rect.bottom + 6;
    let left = rect.left;

    // Asegurar que no se salga a la derecha de la ventana
    if (left + calendarWidth > window.innerWidth - 16) {
      left = window.innerWidth - calendarWidth - 16;
    }
    // Asegurar que no se salga a la izquierda
    if (left < 16) {
      left = 16;
    }

    setCoords({ top, left, openUp });
  };

  useEffect(() => {
    if (!isOpen) return;
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  // Cerrar al hacer clic fuera (tanto del container como del popover en el portal)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
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

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Construir la matriz de días
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    // getDay() devuelve 0 para domingo, 1 para lunes... Lo convertimos a 0 para lunes
    const startingDay = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      isDisabled: boolean;
    }> = [];

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

    // Días del mes anterior
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
      days.push({
        dayNumber: prevDay,
        dateString: dateStr,
        isCurrentMonth: false,
        isSelected: value === dateStr,
        isToday: dateStr === todayStr,
        isDisabled: (min && dateStr < min) || (max && dateStr > max) || false,
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dayNumber: day,
        dateString: dateStr,
        isCurrentMonth: true,
        isSelected: value === dateStr,
        isToday: dateStr === todayStr,
        isDisabled: (min && dateStr < min) || (max && dateStr > max) || false,
      });
    }

    // Días del mes siguiente para completar 42 casillas (6 semanas estándar)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dayNumber: day,
        dateString: dateStr,
        isCurrentMonth: false,
        isSelected: value === dateStr,
        isToday: dateStr === todayStr,
        isDisabled: (min && dateStr < min) || (max && dateStr > max) || false,
      });
    }

    return days;
  }, [viewYear, viewMonth, value, min, max]);

  const handleSelectDay = (dateStr: string, isDisabled: boolean) => {
    if (isDisabled) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    onChange(todayStr);
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Formato para mostrar en el botón (DD-MM-YYYY)
  const displayValue = useMemo(() => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return value;
  }, [value]);

  const paddingClasses = size === 'sm' ? 'py-1.5 px-3 text-xs' : 'py-2 px-3 text-xs';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Botón trigger con aspecto exacto de input */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            updateCoords();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full ${paddingClasses} bg-white dark:bg-slate-800 border rounded-xl text-left outline-none transition-all flex items-center justify-between cursor-pointer font-medium shadow-2xs ${isOpen
            ? 'border-purple-600 ring-2 ring-purple-600/15'
            : 'border-gray-200 dark:border-white/10 hover:border-purple-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900' : ''}`}
      >
        <span
          className={`font-mono ${displayValue ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-400 dark:text-gray-500 font-normal'
            }`}
        >
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
      </button>

      {/* Input hidden para formularios estándar */}
      {name && <input type="hidden" name={name} value={value} required={required} />}

      {/* Popover del Calendario — RENDERIZADO EN PORTAL DIRECTO EN DOCUMENT.BODY (Nunca se corta por el modal) */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: coords.openUp ? 'translateY(-100%)' : 'none',
              zIndex: 9999,
            }}
            className="bg-white dark:bg-slate-900 border border-purple-200/90 dark:border-white/10 rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {/* Header del Calendario: Mes y Año + Flechas */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
                {MONTH_NAMES[viewMonth].charAt(0).toUpperCase() + MONTH_NAMES[viewMonth].slice(1)} de {viewYear}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  title="Mes anterior"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  title="Mes siguiente"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center">
              {DAY_NAMES.map((name) => (
                <div key={name} className="text-[11px] font-bold text-gray-400 dark:text-gray-500 lowercase">
                  {name}
                </div>
              ))}
            </div>

            {/* Grilla de Días con Recuadro Morado en el Día Seleccionado */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((cd, index) => {
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={cd.isDisabled}
                    onClick={() => handleSelectDay(cd.dateString, cd.isDisabled)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${cd.isSelected
                        ? 'bg-purple-600 text-white font-extrabold shadow-md ring-2 ring-purple-600/30'
                        : cd.isToday
                          ? 'border border-purple-500 text-purple-700 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-950/40'
                          : cd.isCurrentMonth
                            ? 'text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300'
                            : 'text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-white/5'
                      } ${cd.isDisabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
                  >
                    {cd.dayNumber}
                  </button>
                );
              })}
            </div>

            {/* Footer de Acciones Rápidas (Borrar y Hoy) */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 dark:border-white/10 text-xs">
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 font-medium cursor-pointer transition-colors"
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-bold cursor-pointer transition-colors"
              >
                Hoy
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
