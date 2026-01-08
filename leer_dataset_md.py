
import pandas as pd

def obtener_desviacion_dataset(): 
    #  Ruta modular del archivo csv 
    carpeta_dataset ="dataset"
    nombre_dataset = "Blood_Donor_Registry_Dataset"
    alojamiento_csv = "data"
    archivo_csv = "blood_donation_registry_ml_ready.csv"

    #  Ensamble de la ruta 
    path_dataset = carpeta_dataset+ "/" + nombre_dataset + "/" + alojamiento_csv + "/" +archivo_csv

    #  Lectura del archivo csv 
    df = pd.read_csv(path_dataset)

    #  Filtro para columans numericas 
    df_numerico = df.select_dtypes(include=['number'])
    columnas_numeros = df_numerico.columns.tolist()

    #  Filtro para columans con palabras 
    df_palabras = df.select_dtypes(include=['object'])
    columnas_palabras= df_palabras.columns.tolist()

    #  Impresión en pantalla de los datos dentro del csv 
    print()
    print("El dataset seleccionado fue",f"\033[36m{nombre_dataset}\033[0m" )
    print("Las columnas a elegir son: ")
    for x in columnas_numeros: 
        print("\t-",x)

    print("Se discriminaron las siguientes columnas al no poseer datos numéricos: ")
    for x in columnas_palabras: 
        print("\t-",x)

    while True: 
        try:
            #  Obtencion de la des_est , media y mediana 
            columna_seleccionada = input("¿Qué columna deseas seleccionar?\n\t\033[32mR:\033[0m")
            desviacion_columna_seleccionada = df[columna_seleccionada].std()
            media_columna_seleccionada = df[columna_seleccionada].mean()
            mediana_columna_seleccionada = df[columna_seleccionada].median()
            coeficiente_variacion = (desviacion_columna_seleccionada/media_columna_seleccionada)*100
            print()
            
            print("La desviación estándar de la columna " + columna_seleccionada + " es" , f"\033[30;33m{round(desviacion_columna_seleccionada,5)}\033[0m" , ", su media es", f"\033[30;33m{round(media_columna_seleccionada,5)}\033[0m", "y su mediana es",f"\033[30;33m{round(mediana_columna_seleccionada,5)}\033[0m")
            print()
            #  Evaluacion de los datos considerando la desv_est y la media 
            print("El coeficiente de variación es: ",round(coeficiente_variacion,5))
            if coeficiente_variacion > 0 and coeficiente_variacion < 16:
                print("Los datos son homogéneos para una investigación experimental") #Criterio de Pimentel-Gomes
            elif coeficiente_variacion > 15 and coeficiente_variacion < 31: 
                print("Los datos tienen una variabilidad moderada") #Estadistica Descriptiva General 
            elif coeficiente_variacion > 30: 
                print("Los datos están muy dispersos")
            
            print()
            break; 

        except Exception: 
            print("\033[31mError, intente de nuevo\033[0m")
    
    return desviacion_columna_seleccionada


def obtener_desviacion_dataset_web(nombre_csv, columna):
    ruta = f"dataset/Blood_Donor_Registry_Dataset/data/{nombre_csv}"
    df = pd.read_csv(ruta)

    if columna not in df.columns:
        raise ValueError("Columna no válida")

    return {
        "sigma": float(df[columna].std()),
        "media": float(df[columna].mean()),
        "mediana": float(df[columna].median())
    }
