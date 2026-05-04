import { useState } from 'react';
import '../globals.css';

export default function FormularioReserva() {

    // ── Estados para cada campo controlado ──
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [fechaHora, setFechaHora] = useState('');
    const [personas, setPersonas] = useState('');

    // ── Estado de errores por campo ──
    // Cada clave contiene el mensaje de error, o '' si no hay error
    const [errores, setErrores] = useState({
        nombre: '',
        email: '',
        fechaHora: '',
        personas: '',
    });

    // ── Estado de envío exitoso ──
    // Cuando es true se oculta el formulario y aparece el mensaje de confirmación
    const [enviado, setEnviado] = useState(false);


    // ── Función de validación ──
    // Recibe todos los campos y devuelve un objeto con los mensajes de error
    const validar = (campos) => {
        const erroresNuevos = { nombre: '', email: '', fechaHora: '', personas: '' };

        // Ningún campo puede estar vacío
        if (!campos.nombre.trim()) {
            erroresNuevos.nombre = 'El nombre es obligatorio.';
        }

        if (!campos.email.trim()) {
            erroresNuevos.email = 'El email es obligatorio.';
        } else if (!campos.email.includes('@') || !campos.email.includes('.')) {
            // El email debe tener '@' y al menos un punto
            erroresNuevos.email = 'Ingresá un email válido (debe contener @ y un punto).';
        }

        if (!campos.fechaHora) {
            erroresNuevos.fechaHora = 'La fecha y hora son obligatorias.';
        } else {
            // La fecha seleccionada no puede ser anterior al momento actual
            const fechaIngresada = new Date(campos.fechaHora);
            const ahora = new Date();
            if (fechaIngresada <= ahora) {
                erroresNuevos.fechaHora = 'La fecha debe ser posterior a hoy.';
            }
        }

        if (!campos.personas) {
            erroresNuevos.personas = 'La cantidad de personas es obligatoria.';
        } else if (Number(campos.personas) <= 0) {
            // La cantidad debe ser mayor a 0
            erroresNuevos.personas = 'La cantidad de personas debe ser mayor a 0.';
        }

        return erroresNuevos;
    };


    // ── Manejador del evento submit ──
    const handleSubmit = (e) => {
        // Evita que el navegador recargue la página al enviar el formulario
        e.preventDefault();

        const erroresEncontrados = validar({ nombre, email, fechaHora, personas });
        setErrores(erroresEncontrados);

        // Si ningún campo tiene mensaje de error, el formulario es válido
        const hayErrores = Object.values(erroresEncontrados).some(msg => msg !== '');
        if (!hayErrores) {
            setEnviado(true);
        }
    };


    // ── Pantalla de éxito ──
    // Reemplaza al formulario cuando enviado === true
    if (enviado) {
        return (
            <div className="reserva-exito">
                <span className="reserva-exito-icono">🍕</span>
                <h3>¡Reserva confirmada!</h3>
                <p>
                    Gracias, <strong>{nombre}</strong>. Te esperamos el{' '}
                    <strong>
                        {new Date(fechaHora).toLocaleString('es-AR', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                        })}
                    </strong>{' '}
                    con tu mesa para{' '}
                    <strong>{personas} {Number(personas) === 1 ? 'persona' : 'personas'}</strong>.
                </p>
                <p className="reserva-exito-sub">
                    Te enviaremos la confirmación a <em>{email}</em>.
                </p>
            </div>
        );
    }

    // ── Formulario ──
    return (
        <form className="reserva-form" onSubmit={handleSubmit} noValidate>

            <h3 className="reserva-titulo">Reservá tu mesa</h3>

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

            {/* Campo: Fecha y hora — solo permite fechas futuras */}
            <div className="campo-grupo">
                <label className="campo-label" htmlFor="res-fecha">Fecha y hora</label>
                <input
                    id="res-fecha"
                    type="datetime-local"
                    className={`campo-input${errores.fechaHora ? ' campo-input--error' : ''}`}
                    value={fechaHora}
                    onChange={(e) => setFechaHora(e.target.value)}
                />
                {errores.fechaHora && <span className="campo-error">{errores.fechaHora}</span>}
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

