"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { crearReserva } from '../../lib/reservasService'; // Importamos la función pura
import '../globals.css';

export default function FormularioReserva() {
    const [usuario, setUsuario] = useState(null);
    const [verificandoAuth, setVerificandoAuth] = useState(true);

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [personas, setPersonas] = useState('');

    const [errores, setErrores] = useState({});
    const [enviado, setEnviado] = useState(false);
    const [errorServidor, setErrorServidor] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUsuario(session.user);
                setEmail(session.user.email); 
            }
            setVerificandoAuth(false);
        });
    }, []);

    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    const fechaMinima = hoy.toISOString().split("T")[0];

    const validar = () => {
        const err = {};
        
        // Regla: Solo letras (con acentos/ñ) y espacios.
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (!nombre.trim()) {
            err.nombre = 'El nombre es obligatorio.';
        } else if (!regexNombre.test(nombre)) {
            err.nombre = 'No se permiten números ni símbolos.';
        }

        if (!fecha) err.fecha = 'Elegí un día.';
        if (!hora) err.hora = 'Elegí un horario.';
        if (!personas || personas < 1) err.personas = 'Falta cantidad.';

        // Guardamos los errores para que la pantalla los muestre
        setErrores(err);
        
        // Si no hay ninguna llave en el objeto de errores, devuelve TRUE (es válido)
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorServidor(null); 

        // Solo si validar() devuelve TRUE, intentamos guardar
        if (validar()) {
            try {
                const nuevaReserva = {
                    nombre,
                    email,
                    fecha,
                    hora,
                    personas: parseInt(personas)
                };
                
                await crearReserva(nuevaReserva);
                setEnviado(true); 

            } catch (error) {
                setErrorServidor(error.message);
            }
        }
    };

    if (verificandoAuth) return <p className="estado-carga">Cargando...</p>;

    if (!usuario) {
        return (
            <div className="auth-requerida">
                <h3>🔒 Acceso para clientes</h3>
                <p>Necesitamos que ingreses a tu cuenta para reservar.</p>
                <Link href="/login" className="btn-carta">Iniciar Sesión</Link>
            </div>
        );
    }

    if (enviado) {
        return (
            <div className="reserva-exitosa">
                <h3>¡Reserva confirmada! 🍷</h3>
                <p>Te esperamos el {fecha} a las {hora} hs.</p>
                <button onClick={() => setEnviado(false)} className="btn-carta reserva-btn">Hacer otra</button>
            </div>
        );
    }

    return (
        <form className="formulario-reserva" onSubmit={handleSubmit} autoComplete="off">
            {errorServidor && <p className="error-servidor">{errorServidor}</p>}

            <div className="campo-grupo">
                <label className="campo-label" htmlFor="res-nombre">Nombre</label>
                <input 
                    id="res-nombre" 
                    type="text" 
                    className={`campo-input${errores.nombre ? ' campo-input--error' : ''}`} 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                />
                {/* Texto del error usando clase CSS */}
                {errores.nombre && <span className="campo-error-texto">{errores.nombre}</span>}
            </div>

            <div className="campo-grupo">
                <label className="campo-label">Email de confirmación</label>
                <input type="email" disabled className="campo-input" value={email}/>
            </div>

            <div className="campo-fila">
                <div className="campo-grupo">
                    <label className="campo-label">Día</label>
                    <input type="date" className="campo-input" min={fechaMinima} value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>
                <div className="campo-grupo">
                    <label className="campo-label">Horario</label>
                    <select className="campo-input" value={hora} onChange={(e) => setHora(e.target.value)}>
                        <option value="">Seleccionar</option>
                        <option value="20:00">20:00 hs</option>
                        <option value="21:00">21:00 hs</option>
                        <option value="22:00">22:00 hs</option>
                    </select>
                </div>
            </div>

            <div className="campo-grupo">
                <label className="campo-label" htmlFor="res-personas">Cantidad de personas</label>
                <input id="res-personas" type="number" min="1" className={`campo-input${errores.personas ? ' campo-input--error' : ''}`} value={personas} onChange={(e) => setPersonas(e.target.value)} />
            </div>

            {/* Mostrar error de validación de la base de datos (Ej: Horario ocupado) */}
            {errorServidor && (
                <div className="reserva-error-servidor">
                    ⚠️ {errorServidor}
                </div>
            )}

            <button type="submit" className="btn-carta reserva-btn">Confirmar reserva</button>
        </form>
    );
}