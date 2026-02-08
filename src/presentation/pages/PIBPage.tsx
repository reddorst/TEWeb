import React from 'react';
import PIBMap from '../components/PIBMap';

const PIBPage: React.FC = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                    Producto Interno Bruto (PIB)
                </h1>
                <p style={{ color: '#64748b' }}>
                    Visualización del PIB por Entidad Federativa - Base 2018
                </p>
            </div>

            <PIBMap />
        </div>
    );
};

export default PIBPage;
