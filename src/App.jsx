import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Home from './components/Home/Home';
import Thread from './components/Thread/Thread';
import ThreadDetail from './components/Thread/ThreadDetail';
import AdminPage from './components/Admin/AdminPage';
import ProfileMasonry from './components/Profile/ProfileMasonry';
import ProfileEdit from './components/Profile/ProfileEdit';
import { AlertProvider } from './context/AlertContext';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/Routes/PrivateRoute';
import { AdminRoute } from './components/Admin/AdminRoute';
import Layout from './components/UI/Layout';

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ['/signin', '/signup'];

  return (
    <AuthProvider>
      <AlertProvider>
        {!hideHeaderRoutes.includes(location.pathname) ? (
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/thread"
                element={
                  <PrivateRoute>
                    <Thread />
                  </PrivateRoute>
                }
              />
              <Route
                path="/thread/:id"
                element={
                  <PrivateRoute>
                    <ThreadDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/:id"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfileMasonry />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <PrivateRoute>
                    <ProfileEdit />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        )}
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
