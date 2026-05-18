import { useState } from "react";
import OrderCard from "../OrderCard/OrderCard";
import OrderModal from "../OrderModal/OrderModal";
import "./OrderList.css";

const OrderList = ({ orders }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (orders.length === 0) {
    return <p>Заказов пока нет</p>;
  }

  return (
    <div className="order-list">
      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          onOpen={() => setSelectedOrder(order)}
        />
      ))}

      {selectedOrder && (
        <OrderModal
          orderId={selectedOrder._id}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderList;
