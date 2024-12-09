import { Box, VStack, Text, Avatar, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const MotionBox = motion(Box);

const JoinedThreadCard = ({ threads, user }) => (
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
    maxH="400px" // 最大高さを設定
    overflowY="auto" // スクロール可能に
  >
    {/* ヘッダー */}
    <VStack align="start" spacing={4} mb={4}>
      <HStack spacing={3} align="center">
        <Avatar
          size="md"
          name={user ? user.displayName : 'Anonymous'}
          src={user?.photoURL || 'defaultPhotoURL'}
          border="2px solid"
          borderColor="blue.500"
        />
        <Text color="whiteAlpha.800" fontSize="lg" fontWeight="bold">
          参加スレッド
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
              {/*スレッドコメント*/}
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

JoinedThreadCard.propTypes = {
  threads: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,        // スレッドの一意なID（必須）
      title: PropTypes.string.isRequired,     // スレッドのタイトル（必須）
      content: PropTypes.string,              // スレッドの内容（任意）
      createdAt: PropTypes.object.isRequired, // 作成日時（Firebase Timestamp）（必須）
    })
  ).isRequired, // threads自体が必須
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,  // ユーザー名（必須）
    photoURL: PropTypes.string.isRequired,     // ユーザーのプロフィール画像のURL（必須）
  }),
};
JoinedThreadCard.defaultProps = {
  user: { displayName: 'Anonymous', photoURL: '' },
};

export default JoinedThreadCard;