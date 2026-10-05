'use client';

// Estado de la app en modo demo (vive en el navegador).
// Cuando conectemos Supabase, cada cambio se guardará en la base de datos.

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import * as D from './demo-data';
import type { CalcParams, RouteResult } from './calc';

export type State = {
  P: D.Profile;
  adv: D.Advisor;
  consent: boolean;
  dur: string;
  grantedUntil: string | null;
  route: { result: RouteResult; date: string } | null;
  draftMsg: string;
  calc: CalcParams;
  log: { t: string; x: string }[];
  msgs: D.Msg[];
  meetings: D.Meeting[];
  draft: { resumen: string; acuerdos: string; objs: { x: string; act: boolean }[] };
  objetivos: D.Objetivo[];
  pendientes: D.Pendiente[];
  alts: D.Alternativa[];
  F: Record<string, number>;
  debts: D.Debt[];
  citas: D.Cita[];
  finTab: string;
  sesion: number;
};

const review = D.MEETINGS.find((m) => m.status === 'revision')!;

const initialState: State = {
  P: D.PROFILE,
  adv: D.ADV,
  consent: false,
  dur: '30',
  grantedUntil: null,
  route: null,
  draftMsg: '',
  calc: { precio: 3200, pie: 20, tasa: 4.5, plazo: 25 },
  log: [{ t: '23 sep, 18:42', x: 'Andrés actualizó su planilla financiera.' }],
  msgs: D.MSGS,
  meetings: D.MEETINGS,
  draft: { resumen: review.resumen, acuerdos: review.acuerdos.join('\n'), objs: review.obj.map((x) => ({ x, act: true })) },
  objetivos: D.OBJETIVOS,
  pendientes: D.PENDIENTES,
  alts: D.ALTS,
  F: D.FIN_VALUES,
  debts: D.DEBTS,
  citas: D.CITAS,
  finTab: 'patrimonio',
  sesion: 4,
};

type Ctx = {
  s: State;
  /** Modifica una copia del estado y la guarda. */
  up: (fn: (d: State) => void) => void;
  toast: (t: string) => void;
  toastText: string | null;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(initialState);
  const [toastText, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const up = useCallback((fn: (d: State) => void) => {
    setS((prev) => {
      const d = structuredClone(prev);
      fn(d);
      return d;
    });
  }, []);

  const toast = useCallback((t: string) => {
    setToast(t);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  return <StoreCtx.Provider value={{ s, up, toast, toastText }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return c;
}
