import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  VStack,
  Box,
  Flex,
  Spinner,
  IconButton,
  Icon,
  Text,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { auth } from '../../config/firebase';
import { useThreadData } from './hooks/useThreadData';
import { useComments } from './hooks/useComments';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import { ThreadHeader } from './ThreadHeader';
import { CommentSection } from './CommentSection';
import { CommentInput } from './CommentSection/CommentInput';
import { useAlert } from '../../hooks/useAlert';

const MotionBox = motion(Box);

function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const commentsEndRef = useRef(null);
  const { showAlert } = useAlert();
  const currentUser = auth.currentUser;

  // ViewType の設定
  const currentViewType = location.pathname.includes('/admin/')
    ? 'admin'
    : 'regular';

  // Custom Hooks
  const { thread, setThread, threadCreator, loadingThread } = useThreadData(
    id,
    currentUser,
    currentViewType
  );

  const {
    displayedComments,
    setDisplayedComments,
    hasMoreComments,
    setHasMoreComments,
    isLoadingComments,
    setIsLoadingComments,
    error,
    isNewCommentAdded,
    handleAddComment,
    handleDeleteComment,
  } = useComments(id, thread, setThread, currentUser);

  // スレッドデータ取得後のコメント初期化を確認
  useEffect(() => {
    if (thread?.comments) {
      const initialComments = thread.comments.slice(0, 20).map((comment) => ({
        ...comment,
        uniqueKey: `${comment.id}-initial`,
      }));

      console.log('Setting initial comments:', initialComments);

      setDisplayedComments(initialComments);
      setHasMoreComments(thread.comments.length > 20);
      setIsLoadingComments(false);
    }
  }, [thread]);

  // ユーザー情報のログを追加
  useEffect(() => {
    console.log('Current User:', currentUser);
    console.log('thread: ', thread);
    console.log('threadCreator: ', threadCreator);
  }, [currentUser, thread, threadCreator]);

  // Infinite Scroll の設定
  const loadMoreComments = () => {
    if (!thread?.comments) return;

    const startIndex = displayedComments.length;
    const endIndex = startIndex + 20;
    const nextBatch = thread.comments
      .slice(startIndex, endIndex)
      .map((comment) => ({
        ...comment,
        uniqueKey: `${comment.id}-${startIndex}`,
      }));

    if (nextBatch.length === 0) {
      setHasMoreComments(false);
      return;
    }

    setDisplayedComments((prev) => {
      const existingIds = new Set(prev.map((comment) => comment.id));
      const newComments = nextBatch.filter(
        (comment) => !existingIds.has(comment.id)
      );

      const allComments = [...prev, ...newComments];
      return allComments.sort(
        (a, b) =>
          a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
      );
    });
  };

  useInfiniteScroll(loadMoreComments, {
    hasMoreComments,
    displayedComments,
  });

  // 新しいコメントが追加された時のスクロール処理
  useEffect(() => {
    if (isNewCommentAdded && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isNewCommentAdded]);

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
    <>
      <VStack spacing={6} align="stretch" mt={20} pb={20}>
        <MotionBox
          position="fixed"
          top="100px"
          left={6}
          zIndex={20}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <IconButton
            icon={<Icon as={FaArrowLeft} />}
            onClick={() => navigate('/thread')}
            bg="linear-gradient(135deg, #FF1988 0%, #805AD5 100%)"
            color="white"
            size="lg"
            borderRadius="full"
            aria-label="Back to threads"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 15px -3px rgba(255, 25, 136, 0.3)',
              bg: 'linear-gradient(135deg, #FF1988 20%, #6B46C1 120%)',
            }}
            _active={{ transform: 'scale(0.95)' }}
          />
        </MotionBox>

        <ThreadHeader
          thread={thread}
          threadCreator={threadCreator}
          currentUser={currentUser}
          onAdminClick={handleGoToAdminPage}
        />

        <CommentSection
          comments={displayedComments}
          isLoading={isLoadingComments}
          hasMore={hasMoreComments}
          onDelete={handleDeleteComment}
          user={currentUser}
          thread={thread}
        />

        <Box ref={commentsEndRef} />
      </VStack>

      <CommentInput
        user={currentUser}
        onSubmit={handleAddComment}
        error={error}
      />
    </>
  );
}

export default ThreadDetail;
