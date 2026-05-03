
import PizzaCard from "./PizzaCard";
export default function Hero({ pizzasDestacadas }) {
    return (
        <section id="inicio">
            <p className="hero-label">Pizzería Artesanal · Desde 1994</p>
            <h1 className="hero-title">La <span>Piazza</span></h1>
            <p className="hero-sub">
                Masa madre, ingredientes frescos y el horno de leña que lleva generaciones encendido.
            </p>

            <div className="pizza-grid">
                {pizzasDestacadas && pizzasDestacadas.length > 0 ? (
                pizzasDestacadas.map(pizza => (
                <PizzaCard key={pizza.id} pizza={pizza} />
                ))) 
                : (<p>Cargando pizzas...</p>)
                }
            </div>

            <div className="cta-wrap">
                <a href="#carta" className="btn-carta">Ver carta completa</a>
            </div>
        </section>
    );
}