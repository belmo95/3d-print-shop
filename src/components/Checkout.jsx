import { useEffect, useState } from 'react';

import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { sendOrderEmail } from '../emailjs';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { auth, db } from '../firebase';

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const productFromState =
    location.state?.product || null;

  const [product, setProduct] = useState(
    productFromState
  );

  const [quantity, setQuantity] = useState(1);

  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] =
    useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsubscribe =
      auth.onAuthStateChanged((currentUser) => {
        if (!currentUser) {
          setPageLoading(false);

          navigate('/prijava', {
            replace: true,
            state: {
              from: {
                pathname: '/checkout',
                state: {
                  product: productFromState,
                },
              },
            },
          });

          return;
        }

        setCustomerData((previousData) => ({
          ...previousData,
          name:
            currentUser.displayName ||
            previousData.name,
        }));

        setPageLoading(false);
      });

    return () => unsubscribe();
  }, [navigate, productFromState]);

  useEffect(() => {
    if (!productFromState) {
      const storedProduct =
        sessionStorage.getItem(
          'checkoutProduct'
        );

      if (storedProduct) {
        try {
          setProduct(JSON.parse(storedProduct));
        } catch (storageError) {
          console.error(
            'Greška pri učitavanju proizvoda:',
            storageError
          );
        }
      }
    }
  }, [productFromState]);

  const updateCustomerData = (event) => {
    const { name, value } = event.target;

    setCustomerData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const increaseQuantity = () => {
    setQuantity((previousQuantity) =>
      Math.min(previousQuantity + 1, 99)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((previousQuantity) =>
      Math.max(previousQuantity - 1, 1)
    );
  };

  const getProductImage = () => {
    return (
      product?.image ||
      product?.imageUrl ||
      product?.imageURL ||
      ''
    );
  };

  const getProductPrice = () => {
    const parsedPrice = Number(product?.price);

    return Number.isFinite(parsedPrice)
      ? parsedPrice
      : 0;
  };

  const productPrice = getProductPrice();
  const totalPrice = productPrice * quantity;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate('/prijava', {
        state: {
          from: {
            pathname: '/checkout',
            state: {
              product,
            },
          },
        },
      });

      return;
    }

    if (!product?.id) {
      setError(
        'Proizvod nije pronađen. Vratite se na proizvode i pokušajte ponovo.'
      );

      return;
    }

    if (!customerData.name.trim()) {
      setError('Unesite ime i prezime.');
      return;
    }

    if (!customerData.phone.trim()) {
      setError('Unesite broj telefona.');
      return;
    }

    if (!customerData.address.trim()) {
      setError('Unesite adresu za dostavu.');
      return;
    }

    if (!customerData.city.trim()) {
      setError('Unesite grad.');
      return;
    }

    if (productPrice <= 0) {
      setError(
        'Cijena proizvoda nije ispravna.'
      );

      return;
    }

    try {
      setLoading(true);

      const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',

        productId: product.id,
        productName: product.name || '',
        productImage: getProductImage(),

        price: productPrice,
        quantity,
        total: totalPrice,

        customerName: customerData.name.trim(),
        customerPhone:
          customerData.phone.trim(),
        address: customerData.address.trim(),
        city: customerData.city.trim(),
        note: customerData.note.trim(),

        status: 'pending',
        statusChanged: false,
        hasNotification: false,
        readByCustomer: true,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderReference = await addDoc(
        collection(db, 'orders'),
        orderData
      );
      const emailSent = await sendOrderEmail({
  orderId: orderReference.id,
  ...orderData,
});

if (!emailSent) {
  console.warn(
    'Narudžba je sačuvana, ali email nije poslan.'
  );
}

      /*
        Ovaj dokument aktivira Firebase Trigger Email
        ekstenziju ako je podešena da prati kolekciju
        "mail".
      */
      await addDoc(collection(db, 'mail'), {
        to: 'layerlab.3de@gmail.com',

        message: {
          subject: `Nova narudžba - ${
            orderData.productName
          }`,

          text: `
Nova narudžba je primljena.

Proizvod: ${orderData.productName}
Količina: ${orderData.quantity}
Cijena po komadu: ${orderData.price.toFixed(2)} KM
Ukupno: ${orderData.total.toFixed(2)} KM

Kupac: ${orderData.customerName}
Email: ${orderData.userEmail}
Telefon: ${orderData.customerPhone}

Adresa:
${orderData.address}
${orderData.city}

Napomena:
${orderData.note || 'Nema napomene'}

ID narudžbe:
${orderReference.id}
          `,

          html: `
            <h2>Nova narudžba - LayerLab3DE</h2>

            <h3>Podaci o proizvodu</h3>

            <p>
              <strong>Proizvod:</strong>
              ${orderData.productName}
            </p>

            <p>
              <strong>Količina:</strong>
              ${orderData.quantity}
            </p>

            <p>
              <strong>Cijena po komadu:</strong>
              ${orderData.price.toFixed(2)} KM
            </p>

            <p>
              <strong>Ukupno:</strong>
              ${orderData.total.toFixed(2)} KM
            </p>

            <h3>Podaci o kupcu</h3>

            <p>
              <strong>Ime i prezime:</strong>
              ${orderData.customerName}
            </p>

            <p>
              <strong>Email:</strong>
              ${orderData.userEmail}
            </p>

            <p>
              <strong>Telefon:</strong>
              ${orderData.customerPhone}
            </p>

            <p>
              <strong>Adresa:</strong>
              ${orderData.address},
              ${orderData.city}
            </p>

            <p>
              <strong>Napomena:</strong>
              ${
                orderData.note ||
                'Nema napomene'
              }
            </p>

            <p>
              <strong>ID narudžbe:</strong>
              ${orderReference.id}
            </p>
          `,
        },

        orderId: orderReference.id,
        type: 'new-order',
        createdAt: serverTimestamp(),
      });

      console.log(
        'Narudžba uspješno kreirana:',
        orderReference.id
      );

      setSuccess(
        'Narudžba je uspješno poslana.'
      );

      sessionStorage.removeItem(
        'checkoutProduct'
      );

      setTimeout(() => {
        navigate('/moje-narudzbe', {
          replace: true,
        });
      }, 1200);
    } catch (orderError) {
      console.error(
        'Greška pri kreiranju narudžbe:',
        orderError
      );

      if (
        orderError.code ===
        'permission-denied'
      ) {
        setError(
          'Narudžba je možda kreirana, ali email dokument nema dozvolu za upis. Provjerite Firestore Rules za kolekciju mail.'
        );
      } else {
        setError(
          orderError.message ||
            'Narudžbu nije moguće kreirati.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>

        <p className="loading-text">
          Priprema narudžbe...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <div className="empty-state">
            <div className="empty-state-icon">
              🛒
            </div>

            <p className="empty-state-text">
              Proizvod za kupovinu nije pronađen.
            </p>

            <Link
              to="/"
              className="empty-state-btn"
            >
              Vrati se na proizvode
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1 className="checkout-title">
            Završi narudžbu
          </h1>

          <p className="checkout-subtitle">
            Unesite podatke za dostavu.
          </p>
        </div>

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div
            className="success-message"
            role="status"
          >
            ✅ {success}
          </div>
        )}

        <div className="checkout-layout">
          <section className="checkout-product-summary">
            <h2 className="checkout-product-summary-title">
              Vaš proizvod
            </h2>

            <div className="checkout-product-info">
              {getProductImage() ? (
                <img
                  src={getProductImage()}
                  alt={product.name}
                  className="checkout-product-image"
                />
              ) : (
                <div className="checkout-product-image checkout-product-placeholder">
                  🖨️
                </div>
              )}

              <div className="checkout-product-details">
                <h3 className="checkout-product-name">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="checkout-product-description">
                    {product.description}
                  </p>
                )}

                {product.dimensions && (
                  <p className="checkout-product-dimensions">
                    Dimenzije:{' '}
                    {product.dimensions.length} ×{' '}
                    {product.dimensions.width} ×{' '}
                    {product.dimensions.height} cm
                  </p>
                )}

                <p className="checkout-product-price">
                  {productPrice.toFixed(2)} KM
                </p>
              </div>
            </div>

            <div className="quantity-control">
              <span className="quantity-label">
                Količina
              </span>

              <div className="quantity-buttons">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Smanji količinu"
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= 99}
                  aria-label="Povećaj količinu"
                >
                  +
                </button>
              </div>
            </div>

            <div className="checkout-total">
              <span>
                Ukupno za plaćanje
              </span>

              <strong>
                {totalPrice.toFixed(2)} KM
              </strong>
            </div>
          </section>

          <section className="checkout-form-card">
            <h2 className="checkout-form-title">
              Podaci za dostavu
            </h2>

            <form
              onSubmit={handleSubmit}
              className="checkout-form"
            >
              <div className="form-group">
                <label
                  htmlFor="customer-name"
                  className="form-label"
                >
                  Ime i prezime *
                </label>

                <input
                  id="customer-name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={customerData.name}
                  onChange={updateCustomerData}
                  placeholder="Ime i prezime"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="customer-phone"
                  className="form-label"
                >
                  Telefon *
                </label>

                <input
                  id="customer-phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  value={customerData.phone}
                  onChange={updateCustomerData}
                  placeholder="+387 62 000 000"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="customer-address"
                  className="form-label"
                >
                  Adresa *
                </label>

                <input
                  id="customer-address"
                  name="address"
                  type="text"
                  className="form-input"
                  value={customerData.address}
                  onChange={updateCustomerData}
                  placeholder="Ulica i broj"
                  autoComplete="street-address"
                  required
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="customer-city"
                  className="form-label"
                >
                  Grad *
                </label>

                <input
                  id="customer-city"
                  name="city"
                  type="text"
                  className="form-input"
                  value={customerData.city}
                  onChange={updateCustomerData}
                  placeholder="Grad"
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="customer-note"
                  className="form-label"
                >
                  Napomena
                </label>

                <textarea
                  id="customer-note"
                  name="note"
                  className="form-textarea"
                  value={customerData.note}
                  onChange={updateCustomerData}
                  placeholder="Dodatna napomena za narudžbu..."
                  rows="4"
                />
              </div>

              <button
                type="submit"
                className="form-button checkout-submit-button"
                disabled={loading}
              >
                {loading
                  ? 'Slanje narudžbe...'
                  : `Pošalji narudžbu - ${totalPrice.toFixed(
                      2
                    )} KM`}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Checkout;