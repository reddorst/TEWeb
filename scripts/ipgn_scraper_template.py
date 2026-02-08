import asyncio
import csv
import os
from datetime import datetime
from playwright.async_api import async_playwright

# Configuración básica
URL = "https://www.cre.gob.mx/IPGN/"
OUTPUT_FILE = "ipgn_latest.csv"

# Mapeo de meses en español a números
MONTH_MAP = {
    "Enero": "01", "Febrero": "02", "Marzo": "03", "Abril": "04",
    "Mayo": "05", "Junio": "06", "Julio": "07", "Agosto": "08",
    "Septiembre": "09", "Octubre": "10", "Noviembre": "11", "Diciembre": "12"
}

async def scrape_ipgn():
    print("--- Iniciando Scraper de IPGN (Automated Browser) ---")
    
    async with async_playwright() as p:
        # Lanzamos el navegador
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            print(f"Navegando a {URL}...")
            await page.goto(URL, wait_until="networkidle")
            
            # 1. Seleccionar 'Nivel de degradación' -> 'Todas las opciones'
            # (Ajustar selectores según la estructura real de la página)
            print("Seleccionando Nivel: Nacional (IPGN)...")
            await page.select_option("select#Nivel", value="1") # Valor ejemplo: Ajustar tras inspección
            
            # 2. Seleccionar Año (ejemplo: último año o Todos)
            # Para una descarga completa, iteraríamos. Para actualización, solo el último.
            print("Seleccionando Año...")
            await page.select_option("select#Anio", label="2024")
            
            # 3. Seleccionar Mes
            print("Seleccionando Mes...")
            await page.select_option("select#Mes", label="Noviembre")
            
            # 4. Clic en Consultar
            print("Consultando...")
            await page.click("button#btnConsultar")
            
            # 5. Esperar tabla
            await page.wait_for_selector("table#tblDatos", timeout=10000)
            
            # 6. Extraer datos
            rows = await page.query_selector_all("table#tblDatos tr")
            data = []
            
            for row in rows[1:]: # Omitir header
                cols = await row.query_selector_all("td")
                if len(cols) >= 5:
                    data.append({
                        "periodo": "2024-11-01",
                        "valor": await cols[3].inner_text(), # Columna para índice_mxn_gj
                        "unidad": "MXN/GJ"
                    })
            
            print(f"Se extrajeron {len(data)} registros.")
            
            # Guardar en CSV temporal
            with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=["periodo", "valor", "unidad"])
                writer.writeheader()
                writer.writerows(data)
                
            print(f"✅ Datos guardados en {OUTPUT_FILE}")

        except Exception as e:
            print(f"❌ Error durante el scraping: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    # Nota: Este script requiere 'pip install playwright' y 'playwright install'
    asyncio.run(scrape_ipgn())
