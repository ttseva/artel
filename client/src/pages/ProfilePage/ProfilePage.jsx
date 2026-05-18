import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { orderAPI, productAPI } from "../../api/api";
import OrderList from "../../components/orders/OrderList/OrderList";
import MasterProducts from "../../components/products/MasterProducts/MasterProducts";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, isAuthenticated, isMaster } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

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
          const userId = user.id || user._id;
          const filteredProducts = productsRes.data.filter(
            (product) =>
              String(product.masterId?._id || product.masterId) ===
              String(userId),
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
  }, [isAuthenticated, navigate, isMaster, user]);

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
                <MasterProducts
                  products={myProducts}
                  onProductsChange={setMyProducts}
                />
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
