import shp from 'shpjs';
import fs from 'fs';
import path from 'path';

// Note: In an agent environment, we might need to read the file as a buffer
const inspectShapefile = async () => {
    try {
        const shpPath = 'c:/Users/User/Documents/Antigravity/TEWeb_v1/public/maps/mexican-states.shp';
        const dbfPath = 'c:/Users/User/Documents/Antigravity/TEWeb_v1/public/maps/mexican-states.dbf';

        const shpBuffer = fs.readFileSync(shpPath);
        const dbfBuffer = fs.readFileSync(dbfPath);

        // shpjs can take buffers
        const geojson = await shp.combine([shp.parseShp(shpBuffer), shp.parseDbf(dbfBuffer)]);

        console.log("Total features:", geojson.features.length);
        if (geojson.features.length > 0) {
            console.log("First feature properties:", JSON.stringify(geojson.features[0].properties, null, 2));

            // Log unique values for a few common property names to help identify the ID
            const properties = Object.keys(geojson.features[0].properties);
            console.log("Available property keys:", properties);
        }
    } catch (error) {
        console.error("Error inspecting shapefile:", error);
    }
};

inspectShapefile();
