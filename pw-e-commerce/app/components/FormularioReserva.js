import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // Ajustá la ruta relativa
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
    const [errorSupabase, setErrorSupabase] = useState(null);

    // Chequear sesión del usuario
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUsuario(session.user);
                setEmail(session.user.email); // ¡Autocompletamos su email!
            }
            setVerificandoAuth(false);
        });
    }, []);

    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    const fechaMinima = hoy.toISOString().split("T")[0];

    const validar = () => {
        const erroresNuevos = {};
        if (!nombre.trim()) erroresNuevos.nombre = 'El nombre es obligatorio.';
        if (!fecha) erroresNuevos.fecha = 'Elegí un día.';
        if (!hora) erroresNuevos.hora = 'Elegí un horario.';
        if (!personas || personas < 1) erroresNuevos.personas = 'Indicá la cantidad de personas.';
        return erroresNuevos;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorSupabase(null);
        
        const erroresNuevos = validar();
        if (Object.keys(erroresNuevos).length > 0) {
            setErrores(erroresNuevos);
            return;
        }
        setErrores({});

        try {
            // GUARDAR EN BASE DE DATOS SUPABASE
            const { error } = await supabase
                .from('reservas') // <-- Cambiá a 'reserva' si tu tabla está en singular
                .insert([
                    { 
                        nombre, 
                        email, 
                        fecha, 
                        hora, 
                        personas: Number(personas)
                    }
                ]);

            if (error) throw error;
            setEnviado(true);
        } catch (err) {
            console.error("Error al guardar reserva:", err);
            setErrorSupabase("Hubo un problema al procesar tu reserva. Intentá nuevamente.");
        }
    };

    if (verificandoAuth) return <p style={{ textAlign: 'center', padding: '4rem', color: 'var(--dorado)' }}>Cargando...</p>;

    // SI NO INICIÓ SESIÓN, LE BLOQUEAMOS EL ACCESO
    if (!usuario) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--marron-oscuro)', borderRadius: '12px', border: '1px dashed var(--dorado)' }}>
                <h3 style={{ color: 'var(--crema)', marginBottom: '1rem' }}>🔒 Acceso exclusivo para clientes registrados</h3>
                <p style={{ color: 'var(--gris)', marginBottom: '2rem' }}>Para poder garantizar tu mesa, necesitamos que ingreses a tu cuenta.</p>
                <Link href="/login" className="btn-carta">
                    Iniciar Sesión / Registrarme
                </Link>
            </div>
        );
    }

    if (enviado) {
        return (
            <div className="reserva-exitosa" style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ color: 'var(--dorado)' }}>¡Reserva confirmada! 🍷</h3>
                <p>Te esperamos el {fecha} a las {hora} hs. Hemos asociado la mesa a tu correo {email}.</p>
            </div>
        );
    }

    return (
        <form className="formulario-reserva" onSubmit={handleSubmit} autoComplete="off">
            {errorSupabase && <p style={{ color: '#ff4d4d', textAlign: 'center' }}>{errorSupabase}</p>}

            <div className="campo-grupo">
                <label className="campo-label" htmlFor="res-nombre">Nombre de quien reserva</label>
                <input
                    id="res-nombre"
                    type="text"
                    autoComplete="name"
                    className={`campo-input${errores.nombre ? ' campo-input--error' : ''}`}
                    placeholder="Ej: María García"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
                {errores.nombre && <span className="campo-error">{errores.nombre}</span>}
            </div>

            <div className="campo-grupo">
                <label className="campo-label">Email de confirmación</label>
                <input
                    type="email"
                    disabled
                    autoComplete="none"
                    className="campo-input"
                    value={email}
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
                <small style={{ color: 'var(--dorado)', fontSize: '0.8rem' }}>✓ Autocompletado desde tu cuenta</small>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="campo-grupo" style={{ flex: 1 }}>
                    <label className="campo-label">Día de reserva</label>
                    <input
                        type="date"
                        className="campo-input"
                        min={fechaMinima}
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                    {errores.fecha && <span className="campo-error">{errores.fecha}</span>}
                </div>

                <div className="campo-grupo" style={{ flex: 1 }}>
                    <label className="campo-label">Horario</label>
                    <select 
                        className="campo-input"
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                    >
                        <option value="">Seleccionar</option>
                        <option value="20:00">20:00 hs</option>
                        <option value="20:30">20:30 hs</option>
                        <option value="21:00">21:00 hs</option>
                        <option value="21:30">21:30 hs</option>
                        <option value="22:00">22:00 hs</option>
                        <option value="22:30">22:30 hs</option>
                        <option value="23:00">23:00 hs</option>
                    </select>
                    {errores.hora && <span className="campo-error">{errores.hora}</span>}
                </div>
            </div>

            <div className="campo-grupo">
                <label className="campo-label" htmlFor="res-personas">Cantidad de personas</label>
                <input
                    id="res-personas"
                    type="number"
                    min="1"
                    className={`campo-input${errores.personas ? ' campo-input--error' : ''}`}
                    placeholder="Ej: 2"
                    value={personas}
                    onChange={(e) => setPersonas(e.target.value)}
                />
                {errores.personas && <span className="campo-error">{errores.personas}</span>}
            </div>

            <button type="submit" className="btn-carta reserva-btn">
                Confirmar reserva
            </button>
        </form>
    );
}