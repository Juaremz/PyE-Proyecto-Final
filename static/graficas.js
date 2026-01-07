const zValues = { 90: 1.645, 95: 1.96, 99: 2.576 };

let chartError = null;
let chartConf = null;

// -------------------------- CAMBIO DE MODO -------------------------------
function cambiarModo() {
    const modo = document.getElementById("tipoDatos").value;
    document.getElementById("bloquePropios").style.display = modo === "propios" ? "block" : "none";
    document.getElementById("bloqueDataset").style.display = modo === "dataset" ? "block" : "none";
    document.getElementById("bloqueSubir").style.display = modo === "subir" ? "block" : "none";

    if (modo === "dataset") cargarDatasets();
}

/**
 Calcula el valor Z para cualquier nivel de confianza
 @param {number} confianza - Porcentaje (0-100)
 */
/**
 Calcula el valor Z para cualquier nivel de confianza
 Integra el diccionario internamente para evitar errores de referencia
 */
function calcularZ(confianza) {
    // Diccionario interno de seguridad
    const tablaValoresZ = { 
        "90": 1.645, 
        "95": 1.96, 
        "99": 2.576 
    };

    // 1. Si el usuario usó un valor estándar (90, 95, 99)
    if (tablaValoresZ[confianza.toString()]) {
        return tablaValoresZ[confianza.toString()];
    }

    // 2. Si el usuario escribió un valor personalizado (ej. 92.5)
    // Usamos la aproximación matemática de la Normal Estándar
    const p = 1 - (1 - confianza / 100) / 2;
    const t = Math.sqrt(-2 * Math.log(1 - p));
    const c0 = 2.30753, c1 = 0.27061, d1 = 0.99229, d2 = 0.04481;
    const zCalculado = t - (c0 + c1 * t) / (1 + d1 * t + d2 * t * t);
    
    return parseFloat(zCalculado.toFixed(3));
}

// ----------------- DATASETS ---------------------
async function cargarDatasets() {
  const res = await fetch("/datasets");
  const datasets = await res.json();

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
  const dataset = datasetSelect.value;
  const res = await fetch(`/columnas/${dataset}`);
  const columnas = await res.json();

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
  const res = await fetch(
    `/info_columna/${datasetSelect.value}/${columnaSelect.value}`
  );
  const info = await res.json();

  descCol.textContent = info.description || "";
  tipoCol.textContent = info.type || "";
  rangoCol.textContent = info.allowed || "";
}

// ARCHIVO SUBIDO
async function procesarArchivoSubido() {
    const fileInput = document.getElementById("archivoCSV");
    if (fileInput.files.length === 0) return alert("Selecciona un archivo primero");

    const formData = new FormData();
    formData.append("archivo", fileInput.files[0]);

    const res = await fetch("/procesar_csv", { method: "POST", body: formData });
    const columnas = await res.json();

    const select = document.getElementById("columnaSubidaSelect");
    select.innerHTML = "";
    columnas.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c; opt.textContent = c;
        select.appendChild(opt);
    });
}



// ---------------- CÁLCULO ------------------------------
// Variable global para guardar el CV y usarlo en la conclusión

// 1. Función para calcular Z personalizado
async function calcular() {
    let sigma, confianzaInput, error, n, media, cv, mediana;
    const modo = document.getElementById("tipoDatos").value;
    
    try {
        // --- 1. CAPTURA DE DATOS SEGÚN EL MODO ---
        if (modo === "propios") {
            sigma = parseFloat(document.getElementById("stdInput").value);
            confianzaInput = document.getElementById("confianzaPropios").value;
            error = parseFloat(document.getElementById("errorPropios").value);
            media = null; 
            mediana = null;
        } 
        else if (modo === "dataset") {
            const ds = document.getElementById("datasetSelect").value;
            const col = document.getElementById("columnaSelect").value;
            if (!ds || !col) throw new Error("Selecciona Dataset y Columna");

            const res = await fetch(`/estadisticos/${ds}/${col}`);
            const data = await res.json();
            
            sigma = data.sigma || 0;
            media = data.media || 0;
            mediana = data.mediana || 0;
            confianzaInput = document.getElementById("confianzaDataset").value;
            error = parseFloat(document.getElementById("errorDataset").value);
            cv = media !== 0 ? (sigma / media) * 100 : 0;
        } 
        else if (modo === "subir") {
            const fileInput = document.getElementById("archivoCSV");
            const col = document.getElementById("columnaSubidaSelect").value;
            if (fileInput.files.length === 0 || !col) throw new Error("Carga un archivo");

            const formData = new FormData();
            formData.append("archivo", fileInput.files[0]);
            formData.append("columna", col);

            const res = await fetch("/estadisticos_subidos", { method: "POST", body: formData });
            const data = await res.json();
            
            sigma = data.sigma || 0;
            media = data.media || 0;
            mediana = data.mediana || 0;
            confianzaInput = document.getElementById("confianzaSubida").value;
            error = parseFloat(document.getElementById("errorSubida").value);
            cv = data.cv || (media !== 0 ? (sigma / media) * 100 : 0);
        }

        // --- 2. CÁLCULOS MATEMÁTICOS ---
        const valorConf = parseFloat(confianzaInput);
        const z = calcularZ(valorConf);
        if (isNaN(z)) {
            throw new Error("No se pudo calcular el valor Z para la confianza ingresada");
        }
        n = Math.ceil((z * sigma / error) ** 2);

        // --- 3. ACTUALIZAR INTERFAZ NUMÉRICA ---
        // --- 3. ACTUALIZAR INTERFAZ NUMÉRICA (Cálculo Final) ---
        document.getElementById("resN").textContent = n;
        document.getElementById("resZ").textContent = z;
        document.getElementById("resSigma").textContent = sigma.toFixed(4);
        document.getElementById("resError").textContent = error;

        // --- CONTROL INTELIGENTE DEL RESUMEN ESTADÍSTICO ---
        const resumenDiv = document.getElementById("resumenEstadistico");

        if (modo === "propios") {
            // Si los datos son manuales, ocultamos el resumen para no ser redundantes
            resumenDiv.style.display = "none";
        } else {
            // Si es Dataset o Archivo Subido, mostramos el análisis completo
            resumenDiv.style.display = "block";
            
            // Llenamos los datos obtenidos del análisis del archivo
            document.getElementById("statMedia").textContent = media.toFixed(2);
            document.getElementById("statMediana").textContent = mediana.toFixed(2);
            document.getElementById("statSigma").textContent = sigma.toFixed(4);
            document.getElementById("statCV").textContent = cv.toFixed(2);
        }

        // --- 4. LÓGICA DE LA CONCLUSIÓN (Integrada aquí) ---
        const conclusionCard = document.getElementById("cardConclusion");
        const conclusionTexto = document.getElementById("textoConclusion");
        conclusionCard.style.display = "block";

        let htmlConclusion = `
            <p>Para un nivel de confianza del <strong>${valorConf}%</strong> y un error máximo de <strong>${error}</strong>, se determinó una muestra de <strong>${n}</strong> unidades.</p>
        `;

        if (media !== null && mediana !== null) {
            const diferencia = Math.abs(media - mediana) / media;
            if (diferencia > 0.1) {
                htmlConclusion += `<p style="color: #e67e22;"><strong>Aviso de Sesgo:</strong> Existe una diferencia notable entre la media (${media.toFixed(2)}) y la mediana (${mediana.toFixed(2)}), lo que sugiere que los datos tienen asimetría.</p>`;
            } else {
                htmlConclusion += `<p style="color: #27ae60;"><strong>Simetría:</strong> La proximidad entre media y mediana indica una distribución balanceada de los datos.</p>`;
            }
        }
        conclusionTexto.innerHTML = htmlConclusion;

        // --- 5. DIBUJAR GRÁFICAS ---
        // --- DIBUJAR GRÁFICAS ---
        const listaE = [error * 0.5, error, error * 1.5, error * 2].map(e => e.toFixed(2));
        const listaN = listaE.map(e => Math.ceil((z * sigma / e) ** 2));

        // Esto genera los datos para la segunda gráfica comparando 90, 95 y 99%
        const listaC = [90, 95, 99];
        const listaNC = listaC.map(c => Math.ceil((calcularZ(c) * sigma / error) ** 2));

        dibujarGraficas(listaE, listaN, listaC, listaNC);

    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    }
}


// ---------------- GRÁFICAS -----------------------
function dibujarGraficas(errores, nError, confs, nConf) {
    if (chartError) chartError.destroy();
    if (chartConf) chartConf.destroy();

    const ctxError = document.getElementById("graficaError").getContext("2d");
    const ctxConf = document.getElementById("graficaConfianza").getContext("2d");

    //GRÁFICA 1: RELACIÓN n vs ERROR
    chartError = new Chart(ctxError, {
        type: "line",
        data: {
            labels: errores,
            datasets: [{
                label: "Tamaño de muestra necesario",
                data: nError,
                borderColor: "#3498db",
                backgroundColor: "rgba(52, 152, 219, 0.2)",
                borderWidth: 3,
                fill: true,
                tension: 0.3 // Suaviza la línea
            }]
        },
        options: {
            animation: false,
            plugins: {
                title: { display: true, text: 'Efecto del Margen de Error en el Tamaño de Muestra' }
            },
            scales: {
                x: { title: { display: true, text: 'Margen de Error (E)' } },
                y: { title: { display: true, text: 'Sujetos necesarios (n)' } }
            }
        }
    });

    //GRÁFICA 2: COMPARATIVA POR CONFIANZA
    chartConf = new Chart(ctxConf, {
        type: "bar",
        data: {
            labels: confs.map(c => c + "% de confianza"),
            datasets: [{
                label: "Sujetos (n)",
                data: nConf,
                backgroundColor: [
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(241, 194, 50, 0.7)',
                    'rgba(231, 76, 60, 0.7)'
                ],
                borderColor: ['#27ae60', '#f1c40f', '#c0392b'],
                borderWidth: 1
            }]
        },
        options: {
            animation: false,
            plugins: {
                title: { display: true, text: 'Tamaño de Muestra según Nivel de Confianza' },
                legend: { display: false } // Ocultamos la leyenda porque los ejes ya explican todo
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    title: { display: true, text: 'Cantidad de personas (n)' } 
                }
            }
            
        }
    });
}

  console.log(canvas);

  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: [1, 2, 3, 4],
      datasets: [{
        label: "Prueba",
        data: [10, 20, 15, 30],
        borderWidth: 2
      }]
    }
  });

async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    let currentY = 20;

    const bloques = ['resumenEstadistico', 'cardResultados', 'cardConclusion', 'cardGrafica1', 'cardGrafica2'];

    // Título
    doc.setFontSize(18);
    doc.text("Reporte Técnico de Muestreo", margin, currentY);
    currentY += 15;

    for (const id of bloques) {
        const el = document.getElementById(id);
        if (el && el.style.display !== 'none') {
            // la fórmula con KaTeX
            const canvas = await html2canvas(el, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pdfWidth - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (currentY + imgHeight > pdfHeight - margin) {
                doc.addPage();
                currentY = 20;
            }

            doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 10;
        }
    }
    doc.save("Reporte_Muestreo.pdf");
}

function alternarFormulas() {
    const tipo = document.getElementById("tipoCalculo").value;
    const inputsMedias = document.getElementById("stdInput").parentElement; 
    const inputsProp = document.getElementById("inputsProporciones");
    const labelSigma = document.querySelector('label[for="stdInput"]') || inputsMedias.querySelector('label');

    if (tipo === "proporciones") {
        inputsProp.style.display = "block";
        inputsMedias.style.opacity = "0.3"; // "Apaga" visualmente la desviación estándar
        inputsMedias.querySelector('input').disabled = true;
    } else {
        inputsProp.style.display = "none";
        inputsMedias.style.opacity = "1";
        inputsMedias.querySelector('input').disabled = false;
    }
}

// Escuchador para calcular q automáticamente (q = 1 - p)
document.getElementById("pInput")?.addEventListener("input", function(e) {
    const p = parseFloat(e.target.value) || 0;
    document.getElementById("qDisplay").value = (1 - p).toFixed(2);
});
