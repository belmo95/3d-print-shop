import emailjs from '@emailjs/browser';

emailjs.init({
  publicKey: 'irFwQSVBbFgEFU5jf',
});

export const sendOrderEmail = async (
  orderData
) => {
  const templateParams = {
    to_name: 'Admin',

    order_id: String(
      orderData.orderId || ''
    ),

    product_name: String(
      orderData.productName || ''
    ),

    quantity: String(
      orderData.quantity || 1
    ),

    unit_price: String(
      Number(orderData.price || 0).toFixed(2)
    ),

    total: String(
      Number(orderData.total || 0).toFixed(2)
    ),

    delivery_method:
      'Slanje poštom',

    customer_name: String(
      orderData.customerName || ''
    ),

    customer_email: String(
      orderData.userEmail || ''
    ),

    customer_phone: String(
      orderData.customerPhone || ''
    ),

    customer_address: String(
      orderData.address || 'N/A'
    ),

    customer_city: String(
      orderData.city || 'N/A'
    ),

    customer_postal_code: String(
      orderData.postalCode || 'N/A'
    ),

    customer_note: String(
      orderData.note || 'Nema napomene'
    ),
  };

  console.log(
    'Šaljem email sa parametrima:',
    templateParams
  );

  try {
    const response = await emailjs.send(
      'service_aa99lmq',
      'template_4egbgum',
      templateParams
    );

    console.log(
      'Email uspješno poslan:',
      response
    );

    return true;
  } catch (error) {
    console.error(
      'Greška pri slanju emaila:',
      error
    );

    return false;
  }
};