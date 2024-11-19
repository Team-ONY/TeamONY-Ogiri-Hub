import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/UI/Header';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Home from './components/Home/Home';
import Thread from './components/Thread/Thread';
import ThreadDetail from './components/Thread/ThreadDetail';
import CreateThread from './components/Thread/CreateThread';
import AdminPage from './components/Admin/AdminPage';
import ProfileMasonry from './components/Profile/ProfileMasonry';
import ProfileEdit from './components/Profile/ProfileEdit';
import { AlertProvider } from './context/AlertContext';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/Routes/PrivateRoute';
import { AdminRoute } from './components/Admin/AdminRoute';

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ['/signin', '/signup'];

  return (
    <>
      <AuthProvider>
        {!hideHeaderRoutes.includes(location.pathname) && <Header />}
        <AlertProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/signin" />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
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
              path="/create-thread"
              element={
                <PrivateRoute>
                  <CreateThread />
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
        </AlertProvider>
      </AuthProvider>
    </>
  );
}

export default App;
