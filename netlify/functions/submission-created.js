// Se ejecuta SOLA cada vez que alguien llena un formulario de Netlify.
// Cuando es el formulario "suscriptores" (el modal del 10% OFF), manda el correo a MailerLite
// y lo mete al grupo "Suscriptores Vita Nova", lo que dispara el correo de bienvenida.
//
// Requiere la variable de entorno MAILERLITE_API_KEY en Netlify.

const GRUPO_SUSCRIPTORES = '202892651786143464';

exports.handler = async (event) => {
  try {
    const { payload } = JSON.parse(event.body || '{}');
    if (!payload || payload.form_name !== 'suscriptores') {
      return { statusCode: 200, body: 'Formulario ignorado' };
    }

    const d = payload.data || {};
    if (!d.email) return { statusCode: 200, body: 'Sin correo' };

    const key = process.env.MAILERLITE_API_KEY;
    if (!key) {
      console.error('Falta la variable MAILERLITE_API_KEY en Netlify');
      return { statusCode: 500, body: 'Falta MAILERLITE_API_KEY' };
    }

    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        email: d.email,
        fields: { name: d.nombre || '', last_name: d.apellido || '' },
        groups: [GRUPO_SUSCRIPTORES]
      })
    });

    if (!res.ok) {
      console.error('MailerLite respondió', res.status, await res.text());
      return { statusCode: 502, body: 'Error en MailerLite' };
    }
    return { statusCode: 200, body: 'Suscriptor agregado' };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: 'Error' };
  }
};
