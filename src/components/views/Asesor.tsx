'use client';

import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { RutaResultado } from '@/components/Calculadora';
import { FASES } from '@/lib/calc';
import { nombreCliente, useStore } from '@/lib/store';
import { resizeImage, fmtCorta } from '@/lib/data';
import { clp, ufs } from '@/lib/format';
import type { Objetivo, Pendiente } from '@/lib/demo-data';
import {
  Agenda, AltCard, AltForm, Avatar, Biblioteca, ChatView, FinView, Head, MeetingCard,
  NextMeetingCard, Sesiones, StagePill, yearsLeft,
} from './Shared';

function PerfilAsesor() {
  const { s, up, toast } = useStore();
  const A = s.adv;
  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? '').trim();
    up((d) => {
      d.adv.nombre = v('nombre');
      d.adv.apellido = v('apellido');
      d.adv.name = `${v('nombre')} ${v('apellido')}`.trim() || d.me.email;
      d.adv.first = v('nombre') || d.adv.name;
      d.adv.phone = v('cel');
      d.adv.wa = v('cel').replace(/\D/g, '');
      d.adv.role = v('cargo') || 'Asesor VIIGO · Viel.cl';
    });
    toast('Tu perfil de asesor quedó guardado.');
  };
  const photo = async (file?: File) => {
    if (!file) return;
    try {
      const url = await resizeImage(file);
      up((d) => { d.adv.photo = url; });
      toast('Foto actualizada.');
    } catch {
      toast('No pudimos leer esa imagen.');
    }
  };
  return (
    <section className="card">
      <div className="advisor" style={{ marginBottom: 14 }}>
        <Avatar src={A.photo} name={A.name} size={52} />
        <div className="adv-info"><span className="eyebrow">Tu perfil de asesor</span><h3>{A.name}</h3><p className="note">Así te ven tus clientes en su inicio.</p></div>
        <div className="adv-contact">
          <label className="btn btn-g" htmlFor="adv-foto">{A.photo ? 'Cambiar foto' : 'Subir foto'}</label>
          <input type="file" id="adv-foto" accept="image/*" hidden onChange={(e) => photo(e.target.files?.[0])} />
        </div>
      </div>
      <form className="fgrid" onSubmit={save} key={JSON.stringify(A)}>
        <div className="field"><label htmlFor="a-nombre">Nombre</label><input id="a-nombre" name="nombre" defaultValue={A.nombre ?? ''} required /></div>
        <div className="field"><label htmlFor="a-apellido">Apellido</label><input id="a-apellido" name="apellido" defaultValue={A.apellido ?? ''} /></div>
        <div className="field"><label htmlFor="a-cel">Celular / WhatsApp</label><input id="a-cel" name="cel" type="tel" defaultValue={A.phone} placeholder="+56 9 …" /></div>
        <div className="field"><label htmlFor="a-cargo">Cargo</label><input id="a-cargo" name="cargo" defaultValue={A.role} /></div>
        <div className="row"><button className="btn btn-g" type="submit">Guardar mi perfil</button></div>
      </form>
    </section>
  );
}

function Ficha() {
  const { s, up, toast } = useStore();
  const P = s.P, cn = nombreCliente(s);
  const priv = (v: ReactNode) => (s.consent ? v : <span className="pill p-lock">Privado</span>);
  const toggle = (id: string) => {
    const willShow = ![...s.objetivos, ...s.pendientes].find((x) => x.id === id)!.active;
    up((d) => {
      const o = [...d.objetivos, ...d.pendientes].find((x) => x.id === id)!;
      o.active = !o.active;
    });
    toast(willShow ? `Ahora ${cn} lo ve en su inicio.` : `Oculto para ${cn}.`);
  };
  const Item = ({ o }: { o: Objetivo | Pendiente }) => (
    <li className="mrow">
      <div>{o.x}<div className="who">{'from' in o ? o.from : o.who + (o.done ? ' · hecho' : '')}</div></div>
      <button className="toggle" aria-pressed={o.active} onClick={() => toggle(o.id)}>{o.active ? `Visible para ${cn}` : 'Oculto'}</button>
    </li>
  );
  const add = (kind: 'o' | 'p') => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inp = e.currentTarget.elements.namedItem('x') as HTMLInputElement;
    const v = inp.value.trim();
    if (!v) return;
    up((d) => {
      if (kind === 'o') d.objetivos.push({ id: crypto.randomUUID(), x: v, from: 'Agregado el ' + fmtCorta(new Date().toISOString()), active: true });
      else d.pendientes.push({ id: crypto.randomUUID(), x: v, who: P.nombre || 'Cliente', done: false, active: true });
    });
    inp.value = '';
    toast(`Agregado y visible para ${cn}.`);
  };
  const desde = P.creado ? new Date(P.creado).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }) : '';
  return (
    <>
      <Head eb="Cliente" h={`${P.nombre} ${P.apellido}`.trim() || P.mail} p={`${P.nombre ? P.edad + ' años · ' : ''}Cliente desde ${desde}`} />
      <section className="card advisor">
        <Avatar src={P.foto} name={`${P.nombre} ${P.apellido}`.trim() || P.mail} size={60} />
        <div className="adv-info"><h3>{`${P.nombre} ${P.apellido}`.trim() || 'Sin nombre aún'}</h3><p className="note">{P.mail}{P.cel ? ' · ' + P.cel : ''}</p></div>
        <div className="adv-contact"><StagePill k={P.etapa} /><span className="note">{yearsLeft(P.edad, P.retiro)} años para jubilar (a los {P.retiro})</span></div>
      </section>
      {!P.nombre && <p className="watermark">{P.mail} todavía no completa su perfil.</p>}
      <div className="grid3">
        <div className="card kv"><span className="k">Ingreso objetivo al jubilar</span><span className="v num">{priv(P.ingresoJub ? clp(P.ingresoJub) + '/mes' : 'No informado')}</span></div>
        <div className="card kv"><span className="k">Saldo AFP</span><span className="v num">{priv(P.afp ? clp(+P.afp) : 'No informado')}</span></div>
        <div className="card kv"><span className="k">Ruta aceptada</span>
          <span className="v">{s.route ? <span className={`pill p-${FASES[s.route.result.faseInicial].k}`} style={{ fontSize: 14 }}>Empieza en {FASES[s.route.result.faseInicial].l}</span> : 'Aún no'}</span>
          <span className="s">{s.route ? `Primera propiedad ${ufs(s.route.result.params.precio)} · ${s.route.date}` : `${cn} la acepta en su calculadora`}</span></div>
      </div>
      {s.route && (
        <details className="card">
          <summary style={{ cursor: 'pointer' }}>
            <b>Ver la ruta que aceptó {cn}</b> <span className="note">· {s.route.date} · patrimonio a los 65: {ufs(s.route.result.patrimonio)}</span>
          </summary>
          <div style={{ marginTop: 14 }}><RutaResultado r={s.route.result} /></div>
        </details>
      )}
      <section className="card">
        <h3>Objetivos del cliente</h3>
        <p className="note" style={{ margin: '-4px 0 10px' }}>{cn} solo ve los que actives. Los objetivos de cada reunión llegan aquí al aprobar el resumen.</p>
        <ul className="clean">{s.objetivos.map((o) => <Item key={o.id} o={o} />)}</ul>
        <form className="add" onSubmit={add('o')}><input name="x" placeholder="Nuevo objetivo" aria-label="Nuevo objetivo" /><button className="btn btn-g" type="submit">Agregar y activar</button></form>
      </section>
      <section className="card">
        <h3>Pendientes</h3>
        <p className="note" style={{ margin: '-4px 0 10px' }}>{cn} solo ve los que actives.</p>
        <ul className="clean">{s.pendientes.map((o) => <Item key={o.id} o={o} />)}</ul>
        <form className="add" onSubmit={add('p')}><input name="x" placeholder="Nuevo pendiente" aria-label="Nuevo pendiente" /><button className="btn btn-g" type="submit">Agregar y activar</button></form>
      </section>
    </>
  );
}

function Asesorias() {
  const { s, up, toast } = useStore();
  const cn = nombreCliente(s);
  const draft = s.meetings.find((m) => m.status === 'revision');
  const D = s.draft;
  const approve = () => {
    up((d) => {
      const m = d.meetings.find((x) => x.status === 'revision')!;
      m.resumen = d.draft.resumen;
      m.acuerdos = d.draft.acuerdos.split('\n').map((x) => x.trim()).filter(Boolean);
      m.obj = d.draft.objs.map((o) => o.x.trim()).filter(Boolean);
      m.status = 'aprobado';
      d.draft.objs.filter((o) => o.act && o.x.trim()).forEach((o) => d.objetivos.push({ id: crypto.randomUUID(), x: o.x.trim(), from: 'Asesoría del ' + m.date, active: true }));
    });
    toast(`Resumen publicado y objetivos activados para ${cn}.`);
  };
  const approved = s.meetings.filter((m) => m.status === 'aprobado');
  return (
    <>
      <Head eb="Asesorías" h="Reuniones y resúmenes" />
      <NextMeetingCard adv />
      {draft && (
        <article className="card meet">
          <div className="meet-h">
            <div><span className="date">{draft.date}{draft.dur ? ' · ' + draft.dur : ''}</span><h3>{draft.title}</h3></div>
            <span className="pill p-warn">Esperando tu aprobación</span>
          </div>
          <ol className="steps"><li className="done">✓ Grabada en Meet</li><li className="done">✓ Transcrita</li><li className="done">✓ Resumen y objetivos generados</li><li className="now">Tu revisión</li><li>Publicado para {cn}</li></ol>
          <div className="field"><label htmlFor="d-res">Resumen de la reunión</label>
            <textarea id="d-res" rows={4} value={D.resumen} onChange={(e) => up((d) => { d.draft.resumen = e.target.value; })} /></div>
          <div className="field">
            <label>Objetivos extraídos por la app</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {D.objs.map((o, i) => (
                <div className="eobj" key={i}>
                  <input type="checkbox" checked={o.act} aria-label={`Activar en el inicio de ${cn}`} onChange={(e) => up((d) => { d.draft.objs[i].act = e.target.checked; })} />
                  <input type="text" value={o.x} aria-label={`Objetivo ${i + 1}`} onChange={(e) => up((d) => { d.draft.objs[i].x = e.target.value; })} />
                </div>
              ))}
            </div>
            <span className="hint">Los marcados se activan en el inicio de {cn} al aprobar.</span>
            <div className="row"><button className="btn btn-g" type="button" onClick={() => up((d) => { d.draft.objs.push({ x: '', act: true }); })}>Agregar objetivo</button></div>
          </div>
          <div className="field"><label htmlFor="d-acu">Acuerdos y próximos pasos (uno por línea)</label>
            <textarea id="d-acu" rows={4} value={D.acuerdos} onChange={(e) => up((d) => { d.draft.acuerdos = e.target.value; })} /></div>
          <div className="row"><button className="btn btn-p" onClick={approve}>Aprobar y publicar para {cn}</button></div>
        </article>
      )}
      {approved.slice().reverse().map((m) => <MeetingCard key={m.id} m={m} />)}
      {!draft && !approved.length && (
        <p className="note">Aún no hay resúmenes. En la Fase 4, cada reunión grabada en Meet generará aquí un borrador para que lo revises.</p>
      )}
    </>
  );
}

function Planilla() {
  const { s, up, toast, rpc } = useStore();
  const cn = nombreCliente(s);
  const logged = useRef<string | null>(null);
  useEffect(() => {
    if (s.consent && s.clienteId && logged.current !== s.clienteId) {
      logged.current = s.clienteId;
      rpc('registrar_vista_planilla', { cliente: s.clienteId });
    }
  }, [s.consent, s.clienteId, rpc]);
  if (!s.consent)
    return (
      <>
        <Head eb="Planilla financiera" h={`Sin acceso a la planilla de ${cn}`} />
        <div className="lockbox">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          <h3>{cn} no ha autorizado el acceso</h3>
          <p>Sus datos financieros son privados. Puedes pedirle acceso: decide por cuánto tiempo y puede quitarlo cuando quiera. Solo su asesor asignado puede recibir el permiso.</p>
          <button className="btn btn-p" onClick={() => {
            up((d) => { d.msgs.push({ me: false, x: `Hola ${s.P.nombre}, ¿me compartes tu planilla financiera? Lo puedes hacer desde "Mi planilla".`, t: `${s.adv.first} · ahora` }); });
            toast(`Solicitud enviada a ${cn} por mensaje.`);
          }}>Pedir acceso a {cn}</button>
        </div>
      </>
    );
  return (
    <>
      <Head eb="Planilla financiera" h={`Planilla de ${cn}`} />
      <div className="watermark">Acceso autorizado por {cn} hasta {s.grantedUntil}. Esta visita quedó registrada y {cn} puede verla.</div>
      <FinView ro />
    </>
  );
}

export function AsesorApp({ tab }: { tab: string }) {
  const { s } = useStore();
  const cn = nombreCliente(s);
  const views: Record<string, () => ReactNode> = {
    inicio: () => (<><Ficha /><PerfilAsesor /></>),
    agenda: () => <Agenda />,
    sesiones: () => <Sesiones />,
    asesorias: () => <Asesorias />,
    alternativas: () => (
      <>
        <Head eb="Alternativas" h={`Propiedades en la carpeta de ${cn}`} p="Ves las que guardó y las que tú le sugeriste." />
        {s.alts.length ? <div className="alts">{s.alts.map((a) => <AltCard key={a.id} a={a} adv />)}</div> : <p className="note">Aún no hay propiedades en su carpeta.</p>}
        <AltForm adv />
      </>
    ),
    planilla: () => <Planilla />,
    biblioteca: () => <Biblioteca role="asesor" />,
    mensajes: () => <ChatView role="asesor" eb="Mensajes" h={`Conversación con ${cn}`} p={`${cn} ve tus mensajes en su portal.`} />,
  };
  return (
    <AppShell role="asesor" tab={tab}>
      {s.clienteId || tab !== 'inicio' ? views[tab]() : (
        <>
          <section className="empty">
            <h3>Aún no tienes clientes</h3>
            <p>Cuando un cliente entre a la app con su correo, aparecerá aquí automáticamente. Mientras, completa tu perfil de asesor.</p>
          </section>
          <PerfilAsesor />
        </>
      )}
    </AppShell>
  );
}
