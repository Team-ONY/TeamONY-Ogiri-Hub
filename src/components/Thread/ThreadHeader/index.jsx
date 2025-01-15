import {
  VStack,
  Flex,
  Avatar,
  Text,
  Box,
  Icon,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AdminButton } from './AdminButton';
import PropTypes from 'prop-types';
import { CommentInput } from '../Comments/CommentInput';
import { FiClock, FiMessageCircle, FiUser, FiFlag } from 'react-icons/fi';
import { RiVipCrownFill } from 'react-icons/ri';
import { BiSolidLike } from 'react-icons/bi';
import { IoSparklesSharp } from 'react-icons/io5';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export const ThreadHeader = ({
  thread,
  threadCreator,
  currentUser,
  onAdminClick,
  onSubmit,
  error,
}) => {
  if (!thread) return null;

  const commentCount = thread.comments ? thread.comments.length : 0;
  const participantCount = thread.participants ? thread.participants.length : 0;

  return (
    <VStack spacing={6} align="stretch" width="100%" maxWidth="900px" mx="auto">
      <MotionBox
        overflow="hidden"
        borderRadius="30px"
        bg="rgba(0, 0, 0, 0.7)"
        backdropFilter="blur(20px)"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        position="relative"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
      >
        {/* アート要素 - 左上 */}
        <Box
          position="absolute"
          top="-20px"
          left="-20px"
          width="150px"
          height="150px"
          bgGradient="radial(circle at center, pink.400 0%, transparent 70%)"
          opacity="0.15"
          borderRadius="full"
        />

        {/* アート要素 - 右下 */}
        <Box
          position="absolute"
          bottom="-30px"
          right="-30px"
          width="200px"
          height="200px"
          bgGradient="radial(circle at center, purple.500 0%, transparent 70%)"
          opacity="0.1"
          borderRadius="full"
        />

        {/* メインコンテンツ */}
        <Box p={{ base: 4, md: 7 }} position="relative">
          <Flex direction="column" gap={{ base: 4, md: 8 }}>
            {/* ヘッダー部分 */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'flex-start', md: 'center' }}
              justify="space-between"
              gap={{ base: 4, md: 6 }}
            >
              <Flex
                align={{ base: 'flex-start', md: 'center' }}
                direction={{ base: 'column', md: 'row' }}
                gap={{ base: 3, md: 6 }}
              >
                <Box position="relative">
                  <Avatar
                    name={threadCreator?.username || 'Anonymous'}
                    src={threadCreator?.photoURL}
                    size={{ base: 'lg', md: 'xl' }}
                    border="3px solid"
                    borderColor="pink.400"
                    boxShadow="0 0 30px rgba(255, 105, 180, 0.3)"
                  />
                  <Icon
                    as={RiVipCrownFill}
                    position="absolute"
                    top="-4"
                    right="-4"
                    color="pink.400"
                    w={8}
                    h={8}
                  />
                  <Icon
                    as={IoSparklesSharp}
                    position="absolute"
                    bottom="-4"
                    right="-4"
                    color="purple.400"
                    w={8}
                    h={8}
                  />
                </Box>
                <Box>
                  <Flex align="center" gap={3}>
                    <Text
                      color="white"
                      fontSize="xl"
                      fontWeight="bold"
                      bgGradient="linear(to-r, pink.400, purple.500)"
                      backgroundClip="text"
                    >
                      {threadCreator?.username || 'Anonymous'}
                    </Text>
                  </Flex>
                  <HStack spacing={4} mt={2}>
                    <Flex align="center" gap={2}>
                      <Icon as={FiClock} color="pink.400" w={4} h={4} />
                      <Text color="gray.400" fontSize="sm">
                        {thread.createdAt?.toDate
                          ? new Date(
                              thread.createdAt?.toDate()
                            ).toLocaleString()
                          : ''}
                      </Text>
                    </Flex>
                  </HStack>
                </Box>
              </Flex>

              <HStack
                spacing={3}
                alignSelf={{ base: 'flex-end', md: 'center' }}
              >
                {thread &&
                  currentUser &&
                  thread.createdBy === currentUser.uid && (
                    <AdminButton onClick={onAdminClick} size="md" />
                  )}
                <Tooltip label="報告" hasArrow>
                  <IconButton
                    icon={<FiFlag />}
                    variant="ghost"
                    colorScheme="pink"
                    size="md"
                    aria-label="Report"
                    _hover={{ bg: 'rgba(255, 105, 180, 0.1)' }}
                  />
                </Tooltip>
              </HStack>
            </Flex>

            {/* タイトルと内容 */}
            <Box
              bg="rgba(0, 0, 0, 0.3)"
              borderRadius="xl"
              p={{ base: 4, md: 6 }}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                width="3px"
                height="100%"
                bgGradient="linear(to-b, pink.400, purple.500)"
              />
              <Text
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="bold"
                color="white"
                mb={4}
                lineHeight="1.2"
                letterSpacing="tight"
              >
                {thread.title}
              </Text>
              <Text
                color="gray.300"
                fontSize={{ base: 'md', md: 'lg' }}
                lineHeight="1.8"
                letterSpacing="wide"
              >
                {thread.content}
              </Text>
            </Box>

            {/* メタ情報とインタラクション */}
            <Flex
              justify={{ base: 'center', sm: 'space-between' }}
              align="center"
              pt={{ base: 2, md: 4 }}
              gap={{ base: 2, md: 4 }}
            >
              <HStack spacing={{ base: 4, md: 8 }}>
                <MotionFlex
                  align="center"
                  gap={2}
                  cursor="pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  bg="rgba(255, 105, 180, 0.1)"
                  p={2}
                  borderRadius="lg"
                >
                  <Icon as={BiSolidLike} color="pink.400" w={5} h={5} />
                  <Text color="pink.400" fontSize="sm" fontWeight="bold">
                    {thread.likeCount || 0}
                  </Text>
                </MotionFlex>
                <MotionFlex
                  align="center"
                  gap={2}
                  cursor="pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  bg="rgba(255, 105, 180, 0.1)"
                  p={2}
                  borderRadius="lg"
                >
                  <Icon as={FiMessageCircle} color="pink.400" w={5} h={5} />
                  <Text color="pink.400" fontSize="sm" fontWeight="bold">
                    {commentCount || 0}
                  </Text>
                </MotionFlex>
                <Flex
                  align="center"
                  gap={2}
                  bg="rgba(255, 105, 180, 0.1)"
                  p={2}
                  borderRadius="lg"
                >
                  <Icon as={FiUser} color="pink.400" w={5} h={5} />
                  <Text color="pink.400" fontSize="sm" fontWeight="bold">
                    {participantCount || 0}
                  </Text>
                </Flex>
              </HStack>
            </Flex>
          </Flex>
        </Box>
      </MotionBox>

      {/* コメント入力部分 */}
      <Box>
        <CommentInput user={currentUser} onSubmit={onSubmit} error={error} />
      </Box>
    </VStack>
  );
};

ThreadHeader.propTypes = {
  thread: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.object,
    createdBy: PropTypes.string.isRequired,
    commentCount: PropTypes.number,
    comments: PropTypes.array,
    participantCount: PropTypes.number,
    participants: PropTypes.array,
    likeCount: PropTypes.number,
  }),
  threadCreator: PropTypes.shape({
    username: PropTypes.string,
    photoURL: PropTypes.string,
  }),
  currentUser: PropTypes.object,
  onAdminClick: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default ThreadHeader;
