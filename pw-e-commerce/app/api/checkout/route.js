import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuramos el cliente con tu Access Token oculto
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

export async function POST(request) {
    try {
        // Recibimos el carrito desde Carta.js
        const body = await request.json();
        const { items } = body;

        // Mapeamos los items al formato exacto que exige Mercado Pago
        const itemsParaMP = items.map(item => ({
            id: item.id.toString(),
            title: `${item.cantidad}x ${item.nombre} (${item.tamaño})`,
            quantity: 1, // Agrupamos todo en 1 bloque por producto para simplificar
            unit_price: Number(item.precio) * Number(item.cantidad),
            currency_id: 'ARS',
        }));

        
        // Creamos la "Preferencia" de pago
        const preference = new Preference(client);
        const response = await preference.create({
            body: {
                items: itemsParaMP,
                external_reference: pedidoId,
                back_urls: {
                    success: 'https://www.tudominio.com/carta?pago=exito',
                    failure: 'https://www.tudominio.com/carta?pago=fallo',
                    pending: 'https://www.tudominio.com/carta?pago=pendiente',
                },
                auto_return: 'approved', // Vuelve automáticamente si se aprueba
            }
        });

        // Le devolvemos al frontend el ID de preferencia y el link de pago
        return NextResponse.json({ 
            id: response.id, 
            init_point: response.init_point 
        });

    } catch (error) {
        console.error("Error al crear preferencia:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}