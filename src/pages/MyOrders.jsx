import { useEffect, useState } from 'react';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import {
  onAuthStateChanged,
} from 'firebase/auth';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { auth, db } from '../firebase';

function MyOrders() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          if (isMounted) {
            setLoading(false);
          }

          navigate('/prijava', {
            replace: true,
            state: {
              from: {
                pathname: '/moje-narudzbe',
              },
            },
          });

          return;
        }

        if (isMounted) {
          setUser(currentUser);
        }

        try {
          const ordersReference = collection(
            db,
            'orders'
          );

          const ordersQuery = query(
            ordersReference,
            where(
              'userId',
              '==',
              currentUser.uid
            )
          );
          const markOrderAsRead = async (orderId) => {
  try {
    await updateDoc(
      doc(db, 'orders', orderId),
      {
        statusChanged: false,
        hasNotification: false,
        readByCustomer: true,
      }
    );
  } catch (error) {
    console.error(
      'Greška pri označavanju narudžbe:',
      error
    );
  }
};

          const ordersSnapshot =
            await getDocs(ordersQuery);

          const ordersList =
            ordersSnapshot.docs.map(
              (orderDocument) => ({
                id: orderDocument.id,
                ...orderDocument.data(),
              })
            );

          ordersList.sort(
            (firstOrder, secondOrder) => {
              const firstTime =
                firstOrder.createdAt?.toMillis?.() ||
                0;

              const secondTime =
                secondOrder.createdAt?.toMillis?.() ||
                0;

              return secondTime - firstTime;
            }
          );

          if (isMounted) {
            setOrders(ordersList);
          }
        } catch (ordersError) {
          console.error(
            'Greška prilikom učitavanja narudžbi:',
            ordersError
          );

          if (isMounted) {
            setError(
              ordersError.message ||
                'Narudžbe nije moguće učitati.'
            );
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return 'Datum nije dostupan';
    }

    if (
      timestamp &&
      typeof timestamp.toDate === 'function'
    ) {
      return timestamp.toDate().toLocaleString(
        'bs-BA',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      );
    }

    if (timestamp instanceof Date) {
      return timestamp.toLocaleString(
        'bs-BA'
      );
    }

    return 'Datum nije dostupan';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Na čekanju';

      case 'confirmed':
        return 'Potvrđena';

      case 'processing':
        return 'U izradi';

      case 'shipped':
        return 'Poslana';

      case 'completed':
        return 'Završena';

      case 'cancelled':
        return 'Otkazana';

      default:
        return status || 'Nije definisano';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';

      case 'processing':
        return 'status-processing';

      case 'shipped':
        return 'status-shipped';

      case 'completed':
        return 'status-completed';

      case 'cancelled':
        return 'status-cancelled';

      default:
        return 'status-pending';
    }
  };

  const getOrderTotal = (order) => {
    const total = Number(
      order.total ??
        Number(order.price || 0) *
          Number(order.quantity || 1)
    );

    return Number.isFinite(total)
      ? total
      : 0;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>

        <p className="loading-text">
          Učitavanje narudžbi...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <div>
            <h1 className="orders-title">
              Moje narudžbe
            </h1>

            <p className="orders-subtitle">
              Pregled svih vaših narudžbi.
            </p>
          </div>

          <Link
            to="/"
            className="orders-back-link"
          >
            ← Nastavi kupovinu
          </Link>
        </div>

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-state orders-empty">
            <div className="empty-state-icon">
              📦
            </div>

            <p className="empty-state-text">
              Još uvijek nemate nijednu narudžbu.
            </p>

            <Link
              to="/"
              className="empty-state-btn"
            >
              Pogledaj proizvode
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const productImage =
                order.productImage ||
                order.image ||
                '';

              return (
                <article
  className="order-card"
  key={order.id}
  onClick={() => markOrderAsRead(order.id)}
>
                  <div className="order-card-header">
                    <div>
                      <h2 className="order-number">
                        Narudžba #
                        {order.id
                          .slice(0, 8)
                          .toUpperCase()}
                      </h2>

                      <p className="order-date">
                        Datum:{' '}
                        {formatDate(
                          order.createdAt
                        )}
                      </p>
                    </div>

                    <span
                      className={`order-status ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(
                        order.status
                      )}
                    </span>
                  </div>

                  <div className="order-card-body">
                    <div className="order-product">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={
                            order.productName ||
                            'Proizvod'
                          }
                          className="order-product-image"
                        />
                      ) : (
                        <div className="order-product-image order-product-placeholder">
                          🖨️
                        </div>
                      )}

                      <div className="order-product-info">
                        <h3>
                          {order.productName ||
                            'Proizvod'}
                        </h3>

                        <p>
                          Količina:{' '}
                          {order.quantity || 1}
                        </p>

                        {order.price !==
                          undefined && (
                          <p>
                            Cijena:{' '}
                            {Number(
                              order.price || 0
                            ).toFixed(2)}{' '}
                            KM
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="order-total">
                      <span>Ukupno</span>

                      <strong>
                        {getOrderTotal(
                          order
                        ).toFixed(2)}{' '}
                        KM
                      </strong>
                    </div>
                  </div>

                  <div className="order-customer-data">
                    {order.customerName && (
                      <p>
                        <strong>Kupac:</strong>{' '}
                        {order.customerName}
                      </p>
                    )}

                    {order.customerPhone && (
                      <p>
                        <strong>Telefon:</strong>{' '}
                        {order.customerPhone}
                      </p>
                    )}

                    {order.address && (
                      <p>
                        <strong>Adresa:</strong>{' '}
                        {order.address}
                      </p>
                    )}

                    {order.city && (
                      <p>
                        <strong>Grad:</strong>{' '}
                        {order.city}
                      </p>
                    )}

                    {order.note && (
                      <p>
                        <strong>Napomena:</strong>{' '}
                        {order.note}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyOrders;