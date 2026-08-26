import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    dimensions: { length: '', width: '', height: '' },
    category: 'ukrasi',
    image: null,
    imagePreview: null
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (username === 'Belmo' && password === 'Elmedin.1') {
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
      } else {
        setError('Pogrešan username ili password! Niste admin.');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
      setLoading(false);
    }, 500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductData({ 
        ...productData, 
        image: file,
        imagePreview: reader.result 
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!productData.image) return null;

    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${productData.image.name}`);
      await uploadBytes(storageRef, productData.image);
      const imageUrl = await getDownloadURL(storageRef);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Greška prilikom uploada slike: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const imageUrl = await handleImageUpload();
      if (!imageUrl) {
        alert('Greška prilikom uploada slike');
        setSubmitting(false);
        return;
      }

      const product = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        dimensions: {
          length: parseFloat(productData.dimensions.length),
          width: parseFloat(productData.dimensions.width),
          height: parseFloat(productData.dimensions.height)
        },
        category: productData.category,
        image: imageUrl,
        createdAt: new Date().toISOString()
      };

      const productsRef = collection(db, 'products');
      const docRef = await addDoc(productsRef, product);

      alert('Proizvod uspješno dodan!');
      
      setProductData({
        name: '',
        description: '',
        price: '',
        dimensions: { length: '', width: '', height: '' },
        category: 'ukrasi',
        image: null,
        imagePreview: null
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Greška prilikom dodavanja proizvoda: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Login forma
  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="login-page">
          <div className="login-page-content">
            <h1 className="login-page-title">🔐 Admin Panel</h1>
            <p className="login-page-subtitle">Pristup dozvoljen samo administratorima</p>
            
            <form onSubmit={handleLogin} className="login-page-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="Unesite username"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Unesite password"
                  required
                />
              </div>

              {error && (
                <div className="login-error">
                  ⚠️ {error}
                </div>
              )}

              <button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Provjera...' : 'Prijava'}
              </button>
            </form>

            <p className="login-page-footer">
              <a href="/" className="back-link">← Nazad na početnu</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin panel nakon login
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin - Dodaj novi proizvod</h1>
        <button 
          onClick={() => {
            setIsAuthenticated(false);
            navigate('/');
          }}
          className="logout-button"
        >
          Odjava
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label className="form-label">Naziv proizvoda *</label>
          <input 
            type="text" 
            value={productData.name}
            onChange={(e) => setProductData({...productData, name: e.target.value})}
            className="form-input"
            placeholder="npr. Dekorativna vaza"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Opis *</label>
          <textarea 
            value={productData.description}
            onChange={(e) => setProductData({...productData, description: e.target.value})}
            className="form-textarea"
            rows="4"
            placeholder="Detaljan opis proizvoda..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cijena (KM) *</label>
          <input 
            type="number" 
            step="0.01"
            min="0"
            value={productData.price}
            onChange={(e) => setProductData({...productData, price: e.target.value})}
            className="form-input"
            placeholder="npr. 25.00"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Dimenzije (cm) *</label>
          <div className="form-grid-3">
            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#666' }}>Dužina</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                value={productData.dimensions.length}
                onChange={(e) => setProductData({...productData, dimensions: {...productData.dimensions, length: e.target.value}})}
                className="form-input"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#666' }}>Širina</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                value={productData.dimensions.width}
                onChange={(e) => setProductData({...productData, dimensions: {...productData.dimensions, width: e.target.value}})}
                className="form-input"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#666' }}>Visina</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                value={productData.dimensions.height}
                onChange={(e) => setProductData({...productData, dimensions: {...productData.dimensions, height: e.target.value}})}
                className="form-input"
                placeholder="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Kategorija</label>
          <select 
            value={productData.category}
            onChange={(e) => setProductData({...productData, category: e.target.value})}
            className="form-select"
          >
            <option value="ukrasi">Kućni ukrasi</option>
            <option value="igracke">Igračke</option>
            <option value="pokloni">Pokloni i dodaci</option>
            <option value="po_narudzbi">Po narudžbi</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Slika proizvoda *</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImageChange}
            className="form-input"
            required
          />
          {productData.imagePreview && (
            <div className="admin-image-preview">
              <p className="admin-image-preview-label">Preview:</p>
              <img 
                src={productData.imagePreview} 
                alt="Preview" 
                className="admin-image-preview-img"
              />
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={uploading || submitting || !productData.image}
          className="form-button"
        >
          {submitting ? 'Dodavanje...' : uploading ? 'Upload slike...' : 'Dodaj proizvod'}
        </button>
      </form>
    </div>
  );
}

export default Admin;