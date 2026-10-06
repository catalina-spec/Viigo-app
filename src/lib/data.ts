// Lectura y guardado de datos en Supabase.
// La app trabaja con un "estado" en memoria; cada cambio se compara con el anterior y se guarda aquí.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Me } from './supabase/server';
import type { State } from './store';
import type { Advisor, Alternativa, Cita, Debt, Meeting, Msg, Objetivo, Pendiente, Profile, StageKey } from './demo-data';
import { SESIONES } from './demo-data';
import { calcDefault, esRutaVigente } from './calc';

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const fmtFecha = (iso: string) => new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtCorta = (iso: string) => new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
export const fmtHora = (iso: string) => new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

const blankProfile = (): Profile => ({ nombre: '', apellido: '', mail: '', cel: '', edad: 30, retiro: 65, etapa: 'start', ingresoJub: 0, afp: '', foto: null });
const blankAdvisor = (): Advisor => ({ id: null, name: 'Tu asesor VIIGO', first: 'tu asesor', role: 'Asesor VIIGO · Viel.cl', phone: '', wa: '', mail: '', photo: null });

function toAdvisor(r: Row | null): Advisor {
  if (!r) return blankAdvisor();
  const name = `${r.nombre} ${r.apellido}`.trim() || r.email;
  return {
    id: r.id, nombre: r.nombre, apellido: r.apellido, name, first: r.nombre || name,
    role: r.cargo || 'Asesor VIIGO · Viel.cl', phone: r.celular, wa: (r.whatsapp || r.celular || '').replace(/\D/g, ''), mail: r.email, photo: r.foto_url,
  };
}

export function toMeeting(r: Row): Meeting {
  return {
    id: r.id, inicio: r.inicio, meet: r.meet_url, sesion: r.sesion,
    date: fmtFecha(r.inicio), dur: r.duracion_min ? `${r.duracion_min} min` : '',
    title: r.titulo || (r.sesion ? `Sesión ${r.sesion} · ${SESIONES[r.sesion - 1]?.titulo ?? ''}` : 'Asesoría VIIGO'),
    status: r.estado === 'aprobada' ? 'aprobado' : r.estado === 'revision' ? 'revision' : 'agendada',
    resumen: r.resumen ?? '', obj: r.objetivos ?? [], acuerdos: r.acuerdos ?? [], next: r.proxima ?? '',
  };
}

export function toCita(r: Row): Cita {
  const c = r.cliente ?? {};
  const dia = new Date(r.inicio).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '').replace(',', '');
  return {
    id: r.id, clienteId: r.cliente_id, inicio: r.inicio, cliente: `${c.nombre ?? ''} ${c.apellido ?? ''}`.trim() || c.email || 'Cliente',
    ses: r.sesion ?? 1, dia: dia.charAt(0).toUpperCase() + dia.slice(1), hora: fmtHora(r.inicio), meet: r.meet_url, enviado: !!r.calendar_event_id,
  };
}

/* ───────── carga inicial ───────── */
export async function loadInicial(sb: SupabaseClient, me: Me): Promise<Partial<State>> {
  if (me.rol === 'cliente') return { clientes: [], ...(await loadCliente(sb, me, me.id)) };

  const [{ data: yo }, { data: clientes }, { data: citas }, { data: google }] = await Promise.all([
    sb.from('perfiles').select('*').eq('id', me.id).single(),
    sb.from('perfiles').select('id,nombre,apellido,email,asesor_id').eq('rol', 'cliente').order('creado_en', { ascending: false }),
    sb.from('reuniones').select('*, cliente:perfiles!reuniones_cliente_id_fkey(nombre,apellido,email)')
      .eq('estado', 'agendada').gte('inicio', new Date(Date.now() - 2 * 3600e3).toISOString()).order('inicio'),
    sb.rpc('google_conectado'),
  ]);
  const lista = (clientes ?? []).map((c) => ({ id: c.id, nombre: c.nombre, apellido: c.apellido, email: c.email, mio: c.asesor_id === me.id }));
  let elegido: string | null = null;
  try { elegido = localStorage.getItem('viigo_cliente'); } catch {}
  if (!lista.some((c) => c.id === elegido)) elegido = (lista.find((c) => c.mio) ?? lista[0])?.id ?? null;
  const base: Partial<State> = { clientes: lista, adv: toAdvisor(yo), citas: (citas ?? []).map(toCita), google: (google as string | null) ?? null };
  if (!elegido) return { ...base, clienteId: null, P: blankProfile() };
  return { ...base, ...(await loadCliente(sb, me, elegido)), adv: toAdvisor(yo) };
}

/** Todos los datos de un cliente (lo que las reglas RLS permitan ver a quien está conectado). */
export async function loadCliente(sb: SupabaseClient, me: Me, id: string): Promise<Partial<State>> {
  const one = (t: string) => sb.from(t).select('*').eq('cliente_id', id).maybeSingle();
  const many = (t: string, order = 'creado_en') => sb.from(t).select('*').eq('cliente_id', id).order(order);
  const [perfil, priv, plan, permiso, ruta, alts, objs, pends, reus, msgs, log] = await Promise.all([
    sb.from('perfiles').select('*').eq('id', id).single(),
    one('datos_privados'), one('planillas'), one('permisos_planilla'), one('rutas'),
    many('alternativas'), many('objetivos'), many('pendientes'), many('reuniones', 'inicio'), many('mensajes'),
    me.rol === 'cliente' ? many('registro_accesos') : Promise.resolve({ data: [] as Row[] }),
  ]);
  const p = perfil.data as Row;
  const asesor = p?.asesor_id ? (await sb.from('perfiles').select('*').eq('id', p.asesor_id).maybeSingle()).data : null;
  const adv = toAdvisor(asesor);

  const P: Profile = {
    id: p.id, creado: p.creado_en, nombre: p.nombre, apellido: p.apellido, mail: p.email, cel: p.celular,
    edad: p.edad ?? 30, retiro: p.edad_retiro ?? 65, etapa: p.etapa as StageKey, foto: p.foto_url,
    ingresoJub: priv.data?.ingreso_jubilacion ?? 0, afp: priv.data?.saldo_afp ?? '',
  };

  const per = permiso.data as Row | null;
  const vigente = !!per && !per.revocado_en && (!per.hasta || new Date(per.hasta) > new Date());

  const meetingsAll = (reus.data ?? []).map(toMeeting);
  const proxima = meetingsAll.find((m) => m.status === 'agendada' && new Date(m.inicio!).getTime() > Date.now() - 2 * 3600e3) ?? null;
  const meetings = meetingsAll.filter((m) => m.status !== 'agendada');
  const rev = meetings.find((m) => m.status === 'revision');

  const nombreDe = (autor: string) => (autor === id ? P.nombre || 'Cliente' : autor === adv.id ? adv.first : 'Asesor VIIGO');
  const ruta0 = ruta.data as Row | null;

  return {
    clienteId: id, P, adv, proxima, meetings,
    draft: rev ? { resumen: rev.resumen, acuerdos: rev.acuerdos.join('\n'), objs: rev.obj.map((x) => ({ x, act: true })) } : { resumen: '', acuerdos: '', objs: [] },
    consent: vigente, grantedUntil: vigente ? (per!.hasta ? fmtFecha(per!.hasta) : 'que lo quites') : null, grantedUntilISO: vigente ? per!.hasta : null,
    F: (plan.data?.valores as Record<string, number>) ?? {},
    debts: (plan.data?.deudas as Debt[]) ?? [],
    route: ruta0 && esRutaVigente(ruta0.resultado) ? { result: ruta0.resultado, date: fmtFecha(ruta0.aceptada_en) } : null,
    calc: ruta0 && esRutaVigente(ruta0.resultado) ? { ...ruta0.resultado.params } : calcDefault(p.edad ?? 30),
    alts: (alts.data ?? []).map((a): Alternativa => ({
      id: a.id, nombre: a.nombre, comuna: a.comuna, tipo: a.tipo, uf: +a.precio_uf, link: a.link ?? '', m2: +(a.m2 ?? 0), arriendo: +(a.arriendo ?? 0),
      pts: a.puntaje, origen: a.origen, nota: a.nota,
    })).reverse(),
    objetivos: (objs.data ?? []).map((o): Objetivo => ({ id: o.id, x: o.texto, from: o.origen, active: o.activo })),
    pendientes: (pends.data ?? []).map((o): Pendiente => ({ id: o.id, x: o.texto, who: o.responsable === 'asesor' ? adv.first : P.nombre || 'Cliente', done: o.hecho, active: o.activo })),
    msgs: (msgs.data ?? []).map((m): Msg => ({ me: m.autor_id === id, x: m.texto, t: `${nombreDe(m.autor_id)} · ${fmtCorta(m.creado_en)}, ${fmtHora(m.creado_en)}` })),
    log: (log.data ?? []).map((l) => ({ t: `${fmtCorta(l.creado_en)}, ${fmtHora(l.creado_en)}`, x: l.texto })),
  };
}

/* ───────── guardado ───────── */
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const byId = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));

/** Compara el estado anterior con el nuevo y guarda las diferencias. Devuelve un mensaje de error o null. */
export async function sync(sb: SupabaseClient, me: Me, a: State, b: State): Promise<string | null> {
  const cid = b.clienteId;
  if (!cid) return null;
  const jobs: PromiseLike<{ error: unknown }>[] = [];
  const cliente = me.rol === 'cliente', asesor = me.rol === 'asesor';

  if (cliente && !same(a.P, b.P)) {
    const P = b.P;
    jobs.push(sb.from('perfiles').update({ nombre: P.nombre, apellido: P.apellido, celular: P.cel, edad: P.edad, edad_retiro: P.retiro, etapa: P.etapa, foto_url: P.foto }).eq('id', cid));
    jobs.push(sb.from('datos_privados').upsert({ cliente_id: cid, ingreso_jubilacion: P.ingresoJub || null, saldo_afp: P.afp === '' ? null : P.afp, actualizado_en: new Date().toISOString() }));
  }
  if (asesor && !same(a.adv, b.adv)) {
    const v = b.adv;
    jobs.push(sb.from('perfiles').update({ nombre: v.nombre ?? '', apellido: v.apellido ?? '', celular: v.phone, whatsapp: v.wa, cargo: v.role, foto_url: v.photo }).eq('id', me.id));
  }
  if (cliente && !same(a.route, b.route)) {
    jobs.push(b.route
      ? sb.from('rutas').upsert({ cliente_id: cid, parametros: b.route.result.params, resultado: b.route.result, aceptada_en: new Date().toISOString() })
      : sb.from('rutas').delete().eq('cliente_id', cid));
  }
  if (cliente && (a.consent !== b.consent || a.grantedUntilISO !== b.grantedUntilISO)) {
    if (b.consent) {
      if (!b.adv.id) return 'Aún no tienes un asesor asignado.';
      jobs.push(sb.from('permisos_planilla').upsert({ cliente_id: cid, asesor_id: b.adv.id, hasta: b.grantedUntilISO, revocado_en: null, otorgado_en: new Date().toISOString() }));
    } else {
      jobs.push(sb.from('permisos_planilla').update({ revocado_en: new Date().toISOString() }).eq('cliente_id', cid));
    }
  }
  if (cliente && b.log.length > a.log.length) {
    jobs.push(sb.from('registro_accesos').insert(b.log.slice(a.log.length).map((l) => ({ cliente_id: cid, texto: l.x }))));
  }
  if (b.msgs.length > a.msgs.length) {
    jobs.push(sb.from('mensajes').insert(b.msgs.slice(a.msgs.length).map((m) => ({ cliente_id: cid, texto: m.x }))));
  }

  // alternativas
  const A = byId(a.alts), B = byId(b.alts);
  for (const [id, x] of B) {
    const old = A.get(id);
    if (!old) jobs.push(sb.from('alternativas').insert({ id, cliente_id: cid, origen: x.origen, nombre: x.nombre, comuna: x.comuna, tipo: x.tipo, precio_uf: x.uf, m2: x.m2 || null, arriendo: x.arriendo || null, nota: x.nota, puntaje: x.pts, link: x.link || null }));
    else if (!same(old, x)) jobs.push(sb.from('alternativas').update({ puntaje: x.pts, nota: x.nota, link: x.link || null }).eq('id', id));
  }
  for (const id of A.keys()) if (!B.has(id)) jobs.push(sb.from('alternativas').delete().eq('id', id));

  if (asesor) {
    // objetivos y pendientes
    const O = byId(a.objetivos);
    for (const o of b.objetivos) {
      const old = O.get(o.id);
      if (!old) jobs.push(sb.from('objetivos').insert({ id: o.id, cliente_id: cid, texto: o.x, origen: o.from, activo: o.active }));
      else if (!same(old, o)) jobs.push(sb.from('objetivos').update({ texto: o.x, activo: o.active }).eq('id', o.id));
    }
    const Q = byId(a.pendientes);
    for (const p of b.pendientes) {
      const old = Q.get(p.id);
      const row = { texto: p.x, activo: p.active, hecho: p.done, responsable: p.who === b.adv.first ? 'asesor' : 'cliente' };
      if (!old) jobs.push(sb.from('pendientes').insert({ id: p.id, cliente_id: cid, ...row }));
      else if (!same(old, p)) jobs.push(sb.from('pendientes').update(row).eq('id', p.id));
    }
    // aprobación de resúmenes
    const M = byId(a.meetings);
    for (const m of b.meetings) {
      const old = M.get(m.id);
      if (old && !same(old, m)) {
        jobs.push(sb.from('reuniones').update({ estado: m.status === 'aprobado' ? 'aprobada' : 'revision', resumen: m.resumen, objetivos: m.obj, acuerdos: m.acuerdos }).eq('id', m.id));
      }
    }
    // Las citas nuevas se crean por /api/reuniones (Google Calendar + Meet), no aquí.
  }

  const res = await Promise.all(jobs);
  const err = res.find((r) => r.error);
  if (err) {
    console.error('Error al guardar', err.error);
    return 'No se pudo guardar el último cambio. Revisa tu conexión.';
  }
  return null;
}

/** Guarda la planilla (se llama con una pausa para no guardar en cada tecla). */
export async function savePlanilla(sb: SupabaseClient, cid: string, F: Record<string, number>, debts: Debt[]) {
  const { error } = await sb.from('planillas').upsert({ cliente_id: cid, valores: F, deudas: debts, actualizado_en: new Date().toISOString() });
  return error ? 'No se pudo guardar tu planilla. Revisa tu conexión.' : null;
}

/** Achica una foto antes de guardarla (máx. 320 px, JPG). */
export function resizeImage(file: File, max = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
