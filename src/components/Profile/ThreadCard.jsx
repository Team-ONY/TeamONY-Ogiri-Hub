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
              <Text bgGradient="linear(to-r, pink.400, purple.400)" bgClip="text" fontWeight="bold">
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

ThreadCard.propTypes = {
  threads: PropTypes.arrayOf(                 // `threads` プロパティは配列
    PropTypes.shape({                         // 配列の各要素はオブジェクトで以下の構造を持つ
      id: PropTypes.string.isRequired,        // `id` は必須で文字列型
      title: PropTypes.string.isRequired,     // `title` は必須で文字列型
      coment: PropTypes.string,               // `coment` は任意で文字列型
      createdAt: PropTypes.object.isRequired, // `createdAt` は必須でオブジェクト型 (Firebase Timestamp)
    })
  ).isRequired,                               // `threads` プロパティ自体も必須
  user: PropTypes.shape({                     // `user` プロパティはオブジェクト
    displayName: PropTypes.string.isRequired, // `displayName` は必須で文字列型
    photoURL: PropTypes.string.isRequired,    // `photoURL` は必須で文字列型
  }),
};
ThreadCard.defaultProps = {
  user: { displayName: 'Anonymous', photoURL: '' },
};

export default ThreadCard;
