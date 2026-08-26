import emailjs from '@emailjs/browser';

emailjs.init({
  publicKey: "irFwQSVBbFgEFU5jf",
});

export const sendOrderEmail = async (orderData) => {
  const templateParams = {
    to_name: 'Admin',
    order_id: orderData.orderId,
    product_name: orderData.product.name,
    quantity: orderData.quantity.toString(),
    unit_price: orderData.unitPrice.toString(),
    total: orderData.total.toString(),
    delivery_method: orderData.deliveryMethod === 'pickup' ? 'Lično preuzimanje' : 'Slanje poštom',
    customer_name: orderData.customer.name,
    customer_email: orderData.customer.email,
    customer_phone: orderData.customer.phone,
    customer_address: orderData.customer.address || 'N/A',
    customer_city: orderData.customer.city || 'N/A',
    customer_postal_code: orderData.customer.postalCode || 'N/A',
  };

  console.log('Sending email with params:', templateParams);

  try {
    const response = await emailjs.send(
      'service_aa99lmq',
      'template_4egbgum',
      templateParams
    );
    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};