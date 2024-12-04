import { Box, VStack, Text, Avatar, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { PropTypes } from 'prop-types';

const MotionBox = motion(Box);

const ThreadCard = ({ threads, user }) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    mb={6}
    bg="rgba(255, 255, 255, 0.05)"
    borderRadius="xl"
    p={6}
    backdropFilter="blur(10px)"
    boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
    border="1px solid rgba(255, 255, 255, 0.1)"
    maxH="400px" // カードの最大高さを指定
    overflowY="auto" // 縦スクロールを有効化
  >
    {/* ヘッダー */}
    <VStack align="start" spacing={4} mb={4}>
      <HStack spacing={3} align="center">
        <Avatar
          size="md" //ここで名前とアイコン表示中
          name={user ? user.displayName : 'Anonymous'}
          src={user?.photoURL || 'defaultPhotoURL'}
          border="2px solid"
          borderColor="purple.500"
        />
        <Text color="whiteAlpha.800" fontSize="lg" fontWeight="bold">
          自分のスレッド
        </Text>
      </HStack>
    </VStack>

    {/* スレッドリスト */}
    <VStack spacing={4}>
      {threads.map((thread) => (
        <Box
          key={thread.id}
          bg="rgba(255, 255, 255, 0.02)"
          p={4}
          borderRadius="lg"
          _hover={{
            bg: 'rgba(255, 255, 255, 0.05)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s',
          }}
          w="100%"
        >
          <HStack justify="space-between" align="start">
            {/* タイトル */}
            <VStack align="start" spacing={1}>
              <Text color="white" fontWeight="bold">
                {thread.title}
              </Text>
              <Text color="whiteAlpha.700" fontSize="sm">
                {thread.content || 'No description available.'}
              </Text>
            </VStack>
            {/* 日付 */}
            <Text color="whiteAlpha.500" fontSize="xs">
              {new Date(thread.createdAt.seconds * 1000).toLocaleDateString()}
            </Text>
          </HStack>
        </Box>
      ))}
    </VStack>
  </MotionBox>
);

ThreadCard.propTypes = {
  threads: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.object.isRequired,
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      coment: PropTypes.string,
      createdAt: PropTypes.object.isRequired, // Firebase Timestamp
    })
  ).isRequired,
};

export default ThreadCard;
