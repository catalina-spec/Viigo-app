'use client';

// Plan del cliente: "diagnóstico" (gratis: Biblioteca + Calculadora + sesión de diagnóstico)
// o "programa" (Programa VIIGO pagado: 4 sesiones con Meet, planilla y alternativas).

import Link from 'next/link';
import { useStore } from '@/lib/store';

/** Secciones del cliente que se desbloquean con el Programa VIIGO. */
export const TABS_PROGRAMA = new Set(['alternativas', 'planilla']);

export const tienePrograma = (plan?: string) => plan === 'programa';

/** Tarjeta que invita a contratar el Programa VIIGO (o explica qué incluye). */
export function OfertaPrograma({ compacta = false }: { compacta?: boolean }) {
  const { s, href } = useStore();
  const A = s.adv;
  const msg = encodeURIComponent(`Hola ${A.first}, quiero contratar el Programa VIIGO.`);
  return (
    <section className="card oferta">
      <span className="eyebrow on">Programa VIIGO · 4 sesiones 1 a 1</span>
      <h3>{compacta ? 'Esta sección es parte del Programa VIIGO' : 'Arma tu ruta completa con tu asesor'}</h3>
      <ul className="clean">
        <li><span className="chk">✓</span><div>4 sesiones individuales por Google Meet, agendadas desde la app</div></li>
        <li><span className="chk">✓</span><div>Tu Matriz de Análisis Financiero, privada y bajo tu control</div></li>
        <li><span className="chk">✓</span><div>Propiedades evaluadas con el Evaluador VIIGO</div></li>
        <li><span className="chk">✓</span><div>Resumen y objetivos de cada sesión en tu portal</div></li>
      </ul>
      <p className="note">Hoy tienes acceso gratis a la Calculadora VIIGO y a la Biblioteca. Cuando contrates el programa, tu asesor lo activa y se desbloquea todo.</p>
      <div className="row">
        {A.wa ? <a className="btn btn-p" href={`https://wa.me/${A.wa}?text=${msg}`} target="_blank" rel="noopener">Quiero el Programa VIIGO</a>
          : <Link className="btn btn-p" href={href('cliente', 'mensajes')}>Quiero el Programa VIIGO</Link>}
        <Link className="btn btn-g" href={href('cliente', 'ruta')}>Usar la Calculadora</Link>
      </div>
    </section>
  );
}
