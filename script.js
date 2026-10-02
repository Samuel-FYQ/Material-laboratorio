"use strict";

/* ============================================================
   MATERIAL DE LABORATORIO
   Autor: Samuel López Melián

   Ronda 1: identificar el nombre.
   Ronda 2: reconocer la función.
   Diploma al completar las 24 preguntas.
============================================================ */

/* ------------------------------------------------------------
   MATERIALES Y FUNCIONES

   Los recortes corresponden a materiales.png.
------------------------------------------------------------ */

const materials = [
    {
        name: "Vaso de precipitados",
        use: "Contener, trasvasar y calentar líquidos; no mide volúmenes con precisión.",
        crop: [55, 70, 230, 154]
    },
    {
        name: "Probeta",
        use: "Medir volúmenes de líquidos con una escala graduada.",
        crop: [55, 248, 230, 156]
    },
    {
        name: "Pipeta",
        use: "Medir y transferir pequeños volúmenes de líquido con precisión.",
        crop: [55, 430, 230, 154]
    },
    {
        name: "Balanza",
        use: "Medir la masa de una sustancia.",
        crop: [55, 605, 230, 129]
    },
    {
        name: "Bureta",
        use: "Dispensar volúmenes de líquido con precisión mediante una llave.",
        crop: [55, 763, 230, 131]
    },
    {
        name: "Frasco lavador",
        use: "Enjuagar material con agua destilada.",
        crop: [55, 922, 230, 134]
    },
    {
        name: "Matraz Erlenmeyer",
        use: "Preparar y agitar mezclas o disoluciones sin derramarlas fácilmente.",
        crop: [824, 70, 230, 154]
    },
    {
        name: "Tubo de ensayo",
        use: "Contener pequeñas cantidades de sustancias para realizar ensayos.",
        crop: [824, 248, 230, 156]
    },
    {
        name: "Matraz aforado",
        use: "Preparar disoluciones de un volumen exacto; no se usa para calentar.",
        crop: [824, 430, 230, 154]
    },
    {
        name: "Mechero Bunsen",
        use: "Calentar sustancias con una llama alimentada por gas.",
        crop: [824, 605, 230, 129]
    },
    {
        name: "Embudo",
        use: "Trasvasar líquidos a recipientes de boca estrecha o filtrar con papel de filtro.",
        crop: [824, 763, 230, 131]
    },
    {
        name: "Vidrio de reloj",
        use: "Contener pequeñas cantidades de sólidos o apoyarlos para pesarlos.",
        crop: [824, 922, 230, 134]
    }
];

/* ------------------------------------------------------------
   VARIABLES
------------------------------------------------------------ */

const $ = id => document.getElementById(id);

const sheet = new Image();

let imageReady = false;
let questions = [];
let position = 0;
let locked = false;
let timer = null;
let completedAt = null;

/* ------------------------------------------------------------
   MEZCLAR ELEMENTOS
------------------------------------------------------------ */

function shuffle(values) {
    const copy = [...values];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

/* ------------------------------------------------------------
   INICIAR O REINICIAR
------------------------------------------------------------ */

function start() {
    clearTimeout(timer);
    timer = null;

    questions = [
        ...shuffle(materials).map(material => ({
            material,
            type: "name"
        })),

        ...shuffle(materials).map(material => ({
            material,
            type: "use"
        }))
    ];

    position = 0;
    completedAt = null;

    $("diplomaPreview").hidden = true;
    $("downloadMessage").textContent = "";

    render();
}

/* ------------------------------------------------------------
   MOSTRAR LA IMAGEN DEL MATERIAL
------------------------------------------------------------ */

function drawMaterial(material) {
    const canvas = $("materialCanvas");
    const ctx = canvas.getContext("2d");

    const [x, y, width, height] = material.crop;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!imageReady) {
        return;
    }

    const scale = Math.min(
        (canvas.width - 20) / width,
        (canvas.height - 20) / height
    );

    const targetWidth = width * scale;
    const targetHeight = height * scale;

    ctx.drawImage(
        sheet,
        x,
        y,
        width,
        height,
        (canvas.width - targetWidth) / 2,
        (canvas.height - targetHeight) / 2,
        targetWidth,
        targetHeight
    );
}

/* ------------------------------------------------------------
   MOSTRAR UNA PREGUNTA
------------------------------------------------------------ */

function render() {
    locked = false;

    const finished = position === questions.length;

    $("game").hidden = finished;
    $("finish").hidden = !finished;

    if (finished) {
        completedAt = new Date();
        $("studentName").focus();
        return;
    }

    const question = questions[position];

    $("round").textContent =
        question.type === "name"
            ? "Ronda 1 · Nombres"
            : "Ronda 2 · Funciones";

    $("position").textContent =
        `Pregunta ${position % 12 + 1} de 12`;

    $("progress").max = questions.length;
    $("progress").value = position;

    $("question").textContent =
        question.type === "name"
            ? "¿Qué material es?"
            : `¿Para qué sirve? · ${question.material.name}`;

    $("materialCanvas").setAttribute(
        "aria-label",
        question.type === "name"
            ? "Material de laboratorio que debes identificar"
            : question.material.name
    );

    drawMaterial(question.material);

    $("feedback").textContent = "";
    $("feedback").className = "";

    $("options").replaceChildren();

    const alternatives = shuffle(
        materials.filter(material =>
            material !== question.material
        )
    ).slice(0, 3);

    const choices = shuffle([
        question.material,
        ...alternatives
    ]);

    for (const material of choices) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = material[question.type];
        button.disabled = !imageReady;

        button.onclick = () => {
            answer(material, button);
        };

        $("options").appendChild(button);
    }
}

/* ------------------------------------------------------------
   COMPROBAR LA OPCIÓN ELEGIDA
------------------------------------------------------------ */

function answer(material, button) {
    if (locked || !imageReady) {
        return;
    }

    const question = questions[position];

    if (material !== question.material) {
        button.classList.add("wrong");
        button.disabled = true;

        $("feedback").className = "bad";
        $("feedback").textContent =
            "Todavía no. Prueba otra opción.";

        return;
    }

    locked = true;

    button.classList.add("correct");

    for (const option of $("options").children) {
        option.disabled = true;
    }

    $("progress").value = position + 1;

    $("feedback").className = "good";

    $("feedback").textContent =
        question.type === "name"
            ? `¡Correcto! ${question.material.use}`
            : "¡Correcto!";

    // Más tiempo en la primera ronda para leer la función.
    const delay = question.type === "name" ? 2200 : 900;

    timer = setTimeout(() => {
        timer = null;
        position++;
        render();

        if (position < questions.length) {
            $("options")
                .querySelector("button")
                .focus({ preventScroll: true });
        }
    }, delay);
}

/* ------------------------------------------------------------
   TEXTO AJUSTADO PARA EL DIPLOMA
------------------------------------------------------------ */

function fit(ctx, text, y, size, color) {
    ctx.fillStyle = color;

    do {
        ctx.font = `bold ${size}px Arial, sans-serif`;

        if (ctx.measureText(text).width <= 1240) {
            break;
        }

        size--;
    } while (size > 16);

    ctx.fillText(text, 800, y);
}

/* ------------------------------------------------------------
   CREAR EL DIPLOMA COMO IMAGEN
------------------------------------------------------------ */

function diploma(name) {
    const canvas = document.createElement("canvas");

    canvas.width = 1600;
    canvas.height = 1100;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(
        0, 0, 1600, 1100
    );

    gradient.addColorStop(0, "#071d39");
    gradient.addColorStop(1, "#075767");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1600, 1100);

    // Marco exterior.
    ctx.strokeStyle = "#e6bd67";
    ctx.lineWidth = 5;
    ctx.strokeRect(38, 38, 1524, 1024);

    // Marco interior.
    ctx.strokeStyle = "#5392a1";
    ctx.lineWidth = 1;
    ctx.strokeRect(54, 54, 1492, 992);

    // Panel central.
    ctx.fillStyle = "white";
    ctx.fillRect(100, 235, 1400, 565);

    ctx.textAlign = "center";

    fit(ctx, "FYQ", 140, 64, "#e6bd67");

    ctx.fillStyle = "#d8edf1";
    ctx.font = "24px Arial, sans-serif";

    ctx.fillText(
        "FÍSICA Y QUÍMICA",
        800,
        190
    );

    fit(
        ctx,
        "DIPLOMA DE PARTICIPACIÓN",
        320,
        52,
        "#173651"
    );

    fit(
        ctx,
        "MATERIAL DE LABORATORIO",
        375,
        36,
        "#087183"
    );

    ctx.fillStyle = "#536579";
    ctx.font = "26px Arial, sans-serif";

    ctx.fillText("Se concede a", 800, 450);

    fit(ctx, name, 535, 58, "#173651");

    ctx.strokeStyle = "#e6bd67";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(350, 565);
    ctx.lineTo(1250, 565);
    ctx.stroke();

    ctx.fillStyle = "#536579";
    ctx.font = "27px Arial, sans-serif";

    ctx.fillText(
        "por identificar correctamente los materiales de laboratorio",
        800,
        625
    );

    ctx.fillText(
        "y reconocer sus funciones",
        800,
        670
    );

    fit(
        ctx,
        "12 materiales · 24 preguntas completadas",
        745,
        30,
        "#087183"
    );

    const date = completedAt.toLocaleDateString(
        "es-ES",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Atlantic/Canary"
        }
    );

    ctx.fillStyle = "#d8edf1";
    ctx.font = "25px Arial, sans-serif";

    ctx.fillText(date, 800, 870);

    fit(
        ctx,
        "Samuel López Melián",
        945,
        30,
        "#e6bd67"
    );

    ctx.fillStyle = "#d8edf1";
    ctx.font = "22px Arial, sans-serif";

    ctx.fillText(
        "Profesor de Física y Química",
        800,
        985
    );

    return canvas.toDataURL("image/png");
}

/* ------------------------------------------------------------
   DESCARGAR EL DIPLOMA
------------------------------------------------------------ */

$("diplomaForm").onsubmit = event => {
    event.preventDefault();

    if (
        position !== questions.length ||
        !completedAt
    ) {
        return;
    }

    const input = $("studentName");

    const name = input.value
        .trim()
        .replace(/\s+/g, " ");

    input.setCustomValidity("");

    if (name.split(" ").length < 2) {
        input.setCustomValidity(
            "Escribe tu nombre y apellidos."
        );

        input.reportValidity();
        return;
    }

    const image = diploma(name);

    $("diplomaPreview").src = image;
    $("diplomaPreview").hidden = false;

    const safeName = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    const link = document.createElement("a");

    link.href = image;

    link.download =
        `Diploma_FYQ_Laboratorio_${safeName}.png`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    $("downloadMessage").textContent =
        "Entrega el PNG descargado. En móvil también puedes " +
        "mantener pulsado el diploma para guardar la imagen.";
};

$("studentName").oninput = () => {
    $("studentName").setCustomValidity("");
};

$("restart").onclick = start;

/* ------------------------------------------------------------
   CARGAR LAS IMÁGENES
------------------------------------------------------------ */

sheet.onload = () => {
    imageReady = true;
    render();
};

sheet.onerror = () => {
    imageReady = false;

    $("feedback").className = "bad";

    $("feedback").textContent =
        "No se puede cargar la imagen. Comprueba que materiales.png " +
        "está en la misma carpeta que index.html.";
};

/* ------------------------------------------------------------
   INICIAR
------------------------------------------------------------ */

start();

sheet.src = "materiales.png";