import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import ProductCard from '../components/ProductCard';
import '../styles/Header.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsList);
        setFilteredProducts(productsList);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products when search or category changes
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const categories = [
  { id: 'all', name: 'Svi proizvodi', icon: '🛍️', count: products.length },
  { id: 'ukrasi', name: 'Kućni ukrasi', icon: '🏠', count: products.filter(p => p.category === 'ukrasi').length },
  { id: 'igracke', name: 'Igračke', icon: '🎮', count: products.filter(p => p.category === 'igracke').length },
  { id: 'pokloni', name: 'Pokloni i dodaci', icon: '🎁', count: products.filter(p => p.category === 'pokloni').length },
  { id: 'po_narudzbi', name: 'Po narudžbi', icon: '✨', count: products.filter(p => p.category === 'po_narudzbi').length },
];

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    // Smooth scroll to products
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Učitavanje proizvoda...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <h1 className="hero-title">3D Print Shop</h1>
          <p className="hero-subtitle">
            Unikatni kućni ukrasi i igračke kreirani s ljubavlju. 
            Svaki proizvod je priča za sebe.
          </p>
          <a href="#products" className="hero-cta">
            Pogledaj ponudu
          </a>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Pretraži proizvode po imenu ili opisu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="search-clear"
                aria-label="Clear search"
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
          <h2 className="categories-title">Kategorije</h2>
          <div className="categories-grid">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className={`category-card ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <div className="category-icon">{cat.icon}</div>
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-count">{cat.count} proizvoda</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="container">
        <div className="products-header">
          <h1 className="products-title">
            {selectedCategory === 'all' ? 'Svi proizvodi' : categories.find(c => c.id === selectedCategory)?.name}
          </h1>
          {searchTerm && (
            <p className="search-results-info">
              Pronađeno {filteredProducts.length} rezultata za "{searchTerm}"
            </p>
          )}
          {(selectedCategory !== 'all' || searchTerm) && (
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="clear-filters-btn"
            >
              Poništi filtere
            </button>
          )}
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p className="empty-state-text">
              {searchTerm 
                ? `Nema rezultata za "${searchTerm}". Pokušajte s drugim nazivom.`
                : 'Trenutno nema proizvoda u ovoj kategoriji.'
              }
            </p>
            {(selectedCategory !== 'all' || searchTerm) && (
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="empty-state-btn"
              >
                Pogledaj sve proizvode
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;