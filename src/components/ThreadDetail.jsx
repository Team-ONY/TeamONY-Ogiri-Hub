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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { auth } from '../config/firebase';
import { getThreadById, addCommentToThread } from '../services/threadService';
import { getUserById } from '../services/userService';
import { FaCrown } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionButton = motion(Button);

function ThreadDetail() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const userInfo = auth.currentUser; // 現在のユーザーを取得
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();
  const [threadCreator, setThreadCreator] = useState(null);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // デバッグ用
  useEffect(() => {
    console.log('Thread: ', thread);
    console.log('User: ', user);
    console.log('Thread createdBy: ', thread?.createdBy);
    console.log('User UID: ', user?.uid);
  }, [thread, user]);

  useEffect(() => {
    const fetchThread = async () => {
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
        setThread({ ...threadData, comments: commentsWithUsernames });
      }
    };
    fetchThread();
  }, [id]);

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
    if (!comment.trim()) {
      setError('コメントを入力してください');
      return;
    }
    await addCommentToThread(
      id,
      comment,
      user.uid,
      user.displayName,
      user.photoURL
    );
    setComment('');

    // コメントを追加した後にスレッドのデータを再取得
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
      setThread({ ...threadData, comments: commentsWithUsernames });
    }
  };

  const handleGoToAdminPage = () => {
    navigate(`/admin/${id}`);
  };

  // コメントが追加されたら最下部までスクrーる
  const scrollToBottom = () => {
    commentsEndRef.curret?.scrollToBottom({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (thread && thread.comments) {
      scrollToBottom();
    }
  }, [thread]);

  if (!thread || !thread.comments) {
    return <div>Loading...</div>;
  }

  return (
    <VStack spacing={6} align="stretch" mt={20} pb={20}>
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
            bg="blackAlpha.500"
            borderRadius="xl"
            boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            mt={6}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Flex align="center" mb={2}>
              <Avatar
                name={comment.createdByUsername}
                src={comment.userPhotoURL}
                size="sm"
                mr={2}
                border={comment.isAdmin ? '2px solid' : 'none'}
                borderColor="pink.400"
              />
              <Flex align="center" gap={2}>
                <Text
                  color={comment.isAdmin ? 'pink.300' : 'gray.500'}
                  fontSize="sm"
                  fontWeight={comment.isAdmin ? 'bold' : 'normal'}
                >
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
                  {new Date(comment.createdAt?.toDate()).toLocaleString()}
                </Text>
              </Flex>
            </Flex>
            <Text
              color="gray.300"
              fontSize="md"
              pl={10} // アバターに合わせてテキストをインデント
            >
              {comment.text}
            </Text>
          </MotionBox>
        ))}

        {/* コメント追加後にスクロール */}
        <div ref={commentsEndRef} />

        <MotionBox
          p={4}
          bgGradient="radial(circle at top left, rgba(255, 105, 180, 0.5), rgba(0, 0, 0, 1))"
          borderRadius="xl"
          boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          zIndex={10}
          width="1100px"
          mx="auto"
        >
          <Flex align="center" mb={7}>
            <Avatar
              name={userInfo ? userInfo.displayName : 'You'}
              src={userInfo ? userInfo.photoURL : ''}
              size="sm"
              mr={2}
            />
            <MotionInput
              placeholder="コメントを追加"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) {
                  setError(''); // 入力が始まったらエラーをクリア
                }
              }}
              bg="blackAlpha.900"
              color="white"
              borderRadius="full"
              py={3}
              px={4}
              fontSize="sm"
              border="2px solid"
              borderColor="whiteAlpha.400"
              _hover={{ borderColor: 'pink.600' }}
              _focus={{
                borderColor: 'pink.400',
                boxShadow: '0 0 0 1px #FF1988',
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              flex="1"
            />
            <MotionButton
              onClick={handleAddComment}
              colorScheme="pink"
              size="sm"
              fontWeight="bold"
              borderRadius="full"
              px={6}
              ml={2}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 15px -3px rgba(255, 25, 136, 0.3)',
              }}
              _active={{ transform: 'scale(0.95)' }}
            >
              コメントする
            </MotionButton>
          </Flex>
          {error && (
            <Text color="pink.300" fontSize="sm" textAlign="center" mt={2}>
              {error}
            </Text>
          )}
        </MotionBox>
      </MotionBox>
    </VStack>
  );
}

export default ThreadDetail;
