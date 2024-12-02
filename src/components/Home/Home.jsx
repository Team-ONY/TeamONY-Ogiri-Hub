// src/components/Home/Home.jsx
import { keyframes } from '@emotion/react';
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
  Button,
  Container,
  Select,
  IconButton,
  SimpleGrid,
  Progress,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaCrown,
  FaCoffee,
  FaNewspaper,
  FaStar,
  FaPen,
  FaRegComment,
  FaShareAlt,
  FaBell,
  FaUsers,
} from 'react-icons/fa';
import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import CreateThreadModal from '../Thread/CreateThreadModal';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 30px rgba(138, 43, 226, 0.2); }
  50% { box-shadow: 0 0 50px rgba(255, 20, 147, 0.3); }
  100% { box-shadow: 0 0 30px rgba(138, 43, 226, 0.2); }
`;

function Home() {
  const accentColor = 'pink.400';
  const bgGradient = 'linear(to-br, blackAlpha.800, gray.900)';
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      minH="110vh"
      bg={bgGradient}
      position="relative"
      overflowY="auto"
      color="white"
    >
      <Container maxW="1600px" py={{ base: 6, md: 12 }} px={{ base: 4, md: 8 }}>
        {/* ヘッダーセクション */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="blur(16px)"
          borderRadius="3xl"
          border="1px solid rgba(255, 255, 255, 0.1)"
          boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
          p={8}
          mb={6}
        >
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'start', md: 'center' }}
            gap={6}
          >
            <VStack align="start" spacing={3}>
              <Heading
                fontSize={{ base: '3xl', md: '4xl' }}
                fontWeight="900"
                letterSpacing="-0.02em"
              >
                <Text
                  as="span"
                  bgGradient={`linear(to-r, ${accentColor}, purple.400)`}
                  bgClip="text"
                  textShadow="0 0 20px rgba(236, 72, 153, 0.3)"
                >
                  OgiriHub
                </Text>
              </Heading>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="whiteAlpha.800">
                面白いスレッドに参加して、みんなで大喜利を楽しもう！
              </Text>
            </VStack>
            <MotionButton
              leftIcon={<Icon as={FaPen} />}
              size="lg"
              onClick={onOpen} // モーダルを開く
              css={{ animation: `${glowAnimation} 1.5s infinite` }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 25px rgba(236, 72, 153, 0.5)',
              }}
              whileTap={{ scale: 0.95 }}
              borderRadius="2xl"
              px={8}
              py={6}
              bgGradient={`linear(to-r, ${accentColor}, purple.400)`}
              _hover={{
                bgGradient: 'linear(to-r, pink.500, purple.500)',
              }}
              boxShadow="0 0 30px rgba(236, 72, 153, 0.3)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              fontSize="lg"
              fontWeight="bold"
            >
              スレッドを作成
            </MotionButton>
            <CreateThreadModal isOpen={isOpen} onClose={onClose} />
          </Flex>

          {/* カテゴリータブ */}
          <ScrollMenu>
            <HStack spacing={4} py={6}>
              {[
                { name: '人気スレッド', icon: FaCrown, color: '#FFD700' },
                { name: '新着スレッド', icon: FaNewspaper, color: '#4CAF50' },
                { name: '参加中', icon: FaCoffee, color: '#FF9800' },
                { name: '開催中大会', icon: FaStar, color: '#2196F3' },
              ].map((category) => (
                <MotionButton
                  key={category.name}
                  leftIcon={<Icon as={category.icon} color={category.color} />}
                  bg="rgba(255, 255, 255, 0.06)"
                  color="white"
                  borderRadius="2xl"
                  px={6}
                  py={5}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  fontSize="md"
                  fontWeight="bold"
                >
                  {category.name}
                </MotionButton>
              ))}
            </HStack>
          </ScrollMenu>
        </MotionBox>

        {/* メインコンテンツグリッド */}
        <Grid
          templateColumns={{ base: '1fr', lg: '3fr 1fr' }}
          gap={{ base: 6, lg: 10 }}
        >
          <GridItem>
            <VStack spacing={6}>
              {/* アクティブなスレッド */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                bg="rgba(0, 0, 0, 0.4)"
                backdropFilter="blur(16px)"
                borderRadius="3xl"
                border="1px solid rgba(255, 255, 255, 0.1)"
                boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
                p={8}
                w="full"
              >
                <Badge
                  colorScheme="purple"
                  position="absolute"
                  top={4}
                  right={4}
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  開催中の大会
                </Badge>
                <VStack align="start" spacing={6}>
                  <Box>
                    <Text color="whiteAlpha.600" mb={2}>
                      人気スレッド
                    </Text>
                    <Heading size="lg">
                      「今日の仕事帰りあるある」で大喜利大会開催中！
                    </Heading>
                  </Box>
                  <HStack spacing={6}>
                    <VStack align="start">
                      <Text color="whiteAlpha.600" fontSize="sm">
                        参加者数
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="#FF1493">
                        24名
                      </Text>
                    </VStack>
                    <VStack align="start">
                      <Text color="whiteAlpha.600" fontSize="sm">
                        現在の回答数
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="#8A2BE2">
                        128件
                      </Text>
                    </VStack>
                    <VStack align="start">
                      <Text color="whiteAlpha.600" fontSize="sm">
                        残り時間
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="#FFD700">
                        02:45:30
                      </Text>
                    </VStack>
                  </HStack>
                  <Button
                    variant="outline"
                    borderColor="#FF1493"
                    color="white"
                    _hover={{
                      bg: 'rgba(255, 20, 147, 0.1)',
                    }}
                    width="full"
                    height="50px"
                  >
                    このスレッドに参加する
                  </Button>
                </VStack>
              </MotionBox>

              {/* 人気のスレッド一覧 */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                bg="rgba(0, 0, 0, 0.4)"
                backdropFilter="blur(16px)"
                borderRadius="3xl"
                border="1px solid rgba(255, 255, 255, 0.1)"
                boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
                p={8}
                w="full"
              >
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="md">人気のスレッド</Heading>
                  <HStack spacing={4}>
                    <Select
                      bg="rgba(255, 255, 255, 0.05)"
                      border="none"
                      color="whiteAlpha.700"
                      width="150px"
                      size="sm"
                    >
                      <option value="latest">新着順</option>
                      <option value="popular">参加者数順</option>
                      <option value="active">アクティブ順</option>
                    </Select>
                  </HStack>
                </Flex>

                <VStack spacing={6} align="stretch">
                  {/* スレッドカード */}
                  {[1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      bg="rgba(255, 255, 255, 0.03)"
                      borderRadius="16px"
                      p={6}
                      _hover={{
                        bg: 'rgba(255, 255, 255, 0.05)',
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={4} mb={4}>
                        <Avatar size="sm" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold">スレッド主の名前</Text>
                          <Text color="whiteAlpha.600" fontSize="sm">
                            2時間前に開始
                          </Text>
                        </VStack>
                        {i === 1 && (
                          <Badge colorScheme="yellow" ml="auto">
                            🔥 HOT
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="lg" mb={4}>
                        「休日の過ごし方あるある」で大喜利しましょう！
                      </Text>
                      <HStack spacing={4}>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Icon as={FaUsers} />}
                          color="whiteAlpha.600"
                          _hover={{ color: 'white' }}
                        >
                          参加者 15名
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Icon as={FaRegComment} />}
                          color="whiteAlpha.600"
                          _hover={{ color: 'white' }}
                        >
                          回答 82件
                        </Button>
                        <IconButton
                          aria-label="Share thread"
                          icon={<FaShareAlt />}
                          variant="ghost"
                          size="sm"
                          color="whiteAlpha.600"
                          _hover={{ color: 'white' }}
                        />
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </MotionBox>
            </VStack>
          </GridItem>

          {/* サイドバー */}
          <GridItem display={{ base: 'none', lg: 'block' }}>
            <VStack spacing={6}>
              {/* ユーザーランキング */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                bg="rgba(0, 0, 0, 0.4)"
                backdropFilter="blur(16px)"
                borderRadius="3xl"
                border="1px solid rgba(255, 255, 255, 0.1)"
                boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
                p={6}
                w="full"
              >
                <Heading
                  size="md"
                  mb={6}
                  bgGradient="linear(to-r, #8A2BE2, #FF1493)"
                  bgClip="text"
                >
                  週間ランキング
                </Heading>
                <VStack spacing={4} align="stretch">
                  {[1, 2, 3].map((rank) => (
                    <Flex
                      key={rank}
                      align="center"
                      p={4}
                      bg="rgba(255, 255, 255, 0.03)"
                      borderRadius="16px"
                      position="relative"
                      overflow="hidden"
                    >
                      <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        color={rank === 1 ? '#FFD700' : 'whiteAlpha.600'}
                        mr={4}
                      >
                        {rank}
                      </Text>
                      <Avatar size="md" mr={4} />
                      <Box>
                        <Text fontWeight="600">大喜利の達人</Text>
                        <Text color="whiteAlpha.600" fontSize="sm">
                          獲得ポイント: {1000 - rank * 200}pt
                        </Text>
                      </Box>
                      {rank === 1 && (
                        <Icon
                          as={FaCrown}
                          color="#FFD700"
                          position="absolute"
                          top={2}
                          right={2}
                        />
                      )}
                    </Flex>
                  ))}
                </VStack>
              </MotionBox>

              {/* おすすめスレッド */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                bg="rgba(0, 0, 0, 0.4)"
                backdropFilter="blur(16px)"
                borderRadius="3xl"
                border="1px solid rgba(255, 255, 255, 0.1)"
                boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
                p={6}
                w="full"
              >
                <Heading size="md" mb={6}>
                  おすすめスレッド
                </Heading>
                <VStack
                  spacing={4}
                  align="stretch"
                  bg="rgba(255, 255, 255, 0.03)"
                  borderRadius="16px"
                  p={4}
                >
                  <Text color="whiteAlpha.600">開催予定の大会</Text>
                  <Badge colorScheme="purple" alignSelf="start">
                    21:00開始
                  </Badge>
                  <Text fontSize="lg" fontWeight="bold">
                    「今日あった小さな幸せ」
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Icon as={FaBell} />}
                    color="whiteAlpha.600"
                  >
                    リマインドを設定
                  </Button>
                </VStack>
              </MotionBox>

              {/* 獲得バッジ */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                bg="rgba(0, 0, 0, 0.4)"
                backdropFilter="blur(16px)"
                borderRadius="3xl"
                border="1px solid rgba(255, 255, 255, 0.1)"
                boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
                p={6}
                w="full"
              >
                <Heading size="md" mb={6}>
                  あなたの獲得バッジ
                </Heading>
                <SimpleGrid columns={3} spacing={4}>
                  {[
                    { emoji: '🏆', name: '大会優勝', count: 3 },
                    { emoji: '⭐', name: 'スレ主', count: 5 },
                    { emoji: '🎯', name: '的確王', count: 5 },
                    { emoji: '🔥', name: '盛り上げ王', count: 2 },
                    { emoji: '💎', name: '常連さん', count: 4 },
                    { emoji: '🌟', name: '新人賞', count: 1 },
                  ].map((badge) => (
                    <VStack
                      key={badge.name}
                      bg="rgba(255, 255, 255, 0.03)"
                      borderRadius="lg"
                      p={3}
                      spacing={1}
                      _hover={{
                        bg: 'rgba(255, 255, 255, 0.05)',
                        transform: 'translateY(-2px)',
                      }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <Text fontSize="2xl">{badge.emoji}</Text>
                      <Text fontSize="xs" color="whiteAlpha.700">
                        {badge.name}
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        ×{badge.count}
                      </Text>
                    </VStack>
                  ))}
                </SimpleGrid>
              </MotionBox>

              {/* アチーブメント進捗 */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                bg="rgba(0, 0, 0, 0.4)"
                backdropFilter="blur(16px)"
                borderRadius="3xl"
                border="1px solid rgba(255, 255, 255, 0.1)"
                boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
                p={6}
                w="full"
              >
                <Heading size="md" mb={6}>
                  次のアチーブメントまで
                </Heading>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text color="whiteAlpha.700">スレッド参加マスター</Text>
                      <Text color="whiteAlpha.900">80/100 参加</Text>
                    </Flex>
                    <Progress
                      value={80}
                      colorScheme="purple"
                      borderRadius="full"
                      size="sm"
                    />
                  </Box>
                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text color="whiteAlpha.700">大喜利王への道</Text>
                      <Text color="whiteAlpha.900">25/30 優勝</Text>
                    </Flex>
                    <Progress
                      value={83}
                      colorScheme="pink"
                      borderRadius="full"
                      size="sm"
                    />
                  </Box>
                </VStack>
              </MotionBox>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;
