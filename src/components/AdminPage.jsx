import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getThreadById } from '../services/threadService';
import { auth } from '../config/firebase';

function AdminPage() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return <div>You are not the admin of this thread</div>;
  }

  return (
    <div>
      <h1>Admin Page for Thread: {thread.title}</h1>
      {/* 管理者用の機能をここに追加 */}
    </div>
  );
}

export default AdminPage;
