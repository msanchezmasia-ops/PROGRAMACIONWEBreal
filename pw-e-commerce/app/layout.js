import "./globals.css";
import Nav from "./components/Nav"; // Ajusta la ruta si es necesario

// Definimos un Footer sencillo aquí o en un archivo aparte
function Footer() {
  return (
    <footer>
      © 2026 <em>La Piazza</em> · Todos los derechos reservados
    </footer>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Al ponerlo aquí, Nav se verá en TODAS las páginas */}
        <Nav />
        
        {/* 'children' representa el contenido de cada página específica */}
        <main>{children}</main>
        
        <Footer />
      </body>
    </html>
  );
}