
import { useState, useEffect } from 'react';
import './style.css';
import Nav from './components/Nav';
import PizzaCard from './components/PizzaCard';
import FormularioReserva from './components/FormularioReserva';
import Hero from './components/Hero';
import Contacto from './components/Contacto';
import Carta from './components/Carta';

// Pie de página
function Footer() {
  return (
    <footer>
      © 2026 <em>La Piazza</em> · Todos los derechos reservados
    </footer>
  );
}


// ══════════════════════════════════════════════
//  APP RAÍZ
//  Responsabilidad: cargar data.json de forma
//  asíncrona y distribuir los datos como props.
//
//  Estados:
//    datos    → objeto con pizzasDestacadas, carta y contacto
//    cargando → true mientras el fetch no terminó
//    error    → mensaje de error si el fetch falló
// ══════════════════════════════════════════════
export default function App() {
  const [datos,    setDatos]    = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  // useEffect con [] → se ejecuta una sola vez al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // fetch trae el archivo estático desde la carpeta public
        const respuesta = await fetch('/data.json');

        // Si la respuesta HTTP no es 2xx, lanzamos un error explícito
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }

        // await convierte la respuesta a objeto JS
        const json = await respuesta.json();
        setDatos(json);

      } catch (err) {
        setError(err.message);
      } finally {
        // Siempre desactivamos la pantalla de carga, haya error o no
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);


  // ── Pantalla de carga ──
  // Usa clase CSS, no estilos inline: la presentación queda en style.css
  if (cargando) {
    return (
      <div className="estado-carga">
        <span>🍕</span>
        Calentando los hornos...
      </div>
    );
  }

  // ── Pantalla de error ──
  if (error) {
    return (
      <div className="estado-error">
        <span>⚠️</span>
        <strong>Algo salió mal</strong>
        <p>{error}</p>
      </div>
    );
  }

  // ── Render principal ──
  return (
    <>
      {/*
        <nav> queda fuera de <main> porque es un landmark de navegación global.
        <main> agrupa el contenido central: hero, carta y contacto.
        <footer> queda fuera de <main> porque es un landmark de pie de página.
      */}
      <Nav />
      <main>
        <Hero     pizzasDestacadas={datos.pizzasDestacadas} />
        <Carta    carta={datos.carta} />
        <Contacto contacto={datos.contacto} />
      </main>
      <Footer />
    </>
  );
}
