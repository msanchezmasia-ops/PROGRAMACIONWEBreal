export default function PizzaCard({ pizza }) {
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