import math
from scipy import stats
import modulo_media as mm
import Proporcion as mp

def mostrar_teoria():
    print("\n" + "="*65)
    print("MARCO TEORICO Y FUNDAMENTOS ESTADISTICOS")
    print("="*65)
    print("1. CONCEPTOS CLAVE:")
    print("   - Estimación Puntual: El valor calculado (media/proporcion) de la muestra.")
    print("   - Margen de Error (E): Maxima diferencia esperada entre muestra y poblacion.")
    print("   - Nivel de Confianza: Probabilidad de exito del intervalo (Ej: 95%).")
    print("\n2. SUPUESTOS DEL MODELO:")
    print("   - Independencia: Observaciones aleatorias no relacionadas.")
    print("   - Normalidad: Se asume por n > 30 (Teorema del Limite Central).")
    print("\n3. VALORES Z COMUNES:")
    print("   - 90%: 1.645 | 95%: 1.96 | 99%: 2.576")
    print("="*65 + "\n")

def menu_principal():
    mostrar_teoria()
    
    print("BIENVENIDO A LA CALCULADORA DE MUESTREO")
    print("1. Estimar una MEDIA (Gasto, edad, peso, etc.)")
    print("2. Estimar una PROPORCION (Votos, satisfaccion, presencia/ausencia)")
    print("3. Salir")
    
    opcion = input("\nSeleccione una opcion: ")

    if opcion == "1":
        # Ejecuta el código de modulo_media.py
        mm.main()
        print("\nInterpretacion: Este es el numero minimo de individuos para asegurar \nque la media muestral no se desvie mas de 'E' de la media real.")
        
    elif opcion == "2":
        # Ejecuta el código de Proporcion.py
        mp.main()
        print("\nInterpretacion: Este n asegura que la proporcion estimada sea \nrepresentativa dentro del margen de error definido.")
        
    elif opcion == "3":
        print("Saliendo del programa...Vuelva pronto :)")
    else:
        print("Opcion invalida.")

if __name__ == "__main__":
    menu_principal()