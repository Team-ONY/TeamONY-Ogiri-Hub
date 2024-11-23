import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Text,
  VStack,
  Input,
  Button,
  Flex,
  Avatar,
  Icon,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { auth } from '../../config/firebase';
import {
  getThreadById,
  addCommentToThread,
  deleteCommentFromThread,
} from '../../services/threadService';
import { getUserById } from '../../services/userService';
import { FaCrown, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useAlert } from '../../hooks/useAlert';
import { PropTypes } from 'prop-types';
import { Timestamp } from 'firebase/firestore';
import throttle from 'lodash.throttle';

const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionButton = motion(Button);

const MemoizedCommentItem = memo(
  ({ comment, isAdmin, onDelete, user, thread, index }) => {
    return (
      <MotionBox
        data-comment-index={index}
        key={comment.id}
        p={4}
        bg="blackAlpha.400"
        borderRadius="xl"
        width="100%"
        style={{ boxSizing: 'border-box' }}
        mx="auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        mb={4}
      >
        <Flex
          align="center"
          mb={2}
          justifyContent="space-between"
          flexWrap="wrap"
          width="100%"
          style={{ boxSizing: 'border-box' }}
        >
          <Flex align="center" gap={2}>
            <Avatar
              name={comment.createdByUsername}
              src={comment.userPhotoURL}
              size="sm"
              mr={2}
              border={isAdmin ? '2px solid' : 'none'}
              borderColor="pink.400"
            />
            <Flex align="center" gap={2}>
              <Text color="gray.400" fontSize="sm">
                {comment.createdByUsername}
              </Text>
              {isAdmin && (
                <Icon
                  as={FaCrown}
                  color="pink.400"
                  w={3}
                  h={3}
                  title="スレッド管理者"
                />
              )}
              <Text color="gray.500" fontSize="xs">
                {new Date(comment.createdAt.toDate()).toLocaleString()}
              </Text>
            </Flex>
          </Flex>
          {/* 削除ボタン */}
          {user && user.uid === thread.createdBy && (
            <IconButton
              aria-label="Delete comment"
              icon={<Icon as={FaTrash} />}
              onClick={onDelete}
              colorScheme="red"
              variant="ghost"
              minWidth="30px"
            />
          )}
        </Flex>
        <Text color="gray.300" fontSize="md" pl={10}>
          {comment.text}
        </Text>
      </MotionBox>
    );
  }
);

MemoizedCommentItem.displayName = 'MemoizedCommentItem';
MemoizedCommentItem.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string,
    createdAt: PropTypes.object, // Timestamp型を想定
    createdBy: PropTypes.string,
    createdByUsername: PropTypes.string,
    userPhotoURL: PropTypes.string,
    isAdmin: PropTypes.bool,
  }).isRequired,
  isAdmin: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  user: PropTypes.object,
  thread: PropTypes.object,
  index: PropTypes.number.isRequired,
};

function ThreadDetail() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loadingThread, setLoadingThread] = useState(true);
  const navigate = useNavigate();
  const [threadCreator, setThreadCreator] = useState(null);
  const commentsEndRef = useRef(null);
  const { showAlert } = useAlert();
  const currentUser = auth.currentUser;
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [displayedComments, setDisplayedComments] = useState([]);
  const [commentsPerPage] = useState(20);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewCommentAdded, setIsNewCommentAdded] = useState(false);
  const [loadedPages, setLoadedPages] = useState(new Set());
  const [currentViewType, setCurrentViewType] = useState('regular');
  const location = useLocation();

  // --- useEffect hooks ---
  // 1. Auth state effect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoadingUser(false); // ユーザー情報読み込み完了
    });
    return () => unsubscribe();
  }, []);

  // 2. Thread access check effect
  useEffect(() => {
    const checkThreadAccess = async () => {
      if (isLoadingUser || !currentUser) {
        return;
      }

      try {
        const threadData = await getThreadById(id);
        if (!threadData) {
          showAlert('スレッドが見つかりませんでした。', 'error');
          navigate('/thread');
          return;
        }

        const isAdminView = location.pathname.includes('/admin/'); // location.pathname を使用して isAdminView を決定

        if (isAdminView) {
          // 管理者ビューの場合
          if (threadData.createdBy !== currentUser.uid) {
            showAlert('管理者権限がありません。', 'error');
            navigate(`/thread/${id}`); // 通常のスレッド詳細ページにリダイレクト
            return;
          }
        } else {
          // 通常ビューの場合
          const isParticipant = threadData.participants?.includes(
            currentUser.uid
          );
          if (!isParticipant && !isAdminView) {
            // isAdminView の場合、参加チェックをスキップ
            showAlert('このスレッドに参加する必要があります。', 'warning');
            navigate('/thread');
            return;
          }
        }

        setThread(threadData);
        setLoadingThread(false);
      } catch (error) {
        console.error('Error in checkThreadAccess:', error);
        showAlert('スレッドの読み込み中にエラーが発生しました。', 'error');
        setLoadingThread(false);
        navigate('/thread');
      }
    };

    checkThreadAccess();
  }, [id, currentUser, navigate, showAlert, isLoadingUser, location.pathname]);

  useEffect(() => {
    const path = window.location.pathname;
    const isAdminPath = path.includes('/admin/');
    setCurrentViewType(isAdminPath ? 'admin' : 'regular');
  }, []);

  useEffect(() => {
    if (location.state?.isAdmin) {
      setCurrentViewType('admin');
    }
  }, [location]);

  // 3. Thread details fetch effect
  useEffect(() => {
    let isMounted = true; // コンポーネントがマウントされているかどうかのフラグ
    const fetchThread = async () => {
      if (!isLoadingUser && !loadingThread && isMounted) {
        // isMounted をチェック
        setIsLoadingComments(true);
        try {
          const [threadData, commentsWithUsernames] = await Promise.all([
            getThreadById(id),
            getCommentsWithUserInfo(id),
          ]);

          if (threadData && isMounted) {
            // isMounted をチェック
            const creatorData = await getUserById(threadData.createdBy);
            setThreadCreator(creatorData);

            // コメントをセットする前にソート
            const sortedComments = commentsWithUsernames.sort(
              (a, b) =>
                a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
            );

            setThread({ ...threadData, comments: sortedComments }); // スレッドデータにコメントを追加
          }
        } catch (error) {
          console.error('Error fetching thread:', error);
          showAlert('スレッドの読み込み中にエラーが発生しました。', 'error');
        } finally {
          if (isMounted) {
            // isMounted をチェック
            setIsLoadingComments(false);
          }
        }
      }
    };

    fetchThread();

    return () => {
      isMounted = false; // クリーンアップ関数でフラグをfalseにする
    };
  }, [id, isLoadingUser, loadingThread, showAlert]);

  const scrollToBottom = useCallback(() => {
    if (commentsEndRef.current && isNewCommentAdded) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsNewCommentAdded(false);
    }
  }, [isNewCommentAdded]);

  // 4. Scroll bottom effect
  useEffect(() => {
    if (thread && thread.comments) {
      scrollToBottom();
    }
  }, [thread, scrollToBottom]);

  // 5. Initial comments load effect
  useEffect(() => {
    if (thread?.comments?.length > 0) {
      const initialComments = thread.comments
        .slice(0, commentsPerPage)
        .map((comment) => ({
          ...comment,
          uniqueKey: `${comment.id}-initial`,
        }));

      setDisplayedComments(initialComments);
      setHasMoreComments(thread.comments.length > commentsPerPage);
      setLoadedPages(new Set([0]));
      setCurrentPage(1);
      setIsNewCommentAdded(false);

      console.log('Initial comments loaded:', initialComments.length);
    }
  }, [thread?.comments, commentsPerPage]); // thread?.comments を依存配列に追加

  const updateHasMoreComments = useCallback(() => {
    if (thread && thread.comments) {
      setHasMoreComments(displayedComments.length < thread.comments.length);
    }
  }, [thread, displayedComments.length]);

  // 6. Update hasMoreComments effect
  useEffect(() => {
    updateHasMoreComments();
  }, [displayedComments, updateHasMoreComments]);

  // --- functions ---
  // コメントのユーザー情報を取得する関数を分離
  const getCommentsWithUserInfo = async (threadId) => {
    const threadData = await getThreadById(threadId);
    if (!threadData) return []; // スレッドデータがない場合の処理を追加

    return Promise.all(
      threadData.comments.map(async (comment) => {
        const userData = await getUserById(comment.createdBy);
        return {
          ...comment,
          createdByUsername: userData?.username || 'Anonymous',
          userPhotoURL: userData?.photoURL || null,
          isAdmin: threadData.createdBy === comment.createdBy,
        };
      })
    );
  };

  const handleAddComment = async () => {
    // 空白だけのコメントを投稿できないようにする
    if (!comment.trim()) {
      setError('コメントを入力してください');
      return;
    }
    // URLを含むコメントを拒否する
    const urlPattern = /https?:\/\/[^\s]+/gi; // URLを検出する正規表現
    if (urlPattern.test(comment)) {
      setError('コメントにURLを含めることはできません');
      return;
    }

    try {
      const { uid: userId, displayName, photoURL } = auth.currentUser;
      const createdAt = Timestamp.now();
      const newComment = {
        id: createdAt.toMillis().toString(),
        text: comment,
        createdAt,
        createdBy: userId,
        createdByUsername: displayName,
        userPhotoURL: photoURL,
        isAdmin: thread.createdBy === userId,
        uniqueKey: `${createdAt.toMillis().toString()}-new`, // uniqueKeyを追加
      };

      await addCommentToThread(id, comment, userId, displayName, photoURL);

      setComment('');
      setDisplayedComments((prev) => {
        const updated = [...prev, newComment];
        return updated.sort(
          (a, b) =>
            a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
        );
      });
      setIsNewCommentAdded(true); // 新しいコメントが追加されたことを示す状態を更新
      scrollToBottom(); // コメント追加後にスクロール

      // コメント追加後にhasMoreCommentsを更新
      updateHasMoreComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('コメントの追加に失敗しました');
    }
  };

  const handleGoToAdminPage = () => {
    if (!thread || !currentUser) {
      return;
    }

    if (thread.createdBy !== currentUser.uid) {
      showAlert('管理者権限がありません。', 'error');
      return;
    }

    navigate(`/admin/${id}`); // admin/ を追加
  };

  useEffect(() => {
    if (thread?.comments && isNewCommentAdded) {
      scrollToBottom();
    }
  }, [thread?.comments, isNewCommentAdded, scrollToBottom]);

  const handleDeleteComment = async (comment) => {
    try {
      console.log('Deleting comment: ', comment);
      await deleteCommentFromThread(id, comment.id);

      // setThread を使用して thread.comments を更新
      const updatedComments = thread.comments.filter(
        (c) => c.id !== comment.id
      );
      setThread({ ...thread, comments: updatedComments });
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('コメントの削除に失敗しました');
    }
  };
  // コメントのページネーション処理を関数として定義
  const loadMoreComments = useCallback(() => {
    if (!thread || !thread.comments) return;

    const startIndex = currentPage * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    const pageNumber = Math.floor(startIndex / commentsPerPage);

    // すでに読み込んだページはスキップ
    if (loadedPages.has(pageNumber)) return;

    console.log(`Loading comments from ${startIndex} to ${endIndex}`);

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

    setCurrentPage((prev) => prev + 1);
    setLoadedPages((prev) => new Set([...prev, pageNumber]));
  }, [thread, currentPage, commentsPerPage, loadedPages]);

  // --- Custom Hooks ---
  // スクロール監視のカスタムフック
  const useInfiniteScroll = (callback) => {
    const scrollCallback = useCallback(
      throttle(() => {
        if (!hasMoreComments) return;

        // 表示されているコメントの最後の要素を取得
        const lastComment = document.querySelector(
          `[data-comment-index="${displayedComments.length - 1}"]`
        );

        if (!lastComment) return;

        // 最後のコメントの位置を取得
        const lastCommentPosition = lastComment.getBoundingClientRect();
        const isLastCommentVisible =
          lastCommentPosition.bottom <= window.innerHeight;

        if (isLastCommentVisible) {
          callback();
        }
      }, 200),
      [callback, hasMoreComments, displayedComments.length]
    );

    useEffect(() => {
      window.addEventListener('scroll', scrollCallback);
      return () => {
        scrollCallback.cancel();
        window.removeEventListener('scroll', scrollCallback);
      };
    }, [scrollCallback]);
  };

  // --- useInfiniteScroll の呼び出し ---
  useInfiniteScroll(loadMoreComments);

  // --- デバッグ用：コメントの状態をログ出力 (useEffect) ---
  useEffect(() => {
    // デバッグ用なので最後に配置
    console.log('コメント読み込み状態:', {
      表示中のコメント数: displayedComments.length,
      総コメント数: thread?.comments?.length,
      現在のページ: currentPage,
      さらなるコメントの有無: hasMoreComments,
      読み込み済みページ: Array.from(loadedPages),
    });
  }, [displayedComments, thread, currentPage, hasMoreComments, loadedPages]);

  // --- Loading indicators and return statement ---
  if (loadingThread || isLoadingUser) {
    return (
      <Flex
        justify="center"
        align="center"
        height="100vh" // 画面全体の高さを占める
      >
        <Spinner size="xl" color="pink.400" />
      </Flex>
    );
  }

  if (!thread || !thread.comments) {
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
        <MotionBox
          p={6}
          bg={currentViewType === 'admin' ? 'blackAlpha.600' : 'blackAlpha.500'}
          borderRadius="2xl"
          boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          width="1200px"
          mx="auto"
        >
          <Flex justify="space-between" align="center" mb={8}>
            <VStack align="start" spacing={4} flex={1}>
              <Flex align="center" width="100%">
                <Avatar
                  name={threadCreator?.username || 'Anonymous'}
                  src={threadCreator?.photoURL}
                  size="lg"
                  mr={4}
                  border="3px solid"
                  borderColor="pink.400"
                  boxShadow="0 0 15px rgba(255, 25, 136, 0.3)"
                />
                <VStack align="start" spacing={1}>
                  <Flex align="center" gap={2}>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color="white"
                      bgGradient="linear(to-r, pink.400, purple.500)"
                      backgroundClip="text"
                    >
                      {thread.title}
                    </Text>
                    {thread && user && thread.createdBy === user.uid && (
                      <MotionButton
                        onClick={handleGoToAdminPage}
                        leftIcon={<Icon as={FaCrown} />}
                        bg="linear-gradient(135deg, #FF1988 0%, #FF8C00 100%)"
                        color="white"
                        size="sm"
                        px={6}
                        borderRadius="full"
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 15px -3px rgba(255, 25, 136, 0.3)',
                          bg: 'linear-gradient(135deg, #FF1988 20%, #FF8C00 120%)',
                        }}
                        _active={{ transform: 'scale(0.95)' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        管理者ページ
                      </MotionButton>
                    )}
                  </Flex>
                  <Flex align="center" gap={2}>
                    <Text fontSize="sm" color="pink.300" fontWeight="medium">
                      Posted by {threadCreator?.username || 'Anonymous'}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      •{' '}
                      {thread.createdAt?.toDate
                        ? new Date(thread.createdAt?.toDate()).toLocaleString()
                        : ''}
                    </Text>
                  </Flex>
                </VStack>
              </Flex>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                p={6}
                bg="blackAlpha.400"
                borderRadius="xl"
                borderLeft="4px solid"
                borderColor="pink.400"
                width="100%"
              >
                <Text
                  color="gray.100"
                  fontSize="lg"
                  lineHeight="tall"
                  letterSpacing="wide"
                >
                  {thread.content}
                </Text>
              </MotionBox>
            </VStack>
          </Flex>

          {/* コメントセクション */}
          {/* コメントセクション */}
          <VStack spacing={4} align="stretch" mt={6}>
            {isLoadingComments && displayedComments.length === 0 ? (
              // 初期ローディング（コメントが1つも読み込まれていない場合）
              <Flex justify="center" py={8}>
                <Spinner size="lg" color="pink.400" />
              </Flex>
            ) : displayedComments.length > 0 ? (
              // コメントの表示
              <>
                {displayedComments.map((comment, index) => (
                  <MemoizedCommentItem
                    key={comment.uniqueKey || comment.id}
                    comment={comment}
                    isAdmin={comment.isAdmin}
                    onDelete={() => handleDeleteComment(comment)}
                    user={user}
                    thread={thread}
                    index={index}
                  />
                ))}

                {/* 追加コメントの読み込みインジケーター */}
                {hasMoreComments && (
                  <Flex justify="center" my={4}>
                    <Spinner size="sm" color="pink.400" />
                  </Flex>
                )}
              </>
            ) : (
              // コメントが1つもない場合
              <Text color="gray.400" textAlign="center" py={8}>
                コメントはまだありません
              </Text>
            )}
          </VStack>

          {/* コメント追加後にスクロール */}
          <Box ref={commentsEndRef} />
        </MotionBox>
      </VStack>

      {/* コメント入力用のMotionBox */}
      <MotionBox
        p={5}
        bgGradient="radial(circle at top left, rgba(255, 105, 180, 0.8), rgba(0, 0, 0, 1))"
        borderRadius="2xl"
        boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
        position="fixed"
        bottom={4}
        left="50%"
        transform="translateX(-50%)"
        zIndex={10}
        width="1100px"
        maxWidth="95%"
        backdropFilter="blur(8px)"
        border="1px solid"
        borderColor="whiteAlpha.200"
      >
        <Flex align="center" mb={6}>
          {!isLoadingUser && (
            <Avatar
              name={user ? user.displayName : 'Anonymous'}
              src={user?.photoURL || ''}
              size="md"
              mr={3}
              border="2px solid"
              borderColor="pink.400"
            />
          )}
          <MotionInput
            placeholder="コメントを追加"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (error) {
                setError('');
              }
            }}
            bg="blackAlpha.700"
            color="white"
            borderRadius="xl"
            py={4}
            px={5}
            fontSize="md"
            border="2px solid"
            borderColor="whiteAlpha.300"
            _hover={{
              borderColor: 'pink.500',
              boxShadow: '0 0 15px rgba(255, 105, 180, 0.15)',
            }}
            _focus={{
              borderColor: 'pink.400',
              boxShadow: '0 0 0 2px rgba(255, 25, 136, 0.4)',
              bg: 'blackAlpha.800',
            }}
            _placeholder={{ color: 'whiteAlpha.600' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            flex="1"
          />
          <MotionButton
            onClick={handleAddComment}
            colorScheme="pink"
            size="lg"
            fontWeight="bold"
            borderRadius="xl"
            px={8}
            ml={3}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 20px -4px rgba(255, 25, 136, 0.3)',
              bg: 'pink.500',
            }}
            _active={{
              transform: 'scale(0.98)',
              bg: 'pink.600',
            }}
          >
            コメントする
          </MotionButton>
        </Flex>
        {error && (
          <Text
            color="pink.300"
            fontSize="sm"
            textAlign="center"
            mt={2}
            fontWeight="medium"
          >
            {error}
          </Text>
        )}
      </MotionBox>
    </>
  );
}

export default ThreadDetail;
