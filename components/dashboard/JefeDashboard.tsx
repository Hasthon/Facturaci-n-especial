'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Clock,
  Check,
  CheckCircle2,
  XCircle,
  Hourglass,
  Layers,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  DollarSign,
  Briefcase,
  GitCompare,
  RotateCcw,
  Receipt,
  UserCheck,
  UserX,
  X,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Download,
} from 'lucide-react';
import { MOCK_PROFORMAS, MOCK_EXECUTIVES, MOCK_CLIENTS, MOCK_AUDIT } from '@/lib/mock-data';
import { DashboardFiltersState, Proforma } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Tooltip } from '@/components/ui/tooltip';

type DashboardTab = 'comercial' | 'ejecutivos' | 'analistas' | 'clientes';
type JefeKpiFilterType = 'todos' | 'aprobadas' | 'revision' | 'rechazadas' | 'facturadas';

interface DashboardFiltersPanelProps {
  tab: 'comercial' | 'ejecutivos' | 'clientes';
  totalFoundText: string;
  filters: DashboardFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFiltersState>>;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  activeFiltersCount: number;
  resetFilters: () => void;
  isFilterPanelOpen: boolean;
  setIsFilterPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function DashboardFiltersPanel({
  tab,
  totalFoundText,
  filters,
  setFilters,
  searchTerm = '',
  setSearchTerm,
  activeFiltersCount,
  resetFilters,
  isFilterPanelOpen,
  setIsFilterPanelOpen,
}: DashboardFiltersPanelProps) {
  return (
    <div className="px-3.5 sm:px-4 py-3 sm:py-3.5 transition-all duration-300">
      {/* Header del Panel de Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Título con su icono */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              Filtros
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-2xs">
                {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Número de proformas/elementos encontrados + Botones Limpiar y Filtros */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className="text-xs text-purple-800 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900/50">
            {totalFoundText}
          </span>

          <button
            type="button"
            disabled={activeFiltersCount === 0}
            onClick={resetFilters}
            title={activeFiltersCount > 0 ? 'Restablecer todos los filtros' : 'No hay filtros activos para limpiar'}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 transition-all shadow-2xs ${activeFiltersCount > 0
              ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-900 border-purple-200/80 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 dark:text-purple-300 dark:border-purple-800/60 cursor-pointer active:scale-95'
              : 'bg-gray-50 dark:bg-slate-800/40 text-gray-400 dark:text-gray-600 border-gray-200/70 dark:border-white/5 cursor-not-allowed opacity-60'
              }`}
          >
            <RotateCcw className={`w-3 h-3 ${activeFiltersCount > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-600'}`} />
            <span>Limpiar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFilterPanelOpen((prev) => !prev)}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border shadow-xs ${isFilterPanelOpen
              ? 'bg-purple-600 text-white border-purple-600 shadow-purple-600/20'
              : 'bg-purple-50/80 hover:bg-purple-100 dark:bg-slate-800 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-white/10'
              }`}
            title={isFilterPanelOpen ? 'Contraer filtros' : 'Desplegar filtros'}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {isFilterPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Chips cuando está contraído pero hay filtros activos */}
      {!isFilterPanelOpen && activeFiltersCount > 0 && (
        <div className="pt-2.5 mt-2.5 border-t border-purple-100 dark:border-white/10 flex items-center gap-1.5 flex-wrap text-xs animate-in fade-in duration-150">
          <span className="text-[11px] font-bold text-gray-500">Filtros activos:</span>
          {filters.periodo !== 'mes' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Período: {filters.periodo}
              <button type="button" onClick={() => setFilters(p => ({ ...p, periodo: 'mes' }))} className="hover:text-purple-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {tab === 'ejecutivos' && filters.clienteId && filters.clienteId !== 'todos' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Cliente: {MOCK_CLIENTS.find(c => c.id === filters.clienteId)?.razonSocial || filters.clienteId}
              <button type="button" onClick={() => setFilters(p => ({ ...p, clienteId: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(tab === 'comercial' || tab === 'ejecutivos') && filters.ejecutivoId !== 'todos' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Ejecutivo: {MOCK_EXECUTIVES.find(e => e.id === filters.ejecutivoId)?.nombre || filters.ejecutivoId}
              <button type="button" onClick={() => setFilters(p => ({ ...p, ejecutivoId: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {tab !== 'ejecutivos' && filters.clienteId && filters.clienteId !== 'todos' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Cliente: {MOCK_CLIENTS.find(c => c.id === filters.clienteId)?.razonSocial || filters.clienteId}
              <button type="button" onClick={() => setFilters(p => ({ ...p, clienteId: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {tab === 'comercial' && filters.estadoProforma !== 'todos' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Estado: {filters.estadoProforma}
              <button type="button" onClick={() => setFilters(p => ({ ...p, estadoProforma: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {tab === 'comercial' && filters.version !== 'todos' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Versión: {filters.version}
              <button type="button" onClick={() => setFilters(p => ({ ...p, version: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {tab === 'comercial' && filters.motivoRechazo !== 'todos' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Motivo: {filters.motivoRechazo}
              <button type="button" onClick={() => setFilters(p => ({ ...p, motivoRechazo: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {tab === 'comercial' && searchTerm && searchTerm.trim() !== '' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Búsqueda: &ldquo;{searchTerm}&rdquo;
              <button type="button" onClick={() => setSearchTerm && setSearchTerm('')} className="hover:text-purple-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Contenido desplegable con inputs */}
      {isFilterPanelOpen && (
        <div className="pt-3 mt-2.5 border-t border-purple-100 dark:border-white/10 space-y-3 animate-in fade-in zoom-in-98 duration-200">
          {/* Caso 1: Dashboard Comercial (6 selects + barra de búsqueda) */}
          {tab === 'comercial' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {/* 1. Periodo */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-600" />
                    <span>Período</span>
                  </label>
                  <select
                    value={filters.periodo}
                    onChange={(e) => setFilters((prev) => ({ ...prev, periodo: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer"
                  >
                    <option value="hoy" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Hoy</option>
                    <option value="semana" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Esta semana</option>
                    <option value="mes" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Este mes</option>
                    <option value="trimestre" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Tercer trimestre (Q3)</option>
                    <option value="ano" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Año 2026</option>
                    <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todo el historial</option>
                  </select>
                </div>

                {/* 2. Ejecutivo */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Users className="w-3 h-3 text-purple-600" />
                    <span>Ejecutivo</span>
                  </label>
                  <select
                    value={filters.ejecutivoId}
                    onChange={(e) => setFilters((prev) => ({ ...prev, ejecutivoId: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                  >
                    <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los ejecutivos</option>
                    {MOCK_EXECUTIVES.map((exe) => (
                      <option key={exe.id} value={exe.id} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                        {exe.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Cliente */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-purple-600" />
                    <span>Cliente</span>
                  </label>
                  <select
                    value={filters.clienteId || 'todos'}
                    onChange={(e) => setFilters((prev) => ({ ...prev, clienteId: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                  >
                    <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los clientes</option>
                    {MOCK_CLIENTS.map((cli) => (
                      <option key={cli.id} value={cli.id} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                        {cli.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Estado Proforma */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-purple-600" />
                    <span>Estado proforma</span>
                  </label>
                  <select
                    value={filters.estadoProforma}
                    onChange={(e) => setFilters((prev) => ({ ...prev, estadoProforma: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                  >
                    <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los estados</option>
                    <option value="Pendiente" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Pendiente</option>
                    <option value="Pendiente de validación" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Pendiente de validación V°B°</option>
                    <option value="Aprobada por Cliente" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Aprobada por cliente</option>
                    <option value="Facturado" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Facturado</option>
                    <option value="Rechazada v1" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Rechazada v1</option>
                    <option value="Derivada a KAM" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Derivada a KAM</option>
                  </select>
                </div>

                {/* 5. Versión */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-purple-600" />
                    <span>Versión</span>
                  </label>
                  <select
                    value={filters.version}
                    onChange={(e) => setFilters((prev) => ({ ...prev, version: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer"
                  >
                    <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todas las versiones</option>
                    <option value="v1" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">v1 (Original)</option>
                    <option value="v2" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">v2 (Ajustada)</option>
                    <option value="v3" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">v3 (Crítica)</option>
                  </select>
                </div>

                {/* 6. Motivo de Rechazo */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-purple-600" />
                    <span>Motivo de rechazo</span>
                  </label>
                  <select
                    value={filters.motivoRechazo}
                    onChange={(e) => setFilters((prev) => ({ ...prev, motivoRechazo: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                  >
                    <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los motivos</option>
                    <option value="Diferencia en recubitaje / medidas de SKUs" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Diferencia en recubitaje</option>
                    <option value="Inconsistencia en Tarifas / Descuentos negociados" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Inconsistencia en tarifas</option>
                    <option value="Discrepancia comercial no resuelta en V3" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Discrepancia en V3</option>
                  </select>
                </div>
              </div>

              {/* Input Búsqueda en tiempo real */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                  placeholder="Buscar en tiempo real por RUT, Razón Social del Cliente, ID de Proforma o Ejecutivo..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none shadow-2xs"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm && setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Borrar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* Caso 2: KPIs por Ejecutivo (Periodo, Cliente, Ejecutivo) */}
          {tab === 'ejecutivos' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* 1. Periodo */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-600" />
                  <span>Período</span>
                </label>
                <select
                  value={filters.periodo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, periodo: e.target.value as any }))}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer"
                >
                  <option value="hoy" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Hoy</option>
                  <option value="semana" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Esta semana</option>
                  <option value="mes" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Este mes</option>
                  <option value="trimestre" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Tercer trimestre (Q3)</option>
                  <option value="ano" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Año 2026</option>
                  <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todo el historial</option>
                </select>
              </div>

              {/* 2. Cliente */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-purple-600" />
                  <span>Cliente</span>
                </label>
                <select
                  value={filters.clienteId || 'todos'}
                  onChange={(e) => setFilters((prev) => ({ ...prev, clienteId: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                >
                  <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los clientes</option>
                  {MOCK_CLIENTS.map((cli) => (
                    <option key={cli.id} value={cli.id} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                      {cli.razonSocial}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Ejecutivo */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Users className="w-3 h-3 text-purple-600" />
                  <span>Ejecutivo</span>
                </label>
                <select
                  value={filters.ejecutivoId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, ejecutivoId: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                >
                  <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los ejecutivos</option>
                  {MOCK_EXECUTIVES.map((exe) => (
                    <option key={exe.id} value={exe.id} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                      {exe.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Caso 3: KPIs por Cliente (Periodo, Cliente) */}
          {tab === 'clientes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-w-2xl">
              {/* 1. Periodo */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-600" />
                  <span>Período</span>
                </label>
                <select
                  value={filters.periodo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, periodo: e.target.value as any }))}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer"
                >
                  <option value="hoy" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Hoy</option>
                  <option value="semana" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Esta semana</option>
                  <option value="mes" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Este mes</option>
                  <option value="trimestre" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Tercer trimestre (Q3)</option>
                  <option value="ano" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Año 2026</option>
                  <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todo el historial</option>
                </select>
              </div>

              {/* 2. Cliente */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-purple-600" />
                  <span>Cliente</span>
                </label>
                <select
                  value={filters.clienteId || 'todos'}
                  onChange={(e) => setFilters((prev) => ({ ...prev, clienteId: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                >
                  <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los clientes</option>
                  {MOCK_CLIENTS.map((cli) => (
                    <option key={cli.id} value={cli.id} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                      {cli.razonSocial}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente unificado de paginación para las tablas de Jefatura (máximo 10 filas por página)
interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

function TablePagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  itemLabel = 'registros',
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="p-4 border-t border-purple-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 bg-white/50 dark:bg-slate-900/40">
      <div>
        {totalItems > 0 ? (
          <span>
            Mostrando <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span> a{' '}
            <span className="font-bold text-gray-900 dark:text-white">{endIndex}</span> de{' '}
            <span className="font-bold text-purple-700 dark:text-purple-300">{totalItems}</span> {itemLabel}
          </span>
        ) : (
          <span>0 {itemLabel} encontrados</span>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Botón Anterior */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-all ${
              safePage === 1
                ? 'border-gray-200 dark:border-white/5 text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-slate-800/40 cursor-not-allowed opacity-60'
                : 'border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 shadow-2xs cursor-pointer active:scale-95'
            }`}
            title="Página anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          {/* Números de página */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isActive = page === safePage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`w-7 h-7 text-xs rounded-lg font-bold flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'border border-purple-200/80 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 cursor-pointer shadow-2xs'
                  }`}
                  title={`Ir a página ${page}`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Botón Siguiente */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-all ${
              safePage === totalPages
                ? 'border-gray-200 dark:border-white/5 text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-slate-800/40 cursor-not-allowed opacity-60'
                : 'border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 shadow-2xs cursor-pointer active:scale-95'
            }`}
            title="Página siguiente"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function JefeDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<DashboardTab>('comercial');
  const [kpiFilter, setKpiFilter] = useState<JefeKpiFilterType>('todos');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Estado reactivo de proformas para permitir aprobaciones y rechazos en vivo
  const [proformas, setProformas] = useState<Proforma[]>(MOCK_PROFORMAS);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  // Modal para Devolver / Rechazar proforma con motivo
  const [rejectingProforma, setRejectingProforma] = useState<Proforma | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Inconsistencia en Tarifas / Descuentos');
  const [rejectionObservations, setRejectionObservations] = useState('');

  // Modal para Doble Validación de Aprobación (Aceptar Proforma)
  const [approvingProforma, setApprovingProforma] = useState<Proforma | null>(null);

  // Desplazamiento automático suave hacia la fila desplegada para evitar que quede cortada abajo
  const scrollToExpandedRow = (id: string) => {
    setTimeout(() => {
      const expEl = document.getElementById(`expanded-row-${id}`);
      const parentEl = document.getElementById(`row-${id}`);
      if (!expEl) return;

      const expRect = expEl.getBoundingClientRect();
      const parentRect = parentEl ? parentEl.getBoundingClientRect() : expRect;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const bottomPadding = 56; // Margen de separación para ver holgadamente todo el contenido
      const topbarMargin = 85;  // Margen superior para respetar barra de navegación

      if (parentRect.top < topbarMargin) {
        // Si la fila principal quedó oculta arriba
        const targetY = window.scrollY + parentRect.top - topbarMargin;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      } else if (expRect.bottom > viewportHeight - bottomPadding) {
        // Si el contenido desplegado queda cortado abajo de la pantalla
        const scrollNeeded = expRect.bottom - viewportHeight + bottomPadding;
        const newParentTop = parentRect.top - scrollNeeded;

        if (newParentTop >= topbarMargin) {
          // Ambos caben en el viewport: scrolleamos hacia abajo lo necesario
          window.scrollBy({ top: scrollNeeded, behavior: 'smooth' });
        } else {
          // Si el alto de la pantalla es menor a ambos juntos, alineamos la cabecera arriba
          const targetY = window.scrollY + parentRect.top - topbarMargin;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        }
      }
    }, 150);
  };

  const toggleRowExpanded = (id: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      const isOpening = !next.has(id);
      if (isOpening) {
        next.add(id);
        scrollToExpandedRow(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  // Handler: Aprobar / V°B° de Proforma
  const handleAprobarProforma = (proformaId: string) => {
    const target = proformas.find((p) => p.id === proformaId);
    if (!target) return;

    const nowStr = new Date().toLocaleString('es-CL');

    setProformas((prev) =>
      prev.map((p) => {
        if (p.id === proformaId) {
          const hist = p.historialVersiones || [];
          const updatedHist = hist.map((h, i) =>
            i === hist.length - 1
              ? {
                ...h,
                estadoSupervision: 'Autorizada' as const,
                aprobadoPorSupervisor: user?.name || 'Carlos Muñoz (Jefatura)',
                fechaSupervision: nowStr,
              }
              : h
          );

          return {
            ...p,
            estadoSupervision: 'Autorizada',
            estado: 'Pendiente',
            historialVersiones: updatedHist,
          };
        }
        return p;
      })
    );

    // Registrar en auditoría
    MOCK_AUDIT.unshift({
      id: `a-${Date.now()}`,
      ts: nowStr,
      fechaHora: nowStr,
      usuario: user?.name || 'Carlos Muñoz',
      rol: 'Jefatura',
      accion: 'Aprobación',
      recurso: proformaId,
      objetoAfectado: `${target.cliente} (${target.id})`,
      estadoAnterior: target.estadoSupervision || 'Pendiente_Autorizacion',
      estadoNuevo: 'Autorizada (V°B° Jefatura concedido)',
      version: target.versionActual || 'v2',
      motivoObservaciones: `V°B° concedido por ${user?.name || 'Carlos Muñoz'} desde Dashboard Comercial.`,
      ip: '10.0.2.12',
    });

    showToast(
      `Proforma ${proformaId} aprobada exitosamente. V°B° de jefatura concedido.`,
      'success',
      5500,
      'V°B° Jefatura Otorgado'
    );
  };

  // Handler: Confirmar Rechazo / Devolver con Motivo
  const handleConfirmRechazo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProforma) return;

    const nowStr = new Date().toLocaleString('es-CL');
    const proformaId = rejectingProforma.id;

    setProformas((prev) =>
      prev.map((p) => {
        if (p.id === proformaId) {
          const hist = p.historialVersiones || [];
          const updatedHist = hist.map((h, i) =>
            i === hist.length - 1
              ? {
                ...h,
                estadoSupervision: 'Devuelta_Analista' as const,
                motivo: rejectionReason,
                observaciones: rejectionObservations,
                fechaSupervision: nowStr,
              }
              : h
          );

          return {
            ...p,
            estadoSupervision: 'Devuelta_Analista',
            estado: 'Rechazada v2',
            historialVersiones: updatedHist,
          };
        }
        return p;
      })
    );

    // Registrar en auditoría
    MOCK_AUDIT.unshift({
      id: `a-${Date.now()}`,
      ts: nowStr,
      fechaHora: nowStr,
      usuario: user?.name || 'Carlos Muñoz',
      rol: 'Jefatura',
      accion: 'Rechazo',
      recurso: proformaId,
      objetoAfectado: `${rejectingProforma.cliente} (${proformaId})`,
      estadoAnterior: rejectingProforma.estadoSupervision || 'Pendiente_Autorizacion',
      estadoNuevo: 'Devuelta a Ejecutivo con observaciones',
      version: rejectingProforma.versionActual || 'v2',
      motivoObservaciones: `Motivo: ${rejectionReason}. Observaciones: ${rejectionObservations}`,
      ip: '10.0.2.12',
    });

    showToast(
      `Proforma ${proformaId} devuelta al ejecutivo (${rejectingProforma.ejecutivoNombre || 'Asignado'}) para corrección.`,
      'warning',
      6000,
      'Proforma Devuelta con Observaciones'
    );

    setRejectingProforma(null);
    setRejectionReason('Inconsistencia en Tarifas / Descuentos');
    setRejectionObservations('');
  };

  // Handler: Descargar Proforma
  const handleDescargarProforma = (p: Proforma) => {
    showToast(
      `Generando documento de proforma ${p.id} (${p.versionActual || 'v1'}). Descarga iniciada.`,
      'info',
      4000,
      'Descarga de Proforma'
    );
  };

  // Renderizador de fila expandible (acordeón bajo la misma fila)
  const renderExpandedDetails = (p: Proforma, colSpan: number) => {
    const isV2OrMore = (p.historialVersiones?.length || 1) >= 2 || p.versionActual === 'v2' || p.versionActual === 'v3';
    const prevVersion = p.historialVersiones?.[0];
    const isPendingVb = p.estadoSupervision === 'Pendiente_Autorizacion' || p.estado === 'Pendiente de validación';

    return (
      <tr key={`${p.id}-expanded`} id={`expanded-row-${p.id}`} className="bg-purple-50/30 dark:bg-slate-800/40 border-b border-purple-100 dark:border-white/5">
        <td colSpan={colSpan} className="py-4 px-6">
          <div className="space-y-3.5 max-w-6xl animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Barra Superior del Desplegable (Acciones / Detalle) */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-purple-100 dark:border-white/10 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {isPendingVb ? `Acciones para ${p.id}:` : `Información de Proforma ${p.id}:`}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 uppercase">
                  {p.versionActual || 'v1'}
                </span>
                {isPendingVb ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse">
                    ⚡ Requiere V°B°
                  </span>
                ) : (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.estado.includes('Aprobada') || p.estado === 'Facturado'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                    }`}>
                    {p.estado}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Botones de Aceptar y Rechazar: SOLO presentes para proformas con estado pendiente de validación o V°B° */}
                {isPendingVb && (
                  <>
                    <button
                      type="button"
                      onClick={() => setApprovingProforma(p)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                      title="Aprobar y conceder V°B° de Jefatura"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Aprobar V°B°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRejectingProforma(p);
                        setRejectionReason('Inconsistencia en Tarifas / Descuentos');
                        setRejectionObservations('');
                      }}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                      title="Rechazar o devolver con observaciones al ejecutivo"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rechazar</span>
                    </button>
                  </>
                )}

                {/* Botón Descargar: siempre disponible */}
                <button
                  type="button"
                  onClick={() => handleDescargarProforma(p)}
                  className="px-3.5 py-1.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95"
                  title="Descargar proforma en formato PDF / Excel"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            {/* Alertas y Observaciones de Elaboración */}
            {p.alertasElaboracion && p.alertasElaboracion.length > 0 ? (
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Alertas y Observaciones de Elaboración:</span>
                </div>
                <div className="space-y-0.5 pl-5">
                  {p.alertasElaboracion.map((alerta, idx) => (
                    <p key={idx} className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                      • {alerta}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-gray-50/80 dark:bg-slate-800/40 border border-gray-200/60 dark:border-white/5 rounded-xl text-xs flex items-center gap-2 text-gray-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sin alertas operacionales registradas para esta versión.</span>
              </div>
            )}

            {/* Motivo de Rechazo en Versión 1 (Cliente) */}
            {(isV2OrMore || Boolean(p.motivoRechazoPrincipal)) && (
              <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>MOTIVO RECHAZO EN VERSIÓN 1 (CLIENTE):</span>
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                    Monto anterior:{' '}
                    <strong className="text-gray-700 dark:text-gray-300">
                      {formatCurrency(prevVersion?.monto || (p.monto ? p.monto * 1.05 : 6800000))}
                    </strong>
                  </span>
                </div>
                <p className="text-[11px] text-gray-700 dark:text-gray-300 italic pl-5 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-purple-100/60 dark:border-white/5">
                  &quot;{prevVersion?.motivo || p.motivoRechazoPrincipal || 'Diferencia en recubitaje / medidas de SKUs volumétricos'}&quot;
                </p>
              </div>
            )}

            {/* Fila del final con 3 bloques: Tipo de Acuerdo, Cuenta Corriente y Estado de Supervisión */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-white/5 shadow-2xs">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block uppercase font-bold tracking-wider">
                  TIPO DE ACUERDO:
                </span>
                <strong className="text-gray-900 dark:text-white text-xs mt-0.5 block">
                  {p.tipoAcuerdo || 'Tarifa diferenciada por SKU'}
                </strong>
              </div>

              <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-white/5 shadow-2xs">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block uppercase font-bold tracking-wider">
                  CUENTA CORRIENTE:
                </span>
                <span className="text-gray-900 dark:text-white font-mono font-bold text-xs mt-0.5 block">
                  {p.cuentaCorrienteNombre || p.cuentaCorrienteId || '00-128-49921 (Banco de Chile)'}
                </span>
              </div>

              <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-white/5 shadow-2xs">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block uppercase font-bold tracking-wider">
                  ESTADO DE SUPERVISIÓN:
                </span>
                <span className="font-extrabold text-xs mt-0.5 block text-purple-700 dark:text-purple-300">
                  {p.estadoSupervision === 'Autorizada'
                    ? 'Autorizada / V°B° Otorgado'
                    : p.estadoSupervision === 'Devuelta_Analista'
                      ? 'Devuelta a Ejecutivo'
                      : 'Pendiente de Autorización / V°B°'}
                </span>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Filtros del Dashboard (Punto 10 Requerimiento Jira)
  const [filters, setFilters] = useState<DashboardFiltersState>({
    periodo: 'mes',
    ejecutivoId: 'todos',
    clienteId: 'todos',
    rut: '',
    cuentaCorriente: '',
    estadoProforma: 'todos',
    version: 'todos',
    resultadoAprobacion: 'todos',
    motivoRechazo: 'todos',
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Cantidad de filtros activos según la pestaña actual
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.periodo !== 'mes') count++;
    if (activeTab === 'comercial' || activeTab === 'ejecutivos' || activeTab === 'analistas') {
      if (filters.ejecutivoId !== 'todos') count++;
    }
    if (filters.clienteId && filters.clienteId !== 'todos') count++;
    if (activeTab === 'comercial') {
      if (filters.estadoProforma !== 'todos') count++;
      if (filters.version !== 'todos') count++;
      if (filters.motivoRechazo !== 'todos') count++;
      if (searchTerm.trim() !== '') count++;
    }
    return count;
  }, [filters, searchTerm, activeTab]);

  // Proformas base filtradas por el período seleccionado en el selector superior
  const periodoFilteredProformas = useMemo(() => {
    switch (filters.periodo) {
      case 'hoy':
        // Proformas de la jornada actual (2 proformas)
        return proformas.filter((p) => p.id === 'PF-2026-0208' || p.id === 'PF-2025-0141');
      case 'semana':
        // Proformas de la semana en curso (4 proformas)
        return proformas.filter(
          (p) =>
            p.id === 'PF-2026-0208' ||
            p.id === 'PF-2026-0204' ||
            p.id === 'PF-2025-0141' ||
            p.id === 'PF-2025-0140'
        );
      case 'mes':
        // Proformas del mes actual / Septiembre 2026 (6 proformas)
        return proformas.filter(
          (p) =>
            p.id === 'PF-2026-0208' ||
            p.id === 'PF-2026-0204' ||
            p.id === 'PF-2025-0141' ||
            p.id === 'PF-2025-0140' ||
            p.id === 'PF-2025-0143' ||
            p.id === 'PF-2025-0142'
        );
      case 'trimestre':
        // Proformas del Q3 (7 proformas)
        return proformas.filter(
          (p) =>
            p.id === 'PF-2026-0208' ||
            p.id === 'PF-2026-0204' ||
            p.id === 'PF-2025-0141' ||
            p.id === 'PF-2025-0140' ||
            p.id === 'PF-2025-0143' ||
            p.id === 'PF-2025-0142' ||
            p.id === 'PF-2025-0139'
        );
      case 'ano':
      case 'todos':
      default:
        // Todo el año 2026 o historial completo (8 proformas)
        return proformas;
    }
  }, [filters.periodo, proformas]);

  // Proformas filtradas específicamente por la card de KPI seleccionada
  const kpiFilteredProformas = useMemo(() => {
    if (kpiFilter === 'todos') return [];
    return periodoFilteredProformas.filter((p) => {
      if (kpiFilter === 'aprobadas') {
        return p.estado.includes('Aprobada') || p.estado === 'Facturado';
      }
      if (kpiFilter === 'revision') {
        return p.estado === 'Pendiente de validación' || p.estadoSupervision === 'Pendiente_Autorizacion';
      }
      if (kpiFilter === 'rechazadas') {
        return p.estado.includes('Rechazada') || p.estado === 'Derivada a KAM';
      }
      if (kpiFilter === 'facturadas') {
        return p.estado === 'Facturado';
      }
      return true;
    });
  }, [kpiFilter, periodoFilteredProformas]);

  // Proformas filtradas dinámicamente por la barra de filtros y búsqueda
  const dynamicFilteredProformas = useMemo(() => {
    return periodoFilteredProformas.filter((p) => {
      if (filters.ejecutivoId !== 'todos' && p.ejecutivoId !== filters.ejecutivoId) return false;
      if (filters.estadoProforma !== 'todos' && p.estado !== filters.estadoProforma) return false;
      if (filters.version !== 'todos' && p.versionActual !== filters.version) return false;
      if (filters.motivoRechazo !== 'todos' && p.motivoRechazoPrincipal !== filters.motivoRechazo) return false;

      if (filters.resultadoAprobacion !== 'todos') {
        if (filters.resultadoAprobacion === 'Aprobada' && !p.estado.includes('Aprobada') && p.estado !== 'Facturado') {
          return false;
        }
        if (filters.resultadoAprobacion === 'Rechazada' && !p.estado.includes('Rechazada')) {
          return false;
        }
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchId = p.id.toLowerCase().includes(term);
        const matchCliente = p.cliente.toLowerCase().includes(term);
        const matchRut = p.rut.toLowerCase().includes(term);
        const matchEjecutivo = p.ejecutivoNombre?.toLowerCase().includes(term);
        return matchId || matchCliente || matchRut || matchEjecutivo;
      }

      return true;
    });
  }, [filters, searchTerm, periodoFilteredProformas]);

  // KPIs Globales Comerciales Calculados Dinámicamente según el Período
  const kpisComerciales = useMemo(() => {
    const list = periodoFilteredProformas;
    const total = list.length || 1;
    const aprobadas = list.filter((p) => p.estado.includes('Aprobada') || p.estado === 'Facturado').length;
    const rechazadas = list.filter((p) => p.estado.includes('Rechazada') || p.estado === 'Derivada a KAM').length;
    const pendientes = list.filter((p) => p.estado === 'Pendiente' || p.estado === 'Pendiente de validación').length;
    const enRevision = list.filter((p) => p.estado === 'Pendiente de validación' || p.estadoSupervision === 'Pendiente_Autorizacion').length;
    const facturadas = list.filter((p) => p.estado === 'Facturado').length;

    const montoTotal = list.reduce((acc, curr) => acc + curr.monto, 0);
    const tasaAprobacion = ((aprobadas / total) * 100).toFixed(1);
    const tasaRechazo = ((rechazadas / total) * 100).toFixed(1);

    // Métricas de tiempo y versiones ajustadas al horizonte temporal
    const tiempoGen =
      filters.periodo === 'hoy'
        ? '0.8'
        : filters.periodo === 'semana'
          ? '1.2'
          : filters.periodo === 'mes'
            ? '1.4'
            : '1.6';

    const tiempoAprob =
      filters.periodo === 'hoy'
        ? '1.1'
        : filters.periodo === 'semana'
          ? '1.8'
          : filters.periodo === 'mes'
            ? '2.2'
            : filters.periodo === 'trimestre'
              ? '2.4'
              : '2.5';

    const promedioVers =
      filters.periodo === 'hoy'
        ? '1.1 v'
        : filters.periodo === 'semana'
          ? '1.2 v'
          : filters.periodo === 'mes'
            ? '1.3 v'
            : '1.4 v';

    return {
      total: list.length,
      montoTotal,
      aprobadas,
      rechazadas,
      pendientes,
      enRevision,
      facturadas,
      tasaAprobacion,
      tasaRechazo,
      tiempoPromedioGeneracion: `${tiempoGen} días`,
      tiempoPromedioGeneracionRaw: tiempoGen,
      tiempoPromedioAprobacion: `${tiempoAprob} días`,
      tiempoPromedioAprobacionRaw: tiempoAprob,
      promedioVersiones: promedioVers,
    };
  }, [periodoFilteredProformas, filters.periodo]);

  // Datos dinámicos de Ejecutivos según el Período seleccionado
  const ejecutivosData = useMemo(() => {
    return MOCK_EXECUTIVES.map((exe) => {
      switch (filters.periodo) {
        case 'hoy': {
          const factor = 0.05;
          const total = Math.max(1, Math.round(exe.proformasTotales * factor));
          const aprobadas = exe.id === 'exe-4' ? 0 : Math.max(0, Math.min(total, Math.round(exe.proformasAprobadas * factor)));
          const rechazadas = exe.id === 'exe-4' ? 1 : 0;
          const pendientes = Math.max(0, total - aprobadas - rechazadas);
          const convertidas = aprobadas;
          const tasaAprob = total > 0 ? Number(((aprobadas / total) * 100).toFixed(1)) : 0;
          const tasaRech = total > 0 ? Number(((rechazadas / total) * 100).toFixed(1)) : 0;
          return {
            ...exe,
            proformasTotales: total,
            proformasAprobadas: aprobadas,
            proformasRechazadas: rechazadas,
            proformasPendientes: pendientes,
            proformasExpiradas: 0,
            proformasConvertidas: convertidas,
            tasaAprobacion: tasaAprob,
            tasaRechazo: tasaRech,
            tiempoPromedioGeneracionDias: Number((exe.tiempoPromedioGeneracionDias * 0.7).toFixed(1)),
            tiempoPromedioAprobacionDias: Number((exe.tiempoPromedioAprobacionDias * 0.7).toFixed(1)),
            promedioVersiones: 1.1,
            cantidadReprocesos: exe.id === 'exe-4' || exe.id === 'exe-1' ? 1 : 0,
          };
        }
        case 'semana': {
          const factor = 0.22;
          const total = Math.max(2, Math.round(exe.proformasTotales * factor));
          const aprobadas = Math.round(exe.proformasAprobadas * factor);
          const rechazadas = Math.max(0, Math.round(exe.proformasRechazadas * factor));
          const pendientes = Math.max(0, total - aprobadas - rechazadas);
          const convertidas = Math.max(0, Math.round(exe.proformasConvertidas * factor));
          const tasaAprob = total > 0 ? Number(((aprobadas / total) * 100).toFixed(1)) : 0;
          const tasaRech = total > 0 ? Number(((rechazadas / total) * 100).toFixed(1)) : 0;
          return {
            ...exe,
            proformasTotales: total,
            proformasAprobadas: aprobadas,
            proformasRechazadas: rechazadas,
            proformasPendientes: pendientes,
            proformasExpiradas: Math.min(1, Math.round(exe.proformasExpiradas * factor)),
            proformasConvertidas: convertidas,
            tasaAprobacion: tasaAprob,
            tasaRechazo: tasaRech,
            tiempoPromedioGeneracionDias: Number((exe.tiempoPromedioGeneracionDias * 0.85).toFixed(1)),
            tiempoPromedioAprobacionDias: Number((exe.tiempoPromedioAprobacionDias * 0.85).toFixed(1)),
            promedioVersiones: Number((exe.promedioVersiones * 0.95).toFixed(1)),
            cantidadReprocesos: Math.max(1, Math.round(exe.cantidadReprocesos * factor)),
          };
        }
        case 'mes': {
          const factor = 0.52;
          const total = Math.max(5, Math.round(exe.proformasTotales * factor));
          const aprobadas = Math.round(exe.proformasAprobadas * factor);
          const rechazadas = Math.round(exe.proformasRechazadas * factor);
          const pendientes = Math.max(1, total - aprobadas - rechazadas);
          const convertidas = Math.round(exe.proformasConvertidas * factor);
          const tasaAprob = total > 0 ? Number(((aprobadas / total) * 100).toFixed(1)) : 0;
          const tasaRech = total > 0 ? Number(((rechazadas / total) * 100).toFixed(1)) : 0;
          return {
            ...exe,
            proformasTotales: total,
            proformasAprobadas: aprobadas,
            proformasRechazadas: rechazadas,
            proformasPendientes: pendientes,
            proformasExpiradas: Math.round(exe.proformasExpiradas * factor),
            proformasConvertidas: convertidas,
            tasaAprobacion: tasaAprob,
            tasaRechazo: tasaRech,
            tiempoPromedioGeneracionDias: exe.tiempoPromedioGeneracionDias,
            tiempoPromedioAprobacionDias: exe.tiempoPromedioAprobacionDias,
            promedioVersiones: exe.promedioVersiones,
            cantidadReprocesos: Math.max(1, Math.round(exe.cantidadReprocesos * factor)),
          };
        }
        case 'trimestre': {
          const factor = 0.82;
          const total = Math.round(exe.proformasTotales * factor);
          const aprobadas = Math.round(exe.proformasAprobadas * factor);
          const rechazadas = Math.round(exe.proformasRechazadas * factor);
          const pendientes = Math.max(1, total - aprobadas - rechazadas);
          const convertidas = Math.round(exe.proformasConvertidas * factor);
          const tasaAprob = total > 0 ? Number(((aprobadas / total) * 100).toFixed(1)) : 0;
          const tasaRech = total > 0 ? Number(((rechazadas / total) * 100).toFixed(1)) : 0;
          return {
            ...exe,
            proformasTotales: total,
            proformasAprobadas: aprobadas,
            proformasRechazadas: rechazadas,
            proformasPendientes: pendientes,
            proformasExpiradas: Math.round(exe.proformasExpiradas * factor),
            proformasConvertidas: convertidas,
            tasaAprobacion: tasaAprob,
            tasaRechazo: tasaRech,
            tiempoPromedioGeneracionDias: exe.tiempoPromedioGeneracionDias,
            tiempoPromedioAprobacionDias: exe.tiempoPromedioAprobacionDias,
            promedioVersiones: exe.promedioVersiones,
            cantidadReprocesos: Math.round(exe.cantidadReprocesos * factor),
          };
        }
        case 'ano':
        case 'todos':
        default:
          return exe;
      }
    });
  }, [filters.periodo]);

  // Datos filtrados de Ejecutivos según el Período, Ejecutivo y Cliente seleccionados
  const filteredEjecutivosData = useMemo(() => {
    return ejecutivosData.filter((exe) => {
      // Filtro por ejecutivo
      if (filters.ejecutivoId !== 'todos' && exe.id !== filters.ejecutivoId) {
        return false;
      }
      // Filtro por cliente: se muestra si el ejecutivo atiende al cliente seleccionado
      if (filters.clienteId && filters.clienteId !== 'todos') {
        const client = MOCK_CLIENTS.find((c) => c.id === filters.clienteId);
        if (client && client.ejecutivoId !== exe.id) {
          return false;
        }
      }
      return true;
    });
  }, [ejecutivosData, filters.ejecutivoId, filters.clienteId]);

  // Datos dinámicos de Clientes según el Período seleccionado
  const clientesData = useMemo(() => {
    return MOCK_CLIENTS.map((client) => {
      switch (filters.periodo) {
        case 'hoy': {
          const isClientActiveToday = client.id === 'cli-1' || client.id === 'cli-2' || client.id === 'cli-4';
          const total = isClientActiveToday ? 1 : 0;
          const aprobadas = client.id === 'cli-2' ? 1 : 0;
          const rechazadas = client.id === 'cli-4' ? 1 : 0;
          const tasaAprob = total > 0 ? (aprobadas / total) * 100 : client.kpis.tasaAprobacion;
          return {
            ...client,
            kpis: {
              ...client.kpis,
              proformasTotales: total,
              proformasAprobadas: aprobadas,
              proformasRechazadas: rechazadas,
              tasaAprobacion: Number(tasaAprob.toFixed(1)),
              cantidadReprocesos: isClientActiveToday ? (client.id === 'cli-4' ? 1 : 0) : 0,
              promedioVersiones: isClientActiveToday ? 1.0 : 1.0,
              tiempoPromedioAprobacionDias: Number((client.kpis.tiempoPromedioAprobacionDias * 0.7).toFixed(1)),
            },
          };
        }
        case 'semana': {
          const factor = 0.25;
          const total = Math.max(1, Math.round(client.kpis.proformasTotales * factor));
          const aprobadas = Math.round(client.kpis.proformasAprobadas * factor);
          const rechazadas = Math.round(client.kpis.proformasRechazadas * factor);
          const tasaAprob = total > 0 ? (aprobadas / total) * 100 : client.kpis.tasaAprobacion;
          return {
            ...client,
            kpis: {
              ...client.kpis,
              proformasTotales: total,
              proformasAprobadas: aprobadas,
              proformasRechazadas: rechazadas,
              tasaAprobacion: Number(tasaAprob.toFixed(1)),
              cantidadReprocesos: Math.max(0, Math.round(client.kpis.cantidadReprocesos * factor)),
              tiempoPromedioAprobacionDias: Number((client.kpis.tiempoPromedioAprobacionDias * 0.85).toFixed(1)),
            },
          };
        }
        case 'mes': {
          const factor = 0.55;
          const total = Math.max(2, Math.round(client.kpis.proformasTotales * factor));
          const aprobadas = Math.round(client.kpis.proformasAprobadas * factor);
          const rechazadas = Math.round(client.kpis.proformasRechazadas * factor);
          const tasaAprob = total > 0 ? (aprobadas / total) * 100 : client.kpis.tasaAprobacion;
          return {
            ...client,
            kpis: {
              ...client.kpis,
              proformasTotales: total,
              proformasAprobadas: aprobadas,
              proformasRechazadas: rechazadas,
              tasaAprobacion: Number(tasaAprob.toFixed(1)),
              cantidadReprocesos: Math.round(client.kpis.cantidadReprocesos * factor),
              tiempoPromedioAprobacionDias: client.kpis.tiempoPromedioAprobacionDias,
            },
          };
        }
        case 'trimestre': {
          const factor = 0.85;
          const total = Math.round(client.kpis.proformasTotales * factor);
          const aprobadas = Math.round(client.kpis.proformasAprobadas * factor);
          const rechazadas = Math.round(client.kpis.proformasRechazadas * factor);
          const tasaAprob = total > 0 ? (aprobadas / total) * 100 : client.kpis.tasaAprobacion;
          return {
            ...client,
            kpis: {
              ...client.kpis,
              proformasTotales: total,
              proformasAprobadas: aprobadas,
              proformasRechazadas: rechazadas,
              tasaAprobacion: Number(tasaAprob.toFixed(1)),
              cantidadReprocesos: Math.round(client.kpis.cantidadReprocesos * factor),
              tiempoPromedioAprobacionDias: client.kpis.tiempoPromedioAprobacionDias,
            },
          };
        }
        case 'ano':
        case 'todos':
        default:
          return client;
      }
    });
  }, [filters.periodo]);

  // Datos filtrados de Clientes según el Período y Cliente seleccionados
  const filteredClientesData = useMemo(() => {
    return clientesData.filter((client) => {
      if (filters.clienteId && filters.clienteId !== 'todos' && client.id !== filters.clienteId) {
        return false;
      }
      return true;
    });
  }, [clientesData, filters.clienteId]);

  // Paginación de tablas (máximo 10 líneas / clientes por página)
  const ITEMS_PER_PAGE = 10;
  const [pageClientes, setPageClientes] = useState(1);
  const [pageEjecutivos, setPageEjecutivos] = useState(1);
  const [pageProformas, setPageProformas] = useState(1);
  const [pageKpiProformas, setPageKpiProformas] = useState(1);

  // Resetear páginas cuando cambian los filtros, término de búsqueda o pestaña
  useEffect(() => {
    setPageClientes(1);
    setPageEjecutivos(1);
    setPageProformas(1);
    setPageKpiProformas(1);
  }, [filters, searchTerm, kpiFilter, activeTab]);

  // 1. Proformas paginadas (KPI drilldown)
  const safePageKpiProformas = Math.min(pageKpiProformas, Math.max(1, Math.ceil(kpiFilteredProformas.length / ITEMS_PER_PAGE)));
  const kpiProformasStartIndex = (safePageKpiProformas - 1) * ITEMS_PER_PAGE;
  const paginatedKpiProformas = useMemo(() => {
    return kpiFilteredProformas.slice(kpiProformasStartIndex, kpiProformasStartIndex + ITEMS_PER_PAGE);
  }, [kpiFilteredProformas, kpiProformasStartIndex]);

  // 2. Proformas paginadas (Búsqueda dinámica / Comercial)
  const safePageProformas = Math.min(pageProformas, Math.max(1, Math.ceil(dynamicFilteredProformas.length / ITEMS_PER_PAGE)));
  const proformasStartIndex = (safePageProformas - 1) * ITEMS_PER_PAGE;
  const paginatedDynamicProformas = useMemo(() => {
    return dynamicFilteredProformas.slice(proformasStartIndex, proformasStartIndex + ITEMS_PER_PAGE);
  }, [dynamicFilteredProformas, proformasStartIndex]);

  // 3. Ejecutivos paginados
  const safePageEjecutivos = Math.min(pageEjecutivos, Math.max(1, Math.ceil(filteredEjecutivosData.length / ITEMS_PER_PAGE)));
  const ejecutivosStartIndex = (safePageEjecutivos - 1) * ITEMS_PER_PAGE;
  const paginatedEjecutivosData = useMemo(() => {
    return filteredEjecutivosData.slice(ejecutivosStartIndex, ejecutivosStartIndex + ITEMS_PER_PAGE);
  }, [filteredEjecutivosData, ejecutivosStartIndex]);

  // 4. Clientes paginados (máximo 10 clientes por página)
  const safePageClientes = Math.min(pageClientes, Math.max(1, Math.ceil(filteredClientesData.length / ITEMS_PER_PAGE)));
  const clientesStartIndex = (safePageClientes - 1) * ITEMS_PER_PAGE;
  const paginatedClientesData = useMemo(() => {
    return filteredClientesData.slice(clientesStartIndex, clientesStartIndex + ITEMS_PER_PAGE);
  }, [filteredClientesData, clientesStartIndex]);

  const resetFilters = () => {
    setFilters({
      periodo: 'mes',
      ejecutivoId: 'todos',
      clienteId: 'todos',
      rut: '',
      cuentaCorriente: '',
      estadoProforma: 'todos',
      version: 'todos',
      resultadoAprobacion: 'todos',
      motivoRechazo: 'todos',
    });
    setKpiFilter('todos');
    setSearchTerm('');
    setPageClientes(1);
    setPageEjecutivos(1);
    setPageProformas(1);
    setPageKpiProformas(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">
          Hola, {user?.name?.split(' ')[0] || 'Carlos'} 👋
        </h1>
        <p className="text-caption text-gray-600 dark:text-gray-400">
          Rol: <span className="font-semibold text-purple-700 dark:text-purple-400">Jefatura de facturación</span> · Supervisión centralizada, control de ejecutivos y clientes
        </p>
      </div>

      {/* Pestañas de Vistas del Dashboard */}
      <div className="flex p-1 bg-gray-100/80 dark:bg-slate-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('comercial')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'comercial'
            ? 'bg-purple-600 text-white shadow-xs'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard comercial</span>
        </button>

        <button
          onClick={() => setActiveTab('ejecutivos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'ejecutivos' || activeTab === 'analistas'
            ? 'bg-purple-600 text-white shadow-xs'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>KPIs por ejecutivo ({filteredEjecutivosData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clientes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'clientes'
            ? 'bg-purple-600 text-white shadow-xs'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
        >
          <Building2 className="w-4 h-4" />
          <span>KPIs por cliente ({filteredClientesData.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: DASHBOARD COMERCIAL GENERAL (Punto 5 Requerimiento Jira)        */}
      {/* ========================================================================= */}
      {activeTab === 'comercial' && (
        <div className="space-y-6">
          {/* 1. Tarjetas Principales de KPIs Interactivas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* KPI 1: Totales */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setKpiFilter('todos')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter('todos'); }}
              title="Haz clic para ver la vista general del dashboard"
              className={`p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${kpiFilter === 'todos'
                ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-600 ring-2 ring-purple-600/30 shadow-md'
                : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600/40 hover:shadow-sm'
                }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Total proformas
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-0.5 ${kpiFilter === 'todos'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5'
                  }`}>
                  {kpiFilter === 'todos' && <Check className="w-2.5 h-2.5" />}
                  {kpiFilter === 'todos' ? 'Activo' : 'General'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpiFilter === 'todos'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                  }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white leading-none">
                  {kpisComerciales.total}
                </div>
              </div>
              <div className="text-[11px] text-purple-700 dark:text-purple-300 font-bold leading-tight">
                {formatCurrency(kpisComerciales.montoTotal)}
              </div>
            </div>

            {/* KPI 2: Aprobadas */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setKpiFilter((prev) => (prev === 'aprobadas' ? 'todos' : 'aprobadas'))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter((prev) => (prev === 'aprobadas' ? 'todos' : 'aprobadas')); }}
              title={kpiFilter === 'aprobadas' ? 'Haz clic para quitar filtro' : 'Haz clic para listar solo proformas aprobadas'}
              className={`p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${kpiFilter === 'aprobadas'
                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-600 ring-2 ring-emerald-600/30 shadow-md'
                : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-600/40 hover:shadow-sm'
                }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Aprobadas
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center justify-center ${kpiFilter === 'aprobadas'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60'
                  }`}>
                  Listas
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpiFilter === 'aprobadas'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                  }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                  {kpisComerciales.aprobadas}
                </div>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold leading-tight">
                {kpisComerciales.tasaAprobacion}% Éxito
              </div>
            </div>

            {/* KPI 3: Pendientes V°B° */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setKpiFilter((prev) => (prev === 'revision' ? 'todos' : 'revision'))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter((prev) => (prev === 'revision' ? 'todos' : 'revision')); }}
              title={kpiFilter === 'revision' ? 'Haz clic para quitar filtro' : 'Haz clic para listar pendientes de autorización'}
              className={`p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${kpiFilter === 'revision'
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-600 ring-2 ring-amber-600/30 shadow-md'
                : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-600/40 hover:shadow-sm'
                }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Pendientes V°B°
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center justify-center ${kpiFilter === 'revision'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60'
                  }`}>
                  Por V°B°
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpiFilter === 'revision'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                  }`}>
                  <Hourglass className="w-5 h-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">
                  {kpisComerciales.enRevision}
                </div>
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold leading-tight">
                Por autorizar
              </div>
            </div>

            {/* KPI 4: Rechazos */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setKpiFilter((prev) => (prev === 'rechazadas' ? 'todos' : 'rechazadas'))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter((prev) => (prev === 'rechazadas' ? 'todos' : 'rechazadas')); }}
              title={kpiFilter === 'rechazadas' ? 'Haz clic para quitar filtro' : 'Haz clic para listar proformas rechazadas'}
              className={`p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${kpiFilter === 'rechazadas'
                ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-600 ring-2 ring-rose-600/30 shadow-md'
                : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-600/40 hover:shadow-sm'
                }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Rechazos
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center justify-center ${kpiFilter === 'rechazadas'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60'
                  }`}>
                  Rechazos
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpiFilter === 'rechazadas'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                  }`}>
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-rose-600 dark:text-rose-400 leading-none">
                  {kpisComerciales.rechazadas}
                </div>
              </div>
              <div className="text-[11px] text-rose-700 dark:text-rose-400 font-bold leading-tight">
                {kpisComerciales.tasaRechazo}% Tasa
              </div>
            </div>

            {/* KPI 5: Facturadas SAP */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setKpiFilter((prev) => (prev === 'facturadas' ? 'todos' : 'facturadas'))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter((prev) => (prev === 'facturadas' ? 'todos' : 'facturadas')); }}
              title={kpiFilter === 'facturadas' ? 'Haz clic para quitar filtro' : 'Haz clic para listar proformas facturadas'}
              className={`p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${kpiFilter === 'facturadas'
                ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-600 ring-2 ring-purple-600/30 shadow-md'
                : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600/40 hover:shadow-sm'
                }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Facturadas SAP
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center justify-center ${kpiFilter === 'facturadas'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60'
                  }`}>
                  En SAP
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpiFilter === 'facturadas'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                  }`}>
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-purple-700 dark:text-purple-300 leading-none">
                  {kpisComerciales.facturadas}
                </div>
              </div>
              <div className="text-[11px] text-purple-700 dark:text-purple-300 font-bold leading-tight">
                Emitidas en SAP
              </div>
            </div>

            {/* KPI 6: T. Aprobación Promedio */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab('ejecutivos')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('ejecutivos'); }}
              title="Haz clic para ver el detalle de desempeño por ejecutivo"
              className="p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  T. aprobación
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60 flex items-center gap-0.5">
                  <span>Ejecutivos</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white leading-none">
                    {kpisComerciales.tiempoPromedioAprobacionRaw}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    días
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold leading-tight">
                Versiones: {kpisComerciales.promedioVersiones}
              </div>
            </div>
          </div>

          {/* 2. TABLA DINÁMICA DE PROFORMAS DEL KPI SELECCIONADO (Si hay filtro de KPI activo) */}
          {kpiFilter !== 'todos' && (
            <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-200 dark:border-white/10 overflow-hidden shadow-sm animate-in fade-in duration-200">
              <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/40 dark:bg-purple-950/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${kpiFilter === 'aprobadas'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : kpiFilter === 'revision'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                        : kpiFilter === 'rechazadas'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                      }`}>
                      {kpiFilter === 'aprobadas' && '✅ Proformas Aprobadas / Facturadas'}
                      {kpiFilter === 'revision' && '⏳ Proformas Pendientes de Autorización V°B°'}
                      {kpiFilter === 'rechazadas' && '⚠️ Proformas en Rechazo / Derivadas a KAM'}
                      {kpiFilter === 'facturadas' && '📄 Proformas Facturadas en SAP'}
                    </span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      ({kpiFilteredProformas.length} proformas)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Visualización directa de elementos resultantes según la tarjeta de métrica seleccionada.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setKpiFilter('todos')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <XCircle className="w-4 h-4 text-purple-600" />
                  <span>Cerrar filtro de tarjeta</span>
                </button>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[850px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                      <th className="py-2.5 px-3">Proforma ID</th>
                      <th className="py-2.5 px-2">Cliente / razón social</th>
                      <th className="py-2.5 px-2">Ejecutivo</th>
                      <th className="py-2.5 px-2 text-right">Monto</th>
                      <th className="py-2.5 px-1 text-center">Versión</th>
                      <th className="py-2.5 px-1 text-center">Estado comercial</th>
                      <th className="py-2.5 px-2">Motivo / observaciones</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                    {paginatedKpiProformas.map((p) => {
                      const isExpanded = expandedRowIds.has(p.id);
                      const isPendingVb = p.estadoSupervision === 'Pendiente_Autorizacion' || p.estado === 'Pendiente de validación';
                      return (
                        <React.Fragment key={p.id}>
                          <tr id={`row-${p.id}`} className={cn("hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors", isExpanded && "bg-purple-50/30 dark:bg-purple-950/25")}>
                            <td className="py-2.5 px-3 font-mono font-bold text-purple-700 dark:text-purple-300">
                              {p.id}
                            </td>
                            <td className="py-2.5 px-2">
                              <div className="font-bold text-gray-900 dark:text-white leading-tight">{p.cliente}</div>
                              <span className="text-[10px] text-gray-500 font-mono block">RUT: {p.rut}</span>
                            </td>
                            <td className="py-2.5 px-2 font-medium">
                              {p.ejecutivoNombre || 'Ana Valenzuela'}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-gray-900 dark:text-white">
                              {p.montoFormatted}
                            </td>
                            <td className="py-2.5 px-1 text-center font-mono font-bold text-purple-700 dark:text-purple-300">
                              {p.versionActual || 'v1'}
                            </td>
                            <td className="py-2.5 px-1 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.estado.includes('Aprobada') || p.estado === 'Facturado'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                : p.estado === 'Pendiente de validación'
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                                }`}>
                                {p.estado}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-[11px] text-gray-600 dark:text-gray-400 max-w-[220px]">
                              <span className="truncate block">
                                {p.motivoRechazoPrincipal || p.alertasElaboracion?.[0] || 'En proceso normal de supervisión.'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => toggleRowExpanded(p.id)}
                                  title={
                                    isPendingVb
                                      ? isExpanded
                                        ? 'Ocultar información y acciones'
                                        : 'Revisar proforma, alertas y gestionar V°B°'
                                      : isExpanded
                                        ? 'Ocultar información detallada'
                                        : 'Desplegar información de proforma'
                                  }
                                  aria-label={
                                    isPendingVb
                                      ? isExpanded
                                        ? 'Ocultar información y acciones'
                                        : 'Revisar proforma, alertas y gestionar V°B°'
                                      : isExpanded
                                        ? 'Ocultar información detallada'
                                        : 'Desplegar información de proforma'
                                  }
                                  className={cn(
                                    'p-1.5 rounded-lg border transition-all inline-flex items-center justify-center shadow-2xs cursor-pointer',
                                    isExpanded
                                      ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                      : 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                                  )}
                                >
                                  {isPendingVb ? (
                                    <Pencil className="w-4 h-4" />
                                  ) : isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && renderExpandedDetails(p, 8)}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginador para proformas de tarjeta KPI */}
              <TablePagination
                currentPage={safePageKpiProformas}
                totalItems={kpiFilteredProformas.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPageKpiProformas}
                itemLabel="proformas"
              />
            </div>
          )}

          {/* 3. CARD UNIFICADA: FILTROS + RESULTADOS DE BÚSQUEDA DINÁMICOS (Visible solo cuando el KPI seleccionado es 'todos' / Total Proformas) */}
          {kpiFilter === 'todos' && (
            <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-200/90 dark:border-purple-900/50 overflow-hidden shadow-xs animate-in fade-in duration-200">
              {/* Sección Superior: Filtros */}
              <DashboardFiltersPanel
                tab="comercial"
                totalFoundText={`${dynamicFilteredProformas.length} proformas encontradas`}
                filters={filters}
                setFilters={setFilters}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeFiltersCount={activeFiltersCount}
                resetFilters={resetFilters}
                isFilterPanelOpen={isFilterPanelOpen}
                setIsFilterPanelOpen={setIsFilterPanelOpen}
              />

              {/* Separador de línea gris */}
              <div className="border-t border-gray-200 dark:border-white/10" />

              {/* Sección Inferior: Header de Tabla de Resultados */}
              <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-purple-50/30 dark:bg-purple-950/10">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Resultados de búsqueda y filtros dinámicos
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Listado sincronizado en tiempo real según los filtros y términos de búsqueda seleccionados arriba.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-200/60 dark:border-purple-800/40 w-fit shrink-0">
                  Mostrando {dynamicFilteredProformas.length} de {periodoFilteredProformas.length} proformas
                </span>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                      <th className="py-3 px-3">Proforma ID</th>
                      <th className="py-3 px-2">Cliente / razón social</th>
                      <th className="py-3 px-2">Ejecutivo responsable</th>
                      <th className="py-3 px-2 text-right">Monto</th>
                      <th className="py-3 px-1 text-center">Versión</th>
                      <th className="py-3 px-1 text-center">Supervisión V°B°</th>
                      <th className="py-3 px-1 text-center">Estado comercial</th>
                      <th className="py-3 px-2">Motivo / alertas</th>
                      <th className="py-3 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                    {dynamicFilteredProformas.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-gray-500 dark:text-gray-400">
                          <div className="max-w-xs mx-auto space-y-2">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              No se encontraron proformas con los filtros seleccionados.
                            </p>
                            <p className="text-xs text-gray-400">
                              Prueba ajustando los criterios de búsqueda o restableciendo los filtros.
                            </p>
                            <button
                              onClick={resetFilters}
                              className="mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Restablecer todos los filtros
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedDynamicProformas.map((p) => {
                        const isExpanded = expandedRowIds.has(p.id);
                        const isPendingVb = p.estadoSupervision === 'Pendiente_Autorizacion' || p.estado === 'Pendiente de validación';
                        return (
                          <React.Fragment key={p.id}>
                            <tr id={`row-${p.id}`} className={cn("hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors", isExpanded && "bg-purple-50/30 dark:bg-purple-950/25")}>
                              <td className="py-3 px-3 font-mono font-bold text-purple-700 dark:text-purple-300">
                                {p.id}
                              </td>
                              <td className="py-3 px-2">
                                <div className="font-bold text-gray-900 dark:text-white leading-tight">{p.cliente}</div>
                                <span className="text-[10px] text-gray-500 font-mono block">RUT: {p.rut}</span>
                              </td>
                              <td className="py-3 px-2 font-medium">
                                {p.ejecutivoNombre || 'Ana Valenzuela'}
                              </td>
                              <td className="py-3 px-2 text-right font-mono font-bold text-gray-900 dark:text-white">
                                {p.montoFormatted}
                              </td>
                              <td className="py-3 px-1 text-center font-mono font-bold text-purple-700 dark:text-purple-300">
                                {p.versionActual || 'v1'}
                              </td>
                              <td className="py-3 px-1 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.estadoSupervision === 'Pendiente_Autorizacion' || p.estado === 'Pendiente de validación'
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 animate-pulse'
                                    : p.estadoSupervision === 'Autorizada'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                      : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                                    }`}
                                >
                                  {p.estadoSupervision || 'No requiere'}
                                </span>
                              </td>
                              <td className="py-3 px-1 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.estado.includes('Aprobada') || p.estado === 'Facturado'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                  : p.estado === 'Pendiente de validación'
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                                  }`}>
                                  {p.estado}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-[11px] text-gray-600 dark:text-gray-400 max-w-[200px]">
                                <span className="truncate block">
                                  {p.motivoRechazoPrincipal || p.alertasElaboracion?.[0] || 'En proceso normal de supervisión.'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={() => toggleRowExpanded(p.id)}
                                    title={
                                      isPendingVb
                                        ? isExpanded
                                          ? 'Ocultar información y acciones'
                                          : 'Revisar proforma, alertas y gestionar V°B°'
                                        : isExpanded
                                          ? 'Ocultar información detallada'
                                          : 'Desplegar información de proforma'
                                    }
                                    aria-label={
                                      isPendingVb
                                        ? isExpanded
                                          ? 'Ocultar información y acciones'
                                          : 'Revisar proforma, alertas y gestionar V°B°'
                                        : isExpanded
                                          ? 'Ocultar información detallada'
                                          : 'Desplegar información de proforma'
                                    }
                                    className={cn(
                                      'p-1.5 rounded-lg border transition-all inline-flex items-center justify-center shadow-2xs cursor-pointer',
                                      isExpanded
                                        ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                        : 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                                    )}
                                  >
                                    {isPendingVb ? (
                                      <Pencil className="w-4 h-4" />
                                    ) : isExpanded ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && renderExpandedDetails(p, 9)}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginador para búsqueda dinámica de proformas */}
              <TablePagination
                currentPage={safePageProformas}
                totalItems={dynamicFilteredProformas.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPageProformas}
                itemLabel="proformas"
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: KPIS POR EJECUTIVO (Punto 6 Requerimiento Jira)                 */}
      {/* ========================================================================= */}
      {(activeTab === 'ejecutivos' || activeTab === 'analistas') && (
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-200/90 dark:border-purple-900/50 overflow-hidden shadow-xs animate-in fade-in duration-200">
          {/* Sección Superior: Filtros (Período, Cliente, Ejecutivo) */}
          <DashboardFiltersPanel
            tab="ejecutivos"
            totalFoundText={`${filteredEjecutivosData.length} ejecutivo${filteredEjecutivosData.length === 1 ? '' : 's'} encontrado${filteredEjecutivosData.length === 1 ? '' : 's'}`}
            filters={filters}
            setFilters={setFilters}
            activeFiltersCount={activeFiltersCount}
            resetFilters={resetFilters}
            isFilterPanelOpen={isFilterPanelOpen}
            setIsFilterPanelOpen={setIsFilterPanelOpen}
          />

          {/* Separador de línea gris */}
          <div className="border-t border-gray-200 dark:border-white/10" />

          {/* Sección Inferior: Header de Tabla de Ejecutivos */}
          <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-purple-50/30 dark:bg-purple-950/10">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Desempeño individual de ejecutivos de facturación
              </h3>
              <p className="text-xs text-gray-500">
                Permite identificar balance de carga de trabajo, eficiencia y oportunidades de mejora por ejecutivo según el período seleccionado.
              </p>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[980px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                  <th className="py-2.5 px-3 min-w-[170px]">
                    <Tooltip content="Ejecutivo de Facturación Especial asignado">
                      <span>Ejecutivo</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Cantidad de clientes en cartera asignados">
                      <span>Cartera</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Total de proformas emitidas en el período">
                      <span>Total PF</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Proformas aprobadas por el cliente">
                      <span>Aprob.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Proformas rechazadas comercialmente">
                      <span>Rech.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Proformas pendientes de revisión o respuesta">
                      <span className="text-amber-700 dark:text-amber-300 font-extrabold underline decoration-dotted">Pend.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Proformas expiradas por término de vigencia">
                      <span className="text-gray-700 dark:text-gray-300 font-extrabold underline decoration-dotted">Exp.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Proformas convertidas exitosamente a facturación oficial">
                      <span className="text-purple-700 dark:text-purple-300 font-extrabold underline decoration-dotted">Conv.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Tasa de aprobación porcentual">
                      <span>% Aprob.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Tasa de rechazo porcentual">
                      <span>% Rech.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Tiempo promedio de generación de proformas (días)">
                      <span>T. gen.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Tiempo promedio de aprobación del cliente (días)">
                      <span>T. aprob.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Promedio de versiones emitidas por proforma">
                      <span>Vers.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Cantidad de reprocesos (proformas con 2 o más versiones)">
                      <span>Reproc.</span>
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                {filteredEjecutivosData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                      No se encontraron ejecutivos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  paginatedEjecutivosData.map((exe) => (
                    <tr key={exe.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                      {/* Ejecutivo: Nombre y correo debajo */}
                      <td className="py-3 px-3 font-medium">
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-gray-900 dark:text-white leading-tight block truncate max-w-[180px]">
                            {exe.nombre}
                          </span>
                          <span className="text-[11px] text-gray-500 font-normal leading-tight mt-0.5 block truncate max-w-[180px]">
                            {exe.email}
                          </span>
                        </div>
                      </td>

                      {/* Clientes */}
                      <td className="py-3 px-2 text-center font-bold text-purple-700 dark:text-purple-300">
                        {exe.clientesAsignadosCount}
                      </td>

                      {/* Proformas */}
                      <td className="py-3 px-2 text-center font-bold">
                        {exe.proformasTotales}
                      </td>

                      {/* Aprobadas */}
                      <td className="py-3 px-2 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                        {exe.proformasAprobadas}
                      </td>

                      {/* Rechazadas */}
                      <td className="py-3 px-2 text-center text-red-600 dark:text-red-400 font-semibold">
                        {exe.proformasRechazadas}
                      </td>

                      {/* Pendientes */}
                      <td className="py-3 px-2 text-center text-amber-600 dark:text-amber-400 font-semibold">
                        {exe.proformasPendientes}
                      </td>

                      {/* Expiradas */}
                      <td className="py-3 px-2 text-center text-gray-500 dark:text-gray-400 font-medium">
                        {exe.proformasExpiradas}
                      </td>

                      {/* Convertidas */}
                      <td className="py-3 px-2 text-center font-bold text-purple-700 dark:text-purple-300">
                        {exe.proformasConvertidas}
                      </td>

                      {/* Tasa Aprobación */}
                      <td className="py-3 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                          {exe.tasaAprobacion}%
                        </span>
                      </td>

                      {/* Tasa Rechazo */}
                      <td className="py-3 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300">
                          {exe.tasaRechazo}%
                        </span>
                      </td>

                      {/* Tiempos */}
                      <td className="py-3 px-2 text-center font-mono text-[11px]">
                        {exe.tiempoPromedioGeneracionDias}d
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-[11px]">
                        {exe.tiempoPromedioAprobacionDias}d
                      </td>

                      {/* Versiones y Reprocesos */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-purple-700 dark:text-purple-300 text-[11px]">
                        {exe.promedioVersiones}v
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                        {exe.cantidadReprocesos}
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>

          {/* Paginador para desempeño de ejecutivos */}
          <TablePagination
            currentPage={safePageEjecutivos}
            totalItems={filteredEjecutivosData.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPageEjecutivos}
            itemLabel="ejecutivos"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: KPIS POR CLIENTE (Punto 7 Requerimiento Jira)                   */}
      {/* ========================================================================= */}
      {activeTab === 'clientes' && (
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-200/90 dark:border-purple-900/50 overflow-hidden shadow-xs animate-in fade-in duration-200">
          {/* Sección Superior: Filtros (Período, Cliente) */}
          <DashboardFiltersPanel
            tab="clientes"
            totalFoundText={`${filteredClientesData.length} cliente${filteredClientesData.length === 1 ? '' : 's'} encontrado${filteredClientesData.length === 1 ? '' : 's'}`}
            filters={filters}
            setFilters={setFilters}
            activeFiltersCount={activeFiltersCount}
            resetFilters={resetFilters}
            isFilterPanelOpen={isFilterPanelOpen}
            setIsFilterPanelOpen={setIsFilterPanelOpen}
          />

          {/* Separador de línea gris */}
          <div className="border-t border-gray-200 dark:border-white/10" />

          {/* Sección Inferior: Header de Tabla de Clientes */}
          <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-purple-50/30 dark:bg-purple-950/10">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Comportamiento y complejidad por cliente
              </h3>
              <p className="text-xs text-gray-500">
                Permite detectar clientes que presentan mayor nivel de complejidad, reprocesos o desviaciones tarifarias en el período seleccionado.
              </p>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left border-collapse text-xs">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[12%]" />
                <col className="w-[15%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[7%]" />
              </colgroup>
              <thead>
                <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                  <th className="py-2.5 px-3">Cliente / razón social</th>
                  <th className="py-2.5 px-1.5">RUT</th>
                  <th className="py-2.5 px-1.5">Ejecutivo</th>
                  <th className="py-2.5 px-1 text-center">Total</th>
                  <th className="py-2.5 px-1 text-center">Aprob.</th>
                  <th className="py-2.5 px-1 text-center">Rech.</th>
                  <th className="py-2.5 px-1 text-center">% Aprob.</th>
                  <th className="py-2.5 px-1 text-center">Vers.</th>
                  <th className="py-2.5 px-1 text-center">Reproc.</th>
                  <th className="py-2.5 px-1 text-center">T. aprob.</th>
                  <th className="py-2.5 px-1 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                {filteredClientesData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                      No se encontraron clientes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  paginatedClientesData.map((client) => (
                    <tr key={client.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                      {/* Cliente */}
                      <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-gray-900 dark:text-white leading-tight block truncate max-w-[190px]">
                            {client.razonSocial}
                          </span>
                          {client.nombreFantasia && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal leading-tight mt-0.5 block truncate max-w-[190px]">
                              {client.nombreFantasia}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* RUT */}
                      <td className="py-2.5 px-1.5 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                        <span className="truncate block max-w-[100px]">{client.rut}</span>
                      </td>

                      {/* Ejecutivo */}
                      <td className="py-2.5 px-1.5">
                        {client.ejecutivoNombre ? (
                          <span className="font-semibold text-purple-700 dark:text-purple-300 text-[11px] block truncate max-w-[130px]">
                            {client.ejecutivoNombre}
                          </span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                            Sin asignar
                          </span>
                        )}
                      </td>

                      {/* Métricas */}
                      <td className="py-2.5 px-1 text-center font-bold">
                        {client.kpis.proformasTotales}
                      </td>
                      <td className="py-2.5 px-1 text-center text-emerald-600 font-semibold">
                        {client.kpis.proformasAprobadas}
                      </td>
                      <td className="py-2.5 px-1 text-center text-red-600 font-semibold">
                        {client.kpis.proformasRechazadas}
                      </td>
                      <td className="py-2.5 px-1 text-center">
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {client.kpis.tasaAprobacion}%
                        </span>
                      </td>
                      <td className="py-2.5 px-1 text-center font-mono font-bold text-purple-700 text-[11px]">
                        {client.kpis.promedioVersiones}v
                      </td>
                      <td className="py-2.5 px-1 text-center font-mono text-amber-700 font-bold text-[11px]">
                        {client.kpis.cantidadReprocesos}
                      </td>
                      <td className="py-2.5 px-1 text-center font-mono text-[11px]">
                        {client.kpis.tiempoPromedioAprobacionDias}d
                      </td>
                      <td className="py-2.5 px-1 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${client.estado === 'Activo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                          {client.estado}
                        </span>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>

          {/* Paginador para comportamiento por cliente */}
          <TablePagination
            currentPage={safePageClientes}
            totalItems={filteredClientesData.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPageClientes}
            itemLabel="clientes"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DOBLE VALIDACIÓN - ACEPTAR / APROBAR PROFORMA                       */}
      {/* ========================================================================= */}
      {approvingProforma && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 p-5 max-w-lg w-full max-h-[95vh] overflow-y-auto shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    ¿Estás seguro de aceptar la proforma?
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Doble validación de autorización comercial y V°B° de jefatura
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApprovingProforma(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ficha resumen: ID de la proforma, Cliente y Ejecutivo */}
            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-bold">ID proforma:</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                  {approvingProforma.id}
                </span>
              </div>
              <div className="flex items-start justify-between text-xs gap-2">
                <span className="text-gray-500 dark:text-gray-400 font-bold shrink-0">Cliente / razón social:</span>
                <span className="font-bold text-gray-900 dark:text-white text-right">
                  {approvingProforma.cliente}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-bold">Ejecutivo responsable:</span>
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  {approvingProforma.ejecutivoNombre || 'Ana Valenzuela'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-100/60 dark:border-white/5">
                <span className="text-gray-500 dark:text-gray-400 font-bold">Monto actual:</span>
                <span className="font-mono font-black text-gray-900 dark:text-white">
                  {approvingProforma.montoFormatted}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400">
              Al confirmar, se otorgará formalmente el V°B° de jefatura y la proforma quedará autorizada para continuar con el ciclo de facturación.
            </p>

            {/* Botones de acción: Cancelar (rojo secundario con contorno y texto) y Sí, aceptar (verde) */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setApprovingProforma(null)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAprobarProforma(approvingProforma.id);
                  setApprovingProforma(null);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Sí, aceptar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DOBLE VALIDACIÓN - RECHAZAR / DEVOLVER PROFORMA                    */}
      {/* ========================================================================= */}
      {rejectingProforma && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-5 max-w-lg w-full max-h-[95vh] overflow-y-auto shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 flex items-center justify-center font-bold">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    ¿Estás seguro de rechazar la proforma?
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Doble validación de devolución con observaciones
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectingProforma(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ficha resumen con los datos requeridos: ID, Cliente y Ejecutivo */}
            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-bold">ID proforma:</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                  {rejectingProforma.id}
                </span>
              </div>
              <div className="flex items-start justify-between text-xs gap-2">
                <span className="text-gray-500 dark:text-gray-400 font-bold shrink-0">Cliente / razón social:</span>
                <span className="font-bold text-gray-900 dark:text-white text-right">
                  {rejectingProforma.cliente}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-bold">Ejecutivo responsable:</span>
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  {rejectingProforma.ejecutivoNombre || 'Ana Valenzuela'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmRechazo} className="space-y-3">
              {/* Motivo de Rechazo Principal */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Motivo de rechazo / corrección: *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none cursor-pointer font-medium"
                >
                  <option value="Inconsistencia en tarifas / descuentos">Inconsistencia en tarifas / descuentos</option>
                  <option value="Diferencia en recubitaje / medidas de SKUs">Diferencia en recubitaje / medidas de SKUs</option>
                  <option value="Error en la selección de cuentas corrientes">Error en la selección de cuentas corrientes</option>
                  <option value="Falta de respaldo de orden de compra">Falta de respaldo de orden de compra</option>
                  <option value="Requiere derivación a negociación KAM">Requiere derivación a negociación KAM</option>
                  <option value="Otro motivo operacional">Otro motivo operacional</option>
                </select>
              </div>

              {/* Observaciones Obligatorias */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Observaciones detalladas para el ejecutivo ({rejectingProforma.ejecutivoNombre || 'Asignado'}): *
                </label>
                <textarea
                  value={rejectionObservations}
                  onChange={(e) => setRejectionObservations(e.target.value)}
                  required
                  placeholder="Detalla qué correcciones debe aplicar el ejecutivo antes de volver a solicitar V°B°..."
                  rows={2}
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none resize-none"
                />
              </div>

              {/* Botones de confirmación: Cancelar (rojo secundario con contorno y texto) y Sí, rechazar (verde) */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setRejectingProforma(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!rejectionObservations.trim()}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Sí, rechazar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
