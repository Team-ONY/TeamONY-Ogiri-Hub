import {
  Box,
  Flex,
  Avatar,
  Text,
  Button,
  Badge,
  VStack,
  HStack,
  Image,
  Icon,
  AvatarGroup,
  Textarea,
  useDisclosure,
  IconButton,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiClock,
  FiArrowRight,
  FiCheck,
  FiX,
  FiHeart,
  FiAward,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import {
  getEventParticipantsDetails,
  getUserAnswerCount,
  getBestAnswer,
  checkEventExpirationAndSetBestAnswer,
  calculateRemainingTime,
  deleteOgiriEvent,
  subscribeToLiveAnswers,
  voteForAnswer,
  getMostVotedAnswer,
  checkEventExpiration,
  setBestAnswer,
} from '../../../services/ogiriService';
import { useAlert } from '../../../hooks/useAlert';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import DeleteOgiriEventModal from './DeleteOgiriModal';

const OgiriEvent = ({ event, creator, onJoinEvent, currentUser, thread }) => {
  const [isParticipating, setIsParticipating] = useState(false);
  const [participantsDetails, setParticipantsDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen: isAnswersOpen } = useDisclosure();
  const [isExpired, setIsExpired] = useState(false);
  const [userAnswerCount, setUserAnswerCount] = useState(0);
  const [bestAnswerId, setBestAnswerId] = useState(null);
  const { showAlert } = useAlert();
  const [remainingTime, setRemainingTime] = useState('');
  const isAdmin = currentUser?.uid === thread?.createdBy;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const [liveAnswers, setLiveAnswers] = useState([]);
  const [mostVotedAnswer, setMostVotedAnswer] = useState(null);
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const answersPerPage = 5;
  const [isEventExpired, setIsEventExpired] = useState(false);
  const [usersDetails, setUsersDetails] = useState({});

  console.log({
    currentUserId: currentUser?.uid,
    threadCreatorId: thread?.createdBy,
    isAdmin,
  });

  useEffect(() => {
    if (!event?.participants || !currentUser) return;

    const isUserParticipating = event.participants.includes(currentUser.uid);
    setIsParticipating(isUserParticipating);
  }, [event?.participants, currentUser]);

  useEffect(() => {
    const fetchParticipantsDetails = async () => {
      if (!event.participants?.length) return;

      try {
        const details = await getEventParticipantsDetails(event.participants);
        setParticipantsDetails(details);
      } catch (error) {
        console.error('Error fetching participants details:', error);
      }
    };

    fetchParticipantsDetails();
  }, [event.participants]);

  useEffect(() => {
    if (!event.id || !isAnswersOpen || !isExpired) return;

    const answersRef = collection(
      db,
      'threads',
      event.threadId,
      'ogiriEvents',
      event.id,
      'answers'
    );
    const q = query(answersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newAnswers = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('Answer data:', data);
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setLiveAnswers(newAnswers);
      },
      (error) => {
        console.error('Error listening to answers:', error);
      }
    );

    return () => unsubscribe();
  }, [event.id, event.threadId, isAnswersOpen, isExpired]);

  useEffect(() => {
    const checkExpirationAndBestAnswer = async () => {
      if (!event.id) return;

      try {
        const expired = await checkEventExpirationAndSetBestAnswer(event);
        setIsExpired(expired);

        if (expired) {
          const bestAnswer = await getBestAnswer(event.threadId, event.id);
          if (bestAnswer) {
            setBestAnswerId(bestAnswer.id);
          }
        }
      } catch (error) {
        console.error('Error checking expiration and best answer:', error);
      }
    };

    checkExpirationAndBestAnswer();

    // 1分ごとにチェック
    const interval = setInterval(checkExpirationAndBestAnswer, 60000);
    return () => clearInterval(interval);
  }, [event]);

  useEffect(() => {
    const fetchUserAnswerCount = async () => {
      if (!currentUser || !isParticipating) return;

      try {
        const count = await getUserAnswerCount(
          event.threadId,
          event.id,
          currentUser.uid
        );
        setUserAnswerCount(count);
      } catch (error) {
        console.error('Error fetching user answer count:', error);
      }
    };

    fetchUserAnswerCount();
  }, [currentUser, isParticipating, event.id, event.threadId]);

  useEffect(() => {
    const updateRemainingTime = () => {
      const timeText = calculateRemainingTime(event);
      setRemainingTime(timeText);

      // イベントが終了している場合は自動的にベストアンサーを選定
      if (timeText === '終了' && event.status !== 'completed') {
        checkEventExpirationAndSetBestAnswer(event);
      }
    };

    // 初回実行
    updateRemainingTime();

    // 1秒ごとに更新
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [event]);

  useEffect(() => {
    if (!event.id || !isParticipating) return;

    const unsubscribe = subscribeToLiveAnswers(
      event.threadId,
      event.id,
      (newAnswers) => {
        setLiveAnswers(newAnswers);
      }
    );

    return () => unsubscribe();
  }, [event.id, event.threadId, isParticipating]);

  useEffect(() => {
    const checkExpiration = async () => {
      const isExpired = checkEventExpiration({
        createdAt: event.createdAt,
        duration: event.duration,
        status: event.status,
      });

      if (isExpired && !isEventExpired) {
        setIsEventExpired(true);
        try {
          // 最多投票回答を取得
          const votedAnswer = await getMostVotedAnswer(
            event.threadId,
            event.id
          );
          if (votedAnswer) {
            setMostVotedAnswer(votedAnswer);
            // ベストアンサーとして設定（既に設定されていない場合のみ）
            if (!event.bestAnswerId) {
              await setBestAnswer(event.threadId, event.id, votedAnswer.id);
            }
          }
        } catch (error) {
          console.error('Error handling event expiration:', error);
        }
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, [event, isEventExpired]);

  // 回答を新着順にソートする関数
  const sortAnswersByDate = (answers) => {
    return [...answers].sort((a, b) => {
      const dateA =
        a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
      const dateB =
        b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
      return dateB - dateA; // 降順（新着順）
    });
  };

  // 重複を防ぎつつ回答を更新する関数
  const updateLiveAnswers = (newAnswer) => {
    setLiveAnswers((prev) => {
      // 既存の回答から重複を除外し、新しい回答を追加して新着順にソート
      const uniqueAnswers = prev.filter((answer) => answer.id !== newAnswer.id);
      return sortAnswersByDate([...uniqueAnswers, newAnswer]);
    });
  };

  // リアルタイムリスナーの設定
  useEffect(() => {
    if (!event?.id) return;

    const answersRef = collection(
      db,
      'threads',
      event.threadId,
      'ogiriEvents',
      event.id,
      'answers'
    );

    const unsubscribe = onSnapshot(answersRef, (snapshot) => {
      const answers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 新着順にソートして状態を更新
      setLiveAnswers(sortAnswersByDate(answers));
    });

    return () => unsubscribe();
  }, [event?.id, event.threadId]);

  const handleVote = async (answerId) => {
    if (!currentUser) {
      showAlert('投票するにはログインが必要です', 'warning');
      return;
    }

    try {
      await voteForAnswer(event.threadId, event.id, answerId, currentUser.uid);
      toast({
        title: '投票しました',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error voting:', error);
      showAlert('投票に失敗しました', 'error');
    }
  };

  // 固定のグラデーション
  const gradient = 'linear(to-r, pink.400, purple.400)';

  // シンプルにメールアドレスから@より前の部分を取得
  const getUserId = (userId) => {
    const userEmail = usersDetails[userId]?.email;
    return userEmail ? userEmail.split('@')[0] : 'unknown';
  };

  // イベントの終了状態を監視
  useEffect(() => {
    const checkExpiration = () => {
      const isExpired = checkEventExpiration({
        createdAt: event.createdAt,
        duration: event.duration,
        status: event.status,
      });

      if (isExpired && !isEventExpired) {
        setIsEventExpired(true);
        // イベント終了時に最多投票回答を取得
        getMostVotedAnswer(event.threadId, event.id)
          .then((votedAnswer) => {
            setMostVotedAnswer(votedAnswer);
          })
          .catch((error) => {
            console.error('Error fetching most voted answer:', error);
          });
      }
    };

    // 初回チェック
    checkExpiration();

    // 1秒ごとにチェック
    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, [event, isEventExpired]);

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUsersDetails = async () => {
      try {
        // 回答に含まれるすべてのユーザーIDを収集
        const userIds = [
          ...new Set(
            [
              ...liveAnswers.map((answer) => answer.userId),
              mostVotedAnswer?.userId,
            ].filter(Boolean)
          ),
        ];

        const details = {};
        await Promise.all(
          userIds.map(async (userId) => {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              details[userId] = userSnap.data();
            }
          })
        );

        setUsersDetails(details);
      } catch (error) {
        console.error('Error fetching users details:', error);
      }
    };

    if (liveAnswers.length > 0 || mostVotedAnswer) {
      fetchUsersDetails();
    }
  }, [liveAnswers, mostVotedAnswer]);

  const renderLiveAnswers = () => {
    const isTimeExpired = checkEventExpiration({
      createdAt: event.createdAt,
      duration: event.duration,
      status: event.status,
    });

    // 有効な回答のみをフィルタリング（最多投票回答を除外）
    const validAnswers = liveAnswers
      .filter((answer) => answer && answer.id)
      .filter((answer) => {
        // 最多投票回答を除外
        if (isTimeExpired && mostVotedAnswer) {
          return answer.id !== mostVotedAnswer.id;
        }
        return true;
      });

    // ページネーション用の計算
    const totalPages = Math.ceil(validAnswers.length / answersPerPage);
    const startIndex = (currentPage - 1) * answersPerPage;
    const endIndex = startIndex + answersPerPage;
    const currentAnswers = validAnswers.slice(startIndex, endIndex);

    return (
      <VStack spacing={4} width="100%">
        {currentAnswers.map((answer, index) => (
          <motion.div
            key={answer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            style={{ width: '100%' }}
          >
            <Box
              bg="rgba(255, 255, 255, 0.05)"
              backdropFilter="blur(10px)"
              borderRadius="2xl"
              overflow="hidden"
              position="relative"
              border="1px solid"
              borderColor="whiteAlpha.100"
              _hover={{
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                height="2px"
                bgGradient={gradient}
              />

              <Box p={6}>
                <VStack align="stretch" spacing={4}>
                  <Text
                    color="white"
                    fontSize="lg"
                    fontWeight="medium"
                    lineHeight="tall"
                  >
                    {answer.content}
                  </Text>

                  <Flex justify="space-between" align="center">
                    {/* 左側：ユーザー情報 */}
                    <HStack spacing={3}>
                      {isTimeExpired ? (
                        <>
                          <Avatar
                            size="sm"
                            src={answer.photoURL}
                            name={answer.username}
                          />
                          <VStack align="start" spacing={0}>
                            <Text
                              bgGradient={gradient}
                              bgClip="text"
                              fontWeight="bold"
                            >
                              {answer.username}
                            </Text>
                            <Text color="whiteAlpha.600" fontSize="sm">
                              @{getUserId(answer.userId)}
                            </Text>
                          </VStack>
                        </>
                      ) : (
                        <HStack
                          spacing={2}
                          bg="whiteAlpha.100"
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          <Icon as={FiStar} color="yellow.300" w={4} h={4} />
                          <Text
                            fontSize="sm"
                            bgGradient={gradient}
                            bgClip="text"
                            fontWeight="bold"
                          >
                            回答者 #{index + 1}
                          </Text>
                        </HStack>
                      )}
                    </HStack>

                    {/* 右側：投票ボタンとカウント */}
                    <HStack spacing={2}>
                      <IconButton
                        icon={
                          <Icon
                            as={FiHeart}
                            color={
                              answer.votes?.includes(currentUser?.uid)
                                ? 'pink.400'
                                : 'white'
                            }
                          />
                        }
                        variant="ghost"
                        size="sm"
                        isDisabled={!currentUser || isTimeExpired}
                        onClick={() => handleVote(answer.id)}
                        _hover={{
                          bg: 'whiteAlpha.100',
                          transform: 'scale(1.1)',
                        }}
                        transition="all 0.2s"
                        aria-label="Vote"
                      />
                      <Badge
                        colorScheme="pink"
                        variant="subtle"
                        px={2}
                        borderRadius="full"
                      >
                        {answer.voteCount || 0}
                      </Badge>
                    </HStack>
                  </Flex>
                </VStack>
              </Box>
            </Box>
          </motion.div>
        ))}

        {/* ページネーション */}
        {totalPages > 1 && (
          <Box
            pt={6}
            pb={2}
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <HStack
              spacing={2}
              bg="rgba(0, 0, 0, 0.3)"
              backdropFilter="blur(10px)"
              borderRadius="full"
              px={4}
              py={2}
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <IconButton
                icon={<FiChevronLeft />}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                isDisabled={currentPage === 1}
                variant="ghost"
                size="sm"
                color="white"
                _hover={{
                  bg: 'whiteAlpha.100',
                  transform: 'translateX(-2px)',
                }}
                _active={{ bg: 'whiteAlpha.200' }}
                aria-label="Previous page"
                transition="all 0.2s"
              />

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = currentPage === pageNum;

                return (
                  <Button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    size="sm"
                    variant="unstyled"
                    minW={8}
                    h={8}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                    }}
                  >
                    {isCurrentPage && (
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bgGradient={gradient}
                        borderRadius="full"
                        opacity={0.3}
                      />
                    )}
                    <Text
                      color={isCurrentPage ? 'white' : 'whiteAlpha.700'}
                      fontWeight={isCurrentPage ? 'bold' : 'normal'}
                      bgGradient={isCurrentPage ? gradient : undefined}
                      bgClip={isCurrentPage ? 'text' : undefined}
                    >
                      {pageNum}
                    </Text>
                  </Button>
                );
              })}

              <IconButton
                icon={<FiChevronRight />}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                isDisabled={currentPage === totalPages}
                variant="ghost"
                size="sm"
                color="white"
                _hover={{
                  bg: 'whiteAlpha.100',
                  transform: 'translateX(2px)',
                }}
                _active={{ bg: 'whiteAlpha.200' }}
                aria-label="Next page"
                transition="all 0.2s"
              />
            </HStack>
          </Box>
        )}
      </VStack>
    );
  };

  // 新しい回答が追加された時に最初のページに戻る
  useEffect(() => {
    setCurrentPage(1);
  }, [liveAnswers.length]);

  if (!event || !event.createdAt) {
    return null;
  }

  const handleJoinClick = async () => {
    setIsLoading(true);
    try {
      await onJoinEvent(event.id);
    } catch (error) {
      console.error('Error joining event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isSubmitting || userAnswerCount >= event.maxResponses)
      return;
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const userDisplayName = currentUser.displayName || '匿名ユーザー';
      const userPhotoURL = currentUser.photoURL || null;
      const userId = currentUser.uid;

      if (!userId) {
        throw new Error('User ID is required');
      }

      const answersRef = collection(
        db,
        'threads',
        event.threadId,
        'ogiriEvents',
        event.id,
        'answers'
      );

      const answerData = {
        content: answer.trim(),
        userId: userId,
        username: userDisplayName,
        photoURL: userPhotoURL,
        createdAt: new Date(),
        voteCount: 0,
        votes: [],
      };

      const validatedData = Object.entries(answerData).reduce(
        (acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      const newAnswerRef = await addDoc(answersRef, validatedData);
      const newAnswer = {
        id: newAnswerRef.id,
        ...validatedData,
      };

      // 重複を防いで新着順に更新
      updateLiveAnswers(newAnswer);

      setAnswer('');
      setUserAnswerCount((prev) => prev + 1);

      toast({
        title: '回答を投稿しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: '回答の投稿に失敗しました',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = () => {
    if (!isAdmin) {
      showAlert('管理者のみイベントを削除できます', 'error');
      return;
    }
    onOpen();
  };

  const executeDelete = async () => {
    try {
      await deleteOgiriEvent(event.threadId, event.id);
      showAlert('大喜利イベントを削除しました', 'success');
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
      showAlert('削除に失敗しました', 'error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && ((isMac && e.metaKey) || (!isMac && e.ctrlKey))) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  return (
    <>
      <Box
        position="relative"
        bg="rgba(0, 0, 0, 0.3)"
        borderRadius="xl"
        overflow="hidden"
        backdropFilter="blur(10px)"
        boxShadow="0 4px 30px rgba(0, 0, 0, 0.2)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          bgGradient: 'linear(to-r, pink.500, purple.500)',
        }}
      >
        <Flex
          justify="space-between"
          align="center"
          px={4}
          py={2}
          borderBottom="1px solid"
          borderColor="whiteAlpha.100"
          bg="whiteAlpha.50"
          position="relative"
          _after={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgGradient:
              'linear(to-r, rgba(236, 72, 153, 0.1), rgba(147, 51, 234, 0.1))',
            pointerEvents: 'none',
          }}
        >
          <Flex align="center" gap={2}>
            <Avatar
              name={creator?.username}
              src={creator?.photoURL}
              size="xs"
            />
            <Text fontSize="sm" fontWeight="medium" color="white">
              {event.title}
            </Text>
          </Flex>

          <Flex align="center" gap={2}>
            {isAdmin && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconButton
                  icon={<FiX />}
                  variant="ghost"
                  size="sm"
                  aria-label="イベントを削除"
                  onClick={handleDeleteEvent}
                  bg="transparent"
                  color="whiteAlpha.800"
                  _hover={{
                    bg: 'linear-gradient(135deg, #EC4899 0%, #9333EA 100%)',
                    color: 'white',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                    boxShadow: 'none',
                  }}
                  rounded="full"
                  minW="24px"
                  height="24px"
                  fontSize="16px"
                />
              </motion.div>
            )}
          </Flex>
        </Flex>

        <Box p={6}>
          <Flex direction="column" gap={6}>
            <Flex
              justify="space-between"
              align="center"
              flexWrap={{ base: 'wrap', md: 'nowrap' }}
              gap={4}
            >
              <HStack spacing={4} flex="1">
                <Avatar
                  src={creator?.photoURL}
                  name={creator?.username}
                  size="md"
                  border="2px solid"
                  borderColor="pink.400"
                  boxShadow="0 0 10px rgba(255, 20, 147, 0.3)"
                />
                <VStack align="start" spacing={1}>
                  <Text
                    fontWeight="bold"
                    color="white"
                    fontSize="lg"
                    bgGradient="linear(to-r, pink.200, purple.200)"
                    bgClip="text"
                  >
                    {creator?.username}
                  </Text>
                  <HStack
                    spacing={4}
                    divider={<Box w="1px" h="15px" bg="whiteAlpha.300" />}
                  >
                    <HStack spacing={1}>
                      <Icon as={FiClock} color="pink.300" />
                      <Text fontSize="sm" color="whiteAlpha.900">
                        {remainingTime}
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FiUsers} color="purple.300" />
                      <Text fontSize="sm" color="whiteAlpha.900">
                        {event.participants?.length || 0}人参加中
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>

              <Flex gap={4} align="center">
                <AvatarGroup size="sm" max={3}>
                  {Object.values(participantsDetails).map((participant) => (
                    <Avatar
                      key={participant.uid}
                      name={participant.username}
                      src={participant.photoURL}
                      size="sm"
                    />
                  ))}
                </AvatarGroup>

                <Button
                  onClick={handleJoinClick}
                  isLoading={isLoading}
                  isDisabled={isExpired}
                  bgGradient={
                    isExpired
                      ? 'linear(to-r, gray.600, gray.700)'
                      : isParticipating
                        ? 'linear(to-r, green.400, teal.400)'
                        : 'linear(to-r, pink.400, purple.400)'
                  }
                  color={isExpired ? 'whiteAlpha.600' : 'white'}
                  px={6}
                  py={6}
                  fontSize="md"
                  rightIcon={
                    !isExpired && (
                      <Icon as={isParticipating ? FiCheck : FiArrowRight} />
                    )
                  }
                  _hover={{
                    transform: isExpired ? 'none' : 'translateY(-2px)',
                    boxShadow: isExpired
                      ? 'none'
                      : '0 4px 12px rgba(255, 20, 147, 0.3)',
                  }}
                  _active={{
                    transform: isExpired ? 'none' : 'translateY(0)',
                    boxShadow: 'none',
                  }}
                  _disabled={{
                    opacity: 0.7,
                    cursor: 'not-allowed',
                    boxShadow: 'none',
                    _hover: {
                      bg: 'linear(to-r, gray.600, gray.700)',
                      transform: 'none',
                    },
                  }}
                  borderRadius="xl"
                  transition="all 0.2s"
                  border="1px solid"
                  borderColor={isExpired ? 'gray.600' : 'transparent'}
                >
                  {isExpired ? (
                    <HStack spacing={2} opacity={0.8}>
                      <Icon as={FiClock} />
                      <Text>終了済み</Text>
                    </HStack>
                  ) : isParticipating ? (
                    '参加中'
                  ) : (
                    '大喜利に参加する'
                  )}
                </Button>
              </Flex>
            </Flex>

            <Box>
              <Badge
                colorScheme="pink"
                mb={3}
                px={3}
                py={1}
                borderRadius="full"
                textTransform="none"
                fontSize="sm"
              >
                お題
              </Badge>
              {event.odaiType === 'text' ? (
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="white"
                  lineHeight="1.6"
                  px={2}
                >
                  {event.title}
                </Text>
              ) : (
                <Box
                  borderRadius="xl"
                  overflow="hidden"
                  maxH="400px"
                  position="relative"
                  bg="blackAlpha.400"
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
                >
                  <Image
                    src={event.selectedImage}
                    alt="お題画像"
                    width="100%"
                    height="auto"
                    objectFit="contain"
                    maxH="400px"
                    mx="auto"
                    loading="lazy"
                  />
                </Box>
              )}
            </Box>

            {isParticipating && !isExpired && (
              <Box mt={4}>
                <Box
                  bg="rgba(0, 0, 0, 0.7)"
                  backdropFilter="blur(20px)"
                  borderRadius="24px"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  overflow="hidden"
                  position="relative"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    height="2px"
                    bgGradient="linear(to-r, pink.400, purple.500)"
                  />

                  <Box p={4}>
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={`回答を入力... (${isMac ? 'Cmd' : 'Ctrl'} + Enterで送信)`}
                      bg="whiteAlpha.50"
                      border="none"
                      color="white"
                      fontSize="lg"
                      height="100px"
                      py={2}
                      px={3}
                      borderRadius="xl"
                      resize="none"
                      textAlign="center"
                      lineHeight="80px"
                      _placeholder={{
                        color: 'whiteAlpha.500',
                        textAlign: 'center',
                      }}
                      _focus={{
                        bg: 'whiteAlpha.100',
                        boxShadow: 'none',
                      }}
                      sx={{
                        '&::-webkit-scrollbar': {
                          display: 'none',
                        },
                      }}
                    />
                    <Flex justify="space-between" align="center" mt={2}>
                      <Text fontSize="sm" color="whiteAlpha.700">
                        残り{event.maxResponses - userAnswerCount}回回答可能
                      </Text>
                      <Button
                        onClick={handleSubmitAnswer}
                        isLoading={isSubmitting}
                        bgGradient="linear(to-r, pink.400, purple.400)"
                        color="white"
                        size="sm"
                        _hover={{
                          bgGradient: 'linear(to-r, pink.500, purple.500)',
                          transform: 'translateY(-1px)',
                        }}
                        isDisabled={
                          !answer.trim() ||
                          userAnswerCount >= event.maxResponses ||
                          isExpired
                        }
                      >
                        回答する
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              </Box>
            )}

            {isParticipating && (
              <Box mt={4}>
                <Heading size="md" color="white" mb={4}>
                  回答一覧
                </Heading>

                {checkEventExpiration({
                  createdAt: event.createdAt,
                  duration: event.duration,
                  status: event.status,
                }) ? (
                  <>
                    {isEventExpired &&
                      mostVotedAnswer &&
                      mostVotedAnswer.id === bestAnswerId && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          style={{ width: '100%' }}
                        >
                          <Box
                            bg="rgba(0, 0, 0, 0.3)"
                            backdropFilter="blur(16px)"
                            borderRadius="2xl"
                            overflow="hidden"
                            position="relative"
                            border="1px solid"
                            borderColor="pink.500"
                            boxShadow="0 4px 30px rgba(236, 72, 153, 0.1)"
                            mb={6}
                          >
                            <Box
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              height="3px"
                              bgGradient={gradient}
                            />
                            <Box p={6}>
                              <VStack spacing={4} align="stretch">
                                <HStack spacing={3} justify="space-between">
                                  <HStack>
                                    <Icon
                                      as={FiAward}
                                      color="pink.300"
                                      w={5}
                                      h={5}
                                    />
                                    <Text
                                      bgGradient={gradient}
                                      bgClip="text"
                                      fontSize="lg"
                                      fontWeight="bold"
                                    >
                                      最多投票回答 🏆
                                    </Text>
                                  </HStack>
                                  <Badge
                                    colorScheme="pink"
                                    variant="solid"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                  >
                                    {mostVotedAnswer.voteCount || 0} 票
                                  </Badge>
                                </HStack>

                                <Box
                                  bg="whiteAlpha.100"
                                  p={4}
                                  borderRadius="xl"
                                  border="1px solid"
                                  borderColor="whiteAlpha.200"
                                >
                                  <Text
                                    color="white"
                                    fontSize="xl"
                                    fontWeight="medium"
                                    lineHeight="tall"
                                  >
                                    {mostVotedAnswer.content}
                                  </Text>
                                </Box>

                                <HStack spacing={3}>
                                  <Avatar
                                    size="md"
                                    src={mostVotedAnswer.photoURL}
                                    name={mostVotedAnswer.username}
                                    border="2px solid"
                                    borderColor="pink.400"
                                  />
                                  <VStack align="start" spacing={0}>
                                    <Text
                                      bgGradient={gradient}
                                      bgClip="text"
                                      fontWeight="bold"
                                    >
                                      {mostVotedAnswer.username}
                                    </Text>
                                    <Text color="whiteAlpha.600" fontSize="sm">
                                      @{getUserId(mostVotedAnswer.userId)}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </VStack>
                            </Box>
                          </Box>
                        </motion.div>
                      )}
                    {renderLiveAnswers()}
                  </>
                ) : isParticipating ? (
                  <VStack spacing={4} width="100%">
                    <Text color="pink.300" fontSize="sm" fontWeight="medium">
                      制限時間内の投票をお願いします！
                    </Text>
                    {renderLiveAnswers()}
                  </VStack>
                ) : (
                  <Box
                    p={4}
                    bg="whiteAlpha.100"
                    borderRadius="xl"
                    textAlign="center"
                  >
                    <HStack spacing={2} justify="center">
                      <Icon as={FiClock} color="pink.300" />
                      <Text color="whiteAlpha.800">
                        参加して回答を見る・投票する
                      </Text>
                    </HStack>
                  </Box>
                )}
              </Box>
            )}
          </Flex>
        </Box>
      </Box>

      <DeleteOgiriEventModal
        isOpen={isOpen}
        onClose={onClose}
        onDelete={executeDelete}
        eventTitle={event.title}
      />
    </>
  );
};

OgiriEvent.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    threadId: PropTypes.string.isRequired,
    createdAt: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.object,
    ]).isRequired,
    duration: PropTypes.number.isRequired,
    participants: PropTypes.array,
    odaiType: PropTypes.string.isRequired,
    title: PropTypes.string,
    selectedImage: PropTypes.string,
    status: PropTypes.string,
    maxResponses: PropTypes.number,
    createdBy: PropTypes.string.isRequired,
    bestAnswerId: PropTypes.string,
  }).isRequired,
  creator: PropTypes.object.isRequired,
  onJoinEvent: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  thread: PropTypes.object,
};

export default OgiriEvent;

/*

次は以下の機能をステップバイステップで実装していきましょう。

・一人当たりの回答数制限を設ける
・ベストアンサーの選定機能
・通知機能

これらを実装していきましょう

*/
