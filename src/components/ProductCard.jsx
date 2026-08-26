import { Link } from 'react-router-dom';
import '../styles/ProductCard.css';

function ProductCard({ product }) {
  const categoryLabels = {
    ukrasi: 'Ukras',
    igracke: 'Igračka',
    pokloni: 'Poklon',
    po_narudzbi: 'Narudžba'
  };

  const categoryColors = {
    ukrasi: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    igracke: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    pokloni: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
    po_narudzbi: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  };

  return (
    <div className="product-card">
      <div className="product-card-image-wrapper">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-card-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <span 
          className="product-card-badge"
          style={{ background: categoryColors[product.category] || categoryColors.ukrasi }}
        >
          {categoryLabels[product.category] || 'Proizvod'}
        </span>
      </div>
      <div className="product-card-content">
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-description">{product.description}</p>
        <div className="product-card-dimensions">
          <span className="product-card-dimensions-icon">📐</span>
          <span>{product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm</span>
        </div>
        <p className="product-card-price">{product.price} KM</p>
        <Link 
          to={`/product/${product.id}`}
          className="product-card-button"
        >
          Pogledaj detalje
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;