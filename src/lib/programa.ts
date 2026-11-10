// Contenido editable del programa de 4 sesiones (solo asesores).
// Los textos base están en demo-data.ts (SESIONES); lo que un editor guarda en la app
// queda en la tabla programa_sesiones y reemplaza la versión base de esa semana.

import { SESIONES, type Sesion } from './demo-data';

export type Lamina = { titulo: string; link: string };
export type SesionApp = Omit<Sesion, 'laminas'> & { laminas: Lamina[]; presentacion: string };

export const normalizar = (s: Sesion | SesionApp): SesionApp => ({
  ...s,
  laminas: s.laminas.map((l) => (typeof l === 'string' ? { titulo: l, link: '' } : { titulo: l.titulo ?? '', link: l.link ?? '' })),
  presentacion: 'presentacion' in s ? s.presentacion ?? '' : '',
});

export const PROGRAMA_BASE: SesionApp[] = SESIONES.map(normalizar);

/** Combina la versión base con lo guardado en la base de datos. */
export function combinar(filas: { n: number; data: SesionApp }[] | null | undefined): SesionApp[] {
  return PROGRAMA_BASE.map((base) => {
    const f = filas?.find((x) => x.n === base.n);
    // Una versión del diagnóstico guardada antes del guion con precalificación (3 señales y 3 salidas)
    // queda obsoleta: se muestra el guion nuevo. Lo que se guarde desde ahora sí se respeta.
    // (Se conserva el link de la presentación que se había guardado.)
    if (f && base.precal && !f.data.precal) return { ...base, presentacion: f.data.presentacion ?? '' };
    return f ? normalizar({ ...base, ...f.data, n: base.n }) : base;
  });
}
