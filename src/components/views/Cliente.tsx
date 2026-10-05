'use client';

import Link from 'next/link';
import type { FormEvent, ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { useStore } from '@/lib/store';
import { MEET_URL, STAGES, type StageKey } from '@/lib/demo-data';
import { ufs } from '@/lib/format';
import {
  AltCard, AltForm, Avatar, Biblioteca, ChatView, ConsentCard, FinView, Head, MeetingCard,
  NextMeetingCard, RetireCards, RouteTable, useCopy, yearsLeft,
} from './Shared';

function Inicio() {
  const { s } = useStore();
  const copy = useCopy();
  const P = s.P, A = s.adv;
  const approved = s.meetings.filter((m) => m.status === 'aprobado');
  const last = approved[approved.length - 1];
  const pending = s.meetings.some((m) => m.status === 'revision');
  const yl = yearsLeft(P.edad, P.retiro);
  return (
    <>
      <Head eb={'Hola, ' + P.nombre} h="Tu ruta VIIGO" />
      <section className="hero3">
        <div>
          <span className="eyebrow on">Tu próxima asesoría</span>
          <div className="when">Miércoles 14 de octubre</div>
          <div className="when-sub num">18:30 hrs · Google Meet con {A.name}</div>
          <a className="btn-meet" href={MEET_URL} target="_blank" rel="noopener">Unirse por Google Meet</a>
        </div>
        <div className="stagebox">
          <span className="eyebrow on">Te identificaste con la etapa</span>
          <div className="stage-name">{STAGES[P.etapa].label}</div>
          <p>{STAGES[P.etapa].desc}</p>
          <Link className="link-on" href="/cliente/ruta">Ver mi ruta →</Link>
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
          <div className="crow"><span className="k">Celular</span><a className="v num" href={`tel:${A.phone.replace(/\s/g, '')}`} style={{ color: 'inherit' }}>{A.phone}</a><button className="mini" onClick={() => copy(A.phone)}>Copiar</button></div>
          <div className="crow"><span className="k">Correo</span><a className="v" href={`mailto:${A.mail}`} style={{ color: 'inherit' }}>{A.mail}</a><button className="mini" onClick={() => copy(A.mail)}>Copiar</button></div>
          <div className="row">
            <a className="btn btn-p" href={`https://wa.me/${A.wa}`} target="_blank" rel="noopener">Escribir por WhatsApp</a>
            <Link className="btn btn-g" href="/cliente/mensajes">Mensaje en el portal</Link>
          </div>
        </div>
      </section>
      {!s.route && (
        <section className="empty">
          <h3>Aún no eliges tu ruta</h3>
          <p>Usa la calculadora VIIGO en la biblioteca, revisa tu proyección y acepta la ruta que te acomode.</p>
          <Link className="btn btn-p" href="/cliente/biblioteca">Abrir la calculadora</Link>
        </section>
      )}
      <div className="grid2">
        <section className="card">
          <h3>Tus objetivos</h3>
          <p className="note" style={{ margin: '-4px 0 10px' }}>Definidos con {A.first} en tus asesorías.</p>
          <ul className="clean">
            {s.objetivos.filter((o) => o.active).map((o) => (
              <li key={o.id}><span className="chk" /><div>{o.x}<div className="who">Asesoría del {o.from}</div></div></li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h3>Tus pendientes</h3>
          <p className="note" style={{ margin: '-4px 0 10px' }}>Acordados en tus asesorías.</p>
          <ul className="clean">
            {s.pendientes.filter((p) => p.active).map((p) => (
              <li key={p.id}><span className={`chk ${p.done ? 'done' : ''}`}>{p.done ? '✓' : ''}</span><div>{p.x}<div className="who">{p.who}</div></div></li>
            ))}
          </ul>
        </section>
      </div>
      <div className="head" style={{ marginTop: 6 }}><span className="eyebrow">Resumen de tu última asesoría VIIGO</span></div>
      {last && <MeetingCard m={last} />}
      {pending && <p className="note">El resumen de la reunión del 23 de septiembre está en revisión. {A.first} lo publicará aquí cuando lo apruebe.</p>}
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
        nombre: v('nombre'), apellido: v('apellido'), mail: v('mail'), cel: v('cel'),
        edad: +v('edad') || P.edad, retiro: +v('retiro') || P.retiro, etapa: v('etapa') as StageKey,
        ingresoJub: +v('ing') || 0, afp: v('afp') === '' ? '' : +v('afp'),
      });
    });
    toast('Perfil guardado.');
  };
  const photo = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { up((d) => { d.P.foto = String(r.result); }); toast('Foto actualizada.'); };
    r.readAsDataURL(file);
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
          <div className="field"><label htmlFor="p-mail">Correo</label><input id="p-mail" name="mail" type="email" defaultValue={P.mail} autoComplete="email" /></div>
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
  const { s } = useStore();
  if (!s.route)
    return (
      <>
        <Head eb="Mi ruta" h="Tu ruta inmobiliaria" />
        <section className="empty">
          <h3>Todavía no aceptas una ruta</h3>
          <p>Entra a la calculadora VIIGO, prueba distintos valores y acepta la ruta que más te acomode. Aparecerá aquí.</p>
          <Link className="btn btn-p" href="/cliente/biblioteca">Ir a la calculadora</Link>
        </section>
      </>
    );
  const r = s.route.result, p = r.params;
  return (
    <>
      <Head eb="Mi ruta" h="Tu ruta inmobiliaria" p={`Aceptada el ${s.route.date}. Cada ciclo dura 8 años. Desde la propiedad final vives de su arriendo.`} />
      <section className="card">
        <div className="route">
          {r.steps.map((st, i) => (
            <div key={i} className={`stage ${i === 0 ? 'now' : ''}`}>
              <span className={`pill p-${st.ph.k}`} style={{ alignSelf: 'flex-start' }}>{st.ph.l.replace('VIIGO ', '')}</span>
              <span className="ages num">{st.a0}{st.final ? ` → ${r.retiro}+ años` : ` → ${st.a1} años`}</span>
              <h4>{st.final ? 'Propiedad final' : 'Ciclo ' + (i + 1)}</h4>
              <span className="price num">{ufs(st.price)}</span>
              <p>{st.final ? 'La conservas y te entrega ingreso mensual.' : `Pie ${ufs(st.pie)} · liberas ${ufs(st.cap ?? 0)}`}</p>
            </div>
          ))}
        </div>
      </section>
      <RetireCards r={r} />
      <section className="card">
        <h3>Detalle de tu ruta</h3>
        <RouteTable r={r} />
        <p className="note" style={{ marginTop: 10 }}>
          Primera propiedad UF {p.precio.toLocaleString('es-CL')}, pie {p.pie}%, tasa {String(p.tasa).replace('.', ',')}%, crédito a {p.plazo} años. Proyección referencial.
        </p>
        <div className="row" style={{ marginTop: 10 }}><Link className="btn btn-g" href="/cliente/biblioteca">Recalcular en la calculadora</Link></div>
      </section>
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
        <div className="alts">{s.alts.map((a) => <AltCard key={a.id} a={a} adv={false} />)}</div>
        <AltForm adv={false} />
      </>
    ),
    asesorias: () => (
      <>
        <Head eb="Mis asesorías" h="Tus reuniones VIIGO" />
        <NextMeetingCard adv={false} />
        {approved.slice().reverse().map((m) => <MeetingCard key={m.id} m={m} />)}
        {s.meetings.some((m) => m.status === 'revision') && <p className="note">El resumen del 23 de septiembre está en revisión por {s.adv.first}.</p>}
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
    mensajes: () => <ChatView role="cliente" eb="Mensajes" h="Escríbele a tu asesor" p={`Tu mensaje le llega a ${s.adv.name} por correo y queda registrado en tu ficha.`} />,
  };
  return (
    <AppShell role="cliente" tab={tab}>
      {views[tab]()}
    </AppShell>
  );
}
