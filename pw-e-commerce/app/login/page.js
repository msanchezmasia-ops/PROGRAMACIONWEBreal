// src/app/login/page.js
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
    const [esRegistro, setEsRegistro] = useState(false);
    const [nombre, setNombre] = useState(''); // Nuevo campo para el nombre
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Confirmación
    
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [cargando, setCargando] = useState(false);
    
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMensaje(null);

        // VALIDACIÓN: Solo en registro, chequear que coincidan
        if (esRegistro) {
            if (password !== confirmPassword) {
                setError("Las contraseñas no coinciden.");
                return;
            }
            if (!nombre.trim()) {
                setError("Por favor, ingresá tu nombre.");
                return;
            }
        }

        setCargando(true);

        try {
            if (esRegistro) {
                // REGISTRO CON METADATOS (Guardamos el nombre)
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: nombre, // Esto se guarda en la tabla de auth de Supabase
                        }
                    }
                });
                if (signUpError) throw signUpError;
                setMensaje('¡Cuenta creada! Ya podés iniciar sesión con tus datos.');
                setEsRegistro(false);
                limpiarCampos();
            } else {
                // INICIO DE SESIÓN
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                router.push('/contacto'); 
            }
        } catch (err) {
            setError(err.message === "Invalid login credentials" ? "Email o contraseña incorrectos." : err.message);
        } finally {
            setCargando(false);
        }
    };

    const limpiarCampos = () => {
        setNombre('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <section style={{ 
            maxWidth: '450px', 
            margin: '8rem auto 4rem', 
            padding: '2.5rem', 
            background: 'var(--marron-oscuro)', 
            borderRadius: '16px', 
            border: esRegistro ? '2px solid var(--dorado)' : '1px solid #444',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease'
        }}>
            {/* ICONO Y TÍTULO DINÁMICO */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ fontSize: '3rem' }}>{esRegistro ? '👨‍🍳' : '🍷'}</span>
                <h2 style={{ color: 'var(--dorado)', marginTop: '1rem', fontSize: '2rem' }}>
                    {esRegistro ? 'Unite a La Piazza' : '¡Hola de nuevo!'}
                </h2>
                <p style={{ color: 'var(--gris)', fontSize: '0.9rem' }}>
                    {esRegistro ? 'Creá tu cuenta para gestionar tus reservas.' : 'Ingresá tus credenciales para continuar.'}
                </p>
            </div>

            {error && <div style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid #ff4d4d', textAlign: 'center' }}>{error}</div>}
            {mensaje && <div style={{ background: 'rgba(77, 255, 136, 0.1)', color: '#4dff88', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid #4dff88', textAlign: 'center' }}>{mensaje}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {/* CAMPO NOMBRE: Solo aparece en registro */}
                {esRegistro && (
                    <div className="fade-in">
                        <label style={{ display: 'block', color: 'var(--crema)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombre Completo</label>
                        <input 
                            type="text" 
                            required 
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            className="campo-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', color: 'var(--crema)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="campo-input"
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', color: 'var(--crema)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Contraseña</label>
                        <input 
                            type="password" 
                            required 
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******"
                            className="campo-input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* CAMPO CONFIRMAR: Solo aparece en registro */}
                    {esRegistro && (
                        <div style={{ flex: 1 }} className="fade-in">
                            <label style={{ display: 'block', color: 'var(--crema)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Repetir</label>
                            <input 
                                type="password" 
                                required 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="******"
                                className="campo-input"
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    disabled={cargando} 
                    className="btn-carta" 
                    style={{ 
                        marginTop: '1rem', 
                        width: '100%', 
                        padding: '1rem',
                        cursor: cargando ? 'not-allowed' : 'pointer',
                        background: esRegistro ? 'var(--dorado)' : 'transparent',
                        color: esRegistro ? '#000' : 'var(--dorado)',
                        border: '2px solid var(--dorado)',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }}
                >
                    {cargando ? '⌛ Procesando...' : (esRegistro ? 'CREAR MI CUENTA' : 'ENTRAR A MI CUENTA')}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                <p style={{ color: 'var(--gris)', fontSize: '0.9rem' }}>
                    {esRegistro ? '¿Ya sos parte de la familia?' : '¿Aún no tenés cuenta?'}
                </p>
                <button 
                    type="button"
                    onClick={() => { setEsRegistro(!esRegistro); setError(null); setMensaje(null); }}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--dorado)', 
                        textDecoration: 'underline',
                        fontWeight: '500', 
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                    }}
                >
                    {esRegistro ? 'Iniciá sesión aquí' : 'Registrate como nuevo cliente'}
                </button>
            </div>
        </section>
    );
}