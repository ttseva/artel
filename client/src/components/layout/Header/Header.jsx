import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          Артель
        </Link>

        <nav className="header-nav">
          <Link to="/" className="nav-link">
            Каталог
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/user/me" className="nav-link">
                Профиль
              </Link>
              <button onClick={handleLogout} className="nav-button">
                Выход
              </button>
              <span className="user-info">
                {user?.name} ({user?.role === 'master' ? 'Мастер' : 'Покупатель'})
              </span>
            </>
          ) : (
            <Link to="/auth" className="nav-link">
              Вход
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
