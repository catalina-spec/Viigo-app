// Datos de ejemplo (Andrés y su asesor Catalina).
// En el siguiente paso se reemplazan por la base de datos de Supabase.

export type StageKey = 'start' | 'grow' | 'equity' | 'legacy';

export const STAGES: Record<StageKey, { label: string; desc: string }> = {
  start: { label: 'VIIGO START', desc: '27–35 años · Tu primera propiedad de inversión' },
  grow: { label: 'VIIGO GROW', desc: '35–43 años · Das el salto a una propiedad mayor' },
  equity: { label: 'VIIGO EQUITY', desc: '43–49 años · Tu arriendo supera el dividendo' },
  legacy: { label: 'VIIGO LEGACY', desc: '49–65 años · Tu propiedad final e ingreso de por vida' },
};

export type Advisor = {
  id?: string | null; nombre?: string; apellido?: string;
  name: string; first: string; role: string; phone: string; wa: string; mail: string; photo: string | null;
};
export type Profile = {
  id?: string; creado?: string;
  nombre: string; apellido: string; mail: string; cel: string; edad: number; retiro: number;
  etapa: StageKey; ingresoJub: number; afp: number | ''; foto: string | null;
  /** diagnostico = gratis (biblioteca + calculadora); programa = Programa VIIGO pagado. */
  plan?: Plan; terminos?: string | null;
};
export type Plan = 'diagnostico' | 'programa';
export type Meeting = {
  id: string; date: string; dur: string; title: string; status: 'aprobado' | 'revision' | 'agendada';
  resumen: string; obj: string[]; acuerdos: string[]; next: string;
  inicio?: string; meet?: string | null; sesion?: number | null;
};
export type Objetivo = { id: string; x: string; from: string; active: boolean };
export type Pendiente = { id: string; x: string; who: string; done: boolean; active: boolean };
export type Alternativa = {
  id: string; nombre: string; comuna: string; tipo: string; uf: number; m2: number; arriendo: number;
  pts: number | null; origen: 'asesor' | 'cliente'; nota: string; link?: string;
};
export type Debt = Record<'tipo' | 'inst' | 'orig' | 'saldo' | 'cuota' | 'tasa' | 'plazo' | 'rest', string | number>;
export type Msg = { me: boolean; x: string; t: string };
export type Cita = { id: string; cliente: string; ses: number; dia: string; hora: string; meet: string | null; enviado: boolean; clienteId?: string; inicio?: string };

export const ADV: Advisor = {
  name: 'Catalina Viel', first: 'Catalina', role: 'Asesora VIIGO · Viel.cl',
  phone: '+56 9 9999 9999', wa: '56999999999', mail: 'catalina@viel.cl', photo: null,
};
export const MEET_URL = 'https://meet.google.com/';

export const PROFILE: Profile = {
  nombre: 'Andrés', apellido: 'Muñoz', mail: 'andres.munoz@correo.cl', cel: '+56 9 8765 4321',
  edad: 28, retiro: 65, etapa: 'start', ingresoJub: 1500000, afp: '', foto: null, plan: 'programa', terminos: null,
};

export const MEETINGS: Meeting[] = [
  {id:'1', date:'12 ago 2026', dur:'52 min', title:'Diagnóstico inicial', status:'aprobado',
   resumen:'Conversamos sobre la situación actual de Andrés y lo que quiere lograr. Arrienda donde vive, tiene ahorros en depósitos y fondos mutuos, y quiere que su jubilación no dependa solo de la AFP.',
   obj:['Jubilar a los 65 con un ingreso mensual que no dependa solo de la AFP','Comprar la primera propiedad de inversión antes de fin de año','No comprometer más del 25% de su renta en dividendos'],
   acuerdos:['Andrés completa su planilla financiera en el portal','Catalina prepara la ruta VIIGO personalizada'], next:'Definición de ruta · 2 sep'},
  {id:'2', date:'2 sep 2026', dur:'61 min', title:'Definición de la ruta VIIGO', status:'aprobado',
   resumen:'Revisamos la planilla financiera y la calculadora VIIGO. Andrés se identificó con la etapa START y definimos partir con un departamento de 1 o 2 dormitorios en la zona oriente.',
   obj:['Partir en VIIGO START con un depto de 1 o 2 dormitorios en la zona oriente','Pie objetivo: UF 640 (20%)','Mantener un fondo de reserva de 3 dividendos'],
   acuerdos:['Andrés revisa y acepta su ruta en la calculadora VIIGO','Catalina sugiere 3 propiedades preevaluadas por Capital Q','Andrés pide preaprobación hipotecaria en 2 bancos'], next:'Evaluación de propiedades · 23 sep'},
  {id:'3', date:'23 sep 2026', dur:'47 min', title:'Evaluación de la primera propiedad', status:'revision',
   resumen:'Comparamos las alternativas de Ñuñoa y Providencia con el Evaluador VIIGO. Ñuñoa obtuvo 84 puntos y mejor relación entre arriendo y dividendo. Andrés quiere confirmar los gastos comunes antes de ofertar.',
   obj:['Elegir entre Ñuñoa (UF 3.200) y Providencia (UF 3.450)','Confirmar que el arriendo cubra al menos el 85% del dividendo','Ofertar antes del 15 de octubre'],
   acuerdos:['Ñuñoa queda como primera opción: 84 pts en el Evaluador VIIGO','Andrés revisa gastos comunes y visita el sábado','Catalina pide contraoferta a UF 3.120'], next:'Cierre de oferta · 14 oct'},
];

export const OBJETIVOS: Objetivo[] = [
  {id:'o1', x:'Comprar tu primera propiedad de inversión antes de diciembre', from:'2 sep', active:true},
  {id:'o2', x:'Jubilar a los 65 con ingreso por arriendo, además de tu AFP', from:'12 ago', active:true},
  {id:'o3', x:'No destinar más del 25% de tu renta al dividendo', from:'12 ago', active:true},
  {id:'o4', x:'Mantener un fondo de reserva equivalente a 3 dividendos', from:'2 sep', active:false},
];
export const PENDIENTES: Pendiente[] = [
  {id:'p1', x:'Subir preaprobación del Banco de Chile', who:'Andrés', done:true, active:true},
  {id:'p2', x:'Subir preaprobación del Santander', who:'Andrés', done:false, active:true},
  {id:'p3', x:'Revisar gastos comunes del depto de Ñuñoa', who:'Andrés', done:false, active:true},
  {id:'p4', x:'Enviar contraoferta a UF 3.120', who:'Catalina', done:false, active:false},
];

export const ALTS: Alternativa[] = [
  {id:'a1', nombre:'Depto 2D1B · Av. Irarrázaval', comuna:'Ñuñoa', tipo:'Departamento', uf:3200, m2:52, arriendo:470000, pts:84, origen:'asesor', nota:'Cerca del metro. Buen arriendo para la zona. Revisar gastos comunes.', link:'https://www.viel.cl'},
  {id:'a2', nombre:'Depto 2D2B · Metro Manuel Montt', comuna:'Providencia', tipo:'Departamento', uf:3450, m2:55, arriendo:490000, pts:76, origen:'asesor', nota:'Más caro por m², pero con alta demanda de arriendo.'},
  {id:'a3', nombre:'Depto 1D1B · Príncipe de Gales', comuna:'La Reina', tipo:'Departamento', uf:2900, m2:44, arriendo:400000, pts:null, origen:'cliente', nota:'Lo vi en un portal. ¿Vale la pena evaluarlo?'},
];

/* Matriz de Análisis Financiero VIIGO */
export type FinRow = [key: string, label: string, unit: 'clp' | 'uf'];
export type FinGroup = { t: string; tot: string; rows: FinRow[] };
export const FIN: Record<'patrimonio' | 'ingresos' | 'gastos', { title: string; groups: FinGroup[] }> = {
  patrimonio:{title:'Patrimonio actual', groups:[
    {t:'Activos líquidos', tot:'liq', rows:[['cc','Saldo en cuenta corriente (promedio)','clp'],['dap','Depósitos a plazo / fondos mutuos','clp'],['dapuf','Depósitos a plazo / fondos mutuos en UF','uf'],['icp','Inversiones de corto plazo','clp'],['icpuf','Inversiones de corto plazo en UF','uf'],['oliq','Otros activos líquidos','clp']]},
    {t:'Activos no líquidos', tot:'noliq', rows:[['prop','Valor comercial propiedad habitacional','uf'],['veh','Valor comercial de vehículos','clp'],['oacc','Otros activos (acciones, cripto, etc.)','clp'],['oaccuf','Otros activos en UF','uf'],['onoliq','Otros activos no líquidos','clp']]}]},
  ingresos:{title:'Ingresos mensuales', groups:[
    {t:'Ingresos fijos (netos mensuales)', tot:'ingF', rows:[['sue1','Sueldo / honorarios (principal)','clp'],['sue2','Sueldo / honorarios (secundario)','clp'],['arrR','Arriendos recibidos','clp'],['pens','Pensiones / rentas','clp'],['oif','Otros ingresos fijos','clp']]},
    {t:'Ingresos variables (promedio mensual neto)', tot:'ingV', rows:[['bon','Bonos / comisiones (promedio anual ÷ 12)','clp'],['divi','Dividendos / intereses de inversiones','clp'],['oiv','Otros ingresos variables','clp']]}]},
  gastos:{title:'Gastos mensuales', groups:[
    {t:'Gastos fijos', tot:'gF', rows:[['gdiv','Dividendo hipotecario (vivienda)','clp'],['garr','Arriendo','clp'],['serv','Servicios básicos','clp'],['edu','Educación','clp'],['sal','Salud (seguros, planes, consultas)','clp'],['trans','Transporte','clp'],['ccons','Créditos de consumo (cuotas)','clp'],['seg','Seguros (vida, auto, hogar)','clp'],['ogf','Otros gastos fijos','clp']]},
    {t:'Gastos variables', tot:'gV', rows:[['alim','Alimentación','clp'],['rest','Restaurantes / salidas / delivery','clp'],['entr','Entretenimiento / streaming','clp'],['vest','Vestuario / cuidado personal','clp'],['vac','Vacaciones (promedio anual ÷ 12)','clp'],['ogv','Otros gastos variables','clp']]}]},
};
export const FIN_VALUES: Record<string, number> = {cc:1200000,dap:18000000,dapuf:0,icp:5800000,icpuf:0,oliq:0, prop:0,veh:7500000,oacc:1200000,oaccuf:0,onoliq:0,
  sue1:1850000,sue2:0,arrR:0,pens:0,oif:0,bon:150000,divi:45000,oiv:0,
  gdiv:0,garr:520000,serv:95000,edu:0,sal:85000,trans:120000,ccons:0,seg:25000,ogf:30000,alim:220000,rest:90000,entr:35000,vest:50000,vac:60000,ogv:40000};
export const DEBTS: Debt[] = [{tipo:'Tarjeta de crédito',inst:'Banco de Chile',orig:1500000,saldo:1100000,cuota:180000,tasa:24,plazo:12,rest:7}];

export const MSGS: Msg[] = [
  {me:false, x:'Hola Andrés, revisa el depto de Ñuñoa que te dejé en tus alternativas y me cuentas qué te pareció.', t:'Catalina · 24 sep, 10:15'},
  {me:true,  x:'¡Gracias! Lo fui a ver el sábado. Me gustó, pero quiero entender bien el gasto común.', t:'Andrés · 26 sep, 12:03'},
];

export const CITAS: Cita[] = [
  {id:'c1', cliente:'Andrés Muñoz', ses:4, dia:'Mié 14 oct', hora:'18:30', meet:'https://meet.google.com/vgo-andr-mnz', enviado:true},
  {id:'c2', cliente:'Carolina Soto', ses:1, dia:'Jue 15 oct', hora:'10:00', meet:'https://meet.google.com/vgo-caro-sto', enviado:true},
  {id:'c3', cliente:'Martín Rojas', ses:2, dia:'Jue 15 oct', hora:'17:00', meet:'https://meet.google.com/vgo-mart-rjs', enviado:false},
  {id:'c4', cliente:'Francisca Leiva', ses:3, dia:'Vie 16 oct', hora:'12:30', meet:'https://meet.google.com/vgo-fran-lva', enviado:false},
];

/* Programa de 4 sesiones (solo asesor) */
export type Sesion = {
  n: number; titulo: string; dur: string; meta: string; obj: string[]; laminas: string[];
  relato: [string, string, string][]; preguntas: string[]; tarea: string; cierre: string[];
};
export const SESIONES: Sesion[] = [
 {n:0, titulo:'Sesión de diagnóstico', dur:'30 min',
  meta:'El cliente nombra con sus palabras qué lo ha frenado, ve su foto financiera y decide si toma el Programa VIIGO.',
  obj:['Crear confianza y dejar claro que la llamada puede terminar en un \"no\"','Que el cliente nombre qué lo ha frenado (anótalo textual)','Tener su foto: edad, ahorro, pie y plazo que imagina','Que sienta lo que le cuesta no decidir','Que se imagine con su primera propiedad trabajando para él','Mostrar cómo el Método VIIGO resuelve lo que dijo','Que reserve su cupo o agende la decisión'],
  laminas:['Ahorrar te da tranquilidad, invertir te da patrimonio','La tasa de reemplazo: necesitas el 70% de tu sueldo','El plazo del crédito: ¿20 o 30 años?','Las 4 etapas VIIGO','El Programa VIIGO: 4 sesiones','La Calculadora VIIGO'],
  relato:[
   ['1. Apertura y marco','0–3 min','\"La idea de hoy es simple: entender en qué etapa estás, qué te preocupa de tu jubilación y qué planes tienes con tus ahorros. Si veo que el Método VIIGO te puede servir, te cuento cómo trabajamos. Si no, te lo digo con la misma honestidad. Nosotros no vendemos propiedades por vender: construimos rutas de vida.\"'],
   ['2. El problema','3–8 min','Que nombre, con sus palabras, qué lo ha frenado. Anótalo textual: lo usarás en el bloque 6. Si ya habló con corredores: \"¿Te preguntaron por tus números antes de mostrarte propiedades?\"'],
   ['3. Contexto y números','8–16 min','Su foto en 8 minutos: edad, ahorros, ahorro mensual, % que le pagaría la AFP. Instala: \"Tu plata hoy está ahorrada, no invertida\" y la tasa de reemplazo del 70%. Siembra la pregunta del plazo: ¿20 o 30 años?'],
   ['4. El costo de esperar','16–20 min','Pregunta y deja silencio: \"Si pasan otros cinco años y sigues igual, ¿cómo se ve tu vida a los 65?\"'],
   ['5. La visión','20–23 min','Del miedo a la posibilidad: \"Imagina que ya tienes tu primera propiedad, bien elegida y con un crédito pensado para crecer.\" Pregunta si la decisión la conversa con su pareja.'],
   ['6. El Programa VIIGO','23–27 min','Usa sus palabras del bloque 2: \"Tú me dijiste que… Tu problema no es de capacidad: te falta un método.\" Explica las sesiones: tus números reales, tu proyección a los 65 y tu ruta completa.'],
   ['7. Compromiso y cierre','27–30 min','Toma la temperatura (del 1 al 10) y presenta la oferta: "El Programa VIIGO tiene un valor de UF 8." Termina siempre con un próximo paso con fecha. Si dice que sí: desbloquea su Programa VIIGO en la app y agenda la semana 1.']],
  preguntas:['Hoy, ¿cuál es el obstáculo más grande que te ha impedido dar el paso en la inversión inmobiliaria?','¿Cuánto logras ahorrar al mes después de todos tus gastos?','Si hoy te jubilaras, ¿qué porcentaje de tu sueldo crees que te pagaría la AFP?','¿Hace cuánto tiempo le vienes dando vueltas a invertir sin decidirte por nada concreto?','¿Cómo te sentirías sabiendo que ya tienes un activo trabajando para tu jubilación?'],
  tarea:'Probar la Calculadora VIIGO en la app (Mi ruta) y revisar la Biblioteca VIIGO. Si toma el programa: completar su perfil y su Matriz de Análisis Financiero.',
  cierre:['Del 1 al 10, ¿qué tan prioritario es para ti que tu nivel de vida no caiga cuando dejes de trabajar?','Si el plan calza con tus ahorros y tus metas, ¿sientes que hoy es el momento de tomar el control?']},
 {n:1, titulo:'Fundamentos y desbloqueo', dur:'60 min',
  meta:'El cliente sale con convicción, no solo con interés.',
  obj:['Instalar la diferencia entre ahorrar e invertir','Mostrar por qué la propiedad combina plusvalía con apalancamiento','Dimensionar la jubilación: tasa de reemplazo de 70% y mayor expectativa de vida','Derribar los mitos que lo han frenado','Recoger sus objetivos financieros y cualitativos'],
  laminas:['Ahorrar te da tranquilidad, invertir te da patrimonio','Plusvalía + apalancamiento','La tasa de reemplazo: necesitas el 70% de tu sueldo','Vivimos más años: tu ingreso tiene que durar más','La realidad de la AFP','El costo de no decidir','Mitos que te frenan','Empezamos por ti, no por la propiedad'],
  relato:[
   ['Check-in','5 min','¿Cuántos años llevas diciendo que este es el año? Escucha sin apurar: ahí está su dolor.'],
   ['Ahorrar vs. invertir','10 min','Ahorrar te da tranquilidad; invertir te da patrimonio. Pregunta: "Hoy, ¿tu plata está ahorrada o invertida?". Casi todos dicen ahorrada.'],
   ['Plusvalía + apalancamiento','10 min','Con una propiedad de UF 3.200 y pie de UF 640, un 1% de plusvalía son UF 32 al año: el 5% de lo que pusiste, sin contar el arriendo. El arrendatario ayuda a pagar el dividendo.'],
   ['La jubilación real','10 min','Para mantener tu nivel de vida necesitas cerca del 70% de tu sueldo, y vivimos cada vez más. En la AFP, $100 millones ahorrados dan cerca de $500.000 al mes. Que el cliente saque su propia cuenta.'],
   ['Mitos','10 min','"Endeudarse es malo", "necesito mucha plata", "ya estoy tarde", "mejor espero". Pregunta de dónde viene cada idea antes de responder.'],
   ['Objetivos','10 min','Anota con sus palabras: ingreso deseado a los 65, edad de retiro, pie disponible, para qué quiere este patrimonio y qué le da miedo.'],
   ['Cierre','5 min','Aclara: "En estas semanas no te voy a mostrar propiedades. Primero tus números". Deja la tarea y haz las 2 preguntas de cierre.']],
  preguntas:['Hoy, ¿tu plata está ahorrada o invertida? ¿Qué te ha dado cada una?','Si no haces nada distinto, ¿cómo te imaginas tus finanzas a los 65? ¿Y a los 85?','¿Qué es exactamente lo que te da miedo: la deuda, equivocarte de propiedad o no poder pagar?','¿Qué tendría que pasar para que te sintieras seguro de dar el paso?','¿Qué te cuesta más: tomar la decisión o saber cuál es la correcta?'],
  tarea:'Pedir una simulación de crédito hipotecario en su banco: monto máximo, tasa, dividendo a 20, 25 y 30 años, pie mínimo y documentos.',
  cierre:['Si tuvieras que explicarle a alguien en una frase por qué invertir en una propiedad, ¿qué le dirías?','Del 1 al 10, ¿qué tan convencido estás de que este es tu camino? ¿Qué falta para llegar a 10?']},
 {n:2, titulo:'Método VIIGO y las 4 etapas', dur:'60 min',
  meta:'El cliente se ubica en una etapa y entiende que su camino es una ruta, no una propiedad.',
  obj:['Explicar el ciclo VIIGO de 8 años','Presentar las 4 etapas y la regla de los 58','Recorrer los 5 pilares que sustentan el modelo','Que el cliente se reconozca en una etapa','Pedir la Matriz de Análisis Financiero y explicar su privacidad'],
  laminas:['El ciclo VIIGO de 8 años','Las 4 etapas: START, GROW, EQUITY, LEGACY','La regla de los 58','Los 5 pilares VIIGO','Una ruta, no una propiedad','¿Por qué todos te ofrecen 30 años?','Tu tarea: tu Matriz financiera privada'],
  relato:[
   ['Repaso de la tarea','5 min','¿Qué te sorprendió del monto que te prestan? No analices todavía: solo registra la reacción.'],
   ['El ciclo de 8 años','10 min','Compras con crédito y arriendas. En 8 años la propiedad sube y la deuda baja. Al vender, esa diferencia es el pie de la siguiente, más grande.'],
   ['Las 4 etapas','15 min','START 27–35, GROW 35–43, EQUITY 43–49, LEGACY 49–65. La edad es referencia: quien no tiene propiedades parte con lógica START. El último ciclo con crédito cierra antes de los 58.'],
   ['Los 5 pilares','10 min','Valorización de la inversión, Ingresos pasivos, Incentivos tributarios, Gestión de la inversión y Oportunidad de escalabilidad. Pide que elija el que más le importa.'],
   ['Ruta vs. propiedad','10 min','Sin ruta no hay segunda compra; sin segunda no hay escalamiento; sin escalamiento no hay patrimonio. Siembra la pregunta: ¿por qué todos ofrecen 30 años?'],
   ['Cierre','10 min','"Tu planilla es privada. No puedo verla si tú no me autorizas, y tú decides por cuánto tiempo." Deja la tarea y haz las 2 preguntas.']],
  preguntas:['Mirando las 4 etapas, ¿en cuál te reconoces hoy? ¿Por qué?','¿En qué etapa te gustaría estar en 5 años?','¿Qué cambia en tu forma de ver la deuda si cada venta financia la siguiente compra?','De los 5 pilares, ¿cuál te mueve y cuál te genera más dudas?','¿Qué te diría tu yo de 65 años sobre la decisión que estás por tomar?'],
  tarea:'Completar la Matriz de Análisis Financiero en su portal con datos lo más fieles posible: patrimonio, ingresos, gastos y deudas.',
  cierre:['¿En qué etapa VIIGO te ubicas hoy y qué tendría que pasar para llegar a la siguiente?','¿Qué diferencia ves entre comprar una propiedad y tener una ruta patrimonial?']},
 {n:3, titulo:'Análisis financiero personal', dur:'60 min',
  meta:'El cliente ve por primera vez la foto completa de su situación y confirma su etapa.',
  obj:['Revisar la Matriz en vivo (si el cliente la comparte)','Leer patrimonio neto, flujo, endeudamiento y pie disponible','Calcular su meta: el 70% de su renta (tasa de reemplazo)','Ver cuánto de su plata está ahorrada y cuánto invertida','Confirmar su etapa según edad y finanzas'],
  laminas:['Tu patrimonio neto en un número','Tu flujo mensual disponible','Tu nivel de endeudamiento','Tu meta: el 70% de tu sueldo','¿Ahorrado o invertido?','Tu pie y tu dividendo máximo (25%)','Lo que te presta el banco vs. lo que te conviene','Tu etapa VIIGO'],
  relato:[
   ['Antes de empezar','5 min','El cliente comparte su planilla desde el portal o la muestra en pantalla. Si no quiere, trabaja con rangos y respeta su decisión.'],
   ['La foto completa','20 min','En orden: patrimonio neto, flujo mensual, endeudamiento (hasta 30% saludable, 30–45% moderado, sobre 45% alto), pie disponible y dividendo máximo del 25% de su renta.'],
   ['Su meta y su plata','10 min','Calculen juntos el 70% de su renta: esa es su meta de jubilación. Luego miren sus activos: ¿cuánto está ahorrado y cuánto invertido?'],
   ['Banco vs. conveniencia','10 min','Compara lo que le prestan con lo que le conviene. Que el banco preste mucho no significa usarlo todo.'],
   ['Su etapa','10 min','Sin propiedades: START. Con plusvalía acumulada: GROW. Con arriendo que cubre dividendos: EQUITY. Con 49+ o cerca de los 58: LEGACY.'],
   ['Cierre','5 min','Deja la tarea y haz las 2 preguntas. Tono de acompañamiento, nunca de juicio.']],
  preguntas:['¿Qué sientes al ver tu patrimonio neto en un solo número?','¿A dónde se va la plata que no ves?','Si tuvieras que liberar $200.000 al mes para tu ruta, ¿de dónde saldrían?','¿Tu plata de hoy está trabajando para ti o solo está guardada?','Con estos números, ¿en qué etapa te ubicas de verdad?'],
  tarea:'Probar la Calculadora VIIGO en su biblioteca, actualizar la simulación bancaria con el monto definido y anotar sus dudas.',
  cierre:['¿Cuál es el número de tu planilla que más te llamó la atención y por qué?','¿Qué decisión sobre tu plata tomarías distinto desde hoy?']},
 {n:4, titulo:'Proyección a 65 con la Calculadora VIIGO', dur:'60 min',
  meta:'El cliente ve su patrimonio e ingreso a los 65, entiende el plazo del crédito y sale con su ruta armada.',
  obj:['Cargar sus datos reales en la Calculadora VIIGO','Mostrar el efecto del plazo del crédito (20, 25 y 30 años)','Comparar su ingreso a los 65 con su meta del 70%','Recoger sus comentarios','Revisar alternativas usadas o nuevas y armar la ruta'],
  laminas:['Tu ruta en la calculadora','El plazo del crédito: 20, 25 o 30 años','Capital liberado y tu siguiente salto','Tu patrimonio a los 65','Tu ingreso vs. tu meta del 70%','Usada o nueva','Tu ruta VIIGO completa','Próximos pasos'],
  relato:[
   ['En vivo','10 min','Abre la calculadora con su edad, su pie, la tasa de su simulación y el precio definido. Deja que él mueva los valores.'],
   ['El click del plazo','15 min','Mismo caso a 20, 25 y 30 años. A 30 la cuota se ve cómoda, pero al vender en el año 8 queda más deuda y menos capital. A 20 años pone ~$124.000 más al mes y su siguiente propiedad es casi 30% mayor. Sé transparente: el plazo corto exige más flujo.'],
   ['Su meta','10 min','Compara el ingreso a los 65 con el 70% de su sueldo. Vivimos más años: un arriendo de por vida vale más que un ahorro que se agota. Si no llega, ajusten precio, pie o plazo.'],
   ['Comentarios','5 min','¿Qué te parece tu ruta? ¿Qué te preocupa? ¿Qué plazo te hace sentido? Anota sus palabras.'],
   ['Alternativas','15 min','Revisen opciones usadas y nuevas: arriendo inmediato vs. desde la entrega, precio negociable vs. de lista, pie al contado vs. en cuotas. Déjalas en su portal.'],
   ['Cierre','5 min','Pídele que acepte su ruta en el portal y agenda la evaluación de propiedades. Haz las 2 preguntas.']],
  preguntas:['Ahora que ves tu número a los 65, ¿qué sientes?','¿Por qué crees que a casi todos les ofrecen 30 años?','¿Prefieres una cuota cómoda hoy o un salto más grande en 8 años?','¿Qué tendría que ser cierto para que dieras el primer paso este año?','¿Qué le dirías hoy a la persona que llevaba años diciendo que este es el año?'],
  tarea:'Aceptar su ruta en el portal, pedir la preaprobación hipotecaria formal y revisar las alternativas guardadas.',
  cierre:['¿Qué aprendiste hoy sobre el plazo del crédito que no sabías antes?','¿Cuál es tu primer paso concreto y en qué fecha lo vas a dar?']},
];
export const NEXT_SESSION = { cliente: 'Andrés Muñoz', n: 4, fecha: '14 oct, 18:30' };

/** Nombre corto de una sesión: "Diagnóstico" o "Semana N". */
export const sesionNombre = (n: number) => (n === 0 ? 'Diagnóstico' : 'Semana ' + n);
/** Título de una sesión por su número (0 = diagnóstico). */
export const sesionTitulo = (n: number) => SESIONES.find((x) => x.n === n)?.titulo ?? '';
