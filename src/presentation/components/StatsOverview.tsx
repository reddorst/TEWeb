import React from 'react';
import { Zap, Server, Factory, Database, Shield, ZapOff, Activity } from 'lucide-react';

const COLORS = {
    gas: '#FFCD00',
    diesel: '#1e293b',
    biogas: '#10b981',
    text: '#111827',
    subtext: '#6B7280',
    border: '#e5e7eb',
    bg: '#F9FAFB'
};

interface MetricItemProps {
    label: string;
    value: string | number;
    unit?: string;
    color: string;
    icon?: React.ElementType;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, unit, color, icon: Icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
            {Icon && <Icon size={14} style={{ color: COLORS.subtext }} />}
            <span style={{ fontSize: '0.875rem', color: COLORS.subtext, fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text }}>{value}</span>
            {unit && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.subtext }}>{unit}</span>}
        </div>
    </div>
);

export const StatsOverview: React.FC = () => {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>

                {/* LEFT COLUMN: EQUIPMENT */}
                <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${COLORS.border}` }}>
                    {/* Header: Total Equipos */}
                    <div style={{ padding: '2rem', borderBottom: `1px solid ${COLORS.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <div style={{ padding: '0.6rem', backgroundColor: '#FEF3C7', borderRadius: '12px', color: '#D97706' }}>
                                <Server size={28} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Motogeneradores Instalados
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.50rem' }}>
                                    <span style={{ fontSize: '2.75rem', fontWeight: 800, color: COLORS.text, lineHeight: 1 }}>299</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 600, color: COLORS.subtext }}>Equipos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content: Breakdown */}
                    <div style={{ padding: '1.5rem', backgroundColor: COLORS.bg, flex: 1 }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '4px', height: '12px', backgroundColor: COLORS.gas, borderRadius: '2px' }} />
                                EQUIPOS POR TECNOLOGÍA
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <MetricItem label="Gas Natural" value="44" color={COLORS.gas} />
                                <MetricItem label="Diésel" value="196" color={COLORS.diesel} />
                                <MetricItem label="Biogás" value="59" color={COLORS.biogas} />
                            </div>
                        </div>

                        <div style={{ borderTop: `1px dashed ${COLORS.border}`, paddingTop: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '4px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                                EQUIPOS POR SOLUCIÓN
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <MetricItem label="Data Centers" value="112" color="#3b82f6" icon={Database} />
                                <MetricItem label="Cogeneración" value="27" color="#8b5cf6" icon={Factory} />
                                <MetricItem label="Backup" value="74" color="#64748b" icon={Shield} />
                                <MetricItem label="Peak Shaving" value="17" color="#f59e0b" icon={ZapOff} />
                                <MetricItem label="Generación continua" value="69" color="#10b981" icon={Activity} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: POWER */}
                <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column' }}>
                    {/* Header: Total Potencia */}
                    <div style={{ padding: '2rem', borderBottom: `1px solid ${COLORS.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <div style={{ padding: '0.6rem', backgroundColor: '#DBEAFE', borderRadius: '12px', color: '#1E40AF' }}>
                                <Zap size={28} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Potencia Instalada Total
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.50rem' }}>
                                    <span style={{ fontSize: '2.75rem', fontWeight: 800, color: COLORS.text, lineHeight: 1 }}>547.59</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: COLORS.subtext }}>MW</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content: Breakdown */}
                    <div style={{ padding: '1.5rem', backgroundColor: COLORS.bg, flex: 1 }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '4px', height: '12px', backgroundColor: COLORS.gas, borderRadius: '2px' }} />
                                POTENCIA POR TECNOLOGÍA (MW)
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <MetricItem label="Gas Natural" value="105.31" unit="MW" color={COLORS.gas} />
                                <MetricItem label="Diésel" value="430.60" unit="MW" color={COLORS.diesel} />
                                <MetricItem label="Biogás" value="11.69" unit="MW" color={COLORS.biogas} />
                            </div>
                        </div>

                        <div style={{ borderTop: `1px dashed ${COLORS.border}`, paddingTop: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '4px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                                POTENCIA POR SOLUCIÓN (MW)
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <MetricItem label="Data Centers" value="112.00" unit="MW" color="#3b82f6" icon={Database} />
                                <MetricItem label="Cogeneración" value="27.00" unit="MW" color="#8b5cf6" icon={Factory} />
                                <MetricItem label="Respaldo" value="109.05" unit="MW" color="#64748b" icon={Shield} />
                                <MetricItem label="Peak Shaving" value="27.33" unit="MW" color="#f59e0b" icon={ZapOff} />
                                <MetricItem label="Generación Continua" value="33.94" unit="MW" color="#10b981" icon={Activity} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
