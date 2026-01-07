from scipy import stats
import math 
from leer_dataset_md import obtener_desviacion_dataset

#Inicialización a nulo de las variables globales a utilizar 
porcentaje_confianza_esperado = 0.0000
desviacion_estandar_esperada = 0.0000
margen_error_esperado = 0.0000

# ========== Solicitud de datos ==========
def solicitud_datos_usuario(seleccion_usuario): 
    global porcentaje_confianza_esperado,desviacion_estandar_esperada, margen_error_esperado
    print()

    while True: 
        if seleccion_usuario == 1: 
            #entrada para el nivel de confianza 
            while True: 
                porcentaje_confianza_esperado = input("¿Que nivel de confianza quieres que tenga el experimento? \033[96m(Ej: 87%)\033[0m\n\tR:")
                if porcentaje_confianza_esperado.find("%") == -1: 
                    print("\tEl valor tiene que ser un porcentaje") 
                    
                else: 
                    porcentaje_confianza_esperado=porcentaje_confianza_esperado.strip("%")
                    break 
            
            #entrada para desviacion estandar esperada / S estimada
            while True:  
                desviacion_estandar_esperada = input("¿Que tan alejados deseas que esten los datos de la media? \033[96m(Ej: 23)\033[0m\n\tR:")
                if desviacion_estandar_esperada.isalpha(): 
                    print("\tEl valor tiene que ser un número") 
                elif desviacion_estandar_esperada.isalpha() != True: 
                    break 
        
            #entrada para margen E
            while True:  
                margen_error_esperado = input("¿Que margen de error esperas? \033[96m(Ej: 5)\033[0m\n\tR:")
                if int(margen_error_esperado) == 0: 
                    print("El valor tiene que ser mayor a cero")
                elif margen_error_esperado.isalpha(): 
                    print("\tEl valor tiene que ser un número") 
                elif margen_error_esperado.isalpha() != True: 
                    break
                
            break
            
        elif seleccion_usuario == 2: 
            #entrada para el nivel de confianza 
            while True: 
                porcentaje_confianza_esperado = input("¿Que nivel de confianza quieres que tenga el experimento? \033[96m(Ej: 87%)\033[0m\n\tR:")
                if porcentaje_confianza_esperado.find("%") == -1: 
                    print("\tEl valor tiene que ser un porcentaje") 
                    
                else: 
                    porcentaje_confianza_esperado=porcentaje_confianza_esperado.strip("%")
                    break 
            
            #entrada para margen E
            while True:  
                margen_error_esperado = input("¿Que margen de error esperas? \033[96m(Ej: 5)\033[0m\n\tR:")
                if int(margen_error_esperado) == 0: 
                    print("El valor tiene que ser mayor a cero")
                elif margen_error_esperado.isalpha(): 
                    print("\tEl valor tiene que ser un número") 
                elif margen_error_esperado.isalpha() != True: 
                    break

            #se obtiene la desv_est del dataset
            desviacion_estandar_esperada = obtener_desviacion_dataset()
            break 
        else: 
            print("Intente de nuevo")

def conversion_porcentaje_decimal(num): 
    num = int(num)/100
    return num 

# ========== Calculo de α o nivel de significancia (area de las colas) ==========
def calculo_significancia(num): 
    num = 1 - float(num)
    num = num/2         #al considerar la distribucion simetrica, consideramos α/2
    return num

# ========== Calculo de la funcion inversa normal ==========
def calculo_funcioninv_dis_normal(): 
    proba_acumulada = 1 - calculo_significancia(conversion_porcentaje_decimal(porcentaje_confianza_esperado))
    z = stats.norm.ppf(proba_acumulada)      #calculo de la inversa normal 
    return z


def calculo_n(): 
    global desviacion_estandar_esperada, margen_error_esperado
    desviacion_estandar_esperada = float(desviacion_estandar_esperada)
    margen_error_esperado = float(margen_error_esperado)

    z = float(calculo_funcioninv_dis_normal())
    
    n = ((z*desviacion_estandar_esperada)/margen_error_esperado)**2
    print(f"\033[32mEl tamaño de muestra necesario será de: {math.ceil(n)}\033[0m")


def main(): 
    print("\033[36m┌─────────────────────────────────────────────┐")
    print("│  MÓDULO PARA SABER EL TAMAÑO DE TU MUESTRA  │")
    print("└─────────────────────────────────────────────┘\033[0m")

    
    while True: 
        try:
            print("Deseas...") 
            seleccion_usuario = input(" 1. Usar datos propios\n 2. Utilizar un dataset precargado\n R:")
            solicitud_datos_usuario(int(seleccion_usuario))

            print("┌────────────────────────────────┐")
            print("│        \033[36mFórmula utilizada\033[0m       │")
            print("├────────────────────────────────┤")
            print("│        \033[33mn = (Z · σ / E)²\033[0m        │")
            print("└────────────────────────────────┘")
            calculo_n()
            break
        except Exception : 
            print("Ocurrió un error")


    
    

if __name__ == "__main__":
    main()


def calcular_n_web(confianza, desviacion, error):
    global porcentaje_confianza_esperado
    global desviacion_estandar_esperada
    global margen_error_esperado

    porcentaje_confianza_esperado = confianza
    desviacion_estandar_esperada = desviacion
    margen_error_esperado = error

    z = calculo_funcioninv_dis_normal()
    n = ((z * float(desviacion)) / float(error))**2

    return math.ceil(n)
