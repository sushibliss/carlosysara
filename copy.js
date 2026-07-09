/* ===========================================================
   COPY DEL JUEGO — todos los textos en un solo sitio.
   ✏️ Teresa: edita lo que quieras entre comillas.
   Los {marcadores} entre llaves se rellenan solos: NO los borres
   (p. ej. {total}, {palabra}, {copa}…).
   Las listas con varios mensajes eligen uno al azar cada vez.
   =========================================================== */

const COPY = {

  /* ---------- mensajes generales ---------- */
  general: {
    correcto: "¡Correcto! 🎉",
    // al fallar una prueba (se elige uno al azar)
    fallos: [
      "Casi… pero el comité de bodas no lo aprueba.",
      "No. Y eso que te lo estábamos poniendo fácil.",
      "Error. La novia ya empieza a dudar.",
      "Frío, frío. Como los pies antes del “sí, quiero”.",
      "Incorrecto. Vuelve a intentarlo, campeón.",
    ],
  },

  /* ---------- portada ---------- */
  portada: {
    kicker: "Concurso pre-boda",
    titulo: "El soltero en peligro de extinción",
    texto: "7 pruebas te separan de tu destino. Falla y la novia tomará nota. Suerte (la vas a necesitar).",
    boton: "Empezar 💍",
  },

  /* ---------- prueba 1: puzzle ---------- */
  puzzle: {
    kicker: "Prueba 1 de 7",
    titulo: "Recompón al galán",
    texto: "Toca dos piezas para intercambiarlas. Reconstruye la foto del novio… si te atreves.",
    movimientos: "Movimientos: ",
    chuleta: "🫣 Chuleta",
    // pullas por número de movimientos: [movimiento, mensaje]
    pullas: [
      [12, "Doce movimientos… el novio sigue descuartizado."],
      [20, "¿Seguro que lo reconoces? Es el de la boda."],
      [30, "La novia ya está mirando otros candidatos."],
    ],
    exito: "¡Galán recompuesto en {movimientos} movimientos! 🧩",
  },

  /* ---------- prueba 2: cigarro ---------- */
  cigarro: {
    kicker: "Prueba 2 de 7",
    titulo: "El Winston de la verdad",
    texto: "Estira o encoge el cigarro hasta que mida lo que mide un Winston largo. Sin reglas trampa.",
    mide: "Mide:",
    boton: "Confirmar medida 🚬",
    exito: "¡Exacto! 10 cm de pura elegancia rural. 🚬",
  },

  /* ---------- prueba 3: distancia ---------- */
  distancia: {
    kicker: "Prueba 3 de 7",
    titulo: "De Fraga a Viladecans",
    texto: "¿Cuántos kilómetros separan la patria chica del altar? Afina, geógrafo.",
    ayuda: "Desliza para ajustar",
    boton: "Confirmar distancia 🗺️",
    exito: "¡Clavado! 185 km de amor y peajes. 🛣️",
  },

  /* ---------- prueba 4: pong ---------- */
  pong: {
    kicker: "Prueba 4 de 7",
    titulo: "Pong nupcial",
    texto: "Primero a {puntos}. Tú abajo (desliza), la máquina arriba. Ojo: los regalos de boda 🍾💐🎁 desvían el anillo… y tu pala ENCOGE con cada golpe (se recupera al marcar).",
    exito: "¡Reflejos de campeón! 💍",
  },

  /* ---------- prueba 5: Aria y Floky ---------- */
  perros: {
    kicker: "Prueba 5 de 7",
    titulo: "¡Los calcetines, no! 🧦",
    texto: "Aria y Floky van a por los calcetines. Toca los calcetines para salvarlos y a los perros para espantarlos. Salva {salvar} antes de que se coman {max}.",
    nombres: ["Aria", "Floky"],
    hudSalvados: "Salvados",
    hudComidos: "Comidos",
    exito: "¡{salvar} calcetines a salvo! Aria y Floky, a dieta. 🐕🐶",
    // al perder (se elige uno al azar)
    derrotas: [
      "Tres calcetines menos. La lavadora llora. 🧦",
      "Aria y Floky: 3 — Tú: 0. Otra vez.",
      "Se los han zampado. ¡Más rápido con ese dedo!",
    ],
  },

  /* ---------- prueba 6: wordle ---------- */
  wordle: {
    kicker: "Prueba 6 de 7",
    titulo: "La palabra secreta",
    texto: "5 letras, 6 intentos. Verde = letra y sitio correctos · Amarillo = está pero en otro sitio · Gris = no está.",
    faltanLetras: "Faltan letras, campeón.",
    exito: "¡Palabra clavada! 🎉 Queda la traca final…",
    derrota: "Era “{palabra}”. Otra ronda…",
    reintentar: "Otra vez 🔁",
  },

  /* ---------- prueba 7: la novia borracha ---------- */
  borracha: {
    kicker: "Prueba 7 de 7 · LA TRACA FINAL",
    titulo: "Llévala con el suegro 🥴",
    texto: "Toca/arrastra hacia donde quieres ir. La novia va piripi: se tambalea sola. Esquiva obstáculos 🛢️ y enemigos 👵💃🐕🐗… y NI SE TE OCURRA tocar las copas 🍺🍷🥃: cada trago la emborracha más.",
    // al chocar con un obstáculo (se elige uno al azar)
    tropiezos: ["¡ay, el bordillo!", "uy 🛢️", "¡cuidado!", "el suelo se mueve…"],
    // al beberse una copa ({copa} = el emoji de la bebida)
    tragos: [
      "¡Glup! Otra ronda {copa} ¡Todo gira!",
      "¡Eso no era agua! {copa} Ve el doble…",
      "Chupito traicionero {copa} Controles del revés",
    ],
    // al pillarte un enemigo (se elige uno al azar)
    enemigos: ["¡La suegra! A empezar 👵", "¡Te pilló la ex! 💃", "¡El perro! 🐕 Vuelta atrás"],
    exito: "¡Llegó con el suegro (de milagro)! 👴🍺 Fin del concurso…",
    hudTropiezos: "Tropiezos: ",
    hudCopas: "   Copas: ",
    mundoGira: "🔄 ¡el mundo gira! 🔄",
  },

  /* ---------- pantalla final ---------- */
  final: {
    titulo: "Cuenta atrás para el “sí, quiero”",
    dias: "días",
    horas: "horas",
    min: "min",
    seg: "seg",
    fecha: "25 de julio · 17:00",
    sinCancion: "🎵 (sube assets/cancion.mp3 para la canción)",

    // Letra de la canción: una línea por elemento ("" separa estrofas)
    letra: [
      "Resulta que el otro día",
      "después de un buen cebollOoooOon",
      "llegué a Fraga y me encontré",
      "a Carlos en la Pocion",
      "",
      "Carlos y Sara",
      "Tenis y padel",
      "Desorden COVID",
      "Dislexia",
      "",
      "Así el amor llega algunas veces",
      "de pronto y sin anestesia",
      "",
      "la catalana con el oscense",
      "un cuentecito de hadas",
      "granja de pollos y un Winston largo",
      "Carlos pa darle caladas",
      "",
      "y con The Ring que mal rollito",
      "cuando llegaban llamadas",
      "",
      "París bien vale una boda",
      "pedida en Roland Garros",
      "con lo guarrete que eres, Carlos",
      "menos mal que Sara no te contesto",
      "que nooooooo",
      "y no fue por la dislexia",
      "no fue una equivocación",
      "parece ser que te quiere",
      "que suerte tienes mamón",
      "que si roncas",
      "",
      "ella te haceee",
      "",
      "salto sin red ni colchón",
      "",
      "con Aria y Floky cuantos ladridos",
      "in love con los peluditos",
      "Sara dibuja en una hoja en blanco",
      "solo futuros bonitos",
      "y si se pilla un pedo de muerte",
      "esto ya no hay quien lo entienda",
      "en vez de a Carlos sacando el móvil",
      "tira de suegro en la agenda",
      "",
      "Paris bien vale un si quiero",
      "luna de miel oriental",
      "va a haber mucho folleteo",
      "tanto en China como en Vietnam",
      "",
      "Anillos en la pineda",
      "de fraga a viladecans",
      "Carlos Sara ya lo veis",
      "que la vida os hizo un Ace",
      "vamos todos a brindar",
      "",
      "Carlos no te hagas pajillas",
      "que ya tienes a la Sareta",
      "y ademas de estas cosillas",
      "te hace muy bien la maleta",
      "",
      "y qué le voy a hacer",
      "y qué le voy a hacer",
      "donde hay pelo hay alegría",
      "Carlos qué felicidad",
      "preparate el kamasutra",
      "para China",
      "y para Vietnam",
      "",
      "por delante y por detrás",
      "en china hay que meter",
      "en china hay que meter",
      "en china hay que meter",
      "y en Vietnam también",
      "",
      "Pedida en Roland Garrós",
      "Bajo el cielo de París",
      "Con un email indiscreto",
      "y Sara dijo oui oui",
      "",
      "Fotos de sexy granjero",
      "CARLOS",
      "que provocador",
      "con pollos y entre las piernas",
      "hay debe haber un pollon",
      "",
      "Paris bien vale una boda",
      "vamos todos a brindar",
      "por tantas cositas buenas",
      "que seguro que vendrán",
      "",
      "Viva los novios",
      "que suene fuerte la marcha nupcial",
      "que vuestro cuento de hadas",
      "no tenga nunca un final",
      "",
      "Viva los novios",
      "que suene fuerte la marcha nupcial",
      "que vuestro cuento de hadas",
      "no tenga nunca un final",
    ],
  },
};
