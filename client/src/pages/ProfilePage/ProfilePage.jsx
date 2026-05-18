import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Профиль</h1>
        <div className="profile-info">
          <p><strong>Имя:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Роль:</strong> {user.role === 'master' ? 'Мастер' : 'Покупатель'}</p>
        </div>
        <div className="orders-section">
          <h2>Заказы</h2>
          <p>Здесь будет список заказов</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
