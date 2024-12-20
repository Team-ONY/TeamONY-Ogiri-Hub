import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getThreadById } from '../../services/threadService';
import { useAlert } from '../../hooks/useAlert';

export const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [isAdmin, setIsAdmin] = useState(null);
  const threadId = location.pathname.split('/')[2];

  useEffect(() => {
    const checkThreadAdmin = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      try {
        const threadData = await getThreadById(threadId);

        if (threadData && threadData.createdBy === currentUser.uid) {
          setIsAdmin(true);
        } else {
          showAlert('このスレッドの管理者権限がありません');
          navigate(`/thread/${threadId}`);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('スレッド管理者チェックエラー:', error);
        showAlert('権限の確認中にエラーが発生しました。');
        setIsAdmin(false);
      }
    };

    checkThreadAdmin();
  }, [currentUser, threadId, showAlert, navigate]);

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to={`/thread/${threadId}`} replace />;
  }

  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
