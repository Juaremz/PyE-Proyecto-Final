from scipy import stats

#Inicialización a nulo de las varables a utilizar 
porcentaje_confianza_esperado = 0.0000
desviacion_estandar_esperada = 0.0000
margen_error_esperado = 0.0000

def solicitud_datos_usuario(): 
    global porcentaje_confianza_esperado,desviacion_estandar_esperada, margen_error_esperado
    #entrada para el nivel de confianza 
    while True: 
        porcentaje_confianza_esperado = input("\t¿Que nivel de confianza quieres que tenga el experimento? \033[96m(Ej: 87%)\033[0m\n\t\tR:")
        
        
        if porcentaje_confianza_esperado.find("%") == -1: 
            print("\tEl valor tiene que ser un porcentaje") 
            
        else: 
            porcentaje_confianza_esperado=porcentaje_confianza_esperado.strip("%")
            break; 

   #desviacion estandar esperada / S estimada
    while True:  
        desviacion_estandar_esperada = input("\t¿Que tan alejados deseas que esten los datos de la media? \033[96m(Ej: 23)\033[0m\n\t\tR:")
        if desviacion_estandar_esperada.isalpha(): 
            print("\tEl valor tiene que ser un numero") 
        elif desviacion_estandar_esperada.isalpha() != True: 
            break; 
  
    #margen E
    while True:  
        margen_error_esperado = input("\t¿Que margen de error esperas? \033[96m(Ej: 5)\033[0m\n\t\tR:")
        if margen_error_esperado.isalpha(): 
            print("\tEl valor tiene que ser un numero") 
        elif margen_error_esperado.isalpha() != True: 
            break; 

def conversion_porcentaje_decimal(num): 
    num = int(num)/100
    return num 

#calculo de α o nivel de significancia (area de las colas)
def calculo_significancia(num): 
    num = 1 - float(num)
    num = num/2         #al considerar la distribucion simetrica, consideramos α/2
    
    return num

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
    print(f"\t\t   \033[32mEl tamaño de muestra necesario será de: {round(n)}\033[0m")

def main(): 
    print("\t\t\033[36m┌─────────────────────────────────────────────┐")
    print("\t\t│  MÓDULO PARA SABER EL TAMAÑO DE TU MUESTRA  │")
    print("\t\t└─────────────────────────────────────────────┘\033[0m")
    solicitud_datos_usuario()
    print("\t\t\t┌────────────────────────────────┐")
    print("\t\t\t│        \033[36mFórmula utilizada\033[0m       │")
    print("\t\t\t├────────────────────────────────┤")
    print("\t\t\t│        \033[33mn = (Z · σ / E)²\033[0m        │")
    print("\t\t\t└────────────────────────────────┘")
    calculo_n()
    
    


main()