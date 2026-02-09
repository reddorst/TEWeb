import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, LogOut, Map } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format date: "martes 3 de febrero de 2026"
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(currentTime);

    // Format time: "14:30:45"
    const formattedTime = new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(currentTime);

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div style={{ padding: '0 1rem', display: 'flex', justifyContent: 'center' }}>
                        <img
                            src="/Logo-tracsa-energia-header.svg"
                            alt="Tracsa Energía"
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                maxHeight: '60px'
                            }}
                        />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        to="/dashboard"
                        className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        <Map size={20} />
                        <span>Centrales</span>
                    </Link>

                    <Link
                        to="/data"
                        className={`nav-item ${isActive('/data') ? 'active' : ''}`}
                    >
                        <TrendingUp size={20} />
                        <span>Data</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <p className="username">{user?.username}</p>
                        <p className="role">{user?.role}</p>
                    </div>
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={16} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-bar">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                        {location.pathname === '/dashboard' && 'Monitoreo de centrales de generación y cogeneración'}
                        {location.pathname === '/data' && 'Datos relevantes del sector energético'}
                    </h2>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>
                            {formattedDate}
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                            {formattedTime}
                        </span>
                    </div>
                </header>
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
};
