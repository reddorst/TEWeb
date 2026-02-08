import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Bolt } from 'lucide-react';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(username);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials. Try "admin" or "cliente1".');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <div style={{ display: 'inline-flex', padding: '10px', backgroundColor: '#2563eb', borderRadius: '50%', marginBottom: '1rem' }}>
                        <Bolt color="white" size={32} />
                    </div>
                    <h1>SCADA Login</h1>
                    <p style={{ color: '#64748b' }}>Enter your credentials to access</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Username"
                        placeholder="e.g., admin, cliente1"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    {error && (
                        <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="btn-full">
                        Sign In
                    </Button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <p>Demo Users:</p>
                        <p>Admin: <code>admin</code></p>
                        <p>Clients: <code>cliente1</code>, <code>cliente2</code></p>
                    </div>
                </form>
            </div>
        </div>
    );
};
