'use client';

// Estado de la app. Se carga desde Supabase al entrar y cada cambio se guarda solo (ver lib/data.ts).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type * as D from './demo-data';
import * as DEMO from './demo-data';
import { hrefFor, type Role } from './tabs';
import { PROGRAMA_BASE, type SesionApp } from './programa';
import { calcDefault, type CalcParams, type RouteResult } from './calc';
import type { Me } from './supabase/server';
import { createClient } from './supabase/client';
import { loadCliente, loadInicial, savePlanilla, sync, toCita } from './data';

export type ClienteItem = { id: string; nombre: string; apellido: string; email: string; mio: boolean; plan?: D.Plan };

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
  /** Contenido de las 4 sesiones (base + lo editado en la app). */
  programa: SesionApp[];
  /** El asesor conectado puede editar el programa. */
  puedeEditar: boolean;
  /** Moneda en que se ven e ingresan los montos (perfil y planilla). */
  moneda: 'clp' | 'uf';
  finTab: string;
  sesion: number;
};

const empty = (me: Me): State => ({
  me, loading: true, clienteId: null, clientes: [],
  P: { nombre: '', apellido: '', mail: me.email, cel: '', edad: 30, retiro: 65, etapa: 'start', ingresoJub: 0, afp: '', foto: null },
  adv: { id: null, name: 'Tu asesor VIIGO', first: 'tu asesor', role: 'Asesor VIIGO · Viel.cl', phone: '', wa: '', mail: '', photo: null },
  consent: false, dur: '30', grantedUntil: null, grantedUntilISO: null, route: null, draftMsg: '',
  calc: calcDefault(0), log: [], msgs: [], proxima: null, meetings: [],
  draft: { resumen: '', acuerdos: '', objs: [] }, objetivos: [], pendientes: [], alts: [], F: {}, debts: [], citas: [], google: null, programa: PROGRAMA_BASE, puedeEditar: false, moneda: 'clp',
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
  /** Vuelve a leer los datos desde la base de datos (sin perder lo que se está escribiendo). */
  refrescar: () => Promise<void>;
  /** Llama una función de la base de datos (p. ej. registrar que el asesor abrió la planilla). */
  rpc: (fn: string, args: Record<string, unknown>) => Promise<void>;
  /** true en la vista demo (/demo): datos de ejemplo, no se guarda nada. */
  demo: boolean;
  /** El cliente acepta los términos y condiciones (se guarda en su perfil). */
  aceptarTerminos: (version: string) => Promise<string | null>;
  /** Guarda el contenido de una sesión (editores). Devuelve un error o null. */
  guardarSesion: (ses: SesionApp) => Promise<string | null>;
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
    clientes: [{ id: 'demo', nombre: 'Andrés', apellido: 'Muñoz', email: DEMO.PROFILE.mail, mio: true, plan: 'programa' }],
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
    google: 'catalina@viel.cl', puedeEditar: true, sesion: 4, calc: calcDefault(DEMO.PROFILE.edad),
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

  // Moneda preferida guardada en este dispositivo.
  useEffect(() => {
    let m: string | null = null;
    try { m = localStorage.getItem('viigo_moneda'); } catch {}
    if (m !== 'uf') return;
    const t = setTimeout(() => setS((prev) => ({ ...prev, moneda: 'uf' })), 0);
    return () => clearTimeout(t);
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
      planTimer.current = setTimeout(() => {
        planTimer.current = null;
        savePlanilla(sb, clienteId, F, debts).then((err) => err && toast(err));
      }, 800);
    }
  }, [s, sb, me, toast]);

  const up = useCallback((fn: (d: State) => void) => {
    setS((prev) => {
      const d = structuredClone(prev);
      fn(d);
      return d;
    });
  }, []);

  // ───────── Actualización automática ─────────
  // Trae los cambios que hicieron otras personas (p. ej. el cliente aceptó su ruta) sin borrar
  // lo que se está escribiendo en este momento (borradores, calculadora, mensajes sin enviar).
  const refrescando = useRef(false);
  const refrescar = useCallback(async () => {
    if (demo || refrescando.current || planTimer.current) return;
    refrescando.current = true;
    try {
      const datos = await loadInicial(sb, me);
      setS((prev) => {
        if (prev.loading) return prev;
        const locales = { draft: prev.draft, draftMsg: prev.draftMsg, calc: prev.calc, finTab: prev.finTab, sesion: prev.sesion, moneda: prev.moneda };
        // Si el asesor cambió de cliente mientras se cargaba, no mezclar datos.
        if (me.rol === 'asesor' && datos.clienteId !== prev.clienteId) return prev;
        const next = { ...prev, ...datos, ...locales, loading: false };
        synced.current = next;
        return next;
      });
    } catch (e) {
      console.error('refrescar', e);
    } finally {
      refrescando.current = false;
    }
  }, [sb, me, demo]);

  useEffect(() => {
    if (demo) return;
    const alVolver = () => { if (document.visibilityState === 'visible') refrescar(); };
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', alVolver);
    const t = setInterval(alVolver, 60_000);
    return () => {
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', alVolver);
      clearInterval(t);
    };
  }, [demo, refrescar]);

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

  const guardarSesion = useCallback(async (ses: SesionApp) => {
    if (!demo) {
      const { error } = await sb.from('programa_sesiones').upsert({ n: ses.n, data: ses, actualizado_en: new Date().toISOString() });
      if (error) { console.error(error); return 'No se pudo guardar la sesión. Revisa tu conexión.'; }
    }
    const apply = (prev: State) => ({ ...prev, programa: prev.programa.map((x) => (x.n === ses.n ? ses : x)) });
    setS((prev) => { const next = apply(prev); if (synced.current) synced.current = apply(synced.current); return next; });
    return null;
  }, [sb, demo]);

  const aceptarTerminos = useCallback(async (version: string) => {
    if (!demo) {
      const { error } = await sb.from('perfiles').update({ terminos_version: version, terminos_aceptados_en: new Date().toISOString() }).eq('id', me.id);
      if (error) { console.error(error); return 'No pudimos guardar tu aceptación. Revisa tu conexión e inténtalo de nuevo.'; }
    }
    const apply = (prev: State) => ({ ...prev, P: { ...prev.P, terminos: version } });
    setS((prev) => { const next = apply(prev); if (synced.current) synced.current = apply(synced.current); return next; });
    return null;
  }, [sb, demo, me.id]);

  return <StoreCtx.Provider value={{ s, up, toast, toastText, elegirCliente: demo ? async () => {} : elegirCliente, refrescar, rpc, demo, href, guardarSesion, aceptarTerminos }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return c;
}

/** Nombre corto del cliente que se está viendo (para textos del asesor). */
export const nombreCliente = (s: State) => s.P.nombre || 'tu cliente';
