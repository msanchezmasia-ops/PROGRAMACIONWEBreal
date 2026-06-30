import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// Cliente con SERVICE ROLE: este endpoint corre en tu servidor, no en el navegador
// del usuario, así que puede saltarse RLS de forma controlada para hacer este único update.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ nunca expongas esta key en el frontend
);

export async function POST(request) {
    try {
        const body = await request.json();

        // Mercado Pago manda distintos tipos de eventos; solo nos interesan los de pago
        if (body.type !== 'payment') {
            return NextResponse.json({ received: true });
        }

        const paymentId = body.data.id;

        // Volvemos a consultar el pago directo a la API de MP (nunca confíes
        // en el contenido del webhook por sí solo, podría ser falsificado)
        const payment = new Payment(client);
        const pagoInfo = await payment.get({ id: paymentId });

        if (pagoInfo.status === 'approved') {
            const pedidoId = pagoInfo.external_reference;

            const { error } = await supabaseAdmin
                .from('pedidos')
                .update({ pagado: true })
                .eq('id', pedidoId);

            if (error) console.error("Error marcando pedido como pagado:", error);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Error en webhook de Mercado Pago:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}