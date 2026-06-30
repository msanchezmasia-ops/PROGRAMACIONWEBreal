import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';


// Configuramos el cliente con tu Access Token
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

export async function POST(request) {
    try {
        // Mercado Pago nos manda un JSON con los datos del evento
        const body = await request.json();
        
        // Solo nos interesan los eventos de tipo "payment" (pagos)
        if (body.type === 'payment') {
            const paymentId = body.data.id;
            
            // Vamos a preguntarle a Mercado Pago el estado real de este pago por seguridad
            const payment = new Payment(client);
            const infoPago = await payment.get({ id: paymentId });
            
            if (infoPago.status === 'approved') {
                console.log("✅ ¡PAGO APROBADO 100% REAL! ID de pago:", paymentId);
                
                // 💡 ACÁ EN EL FUTURO PODÉS AVISARLE A SUPABASE:
                // await supabase.from('pedidos').update({ estado_pago: 'pagado' }).eq('id_pago', paymentId);
            }
        }
        
        // SIEMPRE hay que devolverle un estado 200 (OK) rápido a Mercado Pago 
        // para que sepa que recibimos el mensaje y no lo vuelva a mandar.
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("❌ Error procesando el webhook:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}