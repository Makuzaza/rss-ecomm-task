import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './Shop.css';

const Shop = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="shop-page">
      Shop Page
    </div>
  );
};

export default Shop;