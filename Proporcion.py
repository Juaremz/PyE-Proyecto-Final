import math

def main():
    print("Cálculo de módulo para proporción")
    
    # Ingreso de valores
    z = float(input("Ingresa el valor crítico Z: "))
    e = float(input("Ingresa el margen de error E: "))
    
    # Elección de p
    r = input("Desea usar p = 0.5? (Y/N): ").strip().upper()
    
    if r == 'Y':
        p = 0.5
    else:
        p = float(input("Ingrese el valor de p: "))
    
    # Tamaño de muestra sin corrección
    n0 = (z**2 * p * (1 - p)) / (e**2)
    
    # Corrección por población finita
    rcpf = input("Desea usar corrección por población finita? (Y/N): ").strip().upper()
    
    if rcpf == 'Y':
        N = int(input("Ingrese el tamaño de la población N: "))
        n = n0 / (1 + (n0 - 1) / N)
        
        print("\nSe aplicó corrección por población finita")
        print("\nFórmulas usadas:")
        print("n0 = (Z^2 * p * (1 - p)) / E^2")
        print("n = n0 / (1 + (n0 - 1)/N)")
        print(f"\nValor de n0 (sin corrección): {n0:.2f}")
    else:
        n = n0
        print("\nNo se aplicó corrección por población finita")
        print("\nFórmula usada:")
        print("n = (Z^2 * p * (1 - p)) / E^2")
    
    # Redondeo
    nr = math.ceil(n)
    print(f"\nValor de n: {n:.2f}")
    print(f"Valor de n redondeado: {nr:.0f}")
    
    print("\nSupuestos:")
    print("- Muestreo aleatorio")
    print("- Independencia de observaciones")
    print("- Aproximación normal")

if __name__ == "__main__":
    main()