# 🔒 ALERTA DE SEGURIDAD - GUÍA DE RESOLUCIÓN

## ⚠️ TOKENS EXPUESTOS DETECTADOS

GitHub detectó que los siguientes tokens fueron expuestos en tu repositorio público:

1. **Supabase** (URL + Anon Key)
2. **INEGI** Token
3. **Banxico** Token
4. **EIA** API Key
5. **OpenWeather** API Key

## ✅ CAMBIOS IMPLEMENTADOS

### 1. Sistema de Variables de Entorno
- ✅ Creado `.env.example` (plantilla sin valores reales)
- ✅ Creado `.env.local` (con tus valores actuales - NO se sube a Git)
- ✅ Actualizado `.gitignore` para excluir `.env.local`

### 2. Código Frontend Seguro
- ✅ [`src/infrastructure/supabaseClient.ts`](file:///c:/Users/User/Documents/Antigravity/TEWeb_v1/src/infrastructure/supabaseClient.ts)
- ✅ [`src/presentation/pages/DataPage.tsx`](file:///c:/Users/User/Documents/Antigravity/TEWeb_v1/src/presentation/pages/DataPage.tsx)  
- ✅ [`src/presentation/components/WeatherMap.tsx`](file:///c:/Users/User/Documents/Antigravity/TEWeb_v1/src/presentation/components/WeatherMap.tsx)

Todos usan ahora `import.meta.env.VITE_*` en lugar de valores hardcoded.

### 3. Scripts Actualizados (Ejemplo)
- ✅ [`scripts/test_onecall_activation.js`](file:///c:/Users/User/Documents/Antigravity/TEWeb_v1/scripts/test_onecall_activation.js)
- 📄 Ver [`scripts/README_SECURITY.md`](file:///c:/Users/User/Documents/Antigravity/TEWeb_v1/scripts/README_SECURITY.md) para más info

---

## 🚨 ACCIONES CRÍTICAS REQUERIDAS

### PASO 1: Instalar Dependencias (Local)
```bash
# Necesitas instalar dotenv para que los scripts funcionen
npm install dotenv
```

### PASO 2: Configurar Vercel
Ve a tu proyecto en Vercel → Settings → Environment Variables

Agrega las siguientes variables:
```
VITE_SUPABASE_URL = https://ndpfcmvqgvrllisfkzsy.supabase.co
VITE_SUPABASE_ANON_KEY = [regenera este token]
VITE_WEATHER_API_KEY = [regenera este token]
```

> [!IMPORTANT]
> Vercel leerá las variables con prefijo `VITE_` automáticamente durante el build.

### PASO 3: REGENERAR TODOS LOS TOKENS ⚠️
**CRÍTICO**: Los tokens actuales están comprometidos. DEBES regenerarlos:

#### 3.1. Supabase
1. Ve a https://supabase.com/dashboard
2. Navega a tu proyecto → Settings → API
3. Regenera el "anon/public" key
4. Actualiza `.env.local` y Vercel

#### 3.2. OpenWeather
1. Ve a https://openweathermap.org/api_keys
2. Revoca el key `889f5116e756f90da9071db4701e56ff`
3. Crea un nuevo API key
4. Actualiza `.env.local` y Vercel

#### 3.3. INEGI
1. Ve a https://www.inegi.org.mx/app/desarrolladores/
2. Genera un nuevo token
3. Actualiza `.env.local`

#### 3.4. Banxico
1. Ve a https://www.banxico.org.mx/SieAPIRest/service/v1/
2. Genera un nuevo token
3. Actualiza `.env.local`

#### 3.5. EIA (US Energy Information Administration)
1. Ve a https://www.eia.gov/opendata/
2. Revoca y regenera tu API key
3. Actualiza `.env.local`

### PASO 4: Verificar Localmente
```bash
npm run dev
```
Asegúrate de que todo funciona con las nuevas variables de entorno.

---

## 📋 ARCHIVOS MODIFICADOS

### Nuevos Archivos:
- `.env.example` - Plantilla pública ✅
- `.env.local` - Tus valores (NO se sube a Git) ✅
- `scripts/config.js` - Config centralizada para scripts ✅
- `scripts/README_SECURITY.md` - Documentación ✅

### Archivos Modificados:
- `.gitignore` - Excluye `.env.local` ✅
- `src/infrastructure/supabaseClient.ts` ✅
- `src/presentation/pages/DataPage.tsx` ✅
- `src/presentation/components/WeatherMap.tsx` ✅
- `scripts/test_onecall_activation.js` ✅

---

## ✅ PRÓXIMOS PASOS

1. ☐ Instala `dotenv`: `npm install dotenv`
2. ☐ Regenera TODOS los tokens (ver PASO 3)
3. ☐ Configura las variables en Vercel (ver PASO 2)
4. ☐ Haz push de estos cambios a GitHub
5. ☐ Vercel volverá a deployar automáticamente con las nuevas variables

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué `.env.local` tiene los valores actuales?**  
R: Para que funcione localmente mientras regeneras los tokens. Este archivo NO se subirá a Git.

**P: ¿Qué pasa con los 20+ scripts que tienen tokens?**  
R: La mayoría son para desarrollo/testing local. La app web usa solo las variables de Vite. Puedes actualizar scripts individuales según los necesites.

**P: ¿Debo borrar el historial de Git?**  
R: Idealmente sí, pero es complejo. Lo más importante es REVOCAR los tokens expuestos para que sean inútiles.

---

**🎯 Prioridad #1: REGENERAR TOKENS AHORA**
