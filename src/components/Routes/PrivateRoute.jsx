import { Navigate, useLocation } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { useAuth } from '../../context/AuthContext';

export const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
