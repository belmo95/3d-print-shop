import { useEffect, useState } from 'react';

import AdminMessages from '../components/AdminMessages';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import {
  onAuthStateChanged,
} from 'firebase/auth';

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  auth,
  db,
  storage,
} from '../firebase';

function Admin() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkingAccess, setCheckingAccess] =
    useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] =
    useState('products');

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loadingProducts, setLoadingProducts] =
    useState(false);
  const [loadingOrders, setLoadingOrders] =
    useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingProductId, setEditingProductId] =
    useState(null);

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    category: 'ukrasi',
    image: null,
    imagePreview: null,
    existingImage: '',
    existingImagePath: '',
  });

  const [uploading, setUploading] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setCheckingAccess(false);

          navigate('/prijava', {
            replace: true,
            state: {
              from: {
                pathname: '/admin',
              },
            },
          });

          return;
        }

        setUser(currentUser);

        try {
          const adminReference = doc(
            db,
            'admins',
            currentUser.uid
          );

          const adminSnapshot = await getDoc(
            adminReference
          );

          const adminAccess =
            adminSnapshot.exists() &&
            adminSnapshot.data()?.role === 'admin';

          setIsAdmin(adminAccess);

          if (!adminAccess) {
            navigate('/', {
              replace: true,
            });
          }
        } catch (accessError) {
          console.error(
            'Greška pri provjeri admin pristupa:',
            accessError
          );

          setIsAdmin(false);

          navigate('/', {
            replace: true,
          });
        } finally {
          setCheckingAccess(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    loadProducts();
    loadOrders();
  }, [isAdmin]);

  const showSuccess = (message) => {
    setSuccess(message);
    setError('');

    window.setTimeout(() => {
      setSuccess('');
    }, 4000);
  };

  const showError = (message) => {
    setError(message);
    setSuccess('');
  };

  const getTimestampValue = (timestamp) => {
    if (!timestamp) {
      return 0;
    }

    if (
      typeof timestamp.toMillis === 'function'
    ) {
      return timestamp.toMillis();
    }

    if (
      typeof timestamp.toDate === 'function'
    ) {
      return timestamp.toDate().getTime();
    }

    if (timestamp instanceof Date) {
      return timestamp.getTime();
    }

    const parsedDate = new Date(timestamp).getTime();

    return Number.isNaN(parsedDate)
      ? 0
      : parsedDate;
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      const productsSnapshot = await getDocs(
        collection(db, 'products')
      );

      const productsList =
        productsSnapshot.docs.map(
          (productDocument) => ({
            id: productDocument.id,
            ...productDocument.data(),
          })
        );

      productsList.sort(
        (firstProduct, secondProduct) =>
          getTimestampValue(
            secondProduct.createdAt
          ) -
          getTimestampValue(
            firstProduct.createdAt
          )
      );

      setProducts(productsList);
    } catch (productsError) {
      console.error(
        'Greška pri učitavanju proizvoda:',
        productsError
      );

      showError(
        productsError.message ||
          'Proizvodi se ne mogu učitati.'
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);

      const ordersSnapshot = await getDocs(
        collection(db, 'orders')
      );

      const ordersList =
        ordersSnapshot.docs.map(
          (orderDocument) => ({
            id: orderDocument.id,
            ...orderDocument.data(),
          })
        );

      ordersList.sort(
        (firstOrder, secondOrder) =>
          getTimestampValue(
            secondOrder.createdAt
          ) -
          getTimestampValue(
            firstOrder.createdAt
          )
      );

      setOrders(ordersList);
    } catch (ordersError) {
      console.error(
        'Greška pri učitavanju narudžbi:',
        ordersError
      );

      showError(
        ordersError.message ||
          'Narudžbe se ne mogu učitati.'
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);

    setProductData({
      name: '',
      description: '',
      price: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
      },
      category: 'ukrasi',
      image: null,
      imagePreview: null,
      existingImage: '',
      existingImagePath: '',
    });
  };

  const handleProductInputChange = (event) => {
    const { name, value } = event.target;

    setProductData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleDimensionChange = (event) => {
    const { name, value } = event.target;

    setProductData((previousData) => ({
      ...previousData,
      dimensions: {
        ...previousData.dimensions,
        [name]: value,
      },
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError(
        'Odaberite validnu sliku.'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError(
        'Slika ne smije biti veća od 5 MB.'
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProductData((previousData) => ({
        ...previousData,
        image: file,
        imagePreview: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const uploadProductImage = async () => {
    if (!productData.image) {
      return {
        imageUrl:
          productData.existingImage || '',
        imagePath:
          productData.existingImagePath || '',
      };
    }

    setUploading(true);

    try {
      const safeFileName = productData.image.name
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .toLowerCase();

      const imagePath =
        `products/${Date.now()}-${safeFileName}`;

      const storageReference = ref(
        storage,
        imagePath
      );

      await uploadBytes(
        storageReference,
        productData.image
      );

      const imageUrl =
        await getDownloadURL(storageReference);

      return {
        imageUrl,
        imagePath,
      };
    } catch (uploadError) {
      console.error(
        'Greška pri uploadu slike:',
        uploadError
      );

      throw new Error(
        'Slika nije uspješno uploadovana.'
      );
    } finally {
      setUploading(false);
    }
  };

  const deleteOldProductImage = async () => {
    if (!productData.existingImagePath) {
      return;
    }

    try {
      await deleteObject(
        ref(
          storage,
          productData.existingImagePath
        )
      );
    } catch (imageError) {
      console.warn(
        'Stara slika nije obrisana:',
        imageError
      );
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!productData.name.trim()) {
      showError(
        'Unesite naziv proizvoda.'
      );
      return;
    }

    if (!productData.description.trim()) {
      showError(
        'Unesite opis proizvoda.'
      );
      return;
    }

    const price = Number(productData.price);
    const length = Number(
      productData.dimensions.length
    );
    const width = Number(
      productData.dimensions.width
    );
    const height = Number(
      productData.dimensions.height
    );

    if (!Number.isFinite(price) || price < 0) {
      showError(
        'Unesite ispravnu cijenu.'
      );
      return;
    }

    if (
      !Number.isFinite(length) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height)
    ) {
      showError(
        'Unesite ispravne dimenzije.'
      );
      return;
    }

    if (
      !editingProductId &&
      !productData.image
    ) {
      showError(
        'Odaberite sliku proizvoda.'
      );
      return;
    }

    try {
      setSubmitting(true);

      const uploadedImage =
        await uploadProductImage();

      const productPayload = {
        name: productData.name.trim(),
        description: productData.description.trim(),
        price,
        dimensions: {
          length,
          width,
          height,
        },
        category: productData.category,
        image: uploadedImage.imageUrl,
        imagePath: uploadedImage.imagePath,
        updatedAt: serverTimestamp(),
      };

      if (editingProductId) {
        await updateDoc(
          doc(
            db,
            'products',
            editingProductId
          ),
          productPayload
        );

        if (
          productData.image &&
          productData.existingImagePath
        ) {
          await deleteOldProductImage();
        }

        showSuccess(
          'Proizvod je uspješno izmijenjen.'
        );
      } else {
        await addDoc(
          collection(db, 'products'),
          {
            ...productPayload,
            createdAt: serverTimestamp(),
          }
        );

        showSuccess(
          'Proizvod je uspješno dodan.'
        );
      }

      resetProductForm();
      await loadProducts();
    } catch (submitError) {
      console.error(
        'Greška pri čuvanju proizvoda:',
        submitError
      );

      showError(
        submitError.message ||
          'Proizvod nije moguće sačuvati.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);

    setProductData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      dimensions: {
        length:
          product.dimensions?.length ?? '',
        width:
          product.dimensions?.width ?? '',
        height:
          product.dimensions?.height ?? '',
      },
      category: product.category || 'ukrasi',
      image: null,
      imagePreview: product.image || null,
      existingImage: product.image || '',
      existingImagePath:
        product.imagePath || '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Da li želite obrisati proizvod "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, 'products', product.id)
      );

      if (product.imagePath) {
        try {
          await deleteObject(
            ref(storage, product.imagePath)
          );
        } catch (imageError) {
          console.warn(
            'Slika nije obrisana iz Storage-a:',
            imageError
          );
        }
      }

      showSuccess(
        'Proizvod je uspješno obrisan.'
      );

      await loadProducts();
    } catch (deleteError) {
      console.error(
        'Greška pri brisanju proizvoda:',
        deleteError
      );

      showError(
        deleteError.message ||
          'Proizvod nije moguće obrisati.'
      );
    }
  };

 const updateOrderStatus = async (
  orderId,
  status
) => {
  try {
    await updateDoc(
      doc(db, 'orders', orderId),
      {
        status,
        statusChanged: true,
        hasNotification: true,
        readByCustomer: false,
        updatedAt: serverTimestamp(),
      }
    );

    showSuccess(
      'Status narudžbe je izmijenjen.'
    );

    await loadOrders();
  } catch (statusError) {
    console.error(
      'Greška pri promjeni statusa:',
      statusError
    );

    showError(
      'Status narudžbe nije moguće izmijeniti.'
    );
  }
};

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return 'Nije dostupno';
    }

    if (
      typeof timestamp.toDate === 'function'
    ) {
      return timestamp.toDate().toLocaleString(
        'bs-BA'
      );
    }

    if (timestamp instanceof Date) {
      return timestamp.toLocaleString('bs-BA');
    }

    return 'Nije dostupno';
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

  if (checkingAccess) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>

        <p className="loading-text">
          Provjera admin pristupa...
        </p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div>
            <p className="admin-kicker">
              LayerLab3D administracija
            </p>

            <h1 className="admin-dashboard-title">
              Admin panel
            </h1>

            <p className="admin-dashboard-subtitle">
              Upravljajte proizvodima, narudžbama i
              komunikacijom sa klijentima.
            </p>
          </div>

          <Link
            to="/"
            className="admin-back-button"
          >
            ← Početna
          </Link>
        </div>

        {error && (
          <div
            className="admin-error"
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div
            className="admin-success"
            role="status"
          >
            ✅ {success}
          </div>
        )}

        <div className="admin-tabs">
          <button
            type="button"
            className={
              activeTab === 'products'
                ? 'admin-tab active'
                : 'admin-tab'
            }
            onClick={() =>
              setActiveTab('products')
            }
          >
            📦 Proizvodi
          </button>

          <button
            type="button"
            className={
              activeTab === 'orders'
                ? 'admin-tab active'
                : 'admin-tab'
            }
            onClick={() =>
              setActiveTab('orders')
            }
          >
            🧾 Narudžbe
          </button>

          <button
            type="button"
            className={
              activeTab === 'messages'
                ? 'admin-tab active'
                : 'admin-tab'
            }
            onClick={() =>
              setActiveTab('messages')
            }
          >
            💬 Poruke
          </button>
        </div>

        {activeTab === 'products' && (
          <section className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>
                  {editingProductId
                    ? 'Izmijeni proizvod'
                    : 'Dodaj novi proizvod'}
                </h2>

                <p>
                  Dodajte ili izmijenite artikle u
                  prodavnici.
                </p>
              </div>

              {editingProductId && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={resetProductForm}
                >
                  Otkaži izmjene
                </button>
              )}
            </div>

            <form
              onSubmit={handleProductSubmit}
              className="admin-product-form"
            >
              <div className="form-group">
                <label
                  htmlFor="product-name"
                  className="form-label"
                >
                  Naziv proizvoda *
                </label>

                <input
                  id="product-name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={productData.name}
                  onChange={
                    handleProductInputChange
                  }
                  placeholder="npr. Dekorativna vaza"
                  required
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="product-description"
                  className="form-label"
                >
                  Opis *
                </label>

                <textarea
                  id="product-description"
                  name="description"
                  className="form-textarea"
                  rows="4"
                  value={
                    productData.description
                  }
                  onChange={
                    handleProductInputChange
                  }
                  placeholder="Detaljan opis proizvoda..."
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label
                    htmlFor="product-price"
                    className="form-label"
                  >
                    Cijena (KM) *
                  </label>

                  <input
                    id="product-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={productData.price}
                    onChange={
                      handleProductInputChange
                    }
                    placeholder="25.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="product-category"
                    className="form-label"
                  >
                    Kategorija
                  </label>

                  <select
                    id="product-category"
                    name="category"
                    className="form-select"
                    value={
                      productData.category
                    }
                    onChange={
                      handleProductInputChange
                    }
                  >
                    <option value="ukrasi">
                      Kućni ukrasi
                    </option>

                    <option value="igracke">
                      Igračke
                    </option>

                    <option value="pokloni">
                      Pokloni i dodaci
                    </option>

                    <option value="po_narudzbi">
                      Po narudžbi
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Dimenzije (cm) *
                </label>

                <div className="form-grid-3">
                  <div>
                    <label
                      htmlFor="product-length"
                      className="form-label form-label-small"
                    >
                      Dužina
                    </label>

                    <input
                      id="product-length"
                      name="length"
                      type="number"
                      step="0.1"
                      min="0"
                      className="form-input"
                      value={
                        productData.dimensions
                          .length
                      }
                      onChange={
                        handleDimensionChange
                      }
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="product-width"
                      className="form-label form-label-small"
                    >
                      Širina
                    </label>

                    <input
                      id="product-width"
                      name="width"
                      type="number"
                      step="0.1"
                      min="0"
                      className="form-input"
                      value={
                        productData.dimensions
                          .width
                      }
                      onChange={
                        handleDimensionChange
                      }
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="product-height"
                      className="form-label form-label-small"
                    >
                      Visina
                    </label>

                    <input
                      id="product-height"
                      name="height"
                      type="number"
                      step="0.1"
                      min="0"
                      className="form-input"
                      value={
                        productData.dimensions
                          .height
                      }
                      onChange={
                        handleDimensionChange
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="product-image"
                  className="form-label"
                >
                  Slika proizvoda{' '}
                  {editingProductId
                    ? '(opcionalno)'
                    : '*'}
                </label>

                <input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={handleImageChange}
                  required={!editingProductId}
                />

                {productData.imagePreview && (
                  <div className="admin-image-preview">
                    <p className="admin-image-preview-label">
                      Pregled slike:
                    </p>

                    <img
                      src={productData.imagePreview}
                      alt="Pregled proizvoda"
                      className="admin-image-preview-img"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="form-button"
                disabled={
                  submitting || uploading
                }
              >
                {uploading
                  ? 'Upload slike...'
                  : submitting
                    ? 'Čuvanje...'
                    : editingProductId
                      ? 'Sačuvaj izmjene'
                      : 'Dodaj proizvod'}
              </button>
            </form>

            <div className="admin-list-section">
              <div className="admin-section-header">
                <div>
                  <h2>Svi proizvodi</h2>

                  <p>
                    Ukupno proizvoda:{' '}
                    {products.length}
                  </p>
                </div>
              </div>

              {loadingProducts ? (
                <p>
                  Učitavanje proizvoda...
                </p>
              ) : products.length === 0 ? (
                <p>
                  Nema dodanih proizvoda.
                </p>
              ) : (
                <div className="admin-products-list">
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="admin-product-row"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="admin-product-thumbnail"
                        />
                      ) : (
                        <div className="admin-product-thumbnail admin-product-placeholder">
                          🖨️
                        </div>
                      )}

                      <div className="admin-product-row-info">
                        <h3>{product.name}</h3>

                        <p>
                          {Number(
                            product.price || 0
                          ).toFixed(2)}{' '}
                          KM
                        </p>

                        <span>
                          {product.category}
                        </span>
                      </div>

                      <div className="admin-product-actions">
                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={() =>
                            handleEditProduct(
                              product
                            )
                          }
                        >
                          Izmijeni
                        </button>

                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() =>
                            handleDeleteProduct(
                              product
                            )
                          }
                        >
                          Obriši
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Sve narudžbe</h2>

                <p>
                  Pregled i obrada narudžbi klijenata.
                </p>
              </div>
            </div>

            {loadingOrders ? (
              <p>
                Učitavanje narudžbi...
              </p>
            ) : orders.length === 0 ? (
              <p>
                Nema narudžbi.
              </p>
            ) : (
              <div className="admin-orders-list">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="admin-order-card"
                  >
                    <div className="admin-order-header">
                      <div>
                        <h3>
                          Narudžba #
                          {order.id
                            .slice(0, 8)
                            .toUpperCase()}
                        </h3>

                        <p>
                          {formatDate(
                            order.createdAt
                          )}
                        </p>
                      </div>

                      <span className="admin-order-user">
                        {order.userEmail ||
                          'Nepoznat korisnik'}
                      </span>
                    </div>

                    <div className="admin-order-content">
                      <div>
                        <strong>
                          {order.productName ||
                            'Proizvod'}
                        </strong>

                        <p>
                          Količina:{' '}
                          {order.quantity || 1}
                        </p>

                        <p>
                          Ukupno:{' '}
                          {Number(
                            order.total ||
                              order.price ||
                              0
                          ).toFixed(2)}{' '}
                          KM
                        </p>

                        {order.customerName && (
                          <p>
                            Kupac:{' '}
                            {order.customerName}
                          </p>
                        )}

                        {order.customerPhone && (
                          <p>
                            Telefon:{' '}
                            {order.customerPhone}
                          </p>
                        )}

                        {order.address && (
                          <p>
                            Adresa:{' '}
                            {order.address}
                          </p>
                        )}

                        {order.city && (
                          <p>
                            Grad:{' '}
                            {order.city}
                          </p>
                        )}

                        {order.note && (
                          <p>
                            Napomena:{' '}
                            {order.note}
                          </p>
                        )}
                      </div>

                      <div className="admin-order-controls">
                        <label
                          htmlFor={`status-${order.id}`}
                        >
                          Status
                        </label>

                        <select
                          id={`status-${order.id}`}
                          className="form-select"
                          value={
                            order.status ||
                            'pending'
                          }
                          onChange={(event) =>
                            updateOrderStatus(
                              order.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="pending">
                            Na čekanju
                          </option>

                          <option value="confirmed">
                            Potvrđena
                          </option>

                          <option value="processing">
                            U izradi
                          </option>

                          <option value="shipped">
                            Poslana
                          </option>

                          <option value="completed">
                            Završena
                          </option>

                          <option value="cancelled">
                            Otkazana
                          </option>
                        </select>

                        <span className="admin-current-status">
                          Trenutno:{' '}
                          {getStatusLabel(
                            order.status
                          )}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'messages' && (
          <section className="admin-section">
            <AdminMessages />
          </section>
        )}
      </div>
    </main>
  );
}

export default Admin;