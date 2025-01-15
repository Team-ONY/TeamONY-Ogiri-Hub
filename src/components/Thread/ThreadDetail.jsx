import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { VStack, Box, Flex, Spinner, Text, Button } from '@chakra-ui/react';
import { auth } from '../../config/firebase';
import { useThreadData } from './hooks/useThreadData';
import { useComments } from './hooks/useComments';
import { ThreadHeader } from './ThreadHeader';
import { ParticipantsList } from './ParticipantsList';
import { useAlert } from '../../hooks/useAlert';
import CreateOgiriButton from './Ogiri/CreateOgiriButton';
import CreateOgiriEventModal from './Ogiri/CreateOgiriEventModal';
import OgiriEvent from './Ogiri/OgiriEvent';
import { CommentItem } from './Comments/CommentItem';
import {
  createOgiriEvent,
  joinOgiriEvent,
  leaveOgiriEvent,
  cleanupOldEvents,
} from '../../services/ogiriService';
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();
  const currentUser = auth.currentUser;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ogiriEvents, setOgiriEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [combinedContent, setCombinedContent] = useState([]);

  // ViewType の設定
  const currentViewType = location.pathname.includes('/admin/')
    ? 'admin'
    : 'regular';

  // Custom Hooks
  const {
    thread,
    setThread,
    threadCreator,
    participantDetails,
    loadingThread,
  } = useThreadData(id, currentUser, currentViewType);

  const {
    displayedComments,
    setDisplayedComments,
    hasMoreComments,
    setHasMoreComments,
    isLoadingComments,
    setIsLoadingComments,
    error,
    handleAddComment,
    handleDeleteComment,
  } = useComments(id, thread, setThread, currentUser);

  // スレッドとコメントのリアルタイム監視
  useEffect(() => {
    if (!id) return;

    const threadRef = doc(db, 'threads', id);
    const unsubscribe = onSnapshot(
      threadRef,
      (doc) => {
        if (doc.exists()) {
          const threadData = doc.data();
          setThread({
            id: doc.id,
            ...threadData,
          });

          if (threadData.comments) {
            const sortedComments = [...threadData.comments].sort(
              (a, b) =>
                b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
            );
            const initialComments = sortedComments
              .slice(0, 20)
              .map((comment) => ({
                ...comment,
                uniqueKey: `${comment.id}-${Date.now()}`,
              }));
            setDisplayedComments(initialComments);
            setHasMoreComments(threadData.comments.length > 20);
            setIsLoadingComments(false);
          }
        }
      },
      (error) => {
        console.error('Error listening to thread:', error);
        showAlert('スレッドの監視中にエラーが発生しました', 'error');
      }
    );

    return () => unsubscribe();
  }, [
    id,
    showAlert,
    setDisplayedComments,
    setHasMoreComments,
    setIsLoadingComments,
    setThread,
  ]);

  // Infinite Scroll の設定
  const loadMoreComments = () => {
    if (!thread?.comments || isLoadingComments) {
      console.log('Loading prevented: ', {
        hasComments: !!thread?.comments,
        isLoadingComments,
      });
      return;
    }

    console.log('Loading more comments...');
    setIsLoadingComments(true);

    try {
      const startIndex = displayedComments.length;
      const endIndex = startIndex + 20;

      const sortedComments = [...thread.comments].sort(
        (a, b) =>
          b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      );

      console.log('Total comments:', sortedComments.length);
      console.log('Loading from index:', startIndex, 'to', endIndex);

      const nextBatch = sortedComments
        .slice(startIndex, endIndex)
        .map((comment) => ({
          ...comment,
          uniqueKey: `${comment.id}-${Date.now()}`,
        }));

      if (nextBatch.length === 0) {
        console.log('No more comments to load');
        setHasMoreComments(false);
        setIsLoadingComments(false);
        return;
      }

      setDisplayedComments((prev) => [...prev, ...nextBatch]);
      setHasMoreComments(sortedComments.length > endIndex);
    } catch (error) {
      console.error('Error loading more comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleGoToAdminPage = () => {
    if (!thread || !currentUser) return;

    if (thread.createdBy !== currentUser.uid) {
      showAlert('管理者権限がありません。', 'error');
      return;
    }

    navigate(`/admin/${id}`);
  };

  const handleCreateEvent = async (newEvent) => {
    if (newEvent && currentUser) {
      try {
        const eventData = {
          ...newEvent,
          createdAt: new Date(),
          createdBy: currentUser.uid,
        };

        const createdEvent = await createOgiriEvent(
          id,
          eventData,
          currentUser.uid
        );

        const processedEvent = {
          ...createdEvent,
          createdAt:
            createdEvent.createdAt?.toDate?.() ||
            new Date(createdEvent.createdAt),
        };

        setOgiriEvents((prev) => [...prev, processedEvent]);
        setIsModalOpen(false);
        showAlert('大喜利イベントを作成しました', 'success');
      } catch (error) {
        console.error('Error creating ogiri event:', error);
        showAlert('大喜利イベントの作成に失敗しました', 'error');
      }
    }
  };

  const handleJoinEvent = async (eventId) => {
    if (!currentUser) {
      showAlert('ログインが必要です', 'error');
      return;
    }

    const event = ogiriEvents.find((e) => e.id === eventId);
    if (!event) return;

    const isParticipating = event.participants?.includes(currentUser.uid);

    try {
      if (isParticipating) {
        await leaveOgiriEvent(id, eventId, currentUser.uid);
        showAlert('大喜利イベントから退出しました', 'info');
      } else {
        await joinOgiriEvent(id, eventId, currentUser.uid);
        showAlert('大喜利イベントに参加しました', 'success');
      }
    } catch (error) {
      console.error('Error toggling event participation:', error);
      showAlert('操作に失敗しました', 'error');
    }
  };

  // 大喜利イベントのリアルタイム監視
  useEffect(() => {
    if (!id) return;

    const eventsRef = collection(db, 'threads', id, 'ogiriEvents');
    const q = query(eventsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        // 古いイベントのクリーンアップを条件付きで実行
        if (snapshot.docChanges().some((change) => change.type === 'added')) {
          // 新しいイベントが追加された時のみクリーンアップを実行
          await cleanupOldEvents(id);
        }

        const eventsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const eventData = docSnapshot.data();
            let creator = null;

            try {
              if (eventData.createdBy) {
                const userRef = doc(db, 'users', eventData.createdBy);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  creator = {
                    uid: eventData.createdBy,
                    ...userSnap.data(),
                  };
                }
              }

              return {
                id: docSnapshot.id,
                ...eventData,
                createdAt:
                  eventData.createdAt?.toDate?.() ||
                  new Date(eventData.createdAt),
                creator: creator || {
                  uid: eventData.createdBy,
                  username: '不明なユーザー',
                  photoURL: null,
                },
              };
            } catch (error) {
              console.error('Error processing event:', error);
              return null;
            }
          })
        );

        // nullの要素を除外し、重複を防ぐ
        const validEvents = eventsData
          .filter((event) => event !== null)
          .reduce((acc, event) => {
            if (!acc.some((e) => e.id === event.id)) {
              acc.push(event);
            }
            return acc;
          }, []);

        setOgiriEvents(validEvents);
        setLoadingEvents(false);
      } catch (error) {
        console.error('Error processing events:', error);
        showAlert('イベントの処理中にエラーが発生しました', 'error');
        setLoadingEvents(false);
      }
    });

    return () => unsubscribe();
  }, [id, showAlert]);

  // 大喜利イベントとコメントを統合するuseEffect
  useEffect(() => {
    if (!thread?.comments || !ogiriEvents) return;

    const combined = [
      ...thread.comments.map((comment) => ({
        ...comment,
        type: 'comment',
        timestamp: comment.createdAt.toDate().getTime(),
      })),
      ...ogiriEvents.map((event) => ({
        ...event,
        type: 'ogiriEvent',
        timestamp: event.createdAt.getTime(),
      })),
    ].sort((a, b) => b.timestamp - a.timestamp);

    setCombinedContent(combined);
  }, [thread?.comments, ogiriEvents]);

  if (loadingThread) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="pink.400" />
      </Flex>
    );
  }

  if (!thread) {
    return (
      <VStack spacing={6} align="stretch" mt={20} pb={20}>
        <Text color="white" textAlign="center">
          スレッドが見つかりませんでした。
        </Text>
      </VStack>
    );
  }

  return (
    <Flex
      maxW="1400px"
      mx="auto"
      px={4}
      gap={8}
      mt={10}
      pb={20}
      position="relative"
    >
      <Box flex="1">
        <VStack spacing={6} align="stretch">
          <ThreadHeader
            thread={thread}
            threadCreator={threadCreator}
            currentUser={currentUser}
            onAdminClick={handleGoToAdminPage}
            onSubmit={handleAddComment}
            error={error}
          />

          {/* ローディング状態の表示 */}
          {loadingEvents ? (
            <Flex justify="center" py={8}>
              <Spinner size="xl" color="pink.400" />
            </Flex>
          ) : (
            combinedContent.map((item) =>
              item.type === 'ogiriEvent' ? (
                <OgiriEvent
                  key={`event-${item.id}`}
                  event={{ ...item, threadId: id }}
                  creator={item.creator}
                  onJoinEvent={() => handleJoinEvent(item.id)}
                  currentUser={currentUser}
                  thread={thread}
                />
              ) : (
                <CommentItem
                  key={`comment-${item.uniqueKey || item.id}`}
                  comment={item}
                  isAdmin={item.isAdmin}
                  onDelete={handleDeleteComment}
                  user={currentUser}
                  thread={thread}
                />
              )
            )
          )}

          {/* 無限スクロール用のボタン */}
          {hasMoreComments && (
            <Button
              onClick={loadMoreComments}
              isLoading={isLoadingComments}
              // ... 既存のスタイル
            >
              もっと見る
            </Button>
          )}

          <CreateOgiriButton onOpen={() => setIsModalOpen(true)} />
          <CreateOgiriEventModal
            isOpen={isModalOpen}
            onClose={(newEvent) => {
              if (newEvent) {
                handleCreateEvent(newEvent);
              } else {
                setIsModalOpen(false);
              }
            }}
          />
        </VStack>
      </Box>

      {/* 参加者リスト */}
      <Box
        position="sticky"
        top="20px"
        height="fit-content"
        display={{ base: 'none', xl: 'block' }}
      >
        {thread?.participants && participantDetails && (
          <ParticipantsList
            participants={thread.participants
              .filter((participantId) => participantDetails[participantId])
              .map((participantId) => ({
                uid: participantId,
                displayName:
                  participantDetails[participantId]?.username ||
                  '読み込み中...',
                photoURL: participantDetails[participantId]?.photoURL || null,
              }))}
            threadCreatorId={thread.createdBy}
          />
        )}
      </Box>
    </Flex>
  );
}

export default ThreadDetail;
