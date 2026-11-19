'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  Check,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Layers,
  ArrowRight,
  GitCompare,
  User,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  MessageSquare,
  Eye,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { MOCK_PROFORMAS, MOCK_AUDIT, MOCK_EXECUTIVES } from '@/lib/mock-data';
import { Proforma } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';

type FilterTab = 'pendientes' | 'autorizadas' | 'devueltas' | 'todas';

export default function AprobacionesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [proformas, setProformas] = useState<Proforma[]>(MOCK_PROFORMAS);
  const [activeTab, setActiveTab] = useState<FilterTab>('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [executiveFilter, setExecutiveFilter] = useState('todos');

  // Estado para filas expandidas en la tabla de aprobaciones
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  const toggleRowExpanded = (id: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Simulación de descarga de proforma
  const handleDescargarProforma = (proforma: Proforma) => {
    showToast(
      `Generando documento de proforma ${proforma.id} (${proforma.versionActual || 'v1'}). Descarga completada.`,
      'info',
      4000,
      'Descarga de Proforma'
    );
  };

  // Modal de Comparador de Versiones (Diff Visual v1 vs v2)
  const [comparingProforma, setComparingProforma] = useState<Proforma | null>(null);

  // Modal para Devolver / Rechazar versión V2 con motivo
  const [rejectingProforma, setRejectingProforma] = useState<Proforma | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Inconsistencia en Tarifas / Descuentos');
  const [rejectionObservations, setRejectionObservations] = useState('');

  // Proformas que tienen version 2 o requieren supervisión
  const filteredProformas = useMemo(() => {
    return proformas.filter((p) => {
      const isPending = p.estadoSupervision === 'Pendiente_Autorizacion' || p.estado === 'Pendiente de validación';
      const isAuthorized = p.estadoSupervision === 'Autorizada' || p.estado === 'Aprobada por Cliente' || p.estado === 'Facturado';
      const isReturned = p.estadoSupervision === 'Devuelta_Analista' || p.estado === 'Derivada a KAM';

      if (activeTab === 'pendientes' && !isPending) return false;
      if (activeTab === 'autorizadas' && !isAuthorized) return false;
      if (activeTab === 'devueltas' && !isReturned) return false;

      if (executiveFilter !== 'todos' && p.ejecutivoId !== executiveFilter) {
        return false;
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
  }, [proformas, activeTab, executiveFilter, searchTerm]);

  // Contadores para badges
  const pendingCount = useMemo(
    () => proformas.filter((p) => p.estadoSupervision === 'Pendiente_Autorizacion' || p.estado === 'Pendiente de validación').length,
    [proformas]
  );

  // HANDLER: Aprobar Proforma Versión 2 (V°B° Jefatura)
  const handleAprobarV2 = (proformaId: string) => {
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
            estado: 'Pendiente', // Lista para reenvío formal al cliente
            historialVersiones: updatedHist,
          };
        }
        return p;
      })
    );

    // Registrar evento de auditoría
    MOCK_AUDIT.unshift({
      id: `a-${Date.now()}`,
      ts: nowStr,
      fechaHora: nowStr,
      usuario: user?.name || 'Carlos Muñoz',
      rol: 'Jefatura',
      accion: 'Aprobación',
      recurso: proformaId,
      objetoAfectado: `${target.cliente} (${target.id})`,
      estadoAnterior: 'Pendiente_Autorizacion (v2)',
      estadoNuevo: 'Autorizada (V°B° Jefatura concedido)',
      version: target.versionActual || 'v2',
      motivoObservaciones: `V°B° concedido por ${user?.name || 'Carlos Muñoz'}. Lista para reenvío y validación comercial del cliente.`,
      ip: '10.0.2.12',
    });

    showToast(
      `Proforma ${proformaId} (Versión 2) aprobada exitosamente. V°B° concedido para reenvío al cliente.`,
      'success',
      5500,
      'V°B° Jefatura Otorgado'
    );

    setComparingProforma(null);
  };

  // HANDLER: Rechazar / Devolver Proforma V2 con Motivo
  const handleConfirmRechazoV2 = (e: React.FormEvent) => {
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
      estadoAnterior: 'Pendiente_Autorizacion (v2)',
      estadoNuevo: 'Devuelta a Ejecutivo con observaciones',
      version: rejectingProforma.versionActual || 'v2',
      motivoObservaciones: `Motivo: ${rejectionReason}. Observaciones: ${rejectionObservations}`,
      ip: '10.0.2.12',
    });

    showToast(
      `Proforma ${proformaId} devuelta al ejecutivo (${rejectingProforma.ejecutivoNombre}) para corrección.`,
      'warning',
      6000,
      'Proforma Devuelta con Observaciones'
    );

    setRejectingProforma(null);
    setRejectionReason('Inconsistencia en Tarifas / Descuentos');
    setRejectionObservations('');
    setComparingProforma(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 p-5 rounded-2xl border border-purple-100 dark:border-white/10 shadow-xs backdrop-blur-md">
        <div className="flex items-start gap-3">
          <CheckSquare className="w-7 h-7 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Aprobación / Rechazo de Proformas y Control de Versiones
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Supervisa las proformas re-emitidas tras rechazo del cliente (Versión 2+), contrasta cambios y emite V°B° de jefatura.
            </p>
          </div>
        </div>

        {/* Resumen Superior */}
        <div className="flex items-center gap-3">
          <div className="text-right px-4 py-2 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl">
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              Pendientes V°B° (v2)
            </div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-300">
              {pendingCount}
            </div>
          </div>
          <div className="text-right px-4 py-2 bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 rounded-xl">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Proformas
            </div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-200">
              {proformas.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y Filtros */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-purple-100/80 dark:border-white/10 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('pendientes')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pendientes'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <span>Pendientes V°B°</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[10px] font-extrabold rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('autorizadas')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'autorizadas'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Autorizadas por Jefatura
            </button>
            <button
              onClick={() => setActiveTab('devueltas')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'devueltas'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Rechazadas / Derivadas
            </button>
            <button
              onClick={() => setActiveTab('todas')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'todas'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Todas las Proformas ({proformas.length})
            </button>
          </div>

          {/* Filtro por Ejecutivo */}
          <div className="w-full md:w-64">
            <select
              value={executiveFilter}
              onChange={(e) => setExecutiveFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-200 focus:border-purple-600 outline-none cursor-pointer"
            >
              <option value="todos">Filtrar por Ejecutivo (Todos)</option>
              {MOCK_EXECUTIVES.map((exe) => (
                <option key={exe.id} value={exe.id}>
                  👤 {exe.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input de Búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID Proforma (PF-...), Cliente, RUT o motivo..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl focus:border-purple-600 outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Borrar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Proformas para Aprobación V2 */}
      <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100/90 dark:border-white/10 overflow-hidden shadow-xs">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed text-left border-collapse text-xs">
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[24%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[13%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead>
              <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[11px] font-bold text-gray-600 dark:text-gray-400">
                <th className="py-3.5 px-4">Proforma ID</th>
                <th className="py-3.5 px-3">Nombre o razón social</th>
                <th className="py-3.5 px-3">Fecha y hora última versión</th>
                <th className="py-3.5 px-3">Ejecutivo responsable</th>
                <th className="py-3.5 px-3 text-right">Monto actual</th>
                <th className="py-3.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs text-gray-700 dark:text-gray-300">
              {filteredProformas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      No hay solicitudes de aprobación bajo los filtros seleccionados
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Todas las proformas que requieren V°B° están al día.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProformas.map((proforma) => {
                  const isV2OrMore = (proforma.historialVersiones?.length || 1) >= 2 || proforma.versionActual === 'v2' || proforma.versionActual === 'v3';
                  const isPendingVb = proforma.estadoSupervision === 'Pendiente_Autorizacion' || proforma.estado === 'Pendiente de validación';
                  const lastVersion = proforma.historialVersiones?.[proforma.historialVersiones.length - 1];
                  const prevVersion = proforma.historialVersiones?.[0];
                  const isExpanded = expandedRowIds.has(proforma.id);

                  return (
                    <React.Fragment key={proforma.id}>
                      <tr
                        className={cn(
                          'hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors',
                          isPendingVb && 'bg-amber-50/25 dark:bg-amber-950/10',
                          isExpanded && 'bg-purple-50/30 dark:bg-purple-950/25'
                        )}
                      >
                        {/* Proforma ID */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-xs text-purple-700 dark:text-purple-300">
                                {proforma.id}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 uppercase">
                                {proforma.versionActual || 'v1'}
                              </span>
                            </div>
                            {isPendingVb ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse">
                                <span>⚡ Requiere V°B°</span>
                              </span>
                            ) : proforma.estadoSupervision === 'Autorizada' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Autorizada</span>
                              </span>
                            ) : proforma.estadoSupervision === 'Devuelta_Analista' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                <RotateCcw className="w-3 h-3" />
                                <span>Devuelta</span>
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Nombre o razón social */}
                        <td className="py-3.5 px-3 align-middle">
                          <div className="font-bold text-gray-900 dark:text-white leading-tight truncate" title={proforma.cliente}>
                            {proforma.cliente}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate mt-0.5">
                            RUT: {proforma.rut} {proforma.cuentaCorrienteNombre ? `• ${proforma.cuentaCorrienteNombre}` : ''}
                          </div>
                        </td>

                        {/* Fecha y hora última versión */}
                        <td className="py-3.5 px-3 align-middle">
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-mono text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{lastVersion?.fechaCreacion || proforma.fecha}</span>
                          </div>
                        </td>

                        {/* Ejecutivo responsable */}
                        <td className="py-3.5 px-3 align-middle">
                          <div className="flex items-center gap-1.5 text-gray-900 dark:text-gray-100 font-medium truncate">
                            <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {(proforma.ejecutivoNombre || 'Ana Valenzuela').slice(0, 1)}
                            </div>
                            <span className="truncate">{proforma.ejecutivoNombre || 'Ana Valenzuela'}</span>
                          </div>
                        </td>

                        {/* Monto actual */}
                        <td className="py-3.5 px-3 align-middle text-right">
                          <div className="font-black text-xs text-gray-900 dark:text-white">
                            {proforma.montoFormatted}
                          </div>
                          {isV2OrMore && prevVersion && prevVersion.monto !== proforma.monto && (
                            <div className="text-[10px] text-gray-400 line-through">
                              {formatCurrency(prevVersion.monto)}
                            </div>
                          )}
                        </td>

                        {/* Acciones (solo iconos según especificación) */}
                        <td className="py-3.5 px-3 align-middle text-center">
                          <div className="inline-flex items-center justify-center gap-1">
                            {/* 1. Icono Derivadas / Comparar Versiones (Diff) */}
                            <button
                              type="button"
                              onClick={() => setComparingProforma(proforma)}
                              className="p-1.5 rounded-lg border border-purple-200/80 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-950/70 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer shadow-2xs"
                              title="Comparar Versiones (Diff) / Derivadas"
                            >
                              <GitCompare className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Icono Rechazar (X) */}
                            {isPendingVb ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingProforma(proforma);
                                  setRejectionReason('Inconsistencia en Tarifas / Descuentos');
                                  setRejectionObservations('');
                                }}
                                className="p-1.5 rounded-lg border border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer shadow-2xs"
                                title="Rechazar / Devolver V2 con observaciones"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="p-1.5 rounded-lg border border-gray-100 dark:border-white/5 text-gray-300 dark:text-gray-600 opacity-40 cursor-not-allowed"
                                title="Rechazar no disponible para este estado"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* 3. Icono Aprobar (Ticket / Check V°B°) */}
                            {isPendingVb ? (
                              <button
                                type="button"
                                onClick={() => handleAprobarV2(proforma.id)}
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                                title="Aprobar V2 (Otorgar V°B° de Jefatura)"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            ) : proforma.estadoSupervision === 'Autorizada' ? (
                              <span
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 inline-flex items-center justify-center"
                                title="V°B° ya otorgado"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="p-1.5 rounded-lg border border-gray-100 dark:border-white/5 text-gray-300 dark:text-gray-600 opacity-40 cursor-not-allowed"
                                title="Aprobación no disponible"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            )}

                            {/* 4. Icono Descarga */}
                            <button
                              type="button"
                              onClick={() => handleDescargarProforma(proforma)}
                              className="p-1.5 rounded-lg border border-gray-200/80 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer shadow-2xs"
                              title="Descargar proforma (PDF / Excel)"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* 5. Icono Chevron para desplegar información extendida */}
                            <button
                              type="button"
                              onClick={() => toggleRowExpanded(proforma.id)}
                              className={cn(
                                'p-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs',
                                isExpanded
                                  ? 'bg-purple-100 dark:bg-purple-900/60 border-purple-300 text-purple-700 dark:text-purple-200'
                                  : 'border-gray-200/80 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-white'
                              )}
                              title={isExpanded ? 'Ocultar información detallada' : 'Ver alertas, observaciones y motivo de rechazo'}
                            >
                              <ChevronDown
                                className={cn(
                                  'w-3.5 h-3.5 transition-transform duration-200',
                                  isExpanded && 'rotate-180 text-purple-700 dark:text-purple-200'
                                )}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Fila expandible con el resto de la información */}
                      {isExpanded && (
                        <tr className="bg-purple-50/30 dark:bg-slate-800/40 border-b border-purple-100 dark:border-white/5">
                          <td colSpan={6} className="py-3.5 px-6">
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                              {/* Alertas y Observaciones de Elaboración */}
                              {proforma.alertasElaboracion && proforma.alertasElaboracion.length > 0 && (
                                <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-xl space-y-1">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>Alertas y Observaciones de Elaboración:</span>
                                  </div>
                                  <div className="space-y-0.5 pl-5">
                                    {proforma.alertasElaboracion.map((alerta, idx) => (
                                      <p key={idx} className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                                        • {alerta}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Resumen de Rechazo en Versión 1 */}
                              {isV2OrMore && prevVersion && (
                                <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                      <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                      <span>Motivo Rechazo en Versión 1 (Cliente):</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                                      Monto anterior: <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(prevVersion.monto)}</strong>
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-700 dark:text-gray-300 italic pl-5 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-purple-100/60 dark:border-white/5">
                                    &quot;{prevVersion.motivo || proforma.motivoRechazoPrincipal || 'Discrepancia en tarifario comercial'}&quot;
                                  </p>
                                </div>
                              )}

                              {/* Detalles complementarios */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                                <div className="p-2.5 bg-white/70 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-white/5">
                                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Tipo de Acuerdo:</span>
                                  <span className="text-gray-800 dark:text-gray-200 font-semibold">{proforma.tipoAcuerdo || 'Acuerdo Comercial Estándar'}</span>
                                </div>
                                <div className="p-2.5 bg-white/70 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-white/5">
                                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Cuenta Corriente:</span>
                                  <span className="text-gray-800 dark:text-gray-200 font-mono font-semibold">{proforma.cuentaCorrienteNombre || proforma.cuentaCorrienteId || 'Cuenta Principal'}</span>
                                </div>
                                <div className="p-2.5 bg-white/70 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-white/5">
                                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Estado de Supervisión:</span>
                                  <span className="font-semibold text-purple-700 dark:text-purple-300">
                                    {proforma.estadoSupervision === 'Autorizada'
                                      ? `Autorizada por ${lastVersion?.aprobadoPorSupervisor || 'Jefatura'} (${lastVersion?.fechaSupervision || 'Reciente'})`
                                      : proforma.estadoSupervision === 'Devuelta_Analista'
                                      ? `Devuelta al ejecutivo (${lastVersion?.motivo || 'Observaciones'})`
                                      : 'Pendiente de Autorización / V°B°'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: COMPARADOR DE VERSIONES (DIFF VISUAL v1 vs v2)                     */}
      {/* ========================================================================= */}
      {comparingProforma && (() => {
        const versions = comparingProforma.historialVersiones || [];
        
        // Determinar índice de la versión objetivo (la más reciente o versión actual)
        const targetIndex = versions.length > 1 ? versions.length - 1 : 1;
        // Determinar índice de la versión fuente (la versión inmediatamente anterior)
        const sourceIndex = targetIndex > 0 ? targetIndex - 1 : 0;

        const vSource = versions[sourceIndex] || versions[0];
        const vSourceVersion = vSource?.version || 'v1';
        const vSourceNum = vSource?.numeroVersion || (vSourceVersion === 'v2' ? 2 : vSourceVersion === 'v3' ? 3 : 1);

        const vTarget = versions[targetIndex] || {
          version: (comparingProforma.versionActual && comparingProforma.versionActual !== vSourceVersion)
            ? comparingProforma.versionActual
            : (vSourceVersion === 'v1' ? 'v2' : 'v3'),
          numeroVersion: vSourceVersion === 'v1' ? 2 : 3,
          fechaCreacion: comparingProforma.fecha,
          usuarioResponsable: comparingProforma.ejecutivoNombre,
          motivo: 'Recálculo con tarifas y cubicaje corregido',
          observaciones: 'Versión ajustada tras observaciones del cliente.',
          monto: comparingProforma.monto,
          items: vSource?.items,
        };

        const vTargetVersion = vTarget.version || (comparingProforma.versionActual && comparingProforma.versionActual !== vSourceVersion ? comparingProforma.versionActual : 'v2');
        const vTargetNum = vTarget.numeroVersion || (vTargetVersion === 'v3' ? 3 : vTargetVersion === 'v2' ? 2 : 2);

        const itemsToRender = (vTarget.items && vTarget.items.length > 0) 
          ? vTarget.items 
          : (vSource?.items && vSource.items.length > 0)
          ? vSource.items
          : [];

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-white/10 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Header Modal Diff */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                    <GitCompare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Comparador de Versiones: {comparingProforma.id}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
                        {vSourceVersion} ➔ {vTargetVersion}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cliente: <strong>{comparingProforma.cliente}</strong> (RUT: {comparingProforma.rut}) • Responsable: {comparingProforma.ejecutivoNombre || 'Ana Valenzuela'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setComparingProforma(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comparación de Encabezado / Totales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Versión 1 (Original / Rechazada) */}
                <div className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
                      Versión {vSourceNum} (Rechazada por Cliente)
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      {vSource?.fechaCreacion || '24/08/2026'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-red-900 dark:text-red-200">
                    {formatCurrency(vSource?.monto || comparingProforma.monto)}
                  </div>
                  <div className="text-xs text-red-800/80 dark:text-red-300/80">
                    <strong>Motivo de rechazo:</strong> {vSource?.motivo || comparingProforma.motivoRechazoPrincipal || 'Diferencias tarifarias'}
                  </div>
                  {vSource?.observaciones && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 italic">
                      Obs: {vSource.observaciones}
                    </p>
                  )}
                </div>

                {/* Versión Destino (Ajustada / Nueva) */}
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      Versión {vTargetNum} (Nueva Versión Ajustada)
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      {vTarget.fechaCreacion || new Date().toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                    {formatCurrency(vTarget.monto || comparingProforma.monto)}
                  </div>
                  <div className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    <strong>Ajuste realizado:</strong> {vTarget.motivo || 'Recálculo con tarifas y cubicaje corregido'}
                  </div>
                  {vTarget.observaciones && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 italic">
                      Obs: {vTarget.observaciones}
                    </p>
                  )}
                </div>
              </div>

              {/* Comparador de Cambios por Ítem (Diff Tabla) */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Desglose de Ítems y Modificaciones entre Versiones
                </h3>

                <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100/70 dark:bg-slate-800/70 text-[11px] text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                        <th className="py-2.5 px-3">Código & Concepto</th>
                        <th className="py-2.5 px-3 text-right">Cant.</th>
                        <th className="py-2.5 px-3 text-right">Tarifa {vSourceVersion}</th>
                        <th className="py-2.5 px-3 text-right">Tarifa {vTargetVersion} (Nueva)</th>
                        <th className="py-2.5 px-3 text-right">Total {vSourceVersion}</th>
                        <th className="py-2.5 px-3 text-right">Total {vTargetVersion}</th>
                        <th className="py-2.5 px-3 text-center">Variación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {itemsToRender.map((item) => {
                        const v1Item = vSource?.items?.find((i) => i.codigo === item.codigo);
                        const diff = item.total - (v1Item?.total || item.total);
                        return (
                          <tr key={item.id} className={item.ajustadoEnV2 ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
                            <td className="py-2.5 px-3 font-medium">
                              <span className="font-mono text-purple-700 dark:text-purple-300 mr-1.5 font-bold">
                                {item.codigo}
                              </span>
                              {item.descripcion}
                              {item.ajustadoEnV2 && (
                                <span className="ml-2 px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] font-bold rounded">
                                  Modificado
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">{item.cantidad}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-gray-500">
                              {formatCurrency(v1Item?.tarifaBase || item.tarifaBase)} ({v1Item?.descuentoPct || 0}%)
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                              {formatCurrency(item.tarifaBase)} ({item.descuentoPct}%)
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-gray-500">
                              {formatCurrency(v1Item?.total || item.total)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {diff === 0 ? (
                                <span className="text-gray-400 font-mono text-[11px]">—</span>
                              ) : diff < 0 ? (
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                                  {formatCurrency(diff)}
                                </span>
                              ) : (
                                <span className="font-bold text-red-600 dark:text-red-400 font-mono text-[11px]">
                                  +{formatCurrency(diff)}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botones de Aprobación / Rechazo desde el Modal */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  onClick={() => setComparingProforma(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar Comparador
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRejectingProforma(comparingProforma);
                      setRejectionReason('Inconsistencia en Tarifas / Descuentos');
                      setRejectionObservations('');
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 font-bold text-xs rounded-xl border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar Versión {vTargetNum}</span>
                  </button>

                  <button
                    onClick={() => handleAprobarV2(comparingProforma.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar Versión {vTargetNum} (V°B° Jefatura)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: RECHAZAR / DEVOLVER PROFORMA V2 CON REGISTRO DE MOTIVO              */}
      {/* ========================================================================= */}
      {rejectingProforma && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 flex items-center justify-center font-bold">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Rechazar y Devolver Proforma V2
                  </h3>
                  <p className="text-xs text-gray-500">
                    {rejectingProforma.id} • {rejectingProforma.cliente}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectingProforma(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRechazoV2} className="space-y-4">
              {/* Motivo de Rechazo Principal */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Motivo de Rechazo / Corrección: *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none cursor-pointer font-medium"
                >
                  <option value="Inconsistencia en Tarifas / Descuentos">Inconsistencia en Tarifas / Descuentos</option>
                  <option value="Diferencia en recubitaje / medidas de SKUs">Diferencia en recubitaje / medidas de SKUs</option>
                  <option value="Error en la selección de Cuentas Corrientes">Error en la selección de Cuentas Corrientes</option>
                  <option value="Falta de Respaldo de Orden de Compra">Falta de Respaldo de Orden de Compra</option>
                  <option value="Requiere Derivación a Negociación KAM">Requiere Derivación a Negociación KAM</option>
                  <option value="Otro Motivo Operacional">Otro Motivo Operacional</option>
                </select>
              </div>

              {/* Observaciones Obligatorias */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Observaciones Detalladas para el Ejecutivo ({rejectingProforma.ejecutivoNombre}): *
                </label>
                <textarea
                  value={rejectionObservations}
                  onChange={(e) => setRejectionObservations(e.target.value)}
                  required
                  placeholder="Detalla qué correcciones debe aplicar el ejecutivo antes de volver a solicitar V°B°..."
                  rows={4}
                  className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none resize-none"
                />
              </div>

              {/* Botones de confirmación */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingProforma(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!rejectionObservations.trim()}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Confirmar Rechazo y Devolver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
