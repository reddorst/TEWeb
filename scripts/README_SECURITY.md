# SCRIPTS README - Security Update

## ⚠️ SECURITY NOTICE

All scripts have been updated to use environment variables instead of hardcoded API tokens.

### How to Use Scripts

All scripts now load credentials from `.env.local` via the central `config.js` file.

**Before running ANY script, make sure:**
1. You have a `.env.local` file in the project root with your tokens
2. The `dotenv` package is installed (`npm install dotenv`)

### Script Updates Summary

The following scripts have been updated to use environment variables:

**INEGI Scripts (14 files):**
- All INEGI scripts now load `INEGI_TOKEN` from `process.env.INEGI_TOKEN`

**Banxico Scripts (3 files):**
- All Banxico scripts now load `BANXICO_TOKEN` from `process.env.BANXICO_TOKEN`

**EIA Scripts (5 files):**
- All EIA scripts now load `EIA_API_KEY` from `process.env.EIA_API_KEY`

**Weather Script (1 file):**
- `test_onecall_activation.js` now loads from `process.env.VITE_WEATHER_API_KEY`

### Pattern Used

Each script file starts with:
```javascript
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const TOKEN_NAME = process.env.TOKEN_NAME;
```

### Note

Most of these scripts are for development/testing. The production web app (Vite) uses `import.meta.env.VITE_*` variables that are configured in Vercel.
