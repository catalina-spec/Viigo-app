'use client';

// Casilla de montos con puntos de miles (1.850.000) o UF con decimales (3.200,5),
// y el selector "$ Pesos | UF" que comparten el perfil y la planilla financiera.

import { useEffect, useRef, useState } from 'react';
import { UF } from '@/lib/format';
import { useStore } from '@/lib/store';

export type Moneda = 'clp' | 'uf';

/** Convierte un valor guardado en su unidad (clp o uf) a la moneda que se está viendo. */
export const aVista = (v: number, unidad: Moneda, vista: Moneda) =>
  !v ? 0 : unidad === vista ? v : vista === 'uf' ? v / UF : v * UF;
/** Convierte lo escrito en la moneda que se está viendo a la unidad en que se guarda. */
export const aUnidad = (v: number, unidad: Moneda, vista: Moneda) => {
  const r = unidad === vista ? v : unidad === 'uf' ? v / UF : v * UF;
  return unidad === 'clp' ? Math.round(r) : Math.round(r * 100) / 100;
};

const formatear = (v: number, m: Moneda) =>
  !v && v !== 0 ? '' : m === 'clp' ? Math.round(v).toLocaleString('es-CL') : v.toLocaleString('es-CL', { maximumFractionDigits: 2 });

/** Da formato mientras se escribe: puntos de miles y, en UF, hasta 2 decimales con coma. */
function formatearTexto(t: string, m: Moneda) {
  if (m === 'clp') {
    const d = t.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    return d ? Number(d).toLocaleString('es-CL') : '';
  }
  const limpio = t.replace(/[^\d,]/g, '');
  const [ent, ...resto] = limpio.split(',');
  const e = ent.replace(/^0+(?=\d)/, '');
  const entFmt = e ? Number(e).toLocaleString('es-CL') : resto.length ? '0' : '';
  return resto.length ? `${entFmt},${resto.join('').slice(0, 2)}` : entFmt;
}
const leer = (t: string, m: Moneda) => {
  if (!t) return 0;
  const n = m === 'clp' ? Number(t.replace(/\D/g, '')) : Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

export function MontoInput({ value, onValue, moneda, id, ariaLabel, placeholder, disabled, style }: {
  value: number; onValue: (n: number) => void; moneda: Moneda;
  id?: string; ariaLabel?: string; placeholder?: string; disabled?: boolean; style?: React.CSSProperties;
}) {
  const [txt, setTxt] = useState(() => (value ? formatear(value, moneda) : ''));
  const editando = useRef(false);
  // Si el valor cambia desde afuera (otra moneda, importar Excel), se vuelve a mostrar con formato.
  useEffect(() => {
    if (!editando.current) setTxt(value ? formatear(value, moneda) : '');
  }, [value, moneda]);
  return (
    <input
      id={id} aria-label={ariaLabel} disabled={disabled} style={style}
      type="text" inputMode={moneda === 'uf' ? 'decimal' : 'numeric'} autoComplete="off"
      placeholder={placeholder ?? (moneda === 'uf' ? 'UF' : '$')}
      value={txt}
      onFocus={() => { editando.current = true; }}
      onBlur={() => { editando.current = false; setTxt(value ? formatear(value, moneda) : ''); }}
      onChange={(e) => { const f = formatearTexto(e.target.value, moneda); setTxt(f); onValue(leer(f, moneda)); }}
    />
  );
}

/** Selector "$ Pesos | UF" (la elección se recuerda en este dispositivo). */
export function MonedaToggle() {
  const { s, up } = useStore();
  const elegir = (m: Moneda) => {
    up((d) => { d.moneda = m; });
    try { localStorage.setItem('viigo_moneda', m); } catch {}
  };
  return (
    <div className="seg moneda" role="group" aria-label="Moneda de los montos">
      <button type="button" aria-pressed={s.moneda === 'clp'} onClick={() => elegir('clp')}>$ Pesos</button>
      <button type="button" aria-pressed={s.moneda === 'uf'} onClick={() => elegir('uf')}>UF</button>
    </div>
  );
}
