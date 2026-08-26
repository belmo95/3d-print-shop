import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, 'products', id);
        const productDoc = await getDoc(productRef);
        
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Učitavanje...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found">
        <h1 className="not-found-title">Proizvod nije pronađen</h1>
        <a href="/" className="not-found-link">
          Vrati se na početnu
        </a>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="product-detail">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-detail-image"
        />
        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-description">{product.description}</p>
          <div className="product-detail-dimensions">
            <p className="product-detail-dimensions-label">Dimenzije:</p>
            <p>{product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm</p>
          </div>
          <p className="product-detail-price">{product.price} KM</p>
          <button 
            onClick={() => navigate('/checkout', { state: { product } })}
            className="product-detail-button"
          >
            Naruči odmah
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;