// src/hooks/useAuth.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // Ajustá la ruta según tu proyecto

export function useAuth() {
    const [esRegistro, setEsRegistro] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [cargando, setCargando] = useState(false);
    
    const router = useRouter();

    const limpiarCampos = () => {
        setNombre('');
        setPassword('');
        setConfirmPassword('');
    };

    const cambiarModo = () => {
        setEsRegistro(!esRegistro);
        setError(null);
        setMensaje(null);
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMensaje(null);

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

    // Devolvemos tanto los estados como las funciones que el HTML va a necesitar
    return {
        esRegistro,
        nombre, setNombre,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        error, setError,
        mensaje,
        cargando,
        cambiarModo,
        manejarSubmit
    };
}