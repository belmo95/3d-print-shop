import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/Checkout.css';
import { sendOrderEmail } from '../emailjs';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryMethod: 'pickup',
    quantity: 1
  });
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const total = (formData.deliveryMethod === 'shipping' ? product.price + 5 : product.price) * formData.quantity;
  
  const orderData = {
    product: {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    },
    customer: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode
    },
    quantity: formData.quantity,
    unitPrice: product.price,
    deliveryMethod: formData.deliveryMethod,
    deliveryCost: formData.deliveryMethod === 'shipping' ? 5 : 0,
    total: total,
    paymentMethod: 'pouzece',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, orderData);
    setOrderId(docRef.id);
    setOrderCreated(true);
    
    // Pošalji email administratoru
    await sendOrderEmail({
      orderId: docRef.id,
      ...orderData
    });
    
    console.log('Order created:', orderData);
  } catch (error) {
    console.error('Error creating order:', error);
    alert('Greška prilikom kreiranja narudžbe.');
  }
};

  if (!product) {
    return (
      <div className="not-found">
        <h1 className="not-found-title">Proizvod nije odabran</h1>
        <a href="/" className="not-found-link">
          Pogledaj proizvode
        </a>
      </div>
    );
  }

  const deliveryCost = formData.deliveryMethod === 'shipping' ? 5 : 0;
  const total = (product.price * formData.quantity) + deliveryCost;

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Završi narudžbu</h1>
      
      <div className="checkout-product-summary">
        <h2 className="checkout-product-summary-title">📦 Proizvod</h2>
        <div className="checkout-product-info">
          <img src={product.image} alt={product.name} className="checkout-product-image" />
          <div className="checkout-product-details">
            <p className="checkout-product-name">{product.name}</p>
            <p className="checkout-product-price">{product.price} KM</p>
          </div>
        </div>
      </div>

      {!orderCreated ? (
        <form onSubmit={handleSubmit} className="form">
          {/* Količina */}
          <div className="form-group">
            <label className="form-label">🔢 Količina</label>
            <div className="quantity-selector">
              <button 
                type="button" 
                className="quantity-btn"
                onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                disabled={formData.quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                className="quantity-input"
              />
              <button 
                type="button" 
                className="quantity-btn"
                onClick={() => setFormData({...formData, quantity: Math.min(99, formData.quantity + 1)})}
              >
                +
              </button>
            </div>
          </div>

          {/* Način preuzimanja */}
          <div className="form-group">
            <label className="form-label">📍 Način preuzimanja</label>
            <select 
              value={formData.deliveryMethod}
              onChange={(e) => setFormData({...formData, deliveryMethod: e.target.value})}
              className="form-select"
              required
            >
              <option value="pickup">Lično preuzimanje (besplatno)</option>
              <option value="shipping">Slanje poštom (+5 KM)</option>
            </select>
          </div>

          {/* Podaci o kupcu */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">👤 Ime i prezime</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input"
                placeholder="npr. John Doe"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">📧 Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-input"
                placeholder="npr. john@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">📞 Telefon</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="form-input"
              placeholder="npr. +387 61 123 456"
              required
            />
          </div>

          {/* Adresa - uvijek tražimo grad, a puna adresa samo za poštu */}
          {formData.deliveryMethod === 'shipping' ? (
            <>
              <div className="form-group">
                <label className="form-label">🏠 Adresa za dostavu</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="form-input"
                  placeholder="npr. Ulica 123"
                  required
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">🏙️ Grad</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="form-input"
                    placeholder="npr. Sarajevo"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">📮 Poštanski broj</label>
                  <input 
                    type="text" 
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    className="form-input"
                    placeholder="npr. 71000"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">🏙️ Grad (za lično preuzimanje)</label>
              <input 
                type="text" 
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="form-input"
                placeholder="npr. Sarajevo"
                required
              />
            </div>
          )}

          {/* Sažetak narudžbe */}
          <div className="order-summary">
            <h3 className="order-summary-title">📋 Sažetak narudžbe</h3>
            <div className="order-summary-row">
              <span>Proizvod:</span>
              <span>{product.name}</span>
            </div>
            <div className="order-summary-row">
              <span>Količina:</span>
              <span>{formData.quantity} kom</span>
            </div>
            <div className="order-summary-row">
              <span>Cijena po komadu:</span>
              <span>{product.price} KM</span>
            </div>
            <div className="order-summary-row">
              <span>Podproizvodi:</span>
              <span>{product.price * formData.quantity} KM</span>
            </div>
            {formData.deliveryMethod === 'shipping' && (
              <div className="order-summary-row">
                <span>Dostava:</span>
                <span>5 KM</span>
              </div>
            )}
            <div className="order-summary-row order-summary-total">
              <span>📦 Ukupno za platiti:</span>
              <span className="total-amount">{total} KM</span>
            </div>
            <div className="order-summary-row order-summary-payment">
              <span>💵 Način plaćanja:</span>
              <span className="payment-method">Plaćanje pouzećem (gotovina pri preuzimanju)</span>
            </div>
          </div>

          <button 
            type="submit"
            className="form-button"
          >
            ✅ Potvrdi narudžbu
          </button>
        </form>
      ) : (
        <div className="success-message">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">Narudžba uspješna!</h2>
          <p className="success-text">
            Hvala na narudžbi! Vaš broj narudžbe je: <strong>#{orderId}</strong>
          </p>
          <div className="success-details">
            <p>📦 <strong>Proizvod:</strong> {product.name}</p>
            <p>🔢 <strong>Količina:</strong> {formData.quantity} kom</p>
            <p>💵 <strong>Ukupno:</strong> {total} KM</p>
            <p>💳 <strong>Plaćanje:</strong> Pouzećem (pri preuzimanju)</p>
            <p>📍 <strong>Preuzimanje:</strong> {formData.deliveryMethod === 'pickup' ? 'Lično' : 'Poštom na adresu'}</p>
          </div>
          <p className="success-note">
            Kontaktirat ćemo vas uskoro na email <strong>{formData.email}</strong> ili telefon <strong>{formData.phone}</strong> radi dogovora oko preuzimanja.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="success-button"
          >
            🏠 Nazad na početnu
          </button>
        </div>
      )}
    </div>
  );
}

export default Checkout;