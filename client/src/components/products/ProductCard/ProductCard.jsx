import './ProductCard.css';

const categoryNames = {
  jewelry: 'Украшения',
  decor: 'Декор',
  clothing: 'Одежда',
  accessories: 'Аксессуары',
};

const ProductCard = ({ product, onOpen }) => {
  return (
    <div className="product-card" onClick={() => onOpen(product)}>
      <img className="product-card-image" src={product.image} alt={product.title} />

      <div className="product-card-body">
        <p className="product-card-category">
          {categoryNames[product.category] || product.category}
        </p>
        <h3>{product.title}</h3>
        <p className="product-card-master">
          Мастер: {product.masterId?.name}
        </p>
        <p className="product-card-description">{product.description}</p>
        <p className="product-card-price">{product.price} ₽</p>
      </div>
    </div>
  );
};

export default ProductCard;
