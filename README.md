# Dashboard de Energía y Gas Natural

Este proyecto es un tablero interactivo para la visualización y análisis de datos energéticos de México y Estados Unidos.

## Características Principales

### 🌍 Gas Natural
- **Precios en Tiempo Real**: Comparativa entre **Henry Hub (USA)** y **IPGN (México)**.
- **Mapa Regional IPGN**: Visualización interactiva de precios por las 6 regiones de la CRE.
- **Almacenamiento**: Reporte semanal de inventarios de gas natural (EIA).
- **Reservas**: Histórico de reservas probadas.

### ⚡ Generación Eléctrica
- **Mapa de Centrales**: Ubicación geo-referenciada de plantas de generación.
- **Estadísticas**: Desglose por tecnología (Ciclo Combinado, Térmica, etc.) y solución.

### 📈 Indicadores Económicos
- **Inflación**: Seguimiento del INPC y variación anual.
- **Paridad Cambiaria**: Tipos de cambio MXN/USD, MXN/EUR.
- **PIB**: Producto Interno Bruto trimestral y anual por estados.

### 🌡️ Clima
- **Mapa Térmico**: Interpolación de temperaturas en tiempo real para todo México.
- **Pronóstico**: Consulta histórica y predicción por ciudad.

## Tecnologías Utilizadas
- **Frontend**: React + Vite + TypeScript
- **Estilos**: CSS Modules / Vanilla CSS (Diseño "Gold & Black")
- **Gráficas**: Recharts
- **Mapas**: React-Leaflet + shpjs
- **Base de Datos**: Supabase
- **Iconos**: Lucide-React

## Instalación Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/dashboard-energia.git
   cd dashboard-energia
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Correr en desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue

Este proyecto está optimizado para desplegarse en **Vercel** o **Netlify**.
Simplemente importa este repositorio y el comando de construcción (`npm run build`) se detectará automáticamente.

---
Desarrollado con ❤️ para el análisis del sector energético.
