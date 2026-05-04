import Link from 'next/link';

export default function Nav() {
    return (
        <nav>
            <div className="logo">La Piazza</div>
            <ul>
                {/* href="/" nos lleva a la landing page principal */}
                <li><Link href="/">Inicio</Link></li>
                
                {/* href="/carta" busca la carpeta app/carta/page.js */}
                <li><Link href="/carta">Carta</Link></li>
                
                {/* href="/contacto" busca la carpeta app/contacto/page.js */}
                <li><Link href="/contacto">Reserva</Link></li>
            </ul>
        </nav>
    );
}