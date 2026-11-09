// Datos de ejemplo (Andrés y su asesor Catalina).
// En el siguiente paso se reemplazan por la base de datos de Supabase.

export type StageKey = 'start' | 'grow' | 'equity' | 'legacy';

export const STAGES: Record<StageKey, { label: string; desc: string }> = {
  start: { label: 'VIIGO START', desc: '27–35 años · Tu primera propiedad de inversión' },
  grow: { label: 'VIIGO GROW', desc: '35–43 años · Das el salto a una propiedad mayor' },
  equity: { label: 'VIIGO EQUITY', desc: '43–49 años · Tu arriendo supera el dividendo' },
  legacy: { label: 'VIIGO LEGACY', desc: '49–65 años · Tu propiedad final e ingreso de por vida' },
};

/** Etapa del Método VIIGO según la edad (menos de 35: START · 35–42: GROW · 43–48: EQUITY · 49 o más: LEGACY). */
export const etapaPorEdad = (edad: number): StageKey => (edad < 35 ? 'start' : edad < 43 ? 'grow' : edad < 49 ? 'equity' : 'legacy');

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
  /** Solo el diagnóstico: precalificación con 3 señales, 3 salidas y frases clave para vender el programa. */
  precal?: Precal;
};
export type Precal = {
  /** [señal, verde, amarillo, rojo] */
  senales: [string, string, string, string][];
  reglas: string[];
  salidas: { t: string; cuando: string; guion: string; paso: string }[];
  /** [frase, qué decir, cuándo usarla] */
  claves: [string, string, string][];
};
export const SESIONES: Sesion[] = [
 {"n":0,"titulo":"Sesión de diagnóstico","dur":"30 min","meta":"Precalificar al cliente con 3 señales y cerrar con una de las 3 salidas. Sale viendo su jubilación en dos escenarios en la Calculadora VIIGO (no un catálogo de propiedades) y con un siguiente paso agendado.","obj":["Bajar la guardia y dejar claro que puede que no le ofrezcas nada","Entender qué lo frena (anota sus palabras exactas) y su situación de vida","Tener sus números reales: ingreso, ahorro, pie, deudas y plazo del crédito","Marcar las 3 señales: ahorro, capacidad de crédito y decisión","Mostrarle en la Calculadora VIIGO su AFP sola vs. su ruta VIIGO","Cerrar con una sola salida y un siguiente paso con fecha"],"laminas":["La Calculadora VIIGO: Mis Datos","Opción 1: solo AFP","Ciclos VIIGO","Los 3 escenarios","El plazo del crédito: ¿20 o 30 años?","El Programa VIIGO: 4 sesiones"],"relato":[["Antes de la llamada","","Abre la Calculadora VIIGO con lo que puso al registrarse (edad, ingreso, ahorro) y ten a mano una hoja para anotar. Si viene con su pareja, mejor."],["1. Apertura y marco","0–3 min","“¿Cómo estuvo tu día? Sé que tu tiempo es escaso, así que vamos directo al grano: tenemos 30 minutos. ¿Tienes donde anotar? Vamos a mirar tus números y al final te voy a mostrar en la Calculadora VIIGO cómo se ve tu situación financiera futura.” “La idea de hoy es simple. Quiero entender en qué etapa estás, qué es lo que más te preocupa de tu jubilación y qué planes tienes con esos ahorros que tienes parados. Si veo que el Método VIIGO te sirve, te cuento cómo trabajamos. Si veo que no es tu momento, te lo voy a decir con la misma honestidad, y te vas igual con una tarea concreta. Nosotros no vendemos propiedades por vender: armamos rutas. ¿Te parece bien?” (Si detectas escepticismo: “¿Es un buen momento para hablar de tu patrimonio, o prefieres que lo movamos para cuando estés con la cabeza más despejada?”)"],["2. Problema y contexto","3–10 min","Escucha más de lo que hablas y anota sus palabras exactas sobre lo que lo frena: las vas a usar en el cierre. “Hoy por hoy, ¿cuál es el obstáculo más grande que te ha impedido dar el paso en la inversión inmobiliaria?” “Además de eso, ¿hay algo más que no te deje tranquilo? Quizás la confusión con tantos brokers o el miedo a equivocarte con el crédito.” (Si dice “miedo a perder mis ahorros”: “¿Al riesgo del arrendatario, o a que no confías en lo que te han mostrado?”) Su contexto: a qué se dedica y hace cuánto es independiente (mide estabilidad de renta); cuántos años tiene (cuántos ciclos le caben antes de los 58); qué % de su sueldo cree que le daría la AFP; si ya habló con brokers o inmobiliarias y por qué no avanzó; hace cuánto le da vueltas (si son tres años o más: “Es harto tiempo para que la inflación se coma parte de tus ahorros, ¿no crees?”)."],["3. Números reales y plazo del crédito","10–17 min","Este bloque llena las señales de ahorro y capacidad de crédito. Anota cada número: los cargas en la calculadora después. “Vamos a los números reales. No necesito exactitud al peso, sí una idea honesta.” Ingreso mensual líquido (¿lo puede acreditar?), ahorros (depósitos, fondos mutuos, cuenta), pie que podría dar en una propiedad de UF 4.000 sin quedar acogotado, ahorro mensual, créditos de consumo o auto financiado, y si ya tiene una propiedad. La pregunta que diferencia a VIIGO: “Si invirtieras hoy, ¿a cuántos años pedirías el crédito? ¿A 20 o a 30?” “La mayoría elige 30 años por la cuota baja, sin darse cuenta de que eso le recorta el capital para la segunda propiedad. Con 20 años pones más al mes, pero esa plata se queda en tu patrimonio. En unos minutos te lo muestro con tus números.” Nota: si el dividendo pasa del 25% de su renta, marca la capacidad de crédito en amarillo o rojo."],["4. Urgencia, pareja y situación deseada","17–21 min","Este bloque llena la señal de decisión. Pocas preguntas y deja que el silencio trabaje. “¿Por qué es importante para ti resolver esto ahora y no en dos años más?” “Seamos honestos: si pasan otros cinco años y sigues con la plata en el banco y sin una propiedad de inversión, ¿cómo se ve tu vida a los 65?” “Esta decisión, ¿la tomas tú solo o la conversas con tu pareja? ¿Qué opina?” “Si armamos una ruta que te haga sentido, ¿estás en condiciones de comprometerte con ese plan en los próximos 6 meses?” “Imagina que ya tienes tu primera propiedad de inversión, bien elegida y con un crédito estratégico. ¿Cómo te sentirías?” Transición: “Ahora que tengo tus números, déjame mostrarte algo. Vamos a ponerlos en la Calculadora VIIGO.”"],["5. Calculadora VIIGO en vivo","21–27 min","Comparte pantalla. Muestra, no expliques celda por celda. Paso 1, Mis Datos (1 min): “Estos son tus números: [edad], [ingreso], [ahorro], [pie]. ¿Está bien?” Paso 2, solo AFP (1 min): “Así se ve tu jubilación si sigues igual: [monto] al mes. Hoy ganas [ingreso]. ¿Te alcanzaría para vivir con eso?” (Pausa. No rellenes el silencio.) Paso 3, Ciclos VIIGO (2 min): “Esta es tu primera propiedad. A los [edad + 8] la vendes, liberas este capital y es el pie de la siguiente, más grande. Así hasta los 58. Después, la última se queda contigo y te paga un ingreso.” (Si preguntó por el plazo, cambia de 30 a 20 años frente a él.) Paso 4, 3 escenarios (2 min): “Mismo tú, mismo sueldo. Lo único que cambia es el orden: primero el plan, después la propiedad. ¿Qué te pasa al ver esto?” Siempre di: “Esto es una proyección con supuestos conservadores, no una promesa. Para que sea tu plan real hay que revisar tu crédito, tus gastos y la propiedad correcta.”"],["6. Salida y cierre","27–30 min","Cierra con UNA sola salida según las señales que marcaste (más abajo: “Las 3 salidas”). Transición para las tres: “[Nombre], tengo el panorama claro. Tu problema no es falta de capacidad: es que te falta un método que ordene tu situación con una proyección real, no con promesas de brokers. Déjame decirte lo que veo.” Toda salida termina con algo agendado o una tarea con fecha. Usa las palabras exactas que te dio en el bloque del problema. Después de cada llamada: registra en HubSpot la salida, las 3 señales (verde, amarillo o rojo) y la frase exacta del obstáculo."]],"preguntas":["Hoy por hoy, ¿cuál es el obstáculo más grande que te ha impedido dar el paso en la inversión inmobiliaria?","¿Cuánto es tu ingreso mensual líquido? ¿Lo puedes acreditar si el banco te lo pide?","Si hoy compraras una propiedad de UF 4.000, ¿cuánto pie podrías dar sin quedar acogotado?","Si invirtieras hoy, ¿a cuántos años pedirías el crédito? ¿A 20 o a 30?","Si pasan otros cinco años y sigues igual, ¿cómo se ve tu vida a los 65?","Si armamos una ruta que te haga sentido, ¿estás en condiciones de comprometerte con ese plan en los próximos 6 meses?"],"tarea":"Según la salida. Salidas 1 y 2: primera sesión del Programa VIIGO agendada y link de pago enviado (en la Salida 2, idealmente con la pareja). Salida 3: una sola tarea con fecha (juntar el pie, pedir simulaciones en dos bancos o conversar la calculadora con su pareja) y nuevo diagnóstico en 3 o 6 meses.","cierre":["¿Qué te pasa al ver esto? (tras la Calculadora: confirma la señal de decisión)","¿Lo agendamos? Tengo cupo para partir [día]."],"precal":{"senales":[["Ahorro","Tiene UF 1.500 o más disponibles para pie y gastos","Tiene menos, o lo tiene comprometido","Casi no tiene ahorro"],["Capacidad de crédito","Renta estable y demostrable; el dividendo cabe en su presupuesto; sin deudas de consumo grandes","Renta irregular o recién independiente; algunas deudas","No le aprobarían un crédito hoy"],["Decisión","Quiere actuar en los próximos 6 meses y la pareja está alineada","Le interesa, pero duda o la pareja no está convencida","“En un par de años veo”"]],"reglas":["3 verdes → Salida 1: listo para invertir.","Algún amarillo y ningún rojo en ahorro o crédito → Salida 2: le falta preparación o confianza.","Un rojo en ahorro o crédito, o rojo en decisión → Salida 3: no es su momento."],"salidas":[{"t":"Salida 1 · Listo para invertir","cuando":"3 verdes","guion":"“Tienes el ahorro, tienes la capacidad de crédito y tienes las ganas. Lo que te falta es el plan. Eso es exactamente lo que hacemos en el Programa de Asesoría VIIGO: en 4 sesiones individuales armamos tu ruta con tus números y en 30 días tienes tu primera propiedad de inversión definida. El programa cuesta UF 8. Si decides comprar con Viel.cl dentro de 180 días, te lo descontamos completo. Si compras por otro lado o decides esperar, igual te llevas tu ruta, tu Excel financiero y la calculadora. ¿Lo agendamos? Tengo cupo para partir [día].”","paso":"Primera sesión agendada y link de pago enviado durante la llamada."},{"t":"Salida 2 · Le falta preparación o confianza","cuando":"Algún amarillo, sin rojo en ahorro ni crédito","guion":"“Veo que hay base, pero hay cosas que ordenar antes de comprar: [la deuda de consumo / la renta que hay que demostrar / la conversación con tu pareja]. Si compras hoy, compras con miedo, y así es como la gente se equivoca. El Programa de Asesoría VIIGO sirve justamente para esto. Cuesta UF 8 y es descontable si después compras con Viel.cl. Las primeras sesiones ordenan tus números y tu crédito, y si no es momento de comprar, sales con un plan de preparación a 6 meses. Te recomiendo, si quieres, que la primera sesión la hagas con tu pareja. ¿Qué te parece?”","paso":"Primera sesión agendada (idealmente con la pareja). Enviar agenda y link de pago."},{"t":"Salida 3 · No es su momento","cuando":"Un rojo en ahorro, crédito o decisión","guion":"“Te voy a ser honesta: hoy no te recomiendo invertir, y tampoco tomar el programa todavía. No es un no, es un ‘todavía no’. Si haces esto, en unos meses sí vas a estar listo.” Dale una sola tarea concreta con fecha. Ahorro en rojo: “Junta [monto] para el pie en [plazo]. Te sugiero apartar [monto] al mes.” Crédito en rojo: “Pide una simulación hipotecaria en dos bancos esta semana, y baja o paga [la deuda de consumo] antes de [fecha].” Decisión en rojo: “Conversa esto con tu pareja usando el resultado de la calculadora. Te lo mando por correo.” Cierre: “Te voy a mandar tu resultado de la calculadora y algunos correos con lo que necesitas saber mientras tanto. En [3 / 6] meses lo volvemos a mirar. ¿Te parece?”","paso":"Etiqueta en HubSpot “No es su momento” + la tarea, entra a la secuencia de correos y recordatorio de nuevo diagnóstico en 3 o 6 meses."}],"claves":[["“Tu ruta es tuya, compres donde compres.”","“El programa cuesta UF 8 y te llevas tu ruta, tu Excel y la calculadora, aunque después compres con otro o decidas esperar. Y si compras con nosotros, te lo descontamos completo: para quien decide, el programa sale gratis.”","Cuando el lead ya habló con varios brokers y desconfía. Le saca la presión de compra y te separa del broker que solo gana si vende."],["“UF 8 es mucho menos que lo que cuesta equivocarse.”","“UF 8 es menos que un dividendo. Elegir mal el plazo del crédito o la propiedad equivocada te puede costar millones en patrimonio, y te deja amarrado a una deuda que no te sirve para escalar. Lo viste en la calculadora con tus números.”","Cuando la objeción es el precio o “lo puedo hacer solo”. Compara el precio con el riesgo que ya le da miedo, no con otra asesoría."],["“En 90 días dejas de postergar, con tu pareja en la misma página.”","“Me dijiste que llevas [X años] dándole vueltas. El programa tiene fecha de término: en 30 días sales con tu primera propiedad definida o, si no es tu momento, con un plan de 6 meses para que sí lo sea. Y lo decides con tu pareja, porque la invitamos a las sesiones clave.”","Cuando dice “lo voy a pensar” o “lo converso en la casa”. Convierte una decisión enorme e indefinida en un proceso corto, con fecha y compartido."]]}},
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
  tarea:'Probar la Calculadora VIIGO en Mi ruta, actualizar la simulación bancaria con el monto definido y anotar sus dudas.',
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
