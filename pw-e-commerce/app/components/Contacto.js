
import FormularioReserva from './FormularioReserva';
import '../globals.css';

export default function Contacto({ contacto }) {
    return (
        <>
            <div className="divisor">
                <span></span><em>· Encontranos ·</em><span></span>
            </div>

            <section id="contacto">
                <div className="contacto-inner contacto-inner--tres-col">                    
                    <div className="contacto-texto">
                        
                        

                        <h2>Vení a visitarnos</h2>
                        <p>
                            Estamos en el corazón del barrio, esperándote con el horno encendido
                            y una buena botella de vino.
                        </p>
                        <div className="horarios">
                            <h3>Horarios de atención</h3>
                            {contacto.horarios.map((fila, i) => (
                                <HoraFila key={i} fila={fila} />
                            ))}
                        </div>
                    </div>

                    <FormularioReserva />
                    <div className="contacto-datos">
                        
                        {contacto.imagenLocal && (
                            <div className="foto-local-wrap">
                                <img src={contacto.imagenLocal} alt="Interior de La Piazza" />
                            </div>
                        )}
                        <DatoContacto icono="📍" etiqueta="Dirección" valor={contacto.direccion} />
                        <DatoContacto icono="📞" etiqueta="Teléfono" valor={contacto.telefono} />
                        <DatoContacto icono="💬" etiqueta="WhatsApp" valor={contacto.whatsapp} />
                        <DatoContacto icono="✉️" etiqueta="Email" valor={contacto.email} />
                        <DatoContacto icono="📷" etiqueta="Instagram" valor={contacto.instagram} />
                    </div>

                </div>
            </section>
        </>
    );
}

// Dato de contacto: ícono + etiqueta + valor
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

function HoraFila({ fila }) {
    return (
        <div className="hora-fila">
            <span>{fila.dias}</span>
            <span>{fila.hora}</span>
        </div>
    );
}