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
        if (!nombre.trim()) err.nombre = 'Obligatorio.';
        if (!fecha) err.fecha = 'Elegí un día.';
        if (!hora) err.hora = 'Elegí un horario.';
        if (!personas || personas < 1) err.personas = 'Falta cantidad.';
        return err;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorServidor(null);
        
        const err = validar();
        if (Object.keys(err).length > 0) {
            setErrores(err);
            return;
        }
        setErrores({});

        try {
            // Usamos la función separada
            await crearReserva({ nombre, email, fecha, hora, personas: Number(personas) });
            setEnviado(true);
        } catch (error) {
            setErrorServidor("Hubo un problema al procesar tu reserva.");
        }
    };

    if (verificandoAuth) return <p style={{ textAlign: 'center', padding: '4rem', color: 'var(--dorado)' }}>Cargando...</p>;

    if (!usuario) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--marron-oscuro)', borderRadius: '12px', border: '1px dashed var(--dorado)' }}>
                <h3 style={{ color: 'var(--crema)', marginBottom: '1rem' }}>🔒 Acceso para clientes</h3>
                <p style={{ color: 'var(--gris)', marginBottom: '2rem' }}>Necesitamos que ingreses a tu cuenta para reservar.</p>
                <Link href="/login" className="btn-carta">Iniciar Sesión</Link>
            </div>
        );
    }

    if (enviado) {
        return (
            <div className="reserva-exitosa" style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ color: 'var(--dorado)' }}>¡Reserva confirmada! 🍷</h3>
                <p>Te esperamos el {fecha} a las {hora} hs.</p>
                <button onClick={() => setEnviado(false)} className="btn-carta" style={{marginTop: '1.5rem'}}>Hacer otra</button>
            </div>
        );
    }

    return (
        <form className="formulario-reserva" onSubmit={handleSubmit} autoComplete="off">
            {errorServidor && <p style={{ color: '#ff4d4d', textAlign: 'center' }}>{errorServidor}</p>}

            <div className="campo-grupo">
                <label className="campo-label" htmlFor="res-nombre">Nombre</label>
                <input id="res-nombre" type="text" className={`campo-input${errores.nombre ? ' campo-input--error' : ''}`} value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="campo-grupo">
                <label className="campo-label">Email de confirmación</label>
                <input type="email" disabled className="campo-input" value={email} style={{ opacity: 0.7 }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="campo-grupo" style={{ flex: 1 }}>
                    <label className="campo-label">Día</label>
                    <input type="date" className="campo-input" min={fechaMinima} value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>
                <div className="campo-grupo" style={{ flex: 1 }}>
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

            <button type="submit" className="btn-carta reserva-btn">Confirmar reserva</button>
        </form>
    );
}