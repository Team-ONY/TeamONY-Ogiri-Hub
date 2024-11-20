import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionButton = motion(Button);

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

  useEffect(() => {
    // 1. Auth state effect
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoadingUser(false); // ユーザー情報読み込み完了
    });
    return () => unsubscribe();
  }, []);

  // 2. Thread access check effect
  useEffect(() => {
    const checkThreadAccess = async () => {
      if (!isLoadingUser) {
        if (!currentUser) {
          showAlert('ログインが必要です。', 'error');
          navigate('/signin');
          return;
        }

        try {
          const threadData = await getThreadById(id);

          if (!threadData) {
            showAlert('スレッドが見つかりませんでした。', 'error');
            navigate('/thread');
            return;
          }

          const isParticipant = threadData.participants?.includes(
            currentUser?.uid
          );

          if (!isParticipant) {
            showAlert('このスレッドに参加する必要があります。', 'warning');
            navigate('/thread');
            return;
          }

          setThread(threadData);
          setLoadingThread(false);
        } catch (error) {
          console.error('Error fetching thread:', error);
          showAlert('スレッドの読み込み中にエラーが発生しました。', 'error');
          setLoadingThread(false);
          navigate('/thread');
        }
      }
    };

    checkThreadAccess();
  }, [id, currentUser, navigate, showAlert, isLoadingUser]);

  // 3. Thread details fetch effect
  useEffect(() => {
    const fetchThread = async () => {
      if (!isLoadingUser && !loadingThread) {
        const threadData = await getThreadById(id);
        if (threadData) {
          // コメントの作成者のユーザー名を取得
          const commentsWithUsernames = await Promise.all(
            threadData.comments.map(async (comment) => {
              const userData = await getUserById(comment.createdBy);
              return {
                ...comment,
                createdByUsername: userData ? userData.username : 'Anonymous',
                userPhotoURL: userData ? userData.photoURL : null,
                isAdmin: threadData.createdBy === comment.createdBy, // 管理者判定を追加
              };
            })
          );

          const creatorData = await getUserById(threadData.createdBy);
          setThreadCreator(creatorData);
          setThread({ ...threadData, comments: commentsWithUsernames });
        }
      }
    };
    fetchThread();
  }, [id, isLoadingUser, loadingThread, thread]);

  // 4. Scroll effect
  useEffect(() => {
    if (thread && thread.comments) {
      scrollToBottom();
    }
  }, [thread]);

  // 5. Comment add effect
  useEffect(() => {
    const fetchThreadDetails = async () => {
      const threadData = await getThreadById(id);
      if (threadData) {
        const creatorData = await getUserById(threadData.createdBy);
        setThreadCreator(creatorData);
        setThread(threadData);
      }
    };
    fetchThreadDetails();
  }, [id]);

  const handleAddComment = async () => {
    // 空白だけのコメントを投稿できないようにする
    if (!comment.trim()) {
      setError('コメントを入力してください');
      return;
    }

    try {
      // 現在のユーザーの情報を取得
      const currentUser = auth.currentUser;
      const userId = currentUser ? currentUser.uid : 'anonymous';
      const displayName = currentUser
        ? currentUser.displayName
        : 'Anonymous User';
      const photoURL = currentUser ? currentUser.photoURL : null;

      // スレッドに新しいコメントを追加
      await addCommentToThread(id, comment, userId, displayName, photoURL);

      // 新しいコメントの投稿に成功したら、入力欄をクリア
      setComment('');

      // コメント追加後にスレッドデータを再取得
      const threadData = await getThreadById(id);
      if (threadData) {
        const commentsWithUserInfo = await Promise.all(
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
        setThread({
          ...threadData,
          comments: commentsWithUserInfo,
        });
        // コメントが追加されたら最下部までスクロール
        scrollToBottom();
      }
    } catch (error) {
      // コメントの投稿に失敗したときのエラー処理
      console.error('Error adding comment:', error);
      setError('コメントの追加に失敗しました');
    }
  };

  const handleGoToAdminPage = () => {
    navigate(`/admin/${id}`);
  };

  // コメントが追加されたら最下部までスクrーる
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // スレッドやコメントが存在しない場合の表示
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
        bg="blackAlpha.500"
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

        {thread.comments.map((comment, index) => (
          <MotionBox
            key={index}
            p={4}
            bg="blackAlpha.400"
            borderRadius="xl"
            width="100%"
            style={{ boxSizing: 'border-box' }}
            mx="auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
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
                  border={comment.isAdmin ? '2px solid' : 'none'}
                  borderColor="pink.400"
                />
                <Flex align="center" gap={2}>
                  <Text color="gray.400" fontSize="sm">
                    {comment.createdByUsername}
                  </Text>
                  {comment.isAdmin && (
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
              {user && user.uid === thread.createdBy && (
                <IconButton
                  aria-label="Delete comment"
                  icon={<Icon as={FaTrash} />}
                  onClick={() => handleDeleteComment(comment)}
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
        ))}

        {/* コメント追加後にスクロール */}
        <Box ref={commentsEndRef} />

        <MotionBox
          p={5}
          bgGradient="radial(circle at top left, rgba(255, 105, 180, 0.8), rgba(0, 0, 0, 1))"
          borderRadius="2xl"
          boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
          position="fixed"
          bottom={4}
          left={0}
          right={0}
          zIndex={10}
          width="1100px"
          mx="auto"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Flex align="center" mb={6}>
            {!isLoadingUser && ( // isLoadingUser が false の場合のみ Avatar を表示
              <Avatar
                name={user ? user.displayName : 'Anonymous'} // userがnullの場合は"Anonymous"を表示
                src={user?.photoURL || ''} // user が null の場合空文字列を設定
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
      </MotionBox>
    </VStack>
  );
}

export default ThreadDetail;
