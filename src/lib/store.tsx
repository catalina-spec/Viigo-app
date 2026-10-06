'use client';

// Estado de la app. Se carga desde Supabase al entrar y cada cambio se guarda solo (ver lib/data.ts).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type * as D from './demo-data';
import * as DEMO from './demo-data';
import { hrefFor, type Role } from './tabs';
import { calcDefault, type CalcParams, type RouteResult } from './calc';
import type { Me } from './supabase/server';
import { createClient } from './supabase/client';
import { loadCliente, loadInicial, savePlanilla, sync, toCita } from './data';

export type ClienteItem = { id: string; nombre: string; apellido: string; email: string; mio: boolean };

export type State = {
  me: Me;
  loading: boolean;
  clienteId: string | null;
  clientes: ClienteItem[];
  P: D.Profile;
  adv: D.Advisor;
  consent: boolean;
  dur: string;
  grantedUntil: string | null;
  grantedUntilISO: string | null;
  route: { result: RouteResult; date: string } | null;
  draftMsg: string;
  calc: CalcParams;
  log: { t: string; x: string }[];
  msgs: D.Msg[];
  proxima: D.Meeting | null;
  meetings: D.Meeting[];
  draft: { resumen: string; acuerdos: string; objs: { x: string; act: boolean }[] };
  objetivos: D.Objetivo[];
  pendientes: D.Pendiente[];
  alts: D.Alternativa[];
  F: Record<string, number>;
  debts: D.Debt[];
  citas: D.Cita[];
  /** Asesor: correo de Google conectado para Calendar/Meet, o null. */
  google: string | null;
  finTab: string;
  sesion: number;
};

const empty = (me: Me): State => ({
  me, loading: true, clienteId: null, clientes: [],
  P: { nombre: '', apellido: '', mail: me.email, cel: '', edad: 30, retiro: 65, etapa: 'start', ingresoJub: 0, afp: '', foto: null },
  adv: { id: null, name: 'Tu asesor VIIGO', first: 'tu asesor', role: 'Asesor VIIGO · Viel.cl', phone: '', wa: '', mail: '', photo: null },
  consent: false, dur: '30', grantedUntil: null, grantedUntilISO: null, route: null, draftMsg: '',
  calc: calcDefault(30), log: [], msgs: [], proxima: null, meetings: [],
  draft: { resumen: '', acuerdos: '', objs: [] }, objetivos: [], pendientes: [], alts: [], F: {}, debts: [], citas: [], google: null,
  finTab: 'patrimonio', sesion: 1,
});

type Ctx = {
  s: State;
  /** Modifica una copia del estado; los cambios se guardan solos en Supabase. */
  up: (fn: (d: State) => void) => void;
  toast: (t: string) => void;
  toastText: string | null;
  /** Asesor: cambia el cliente que está viendo. */
  elegirCliente: (id: string) => Promise<void>;
  /** Llama una función de la base de datos (p. ej. registrar que el asesor abrió la planilla). */
  rpc: (fn: string, args: Record<string, unknown>) => Promise<void>;
  /** true en la vista demo (/demo): datos de ejemplo, no se guarda nada. */
  demo: boolean;
  /** Dirección de una sección, respetando si estamos en /demo. */
  href: (role: Role, id: string) => string;
};

const StoreCtx = createContext<Ctx | null>(null);

/** Datos de ejemplo de la vista demo (Andrés y su asesora Catalina). */
function demoState(me: Me): State {
  const en = (dias: number, h: number) => { const d = new Date(); d.setDate(d.getDate() + dias); d.setHours(h, 0, 0, 0); return d.toISOString(); };
  const rev = DEMO.MEETINGS.find((m) => m.status === 'revision')!;
  const proxima: D.Meeting = { ...DEMO.MEETINGS[0], id: 'demo-proxima', status: 'agendada', inicio: en(3, 18), meet: null, sesion: 4, title: 'Sesión 4 · Proyección a 65 con la Calculadora VIIGO', resumen: '', obj: [], acuerdos: [], next: '' };
  return {
    ...empty(me), loading: false, clienteId: 'demo',
    clientes: [{ id: 'demo', nombre: 'Andrés', apellido: 'Muñoz', email: DEMO.PROFILE.mail, mio: true }],
    P: { ...DEMO.PROFILE, id: 'demo', creado: '2026-08-01T12:00:00Z' },
    adv: { ...DEMO.ADV, id: 'demo-adv', nombre: 'Catalina', apellido: 'Viel' },
    log: [{ t: '23 sep, 18:42', x: 'Andrés actualizó su planilla financiera.' }],
    msgs: DEMO.MSGS, meetings: DEMO.MEETINGS, proxima,
    draft: { resumen: rev.resumen, acuerdos: rev.acuerdos.join('\n'), objs: rev.obj.map((x) => ({ x, act: true })) },
    objetivos: DEMO.OBJETIVOS, pendientes: DEMO.PENDIENTES, alts: DEMO.ALTS, F: DEMO.FIN_VALUES, debts: DEMO.DEBTS,
    citas: DEMO.CITAS.map((c, i) => {
      const inicio = i === 0 ? proxima.inicio! : en(i + 3, 10 + 2 * i);
      return { ...toCita({ id: c.id, cliente_id: 'demo', inicio, sesion: c.ses, meet_url: null, calendar_event_id: 'demo' }), cliente: c.cliente };
    }),
    google: 'catalina@viel.cl', sesion: 4, calc: calcDefault(DEMO.PROFILE.edad),
  };
}

export function StoreProvider({ me, demo = false, children }: { me: Me; demo?: boolean; children: ReactNode }) {
  const sb = useMemo(() => createClient(), []);
  const [s, setS] = useState<State>(() => (demo ? demoState(me) : empty(me)));
  const href = useCallback((role: Role, id: string) => (demo ? '/demo' : '') + hrefFor(role, id), [demo]);
  const [toastText, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const synced = useRef<State | null>(null); // último estado ya guardado
  const planTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((t: string) => {
    setToast(t);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  /** Reemplaza el estado con datos recién cargados (sin volver a guardarlos). */
  const load = useCallback((patch: Partial<State>) => {
    setS((prev) => {
      const next = { ...prev, ...patch, loading: false };
      synced.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (demo) return; // la demo no lee ni guarda en la base de datos
    loadInicial(sb, me).then(load).catch((e) => {
      console.error(e);
      load({});
      toast('No pudimos cargar tus datos. Recarga la página.');
    });
  }, [sb, me, load, toast, demo]);

  // Guarda automáticamente cada cambio.
  useEffect(() => {
    const prev = synced.current;
    if (!prev || prev === s || s.loading) return;
    synced.current = s;
    if (prev.clienteId !== s.clienteId) return;
    sync(sb, me, prev, s).then((err) => err && toast(err));
    if (me.rol === 'cliente' && s.clienteId && (JSON.stringify(prev.F) !== JSON.stringify(s.F) || JSON.stringify(prev.debts) !== JSON.stringify(s.debts))) {
      if (planTimer.current) clearTimeout(planTimer.current);
      const { F, debts, clienteId } = s;
      planTimer.current = setTimeout(() => savePlanilla(sb, clienteId, F, debts).then((err) => err && toast(err)), 800);
    }
  }, [s, sb, me, toast]);

  const up = useCallback((fn: (d: State) => void) => {
    setS((prev) => {
      const d = structuredClone(prev);
      fn(d);
      return d;
    });
  }, []);

  const elegirCliente = useCallback(async (id: string) => {
    try { localStorage.setItem('viigo_cliente', id); } catch {}
    setS((prev) => ({ ...prev, loading: true }));
    try {
      load(await loadCliente(sb, me, id));
    } catch (e) {
      console.error(e);
      load({});
      toast('No pudimos cargar ese cliente.');
    }
  }, [sb, me, load, toast]);

  const rpc = useCallback(async (fn: string, args: Record<string, unknown>) => {
    if (demo) return;
    const { error } = await sb.rpc(fn, args);
    if (error) console.error(fn, error);
  }, [sb, demo]);

  return <StoreCtx.Provider value={{ s, up, toast, toastText, elegirCliente: demo ? async () => {} : elegirCliente, rpc, demo, href }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return c;
}

/** Nombre corto del cliente que se está viendo (para textos del asesor). */
export const nombreCliente = (s: State) => s.P.nombre || 'tu cliente';
