//  GRÁFICAS GLOBALES 
window.chartError = window.chartError || null;
window.chartConf = window.chartConf || null;

/***********************************************************
 * PROPORCIONES – ESTIMACIÓN DE TAMAÑO DE MUESTRA
 ***********************************************************/
function calcularProporcion() {

    limpiarError();
    document.getElementById("cardConclusion").style.display = "none";

    if (typeof limpiarResultados === "function") {
        limpiarResultados();
    }

    // -------- 1. CAPTURA DE DATOS --------
    const confianza = parseFloat(document.getElementById("confianzaProp").value);
    const E = parseFloat(document.getElementById("errorProp").value);
    const p = parseFloat(document.getElementById("pInput").value);
    const usarCPF = document.getElementById("usarCPF").checked;
    const N = parseFloat(document.getElementById("Nprop").value);
    const q = 1 - p;

    document.getElementById("qDisplay").value = q.toFixed(3);

    // -------- 2. VALIDACIONES (MISMO ESTILO QUE MEDIAS) --------
    // -------- LIMPIAR MENSAJES PREVIOS --------
    limpiarError();

    // -------- VALIDACIONES --------
    if (isNaN(confianza) || confianza <= 0 || confianza >= 100) {
        mostrarError("El nivel de confianza debe estar entre 0% y 100%.");
        return;
    }

    if (isNaN(p) || p <= 0 || p >= 1) {
        mostrarError("La proporción esperada p debe ser un número mayor que 0 y menor que 1.");
        return;
    }

    if (isNaN(E) || E <= 0 || E >= 1) {
        mostrarError("El margen de error E debe ser mayor que 0 y menor que 1.");
        return;
    }

    // Corrección por población finita
    if (document.getElementById("usarCPF").checked) {
        const N = parseFloat(document.getElementById("Nprop").value);
        if (isNaN(N) || N <= 0) {
            mostrarError("Para aplicar la corrección por población finita, N debe ser mayor que 0.");
            return;
        }
    }


    // -------- 3. CÁLCULO --------
    const Z = calcularZ(confianza);
    const n0 = (Z ** 2 * p * q) / (E ** 2);

    let n = n0;
    if (usarCPF) {
        n = n0 / (1 + (n0 - 1) / N);
    }

    const nFinal = Math.ceil(n);

    // -------- 4. MOSTRAR RESULTADOS --------
    document.getElementById("resN").textContent = nFinal;
    document.getElementById("resZ").textContent = Z.toFixed(3);
    document.getElementById("resSigma").textContent = p.toFixed(3);
    document.getElementById("resError").textContent = E;

    // -------- 5. INTERPRETACIÓN TÉCNICA (MISMA TARJETA) --------
    limpiarError(); // importante
    const card = document.getElementById("cardConclusion");
    const texto = document.getElementById("textoConclusion");

    card.style.display = "block";

    const errorProp = Z * Math.sqrt((p * q) / nFinal);
    const li = Math.max(0, p - errorProp);
    const ls = Math.min(1, p + errorProp);

    texto.innerHTML = `
        <p>
            Para un nivel de confianza del <strong>${confianza}%</strong> y
            un margen de error máximo permitido de <strong>${E}</strong>,
            se determinó un tamaño de muestra de <strong>${nFinal}</strong> unidades.
        </p>

        <p>
            La proporción estimada es <strong>${(p * 100).toFixed(2)}%</strong>.
        </p>

        <p>
            El intervalo de confianza es:
            <strong>[${(li * 100).toFixed(2)}%, ${(ls * 100).toFixed(2)}%]</strong>
        </p>

        <p style="color:#27ae60;">
            <strong>Conclusión:</strong>
            La estimación es estadísticamente válida bajo muestreo aleatorio.
        </p>
    `;

    // -------- 6. GRÁFICAS --------
    dibujarGraficasProporcion(Z, p, q, E);

    console.log("✔ Proporción calculada:", nFinal);
}

/***********************************************************
 * GRÁFICAS – PROPORCIONES
 ***********************************************************/
function dibujarGraficasProporcion(Z, p, q, E) {

    if (window.chartError) {
        window.chartError.destroy();
        window.chartError = null;
    }
    if (window.chartConf) {
        window.chartConf.destroy();
        window.chartConf = null;
    }

    // Gráfica n vs Error
    const errores = [];
    const muestras = [];

    for (let e = E * 0.5; e <= E * 2; e += E / 5) {
        errores.push(e.toFixed(3));
        muestras.push(Math.ceil((Z ** 2 * p * q) / (e ** 2)));
    }

    const ctxError = document.getElementById("graficaError").getContext("2d");
    window.chartError = new Chart(ctxError, {
        type: "line",
        data: {
            labels: errores,
            datasets: [{
                label: "Tamaño de muestra (n)",
                data: muestras,
                borderWidth: 3,
                tension: 0.3
            }]
        }
    });

    // Gráfica n vs Confianza
    const niveles = [90, 95, 99];
    const muestrasConf = niveles.map(c =>
        Math.ceil((calcularZ(c) ** 2 * p * q) / (E ** 2))
    );

    const ctxConf = document.getElementById("graficaConfianza").getContext("2d");
    window.chartConf = new Chart(ctxConf, {
        type: "bar",
        data: {
            labels: niveles.map(c => c + "%"),
            datasets: [{
                label: "Tamaño de muestra (n)",
                data: muestrasConf
            }]
        }
    });
}
