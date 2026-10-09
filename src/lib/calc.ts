import { UF } from './format';
import type { Debt } from './demo-data';

/* Matriz de Análisis Financiero: totales */
export type FinTotals = Record<
  'liq' | 'noliq' | 'ingF' | 'ingV' | 'gF' | 'gV' | 'deuda' | 'cuotas' | 'ing' | 'egr' | 'flujo' | 'brutos' | 'neto' | 'ratio' | 'cap' | 'pctA' | 'anual' | 'pie',
  number
>;

export function finTotals(F: Record<string, number>, debts: Debt[]): FinTotals {
  const g = (k: string) => +F[k] || 0;
  const u = (k: string) => g(k) * UF;
  const liq = g('cc') + g('dap') + u('dapuf') + g('icp') + u('icpuf') + g('oliq');
  const noliq = u('prop') + g('veh') + g('oacc') + u('oaccuf') + g('onoliq');
  const ingF = g('sue1') + g('sue2') + g('arrR') + g('pens') + g('oif');
  const ingV = g('bon') + g('divi') + g('oiv');
  const gF = ['gdiv', 'garr', 'serv', 'edu', 'sal', 'trans', 'ccons', 'seg', 'ogf'].reduce((a, k) => a + g(k), 0);
  const gV = ['alim', 'rest', 'entr', 'vest', 'vac', 'ogv'].reduce((a, k) => a + g(k), 0);
  const deuda = debts.reduce((a, d) => a + (+d.saldo || 0), 0);
  const cuotas = debts.reduce((a, d) => a + (+d.cuota || 0), 0);
  const ing = ingF + ingV, egr = gF + gV, flujo = ing - egr - cuotas, brutos = liq + noliq, neto = brutos - deuda;
  const ratio = ing ? cuotas / ing : 0, cap = Math.max(0, flujo);
  return { liq, noliq, ingF, ingV, gF, gV, deuda, cuotas, ing, egr, flujo, brutos, neto, ratio, cap, pctA: ing ? cap / ing : 0, anual: cap * 12, pie: neto * 0.1 };
}

/* ═══════════ Calculadora VIIGO (motor original) ═══════════
   Mismas reglas que la "Calculadora VIIGO" de Catalina:
   ciclos de 7 años, jubilación a los 65, plusvalía 1% anual, arriendo al 90% de ocupación,
   pie de cada salto 20% / 25% / 30%, y créditos siguientes a 20 años con la misma tasa. */

export const JUBILACION = 65;
const PLUSVALIA = 0.01;

export type Fase = { k: 'start' | 'grow' | 'equity' | 'legacy'; l: string; emoji: string; pieNext: number | null; arr: number; desc: string };
export const FASES: Fase[] = [
  { k: 'start', l: 'VIIGO START', emoji: '🌱', pieNext: 0.2, arr: 0.045, desc: '27–35 años · Primera propiedad' },
  { k: 'grow', l: 'VIIGO GROW', emoji: '📈', pieNext: 0.25, arr: 0.06, desc: '35–43 años · Primer upgrade' },
  { k: 'equity', l: 'VIIGO EQUITY', emoji: '💰', pieNext: 0.3, arr: 0.06, desc: '43–49 años · Flujo positivo' },
  { k: 'legacy', l: 'VIIGO LEGACY', emoji: '🏆', pieNext: null, arr: 0.06, desc: '49–65 años · Propiedad final' },
];
export const faseDe = (edad: number) => (edad < 35 ? 0 : edad < 43 ? 1 : edad < 49 ? 2 : 3);

/** Dividendo mensual. tasa = % anual, plazo en meses. */
export function dividendo(credito: number, tasa: number, plazo: number) {
  const r = tasa / 12 / 100;
  return r === 0 ? credito / plazo : (credito * r) / (1 - Math.pow(1 + r, -plazo));
}
/** Saldo de la deuda después de `mes` meses. */
export function saldoDeuda(credito: number, tasa: number, plazo: number, mes: number) {
  if (mes >= plazo) return 0;
  const r = tasa / 12 / 100;
  if (r === 0) return credito * (1 - mes / plazo);
  return (dividendo(credito, tasa, plazo) * (1 - Math.pow(1 + r, -(plazo - mes)))) / r;
}

/** Datos de entrada: edad, precio y pie en UF, tasa anual %, plazo en meses. */
export type CalcParams = { edad: number; precio: number; pie: number; tasa: number; plazo: number };

export type Tramo = {
  fase: Fase; edadEntra: number; edadSale: number; years: number; precio: number; pie: number; credito: number;
  divMens: number; arrMens: number; flujoMens: number; valorVenta: number; saldo: number; capitalRecibido: number;
  esFinal: boolean; tasa: number; plazo: number;
};

export type RouteResult = {
  v: 2; params: CalcParams; faseInicial: number; ruta: Tramo[];
  p1: { credito: number; div: number; arr: number; flujo: number; piePct: number };
  valJub: number; saldoJub: number; patrimonio: number; ingreso: number; arrFinal: number; yrsRestantes: number;
  /** Plata puesta por el cliente: pie inicial + déficits mensuales (UF). */
  invertido: number; mult: number; grafico: { label: string; valor: number; patrimonio: number }[];
};

/** Valida los datos; devuelve un mensaje de error o null. */
export function validar(p: CalcParams): string | null {
  if (!(p.edad >= 18)) return 'Ingresa una edad válida.';
  if (p.edad >= JUBILACION) return 'La edad debe ser menor a 65 años.';
  if (!(p.precio > 0)) return 'Ingresa el precio de la propiedad.';
  if (p.pie >= p.precio) return 'El pie no puede ser mayor o igual al precio.';
  if (p.pie / p.precio < 0.1) return 'El pie mínimo recomendado es 10% del precio.';
  if (!(p.tasa > 0)) return 'Ingresa la tasa del crédito.';
  if (!(p.plazo > 0)) return 'Elige el plazo del crédito.';
  return null;
}

export function calcRoute(p: CalcParams): RouteResult {
  const faseIdx = faseDe(p.edad);
  const ruta: Tramo[] = [];
  let edad = p.edad, precio = p.precio, pie = p.pie, tasa = p.tasa, plazo = p.plazo;
  for (let i = 0; faseIdx + i < 4; i++) {
    const fi = faseIdx + i, fase = FASES[fi];
    const esFinal = fi === 3 || edad + 7 >= JUBILACION;
    const edadSale = esFinal ? JUBILACION : edad + 7, years = edadSale - edad, credito = precio - pie;
    const divMens = dividendo(credito, tasa, plazo), arrMens = (precio * fase.arr * 0.9) / 12;
    const valorVenta = precio * Math.pow(1 + PLUSVALIA, years), saldo = saldoDeuda(credito, tasa, plazo, years * 12);
    ruta.push({ fase, edadEntra: edad, edadSale, years, precio, pie, credito, divMens, arrMens, flujoMens: arrMens - divMens, valorVenta, saldo, capitalRecibido: valorVenta - saldo, esFinal, tasa, plazo });
    if (esFinal) break;
    edad = edadSale;
    const nf = FASES[Math.min(fi + 1, 3)];
    pie = valorVenta - saldo;
    precio = pie / (nf.pieNext || 0.25);
    tasa = p.tasa;
    plazo = 240;
  }
  const u = ruta[ruta.length - 1];
  const valJub = u.precio * Math.pow(1 + PLUSVALIA, u.years);
  const saldoJub = saldoDeuda(u.credito, u.tasa, u.plazo, u.years * 12);
  const patrimonio = valJub - saldoJub;
  const deficit = ruta.reduce((a, r) => a + (r.flujoMens < 0 ? Math.abs(r.flujoMens) * r.years * 12 : 0), 0);
  const invertido = p.pie + deficit;
  const r0 = ruta[0];
  return {
    v: 2, params: p, faseInicial: faseIdx, ruta,
    p1: { credito: r0.credito, div: r0.divMens, arr: r0.arrMens, flujo: r0.flujoMens, piePct: Math.round((p.pie / p.precio) * 100) },
    valJub, saldoJub, patrimonio, ingreso: u.flujoMens, arrFinal: u.arrMens,
    yrsRestantes: saldoJub > 0 ? Math.ceil((u.plazo - u.years * 12) / 12) : 0,
    invertido, mult: invertido > 0 ? Math.round(patrimonio / invertido) : 0,
    grafico: [
      ...ruta.map((r) => ({ label: `${r.fase.l.replace('VIIGO ', '')} ${r.edadEntra}→${r.edadSale}`, valor: r.valorVenta, patrimonio: r.valorVenta - r.saldo })),
      { label: `Jubilación ${JUBILACION}`, valor: valJub, patrimonio },
    ],
  };
}

/** ¿Es una ruta guardada con el motor actual? (las antiguas se piden aceptar de nuevo) */
export const esRutaVigente = (r: unknown): r is RouteResult => !!r && (r as RouteResult).v === 2;

/** Calculadora vacía (sin valores predeterminados); solo la edad viene del perfil si se conoce. */
export const calcDefault = (edad: number): CalcParams => ({ edad: edad || 0, precio: 0, pie: 0, tasa: 0, plazo: 0 });
