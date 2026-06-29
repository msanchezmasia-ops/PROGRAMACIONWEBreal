export default function PizzaCard({ pizza }) {
    // Transformamos el número de Supabase (ej: 31800) a formato moneda argentina ($ 31.800)
    const precioFormateado = typeof pizza.precio === 'number'
        ? new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(pizza.precio)
        : pizza.precio; // Si viene como texto del viejo JSON, lo deja igual

    return (
        <div className="pizza-card">
            {/* Usamos pizza.nombre como alt porque en Supabase no existe la columna 'alt' */}
            <img src={pizza.imagen} alt={pizza.nombre} />
            <div className="card-tag">{pizza.nombre}</div>
            <div className="card-info">
                <h3>{pizza.nombre}</h3>
                <p>{pizza.descripcion}</p>
                <span className="precio">{precioFormateado}</span>
            </div>
        </div>
    );
}