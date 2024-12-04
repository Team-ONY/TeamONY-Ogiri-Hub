import { useState, useEffect } from 'react';
import { getThreadById } from '../../../services/threadService';
import { getUserById } from '../../../services/userService';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../../hooks/useAlert';
import { checkThreadAccess } from '../../../utils/threadHelpers';

export const useThreadData = (threadId, currentUser, currentViewType) => {
  const [thread, setThread] = useState(null);
  const [threadCreator, setThreadCreator] = useState(null);
  const [participantDetails, setParticipantDetails] = useState([]);
  const [loadingThread, setLoadingThread] = useState(true);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchThreadData = async () => {
      if (!currentUser) return;

      try {
        const threadData = await getThreadById(threadId);
        if (!threadData) {
          showAlert('スレッドが見つかりませんでした。', 'error');
          navigate('/thread');
          return;
        }

        // アクセス権限のチェック
        const accessCheck = await checkThreadAccess(
          threadData,
          currentUser,
          currentViewType
        );
        if (!accessCheck.hasAccess) {
          showAlert(accessCheck.message, 'error');
          navigate(accessCheck.redirectPath);
          return;
        }

        const creatorData = await getUserById(threadData.createdBy);
        setThreadCreator(creatorData);

        // 参加者の情報を取得
        const participantsData = {};
        await Promise.all(
          threadData.participants.map(async (participantId) => {
            const userData = await getUserById(participantId);
            if (userData) {
              participantsData[participantId] = userData;
            }
          })
        );
        setParticipantDetails(participantsData);

        setThread(threadData);
      } catch (error) {
        console.error('Error fetching thread:', error);
        showAlert('スレッドの読み込み中にエラーが発生しました。', 'error');
        navigate('/thread');
      } finally {
        setLoadingThread(false);
      }
    };

    fetchThreadData();
  }, [threadId, currentUser, currentViewType, navigate, showAlert]);

  return {
    thread,
    setThread,
    threadCreator,
    participantDetails,
    loadingThread,
  };
};
