import { useEffect, useState } from 'react';
import { orderAPI } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import Chat from '../../chat/Chat/Chat';
import './OrderModal.css';

const statusNames = {
  created: 'Создан',
  in_progress: 'В работе',
  completed: 'Выполнен',
  cancelled: 'Отменен'
};

const OrderModal = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isMaster } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getById(orderId);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      alert('Не удалось изменить статус');
    }
  };

  if (loading) return (
    <div className="modal-bg">
      <div className="order-modal">
        <p>Загрузка...</p>
      </div>
    </div>
  );

  if (!order) return null;

  return (
    <div className="modal-bg">
      <div className="order-modal">
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="order-modal-grid">
          <div className="order-details">
            <h2>Заказ от {new Date(order.createdAt).toLocaleDateString()}</h2>
            <div className="order-product-preview">
              <img src={order.productId?.image} alt="" />
              <div>
                <h4>{order.productId?.title}</h4>
                <p>{order.productId?.price} ₽</p>
              </div>
            </div>

            <div className="order-meta">
              <p><strong>Статус:</strong> {statusNames[order.status]}</p>
              <p><strong>Покупатель:</strong> {order.buyerId?.name}</p>
              <p><strong>Мастер:</strong> {order.masterId?.name}</p>
              {order.comment && (
                <p><strong>Комментарий:</strong><br/>{order.comment}</p>
              )}
            </div>

            {isMaster && (
              <div className="status-controls">
                <p><strong>Изменить статус:</strong></p>
                <div className="status-buttons">
                  <button onClick={() => handleStatusChange('in_progress')}>В работу</button>
                  <button onClick={() => handleStatusChange('completed')}>Выполнен</button>
                  <button onClick={() => handleStatusChange('cancelled')}>Отменен</button>
                </div>
              </div>
            )}
          </div>

          <div className="order-chat-container">
            <h3>Чат по заказу</h3>
            <Chat orderId={orderId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
