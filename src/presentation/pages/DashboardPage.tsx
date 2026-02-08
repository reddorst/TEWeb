import { useEffect, useState } from 'react';
import { useUseCases } from '../hooks/useUseCases';
import { useAuth } from '../context/AuthContext';
import { PowerPlant } from '../../domain/entities/PowerPlant';
import MapComponent from '../components/MapComponent';
import { StatsOverview } from '../components/StatsOverview';
import { Zap } from 'lucide-react';

export const DashboardPage = () => {
    const { getPowerPlantsUseCase } = useUseCases();
    const { user } = useAuth();
    const [plants, setPlants] = useState<PowerPlant[]>([]);

    useEffect(() => {
        const loadPlants = async () => {
            if (user) {
                const data = await getPowerPlantsUseCase.execute(user);
                setPlants(data);
            }
        };
        loadPlants();
    }, [user]);



    return (
        <div>
            <StatsOverview />

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#374151', margin: '2rem 0 1rem' }}>
                Centrales con monitoreo en tiempo real
            </h2>

            <div className="dashboard-grid">
                {plants.map(plant => (
                    <div key={plant.id} className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1e293b' }}>{plant.name}</h3>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'capitalize' }}>{plant.type.replace('_', ' ')}</p>
                            </div>
                            {plant.isOnline ?
                                <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Zap size={12} /> Online
                                </span> :
                                <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500 }}>
                                    Offline
                                </span>
                            }
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: '#94a3b8' }}>Capacity</span>
                                <span style={{ fontWeight: 600, color: '#334155' }}>{plant.installedCapacityMW} MW</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: '#94a3b8' }}>Current</span>
                                <span style={{ fontWeight: 600, color: '#2563eb' }}>{plant.currentOutputMW} MW</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ height: '650px', padding: '1rem' }}>
                <div className="flex-between mb-4">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Ubicación de centrales de generación</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="point-dot online" style={{ position: 'static', backgroundColor: '#FFCD00' }}></div>
                            <span style={{ fontSize: '0.875rem' }}>Centrales</span>
                        </div>
                    </div>
                </div>
                <MapComponent plants={plants} />
            </div>
        </div>
    );
};
