// src/app/components/FormularioLogin.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; 
import '../globals.css'; 

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

        // 1. LIMPIEZA DE DATOS (Trim) para evitar errores de espacios en blanco
        const emailLimpio = email.trim();
        const passwordLimpia = password.trim();
        const confirmPasswordLimpia = confirmPassword.trim();
        const nombreLimpio = nombre.trim();

        // 2. VALIDACIÓN DE FORMATO DE EMAIL 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailLimpio)) {
            setError("Por favor, ingresá un formato de email válido (ej: tu@email.com).");
            return;
        }

        // 3. VALIDACIONES ESPECÍFICAS DE REGISTRO
        if (esRegistro) {
            if (!nombreLimpio) {
                setError("Por favor, ingresá tu nombre.");
                return;
            }
            if (passwordLimpia !== confirmPasswordLimpia) {
                setError("Las contraseñas no coinciden.");
                return;
            }
            if (passwordLimpia.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres.");
                return;
            }
        }

        setCargando(true);

        try {
            if (esRegistro) {
                // LÓGICA DE REGISTRO
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: emailLimpio,
                    password: passwordLimpia,
                    options: { data: { full_name: nombreLimpio } }
                });

                if (signUpError) {
                    throw signUpError;
                }
                
                // Si devuelve data pero identities está vacío, el mail ya existía
                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    throw new Error("Ya existe una cuenta con este email. Por favor, iniciá sesión.");
                }
                
                setMensaje('¡Cuenta creada! Te enviamos un enlace de confirmación a tu correo. Por favor, revisalo para poder iniciar sesión.');
                setEsRegistro(false);
                limpiarCampos();

            } else {
                // LÓGICA DE INICIO DE SESIÓN
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: emailLimpio,
                    password: passwordLimpia,
                });

                if (signInError) {
                    // Chequeo de límite de intentos (Seguridad)
                    if (signInError.message.includes("rate limit") || signInError.status === 429) {
                        throw new Error("Demasiados intentos. Por favor, esperá un minuto y volvé a intentar.");
                    }
                    
                    // Chequeo estándar de credenciales inválidas
                    if (signInError.message.includes("Invalid login credentials")) {
                        throw new Error("Email o contraseña incorrectos.");
                    }
                    throw signInError;
                }
                
                // Redirección al ingresar con éxito
                router.push('/contacto'); 
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const limpiarCampos = () => {
        setNombre('');
        setPassword('');
        setConfirmPassword('');
    };

    // --- RENDERIZADO DEL HTML  ---
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

            {/* Los carteles ahora renderizan aquí con animaciones CSS fluidas */}
            {error && <div className="alerta-error fade-in">{error}</div>}
            {mensaje && <div className="alerta-exito fade-in">{mensaje}</div>}

            <form onSubmit={handleSubmit}>
                
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

                <div>
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