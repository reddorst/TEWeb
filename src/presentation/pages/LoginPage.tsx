import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Credenciales inválidas');
        }
    };

    return (
        <div className="login-container" style={{ backgroundColor: '#f8fafc' }}>
            <div className="login-box" style={{ padding: '2.5rem', maxWidth: '450px' }}>
                <div className="login-header" style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <img
                            src="/Logo-tracsa-energia-header.svg"
                            alt="Tracsa Energía"
                            style={{ maxWidth: '200px', height: 'auto' }}
                        />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>
                        Energy Intelligence Hub
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Login
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '1rem' }}>
                        Ingrese sus credenciales para acceder
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                    <Input
                        label="Usuario"
                        placeholder="Roberto Rojo, Comercial o Flex"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="Ingrese su contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fecaca', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="btn-full" style={{ padding: '0.75rem', fontSize: '1rem', fontWeight: 700 }}>
                        Iniciar Sesión
                    </Button>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Cuentas de acceso:</p>
                        <div style={{ display: 'grid', gap: '4px' }}>
                            <p>Admin: <code>Roberto Rojo</code></p>
                            <p>Interno: <code>Comercial</code></p>
                            <p>Cliente: <code>Flex</code></p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
