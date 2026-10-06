'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { toCita, toMeeting } from '@/lib/data';
import { nombreCliente, useStore } from '@/lib/store';
import { finTotals } from '@/lib/calc';
import { Calculadora } from '@/components/Calculadora';
import { Ecosistema } from '@/components/Ecosistema';
import { UF, clp, initials, nowStr, pct, ufs } from '@/lib/format';
import { FIN, STAGES, SESIONES, type Alternativa, type Cita, type Debt, type Meeting } from '@/lib/demo-data';
import type { Role } from '@/lib/tabs';

/* ───────── piezas pequeñas ───────── */
export function Head({ eb, h, p }: { eb: string; h: ReactNode; p?: ReactNode }) {
  return (
    <div className="head">
      <span className="eyebrow">{eb}</span>
      <h2>{h}</h2>
      {p ? <p>{p}</p> : null}
    </div>
  );
}

export function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img className="avatar" src={src} alt={`Foto de ${name}`} style={{ width: size, height: size }} />;
  return (
    <div className="avatar ph" style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }} role="img" aria-label={`Foto de ${name}`}>
      {initials(name)}
    </div>
  );
}

export function useCopy() {
  const { toast } = useStore();
  return (v: string) => {
    try {
      navigator.clipboard.writeText(v).then(() => toast('Copiado: ' + v), () => toast(v));
    } catch {
      toast(v);
    }
  };
}

export const yearsLeft = (edad: number, retiro: number) => Math.max(0, (+retiro || 65) - (+edad || 0));
export const StagePill = ({ k }: { k: keyof typeof STAGES }) => <span className={`pill p-${k}`}>{STAGES[k].label}</span>;

/* ───────── reuniones ───────── */
export function MeetingCard({ m }: { m: Meeting }) {
  const { s } = useStore();
  return (
    <article className="card meet">
      <div className="meet-h">
        <div>
          <span className="date">{m.date} · {m.dur}</span>
          <h3>{m.title}</h3>
        </div>
        <span className="pill p-ok">Revisado y aprobado por {s.adv.first}</span>
      </div>
      <p>{m.resumen}</p>
      <div className="grid2">
        <div>
          <div className="sec">Objetivos de la reunión</div>
          <ul>{m.obj.map((o, i) => <li key={i}>{o}</li>)}</ul>
        </div>
        <div>
          <div className="sec">Acuerdos y próximos pasos</div>
          <ul>{m.acuerdos.map((o, i) => <li key={i}>{o}</li>)}</ul>
        </div>
      </div>
      <div className="source">Resumen revisado por tu asesor{m.next ? ` · Próxima reunión: ${m.next}` : ''}</div>
    </article>
  );
}

/** "Miércoles 14 de octubre · 18:30" */
export const fechaLarga = (iso: string) => {
  const d = new Date(iso);
  const dia = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  return dia.charAt(0).toUpperCase() + dia.slice(1) + ' · ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
};

export function NextMeetingCard({ adv }: { adv: boolean }) {
  const { s, href } = useStore();
  const m = s.proxima;
  const con = adv ? `${s.P.nombre} ${s.P.apellido}`.trim() : s.adv.name;
  if (!m)
    return (
      <section className="card">
        <span className="eyebrow">Próxima asesoría</span>
        <h3 style={{ margin: '4px 0 2px' }}>Sin asesoría agendada</h3>
        {adv ? (
          <div className="row" style={{ marginTop: 8 }}><Link className="btn btn-p" href={href('asesor', 'agenda') + '#agendar'}>＋ Agendar asesoría con Meet</Link></div>
        ) : <p className="note">{`${s.adv.first} te enviará la invitación con el link de Google Meet.`}</p>}
      </section>
    );
  return (
    <section className="card" style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
      <div>
        <span className="eyebrow">Próxima asesoría</span>
        <h3 style={{ margin: '4px 0 2px' }}>{fechaLarga(m.inicio!)}</h3>
        <p className="note">{m.title}{con ? ` · con ${con}` : ''}</p>
      </div>
      <div className="row">
        {m.meet ? <a className="btn btn-p" href={m.meet} target="_blank" rel="noopener">{adv ? 'Iniciar reunión en Meet' : 'Unirse por Google Meet'}</a>
          : <span className="note">El link de Meet aparecerá aquí.</span>}
        {adv && <Link className="btn btn-g" href={href('asesor', 'agenda')}>Reprogramar en Agenda</Link>}
        {adv && <Link className="btn btn-g" href={href('asesor', 'agenda') + '#agendar'}>＋ Agendar otra asesoría</Link>}
      </div>
      <p className="note" style={{ flexBasis: '100%' }}>
        La reunión se graba en Meet. Al terminar, la app genera el resumen y extrae los objetivos para que {adv ? 'los revises y apruebes' : s.adv.first + ' los revise antes de publicarlos aquí'}.
      </p>
    </section>
  );
}

/* ───────── planilla (Matriz de Análisis Financiero) ───────── */
const SEGS: [string, string][] = [['patrimonio', 'Patrimonio'], ['ingresos', 'Ingresos'], ['gastos', 'Gastos'], ['deudas', 'Deudas'], ['resumen', 'Resumen VIIGO']];
const DEBT_KEYS = ['tipo', 'inst', 'orig', 'saldo', 'cuota', 'tasa', 'plazo', 'rest'] as const;

export function FinView({ ro }: { ro: boolean }) {
  const { s, up, toast } = useStore();
  const T = finTotals(s.F, s.debts);
  const eqTxt = (k: string, u: string) => {
    const v = +s.F[k] || 0;
    if (!v) return '';
    return u === 'uf' ? clp(v * UF) : ufs(v / UF);
  };

  let body: ReactNode;
  const sec = FIN[s.finTab as keyof typeof FIN];
  if (sec) {
    body = sec.groups.map((gr) => (
      <div key={gr.t}>
        <div className="ghead">{gr.t}</div>
        {gr.rows.map(([k, l, u]) => (
          <div className="frow" key={k}>
            <span className="lbl">{l}</span>
            <input type="number" inputMode="decimal" min={0} step="any" value={s.F[k] || ''} placeholder={u === 'uf' ? 'UF' : '$'} aria-label={l} disabled={ro}
              onChange={(e) => up((d) => { d.F[k] = e.target.value === '' ? 0 : +e.target.value; })} />
            <span className="eq num">{eqTxt(k, u)}</span>
          </div>
        ))}
        <div className="frow tot">
          <span>Total {gr.t.toLowerCase().split(' (')[0]}</span>
          <span className="val num">{clp(T[gr.tot as keyof typeof T])}</span>
          <span className="eq num">{ufs(T[gr.tot as keyof typeof T] / UF)}</span>
        </div>
      </div>
    ));
  } else if (s.finTab === 'deudas') {
    body = (
      <>
        <div className="tbl">
          <table className="debt num">
            <thead><tr><th>Tipo</th><th>Institución</th><th className="r">Monto original</th><th className="r">Saldo actual</th><th className="r">Cuota mensual</th><th className="r">Tasa anual %</th><th className="r">Plazo (meses)</th><th className="r">Restante</th></tr></thead>
            <tbody>
              {s.debts.map((dbt, i) => (
                <tr key={i}>
                  {DEBT_KEYS.map((k) => {
                    const txt = k === 'tipo' || k === 'inst';
                    return (
                      <td key={k}>
                        <input type={txt ? 'text' : 'number'} step="any" className={['tasa', 'plazo', 'rest'].includes(k) ? 'w-s' : ''} value={dbt[k]} aria-label={k} disabled={ro}
                          onChange={(e) => up((d) => { d.debts[i][k] = txt ? e.target.value : e.target.value === '' ? '' : +e.target.value; })} />
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr><td colSpan={3}><b>Totales</b></td><td className="r"><b>{clp(T.deuda)}</b></td><td className="r"><b>{clp(T.cuotas)}</b></td><td colSpan={3}></td></tr>
            </tbody>
          </table>
        </div>
        {!ro && (
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn btn-g" onClick={() => up((d) => { d.debts.push({ tipo: '', inst: '', orig: '', saldo: '', cuota: '', tasa: '', plazo: '', rest: '' }); })}>Agregar deuda</button>
          </div>
        )}
      </>
    );
  } else {
    const sig = T.ratio <= 0.3 ? ['ok', 'Saludable'] : T.ratio <= 0.45 ? ['mid', 'Moderado'] : ['bad', 'Alto endeudamiento'];
    const rows: [string, number][] = [
      ['Ingresos totales netos mensuales', T.ing], ['Egresos totales mensuales (sin deudas)', T.egr], ['Cuotas de deuda mensuales', T.cuotas],
      ['Capacidad de ahorro / inversión mensual', T.cap], ['Ahorro / inversión anual estimada', T.anual],
      ['Estimación de pie disponible (10% del patrimonio neto)', T.pie], ['Deuda total (saldo capital)', T.deuda],
    ];
    body = (
      <>
        <div className="grid3" style={{ marginTop: 6 }}>
          <div className="card kv"><span className="k">Flujo neto mensual disponible</span><span className="v num">{clp(T.flujo)}</span><span className="s">Ingresos − gastos − cuotas</span></div>
          <div className="card kv"><span className="k">Patrimonio neto</span><span className="v num">{clp(T.neto)}</span><span className="s">{ufs(T.neto / UF)}</span></div>
          <div className="card kv"><span className="k">Salud financiera</span><span className={`v sig ${sig[0]}`}>{sig[1]}</span><span className="s">Endeudamiento {pct(T.ratio)}</span></div>
        </div>
        <div className="tbl" style={{ marginTop: 12 }}>
          <table className="num"><tbody>
            {rows.map(([l, v]) => <tr key={l}><td>{l}</td><td className="r">{clp(v)}</td></tr>)}
            <tr><td>% del ingreso destinado a ahorro</td><td className="r">{pct(T.pctA)}</td></tr>
          </tbody></table>
        </div>
      </>
    );
  }

  return (
    <section className="card">
      <div className="vault-bar">
        <div>
          <h3 style={{ margin: 0 }}>Matriz de Análisis Financiero VIIGO</h3>
          <p className="note">Valor UF de referencia: {clp(UF)}</p>
        </div>
        {ro ? <span className="pill p-warn">Solo lectura</span> : (
          <div className="row">
            <label className="btn btn-g" htmlFor="xlsx-in">Importar mi Excel</label>
            <input type="file" id="xlsx-in" accept=".xlsx,.xls" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importXlsx(f, up, toast); e.target.value = ''; }} />
          </div>
        )}
      </div>
      <div className="seg" role="group" aria-label="Secciones de la matriz" style={{ marginTop: 14 }}>
        {SEGS.map(([k, l]) => <button key={k} aria-pressed={s.finTab === k} onClick={() => up((d) => { d.finTab = k; })}>{l}</button>)}
      </div>
      <div>{body}</div>
    </section>
  );
}

/* Importar la Matriz de Análisis Financiero VIIGO (.xlsx) */
const XMAP: Record<string, Record<string, string>> = {
  '1. Patrimonio Actual': { C15: 'cc', C16: 'dap', D17: 'dapuf', C18: 'icp', D19: 'icpuf', C20: 'oliq', D24: 'prop', C25: 'veh', C26: 'oacc', D27: 'oaccuf', C28: 'onoliq' },
  '2. Ingresos Mensuales': { C5: 'sue1', C6: 'sue2', C7: 'arrR', C8: 'pens', C9: 'oif', C12: 'bon', C13: 'divi', C14: 'oiv' },
  '3. Gastos Mensuales': { C5: 'gdiv', C6: 'garr', C7: 'serv', C8: 'edu', C9: 'sal', C10: 'trans', C11: 'ccons', C12: 'seg', C13: 'ogf', C16: 'alim', C17: 'rest', C18: 'entr', C19: 'vest', C20: 'vac', C21: 'ogv' },
};
async function importXlsx(file: File, up: ReturnType<typeof useStore>['up'], toast: (t: string) => void) {
  try {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const vals: Record<string, number> = {};
    let n = 0;
    for (const [sh, map] of Object.entries(XMAP)) {
      const ws = wb.Sheets[sh];
      if (!ws) continue;
      for (const [cell, k] of Object.entries(map)) {
        const c = ws[cell];
        if (c && typeof c.v === 'number') { vals[k] = c.v; n++; }
      }
    }
    const rows: Debt[] = [];
    const wd = wb.Sheets['4. Deudas'];
    if (wd) {
      for (let i = 5; i <= 14; i++) {
        const g = (col: string) => (wd[col + i] ? wd[col + i].v : '') as string | number;
        if (g('A') || g('D') || g('E')) rows.push({ tipo: g('A'), inst: g('B'), orig: g('C'), saldo: g('D'), cuota: g('E'), tasa: g('F'), plazo: g('G'), rest: g('H') });
      }
      n += rows.length;
    }
    if (!n) return toast('El archivo no tiene datos en los campos de la Matriz VIIGO.');
    up((d) => {
      Object.assign(d.F, vals);
      if (rows.length) d.debts = rows;
      d.log.push({ t: nowStr(), x: 'Importaste tu Matriz de Análisis Financiero desde Excel.' });
    });
    toast(`Matriz importada: ${n} datos cargados.`);
  } catch {
    toast('No pudimos leer el archivo. Usa la Matriz de Análisis Financiero VIIGO.');
  }
}

/* ───────── alternativas ───────── */
/** Deja solo links web válidos (http/https). Si falta "https://", lo agrega. */
export function limpiarLink(v: string): string {
  const t = v.trim();
  if (!t) return '';
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    return u.hostname.includes('.') ? u.toString() : '';
  } catch {
    return '';
  }
}

export function AltCard({ a, adv }: { a: Alternativa; adv: boolean }) {
  const { s, up, toast, href } = useStore();
  const yieldB = a.arriendo && a.uf ? (a.arriendo * 12) / (a.uf * UF) : 0;
  const verdict = a.pts == null ? null : a.pts >= 85 ? 'Excelente' : a.pts >= 75 ? 'Recomendado' : a.pts >= 60 ? 'Aceptable' : 'Observar';
  const canDelete = (!adv && a.origen === 'cliente') || (adv && a.origen === 'asesor');
  return (
    <article className="card alt">
      <div className="top2">
        <span className={`pill ${a.origen === 'asesor' ? 'p-adv' : 'p-ok'}`}>{a.origen === 'asesor' ? 'Sugerida por ' + s.adv.first : 'Guardada por ' + (adv ? nombreCliente(s) : 'ti')}</span>
        {verdict ? <span className="pill p-ok">{a.pts} pts · {verdict}</span> : <span className="pill p-warn">Sin evaluar</span>}
      </div>
      <div>
        <h3>{a.nombre}</h3>
        <p className="meta">{a.comuna} · {a.tipo}{a.m2 ? ` · ${a.m2} m²` : ''}</p>
      </div>
      <div className="nums num">
        <div className="kv"><span className="k">Precio</span><span className="v">{ufs(a.uf)}</span><span className="s">{clp(a.uf * UF)}</span></div>
        <div className="kv"><span className="k">UF/m²</span><span className="v">{a.m2 ? (Math.round((a.uf / a.m2) * 10) / 10).toLocaleString('es-CL') : '—'}</span></div>
        <div className="kv"><span className="k">Arriendo estimado</span><span className="v">{a.arriendo ? clp(a.arriendo) : '—'}</span></div>
        <div className="kv"><span className="k">Rentabilidad bruta</span><span className="v">{yieldB ? pct(yieldB) : '—'}</span></div>
      </div>
      {a.nota ? <p className="note2">{a.nota}</p> : null}
      <div className="row">
        {a.link && <a className="btn btn-p" href={a.link} target="_blank" rel="noopener noreferrer">Ver propiedad ↗</a>}
        {adv && a.origen === 'asesor' && (
          <button className="btn btn-g" onClick={() => {
            const nuevo = window.prompt('Link de la propiedad (portal, corredor o ficha):', a.link ?? '');
            if (nuevo === null) return;
            const link = limpiarLink(nuevo);
            if (nuevo.trim() && !link) return toast('Ese link no es válido. Copia la dirección completa desde el navegador.');
            up((d) => { d.alts.find((y) => y.id === a.id)!.link = link; });
            toast(link ? `Link guardado. ${nombreCliente(s)} ya puede abrir la propiedad.` : 'Link quitado.');
          }}>{a.link ? 'Cambiar link' : 'Agregar link'}</button>
        )}
        {adv ? (
          a.pts == null && (
            <button className="btn btn-g" onClick={() => {
              const pts = Number(window.prompt('Puntaje del Evaluador VIIGO (0 a 100):'));
              if (!Number.isFinite(pts) || pts < 0 || pts > 100) return;
              const com = window.prompt('Comentario para el cliente (opcional):') ?? '';
              up((d) => { const x = d.alts.find((y) => y.id === a.id)!; x.pts = Math.round(pts); if (com.trim()) x.nota = (x.nota ? x.nota + ' ' : '') + `${s.adv.first}: ${com.trim()}`; });
              toast(`Evaluación guardada y visible para ${nombreCliente(s)}.`);
            }}>Evaluar con el Evaluador VIIGO</button>
          )
        ) : (
          <Link className="btn btn-g" href={href('cliente', 'mensajes')} onClick={() => up((d) => { d.draftMsg = `Hola ${s.adv.first}, ¿qué opinas de "${a.nombre}" en ${a.comuna}?`; })}>Consultar a {s.adv.first}</Link>
        )}
        {canDelete && <button className="btn btn-g" onClick={() => { up((d) => { d.alts = d.alts.filter((y) => y.id !== a.id); }); toast('Alternativa quitada.'); }}>Quitar</button>}
      </div>
    </article>
  );
}

export function AltForm({ adv }: { adv: boolean }) {
  const { s, up, toast } = useStore();
  const ref = useRef<HTMLFormElement>(null);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? '').trim();
    up((d) => {
      d.alts.unshift({ id: crypto.randomUUID(), nombre: v('nombre'), comuna: v('comuna'), tipo: v('tipo'), uf: +v('uf') || 0, m2: +v('m2') || 0, arriendo: +v('arr') || 0, pts: null, origen: adv ? 'asesor' : 'cliente', nota: v('nota'), link: limpiarLink(v('link')) });
    });
    toast(adv ? `Alternativa sugerida. ${nombreCliente(s)} la ve en su carpeta.` : 'Alternativa guardada.');
    ref.current?.reset();
  };
  return (
    <section className="card">
      <h3>{adv ? `Sugerir una alternativa a ${nombreCliente(s)}` : 'Guardar una alternativa que te interesa'}</h3>
      <form ref={ref} className="fgrid" style={{ marginTop: 6 }} onSubmit={submit}>
        <div className="field" style={{ gridColumn: '1/-1' }}><label htmlFor="al-nombre">Propiedad o dirección</label><input id="al-nombre" name="nombre" required placeholder="Ej.: Depto 2D2B · Av. Ossa" /></div>
        <div className="field"><label htmlFor="al-comuna">Comuna</label><input id="al-comuna" name="comuna" required placeholder="Ej.: La Reina" /></div>
        <div className="field"><label htmlFor="al-tipo">Tipo</label><select id="al-tipo" name="tipo"><option>Departamento</option><option>Casa</option><option>Oficina</option><option>Proyecto nuevo</option></select></div>
        <div className="field"><label htmlFor="al-uf">Precio (UF)</label><input id="al-uf" name="uf" type="number" inputMode="decimal" min={0} step={10} required /></div>
        <div className="field"><label htmlFor="al-m2">Superficie (m²)</label><input id="al-m2" name="m2" type="number" inputMode="decimal" min={0} step={1} /></div>
        <div className="field"><label htmlFor="al-arr">Arriendo estimado ($/mes)</label><input id="al-arr" name="arr" type="number" inputMode="numeric" min={0} step={10000} /></div>
        <div className="field" style={{ gridColumn: '1/-1' }}><label htmlFor="al-link">Link de la propiedad</label><input id="al-link" name="link" type="url" inputMode="url" placeholder="https://… (portal inmobiliario, corredor o ficha)" /><span className="hint">Opcional. Aparece como botón “Ver propiedad”.</span></div>
        <div className="field" style={{ gridColumn: '1/-1' }}><label htmlFor="al-nota">{adv ? 'Por qué la sugieres' : 'Nota para ti o tu asesor'}</label><input id="al-nota" name="nota" placeholder="Opcional" /></div>
        <div className="row"><button className="btn btn-p" type="submit">{adv ? `Sugerir a ${nombreCliente(s)}` : 'Guardar alternativa'}</button></div>
      </form>
    </section>
  );
}

/* ───────── mensajes ───────── */
export function ChatView({ role, eb, h, p }: { role: Role; eb: string; h: string; p: string }) {
  const { s, up, toast } = useStore();
  const mine = role === 'cliente';
  const chatRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = [mine ? s.draftMsg : undefined, (v: string) => mine && up((d) => { d.draftMsg = v; })];
  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ta = e.currentTarget.elements.namedItem('msg') as HTMLTextAreaElement;
    const v = ta.value.trim();
    if (!v) return;
    up((d) => { d.msgs.push({ me: mine, x: v, t: (mine ? s.P.nombre || 'Tú' : s.adv.first) + ' · ahora' }); if (mine) d.draftMsg = ''; });
    if (!mine) ta.value = '';
    toast(mine ? `Mensaje enviado a ${s.adv.first}.` : `Respuesta enviada a ${nombreCliente(s)}.`);
    setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight }), 50);
  };
  return (
    <>
      <Head eb={eb} h={h} p={p} />
      <section className="card">
        <div className="chat" ref={chatRef}>
          {s.msgs.map((m, i) => <div key={i} className={`msg ${m.me === mine ? 'me' : 'them'}`}>{m.x}<small>{m.t}</small></div>)}
          {!s.msgs.length && <p className="note">Aún no hay mensajes. Escribe el primero.</p>}
        </div>
        <form className="compose" onSubmit={send}>
          <textarea name="msg" aria-label="Mensaje" placeholder={mine ? `Escribe tu mensaje para ${s.adv.first}…` : `Responde a ${nombreCliente(s)}…`}
            value={draft} onChange={mine ? (e) => setDraft(e.target.value) : undefined} defaultValue={mine ? undefined : ''} />
          <button className="btn btn-p" type="submit">Enviar</button>
        </form>
        
      </section>
    </>
  );
}

/* ───────── permiso de la planilla ───────── */
export function ConsentCard() {
  const { s, up, toast } = useStore();
  const on = s.consent;
  const until: Record<string, string> = { '1': '24 horas', '7': '7 días', '30': '30 días', '0': 'que lo quites' };
  const grant = () => {
    const days = +s.dur;
    if (!s.adv.id) return toast('Aún no tienes un asesor asignado.');
    const hasta = days ? new Date(Date.now() + days * 864e5) : null;
    const label = hasta ? hasta.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : 'que lo quites';
    up((d) => {
      d.consent = true;
      d.grantedUntil = label;
      d.grantedUntilISO = hasta ? hasta.toISOString() : null;
      d.log.push({ t: nowStr(), x: `Compartiste tu planilla con ${s.adv.name}${days ? ' hasta el ' + label : ' sin fecha de término'}.` });
    });
    toast(`Planilla compartida. ${s.adv.first} recibió un aviso.`);
  };
  return (
    <section className="consent">
      <div className="vault-bar">
        <div><h3 style={{ margin: 0 }}>Acceso de tu asesor</h3><p className="note">{s.adv.name} · Viel.cl</p></div>
        {on ? <span className="pill p-ok">Autorizado hasta {s.grantedUntil}</span> : <span className="pill p-lock">Sin acceso</span>}
      </div>
      {on ? (
        <>
          <p>{s.adv.name} puede <b>ver</b> tu planilla, tu ingreso objetivo y tu saldo AFP. No puede editarlos ni descargarlos. Cada vez que abra tu planilla quedará registrado aquí.</p>
          <div className="row"><button className="btn btn-d" onClick={() => { up((d) => { d.consent = false; d.log.push({ t: nowStr(), x: `Quitaste el acceso a ${s.adv.name}.` }); }); toast('Acceso quitado.'); }}>Quitar acceso ahora</button></div>
        </>
      ) : (
        <>
          <p>¿Quieres compartir tu planilla con {s.adv.first}? ¿Por cuánto tiempo?</p>
          <div className="opts" role="group" aria-label="Duración del acceso">
            {Object.entries({ '1': 'Solo por 24 horas', '7': '7 días', '30': '30 días', '0': 'Hasta que lo quite' }).map(([v, l]) => (
              <button key={v} className="opt" aria-pressed={s.dur === v} onClick={() => up((d) => { d.dur = v; })}>{l}</button>
            ))}
          </div>
          <div className="row"><button className="btn btn-p" onClick={grant}>Compartir con {s.adv.first} ({until[s.dur]})</button></div>
        </>
      )}
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Registro de accesos</div>
        <ul className="clean log">{s.log.slice().reverse().map((l, i) => <li key={i}><b>{l.t}</b> · {l.x}</li>)}</ul>
      </div>
    </section>
  );
}

/* ───────── biblioteca ───────── */
export function Biblioteca({ role }: { role: Role }) {
  const { toast } = useStore();
  const res = () => toast('Pronto: aquí se abre el material.');
  const items = [
    ['Ebook', 'Método VIIGO', 'La guía completa: cómo funcionan los ciclos, las etapas y por qué la deuda bien usada construye patrimonio.', 'Leer ebook'],
    ['Guía', '5 claves para una inversión inmobiliaria', 'Lo que debes revisar antes de comprar: ubicación, precio por m², arriendo, gastos y financiamiento.', 'Ver guía'],
    ['Presentación', 'Cómo construir deuda con tu patrimonio', 'Por qué un crédito hipotecario puede trabajar para ti, con ejemplos en UF y en pesos.', 'Ver presentación'],
    ['Herramienta', 'Comparador AFP vs VIIGO', 'Compara tu jubilación solo con AFP versus AFP más tu ruta VIIGO.', 'Abrir comparador'],
  ];
  return (
    <>
      <Head eb="Biblioteca VIIGO" h="Todo para entender y construir tu ruta" p="Material del Método VIIGO de Viel.cl, explicado simple." />
      <section className="card">
        <h3>Los 5 pilares del Método VIIGO</h3>
        <div className="pillars">
          {[['V', 'Valorización de la inversión'], ['I', 'Ingresos pasivos'], ['I', 'Incentivos tributarios'], ['G', 'Gestión de la inversión'], ['O', 'Oportunidad de escalabilidad']].map(([l, t]) => (
            <div className="pillar" key={t}><b>{l}</b><span>{t}</span></div>
          ))}
        </div>
      </section>
      <Calculadora role={role} />
      <div className="grid2">
        {items.map(([tag, h, p, b]) => (
          <article className="card lib" key={h}><span className="tag">{tag}</span><h3>{h}</h3><p>{p}</p><button className="btn btn-g" style={{ alignSelf: 'flex-start' }} onClick={res}>{b}</button></article>
        ))}
      </div>
      <Ecosistema />
    </>
  );
}

/* ───────── sesiones (solo asesor) ───────── */
export function Sesiones() {
  const { s: st, up } = useStore();
  const s = SESIONES.find((x) => x.n === st.sesion) ?? SESIONES[0];
  return (
    <>
      <Head eb="Sesiones" h="Programa de asesoría VIIGO" p="Solo tú ves esta sección. Cada semana trae sus objetivos, las láminas, el relato, las preguntas de coaching y las 2 preguntas de cierre." />
      <div className="watermark">{st.citas[0] ? <>Próxima sesión: {st.citas[0].cliente} · <b>Semana {st.citas[0].ses} · {SESIONES[st.citas[0].ses - 1].titulo}</b> · {st.citas[0].dia}, {st.citas[0].hora}</> : 'No tienes sesiones agendadas.'}</div>
      <div className="seg" role="group" aria-label="Elegir semana">
        {SESIONES.map((x) => <button key={x.n} aria-pressed={x.n === s.n} onClick={() => up((d) => { d.sesion = x.n; })}>Semana {x.n}</button>)}
      </div>
      <section className="card">
        <div className="vault-bar">
          <div><span className="eyebrow">Semana {s.n} de {SESIONES.length}</span><h3 style={{ margin: '4px 0 0' }}>{s.titulo}</h3></div>
          <span className="pill p-adv">{s.dur}</span>
        </div>
        <p className="note2" style={{ marginTop: 12 }}><b>Resultado esperado:</b> {s.meta}</p>
        <div className="ghead">Objetivos de la sesión</div>
        <ul className="clean">{s.obj.map((o) => <li key={o}><span className="chk" /><div>{o}</div></li>)}</ul>
      </section>
      <section className="card">
        <h3>Láminas a usar</h3>
        <div className="slides">{s.laminas.map((l, i) => <div className="slide" key={l}><span className="snum num">{i + 1}</span><span className="stit">{l}</span><span className="sbrand">VIIGO · Viel.cl</span></div>)}</div>
        <p className="note" style={{ marginTop: 10 }}>Pronto: cada lámina abrirá tu presentación en esa página.</p>
      </section>
      <section className="card">
        <h3>Relato del asesor</h3>
        <div className="script">{s.relato.map(([t, m, x]) => <div className="sblock" key={t}><div className="sh"><b>{t}</b><span className="pill p-warn num">{m}</span></div><p>{x}</p></div>)}</div>
      </section>
      <section className="card">
        <h3>Preguntas de coaching</h3>
        <ul className="clean">{s.preguntas.map((q) => <li key={q}><span className="chk" /><div>{q}</div></li>)}</ul>
      </section>
      <div className="grid2">
        <section className="card"><h3>Tarea para el cliente</h3><p>{s.tarea}</p></section>
        <section className="card"><h3>Cierre: las 2 preguntas</h3>
          <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>{s.cierre.map((q) => <li key={q}>{q}</li>)}</ol>
          <p className="note" style={{ marginTop: 8 }}>Anota sus respuestas textuales en la ficha del cliente.</p>
        </section>
      </div>
    </>
  );
}

/* ───────── agenda (Google Calendar) ───────── */
export function Agenda() {
  const { s, up, toast, href, demo } = useStore();
  const copy = useCopy();
  const [busy, setBusy] = useState(false);
  const [manana] = useState(() => new Date(Date.now() + 864e5).toISOString().slice(0, 10));
  const days = [...new Set(s.citas.map((c) => c.dia))];

  // Al llegar desde un botón "Agendar asesoría", baja directo al formulario.
  useEffect(() => {
    if (location.hash !== '#agendar') return;
    const t = setTimeout(() => {
      document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      (document.getElementById('ci-dia') as HTMLInputElement | null)?.focus({ preventScroll: true });
    }, 150);
    return () => clearTimeout(t);
  }, []);

  // Aviso al volver de Google después de conectar el calendario.
  useEffect(() => {
    const g = new URLSearchParams(location.search).get('google');
    if (!g) return;
    toast(g === 'ok' ? 'Google Calendar conectado. Tus nuevas asesorías tendrán link de Meet.' : 'No se pudo conectar Google Calendar. Inténtalo de nuevo.');
    history.replaceState(null, '', location.pathname);
  }, [toast]);

  const agregar = (r: Record<string, unknown>) => up((d) => {
    const c = toCita({ ...r, cliente: d.clientes.find((x) => x.id === r.cliente_id) });
    d.citas.push(c);
    d.citas.sort((a, b) => (a.inicio ?? '').localeCompare(b.inicio ?? ''));
    if (c.clienteId === d.clienteId && (!d.proxima || c.inicio! < d.proxima.inicio!)) d.proxima = toMeeting(r);
  });

  // En la demo no se llama a Google ni a la base de datos: se simula la respuesta.
  const api = async (method: string, url: string, body?: Record<string, unknown>) => {
    if (!demo) {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      return { ok: res.ok, json: await res.json().catch(() => ({})) };
    }
    const id = url.split('/')[3];
    const prev = s.citas.find((c) => c.id === id);
    const reunion = {
      id: id ?? crypto.randomUUID(), cliente_id: body?.clienteId ?? prev?.clienteId, sesion: body?.sesion ?? prev?.ses,
      inicio: body?.inicio, estado: 'agendada', meet_url: null, calendar_event_id: 'demo', duracion_min: 60,
    };
    return { ok: true, json: { reunion, aviso: 'Demo: en la app real esto crea el evento en Google Calendar con su link de Meet e invita al cliente.' } };
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const v = (k: string) => String(f.get(k) ?? '');
    const inicio = new Date(`${v('dia')}T${v('hora')}:00`);
    if (inicio.getTime() < Date.now()) return toast('Elige una fecha y hora futura.');
    setBusy(true);
    const { ok, json } = await api('POST', '/api/reuniones', { clienteId: v('cli'), sesion: +v('ses'), inicio: inicio.toISOString() });
    setBusy(false);
    if (!ok) return toast(json.error ?? 'No se pudo agendar.');
    agregar(json.reunion);
    toast(json.aviso ?? 'Asesoría creada en tu Google Calendar. El cliente recibió la invitación con el link de Meet.');
    form.reset();
  };

  const reprogramar = async (c: Cita) => {
    const actual = new Date(c.inicio!);
    const pad = (n: number) => String(n).padStart(2, '0');
    const sug = `${actual.getFullYear()}-${pad(actual.getMonth() + 1)}-${pad(actual.getDate())} ${pad(actual.getHours())}:${pad(actual.getMinutes())}`;
    const txt = window.prompt('Nueva fecha y hora (AAAA-MM-DD HH:MM):', sug);
    if (!txt) return;
    const nueva = new Date(txt.trim().replace(' ', 'T') + ':00');
    if (isNaN(nueva.getTime()) || nueva.getTime() < Date.now()) return toast('Fecha no válida.');
    const { ok, json } = await api('PATCH', `/api/reuniones/${c.id}`, { inicio: nueva.toISOString() });
    if (!ok) return toast('No se pudo reprogramar.');
    const { reunion } = json;
    up((d) => {
      d.citas = d.citas.filter((x) => x.id !== c.id);
      if (d.proxima?.id === c.id) d.proxima = null;
    });
    agregar(reunion);
    toast(c.enviado ? 'Reprogramada. El cliente recibió la actualización de Google Calendar.' : 'Reprogramada.');
  };

  const cancelar = async (c: Cita) => {
    if (!window.confirm(`¿Cancelar la asesoría con ${c.cliente} del ${c.dia} a las ${c.hora}?`)) return;
    const { ok } = await api('DELETE', `/api/reuniones/${c.id}`);
    if (!ok) return toast('No se pudo cancelar.');
    up((d) => {
      d.citas = d.citas.filter((x) => x.id !== c.id);
      if (d.proxima?.id === c.id) d.proxima = null;
    });
    toast(c.enviado ? 'Cancelada. El cliente recibió el aviso de Google Calendar.' : 'Asesoría cancelada.');
  };

  return (
    <>
      <Head eb="Agenda" h="Tus asesorías VIIGO" p="Tus próximas asesorías con todos tus clientes." />
      <div className="row"><a className="btn btn-p" href="#agendar">＋ Agendar asesoría con Meet</a></div>
      {s.google ? (
        <div className="row"><span className="pill p-ok">Google Calendar conectado · {s.google}</span><span className="note">Cada asesoría nueva crea su evento con link de Meet e invita al cliente.</span></div>
      ) : (
        <section className="card" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><h3 style={{ marginBottom: 4 }}>Conecta tu Google Calendar</h3><p className="note">Así cada asesoría que agendes aparece en tu calendario con su link de Meet, y el cliente recibe la invitación por correo.</p></div>
          <a className="btn btn-p" href="/api/google/connect">Conectar Google Calendar</a>
        </section>
      )}
      {!days.length && <section className="empty"><h3>No tienes asesorías agendadas</h3><p>Agenda la primera con el formulario de abajo.</p></section>}
      {days.map((d) => (
        <section className="card" key={d}>
          <h3>{d}</h3>
          <div className="citas">
            {s.citas.filter((c) => c.dia === d).map((c) => (
              <div className="cita" key={c.id}>
                <div className="ct num">{c.hora}</div>
                <div className="ci"><b>{c.cliente}</b><span className="note">Semana {c.ses} · {SESIONES[c.ses - 1].titulo}</span>
                  {c.meet ? <span className="link num">{c.meet.replace('https://', '')}</span> : <span className="note">Sin link de Meet</span>}</div>
                <div className="ca">
                  {c.enviado ? <span className="pill p-ok">Invitación enviada</span> : <span className="pill p-warn">Sin invitación</span>}
                  <div className="row">
                    {c.meet && <a className="mini" href={c.meet} target="_blank" rel="noopener">Abrir Meet</a>}
                    {c.meet && <button className="mini" onClick={() => copy(c.meet!)}>Copiar link</button>}
                    {c.meet && <a className="mini" target="_blank" rel="noopener"
                      href={`https://wa.me/?text=${encodeURIComponent(`Hola ${c.cliente.split(' ')[0]}, te comparto el link de nuestra asesoría VIIGO del ${c.dia.toLowerCase()} a las ${c.hora}: ${c.meet}`)}`}>WhatsApp</a>}
                    <button className="mini" onClick={() => reprogramar(c)}>Reprogramar</button>
                    <button className="mini" onClick={() => cancelar(c)}>Cancelar</button>
                    <Link className="mini" href={href('asesor', 'sesiones')} onClick={() => up((x) => { x.sesion = c.ses; })}>Ver guía</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <section className="card">
        <h3 id="agendar" style={{ scrollMarginTop: 16 }}>Agendar nueva asesoría</h3>
        <form className="fgrid" style={{ marginTop: 6 }} onSubmit={submit}>
          <div className="field"><label htmlFor="ci-cli">Cliente</label>
            <select id="ci-cli" name="cli" required defaultValue={s.clienteId ?? ''}>
              {!s.clientes.length && <option value="">Aún no tienes clientes</option>}
              {s.clientes.map((c) => <option key={c.id} value={c.id}>{`${c.nombre} ${c.apellido}`.trim() || c.email}</option>)}
            </select></div>
          <div className="field"><label htmlFor="ci-ses">Sesión</label><select id="ci-ses" name="ses">{SESIONES.map((x) => <option key={x.n} value={x.n}>{x.n}. {x.titulo}</option>)}</select></div>
          <div className="field"><label htmlFor="ci-dia">Fecha</label><input id="ci-dia" name="dia" type="date" required defaultValue={manana} /></div>
          <div className="field"><label htmlFor="ci-hora">Hora</label><input id="ci-hora" name="hora" type="time" required defaultValue="18:00" /></div>
          <div className="row" style={{ gridColumn: '1/-1' }}>
            <button className="btn btn-p" type="submit" disabled={!s.clientes.length || busy}>{busy ? 'Agendando…' : s.google ? 'Crear en Google Calendar con link de Meet' : 'Agendar asesoría'}</button>
            <span className="note">{s.google ? 'El cliente recibe la invitación en su correo.' : 'Sin Google conectado se guarda sin link de Meet.'}</span>
          </div>
        </form>
      </section>
    </>
  );
}
