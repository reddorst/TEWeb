// Environment Configuration for Scripts
// Load this file at the top of each script to access environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

module.exports = {
    INEGI_TOKEN: process.env.INEGI_TOKEN,
    BANXICO_TOKEN: process.env.BANXICO_TOKEN,
    EIA_API_KEY: process.env.EIA_API_KEY,
};
