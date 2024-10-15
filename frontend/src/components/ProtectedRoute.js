import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {axiosInstance} from '../Api/api';

const ProtectedRoute = ({ element: Element, allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/roles/');
      setUserRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/auth/check/');
      setIsAuthenticated(response.data.isAuthenticated);
      if (response.data.isAuthenticated) {
        await fetchUserRoles();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [fetchUserRoles]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const isAllowed = !allowedRoles || allowedRoles.length === 0 || allowedRoles.some(role => userRoles.includes(role));

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return isAllowed ? <Element /> : <Navigate to="/not-authorized" />;
};

export default ProtectedRoute;
