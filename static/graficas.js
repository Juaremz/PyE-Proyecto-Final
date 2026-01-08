//  GRÁFICAS GLOBALES 
window.chartError = null;
window.chartConf = null;

// TABLA Z
const zValues = { 90: 1.645, 95: 1.96, 99: 2.576 };

//CAMBIO DE MODO (propios / dataset / subir)
function cambiarModo() {

    const modo = document.getElementById("tipoDatos").value;

    document.getElementById("bloquePropios").style.display =
        modo === "propios" ? "block" : "none";
    document.getElementById("bloqueDataset").style.display =
        modo === "dataset" ? "block" : "none";
    document.getElementById("bloqueSubir").style.display =
        modo === "subir" ? "block" : "none";

    if (modo === "dataset") cargarDatasets();
}

// CÁLCULO DE Z (robusto)
function calcularZ(confianza) {
    const tablaValoresZ = {
        "90": 1.645,
        "95": 1.96,
        "99": 2.576
    };

    if (tablaValoresZ[confianza.toString()]) {
        return tablaValoresZ[confianza.toString()];
    }

    // Aproximación para valores no estándar
    const p = 1 - (1 - confianza / 100) / 2;
    const t = Math.sqrt(-2 * Math.log(1 - p));
    const c0 = 2.30753, c1 = 0.27061, d1 = 0.99229, d2 = 0.04481;

    return parseFloat(
        (t - (c0 + c1 * t) / (1 + d1 * t + d2 * t * t)).toFixed(3)
    );
}

// DATASETS
async function cargarDatasets() {

    const res = await fetch("/datasets");
    const datasets = await res.json();

    const datasetSelect = document.getElementById("datasetSelect");
    datasetSelect.innerHTML = "";

    datasets.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        datasetSelect.appendChild(opt);
    });

    cargarColumnas();
}

async function cargarColumnas() {

    const dataset = document.getElementById("datasetSelect").value;
    const res = await fetch(`/columnas/${dataset}`);
    const columnas = await res.json();

    const columnaSelect = document.getElementById("columnaSelect");
    columnaSelect.innerHTML = "";

    columnas.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        columnaSelect.appendChild(opt);
    });

    cargarInfoColumna();
}

async function cargarInfoColumna() {

    const ds = document.getElementById("datasetSelect").value;
    const col = document.getElementById("columnaSelect").value;

    const res = await fetch(`/info_columna/${ds}/${col}`);
    const info = await res.json();

    document.getElementById("descCol").textContent = info.description || "";
    document.getElementById("tipoCol").textContent = info.type || "";
    document.getElementById("rangoCol").textContent = info.allowed || "";
}

// ARCHIVO SUBIDO
async function procesarArchivoSubido() {

    const fileInput = document.getElementById("archivoCSV");
    if (fileInput.files.length === 0) {
        alert("Selecciona un archivo primero");
        return;
    }

    const formData = new FormData();
    formData.append("archivo", fileInput.files[0]);

    const res = await fetch("/procesar_csv", {
        method: "POST",
        body: formData
    });

    const columnas = await res.json();
    const select = document.getElementById("columnaSubidaSelect");

    select.innerHTML = "";
    columnas.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
}

// CÁLCULO PRINCIPAL – ESTIMACIÓN DE MEDIAS
async function calcular() {

    try {
        let sigma, confianzaInput, error, media = null, mediana = null, cv = null;
        const modo = document.getElementById("tipoDatos").value;

        if (modo === "propios") {
            sigma = parseFloat(document.getElementById("stdInput").value);
            confianzaInput = document.getElementById("confianzaPropios").value;
            error = parseFloat(document.getElementById("errorPropios").value);
        }

        if (modo === "dataset") {
            const ds = datasetSelect.value;
            const col = columnaSelect.value;

            const res = await fetch(`/estadisticos/${ds}/${col}`);
            const data = await res.json();

            sigma = data.sigma;
            media = data.media;
            mediana = data.mediana;
            confianzaInput = document.getElementById("confianzaDataset").value;
            error = parseFloat(document.getElementById("errorDataset").value);
            cv = (sigma / media) * 100;
        }

        if (modo === "subir") {
            const formData = new FormData();
            formData.append("archivo", archivoCSV.files[0]);
            formData.append("columna", columnaSubidaSelect.value);

            const res = await fetch("/estadisticos_subidos", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            sigma = data.sigma;
            media = data.media;
            mediana = data.mediana;
            cv = data.cv;
            confianzaInput = document.getElementById("confianzaSubida").value;
            error = parseFloat(document.getElementById("errorSubida").value);
        }

        limpiarError();

        //  VALIDACIONES MEDIAS 
        if (isNaN(sigma) || sigma <= 0) {
            mostrarError("La desviación estándar σ debe ser mayor que 0.");
            return;
        }

        if (isNaN(error) || error <= 0) {
            mostrarError("El error permitido E debe ser mayor que 0.");
            return;
        }

        if (confianzaInput <= 0 || confianzaInput >= 100) {
            mostrarError("El nivel de confianza debe estar entre 0 y 100.");
            return;
        }

        const z = calcularZ(parseFloat(confianzaInput));
        const n = Math.ceil((z * sigma / error) ** 2);

        // Resultados principales
        resN.textContent = n;
        resZ.textContent = z;
        resSigma.textContent = sigma.toFixed(4);
        resError.textContent = error;

        // Resumen estadístico
        const resumen = document.getElementById("resumenEstadistico");
        if (media !== null) {
            resumen.style.display = "block";
            statMedia.textContent = media.toFixed(2);
            statMediana.textContent = mediana.toFixed(2);
            statSigma.textContent = sigma.toFixed(4);
            statCV.textContent = cv.toFixed(2);
        } else {
            resumen.style.display = "none";
        }

        // --- CONCLUSIÓN / INTERPRETACIÓN TÉCNICA (ORIGINAL) ---
        const cardConclusion = document.getElementById("cardConclusion");
        const textoConclusion = document.getElementById("textoConclusion");

        cardConclusion.style.display = "block";

        let htmlConclusion = `
            <p>
                Para un nivel de confianza del <strong>${confianzaInput}%</strong> y
                un error máximo permitido de <strong>${error}</strong>,
                se determinó un tamaño de muestra de <strong>${n}</strong> unidades.
            </p>
        `;

        if (media !== null && mediana !== null) {
            const diferencia = Math.abs(media - mediana) / media;

            if (diferencia > 0.1) {
                htmlConclusion += `
                    <p style="color:#e67e22;">
                        <strong>Aviso de sesgo:</strong>
                        La diferencia entre la media (${media.toFixed(2)}) y la mediana
                        (${mediana.toFixed(2)}) sugiere una posible asimetría en los datos.
                    </p>
                `;
            } else {
                htmlConclusion += `
                    <p style="color:#27ae60;">
                        <strong>Distribución balanceada:</strong>
                        La cercanía entre la media (${media.toFixed(2)}) y la mediana
                        (${mediana.toFixed(2)}) indica una distribución aproximadamente simétrica.
                    </p>
                `;
            }
        }

        textoConclusion.innerHTML = htmlConclusion;


        // Gráficas
        const errores = [error * 0.5, error, error * 1.5, error * 2].map(e => e.toFixed(2));
        const muestras = errores.map(e => Math.ceil((z * sigma / e) ** 2));
        const confs = [90, 95, 99];
        const muestrasConf = confs.map(c => Math.ceil((calcularZ(c) * sigma / error) ** 2));

        dibujarGraficas(errores, muestras, confs, muestrasConf);

    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

// GRÁFICAS (MEDIAS)
function dibujarGraficas(errores, nError, confs, nConf) {

    //destruir gráficas previas
    if (window.chartError) {
        window.chartError.destroy();
        window.chartError = null;
    }
    if (window.chartConf) {
        window.chartConf.destroy();
        window.chartConf = null;
    }

    // DEFINICIÓN CORRECTA DE CONTEXTOS
    const ctxError = document
        .getElementById("graficaError")
        .getContext("2d");

    const ctxConf = document
        .getElementById("graficaConfianza")
        .getContext("2d");

    // GRÁFICA 1: n vs Error
    window.chartError = new Chart(ctxError, {
        type: "line",
        data: {
            labels: errores,
            datasets: [{
                label: "Tamaño de muestra necesario",
                data: nError,
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            animation: false,
            plugins: {
                title: {
                    display: true,
                    text: "Efecto del Margen de Error en el Tamaño de Muestra"
                }
            },
            scales: {
                x: { title: { display: true, text: "Margen de Error (E)" } },
                y: { title: { display: true, text: "Muestra necesaria (n)" } }
            }
        }
    });

    // GRÁFICA 2: confianza
    window.chartConf = new Chart(ctxConf, {
        type: "bar",
        data: {
            labels: confs.map(c => c + "%"),
            datasets: [{
                label: "Tamaño de muestra",
                data: nConf,
                borderWidth: 1
            }]
        },
        options: {
            animation: false,
            plugins: {
                title: {
                    display: true,
                    text: "Tamaño de Muestra según Nivel de Confianza"
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "n" }
                }
            }
        }
    });
}


// LIMPIEZA TOTAL DE RESULTADOS (al cambiar de modelo)
 
//  CONTROL GENERAL 

function limpiarResultados() {

    document.getElementById("resN").textContent = "--";
    document.getElementById("resZ").textContent = "--";
    document.getElementById("resSigma").textContent = "--";
    document.getElementById("resError").textContent = "--";

    const resumen = document.getElementById("resumenEstadistico");
    const conclusion = document.getElementById("cardConclusion");

    if (resumen) resumen.style.display = "none";
    if (conclusion) conclusion.style.display = "none";

    // LIMPIEZA INTERPRETACIÓN DE PROPORCIONES
    const conclusionProp = document.getElementById("cardConclusionProp");
    if (conclusionProp) conclusionProp.style.display = "none";

    if (window.chartError) {
        window.chartError.destroy();
        window.chartError = null;
    }
    if (window.chartConf) {
        window.chartConf.destroy();
        window.chartConf = null;
    }
}


function alternarFormulas() {

    const tipo = document.getElementById("tipoCalculo").value;
    window.modeloActivo = tipo;

    const bloqueMedias = document.getElementById("bloqueMedias");
    const inputsProp = document.getElementById("inputsProporciones");
    const formulaMedias = document.getElementById("formulaMedias");
    const formulaProp = document.getElementById("formulaProp");

    if (tipo === "proporciones") {
        if (bloqueMedias) bloqueMedias.style.display = "none";
        if (formulaMedias) formulaMedias.style.display = "none";

        inputsProp.style.display = "grid";
        formulaProp.style.display = "block";
    } else {
        if (bloqueMedias) bloqueMedias.style.display = "block";
        if (formulaMedias) formulaMedias.style.display = "block";

        inputsProp.style.display = "none";
        formulaProp.style.display = "none";
    }

    limpiarResultados();
}


function ejecutarCalculo() {
    if (window.modeloActivo === "proporciones") {
        calcularProporcion();
    } else {
        calcular();
    }
}

async function exportarPDF() {

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const margin = 12;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let y = 20;

    // TÍTULO
    pdf.setFontSize(16);
    pdf.text(
        window.modeloActivo === "medias"
            ? "Reporte Técnico – Estimación de Medias"
            : "Reporte Técnico – Estimación de Proporciones",
        margin,
        y
    );

    y += 12;

    const contenedor = document.getElementById("reporteContenedor");
    const cards = contenedor.querySelectorAll(".card");

    for (let card of cards) {

        // Saltar cards ocultas
        if (card.offsetParent === null) continue;

        const canvas = await html2canvas(card, {
            scale: 2,
            useCORS: true
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Si no cabe la card completa → nueva página
        if (y + imgHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
        }

        pdf.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight);
        y += imgHeight + 8;
    }

    // Guardar
    pdf.save(
        window.modeloActivo === "medias"
            ? "Reporte_Completo_Medias.pdf"
            : "Reporte_Completo_Proporciones.pdf"
    );
}

// MANEJO GLOBAL DE ERRORES
function mostrarError(mensaje) {
    const alerta = document.getElementById("alertaError");
    if (!alerta) {
        alert(mensaje); // respaldo absoluto
        return;
    }
    alerta.textContent = mensaje;
    alerta.style.display = "block";
}

function limpiarError() {
    const alerta = document.getElementById("alertaError");
    if (alerta) {
        alerta.textContent = "";
        alerta.style.display = "none";
    }
}

