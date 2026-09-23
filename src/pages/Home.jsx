import { useEffect, useMemo, useState } from 'react';

import {
  collection,
  getDocs,
  query,
} from 'firebase/firestore';

import { db } from '../firebase';
import ProductCard from '../components/ProductCard';

import '../styles/Header.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] =
    useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setLoadingError('');

        const productsReference = collection(
          db,
          'products'
        );

        const productsQuery = query(
          productsReference
        );

        const querySnapshot = await getDocs(
          productsQuery
        );

        const productsList =
          querySnapshot.docs.map(
            (productDocument) => ({
              id: productDocument.id,
              ...productDocument.data(),
            })
          );

        productsList.sort((firstProduct, secondProduct) => {
          const firstDate =
            firstProduct.createdAt?.toMillis?.() ||
            new Date(
              firstProduct.createdAt || 0
            ).getTime() ||
            0;

          const secondDate =
            secondProduct.createdAt?.toMillis?.() ||
            new Date(
              secondProduct.createdAt || 0
            ).getTime() ||
            0;

          return secondDate - firstDate;
        });

        setProducts(productsList);
      } catch (error) {
        console.error(
          'Greška prilikom učitavanja proizvoda:',
          error
        );

        setLoadingError(
          'Proizvodi se trenutno ne mogu učitati. Pokušajte ponovo kasnije.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(
    () => [
      {
        id: 'all',
        name: 'Svi proizvodi',
        icon: '🛍️',
        count: products.length,
      },
      {
        id: 'ukrasi',
        name: 'Kućni ukrasi',
        icon: '🏠',
        count: products.filter(
          (product) =>
            product.category === 'ukrasi'
        ).length,
      },
      {
        id: 'igracke',
        name: 'Igračke',
        icon: '🎮',
        count: products.filter(
          (product) =>
            product.category === 'igracke'
        ).length,
      },
      {
        id: 'pokloni',
        name: 'Pokloni i dodaci',
        icon: '🎁',
        count: products.filter(
          (product) =>
            product.category === 'pokloni'
        ).length,
      },
      {
        id: 'po_narudzbi',
        name: 'Po narudžbi',
        icon: '✨',
        count: products.filter(
          (product) =>
            product.category === 'po_narudzbi'
        ).length,
      },
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (product) =>
          product.category === selectedCategory
      );
    }

    const normalizedSearchTerm =
      searchTerm.trim().toLowerCase();

    if (normalizedSearchTerm) {
      filtered = filtered.filter((product) => {
        const productName =
          product.name?.toLowerCase() || '';

        const productDescription =
          product.description?.toLowerCase() || '';

        const productCategory =
          product.category?.toLowerCase() || '';

        return (
          productName.includes(
            normalizedSearchTerm
          ) ||
          productDescription.includes(
            normalizedSearchTerm
          ) ||
          productCategory.includes(
            normalizedSearchTerm
          )
        );
      });
    }

    return filtered;
  }, [
    products,
    searchTerm,
    selectedCategory,
  ]);

  const scrollToElement = (elementId) => {
    const element =
      document.getElementById(elementId);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);

    setTimeout(() => {
      scrollToElement('products');
    }, 50);
  };

  const handleHeroClick = (event) => {
    event.preventDefault();

    scrollToElement('products-area');
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');

    setTimeout(() => {
      scrollToElement('products');
    }, 50);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>

        <p className="loading-text">
          Učitavanje proizvoda...
        </p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <main className="home-error-page">
        <div className="empty-state">
          <div className="empty-state-icon">
            ⚠️
          </div>

          <p className="empty-state-text">
            {loadingError}
          </p>

          <button
            type="button"
            className="empty-state-btn"
            onClick={() =>
              window.location.reload()
            }
          >
            Pokušaj ponovo
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <h1 className="hero-title">
            LayerLab3D
          </h1>

          <p className="hero-subtitle">
            Unikatni kućni ukrasi, organizatori,
            pokloni i proizvodi izrađeni po mjeri.
            <br />
            Pošaljite nam sliku ili ideju — mi je
            pretvaramo u stvarni proizvod.
          </p>

          <a
            href="#products-area"
            className="hero-cta"
            onClick={handleHeroClick}
          >
            Pogledaj ponudu
          </a>
        </div>
      </section>

      {/* Search and Categories Area */}
      <div id="products-area">
        {/* Search Section */}
        <section className="search-section">
          <div className="search-container">
            <div className="search-wrapper">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                />

                <path d="M21 21l-4.35-4.35" />
              </svg>

              <input
                type="text"
                placeholder="Pretraži proizvode po imenu ili opisu..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                className="search-input"
                aria-label="Pretraži proizvode"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm('')
                  }
                  className="search-clear"
                  aria-label="Obriši pretragu"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories">
          <div className="categories-container">
            <h2 className="categories-title">
              Kategorije
            </h2>

            <div className="categories-grid">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={`category-card ${
                    selectedCategory === category.id
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    handleCategoryClick(
                      category.id
                    )
                  }
                  aria-pressed={
                    selectedCategory ===
                    category.id
                  }
                >
                  <div className="category-icon">
                    {category.icon}
                  </div>

                  <h3 className="category-name">
                    {category.name}
                  </h3>

                  <p className="category-count">
                    {category.count}{' '}
                    {category.count === 1
                      ? 'proizvod'
                      : 'proizvoda'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Products Section */}
      <section
        id="products"
        className="container"
      >
        <div className="products-header">
          <h1 className="products-title">
            {selectedCategory === 'all'
              ? 'Svi proizvodi'
              : categories.find(
                  (category) =>
                    category.id ===
                    selectedCategory
                )?.name}
          </h1>

          {searchTerm && (
            <p className="search-results-info">
              Pronađeno{' '}
              {filteredProducts.length}{' '}
              rezultata za &quot;
              {searchTerm}&quot;
            </p>
          )}

          {(selectedCategory !== 'all' ||
            searchTerm) && (
            <button
              type="button"
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Poništi filtere
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              🔍
            </div>

            <p className="empty-state-text">
              {searchTerm
                ? `Nema rezultata za "${searchTerm}". Pokušajte s drugim nazivom.`
                : 'Trenutno nema proizvoda u ovoj kategoriji.'}
            </p>

            {(selectedCategory !== 'all' ||
              searchTerm) && (
              <button
                type="button"
                onClick={clearFilters}
                className="empty-state-btn"
              >
                Pogledaj sve proizvode
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;