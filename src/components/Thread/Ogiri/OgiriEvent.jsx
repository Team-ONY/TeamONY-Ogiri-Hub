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
  Collapse,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiClock,
  FiArrowRight,
  FiCheck,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import {
  getEventParticipantsDetails,
  submitOgiriAnswer,
  toggleAnswerLike,
  getUserAnswerCount,
  getBestAnswer,
  checkEventExpirationAndSetBestAnswer,
  calculateRemainingTime,
} from '../../../services/ogiriService';
import OgiriAnswers from './OgiriAnswers';
import { useAlert } from '../../../hooks/useAlert';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';
const MotionBox = motion(Box);

const OgiriEvent = ({ event, creator, onJoinEvent, currentUser }) => {
  const [isParticipating, setIsParticipating] = useState(false);
  const [participantsDetails, setParticipantsDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen: isAnswersOpen, onToggle: toggleAnswers } = useDisclosure();
  const [isExpired, setIsExpired] = useState(false);
  const [userAnswerCount, setUserAnswerCount] = useState(0);
  const [bestAnswerId, setBestAnswerId] = useState(null);
  const { showAlert } = useAlert();
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    setIsParticipating(event.participants?.includes(currentUser?.uid) || false);
  }, [event.participants, currentUser]);

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
    if (!event.id || !isAnswersOpen) return;

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
        const newAnswers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        setAnswers(newAnswers);
      },
      (error) => {
        console.error('Error listening to answers:', error);
      }
    );

    return () => unsubscribe();
  }, [event.id, event.threadId, isAnswersOpen]);

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
  }, [currentUser, isParticipating]);

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
    if (!answer.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await submitOgiriAnswer(
        event.threadId,
        event.id,
        currentUser.uid,
        answer.trim(),
        event.maxResponses
      );

      setAnswer('');
      setUserAnswerCount((prev) => prev + 1);
    } catch (error) {
      console.error('Error submitting answer:', error);
      showAlert(error.message || '回答の投稿に失敗しました', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (answerId) => {
    if (!currentUser) return;

    try {
      await toggleAnswerLike(
        event.threadId,
        event.id,
        answerId,
        currentUser.uid
      );
      // 回答リストを更新
      const updatedAnswers = answers.map((ans) => {
        if (ans.id === answerId) {
          const isLiked = ans.likedBy?.includes(currentUser.uid);
          return {
            ...ans,
            likes: isLiked ? ans.likes - 1 : ans.likes + 1,
            likedBy: isLiked
              ? ans.likedBy.filter((id) => id !== currentUser.uid)
              : [...(ans.likedBy || []), currentUser.uid],
          };
        }
        return ans;
      });
      setAnswers(updatedAnswers);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg="linear-gradient(135deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)"
      backdropFilter="blur(20px)"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      p={6}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background:
          'radial-gradient(circle, rgba(255, 20, 147, 0.1) 0%, transparent 70%)',
        transform: 'rotate(-45deg)',
        pointerEvents: 'none',
      }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="2px"
        bgGradient="linear(to-r, pink.400, purple.500)"
      />

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
                  placeholder="回答を入力..."
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
                  lineHeight="80px" // 100pxから80pxに変更して上に移動
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

        <Box mt={4}>
          <Button
            onClick={toggleAnswers}
            variant="ghost"
            color="whiteAlpha.800"
            width="100%"
            rightIcon={
              <Icon as={isAnswersOpen ? FiChevronUp : FiChevronDown} />
            }
          >
            回答を{isAnswersOpen ? '閉じる' : '見る'}
          </Button>
          <Collapse in={isAnswersOpen}>
            <VStack spacing={4} mt={4}>
              <OgiriAnswers
                answers={answers}
                currentUser={currentUser}
                onLike={handleLike}
                bestAnswerId={bestAnswerId}
                isExpired={isExpired}
              />
            </VStack>
          </Collapse>
        </Box>
      </Flex>
    </MotionBox>
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
  }).isRequired,
  creator: PropTypes.object.isRequired,
  onJoinEvent: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
};

export default OgiriEvent;

/*

次は以下の機能をステップバイステップで実装していきましょう。

・一人当たりの回答数制限を設ける
・ベストアンサーの選定機能
・通知機能

これらを実装していきましょう

*/
