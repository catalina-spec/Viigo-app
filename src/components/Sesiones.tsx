'use client';

// Programa de 4 sesiones (solo asesores), con edición en la app para los editores
// y láminas que abren la presentación para editarla y presentarla en Google Meet.

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { Lamina, SesionApp } from '@/lib/programa';
import { limpiarLink } from '@/components/views/Shared';

const lineas = (t: string) => t.split('\n').map((x) => x.trim()).filter(Boolean);

function Head({ eb, h, p }: { eb: string; h: string; p?: string }) {
  return <div className="head"><span className="eyebrow">{eb}</span><h2>{h}</h2>{p && <p>{p}</p>}</div>;
}

/* ───────── lámina: abre la presentación (editar / presentar en Meet) ───────── */
function LaminaCard({ l, i, url }: { l: Lamina; i: number; url: string }) {
  const contenido = (
    <>
      <span className="snum num">{i + 1}</span>
      <span className="stit">{l.titulo}</span>
      <span className="sbrand">{url ? 'Abrir y presentar ↗' : 'Sin link aún'}</span>
    </>
  );
  return url
    ? <a className="slide slide-link" href={url} target="_blank" rel="noopener" title={`Abrir lámina ${i + 1}: ${l.titulo}`}>{contenido}</a>
    : <div className="slide" style={{ opacity: 0.75 }}>{contenido}</div>;
}

/* ───────── editor de una sesión ───────── */
function Editor({ ses, onClose }: { ses: SesionApp; onClose: () => void }) {
  const { guardarSesion, toast, demo } = useStore();
  const [d, setD] = useState<SesionApp>(() => structuredClone(ses));
  const [txt, setTxt] = useState({ obj: ses.obj.join('\n'), preguntas: ses.preguntas.join('\n'), cierre: ses.cierre.join('\n') });
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof SesionApp>(k: K, v: SesionApp[K]) => setD((x) => ({ ...x, [k]: v }));

  const guardar = async () => {
    const malLink = [d.presentacion, ...d.laminas.map((l) => l.link)].some((u) => u.trim() && !limpiarLink(u));
    if (malLink) return toast('Hay un link que no es válido. Copia la dirección completa desde el navegador.');
    const final: SesionApp = {
      ...d,
      obj: lineas(txt.obj), preguntas: lineas(txt.preguntas), cierre: lineas(txt.cierre),
      presentacion: limpiarLink(d.presentacion),
      laminas: d.laminas.filter((l) => l.titulo.trim()).map((l) => ({ titulo: l.titulo.trim(), link: limpiarLink(l.link) })),
      relato: d.relato.filter(([t, , x]) => t.trim() || x.trim()),
    };
    setBusy(true);
    const err = await guardarSesion(final);
    setBusy(false);
    if (err) return toast(err);
    toast(demo ? `Semana ${d.n} actualizada en la demo (no se guarda).` : `Semana ${d.n} guardada. Todos los asesores ven la versión nueva.`);
    onClose();
  };

  return (
    <section className="card sedit">
      <div className="vault-bar">
        <h3 style={{ margin: 0 }}>Editando la semana {d.n}</h3>
        <div className="row"><button className="btn btn-g" onClick={onClose}>Cancelar</button><button className="btn btn-p" disabled={busy} onClick={guardar}>{busy ? 'Guardando…' : 'Guardar cambios'}</button></div>
      </div>
      <div className="fgrid">
        <div className="field" style={{ gridColumn: '1/-1' }}><label htmlFor="se-tit">Título</label><input id="se-tit" value={d.titulo} onChange={(e) => set('titulo', e.target.value)} /></div>
        <div className="field"><label htmlFor="se-dur">Duración</label><input id="se-dur" value={d.dur} onChange={(e) => set('dur', e.target.value)} /></div>
        <div className="field" style={{ gridColumn: '1/-1' }}><label htmlFor="se-meta">Resultado esperado</label><textarea id="se-meta" rows={2} value={d.meta} onChange={(e) => set('meta', e.target.value)} /></div>
        <div className="field" style={{ gridColumn: '1/-1' }}><label htmlFor="se-obj">Objetivos (uno por línea)</label><textarea id="se-obj" rows={5} value={txt.obj} onChange={(e) => setTxt({ ...txt, obj: e.target.value })} /></div>
      </div>

      <div className="ghead">Láminas</div>
      <div className="field"><label htmlFor="se-pres">Link de la presentación completa (Google Slides)</label>
        <input id="se-pres" type="url" placeholder="https://docs.google.com/presentation/…" value={d.presentacion} onChange={(e) => set('presentacion', e.target.value)} />
        <span className="hint">Se abre al hacer clic en una lámina que no tenga link propio.</span></div>
      <div className="sedit-rows">
        {d.laminas.map((l, i) => (
          <div className="sedit-row" key={i}>
            <span className="num" style={{ fontWeight: 700, color: 'var(--muted)' }}>{i + 1}</span>
            <input aria-label={`Título lámina ${i + 1}`} placeholder="Título de la lámina" value={l.titulo} onChange={(e) => set('laminas', d.laminas.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)))} />
            <input aria-label={`Link lámina ${i + 1}`} type="url" placeholder="Link a esta lámina (opcional)" value={l.link} onChange={(e) => set('laminas', d.laminas.map((x, j) => (j === i ? { ...x, link: e.target.value } : x)))} />
            <button className="mini" onClick={() => set('laminas', d.laminas.filter((_, j) => j !== i))} aria-label={`Quitar lámina ${i + 1}`}>Quitar</button>
          </div>
        ))}
      </div>
      <div className="row"><button className="btn btn-g" onClick={() => set('laminas', [...d.laminas, { titulo: '', link: '' }])}>＋ Agregar lámina</button></div>

      <div className="ghead">Relato del asesor</div>
      <div className="sedit-rows">
        {d.relato.map(([t, m, x], i) => (
          <div className="sedit-relato" key={i}>
            <input aria-label="Momento" placeholder="Momento (ej.: Check-in)" value={t} onChange={(e) => set('relato', d.relato.map((r, j) => (j === i ? [e.target.value, r[1], r[2]] : r)))} />
            <input aria-label="Minutos" placeholder="10 min" value={m} onChange={(e) => set('relato', d.relato.map((r, j) => (j === i ? [r[0], e.target.value, r[2]] : r)))} />
            <button className="mini" onClick={() => set('relato', d.relato.filter((_, j) => j !== i))}>Quitar</button>
            <textarea aria-label="Qué decir" rows={2} placeholder="Qué decir o hacer" value={x} onChange={(e) => set('relato', d.relato.map((r, j) => (j === i ? [r[0], r[1], e.target.value] : r)))} />
          </div>
        ))}
      </div>
      <div className="row"><button className="btn btn-g" onClick={() => set('relato', [...d.relato, ['', '', '']])}>＋ Agregar momento</button></div>

      <div className="fgrid" style={{ marginTop: 12 }}>
        <div className="field" style={{ gridColumn: '1/-1' }}><label htmlFor="se-pre">Preguntas de coaching (una por línea)</label><textarea id="se-pre" rows={5} value={txt.preguntas} onChange={(e) => setTxt({ ...txt, preguntas: e.target.value })} /></div>
        <div className="field" style={{ gridColumn: '1/-1' }}><label htmlFor="se-tar">Tarea para el cliente</label><textarea id="se-tar" rows={3} value={d.tarea} onChange={(e) => set('tarea', e.target.value)} /></div>
        <div className="field" style={{ gridColumn: '1/-1' }}><label htmlFor="se-cie">Cierre: las 2 preguntas (una por línea)</label><textarea id="se-cie" rows={3} value={txt.cierre} onChange={(e) => setTxt({ ...txt, cierre: e.target.value })} /></div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn btn-g" onClick={onClose}>Cancelar</button><button className="btn btn-p" disabled={busy} onClick={guardar}>{busy ? 'Guardando…' : 'Guardar cambios'}</button></div>
    </section>
  );
}

/* ───────── vista ───────── */
export function Sesiones() {
  const { s: st, up } = useStore();
  const [editando, setEditando] = useState(false);
  const prog = st.programa;
  const s = prog.find((x) => x.n === st.sesion) ?? prog[0];
  const prox = st.citas[0];
  return (
    <>
      <Head eb="Sesiones" h="Programa de asesoría VIIGO" p="Solo los asesores ven esta sección. Cada semana trae sus objetivos, las láminas, el relato, las preguntas de coaching y las 2 preguntas de cierre." />
      <div className="watermark">{prox ? <>Próxima sesión: {prox.cliente} · <b>Semana {prox.ses} · {prog[prox.ses - 1]?.titulo}</b> · {prox.dia}, {prox.hora}</> : 'No tienes sesiones agendadas.'}</div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="seg" role="group" aria-label="Elegir semana">
          {prog.map((x) => <button key={x.n} aria-pressed={x.n === s.n} onClick={() => { setEditando(false); up((d) => { d.sesion = x.n; }); }}>Semana {x.n}</button>)}
        </div>
        {st.puedeEditar && !editando && <button className="btn btn-p" onClick={() => setEditando(true)}>✎ Editar sesión</button>}
      </div>

      {editando ? <Editor key={s.n} ses={s} onClose={() => setEditando(false)} /> : (
        <>
          <section className="card">
            <div className="vault-bar">
              <div><span className="eyebrow">Semana {s.n} de {prog.length}</span><h3 style={{ margin: '4px 0 0' }}>{s.titulo}</h3></div>
              <span className="pill p-adv">{s.dur}</span>
            </div>
            <p className="note2" style={{ marginTop: 12 }}><b>Resultado esperado:</b> {s.meta}</p>
            <div className="ghead">Objetivos de la sesión</div>
            <ul className="clean">{s.obj.map((o, i) => <li key={i}><span className="chk" /><div>{o}</div></li>)}</ul>
          </section>
          <section className="card">
            <div className="vault-bar">
              <h3 style={{ margin: 0 }}>Láminas a usar</h3>
              {s.presentacion && <a className="btn btn-g" href={s.presentacion} target="_blank" rel="noopener">Abrir presentación completa ↗</a>}
            </div>
            <div className="slides" style={{ marginTop: 12 }}>{s.laminas.map((l, i) => <LaminaCard key={i} l={l} i={i} url={l.link || s.presentacion} />)}</div>
            <details className="note" style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Cómo editar y presentar las láminas en Google Meet</summary>
              <ol style={{ margin: '8px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>Haz clic en la lámina: se abre la presentación en Google Slides, donde puedes <b>editarla</b>.</li>
                <li>En la reunión de Meet, toca <b>Presentar → Una pestaña</b> y elige la pestaña de la presentación (o, desde Google Slides, el botón <b>Presentar en una reunión</b>).</li>
                <li>En Google Slides toca <b>Presentación</b> para verla en pantalla completa y avanza con las flechas.</li>
              </ol>
            </details>
            {!s.presentacion && !s.laminas.some((l) => l.link) && <p className="note" style={{ marginTop: 8 }}>{st.puedeEditar ? 'Agrega el link de tu presentación con “Editar sesión”.' : 'Aún no se ha agregado el link de la presentación.'}</p>}
          </section>
          <section className="card">
            <h3>Relato del asesor</h3>
            <div className="script">{s.relato.map(([t, m, x], i) => <div className="sblock" key={i}><div className="sh"><b>{t}</b>{m && <span className="pill p-warn num">{m}</span>}</div><p>{x}</p></div>)}</div>
          </section>
          <section className="card">
            <h3>Preguntas de coaching</h3>
            <ul className="clean">{s.preguntas.map((q, i) => <li key={i}><span className="chk" /><div>{q}</div></li>)}</ul>
          </section>
          <div className="grid2">
            <section className="card"><h3>Tarea para el cliente</h3><p>{s.tarea}</p></section>
            <section className="card"><h3>Cierre: las 2 preguntas</h3>
              <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>{s.cierre.map((q, i) => <li key={i}>{q}</li>)}</ol>
              <p className="note" style={{ marginTop: 8 }}>Anota sus respuestas textuales en la ficha del cliente.</p>
            </section>
          </div>
        </>
      )}
    </>
  );
}
