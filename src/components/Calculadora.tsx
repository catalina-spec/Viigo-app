'use client';

// Calculadora VIIGO (versión original) dentro de la app.
// El cliente ingresa su primera inversión, ve su ruta hasta los 65 y el multiplicador de patrimonio,
// y la acepta. Puede modificarla y volver a aceptarla las veces que quiera.

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { MontoInput } from '@/components/Monto';
import { FASES, JUBILACION, calcRoute, validar, type CalcParams, type RouteResult } from '@/lib/calc';
import { UF, clp, pct } from '@/lib/format';
import type { Role } from '@/lib/tabs';

const fUF = (v: number) => 'UF ' + Math.round(v).toLocaleString('es-CL');
const fM = (v: number) => {
  const m = Math.round(v / 1e6);
  return m >= 1000 ? '$' + (Math.round(m / 100) / 10).toLocaleString('es-CL') + ' mil M' : '$' + m.toLocaleString('es-CL') + 'M';
};
const PLAZOS = [[144, '12 años'], [180, '15 años'], [240, '20 años'], [300, '25 años'], [360, '30 años']] as const;

/* ───────── resultados (se usan también en "Mi ruta" y en la ficha del asesor) ───────── */
export function RutaResultado({ r }: { r: RouteResult }) {
  const p = r.params, fase = FASES[r.faseInicial];
  const max = Math.max(...r.grafico.map((g) => g.valor));
  return (
    <div className="cv">
      <div className="cv-hdr"><span className="cv-dot" />Tu etapa VIIGO</div>
      <div className="cv-fase">
        <div className="cv-fase-ico" aria-hidden="true">{fase.emoji}</div>
        <div>
          <h3>{fase.l} <small>({fase.desc.split(' · ')[0]})</small></h3>
          <p>Con <b>{p.edad} años</b>, tu ruta VIIGO comienza en esta etapa. Tu primera propiedad de <b>{fUF(p.precio)}</b> se proyecta a lo largo de <b>{JUBILACION - p.edad} años</b> hasta jubilarte.</p>
        </div>
      </div>

      <div className="cv-hdr"><span className="cv-dot" />Primera propiedad · resumen financiero</div>
      <div className="cv-metrics">
        <div className="cv-m blue"><span>Dividendo mensual</span><b>{fUF(r.p1.div)}</b><small>{clp(r.p1.div * UF)}/mes</small></div>
        <div className="cv-m"><span>Arriendo estimado</span><b>{fUF(r.p1.arr)}</b><small>{pct(fase.arr)} anual · 90% ocup.</small></div>
        <div className={`cv-m ${r.p1.flujo >= 0 ? 'green' : 'red'}`}><span>Flujo neto mensual</span><b>{r.p1.flujo >= 0 ? '+' : ''}{fUF(r.p1.flujo)}</b><small>{r.p1.flujo >= 0 ? 'Arriendo mayor al dividendo' : `Déficit de ${clp(-r.p1.flujo * UF)}/mes a financiar`}</small></div>
        <div className="cv-m"><span>Crédito</span><b>{fUF(r.p1.credito)}</b><small>Pie {r.p1.piePct}% · {Math.round(p.plazo / 12)} años</small></div>
      </div>

      <div className="cv-hdr"><span className="cv-dot" />Ruta inmobiliaria completa</div>
      <div className="tbl cv-table">
        <table className="num">
          <thead><tr><th>Fase</th><th>Edad</th><th className="r">Propiedad (UF)</th><th className="r">Propiedad ($)</th><th className="r">Pie (UF)</th><th className="r">Dividendo/mes</th><th className="r">Arriendo/mes</th><th className="r">Flujo neto</th><th className="r">Capital libera</th></tr></thead>
          <tbody>
            {r.ruta.map((t, i) => {
              const neutro = Math.abs(t.flujoMens) < 0.5;
              return (
                <tr key={i}>
                  <td><span className={`pill p-${t.fase.k}`}>{t.fase.emoji} {t.fase.l}</span></td>
                  <td>{t.edadEntra}→{t.edadSale}</td>
                  <td className="r">{fUF(t.precio)}</td>
                  <td className="r">{fM(t.precio * UF)}</td>
                  <td className="r">{fUF(t.pie)}</td>
                  <td className="r">{fUF(t.divMens)}</td>
                  <td className="r">{fUF(t.arrMens)}</td>
                  <td className="r" style={{ color: neutro ? 'var(--muted)' : t.flujoMens > 0 ? 'var(--ok)' : 'var(--lock)', fontWeight: 600 }}>{neutro ? '≈ neutro' : (t.flujoMens > 0 ? '+' : '') + fUF(t.flujoMens)}</td>
                  <td className="r">{t.esFinal ? '—' : fUF(t.capitalRecibido)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="card">
        <h3>Evolución del patrimonio</h3>
        <div className="cv-legend"><span><i style={{ background: 'var(--cv-val)' }} />Valor propiedad (UF)</span><span><i style={{ background: 'var(--cv-pat)' }} />Patrimonio neto (UF)</span></div>
        <div className="cv-chart" role="img" aria-label="Valor de la propiedad y patrimonio neto en cada fase de la ruta">
          {r.grafico.map((g) => (
            <div className="cv-col" key={g.label}>
              <div className="cv-bars">
                <div className="cv-bar val" style={{ height: `${(g.valor / max) * 100}%` }} title={`Valor: ${fUF(g.valor)}`} />
                <div className="cv-bar pat" style={{ height: `${(Math.max(0, g.patrimonio) / max) * 100}%` }} title={`Patrimonio: ${fUF(g.patrimonio)}`} />
              </div>
              <span className="cv-lbl">{g.label}</span>
              <span className="cv-num num">{fUF(g.patrimonio)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="cv-hdr"><span className="cv-dot" />Situación patrimonial a los {JUBILACION} años</div>
      <div className="cv-metrics">
        <div className="cv-m gold"><span>Valor propiedad a los {JUBILACION}</span><b>{fUF(r.valJub)}</b><small>{fM(r.valJub * UF)}</small></div>
        <div className="cv-m"><span>Saldo deuda restante</span><b>{fUF(r.saldoJub)}</b><small>{r.saldoJub > 0 ? `${r.yrsRestantes} años pendientes` : 'Propiedad 100% pagada'}</small></div>
        <div className="cv-m green"><span>Patrimonio neto</span><b>{fUF(r.patrimonio)}</b><small>{fM(r.patrimonio * UF)}</small></div>
        <div className="cv-m navy"><span>Ingreso no-renta neto</span><b>{fUF(r.ingreso)}</b><small>{clp(r.ingreso * UF)}/mes</small></div>
      </div>

      <div className="cv-hdr"><span className="cv-dot" />Decisión al jubilarse · tú eliges</div>
      <div className="cv-decision">
        <div className="cv-d featured">
          <span className="cv-letter">A</span><h4>Mantienes la propiedad</h4><p>Ingreso mensual desde los {JUBILACION}:</p>
          <div className="cv-big">{fUF(r.ingreso)}/mes</div><p>{clp(r.ingreso * UF)}/mes netos</p>
          {r.yrsRestantes > 0 && <p className="cv-fine">A los {JUBILACION + r.yrsRestantes} años, con el crédito pagado: <b>{fUF(r.arrFinal)}/mes = {clp(r.arrFinal * UF)}/mes</b></p>}
        </div>
        <div className="cv-d">
          <span className="cv-letter">B</span><h4>Vendes la propiedad</h4><p>Capital líquido de una sola vez:</p>
          <div className="cv-big info">{fM(r.patrimonio * UF)}</div><p>{fUF(r.patrimonio)} = {clp(r.patrimonio * UF)}</p>
          <p className="cv-fine">Venta {fUF(r.valJub)} menos saldo de deuda {fUF(r.saldoJub)}</p>
        </div>
      </div>

      <div className="cv-conclusion">
        <span className="cv-tag">Conclusión de tu ruta VIIGO</span>
        <h2>Con <b>{clp(p.pie * UF)}</b> de pie inicial,<br />construyes un patrimonio de <b>{fM(r.patrimonio * UF)}</b></h2>
        {r.mult > 1 && (<><div className="cv-mult">{r.mult}x</div><p className="cv-mult-lbl">multiplicador de patrimonio en {JUBILACION - p.edad} años</p></>)}
        <div className="cv-line" />
        <p>La clave no es cuánto tienes hoy. Es cuándo decides empezar, y con qué plazo capitalizas la primera.</p>
      </div>
      <p className="note" style={{ textAlign: 'center' }}>
        Proyección referencial: plusvalía 1% anual · arriendo 4,5% anual del valor de compra en VIIGO START (6% en las fases siguientes), al 90% de ocupación · valores en UF reales (UF {clp(UF)}).
        Las propiedades siguientes usan el capital liberado como pie, con la misma tasa y crédito a 20 años.
      </p>
    </div>
  );
}

/* ───────── calculadora con formulario ───────── */
export function Calculadora({ role, onAceptada, sinPortada = false }: { role: Role; onAceptada?: () => void; sinPortada?: boolean }) {
  const { s, up, toast, href } = useStore();
  const router = useRouter();
  const c = s.calc;
  const err = validar(c);
  const vacia = !c.precio && !c.pie && !c.tasa && !c.plazo;
  const r = err ? null : calcRoute(c);
  const acc = s.route?.result;
  const esLaAceptada = !!acc && JSON.stringify(acc.params) === JSON.stringify(c);
  const set = (k: keyof CalcParams) => (e: { target: { value: string } }) => up((d) => { d.calc[k] = e.target.value === '' ? 0 : +e.target.value; });

  const aceptar = () => {
    if (!r) return;
    const nueva = !!acc;
    up((d) => { d.route = { result: r, date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) }; });
    toast(nueva ? `Ruta actualizada. ${s.adv.first} ya ve tu nueva ruta.` : `Ruta aceptada. ${s.adv.first} la ve en tu ficha.`);
    // Directo a ver la ruta aceptada.
    if (onAceptada) onAceptada();
    else router.push(href('cliente', 'ruta'));
    window.scrollTo({ top: 0 });
  };
  const volver = () => acc && up((d) => { d.calc = { ...acc.params }; });

  return (
    <section className="cv-wrap" id="calculadora">
      {!sinPortada && <header className="cv-hero">
        <span className="cv-hero-tag">Herramienta exclusiva</span>
        <h2>Calculadora <span>VIIGO</span></h2>
        <p>Ingresa los datos de tu primera inversión y proyectamos tu ruta patrimonial completa hasta la jubilación.</p>
      </header>}

      <div className="card cv-form">
        <h3>Datos de tu inversión</h3>
        <p className="note" style={{ marginTop: -6, marginBottom: 14 }}>Valores en UF. La tasa corresponde a la oferta de tu banco (puedes escribirla con coma, por ejemplo 4,5). Al completar los datos aparece tu ruta.</p>
        <div className="fgrid">
          <div className="field"><label htmlFor="cv-edad">Edad actual</label><MontoInput id="cv-edad" moneda="clp" placeholder="Ej.: 35" value={c.edad} onValue={(n) => up((d) => { d.calc.edad = Math.min(n, 99); })} /><span className="hint">Entre 22 y 64 años</span></div>
          <div className="field"><label htmlFor="cv-precio">Precio propiedad (UF)</label><MontoInput id="cv-precio" moneda="uf" placeholder="Ej.: 3.000" value={c.precio} onValue={(n) => up((d) => { d.calc.precio = n; })} /></div>
          <div className="field"><label htmlFor="cv-pie">Pie (UF)</label><MontoInput id="cv-pie" moneda="uf" placeholder="Ej.: 600" value={c.pie} onValue={(n) => up((d) => { d.calc.pie = n; })} /><span className="hint">{c.precio > 0 && c.pie > 0 ? Math.round((c.pie / c.precio) * 100) + '% del precio' : 'Mínimo 10% del precio'}</span></div>
          <div className="field"><label htmlFor="cv-tasa">Tasa hipotecaria anual (%)</label><MontoInput id="cv-tasa" moneda="uf" placeholder="Ej.: 4,5" value={c.tasa} onValue={(n) => up((d) => { d.calc.tasa = n; })} /></div>
          <div className="field"><label htmlFor="cv-plazo">Plazo del crédito</label>
            <select id="cv-plazo" value={c.plazo || ''} onChange={set('plazo')}><option value="" disabled>Elige el plazo</option>{PLAZOS.map(([m, l]) => <option key={m} value={m}>{l}</option>)}</select></div>
        </div>
        {err && (vacia ? <p className="note" style={{ marginTop: 12 }}>Completa tu edad, el precio, el pie, la tasa y el plazo para ver tu ruta.</p> : <p className="watermark" style={{ marginTop: 12 }}>{err}</p>)}
      </div>

      {r && <RutaResultado r={r} />}

      {/* Si los datos son los de la ruta ya aceptada, no hay nada que aceptar: no se muestra la barra. */}
      {r && (role === 'asesor' || !esLaAceptada) && (
        <div className="cv-accept">
          {role === 'asesor' ? (
            <p className="note">Escenario de prueba: no se guarda ni cambia la ruta del cliente. Solo el cliente puede aceptar su ruta desde su portal.</p>
          ) : (
            <>
              <button className="btn btn-p" onClick={aceptar}>{acc ? 'Aceptar esta nueva ruta' : 'Aceptar esta ruta'}</button>
              {acc && <button className="btn btn-g" onClick={volver}>Volver a mi ruta aceptada</button>}
              <span className="note">{acc ? `Reemplaza la ruta que aceptaste el ${s.route!.date}. ` : ''}{s.adv.first} la verá en tu ficha. Puedes modificarla las veces que quieras.</span>
            </>
          )}
        </div>
      )}
    </section>
  );
}
