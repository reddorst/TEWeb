export interface City {
    state: string;
    name: string;
    lat: number;
    lon: number;
}

export const MEXICO_CITIES: City[] = [
    // Aguascalientes
    { state: "Aguascalientes", name: "Aguascalientes", lat: 21.8853, lon: -102.2916 },
    { state: "Aguascalientes", name: "Jesús María", lat: 21.9614, lon: -102.3436 },
    { state: "Aguascalientes", name: "Calvillo", lat: 21.8469, lon: -102.7188 },
    // Baja California
    { state: "Baja California", name: "Mexicali", lat: 32.6278, lon: -115.4545 },
    { state: "Baja California", name: "Tijuana", lat: 32.5149, lon: -117.0382 },
    { state: "Baja California", name: "Ensenada", lat: 31.8667, lon: -116.6 },
    { state: "Baja California", name: "Tecate", lat: 32.5672, lon: -116.6333 },
    { state: "Baja California", name: "Rosarito", lat: 32.3333, lon: -117.05 },
    // Baja California Sur
    { state: "Baja California Sur", name: "La Paz", lat: 24.1426, lon: -110.3127 },
    { state: "Baja California Sur", name: "Cabo San Lucas", lat: 22.8909, lon: -109.9124 },
    { state: "Baja California Sur", name: "San José del Cabo", lat: 23.0514, lon: -109.6975 },
    { state: "Baja California Sur", name: "Ciudad Constitución", lat: 25.0322, lon: -111.6621 },
    // Campeche
    { state: "Campeche", name: "San Francisco de Campeche", lat: 19.8301, lon: -90.5349 },
    { state: "Campeche", name: "Ciudad del Carmen", lat: 18.6333, lon: -91.8333 },
    { state: "Campeche", name: "Champotón", lat: 19.35, lon: -90.7167 },
    { state: "Campeche", name: "Escárcega", lat: 18.6089, lon: -90.7456 },
    // Chiapas
    { state: "Chiapas", name: "Tuxtla Gutiérrez", lat: 16.7569, lon: -93.1292 },
    { state: "Chiapas", name: "Tapachula", lat: 14.9094, lon: -92.2647 },
    { state: "Chiapas", name: "San Cristóbal de las Casas", lat: 16.7367, lon: -92.6383 },
    { state: "Chiapas", name: "Comitán de Domínguez", lat: 16.2517, lon: -92.1342 },
    { state: "Chiapas", name: "Palenque", lat: 17.5092, lon: -91.9819 },
    // Chihuahua
    { state: "Chihuahua", name: "Chihuahua", lat: 28.633, lon: -106.0691 },
    { state: "Chihuahua", name: "Ciudad Juárez", lat: 31.6904, lon: -106.4245 },
    { state: "Chihuahua", name: "Delicias", lat: 28.1931, lon: -105.4711 },
    { state: "Chihuahua", name: "Cuauhtémoc", lat: 28.4047, lon: -106.8661 },
    { state: "Chihuahua", name: "Parral", lat: 26.93, lon: -105.66 },
    // Coahuila
    { state: "Coahuila", name: "Saltillo", lat: 25.4232, lon: -101.0053 },
    { state: "Coahuila", name: "Torreón", lat: 25.5439, lon: -103.4189 },
    { state: "Coahuila", name: "Monclova", lat: 26.9061, lon: -101.4203 },
    { state: "Coahuila", name: "Piedras Negras", lat: 28.7001, lon: -100.5233 },
    { state: "Coahuila", name: "Ciudad Acuña", lat: 29.3232, lon: -100.9333 },
    // Colima
    { state: "Colima", name: "Colima", lat: 19.2433, lon: -103.725 },
    { state: "Colima", name: "Manzanillo", lat: 19.0526, lon: -104.3151 },
    { state: "Colima", name: "Villa de Álvarez", lat: 19.2667, lon: -103.7333 },
    { state: "Colima", name: "Tecomán", lat: 18.913, lon: -103.8747 },
    // Durango
    { state: "Durango", name: "Durango", lat: 24.0277, lon: -104.6532 },
    { state: "Durango", name: "Gómez Palacio", lat: 25.5611, lon: -103.4983 },
    { state: "Durango", name: "Lerdo", lat: 25.5333, lon: -103.5167 },
    { state: "Durango", name: "Santiago Papasquiaro", lat: 25.0441, lon: -105.4194 },
    // Estado de México
    { state: "Estado de México", name: "Toluca", lat: 19.2827, lon: -99.6557 },
    { state: "Estado de México", name: "Ecatepec de Morelos", lat: 19.6017, lon: -99.0506 },
    { state: "Estado de México", name: "Naucalpan de Juárez", lat: 19.4786, lon: -99.2396 },
    { state: "Estado de México", name: "Nezahualcóyotl", lat: 19.4, lon: -98.9889 },
    { state: "Estado de México", name: "Tlalnepantla de Baz", lat: 19.54, lon: -99.19 },
    { state: "Estado de México", name: "Chimalhuacán", lat: 19.4167, lon: -98.95 },
    // Guanajuato
    { state: "Guanajuato", name: "Guanajuato", lat: 21.019, lon: -101.2574 },
    { state: "Guanajuato", name: "León", lat: 21.1219, lon: -101.6822 },
    { state: "Guanajuato", name: "Irapuato", lat: 20.6742, lon: -101.3547 },
    { state: "Guanajuato", name: "Celaya", lat: 20.5228, lon: -100.8139 },
    { state: "Guanajuato", name: "Salamanca", lat: 20.5722, lon: -101.1839 },
    // Guerrero
    { state: "Guerrero", name: "Chilpancingo", lat: 17.5513, lon: -99.5005 },
    { state: "Guerrero", name: "Acapulco de Juárez", lat: 16.8531, lon: -99.8237 },
    { state: "Guerrero", name: "Iguala de la Independencia", lat: 18.3491, lon: -99.5401 },
    { state: "Guerrero", name: "Zihuatanejo", lat: 17.6417, lon: -101.5517 },
    { state: "Guerrero", name: "Taxco de Alarcón", lat: 18.5562, lon: -99.6047 },
    // Hidalgo
    { state: "Hidalgo", name: "Pachuca", lat: 20.1011, lon: -98.7591 },
    { state: "Hidalgo", name: "Tulancingo", lat: 20.08, lon: -98.37 },
    { state: "Hidalgo", name: "Tula de Allende", lat: 20.0519, lon: -99.3439 },
    { state: "Hidalgo", name: "Huejutla de Reyes", lat: 21.1408, lon: -98.4194 },
    // Jalisco
    { state: "Jalisco", name: "Guadalajara", lat: 20.6597, lon: -103.3496 },
    { state: "Jalisco", name: "Zapopan", lat: 20.7222, lon: -103.3917 },
    { state: "Jalisco", name: "Tlaquepaque", lat: 20.6403, lon: -103.3147 },
    { state: "Jalisco", name: "Puerto Vallarta", lat: 20.6534, lon: -105.2253 },
    { state: "Jalisco", name: "Lagos de Moreno", lat: 21.3556, lon: -101.9317 },
    { state: "Jalisco", name: "Tepatitlán de Morelos", lat: 20.8167, lon: -102.7667 },
    // Michoacán
    { state: "Michoacán", name: "Morelia", lat: 19.7006, lon: -101.186 },
    { state: "Michoacán", name: "Uruapan", lat: 19.4214, lon: -102.0622 },
    { state: "Michoacán", name: "Zamora de Hidalgo", lat: 19.9833, lon: -102.2833 },
    { state: "Michoacán", name: "Lázaro Cárdenas", lat: 17.9583, lon: -102.2 },
    { state: "Michoacán", name: "Apatzingán", lat: 19.0833, lon: -102.35 },
    // Morelos
    { state: "Morelos", name: "Cuernavaca", lat: 18.9261, lon: -99.2307 },
    { state: "Morelos", name: "Jiutepec", lat: 18.8833, lon: -99.1833 },
    { state: "Morelos", name: "Cuautla", lat: 18.8167, lon: -98.95 },
    { state: "Morelos", name: "Temixco", lat: 18.85, lon: -99.2333 },
    // Nayarit
    { state: "Nayarit", name: "Tepic", lat: 21.5039, lon: -104.8946 },
    { state: "Nayarit", name: "Bahía de Banderas", lat: 20.75, lon: -105.3 },
    { state: "Nayarit", name: "Santiago Ixcuintla", lat: 21.8125, lon: -105.2097 },
    // Nuevo León
    { state: "Nuevo León", name: "Monterrey", lat: 25.6866, lon: -100.3161 },
    { state: "Nuevo León", name: "Guadalupe", lat: 25.6769, lon: -100.2561 },
    { state: "Nuevo León", name: "Apodaca", lat: 25.78, lon: -100.19 },
    { state: "Nuevo León", name: "San Nicolás de los Garza", lat: 25.75, lon: -100.2833 },
    { state: "Nuevo León", name: "Santa Catarina", lat: 25.675, lon: -100.4639 },
    { state: "Nuevo León", name: "San Pedro Garza García", lat: 25.65, lon: -100.4 },
    // Oaxaca
    { state: "Oaxaca", name: "Oaxaca de Juárez", lat: 17.0732, lon: -96.7266 },
    { state: "Oaxaca", name: "San Juan Bautista Tuxtepec", lat: 18.0833, lon: -96.1167 },
    { state: "Oaxaca", name: "Juchitán de Zaragoza", lat: 16.4333, lon: -95.0167 },
    { state: "Oaxaca", name: "Salina Cruz", lat: 16.1833, lon: -95.2 },
    { state: "Oaxaca", name: "Huajuapan de León", lat: 17.8081, lon: -97.7781 },
    // Puebla
    { state: "Puebla", name: "Puebla de Zaragoza", lat: 19.0414, lon: -98.2063 },
    { state: "Puebla", name: "Tehuacán", lat: 18.46, lon: -97.39 },
    { state: "Puebla", name: "San Martín Texmelucan", lat: 19.2833, lon: -98.4333 },
    { state: "Puebla", name: "Atlixco", lat: 18.9, lon: -98.4333 },
    { state: "Puebla", name: "San Pedro Cholula", lat: 19.0667, lon: -98.3 },
    // Querétaro
    { state: "Querétaro", name: "Santiago de Querétaro", lat: 20.5888, lon: -100.3899 },
    { state: "Querétaro", name: "San Juan del Río", lat: 20.3889, lon: -99.9972 },
    { state: "Querétaro", name: "Corregidora", lat: 20.5333, lon: -100.4333 },
    { state: "Querétaro", name: "El Marqués", lat: 20.6167, lon: -100.2833 },
    // Quintana Roo
    { state: "Quintana Roo", name: "Chetumal", lat: 18.5141, lon: -88.3038 },
    { state: "Quintana Roo", name: "Cancún", lat: 21.1619, lon: -86.8515 },
    { state: "Quintana Roo", name: "Playa del Carmen", lat: 20.6289, lon: -87.0739 },
    { state: "Quintana Roo", name: "Cozumel", lat: 20.5083, lon: -86.9458 },
    // San Luis Potosí
    { state: "San Luis Potosí", name: "San Luis Potosí", lat: 22.1565, lon: -100.9855 },
    { state: "San Luis Potosí", name: "Soledad de Graciano Sánchez", lat: 22.1833, lon: -100.9333 },
    { state: "San Luis Potosí", name: "Ciudad Valles", lat: 21.9833, lon: -99.0167 },
    { state: "San Luis Potosí", name: "Matehuala", lat: 23.65, lon: -100.65 },
    // Sinaloa
    { state: "Sinaloa", name: "Culiacán", lat: 24.8054, lon: -107.3946 },
    { state: "Sinaloa", name: "Mazatlán", lat: 23.2333, lon: -106.4167 },
    { state: "Sinaloa", name: "Los Mochis", lat: 25.7903, lon: -108.9911 },
    { state: "Sinaloa", name: "Guasave", lat: 25.57, lon: -108.47 },
    // Sonora
    { state: "Sonora", name: "Hermosillo", lat: 29.073, lon: -110.9559 },
    { state: "Sonora", name: "Ciudad Obregón", lat: 27.4833, lon: -109.9333 },
    { state: "Sonora", name: "Nogales", lat: 31.3011, lon: -110.9381 },
    { state: "Sonora", name: "San Luis Río Colorado", lat: 32.45, lon: -114.7667 },
    { state: "Sonora", name: "Guaymas", lat: 27.9178, lon: -110.8989 },
    // Tabasco
    { state: "Tabasco", name: "Villahermosa", lat: 17.9892, lon: -92.9475 },
    { state: "Tabasco", name: "Cárdenas", lat: 17.9833, lon: -93.3667 },
    { state: "Tabasco", name: "Comalcalco", lat: 18.25, lon: -93.2167 },
    { state: "Tabasco", name: "Huimanguillo", lat: 17.8333, lon: -93.3833 },
    // Tamaulipas
    { state: "Tamaulipas", name: "Ciudad Victoria", lat: 23.7369, lon: -99.1411 },
    { state: "Tamaulipas", name: "Reynosa", lat: 26.0922, lon: -98.2778 },
    { state: "Tamaulipas", name: "Matamoros", lat: 25.8833, lon: -97.5 },
    { state: "Tamaulipas", name: "Nuevo Laredo", lat: 27.4833, lon: -99.5 },
    { state: "Tamaulipas", name: "Tampico", lat: 22.25, lon: -97.85 },
    // Tlaxcala
    { state: "Tlaxcala", name: "Tlaxcala", lat: 19.3182, lon: -98.2375 },
    { state: "Tlaxcala", name: "Apizaco", lat: 19.4167, lon: -98.1333 },
    { state: "Tlaxcala", name: "Huamantla", lat: 19.3167, lon: -97.9167 },
    { state: "Tlaxcala", name: "San Pablo del Monte", lat: 19.1167, lon: -98.1667 },
    // Veracruz
    { state: "Veracruz", name: "Xalapa", lat: 19.5438, lon: -96.9102 },
    { state: "Veracruz", name: "Veracruz", lat: 19.1738, lon: -96.1342 },
    { state: "Veracruz", name: "Coatzacoalcos", lat: 18.1333, lon: -94.4333 },
    { state: "Veracruz", name: "Córdoba", lat: 18.8833, lon: -96.9167 },
    { state: "Veracruz", name: "Orizaba", lat: 18.85, lon: -97.1033 },
    { state: "Veracruz", name: "Poza Rica de Hidalgo", lat: 20.5333, lon: -97.45 },
    { state: "Veracruz", name: "Minatitlán", lat: 18.0167, lon: -94.55 },
    // Yucatán
    { state: "Yucatán", name: "Mérida", lat: 20.9674, lon: -89.5926 },
    { state: "Yucatán", name: "Kanasín", lat: 20.9333, lon: -89.55 },
    { state: "Yucatán", name: "Valladolid", lat: 20.6897, lon: -88.2014 },
    { state: "Yucatán", name: "Tizimín", lat: 21.1422, lon: -88.1469 },
    // Zacatecas
    { state: "Zacatecas", name: "Zacatecas", lat: 22.7709, lon: -102.5832 },
    { state: "Zacatecas", name: "Guadalupe", lat: 22.75, lon: -102.5167 },
    { state: "Zacatecas", name: "Fresnillo", lat: 23.1667, lon: -102.8667 },
    { state: "Zacatecas", name: "Jerez", lat: 22.6472, lon: -103.0033 },
    // Ciudad de México
    { state: "Ciudad de México", name: "Iztapalapa", lat: 19.3444, lon: -99.0733 },
    { state: "Ciudad de México", name: "Gustavo A. Madero", lat: 19.4939, lon: -99.1106 },
    { state: "Ciudad de México", name: "Álvaro Obregón", lat: 19.3586, lon: -99.1994 },
    { state: "Ciudad de México", name: "Tlalpan", lat: 19.2897, lon: -99.1717 },
    { state: "Ciudad de México", name: "Coyoacán", lat: 19.3497, lon: -99.1614 },
];
