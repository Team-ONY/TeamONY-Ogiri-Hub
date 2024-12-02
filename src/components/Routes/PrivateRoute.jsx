import { Navigate } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

export const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [currentUser]);

  if (loading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
