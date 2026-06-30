import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

export async function POST(request) {
    try {
        const body = await request.json();
        //  Agregamos pedidoId por seguridad
        const { items, pedidoId } = body; 

        const itemsParaMP = items.map(item => ({
            id: item.id.toString(),
            title: `${item.cantidad}x ${item.nombre} (${item.tamaño})`,
            quantity: 1, 
            unit_price: Number(item.precio) * Number(item.cantidad),
            currency_id: 'ARS',
        }));

        const preference = new Preference(client);
        const response = await preference.create({
            body: {
                items: itemsParaMP,
                external_reference: pedidoId ? pedidoId.toString() : '0',
                back_urls: {
                    
                    success: 'https://lapiazza.vercel.app/carta?pago=exito',
                    failure: 'https://lapiazza.vercel.app/carta?pago=fallo',
                    pending: 'https://lapiazza.vercel.app/carta?pago=pendiente',
                },
                auto_return: 'approved', 
            }
        });

        return NextResponse.json({ 
            id: response.id, 
            init_point: response.init_point 
        });

    } catch (error) {
        console.error("Error al crear preferencia:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}