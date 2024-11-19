import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getThreadById } from '../../services/threadService';
import { auth } from '../../config/firebase';
import { useAlert } from '../../hooks/useAlert';

function AdminPage() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const threadData = await getThreadById(id);
        if (threadData) {
          setThread(threadData);
        }
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchThread();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!thread) {
    return <div>Thread not found</div>;
  }

  if (auth.currentUser.uid !== thread.createdBy) {
    showAlert('このスレッドの管理者権限がありません');
    return <div>権限がありません</div>;
  }

  return (
    <div>
      <h1>Admin Page for Thread: {thread.title}</h1>
      {/* 管理者用の機能をここに追加 */}
    </div>
  );
}

export default AdminPage;
