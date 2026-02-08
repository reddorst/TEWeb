# 🚀 Guía de Deployment en Vercel - Post Migración de Seguridad

## ✅ Cambios Completados

- **Supabase**: Migrado a sistema de Publishable/Secret Keys
- **OpenWeather**: Token regenerado (`42554105...`)
- **Banxico**: Token regenerado (`d62bebc3...`)
- **Código**: Todos los secretos movidos a variables de entorno
- **GitHub**: Código seguro subido (sin secretos expuestos)

---

## 📋 Pasos para Redeploy en Vercel

### Paso 1: Crear Nuevo Proyecto en Vercel

1. Ve a https://vercel.com/new
2. Haz clic en **"Import Git Repository"**
3. Selecciona **GitHub**
4. Busca tu repositorio: `reddorst/TEWeb`
5. Haz clic en **"Import"**

### Paso 2: Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto Vite:

- **Framework Preset**: Vite (detectado automáticamente)
- **Root Directory**: `./` (por defecto)
- **Build Command**: `npm run build` (detectado)
- **Output Directory**: `dist` (detectado)

✅ **NO cambies nada**, Vercel lo configurará correctamente.

### Paso 3: Agregar Variables de Entorno

**ANTES de hacer clic en "Deploy"**, ve a la sección **"Environment Variables"** y agrega las siguientes:

#### Variables CRÍTICAS (Frontend):

```
VITE_SUPABASE_URL
Valor: https://ndpfcmvqgvrllisfkzsy.supabase.co
Entornos: ✅ Production  ✅ Preview  ✅ Development
```

```
VITE_SUPABASE_PUBLISHABLE_KEY
Valor: sb_publishable_BMN6H9ImLQPS69qB2fS80w_SalImD6e
Entornos: ✅ Production  ✅ Preview  ✅ Development
```

```
VITE_WEATHER_API_KEY
Valor: 42554105b8d54a6bed6047c6d5640a17
Entornos: ✅ Production  ✅ Preview  ✅ Development
```

> [!IMPORTANT]
> Estas variables con prefijo `VITE_` son necesarias para que la aplicación funcione en producción.

#### Variables Opcionales (Server-side - NO las agregues ahora):

- `SUPABASE_SECRET_KEY` - Solo si creas funciones serverless
- `INEGI_TOKEN`, `BANXICO_TOKEN`, `EIA_API_KEY` - Solo para scripts backend

### Paso 4: Deploy

1. Después de agregar las 3 variables críticas, haz clic en **"Deploy"**
2. Vercel comenzará el build (tomará 1-2 minutos)
3. Una vez completado, verás: ✅ **"Deployment Ready"**

### Paso 5: Verificar el Deploy

1. Haz clic en el enlace de tu deployment (algo como `teweb-xxxxx.vercel.app`)
2. Verifica que:
   - ✅ La página carga correctamente
   - ✅ Puedes ver los datos (conexión a Supabase funciona)
   - ✅ El mapa de clima funciona (OpenWeather API)

---

## 🔒 Verificación de Seguridad

### ¿Cómo verificar que NO hay secretos expuestos?

1. Abre el sitio en Vercel
2. Presiona `F12` (DevTools)
3. Ve a la pestaña **"Network"**
4. Recarga la página
5. Verifica que en las peticiones:
   - ✅ Se usen las APIs de Supabase/OpenWeather
   - ❌ NO se vean los tokens completos en la consola

---

## ⚠️ Tokens Aún Pendientes de Regenerar

Cuando tengas tiempo, deberías regenerar:

- **INEGI**: `57806cbc-6e61-c150-76a8-faf4b2b183a3` (expuesto previamente)
- **EIA**: `TQkJebOc...` (expuesto previamente)

Estos tokens solo afectan scripts locales, no la app en producción.

---

## 🎯 Resumen de Variables de Entorno

| Variable | Dónde se Usa | Vercel | .env.local |
|----------|--------------|--------|------------|
| `VITE_SUPABASE_URL` | Frontend (Producción) | ✅ Sí | ✅ Sí |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend (Producción) | ✅ Sí | ✅ Sí |
| `VITE_WEATHER_API_KEY` | Frontend (Producción) | ✅ Sí | ✅ Sí |
| `SUPABASE_SECRET_KEY` | Backend (Serverless) | ❌ No* | ✅ Sí |
| `INEGI_TOKEN` | Scripts locales | ❌ No | ✅ Sí |
| `BANXICO_TOKEN` | Scripts locales | ❌ No | ✅ Sí |
| `EIA_API_KEY` | Scripts locales | ❌ No | ✅ Sí |

\* Solo agrégala si creas API routes o funciones serverless en el futuro.

---

## ✅ Checklist Final

- [ ] Nuevo proyecto creado en Vercel
- [ ] 3 variables de entorno agregadas (`VITE_SUPABASE_*` y `VITE_WEATHER_API_KEY`)
- [ ] Deploy exitoso
- [ ] Sitio carga correctamente
- [ ] Datos de Supabase se muestran
- [ ] Mapa de clima funciona

---

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"
- **Causa**: No agregaste las variables en Vercel
- **Solución**: Ve a Settings → Environment Variables y agrega las 3 críticas

### Error: 401 Unauthorized (Supabase)
- **Causa**: El publishable key es incorrecto
- **Solución**: Verifica que copiaste `sb_publishable_BMN6H9ImLQPS69qB2fS80w_SalImD6e` correctamente

### Error: 401 Unauthorized (OpenWeather)
- **Causa**: El API key es inválido
- **Solución**: Verifica que el key `42554105b8d54a6bed6047c6d5640a17` esté activo en OpenWeather

---

**🎉 ¡Listo! Tu aplicación ahora está segura y deployada en Vercel.**
