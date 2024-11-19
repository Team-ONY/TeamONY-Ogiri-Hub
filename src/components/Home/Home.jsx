import PropTypes from 'prop-types';
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  Flex,
  Icon,
  VStack,
  HStack,
  Avatar,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaFire, FaUsers, FaChartLine, FaRegBookmark } from 'react-icons/fa';
import ThreadList from '../Thread/ThreadList';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

function StatCard({ icon, label, value }) {
  return (
    <MotionBox
      p={4}
      bg="whiteAlpha.100"
      borderRadius="lg"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      backdropFilter="blur(8px)"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
    >
      <Stat>
        <Flex align="center" mb={2}>
          <Icon as={icon} color="pink.400" boxSize={5} mr={2} />
          <StatLabel color="gray.300">{label}</StatLabel>
        </Flex>
        <StatNumber fontSize="2xl" fontWeight="bold" color="white">
          {value}
        </StatNumber>
      </Stat>
    </MotionBox>
  );
}

// PropTypesの定義
StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

function TrendingThread({ title, author, comments, likes }) {
  return (
    <MotionFlex
      align="center"
      justify="space-between"
      p={4}
      bg="whiteAlpha.100"
      borderRadius="lg"
      mb={3}
      whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
      cursor="pointer"
      backdropFilter="blur(8px)"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
    >
      <Flex align="center">
        <Icon as={FaFire} color="orange.400" mr={3} />
        <Box>
          <Text color="white" fontWeight="semibold">
            {title}
          </Text>
          <Text color="gray.400" fontSize="sm">
            by {author}
          </Text>
        </Box>
      </Flex>
      <HStack spacing={4}>
        <Badge colorScheme="pink">{comments} コメント</Badge>
        <Badge colorScheme="purple">{likes} いいね</Badge>
      </HStack>
    </MotionFlex>
  );
}

// PropTypesの定義
TrendingThread.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  comments: PropTypes.string.isRequired,
  likes: PropTypes.string.isRequired,
};

function Home() {
  const bgGradient = 'linear(to-br, blackAlpha.800, gray.900)';

  return (
    <Box minH="100vh" bg={bgGradient} pt={20} px={4}>
      <Grid
        maxW="1400px"
        mx="auto"
        templateColumns={{ base: '1fr', lg: '3fr 1fr' }}
        gap={6}
      >
        <GridItem>
          {/* メインコンテンツエリア */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* ウェルカムセクション */}
            <Flex
              justify="space-between"
              align="center"
              mb={8}
              bg="blackAlpha.500"
              p={6}
              borderRadius="xl"
              backdropFilter="blur(10px)"
            >
              <Box>
                <Heading
                  color="white"
                  size="lg"
                  bgGradient="linear(to-r, pink.400, purple.400)"
                  bgClip="text"
                >
                  Welcome to OgiriHub 🎉
                </Heading>
                <Text color="gray.300" mt={2}>
                  今日も活発な議論が行われています
                </Text>
              </Box>
            </Flex>

            {/* 統計カード */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
              gap={4}
              mb={8}
            >
              <StatCard
                icon={FaUsers}
                label="アクティブユーザー"
                value="2,345"
              />
              <StatCard icon={FaChartLine} label="今日の投稿数" value="156" />
              <StatCard
                icon={FaRegBookmark}
                label="保存済みスレッド"
                value="23"
              />
            </Grid>

            {/* スレッド一覧 */}
            <MotionBox
              bg="blackAlpha.500"
              borderRadius="xl"
              p={6}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              backdropFilter="blur(10px)"
            >
              <Heading size="md" color="white" mb={6}>
                最新のスレッド
              </Heading>
              <ThreadList layout="list" />
            </MotionBox>
          </MotionBox>
        </GridItem>

        {/* サイドバー */}
        <GridItem display={{ base: 'none', lg: 'block' }}>
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* トレンドセクション */}
            <Box
              bg="blackAlpha.500"
              borderRadius="xl"
              p={6}
              mb={6}
              backdropFilter="blur(10px)"
            >
              <Heading size="md" color="white" mb={4}>
                トレンド
              </Heading>
              <VStack spacing={3} align="stretch">
                <TrendingThread
                  title="新機能について議論"
                  author="Tech_Master"
                  comments="45"
                  likes="123"
                />
                <TrendingThread
                  title="週末のイベント告知"
                  author="Event_Organizer"
                  comments="32"
                  likes="89"
                />
                <TrendingThread
                  title="初心者質問コーナー"
                  author="Newbie_Helper"
                  comments="67"
                  likes="156"
                />
              </VStack>
            </Box>

            {/* アクティブユーザー */}
            <Box
              bg="blackAlpha.500"
              borderRadius="xl"
              p={6}
              backdropFilter="blur(10px)"
            >
              <Heading size="md" color="white" mb={4}>
                アクティブユーザー
              </Heading>
              <VStack align="stretch" spacing={4}>
                {[1, 2, 3, 4].map((i) => (
                  <Flex key={i} align="center">
                    <Avatar size="sm" mr={3} />
                    <Box>
                      <Text color="white" fontSize="sm" fontWeight="medium">
                        ユーザー{i}
                      </Text>
                      <Text color="gray.400" fontSize="xs">
                        最終アクティブ: 3分前
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </VStack>
            </Box>
          </MotionBox>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default Home;
