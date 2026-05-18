import { useState } from "react";
import { productAPI } from "../../../api/api";
import "./MasterProducts.css";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  image: "https://placehold.co/300x400",
  category: "decor",
};

const categoryNames = {
  jewelry: "Украшения",
  decor: "Декор",
  clothing: "Одежда",
  accessories: "Аксессуары",
};

const MasterProducts = ({ products, onProductsChange }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProduct(null);
    setShowForm(false);
    setError("");
  };

  const handleCreateClick = () => {
    setFormData(emptyForm);
    setEditingProduct(null);
    setShowForm(true);
    setError("");
  };

  const handleEditClick = (product) => {
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    setEditingProduct(product);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const productData = {
      ...formData,
      price: Number(formData.price),
    };

    try {
      if (editingProduct) {
        const response = await productAPI.update(editingProduct._id, productData);
        onProductsChange(
          products.map((product) =>
            product._id === editingProduct._id ? response.data : product,
          ),
        );
      } else {
        const response = await productAPI.create(productData);
        onProductsChange([response.data, ...products]);
      }

      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось сохранить изделие");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Удалить изделие?");
    if (!confirmed) {
      return;
    }

    try {
      await productAPI.delete(productId);
      onProductsChange(products.filter((product) => product._id !== productId));
    } catch (err) {
      alert(err.response?.data?.message || "Не удалось удалить изделие");
    }
  };

  return (
    <div className="master-products">
      <div className="master-products-header">
        <h3>Мои изделия</h3>
        <button type="button" onClick={handleCreateClick}>
          Добавить
        </button>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Название"
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Описание"
            rows="4"
            required
          />

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Цена"
            min="0"
            required
          />

          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Ссылка на изображение"
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="decor">Декор</option>
            <option value="jewelry">Украшения</option>
            <option value="clothing">Одежда</option>
            <option value="accessories">Аксессуары</option>
          </select>

          {error && <p className="product-form-error">{error}</p>}

          <div className="product-form-buttons">
            <button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
            <button type="button" onClick={resetForm}>
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="master-products-list">
        {products.length === 0 ? (
          <p>У вас пока нет изделий</p>
        ) : (
          products.map((product) => (
            <div className="master-product-item" key={product._id}>
              <img src={product.image} alt={product.title} />
              <div className="master-product-info">
                <h4>{product.title}</h4>
                <p>{categoryNames[product.category]}</p>
                <strong>{product.price} ₽</strong>
              </div>
              <div className="master-product-buttons">
                <button type="button" onClick={() => handleEditClick(product)}>
                  Изменить
                </button>
                <button type="button" onClick={() => handleDelete(product._id)}>
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MasterProducts;
