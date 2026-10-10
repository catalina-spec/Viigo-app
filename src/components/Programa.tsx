'use client';

// Plan del cliente: "diagnóstico" (gratis: Biblioteca + Calculadora + sesión de diagnóstico)
// o "programa" (Programa VIIGO pagado: 4 sesiones con Meet, planilla y alternativas).

import { useState } from 'react';
import { useStore } from '@/lib/store';

/** Secciones del cliente que se desbloquean con el Programa VIIGO. */
export const TABS_PROGRAMA = new Set(['alternativas', 'planilla']);

export const tienePrograma = (plan?: string) => plan === 'programa';

/** Tarjeta que invita a contratar el Programa VIIGO. El detalle se abre con "Más". */
export function OfertaPrograma({ compacta = false }: { compacta?: boolean }) {
  const { s, toast, demo, refrescar } = useStore();
  const [abierta, setAbierta] = useState(false);
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'enviado'>('listo');

  const quiero = async () => {
    setEstado('enviando');
    if (demo) {
      setEstado('enviado');
      return toast(`Demo: en la app real le llega un correo a ${s.adv.first} y un mensaje en el portal.`);
    }
    try {
      const res = await fetch('/api/programa/solicitud', { method: 'POST' });
      if (!res.ok) throw new Error();
      setEstado('enviado');
      toast(`Listo. Le avisamos a ${s.adv.first}; te contactará pronto.`);
      refrescar();
    } catch {
      setEstado('listo');
      toast('No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.');
    }
  };

  return (
    <section className="card oferta">
      <h3>{compacta ? 'Esta sección es parte del Programa VIIGO' : 'Arma tu ruta completa con tu asesor'}</h3>
      <button type="button" className="oferta-mas" aria-expanded={abierta} onClick={() => setAbierta(!abierta)}>
        {abierta ? 'Menos' : 'Más'} <span aria-hidden="true">{abierta ? '−' : '+'}</span>
      </button>
      {abierta && (
        <>
          <ul className="clean">
            <li><span className="chk">✓</span><div>Sesiones por Google Meet, agendadas desde la app</div></li>
            <li><span className="chk">✓</span><div>Tu Matriz de Análisis Financiero, privada y bajo tu control</div></li>
            <li><span className="chk">✓</span><div>Propiedades evaluadas con el Evaluador VIIGO</div></li>
            <li><span className="chk">✓</span><div>Resumen y objetivos de cada sesión en tu portal</div></li>
          </ul>
          <p className="note">Hoy tienes acceso gratis a la Calculadora VIIGO y a la Biblioteca. Cuando contrates el programa, tu asesor lo activa y se desbloquea todo.</p>
        </>
      )}
      <div className="row">
        {estado === 'enviado'
          ? <span className="pill p-ok">✓ Solicitud enviada a {s.adv.first}</span>
          : <button type="button" className="btn btn-p" onClick={quiero} disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Quiero el Programa VIIGO'}</button>}
      </div>
    </section>
  );
}
