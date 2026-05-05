import Link from 'next/link';
import Image from 'next/image'; // <-- Agregamos el import oficial de Next

export default function Nav() {
    return (
        <nav>
            <div className="logo">
                {/* Usamos <Image /> en lugar de <img /> y le pasamos ancho y alto */}
                <Image 
                    src="/img/logocompleto.png" 
                    alt="Logo La Piazza" 
                    width={45} 
                    height={45} 
                    className="nav-img" 
                />
                <span>La Piazza</span>
            </div>
            
            <ul>
                <li><Link href="/">Inicio</Link></li>
                <li><Link href="/carta">Carta</Link></li>
                <li><Link href="/contacto">Reserva</Link></li>
            </ul>
        </nav>
    );
}