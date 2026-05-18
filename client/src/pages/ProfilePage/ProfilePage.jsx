import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { orderAPI, productAPI } from "../../api/api";
import OrderList from "../../components/orders/OrderList/OrderList";
import ProductCard from "../../components/products/ProductCard/ProductCard";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, isAuthenticated, isMaster } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        const ordersRes = await orderAPI.getAll();
        setOrders(ordersRes.data);

        if (isMaster) {
          const productsRes = await productAPI.getAll();
          const filteredProducts = productsRes.data.filter(
            (p) => (p.masterId._id || p.masterId) === user.id,
          );
          setMyProducts(filteredProducts);
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, isMaster, user.id]);

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Личный кабинет</h1>

        <div className="profile-grid">
          <div className="profile-sidebar">
            <div className="profile-info">
              <h3>Мои данные</h3>
              <p>
                <strong>Имя:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Роль:</strong>{" "}
                {user.role === "master" ? "Мастер" : "Покупатель"}
              </p>
            </div>

            {isMaster && (
              <div className="my-products-section">
                <h3>Мои изделия</h3>
                <div className="mini-products-list">
                  {myProducts.length > 0 ? (
                    myProducts.map((product) => (
                      <div key={product._id} className="mini-product-item">
                        <span>{product.title}</span>
                        <span>{product.price} ₽</span>
                      </div>
                    ))
                  ) : (
                    <p>У вас пока нет изделий</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="profile-main">
            <div className="orders-section">
              <h2>Заказы</h2>
              {loading ? (
                <p>Загрузка заказов...</p>
              ) : (
                <OrderList orders={orders} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
