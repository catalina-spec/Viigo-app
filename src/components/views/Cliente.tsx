'use client';

import Link from 'next/link';
import { useState, type FormEvent, type ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { Calculadora, RutaResultado } from '@/components/Calculadora';
import { Ecosistema } from '@/components/Ecosistema';
import { OfertaPrograma, TABS_PROGRAMA, tienePrograma } from '@/components/Programa';
import { useStore } from '@/lib/store';
import { STAGES, type StageKey } from '@/lib/demo-data';
import { resizeImage } from '@/lib/data';
import {
  AltCard, AltForm, Avatar, Biblioteca, ChatView, ConsentCard, FinView, Head, MeetingCard,
  NextMeetingCard, fechaLarga, useCopy, yearsLeft,
} from './Shared';

function Inicio() {
  const { s, href } = useStore();
  const copy = useCopy();
  const P = s.P, A = s.adv;
  const approved = s.meetings.filter((m) => m.status === 'aprobado');
  const last = approved[approved.length - 1];
  const pending = s.meetings.some((m) => m.status === 'revision');
  const yl = yearsLeft(P.edad, P.retiro);
  return (
    <>
      <Head eb={P.nombre ? 'Hola, ' + P.nombre : 'Bienvenido'} h="Tu ruta VIIGO" />
      {!P.nombre && (
        <section className="empty">
          <h3>Completa tu perfil</h3>
          <p>Cuéntanos tu nombre, edad y a qué edad quieres jubilar. Con eso armamos tu ruta.</p>
          <Link className="btn btn-p" href={href('cliente', 'perfil')}>Completar mi perfil</Link>
        </section>
      )}
      <section className="hero3">
        <div>
          <span className="eyebrow on">Tu próxima asesoría</span>
          {s.proxima ? (
            <>
              <div className="when">{fechaLarga(s.proxima.inicio!).split(' · ')[0]}</div>
              <div className="when-sub num">{fechaLarga(s.proxima.inicio!).split(' · ')[1]} hrs · con {A.name}</div>
              {s.proxima.meet && <a className="btn-meet" href={s.proxima.meet} target="_blank" rel="noopener">Unirse por Google Meet</a>}
            </>
          ) : (
            <>
              <div className="when">Por agendar</div>
              <div className="when-sub">{A.id ? `${A.first} te enviará la invitación.` : 'Te asignaremos un asesor pronto.'}</div>
            </>
          )}
        </div>
        <div className="stagebox">
          <span className="eyebrow on">Te identificaste con la etapa</span>
          <div className="stage-name">{STAGES[P.etapa].label}</div>
          <p>{STAGES[P.etapa].desc}</p>
          <Link className="link-on" href={href('cliente', 'ruta')}>Ver mi ruta →</Link>
        </div>
        <div>
          <span className="eyebrow on">Para tu jubilación faltan</span>
          <div className="years num">{yl}</div>
          <div className="years-sub">años · jubilas a los {P.retiro}, en {new Date().getFullYear() + yl}</div>
        </div>
      </section>
      <section className="card advisor">
        <Avatar src={A.photo} name={A.name} size={64} />
        <div className="adv-info"><span className="eyebrow">Tu asesor</span><h3>{A.name}</h3><p className="note">{A.role}</p></div>
        <div className="adv-contact">
          {A.phone && <div className="crow"><span className="k">Celular</span><a className="v num" href={`tel:${A.phone.replace(/\s/g, '')}`} style={{ color: 'inherit' }}>{A.phone}</a><button className="mini" onClick={() => copy(A.phone)}>Copiar</button></div>}
          {A.mail && <div className="crow"><span className="k">Correo</span><a className="v" href={`mailto:${A.mail}`} style={{ color: 'inherit' }}>{A.mail}</a><button className="mini" onClick={() => copy(A.mail)}>Copiar</button></div>}
          <div className="row">
            {A.wa && <a className="btn btn-p" href={`https://wa.me/${A.wa}`} target="_blank" rel="noopener">Escribir por WhatsApp</a>}
            <Link className="btn btn-g" href={href('cliente', 'mensajes')}>Mensaje en el portal</Link>
          </div>
        </div>
      </section>
      {!s.route && (
        <section className="empty">
          <h3>Aún no eliges tu ruta</h3>
          <p>Usa la calculadora VIIGO para proyectar tu ruta hasta los 65, con tu multiplicador de patrimonio, y acéptala cuando te haga sentido.</p>
          <Link className="btn btn-p" href={href('cliente', 'ruta')}>Abrir la calculadora</Link>
        </section>
      )}
      <div className="grid2">
        <section className="card">
          <h3>Tus objetivos</h3>
          <p className="note" style={{ margin: '-4px 0 10px' }}>Definidos con {A.first} en tus asesorías.</p>
          <ul className="clean">
            {s.objetivos.filter((o) => o.active).map((o) => (
              <li key={o.id}><span className="chk" /><div>{o.x}{o.from && <div className="who">{o.from}</div>}</div></li>
            ))}
          </ul>
          {!s.objetivos.some((o) => o.active) && <p className="note">Los definirán juntos en tu primera asesoría.</p>}
        </section>
        <section className="card">
          <h3>Tus pendientes</h3>
          <p className="note" style={{ margin: '-4px 0 10px' }}>Acordados en tus asesorías.</p>
          <ul className="clean">
            {s.pendientes.filter((p) => p.active).map((p) => (
              <li key={p.id}><span className={`chk ${p.done ? 'done' : ''}`}>{p.done ? '✓' : ''}</span><div>{p.x}<div className="who">{p.who}</div></div></li>
            ))}
          </ul>
          {!s.pendientes.some((p) => p.active) && <p className="note">No tienes pendientes por ahora.</p>}
        </section>
      </div>
      {last && <div className="head" style={{ marginTop: 6 }}><span className="eyebrow">Resumen de tu última asesoría VIIGO</span></div>}
      {last && <MeetingCard m={last} />}
      {pending && <p className="note">El resumen de tu última asesoría está en revisión. {A.first} lo publicará aquí cuando lo apruebe.</p>}
      {!tienePrograma(P.plan) && <OfertaPrograma />}
      <Ecosistema />
    </>
  );
}

function Perfil() {
  const { s, up, toast } = useStore();
  const P = s.P;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? '').trim();
    up((d) => {
      Object.assign(d.P, {
        nombre: v('nombre'), apellido: v('apellido'), cel: v('cel'),
        edad: +v('edad') || P.edad, retiro: +v('retiro') || P.retiro, etapa: v('etapa') as StageKey,
        ingresoJub: +v('ing') || 0, afp: v('afp') === '' ? '' : +v('afp'),
      });
    });
    toast('Perfil guardado.');
  };
  const photo = async (file?: File) => {
    if (!file) return;
    try {
      const url = await resizeImage(file);
      up((d) => { d.P.foto = url; });
      toast('Foto actualizada.');
    } catch {
      toast('No pudimos leer esa imagen.');
    }
  };
  return (
    <>
      <Head eb="Mi perfil" h="Tus datos" p="Tu asesor ve tu nombre, contacto, edad y etapa. Tu ingreso objetivo y tu saldo AFP solo los ve si autorizas el acceso a tu planilla." />
      <form className="card" onSubmit={submit} key={JSON.stringify(P)}>
        <div className="advisor" style={{ marginBottom: 18 }}>
          <Avatar src={P.foto} name={`${P.nombre} ${P.apellido}`} size={72} />
          <div className="adv-info"><h3>{P.nombre} {P.apellido}</h3><p className="note">{STAGES[P.etapa].label} · {yearsLeft(P.edad, P.retiro)} años para jubilar</p></div>
          <div className="adv-contact">
            <label className="btn btn-g" htmlFor="p-foto">{P.foto ? 'Cambiar foto' : 'Subir foto de perfil'}</label>
            <input type="file" id="p-foto" accept="image/*" hidden onChange={(e) => photo(e.target.files?.[0])} />
          </div>
        </div>
        <div className="fgrid">
          <div className="field"><label htmlFor="p-nombre">Nombre</label><input id="p-nombre" name="nombre" defaultValue={P.nombre} required autoComplete="given-name" /></div>
          <div className="field"><label htmlFor="p-apellido">Apellido</label><input id="p-apellido" name="apellido" defaultValue={P.apellido} required autoComplete="family-name" /></div>
          <div className="field"><label htmlFor="p-mail">Correo</label><input id="p-mail" name="mail" type="email" defaultValue={P.mail} disabled /><span className="hint">Es tu correo de acceso.</span></div>
          <div className="field"><label htmlFor="p-cel">Celular</label><input id="p-cel" name="cel" type="tel" defaultValue={P.cel} autoComplete="tel" /></div>
          <div className="field"><label htmlFor="p-edad">Edad</label><input id="p-edad" name="edad" type="number" inputMode="numeric" min={18} max={64} defaultValue={P.edad} /></div>
          <div className="field"><label htmlFor="p-retiro">Edad en que quieres jubilar</label><input id="p-retiro" name="retiro" type="number" inputMode="numeric" min={50} max={75} defaultValue={P.retiro} /></div>
          <div className="field"><label htmlFor="p-etapa">Etapa VIIGO con la que te identificas</label>
            <select id="p-etapa" name="etapa" defaultValue={P.etapa}>{Object.entries(STAGES).map(([k, st]) => <option key={k} value={k}>{st.label}</option>)}</select></div>
          <div className="field"><label htmlFor="p-ing">Ingreso mensual que quieres al jubilar ($)</label><input id="p-ing" name="ing" type="number" inputMode="numeric" min={0} step={50000} defaultValue={P.ingresoJub} /><span className="hint">Privado · lo usamos para comparar con tu ruta</span></div>
          <div className="field"><label htmlFor="p-afp">Saldo actual en tu AFP ($) <span className="opt-tag">Voluntario</span></label><input id="p-afp" name="afp" type="number" inputMode="numeric" min={0} step={100000} defaultValue={P.afp} placeholder="Puedes dejarlo en blanco" /><span className="hint">Solo si quieres. Nos ayuda a proyectar tu jubilación completa.</span></div>
        </div>
        <div className="row" style={{ marginTop: 16 }}><button className="btn btn-p" type="submit">Guardar cambios</button></div>
      </form>
    </>
  );
}

function Ruta() {
  const { s, up } = useStore();
  const [editando, setEditando] = useState(false);
  // Sin ruta aceptada (o modificándola): la calculadora completa.
  if (!s.route || editando)
    return (
      <>
        <Head eb="Mi ruta" h={s.route ? 'Modifica tu ruta' : 'Arma tu ruta inmobiliaria'}
          p={s.route ? `Tu ruta aceptada el ${s.route.date} sigue vigente hasta que aceptes una nueva.` : 'Ingresa los datos de tu primera inversión, revisa tu ruta hasta los 65 y acéptala cuando te haga sentido. Puedes modificarla cuando quieras.'} />
        {s.route && <div className="row"><button className="btn btn-g" onClick={() => setEditando(false)}>← Volver a mi ruta aceptada</button></div>}
        <Calculadora role="cliente" />
      </>
    );
  const r = s.route.result;
  return (
    <>
      <Head eb="Mi ruta" h="Tu ruta inmobiliaria" p={`Aceptada el ${s.route.date}. ${s.adv.first} la ve en tu ficha.`} />
      <div className="cv-accept" style={{ position: 'static' }}>
        <span className="pill p-ok" style={{ fontSize: 13 }}>✓ Ruta aceptada el {s.route.date}</span>
        <button className="btn btn-p" onClick={() => { up((d) => { d.calc = { ...r.params }; }); setEditando(true); }}>Modificar mi ruta</button>
        <span className="note">Al modificarla, cambia los datos y aparece el botón “Aceptar esta nueva ruta”.</span>
      </div>
      <RutaResultado r={r} />
    </>
  );
}

export function ClienteApp({ tab }: { tab: string }) {
  const { s } = useStore();
  const approved = s.meetings.filter((m) => m.status === 'aprobado');
  const views: Record<string, () => ReactNode> = {
    inicio: () => <Inicio />,
    perfil: () => <Perfil />,
    ruta: () => <Ruta />,
    alternativas: () => (
      <>
        <Head eb="Mis alternativas" h="Propiedades que te interesan" p={`Guarda las que encuentres y revisa las que te sugiere ${s.adv.first}. Las sugeridas ya pasaron por el Evaluador VIIGO.`} />
        {s.alts.length ? <div className="alts">{s.alts.map((a) => <AltCard key={a.id} a={a} adv={false} />)}</div>
          : <p className="note">Aún no tienes propiedades guardadas.</p>}
        <AltForm adv={false} />
      </>
    ),
    asesorias: () => (
      <>
        <Head eb="Mis asesorías" h="Tus reuniones VIIGO" />
        <NextMeetingCard adv={false} />
        {!tienePrograma(s.P.plan) && <OfertaPrograma />}
        {approved.slice().reverse().map((m) => <MeetingCard key={m.id} m={m} />)}
        {s.meetings.some((m) => m.status === 'revision') && <p className="note">El resumen de tu última asesoría está en revisión por {s.adv.first}.</p>}
      </>
    ),
    planilla: () => (
      <>
        <Head eb="Mi planilla" h="Tus datos financieros son tuyos" p="Completa la Matriz de Análisis Financiero VIIGO. Solo tú la ves. Tú decides si tu asesor puede verla y por cuánto tiempo." />
        <FinView ro={false} />
        <ConsentCard />
      </>
    ),
    biblioteca: () => <Biblioteca role="cliente" />,
    mensajes: () => <ChatView role="cliente" eb="Mensajes" h="Escríbele a tu asesor" p={`Tus mensajes quedan guardados y ${s.adv.name} los ve en tu ficha.`} />,
  };
  return (
    <AppShell role="cliente" tab={tab}>
      {!tienePrograma(s.P.plan) && TABS_PROGRAMA.has(tab) ? (
        <>
          <Head eb={tab === 'planilla' ? 'Mi planilla' : 'Mis alternativas'} h="Disponible con el Programa VIIGO" />
          <OfertaPrograma compacta />
        </>
      ) : views[tab]()}
    </AppShell>
  );
}
