import {
  VStack,
  HStack,
  Text,
  Avatar,
  IconButton,
  Box,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { FiHeart, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useMemo } from 'react';

const MotionBox = motion(Box);

const OgiriAnswer = ({ answer, user, onLike, isLiked, isBestAnswer }) => {
  const formattedDate = new Date(
    answer.createdAt?.toDate?.() || answer.createdAt
  ).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      p={6}
      bg={isBestAnswer ? 'pink.900' : 'whiteAlpha.50'}
      borderRadius="2xl"
      border="1px solid"
      borderColor={isBestAnswer ? 'pink.500' : 'whiteAlpha.100'}
      position="relative"
      overflow="hidden"
      transition="all 0.2s"
    >
      {isBestAnswer && (
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme="pink"
          variant="solid"
          px={3}
          py={1}
          borderRadius="full"
        >
          ベストアンサー（{answer.likes}いいね）
        </Badge>
      )}

      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="2px"
        bgGradient="linear(to-r, transparent, whiteAlpha.200, transparent)"
      />

      <VStack align="stretch" spacing={4}>
        <HStack spacing={4} align="center">
          <Avatar
            size="md"
            src={user?.photoURL}
            name={user?.username}
            border="2px solid"
            borderColor={isLiked ? 'pink.400' : 'whiteAlpha.200'}
          />
          <Box flex={1}>
            <Text fontWeight="bold" color="white" fontSize="md">
              {user?.username}
            </Text>
            <HStack spacing={2} color="whiteAlpha.600" fontSize="xs">
              <FiClock />
              <Text>{formattedDate}</Text>
            </HStack>
          </Box>
          <Flex
            align="center"
            bg={isLiked ? 'whiteAlpha.200' : 'transparent'}
            p={2}
            borderRadius="lg"
            transition="all 0.2s"
          >
            <IconButton
              icon={<FiHeart fill={isLiked ? '#FF1493' : 'none'} />}
              variant="ghost"
              size="sm"
              color={isLiked ? 'pink.400' : 'whiteAlpha.600'}
              onClick={() => onLike(answer.id)}
              aria-label="Like"
              _hover={{
                bg: 'whiteAlpha.100',
                transform: 'scale(1.1)',
              }}
              transition="all 0.2s"
            />
            <Text
              color={isLiked ? 'pink.400' : 'whiteAlpha.600'}
              fontSize="sm"
              ml={1}
              fontWeight="bold"
            >
              {answer.likes}
            </Text>
          </Flex>
        </HStack>

        <Text color="whiteAlpha.900" fontSize="lg" lineHeight="1.7" px={2}>
          {answer.content}
        </Text>
      </VStack>
    </MotionBox>
  );
};

OgiriAnswer.propTypes = {
  answer: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  onLike: PropTypes.func.isRequired,
  isLiked: PropTypes.bool.isRequired,
  isBestAnswer: PropTypes.bool.isRequired,
};

const OgiriAnswers = ({
  answers,
  usersDetails,
  currentUser,
  onLike,
  bestAnswerId = null,
}) => {
  const sortedAnswers = useMemo(() => {
    return [...answers].sort((a, b) => {
      if (a.id === bestAnswerId) return -1;
      if (b.id === bestAnswerId) return 1;
      return 0;
    });
  }, [answers, bestAnswerId]);

  return (
    <VStack spacing={6} w="full" align="stretch" mt={6} px={2}>
      {sortedAnswers.map((answer) => (
        <OgiriAnswer
          key={answer.id}
          answer={answer}
          user={usersDetails[answer.userId]}
          onLike={onLike}
          isLiked={answer.likedBy?.includes(currentUser?.uid)}
          isBestAnswer={answer.id === bestAnswerId}
        />
      ))}
    </VStack>
  );
};

OgiriAnswers.propTypes = {
  answers: PropTypes.array.isRequired,
  usersDetails: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  onLike: PropTypes.func.isRequired,
  bestAnswerId: PropTypes.string,
};

OgiriAnswers.defaultProps = {
  bestAnswerId: null,
  currentUser: null,
};

export default OgiriAnswers;
