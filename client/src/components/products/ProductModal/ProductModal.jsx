import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import './ProductModal.css';

const ProductModal = ({ product, onClose }) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!product) {
    return null;
  }

  const handleOrder = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await orderAPI.create({
        productId: product._id,
        comment,
      });
      setComment('');
      setSuccess('Заказ оформлен');
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось оформить заказ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg">
      <div className="product-modal">
        <button className="modal-close" type="button" onClick={onClose}>
          ×
        </button>

        <img className="product-modal-image" src={product.image} alt={product.title} />

        <div className="product-modal-content">
          <h2>{product.title}</h2>
          <p className="product-modal-master">
            Мастер: {product.masterId?.name}
          </p>
          <p>{product.description}</p>
          <p className="product-modal-price">{product.price} ₽</p>

          <form className="order-form" onSubmit={handleOrder}>
            <label htmlFor="comment">
              Комментарий к заказу
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Например: эта ваза, но поменьше в высоте."
              rows="4"
            />

            {error && <p className="order-error">{error}</p>}
            {success && <p className="order-success">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Оформление...' : 'Оформить заказ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
