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

/* Calculadora VIIGO: ruta por ciclos de 8 años */
export type Phase = { k: 'start' | 'grow' | 'equity' | 'legacy'; l: string; pie: number; arr: number };
export const PH: Phase[] = [
  { k: 'start', l: 'VIIGO START', pie: 0.2, arr: 0.05 },
  { k: 'grow', l: 'VIIGO GROW', pie: 0.2, arr: 0.06 },
  { k: 'equity', l: 'VIIGO EQUITY', pie: 0.25, arr: 0.06 },
  { k: 'legacy', l: 'VIIGO LEGACY', pie: 0.4, arr: 0.06 },
];
const phaseOf = (a: number) => (a < 35 ? 0 : a < 43 ? 1 : a < 49 ? 2 : 3);

export function pmt(c: number, t: number, n: number) {
  const r = t / 1200;
  return r ? (c * r) / (1 - Math.pow(1 + r, -n)) : c / n;
}
export function saldo(c: number, t: number, n: number, k: number) {
  if (k >= n) return 0;
  const r = t / 1200;
  if (!r) return c * (1 - k / n);
  return (pmt(c, t, n) * (1 - Math.pow(1 + r, -(n - k)))) / r;
}

export type CalcParams = { precio: number; pie: number; tasa: number; plazo: number };
export type RouteStep = { ph: Phase; a0: number; a1: number | null; price: number; pie: number; div: number; arr: number; flujo: number; cap: number | null; final: boolean };
export type RouteResult = {
  steps: RouteStep[]; cycles: number; retiro: number; val: number; sal: number; neto: number;
  ingreso: number; arrFull: number; pagada: number; params: CalcParams & { edad: number };
};

export function calcRoute(edadIn: number, retiroIn: number, c: CalcParams): RouteResult {
  const edad = +edadIn, retiro = +retiroIn || 65, { precio, pie: piePct, tasa, plazo } = c, n = plazo * 12;
  const steps: RouteStep[] = [];
  let a = edad, price = +precio, pie = (precio * piePct) / 100;
  const cycles = Math.min(4, Math.max(0, Math.floor((58 - edad) / 8)));
  for (let i = 0; i < cycles; i++) {
    const ph = PH[phaseOf(a)], cred = price - pie, div = pmt(cred, tasa, n), arr = (price * ph.arr * 0.9) / 12;
    const cap = price * Math.pow(1.01, 8) - saldo(cred, tasa, n, 96);
    steps.push({ ph, a0: a, a1: a + 8, price, pie, div, arr, flujo: arr - div, cap, final: false });
    a += 8;
    pie = cap;
    price = cap / PH[phaseOf(a)].pie;
  }
  const ph = PH[phaseOf(a)], cred = price - pie, div = pmt(cred, tasa, n), arr = (price * ph.arr * 0.9) / 12;
  steps.push({ ph, a0: a, a1: null, price, pie, div, arr, flujo: arr - div, cap: null, final: true });
  const y = Math.max(0, retiro - a), val = price * Math.pow(1.01, y), sal = saldo(cred, tasa, n, y * 12);
  return { steps, cycles, retiro, val, sal, neto: val - sal, ingreso: sal > 0 ? arr - div : arr, arrFull: arr, pagada: a + plazo, params: { ...c, edad } };
}
