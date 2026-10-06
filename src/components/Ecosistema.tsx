// "Ecosistema inmobiliario Viel": las empresas que acompañan al cliente después de su ruta.
// Para cambiar un texto por el logo, guarda el archivo en /public/logos y escribe su ruta en `logo`.

type Empresa = { nombre: string; marca: [string, string]; color: string; logo?: string; url: string; para: string; cta: string };

const EMPRESAS: Empresa[] = [
  { nombre: 'Viel.cl', marca: ['Viel', '.cl'], color: '#22336B', url: 'https://viel.cl', para: 'Busca propiedades para comprar o arrendar, con el equipo que te acompaña en tu ruta.', cta: 'Ver propiedades' },
  { nombre: 'Viel PM', marca: ['Viel', ' PM'], color: '#008A8A', url: 'https://vielpm.cl', para: '¿Compraste tu propiedad de inversión? Te la administramos: arriendo, cobranza y mantención.', cta: 'Administrar mi propiedad' },
  { nombre: 'Capital Q', marca: ['Capital', ' Q'], color: '#ECAD52', url: 'https://capitalq.cl', para: 'Conoce proyectos nuevos preevaluados para tu siguiente etapa VIIGO.', cta: 'Ver proyectos nuevos' },
];

export function Ecosistema() {
  return (
    <section className="card eco">
      <span className="eyebrow">Ecosistema inmobiliario Viel</span>
      <h3 style={{ margin: '4px 0 2px' }}>Todo lo que necesitas para tu ruta, en un mismo lugar</h3>
      <p className="note" style={{ marginBottom: 14 }}>Empresas del grupo Viel que te acompañan en cada etapa: comprar, administrar y crecer.</p>
      <div className="eco-grid">
        {EMPRESAS.map((e) => (
          <a key={e.nombre} className="eco-item" href={e.url} target="_blank" rel="noopener" style={{ ['--eco' as string]: e.color }}>
            <span className="eco-logo" aria-label={e.nombre}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {e.logo ? <img src={e.logo} alt={e.nombre} /> : <b>{e.marca[0]}<span>{e.marca[1]}</span></b>}
            </span>
            <span className="eco-txt">{e.para}</span>
            <span className="eco-cta">{e.cta} ↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
