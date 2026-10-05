// Valor UF de referencia. Más adelante se actualizará a diario desde una API (mindicador.cl).
export const UF = 38500;

export const clp = (v: number) => '$' + Math.round(v || 0).toLocaleString('es-CL');
export const ufs = (v: number) => 'UF ' + Math.round(v || 0).toLocaleString('es-CL');
export const pct = (v: number) => (Math.round(v * 1000) / 10).toLocaleString('es-CL') + '%';

export function nowStr() {
  const d = new Date();
  return (
    d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) +
    ', ' +
    d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  );
}

export const initials = (n: string) =>
  n
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
