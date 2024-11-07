import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/ui/Header';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Home from './components/Home';
import Profile from './components/Profile';
import Thread from './components/Thread';

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ['/signin', '/signup'];

  return (
    <>
      <div className="gradient-overlay" />
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/thread" element={<Thread />} />
      </Routes>
    </>
  );
}

export default App;
