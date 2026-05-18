import { useEffect, useState } from 'react';
import { productAPI } from '../../api/api';
import ProductCard from '../../components/products/ProductCard/ProductCard';
import ProductModal from '../../components/products/ProductModal/ProductModal';
import './MainPage.css';

const MainPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productAPI.getAll();
        setProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Не удалось загрузить каталог');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="main-page">
      <div className="container">
        <h1>Каталог изделий</h1>

        {loading && <p>Загрузка каталога...</p>}
        {error && <p className="catalog-error">{error}</p>}

        {!loading && !error && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOpen={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default MainPage;
