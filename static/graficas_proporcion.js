// --- FUNCIONES DE UTILIDAD ---

// Calcula Z para cualquier nivel de confianza
function calcularZ(confianza) {
    const tablaValoresZ = { "90": 1.645, "95": 1.96, "99": 2.576 };
    if (tablaValoresZ[confianza.toString()]) return tablaValoresZ[confianza.toString()];

    const p = 1 - (1 - confianza / 100) / 2;
    const t = Math.sqrt(-2 * Math.log(1 - p));
    const c0 = 2.30753, c1 = 0.27061, d1 = 0.99229, d2 = 0.04481;
    const zCalculado = t - (c0 + c1 * t) / (1 + d1 * t + d2 * t * t);
    return parseFloat(zCalculado.toFixed(3));
}

// Variables globales para las gráficas (para poder destruirlas antes de crear nuevas)
let chartError = null;
let chartConfianza = null;

// --- FUNCIÓN PRINCIPAL DE CÁLCULO ---

async function calcular() {
    let sigma, confianzaInput, error, n, media, cv, mediana;
    const modo = document.getElementById("tipoDatos").value;
    
    try {
        // 1. OBTENCIÓN DE DATOS SEGÚN MODO
        if (modo === "propios") {
            sigma = parseFloat(document.getElementById("stdInput").value);
            confianzaInput = document.getElementById("confianzaPropios").value;
            error = parseFloat(document.getElementById("errorPropios").value);
            media = null; 
        } 
        else if (modo === "dataset") {
            const ds = document.getElementById("datasetSelect").value;
            const col = document.getElementById("columnaSelect").value;
            if (!ds || !col) throw new Error("Selecciona Dataset y Columna");

            const res = await fetch(`/estadisticos/${ds}/${col}`);
            const data = await res.json();
            sigma = data.sigma; media = data.media; mediana = data.mediana;
            confianzaInput = document.getElementById("confianzaDataset").value;
            error = parseFloat(document.getElementById("errorDataset").value);
            cv = (sigma / media) * 100;
        } 
        else if (modo === "subir") {
            const fileInput = document.getElementById("archivoCSV");
            const col = document.getElementById("columnaSubidaSelect").value;
            const formData = new FormData();
            formData.append("archivo", fileInput.files[0]);
            formData.append("columna", col);

            const res = await fetch("/estadisticos_subidos", { method: "POST", body: formData });
            const data = await res.json();
            sigma = data.sigma; media = data.media; mediana = data.mediana;
            confianzaInput = document.getElementById("confianzaSubida").value;
            error = parseFloat(document.getElementById("errorSubida").value);
            cv = data.cv;
        }

        // 2. PROCESAMIENTO MATEMÁTICO
        const valorConf = parseFloat(confianzaInput);
        const z = calcularZ(valorConf);
        n = Math.ceil((z * sigma / error) ** 2);

        // 3. ACTUALIZAR INTERFAZ
        document.getElementById("resN").textContent = n;
        document.getElementById("resZ").textContent = z;
        document.getElementById("resSigma").textContent = sigma.toFixed(4);
        document.getElementById("resError").textContent = error;

        // Mostrar/Ocultar Resumen Estadístico
        const resumenDiv = document.getElementById("resumenEstadistico");
        if (modo !== "propios") {
            resumenDiv.style.display = "block";
            document.getElementById("statMedia").textContent = media.toFixed(2);
            document.getElementById("statMediana").textContent = mediana.toFixed(2);
            document.getElementById("statSigma").textContent = sigma.toFixed(4);
            document.getElementById("statCV").textContent = cv.toFixed(2);
        } else {
            resumenDiv.style.display = "none";
        }

        // 4. CONCLUSIÓN DINÁMICA
        const conclusionCard = document.getElementById("cardConclusion");
        conclusionCard.style.display = "block";
        let mensaje = `Para una confianza del <strong>${valorConf}%</strong> y un error de <strong>${error}</strong>, se requiere una muestra de <strong>${n}</strong>.`;
        if (cv) mensaje += ` El dataset presenta un Coeficiente de Variación de <strong>${cv.toFixed(2)}%</strong>.`;
        document.getElementById("textoConclusion").innerHTML = mensaje;

        // 5. GENERAR GRÁFICAS
        generarGraficas(sigma, z, error, valorConf);

    } catch (err) {
        alert("Error: " + err.message);
    }
}

// --- FUNCIÓN DE GRÁFICAS ---

function generarGraficas(sigma, z, errorOriginal, confianzaOriginal) {
    // Datos para Gráfica de Error (n vs E)
    const errores = [errorOriginal * 0.5, errorOriginal * 0.8, errorOriginal, errorOriginal * 1.2, errorOriginal * 1.5];
    const nPorError = errores.map(e => Math.ceil((z * sigma / e) ** 2));

    // Datos para Gráfica de Confianza (n vs Z)
    const confianzas = [90, 95, 99];
    const nPorConf = confianzas.map(c => Math.ceil((calcularZ(c) * sigma / errorOriginal) ** 2));

    // Configuración común de estilo
    const chartOptions = { responsive: true, plugins: { legend: { display: false } } };

    // Destruir gráficas previas si existen
    if (chartError) chartError.destroy();
    if (chartConfianza) chartConfianza.destroy();

    // Gráfica 1: Error
    chartError = new Chart(document.getElementById('graficaError'), {
        type: 'line',
        data: {
            labels: errores.map(e => e.toFixed(2)),
            datasets: [{ label: 'Muestra (n)', data: nPorError, borderColor: '#27ae60', backgroundColor: 'rgba(39, 174, 96, 0.1)', fill: true, tension: 0.4 }]
        },
        options: chartOptions
    });

    // Gráfica 2: Confianza
    chartConfianza = new Chart(document.getElementById('graficaConfianza'), {
        type: 'bar',
        data: {
            labels: ['90%', '95%', '99%'],
            datasets: [{ label: 'Muestra (n)', data: nPorConf, backgroundColor: ['#3498db', '#2c3e50', '#e67e22'] }]
        },
        options: chartOptions
    });
}