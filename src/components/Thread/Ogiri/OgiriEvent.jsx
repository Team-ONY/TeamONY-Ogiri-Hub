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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiUsers, FiClock, FiArrowRight, FiCheck } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import {
  getEventParticipantsDetails,
  getOgiriAnswers,
  submitOgiriAnswer,
  toggleAnswerLike,
  getUserAnswerCount,
  getBestAnswer,
  checkEventExpirationAndSetBestAnswer,
  calculateRemainingTime,
} from '../../../services/ogiriService';
import OgiriAnswers from './OgiriAnswers';
import { useAlert } from '../../../hooks/useAlert';
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
    const fetchAnswers = async () => {
      if (!event.id || !isAnswersOpen) return;

      try {
        const fetchedAnswers = await getOgiriAnswers(event.threadId, event.id);
        setAnswers(fetchedAnswers);
      } catch (error) {
        console.error('Error fetching answers:', error);
      }
    };

    fetchAnswers();
  }, [event.id, isAnswersOpen, event.threadId]);

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
      const newAnswer = await submitOgiriAnswer(
        event.threadId,
        event.id,
        currentUser.uid,
        answer.trim(),
        event.maxResponses
      );

      setAnswers((prev) => [newAnswer, ...prev]);
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
      boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
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

          <Flex justify="space-between" align="center" mt={4}>
            <HStack spacing={2} overflow="hidden">
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
              <Text color="whiteAlpha.800" fontSize="sm">
                {event.participants?.length || 0}人が参加中
              </Text>
            </HStack>

            <Button
              onClick={handleJoinClick}
              isLoading={isLoading}
              bgGradient={
                isParticipating
                  ? 'linear(to-r, green.400, teal.400)'
                  : 'linear(to-r, pink.400, purple.400)'
              }
              color="white"
              px={6}
              py={6}
              fontSize="md"
              rightIcon={<Icon as={isParticipating ? FiCheck : FiArrowRight} />}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(255, 20, 147, 0.3)',
              }}
              _active={{
                transform: 'translateY(0)',
                boxShadow: 'none',
              }}
              borderRadius="xl"
              transition="all 0.2s"
            >
              {isParticipating ? '参加中' : '大喜利に参加する'}
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

        <HStack spacing={4} mt={4}>
          <Badge
            colorScheme={isExpired ? 'red' : 'green'}
            variant="solid"
            px={3}
            py={1}
            borderRadius="full"
          >
            {remainingTime}
          </Badge>
        </HStack>

        {!isExpired && isParticipating && (
          <VStack spacing={4} mt={6} align="stretch">
            <Box>
              <Text color="whiteAlpha.700" fontSize="sm" mb={2}>
                残り回答可能数: {event.maxResponses - userAnswerCount}回
              </Text>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="回答を入力..."
                isDisabled={isExpired || userAnswerCount >= event.maxResponses}
                bg="whiteAlpha.100"
                border="1px solid"
                borderColor="whiteAlpha.200"
                _hover={{ borderColor: 'pink.400' }}
                _focus={{
                  borderColor: 'pink.400',
                  boxShadow: '0 0 0 1px #FF1493',
                }}
                resize="none"
              />
            </Box>
            <Button
              onClick={handleSubmitAnswer}
              isLoading={isSubmitting}
              isDisabled={
                isExpired ||
                userAnswerCount >= event.maxResponses ||
                !answer.trim()
              }
              colorScheme="pink"
              alignSelf="flex-end"
            >
              回答を送信
            </Button>
            {userAnswerCount >= event.maxResponses && (
              <Text color="pink.400" fontSize="sm" textAlign="center">
                回答数の上限に達しました
              </Text>
            )}
          </VStack>
        )}

        {isExpired && (
          <Box
            mt={6}
            p={4}
            bg="whiteAlpha.100"
            borderRadius="xl"
            textAlign="center"
          >
            <Text color="whiteAlpha.800">この大喜利は終了しました</Text>
          </Box>
        )}

        <Button
          onClick={toggleAnswers}
          variant="ghost"
          width="full"
          mt={4}
          color="whiteAlpha.700"
        >
          {isAnswersOpen ? '回答を隠す' : '回答を表示'}
        </Button>

        {isAnswersOpen && (
          <OgiriAnswers
            answers={answers}
            usersDetails={participantsDetails}
            currentUser={currentUser}
            onLike={handleLike}
            bestAnswerId={bestAnswerId}
            isExpired={isExpired}
          />
        )}
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
