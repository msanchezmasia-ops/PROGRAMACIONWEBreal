// src/app/components/FormularioLogin.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // Ajustá la ruta hacia tu cliente de Supabase
import '../globals.css'; // Ajustá la ruta hacia tus estilos globales

export default function FormularioLogin() {
    // --- ESTADOS DEL FORMULARIO ---
    const [esRegistro, setEsRegistro] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // --- ESTADOS DE CONTROL ---
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [cargando, setCargando] = useState(false);
    
    const router = useRouter();

    // --- FUNCIONES LÓGICAS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMensaje(null);

        // Validaciones previas en modo registro
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
                // Lógica de Registro en Supabase
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: nombre } }
                });
                if (signUpError) throw signUpError;
                
                setMensaje('¡Cuenta creada! Ya podés iniciar sesión con tus datos.');
                setEsRegistro(false);
                limpiarCampos();
            } else {
                // Lógica de Inicio de Sesión en Supabase
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                
                // Redirección al ingresar con éxito
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

    // --- RENDERIZADO DEL HTML (JSX) ---
    return (
        <section className={`login-container ${esRegistro ? 'modo-registro' : 'modo-login'}`}>
            
            <div className="login-header">
                <span className="login-icono">{esRegistro ? '👨‍🍳' : '🍷'}</span>
                <h2 className="login-titulo">
                    {esRegistro ? 'Unite a La Piazza' : '¡Hola de nuevo!'}
                </h2>
                <p className="login-subtitulo">
                    {esRegistro ? 'Creá tu cuenta para gestionar tus reservas.' : 'Ingresá tus credenciales para continuar.'}
                </p>
            </div>

            {error && <div className="alerta-error">{error}</div>}
            {mensaje && <div className="alerta-exito">{mensaje}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {esRegistro && (
                    <div className="fade-in login-input-group">
                        <label className="login-label">Nombre Completo</label>
                        <input 
                            type="text" 
                            required 
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            className="campo-input w-full"
                        />
                    </div>
                )}

                <div className="login-input-group">
                    <label className="login-label">Email</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="campo-input w-full"
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="login-input-group">
                        <label className="login-label">Contraseña</label>
                        <input 
                            type="password" 
                            required 
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******"
                            className="campo-input w-full"
                        />
                    </div>

                    {esRegistro && (
                        <div className="fade-in login-input-group">
                            <label className="login-label">Repetir</label>
                            <input 
                                type="password" 
                                required 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="******"
                                className="campo-input w-full"
                            />
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    disabled={cargando} 
                    className={`btn-login-submit ${esRegistro ? 'btn-primario' : 'btn-secundario'}`}
                >
                    {cargando ? '⌛ Procesando...' : (esRegistro ? 'CREAR MI CUENTA' : 'ENTRAR A MI CUENTA')}
                </button>
            </form>

            <div className="login-footer">
                <p className="login-subtitulo">
                    {esRegistro ? '¿Ya sos parte de la familia?' : '¿Aún no tenés cuenta?'}
                </p>
                <button 
                    type="button"
                    onClick={() => { setEsRegistro(!esRegistro); setError(null); setMensaje(null); }}
                    className="btn-texto"
                >
                    {esRegistro ? 'Iniciá sesión aquí' : 'Registrate como nuevo cliente'}
                </button>
            </div>
        </section>
    );
}