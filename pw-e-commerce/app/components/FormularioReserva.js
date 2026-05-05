
import { useState } from 'react';
import '../globals.css';

export default function FormularioReserva() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    // Separamos fecha y hora:
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [personas, setPersonas] = useState('');

    const [errores, setErrores] = useState({});
    const [enviado, setEnviado] = useState(false);

    // ── Lógica para calcular la fecha de "mañana" ──
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1); // Sumamos 1 día
    const fechaMinima = hoy.toISOString().split("T")[0]; // Formato YYYY-MM-DD

    const validar = () => {
        const erroresNuevos = {};
        if (!nombre.trim()) erroresNuevos.nombre = 'El nombre es obligatorio.';
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) erroresNuevos.email = 'El email no es válido.';
        if (!fecha) erroresNuevos.fecha = 'Elegí un día.';
        if (!hora) erroresNuevos.hora = 'Elegí un horario.';
        if (!personas || personas < 1) erroresNuevos.personas = 'Indicá la cantidad de personas.';
        return erroresNuevos;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const erroresNuevos = validar();
        if (Object.keys(erroresNuevos).length > 0) {
            setErrores(erroresNuevos);
            return;
        }
        setErrores({});
        setEnviado(true); // ¡Éxito!
    };

    if (enviado) {
        return (
            <div className="reserva-exitosa" style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ color: 'var(--dorado)' }}>¡Reserva confirmada! 🍷</h3>
                <p>Te esperamos el {fecha} a las {hora} hs.</p>
            </div>
        );
    }

    return (
        <form className="formulario-reserva" onSubmit={handleSubmit}>
             {/* Campo: Nombre */}
            <div className="campo-grupo">
                <label className="campo-label" htmlFor="res-nombre">Nombre completo</label>
                <input
                    id="res-nombre"
                    type="text"
                    className={`campo-input${errores.nombre ? ' campo-input--error' : ''}`}
                    placeholder="Ej: María García"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
                {errores.nombre && <span className="campo-error">{errores.nombre}</span>}
            </div>

            {/* Campo: Email */}
            <div className="campo-grupo">
                <label className="campo-label" htmlFor="res-email">Email</label>
                <input
                    id="res-email"
                    type="email"
                    className={`campo-input${errores.email ? ' campo-input--error' : ''}`}
                    placeholder="Ej: maria@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errores.email && <span className="campo-error">{errores.email}</span>}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                {/* 1. CAMPO FECHA */}
                <div className="campo-grupo" style={{ flex: 1 }}>
                    <label className="campo-label">Día de reserva</label>
                    <input
                        type="date"
                        className="campo-input"
                        min={fechaMinima} /* Bloquea el pasado y el día de hoy */
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                    {errores.fecha && <span className="campo-error">{errores.fecha}</span>}
                </div>

                {/* 2. CAMPO HORA */}
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

            
            {/* Campo: Cantidad de personas */}
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