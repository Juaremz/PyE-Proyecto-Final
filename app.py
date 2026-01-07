from flask import Flask, jsonify, render_template
import os
import pandas as pd
from leer_dataset_md import obtener_desviacion_dataset_web
from flask import request

app = Flask(__name__)

BASE_DATASET = "dataset/Blood_Donor_Registry_Dataset"

# --------------- PÁGINA PRINCIPAL --------------------
@app.route("/")
def index():
    return render_template("index.html")

# --------------- LISTAR DATASETS ---------------
@app.route("/datasets")
def listar_datasets():
    ruta = os.path.join(BASE_DATASET, "data")
    archivos = [f for f in os.listdir(ruta) if f.endswith(".csv")]
    return jsonify(archivos)

# AGREGAR DATASET
@app.route("/procesar_csv", methods=["POST"])
def procesar_csv():
    if 'archivo' not in request.files:
        return jsonify({"error": "No hay archivo"}), 400
    
    archivo = request.files['archivo']
    df = pd.read_csv(archivo)
    
    # Si solo queremos las columnas
    columnas = df.select_dtypes(include=["number"]).columns.tolist()
    return jsonify(columnas)

@app.route("/estadisticos_subidos", methods=["POST"])
def estadisticos_subidos():
    archivo = request.files['archivo']
    columna = request.form['columna']
    df = pd.read_csv(archivo)
    return jsonify({
        "sigma": float(df[columna].std()),
        "media": float(df[columna].mean()),
        "mediana": float(df[columna].median()),
        "cv": float((df[columna].std() / df[columna].mean()) * 100)
    })

# --------------- LISTAR COLUMNAS NUMÉRICAS ---------------
@app.route("/columnas/<dataset>")
def columnas(dataset):
    ruta = os.path.join(BASE_DATASET, "data", dataset)
    df = pd.read_csv(ruta)
    columnas_numericas = df.select_dtypes(include=["number"]).columns.tolist()
    return jsonify(columnas_numericas)

# --------------- INFO DEL DATA_DICTIONARY ---------------
@app.route("/info_columna/<dataset>/<columna>")
def info_columna(dataset, columna):
    dic_path = os.path.join(BASE_DATASET, "docs", "data_dictionary.csv")
    dic = pd.read_csv(dic_path)

    fila = dic[(dic["file"] == dataset) & (dic["column_name"] == columna)]

    if fila.empty:
        return jsonify({})

    return jsonify({
        "description": fila.iloc[0]["description"],
        "type": fila.iloc[0]["type"],
        "allowed": fila.iloc[0]["allowed_values_or_range"]
    })

# --------------- ESTADÍSTICOS ---------------
@app.route("/estadisticos/<dataset>/<columna>")
def estadisticos(dataset, columna):
    datos = obtener_desviacion_dataset_web(dataset, columna)
    return jsonify(datos)

@app.route("/estadisticos/<dataset>/<columna>")
def obtener_estadisticos(dataset, columna):
    df = pd.read_csv(f"datasets/{dataset}")
    return jsonify({
        "sigma": float(df[columna].std()),
        "media": float(df[columna].mean()),
        "mediana": float(df[columna].median()) 
    })

if __name__ == "__main__":
    app.run(debug=True)
