'use client';

import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { useStore } from '@/lib/store';
import { clp, nowStr, ufs } from '@/lib/format';
import type { Objetivo, Pendiente } from '@/lib/demo-data';
import {
  Agenda, AltCard, AltForm, Avatar, Biblioteca, ChatView, FinView, Head, MeetingCard,
  NextMeetingCard, Sesiones, StagePill, yearsLeft,
} from './Shared';

function Ficha() {
  const { s, up, toast } = useStore();
  const P = s.P, A = s.adv;
  const priv = (v: ReactNode) => (s.consent ? v : <span className="pill p-lock">Privado</span>);
  const toggle = (id: string) => {
    const willShow = ![...s.objetivos, ...s.pendientes].find((x) => x.id === id)!.active;
    up((d) => {
      const o = [...d.objetivos, ...d.pendientes].find((x) => x.id === id)!;
      o.active = !o.active;
    });
    toast(willShow ? 'Ahora Andrés lo ve en su inicio.' : 'Oculto para Andrés.');
  };
  const Item = ({ o }: { o: Objetivo | Pendiente }) => (
    <li className="mrow">
      <div>{o.x}<div className="who">{'from' in o ? 'Asesoría del ' + o.from : o.who + (o.done ? ' · hecho' : '')}</div></div>
      <button className="toggle" aria-pressed={o.active} onClick={() => toggle(o.id)}>{o.active ? 'Visible para Andrés' : 'Oculto'}</button>
    </li>
  );
  const add = (kind: 'o' | 'p') => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inp = e.currentTarget.elements.namedItem('x') as HTMLInputElement;
    const v = inp.value.trim();
    if (!v) return;
    up((d) => {
      if (kind === 'o') d.objetivos.push({ id: 'o' + Date.now(), x: v, from: 'hoy', active: true });
      else d.pendientes.push({ id: 'p' + Date.now(), x: v, who: 'Andrés', done: false, active: true });
    });
    inp.value = '';
    toast('Agregado y visible para Andrés.');
  };
  const photo = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { up((d) => { d.adv.photo = String(r.result); }); toast('Foto actualizada.'); };
    r.readAsDataURL(file);
  };
  return (
    <>
      <Head eb="Cliente" h={`${P.nombre} ${P.apellido}, ${P.edad} años`} p={`Asesor: ${A.name} · Cliente desde agosto 2026`} />
      <section className="card advisor">
        <Avatar src={P.foto} name={`${P.nombre} ${P.apellido}`} size={60} />
        <div className="adv-info"><h3>{P.nombre} {P.apellido}</h3><p className="note">{P.mail} · {P.cel}</p></div>
        <div className="adv-contact"><StagePill k={P.etapa} /><span className="note">{yearsLeft(P.edad, P.retiro)} años para jubilar (a los {P.retiro})</span></div>
      </section>
      <div className="grid3">
        <div className="card kv"><span className="k">Ingreso objetivo al jubilar</span><span className="v num">{priv(clp(P.ingresoJub) + '/mes')}</span></div>
        <div className="card kv"><span className="k">Saldo AFP</span><span className="v num">{priv(P.afp ? clp(+P.afp) : 'No informado')}</span></div>
        <div className="card kv"><span className="k">Ruta aceptada</span><span className="v">{s.route ? s.route.result.cycles + ' ciclos + final' : 'Aún no'}</span>
          <span className="s">{s.route ? `Primera propiedad ${ufs(s.route.result.params.precio)} · ${s.route.date}` : 'El cliente la acepta en la calculadora'}</span></div>
      </div>
      <section className="card advisor">
        <Avatar src={A.photo} name={A.name} size={52} />
        <div className="adv-info"><span className="eyebrow">Tu perfil de asesor</span><h3>{A.name}</h3><p className="note">{A.phone} · {A.mail}</p></div>
        <div className="adv-contact">
          <label className="btn btn-g" htmlFor="adv-foto">{A.photo ? 'Cambiar foto' : 'Subir foto'}</label>
          <input type="file" id="adv-foto" accept="image/*" hidden onChange={(e) => photo(e.target.files?.[0])} />
          <p className="note">Así te ve Andrés en su inicio.</p>
        </div>
      </section>
      <section className="card">
        <h3>Objetivos del cliente</h3>
        <p className="note" style={{ margin: '-4px 0 10px' }}>Andrés solo ve los que actives. Los objetivos extraídos de cada reunión llegan aquí al aprobar el resumen.</p>
        <ul className="clean">{s.objetivos.map((o) => <Item key={o.id} o={o} />)}</ul>
        <form className="add" onSubmit={add('o')}><input name="x" placeholder="Nuevo objetivo" aria-label="Nuevo objetivo" /><button className="btn btn-g" type="submit">Agregar y activar</button></form>
      </section>
      <section className="card">
        <h3>Pendientes</h3>
        <p className="note" style={{ margin: '-4px 0 10px' }}>Andrés solo ve los que actives.</p>
        <ul className="clean">{s.pendientes.map((o) => <Item key={o.id} o={o} />)}</ul>
        <form className="add" onSubmit={add('p')}><input name="x" placeholder="Nuevo pendiente" aria-label="Nuevo pendiente" /><button className="btn btn-g" type="submit">Agregar y activar</button></form>
      </section>
    </>
  );
}

function Asesorias() {
  const { s, up, toast } = useStore();
  const draft = s.meetings.find((m) => m.status === 'revision');
  const D = s.draft;
  const approve = () => {
    up((d) => {
      const m = d.meetings.find((x) => x.status === 'revision')!;
      m.resumen = d.draft.resumen;
      m.acuerdos = d.draft.acuerdos.split('\n').map((x) => x.trim()).filter(Boolean);
      m.obj = d.draft.objs.map((o) => o.x.trim()).filter(Boolean);
      m.status = 'aprobado';
      d.draft.objs.filter((o) => o.act && o.x.trim()).forEach((o, i) => d.objetivos.push({ id: 'n' + Date.now() + i, x: o.x.trim(), from: '23 sep', active: true }));
    });
    toast('Resumen publicado y objetivos activados para Andrés.');
  };
  return (
    <>
      <Head eb="Asesorías" h="Reuniones y resúmenes" />
      <NextMeetingCard adv />
      {draft && (
        <article className="card meet">
          <div className="meet-h">
            <div><span className="date">{draft.date} · {draft.dur}</span><h3>{draft.title}</h3></div>
            <span className="pill p-warn">Esperando tu aprobación</span>
          </div>
          <ol className="steps"><li className="done">✓ Grabada en Meet</li><li className="done">✓ Transcrita</li><li className="done">✓ Resumen y objetivos generados</li><li className="now">Tu revisión</li><li>Publicado para Andrés</li></ol>
          <div className="field"><label htmlFor="d-res">Resumen de la reunión</label>
            <textarea id="d-res" rows={4} value={D.resumen} onChange={(e) => up((d) => { d.draft.resumen = e.target.value; })} /></div>
          <div className="field">
            <label>Objetivos extraídos por la app</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {D.objs.map((o, i) => (
                <div className="eobj" key={i}>
                  <input type="checkbox" checked={o.act} aria-label="Activar en el inicio de Andrés" onChange={(e) => up((d) => { d.draft.objs[i].act = e.target.checked; })} />
                  <input type="text" value={o.x} aria-label={`Objetivo ${i + 1}`} onChange={(e) => up((d) => { d.draft.objs[i].x = e.target.value; })} />
                </div>
              ))}
            </div>
            <span className="hint">Los marcados se activan en el inicio de Andrés al aprobar.</span>
            <div className="row"><button className="btn btn-g" type="button" onClick={() => up((d) => { d.draft.objs.push({ x: '', act: true }); })}>Agregar objetivo</button></div>
          </div>
          <div className="field"><label htmlFor="d-acu">Acuerdos y próximos pasos (uno por línea)</label>
            <textarea id="d-acu" rows={4} value={D.acuerdos} onChange={(e) => up((d) => { d.draft.acuerdos = e.target.value; })} /></div>
          <div className="row"><button className="btn btn-p" onClick={approve}>Aprobar y publicar para Andrés</button><span className="note">Andrés recibirá un aviso.</span></div>
        </article>
      )}
      {s.meetings.filter((m) => m.status === 'aprobado').slice().reverse().map((m) => <MeetingCard key={m.id} m={m} />)}
    </>
  );
}

function Planilla() {
  const { s, up, toast } = useStore();
  const logged = useRef(false);
  useEffect(() => {
    if (s.consent && !logged.current) {
      logged.current = true;
      up((d) => { d.log.push({ t: nowStr(), x: `${d.adv.name} abrió tu planilla.` }); });
    }
  }, [s.consent, up]);
  if (!s.consent)
    return (
      <>
        <Head eb="Planilla financiera" h="Sin acceso a la planilla de Andrés" />
        <div className="lockbox">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          <h3>Andrés no ha autorizado el acceso</h3>
          <p>Sus datos financieros son privados. Puedes pedirle acceso. Él decide por cuánto tiempo y puede quitarlo cuando quiera.</p>
          <button className="btn btn-p" onClick={() => {
            up((d) => { d.msgs.push({ me: false, x: 'Hola Andrés, ¿me compartes tu planilla financiera para preparar la oferta? Lo puedes hacer desde "Mi planilla".', t: 'Catalina · ahora' }); });
            toast('Solicitud enviada a Andrés.');
          }}>Pedir acceso a Andrés</button>
        </div>
      </>
    );
  return (
    <>
      <Head eb="Planilla financiera" h="Planilla de Andrés" />
      <div className="watermark">Acceso autorizado por Andrés hasta {s.grantedUntil}. Esta visita quedó registrada y Andrés puede verla.</div>
      <FinView ro />
    </>
  );
}

export function AsesorApp({ tab }: { tab: string }) {
  const { s } = useStore();
  const views: Record<string, () => ReactNode> = {
    inicio: () => <Ficha />,
    agenda: () => <Agenda />,
    sesiones: () => <Sesiones />,
    asesorias: () => <Asesorias />,
    alternativas: () => (
      <>
        <Head eb="Alternativas" h="Propiedades en la carpeta de Andrés" p="Ves las que él guardó y las que tú le sugeriste." />
        <div className="alts">{s.alts.map((a) => <AltCard key={a.id} a={a} adv />)}</div>
        <AltForm adv />
      </>
    ),
    planilla: () => <Planilla />,
    biblioteca: () => <Biblioteca role="asesor" />,
    mensajes: () => <ChatView role="asesor" eb="Mensajes" h="Conversación con Andrés" p="Tus respuestas le llegan a Andrés por correo." />,
  };
  return (
    <AppShell role="asesor" tab={tab}>
      {views[tab]()}
    </AppShell>
  );
}
