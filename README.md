# PyE-Proyecto-Final
# Calculadora de Tamaño de Muestra

Este proyecto es una herramienta integral programada en Python para la planeación de estudios estadísticos. Permite calcular el tamaño de muestra ($n$) necesario para estimar medias y proporciones poblacionales, basándose en niveles de confianza y márgenes de error específicos.

**Funcionalidades del código:**
* **Definición de Conceptos:** Documentación de estimación puntual, intervalos de confianza y margen de error.
* **Establecimiento de Supuestos:** Verificación de normalidad (Teorema del Límite Central) e independencia de las observaciones.
* **Valores Críticos:** Definición y uso de la distribución normal estándar para obtener valores $Z$ (90% = 1.645, 95% = 1.96, 99% = 2.576).
* **Integración:** Creación del módulo principal (`main.py`) que unifica las herramientas de cálculo en una sola interfaz.
* **Cálculo de Media:** Implementación de la fórmula $n = (\frac{Z \cdot \sigma}{E})^2$ para determinar la muestra necesaria.
* **Gestión de Datos:** Creación de `leer_dataset_md.py` para extraer desviaciones estándar ($\sigma$) de datasets reales (Blood Donor Registry).
* **Muestra Piloto:** Funcionalidad para que el usuario ingrese su propia desviación estándar estimada.
* **Cálculo de Proporción:** Implementación de la fórmula $n = \frac{Z^2 \cdot p(1-p)}{E^2}$ incluyendo el caso conservador ($p = 0.5$).
* **Corrección por Población Finita:** Implementación del ajuste para poblaciones conocidas ($N$) mediante la fórmula $n_{ajustada} = \frac{n_0}{1 + \frac{n_0-1}{N}}$.
* **Análisis de Resultados:** Comparativa de resultados con y sin corrección para optimizar la recolección de datos.

--Librerías a importar para correr modulo_media.py--
* pandas
* scipy
