import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/ui/Header';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Home from './components/Home';
import Thread from './components/Thread';
import ThreadDetail from './components/ThreadDetail';
import CreateThread from './components/CreateThread';
import AdminPage from './components/AdminPage';
import ProfileMasonry from './components/Profile/ProfileMasonry';
import ProfileEdit from './components/ProfileEdit';

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ['/signin', '/signup'];

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/thread" element={<Thread />} />
        <Route path="/thread/:id" element={<ThreadDetail />} />
        <Route path="/create-thread" element={<CreateThread />} />
        <Route path="/admin/:id" element={<AdminPage />} />
        <Route path="/profile" element={<ProfileMasonry />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
      </Routes>
    </>
  );
}

export default App;
