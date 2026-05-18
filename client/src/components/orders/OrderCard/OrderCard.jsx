import "./OrderCard.css";

const statusNames = {
  created: "Создан",
  in_progress: "В работе",
  completed: "Выполнен",
  cancelled: "Отменен",
};

const OrderCard = ({ order, onOpen }) => {
  const date = new Date(order.createdAt).toLocaleDateString();

  return (
    <div className="order-card" onClick={onOpen}>
      <div className="order-card-info">
        <span className="order-date">{date}</span>
        <h4 className="order-product-title">{order.productId?.title}</h4>
        <p className="order-price">{order.productId?.price} ₽</p>
      </div>
      <div className={`order-status status-${order.status}`}>
        {statusNames[order.status]}
      </div>
    </div>
  );
};

export default OrderCard;
