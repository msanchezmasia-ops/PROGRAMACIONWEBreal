// Importamos React y los hooks que necesitamos
import { useState, useEffect } from 'react';

// Importamos los estilos
import './style.css';


// ══════════════════════════════════════════════
//  COMPONENTES — los "moldes" reutilizables
// ══════════════════════════════════════════════

// Molde: tarjeta de pizza destacada en el hero
function PizzaCard({ pizza }) {
  return (
    <div className="pizza-card">
      <img src={pizza.imagen} alt={pizza.alt} />
      <div className="card-tag">{pizza.nombre}</div>
      <div className="card-info">
        <h3>{pizza.nombre}</h3>
        <p>{pizza.descripcion}</p>
        <span className="precio">{pizza.precio}</span>
      </div>
    </div>
  );
}

// Molde: fila de ítem en la carta (pizzas / aperitivos / postres)
function MenuItem({ item }) {
  return (
    <div className="menu-item">
      <div className="menu-item-info">
        <h4>{item.nombre}</h4>
        <p>{item.descripcion}</p>
      </div>
      <span className="menu-item-precio">{item.precio}</span>
    </div>
  );
}

// Molde: fila de horario en contacto
function HoraFila({ fila }) {
  return (
    <div className="hora-fila">
      <span>{fila.dias}</span>
      <span>{fila.hora}</span>
    </div>
  );
}

// Molde: dato de contacto (ícono + etiqueta + valor)
function DatoContacto({ icono, etiqueta, valor }) {
  return (
    <div className="dato">
      <div className="dato-icono">{icono}</div>
      <div className="dato-texto">
        <strong>{etiqueta}</strong>
        <span>{valor}</span>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════
//  FORMULARIO DE RESERVA
// ══════════════════════════════════════════════

function FormularioReserva() {

  // ── Estados para los campos del formulario ──
  // Cada campo tiene su propio estado controlado con useState
  const [nombre,    setNombre]    = useState('');
  const [email,     setEmail]     = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [personas,  setPersonas]  = useState('');

  // ── Estado para los errores de validación ──
  // Es un objeto: cada clave es el campo, el valor es el mensaje de error (o '')
  const [errores, setErrores] = useState({
    nombre:    '',
    email:     '',
    fechaHora: '',
    personas:  '',
  });

  // ── Estado para saber si el envío fue exitoso ──
  // Cuando es true, ocultamos el formulario y mostramos el mensaje de éxito
  const [enviado, setEnviado] = useState(false);


  // ── Función de validación ──
  // Recibe los valores actuales y devuelve un objeto con los errores encontrados
  const validar = (campos) => {
    const nuevosErrores = {
      nombre:    '',
      email:     '',
      fechaHora: '',
      personas:  '',
    };

    // Validación 1: ningún campo puede estar vacío
    if (!campos.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    }

    if (!campos.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio.';
    } else if (!campos.email.includes('@') || !campos.email.includes('.')) {
      // Validación 2: el email debe tener '@' y un punto
      nuevosErrores.email = 'Ingresá un email válido (debe contener @ y un punto).';
    }

    if (!campos.fechaHora) {
      nuevosErrores.fechaHora = 'La fecha y hora son obligatorias.';
    }

    if (!campos.personas) {
      nuevosErrores.personas = 'La cantidad de personas es obligatoria.';
    } else if (Number(campos.personas) <= 0) {
      // Validación 3: la cantidad debe ser mayor a 0
      nuevosErrores.personas = 'La cantidad de personas debe ser mayor a 0.';
    }

    return nuevosErrores;
  };


  // ── Función de envío del formulario ──
  const handleSubmit = (e) => {
    // e.preventDefault() evita que la página se recargue al enviar el formulario
    e.preventDefault();

    // Ejecutamos las validaciones con los valores actuales de los campos
    const erroresEncontrados = validar({ nombre, email, fechaHora, personas });

    // Guardamos los errores en el estado (esto actualiza los mensajes en pantalla)
    setErrores(erroresEncontrados);

    // Verificamos si hay algún error: si todos los valores son string vacío, no hay errores
    const hayErrores = Object.values(erroresEncontrados).some(msg => msg !== '');

    if (!hayErrores) {
      // Si no hay errores, marcamos el formulario como enviado exitosamente
      setEnviado(true);
    }
  };


  // ── Mensaje de éxito (reemplaza al formulario cuando enviado === true) ──
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


  // ── Renderizado del formulario ──
  return (
    <form className="reserva-form" onSubmit={handleSubmit} noValidate>

      <h3 className="reserva-titulo">Reservá tu mesa</h3>

      {/* ── Campo: Nombre ── */}
      <div className="campo-grupo">
        <label className="campo-label" htmlFor="nombre">Nombre completo</label>
        <input
          id="nombre"
          type="text"
          className={`campo-input ${errores.nombre ? 'campo-input--error' : ''}`}
          placeholder="Ej: María García"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        {/* Muestra el mensaje de error solo si existe */}
        {errores.nombre && <span className="campo-error">{errores.nombre}</span>}
      </div>

      {/* ── Campo: Email ── */}
      <div className="campo-grupo">
        <label className="campo-label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className={`campo-input ${errores.email ? 'campo-input--error' : ''}`}
          placeholder="Ej: maria@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errores.email && <span className="campo-error">{errores.email}</span>}
      </div>

      {/* ── Campo: Fecha y Hora ── */}
      <div className="campo-grupo">
        <label className="campo-label" htmlFor="fechaHora">Fecha y hora</label>
        <input
          id="fechaHora"
          type="datetime-local"
          className={`campo-input ${errores.fechaHora ? 'campo-input--error' : ''}`}
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
        />
        {errores.fechaHora && <span className="campo-error">{errores.fechaHora}</span>}
      </div>

      {/* ── Campo: Cantidad de personas ── */}
      <div className="campo-grupo">
        <label className="campo-label" htmlFor="personas">Cantidad de personas</label>
        <input
          id="personas"
          type="number"
          min="1"
          className={`campo-input ${errores.personas ? 'campo-input--error' : ''}`}
          placeholder="Ej: 2"
          value={personas}
          onChange={(e) => setPersonas(e.target.value)}
        />
        {errores.personas && <span className="campo-error">{errores.personas}</span>}
      </div>

      {/* ── Botón de envío ── */}
      <button type="submit" className="btn-carta reserva-btn">
        Confirmar reserva
      </button>

    </form>
  );
}


// ══════════════════════════════════════════════
//  SECCIONES
// ══════════════════════════════════════════════

function Nav() {
  return (
    <nav>
      <div className="logo">La Piazza</div>
      <ul>
        <li><a href="#inicio">Inicio</a></li>
        <li><a href="#carta">Carta</a></li>
        <li><a href="#contacto">Contacto</a></li>
      </ul>
    </nav>
  );
}

// Hero recibe pizzasDestacadas como prop desde App
function Hero({ pizzasDestacadas }) {
  return (
    <section id="inicio">
      <p className="hero-label">Pizzería Artesanal · Desde 1994</p>
      <h1 className="hero-title">La <span>Piazza</span></h1>
      <p className="hero-sub">Masa madre, ingredientes frescos y el horno de leña que lleva generaciones encendido.</p>

      <div className="pizza-grid">
        {pizzasDestacadas.map(pizza => (
          <PizzaCard key={pizza.id} pizza={pizza} />
        ))}
      </div>

      <div className="cta-wrap">
        <a href="#carta" className="btn-carta">Ver carta completa</a>
      </div>
    </section>
  );
}

// Carta recibe carta como prop desde App
function Carta({ carta }) {
  const [tabActiva, setTabActiva] = useState("pizzas");

  const tabs = [
    { key: "pizzas",     label: "Pizzas"     },
    { key: "aperitivos", label: "Aperitivos" },
    { key: "postres",    label: "Postres"    },
  ];

  return (
    <>
      <div className="divisor"><span></span><em>· Nuestra Carta ·</em><span></span></div>

      <section id="carta">
        <h2 className="seccion-titulo">Lo que sale del horno</h2>
        <p className="seccion-sub">Pizzas · Aperitivos · Postres</p>

        {/*
          Tabs accesibles:
          - role="tablist"  → indica que este div agrupa pestañas navegables
          - role="tab"      → cada botón es una pestaña individual
          - aria-selected   → true/false según si la pestaña está activa;
                              los lectores de pantalla anuncian el estado
        */}
        <div className="tabs" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={tabActiva === tab.key}
              className={`tab-btn ${tabActiva === tab.key ? "activo" : ""}`}
              onClick={() => setTabActiva(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {carta[tabActiva].map(item => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}

// Contacto recibe contacto como prop desde App
// Ahora incluye el FormularioReserva como columna central
function Contacto({ contacto }) {
  return (
    <>
      <div className="divisor"><span></span><em>· Encontranos ·</em><span></span></div>

      <section id="contacto">
        <div className="contacto-inner contacto-inner--tres-col">

          {/* Columna 1: horarios */}
          <div className="contacto-texto">
            <h2>Vení a visitarnos</h2>
            <p>Estamos en el corazón del barrio, esperándote con el horno encendido y una buena botella de vino.</p>

            <div className="horarios">
              <h3>Horarios de atención</h3>
              {contacto.horarios.map((fila, i) => (
                <HoraFila key={i} fila={fila} />
              ))}
            </div>
          </div>

          {/* Columna 2: formulario de reserva */}
          <FormularioReserva />

          {/* Columna 3: datos de contacto */}
          <div className="contacto-datos">
            <DatoContacto icono="📍" etiqueta="Dirección"  valor={contacto.direccion}  />
            <DatoContacto icono="📞" etiqueta="Teléfono"   valor={contacto.telefono}   />
            <DatoContacto icono="💬" etiqueta="WhatsApp"   valor={contacto.whatsapp}   />
            <DatoContacto icono="✉️" etiqueta="Email"      valor={contacto.email}      />
            <DatoContacto icono="📷" etiqueta="Instagram"  valor={contacto.instagram}  />
          </div>

        </div>
      </section>
    </>
  );
}

function Footer() {
  return (
    <footer>
      © 2026 <em>La Piazza</em> · Todos los derechos reservados ·
    </footer>
  );
}


// ══════════════════════════════════════════════
//  APP RAÍZ
//  Maneja la carga asíncrona del archivo data.json
//  y distribuye los datos a cada sección como props
// ══════════════════════════════════════════════

export default function App() {
  const [datos,    setDatos]    = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const respuesta = await fetch('/data.json');

        if (!respuesta.ok) {
          throw new Error(`Error al cargar los datos: ${respuesta.status} ${respuesta.statusText}`);
        }

        const json = await respuesta.json();
        setDatos(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // ── Pantalla de carga ──
  if (cargando) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        gap: '1rem',
        background: 'transparent',
        color: 'var(--dorado)',
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.5rem', fontStyle: 'italic',
      }}>
        <span style={{ fontSize: '3rem' }}>🍕</span>
        Calentando los hornos...
      </div>
    );
  }

  // ── Pantalla de error ──
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        gap: '1rem',
        background: 'var(--oscuro)',
        color: 'var(--rojo)',
        fontFamily: "'Barlow', sans-serif",
        textAlign: 'center', padding: '2rem',
      }}>
        <span style={{ fontSize: '3rem' }}>⚠️</span>
        <strong style={{ fontSize: '1.2rem' }}>Algo salió mal</strong>
        <p style={{ color: 'var(--gris)', fontSize: '.9rem' }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Nav />
      {/*
        <main> envuelve todo el contenido central de la página.
        Esto le indica a los lectores de pantalla cuál es la región
        principal del documento, mejorando la navegación por landmarks.
      */}
      <main>
        <Hero     pizzasDestacadas={datos.pizzasDestacadas} />
        <Carta    carta={datos.carta} />
        <Contacto contacto={datos.contacto} />
      </main>
      <Footer />
    </>
  );
}
