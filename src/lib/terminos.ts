// Términos y condiciones y política de privacidad de Mi Ruta VIIGO.
// Al cambiar el texto de forma importante, sube TERMINOS_VERSION: la app volverá a pedir la aceptación.

export const TERMINOS_VERSION = 'v1';
export const TERMINOS_FECHA = '8 de octubre de 2026';

export type Seccion = { t: string; p: string[] };

export const TERMINOS: Seccion[] = [
  {
    t: '1. Qué es Mi Ruta VIIGO',
    p: [
      'Mi Ruta VIIGO es la aplicación del Método VIIGO de Viel.cl. Te permite usar la Calculadora VIIGO y la Biblioteca VIIGO y, si contratas el Programa VIIGO, acceder a tus sesiones de asesoría, tu planilla financiera y tu ruta inmobiliaria.',
      'El Método VIIGO es un programa educativo. Las proyecciones son referenciales y no constituyen asesoría financiera, tributaria ni legal personalizada, ni una recomendación de compra. Las decisiones de inversión son siempre tuyas.',
    ],
  },
  {
    t: '2. Confidencialidad y privacidad: nuestro compromiso',
    p: [
      'Nos comprometemos a mantener la privacidad y la confidencialidad de toda la información que registres en la aplicación y de lo que conversemos en las sesiones.',
      'Tu planilla financiera, tu ingreso objetivo y tu saldo AFP son privados: tu asesor solo puede verlos si tú lo autorizas, por el tiempo que elijas, y puedes quitar ese permiso cuando quieras. Cada vez que tu asesor abre tu planilla queda registrado y puedes verlo.',
      'No vendemos, arrendamos ni compartimos tus datos con terceros para fines comerciales.',
    ],
  },
  {
    t: '3. Qué datos usamos y para qué',
    p: [
      'Usamos los datos que tú ingresas (nombre, correo, celular, edad, datos financieros, propiedades de interés, mensajes) y los que se generan al usar la app (sesiones agendadas, resúmenes aprobados por tu asesor, ruta aceptada).',
      'Los usamos solo para prestarte el servicio: darte acceso, preparar y realizar tus sesiones, proyectar tu ruta y comunicarnos contigo.',
    ],
  },
  {
    t: '4. Sesiones por Google Meet',
    p: [
      'Las sesiones se realizan por Google Meet. Si una sesión se va a grabar o transcribir para preparar su resumen, te lo pediremos antes de empezar y podrás negarte. Los resúmenes solo se publican en tu portal después de que tu asesor los revisa.',
    ],
  },
  {
    t: '5. Quién más trata tus datos',
    p: [
      'Para operar la aplicación usamos proveedores tecnológicos que guardan o procesan datos por encargo nuestro, con medidas de seguridad: Supabase (base de datos y acceso), Vercel (alojamiento de la app) y Google Workspace (correo, calendario y Meet). No los usan para fines propios.',
      'Solo compartiremos información si la ley o una autoridad competente lo exige.',
    ],
  },
  {
    t: '6. Seguridad',
    p: [
      'Tu información viaja cifrada y está protegida con controles de acceso: cada cliente ve solo sus datos y cada asesor ve solo lo que corresponde a su trabajo. Entras a la app con un código de un solo uso enviado a tu correo, sin contraseñas.',
    ],
  },
  {
    t: '7. Tus derechos',
    p: [
      'Conforme a la ley chilena de protección de datos personales, puedes pedir acceso a tus datos, su rectificación, su eliminación o oponerte a su uso, escribiendo a soporte@viel.cl. Responderemos dentro de los plazos legales.',
      'Si eliminas tu cuenta, borraremos tus datos personales, salvo los que la ley nos obligue a conservar.',
    ],
  },
  {
    t: '8. Cambios',
    p: [
      'Si cambiamos estos términos de forma importante, te lo avisaremos en la app y te pediremos aceptarlos de nuevo.',
    ],
  },
];
