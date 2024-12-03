import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { VStack, Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { auth } from '../../config/firebase';
import { useThreadData } from './hooks/useThreadData';
import { useComments } from './hooks/useComments';
import { ThreadHeader } from './ThreadHeader';
import { CommentSection } from './CommentSection';
import { ParticipantsList } from './ParticipantsList';
import { useAlert } from '../../hooks/useAlert';
import CreateOgiriButton from './Ogiri/CreateOgiriButton';
import CreateOgiriEventModal from './Ogiri/CreateOgiriEventModal';

function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const commentsEndRef = useRef(null);
  const { showAlert } = useAlert();
  const currentUser = auth.currentUser;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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

  // スレッドデータ取得後のコメント初期化を確認
  useEffect(() => {
    if (thread?.comments && !displayedComments.length) {
      const sortedComments = [...thread.comments].sort(
        (a, b) =>
          b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      );
      const initialComments = sortedComments.slice(0, 20).map((comment) => ({
        ...comment,
        uniqueKey: `${comment.id}-initial`,
      }));

      setDisplayedComments(initialComments);
      setHasMoreComments(thread.comments.length > 20);
      setIsLoadingComments(false);
    }
  }, [
    thread,
    displayedComments.length,
    setDisplayedComments,
    setHasMoreComments,
    setIsLoadingComments,
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
      {/* メインコンテンツ */}
      <Box flex="1">
        <VStack spacing={6} align="stretch">
          <ThreadHeader
            thread={{
              ...thread,
              comments: thread?.comments || [],
            }}
            threadCreator={threadCreator}
            currentUser={currentUser}
            onAdminClick={handleGoToAdminPage}
            onSubmit={handleAddComment}
            error={error}
          />
          <CommentSection
            comments={displayedComments}
            isLoading={isLoadingComments}
            hasMore={hasMoreComments}
            onDelete={handleDeleteComment}
            user={currentUser}
            thread={thread}
            onLoadMore={loadMoreComments}
          />
          <CreateOgiriButton onOpen={handleOpenModal} />
          <CreateOgiriEventModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
          <Box ref={commentsEndRef} />
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
