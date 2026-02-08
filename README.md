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

## Despliegue en Vercel

Este proyecto está optimizado para desplegarse en **Vercel** (recomendado).

### Pasos para Desplegar

1. **Sube tu código a GitHub** (si aún no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Despliega en Vercel**:
   - Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub
   - Haz clic en **"Add New..."** → **"Project"**
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente:
     - **Framework**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Haz clic en **"Deploy"**

3. **Resultado**:
   - Tu aplicación estará disponible 24/7 sin dormirse
   - Se actualizará automáticamente con cada `git push` a la rama `main`
   - Obtendrás una URL única: `tu-proyecto.vercel.app`

### Características del Hosting en Vercel (Plan Gratuito)

✅ **Disponibilidad 24/7** - Sin tiempos de inactividad  
✅ **CDN Global** - Carga rápida desde cualquier ubicación  
✅ **SSL/HTTPS** - Certificado automático  
✅ **100GB** de ancho de banda/mes  
✅ **Deployments automáticos** desde GitHub  

## Solución de Problemas

### Error: `TS6133: 'X' is declared but its value is never read`
**Causa**: Importaciones no utilizadas en archivos TypeScript.  
**Solución**: Elimina las importaciones no utilizadas del archivo indicado.

### Error: `failed to push some refs`
**Causa**: El repositorio local no está sincronizado con el remoto.  
**Solución**: Ejecuta `git pull --rebase origin main` antes de hacer push.

### Error: `fatal: not a git repository`
**Causa**: No has inicializado git en tu carpeta.  
**Solución**: Ejecuta `git init` en la raíz del proyecto.

---
Desarrollado con ❤️ para el análisis del sector energético.
