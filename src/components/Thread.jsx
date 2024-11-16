import { useState } from 'react';
import {
  Box,
  Heading,
  Button,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tag,
  HStack,
  Grid,
  Portal,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import ThreadList from './ThreadList';
import { motion } from 'framer-motion';
import {
  SearchIcon,
  AddIcon,
  TimeIcon,
  StarIcon,
  ChevronDownIcon,
  CheckIcon,
  ChatIcon,
} from '@chakra-ui/icons';
import ThreadIcon from '../Icons/TheadIcon';

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionMenuItem = motion(MenuItem);
const MotionTag = motion(Tag);

function Thread() {
  const navigate = useNavigate();
  const bgGradient = 'linear(to-br, blackAlpha.800, gray.900)';
  const accentColor = 'pink.400';

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
  };

  return (
    <Box minH="100vh" bg={bgGradient} pt={24} px={4}>
      <MotionBox
        maxW="1200px"
        mx="auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        display="flex"
        flexDirection="column"
        gap={6}
      >
        <Box
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="blur(16px)"
          borderRadius="3xl"
          border="1px solid rgba(255, 255, 255, 0.1)"
          boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
          p={6}
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Flex align="center">
              <ThreadIcon
                style={{ fill: 'url(#gradient)' }}
                boxSize={10}
                mr={4}
                filter="drop-shadow(0 0 12px rgba(236, 72, 153, 0.6))"
              />
              <Heading
                fontSize={{ base: '3xl', md: '4xl' }}
                fontWeight="900"
                letterSpacing="-0.02em"
                bgGradient={`linear(to-r, ${accentColor}, purple.400)`}
                bgClip="text"
                textShadow="0 0 20px rgba(236, 72, 153, 0.3)"
              >
                THREAD FORUM
              </Heading>
            </Flex>

            <MotionButton
              leftIcon={<AddIcon />}
              size="lg"
              onClick={() => navigate('/create-thread')}
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
              新規スレッド作成
            </MotionButton>
          </Flex>

          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6} mb={6}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" h="full">
                <SearchIcon color="gray.400" boxSize={5} />
              </InputLeftElement>
              <Input
                placeholder="スレッドを検索..."
                bg="rgba(255, 255, 255, 0.06)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }}
                _focus={{
                  bg: 'rgba(255, 255, 255, 0.08)',
                  boxShadow: `0 0 0 2px ${accentColor}`,
                  borderColor: 'transparent',
                }}
                borderRadius="2xl"
                fontSize="lg"
                h="60px"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>

            <Menu closeOnSelect={true}>
              {({ isOpen }) => (
                <>
                  <MenuButton
                    as={Button}
                    w="full"
                    rightIcon={
                      <ChevronDownIcon
                        transform={isOpen ? 'rotate(180deg)' : undefined}
                        transition="transform 0.3s"
                      />
                    }
                    bg="rgba(255, 255, 255, 0.06)"
                    color="white"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }}
                    _active={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                    borderRadius="2xl"
                    px={8}
                    h="60px"
                    fontSize="lg"
                    transition="all 0.3s"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    zIndex={10}
                  >
                    <Flex align="center" gap={3}>
                      {sortBy === 'newest' ? (
                        <TimeIcon boxSize={5} />
                      ) : sortBy === 'popular' ? (
                        <StarIcon boxSize={5} />
                      ) : sortBy === 'commentCount' ? ( // 修正箇所
                        <ChatIcon boxSize={5} />
                      ) : null}
                      <Text fontWeight="bold">
                        {sortBy === 'newest'
                          ? '最新順'
                          : sortBy === 'popular'
                            ? '人気順'
                            : sortBy === 'commentCount' // 修正箇所
                              ? 'コメント数順'
                              : ''}
                      </Text>
                    </Flex>
                  </MenuButton>
                  <Portal>
                    <MenuList
                      bg="rgba(0, 0, 0, 0.95)"
                      backdropFilter="blur(16px)"
                      borderColor="whiteAlpha.200"
                      boxShadow="dark-lg"
                      py={3}
                      borderRadius="2xl"
                      position="absolute" // positionをabsoluteに戻す
                      top="10px" // Menuの下に来るように調整
                      left="60px" // Menuの左端に合わせるように調整
                      zIndex={20}
                    >
                      {[
                        { value: 'newest', icon: TimeIcon, label: '最新順' },
                        { value: 'popular', icon: StarIcon, label: '人気順' },
                        {
                          value: 'commentCount',
                          icon: ChatIcon,
                          label: 'コメント数順',
                        },
                      ].map(({ value, icon: Icon, label }) => (
                        <MotionMenuItem
                          key={value}
                          _hover={{ bg: 'whiteAlpha.200' }}
                          _focus={{ bg: 'whiteAlpha.200' }}
                          color="white"
                          transition="all 0.3s"
                          whileHover={{ x: 5 }}
                          px={6}
                          py={4}
                          bg="transparent"
                          onClick={() => handleSortChange(value)}
                        >
                          <Flex align="center" justify="space-between" w="full">
                            <Flex align="center" gap={3}>
                              <Icon boxSize={5} />
                              <Text fontSize="lg">{label}</Text>
                            </Flex>
                            {sortBy === value && (
                              <CheckIcon color={accentColor} boxSize={5} />
                            )}
                          </Flex>
                        </MotionMenuItem>
                      ))}
                    </MenuList>
                  </Portal>
                </>
              )}
            </Menu>
          </Grid>

          <HStack
            spacing={4}
            overflow="auto"
            py={2}
            sx={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {['すべて', '議論', '質問', '雑談', '趣味', '技術'].map(
              (tag, index) => (
                <MotionTag
                  key={tag}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  size="lg"
                  variant="solid"
                  bg={
                    tag === 'すべて'
                      ? `linear-gradient(135deg, ${accentColor}, purple.400)`
                      : 'rgba(255, 255, 255, 0.06)'
                  }
                  color="white"
                  cursor="pointer"
                  px={6}
                  py={3}
                  borderRadius="2xl"
                  fontSize="md"
                  fontWeight="bold"
                  letterSpacing="wide"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                >
                  <Flex align="center" gap={2}>
                    {tag === 'すべて' && (
                      <StarIcon
                        boxSize={4}
                        filter="drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))"
                      />
                    )}
                    {tag}
                  </Flex>
                </MotionTag>
              )
            )}
          </HStack>
        </Box>

        <MotionBox
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="blur(16px)"
          borderRadius="3xl"
          p={8}
          boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ThreadList searchTerm={searchTerm} sortBy={sortBy} layout="grid" />
        </MotionBox>
      </MotionBox>
    </Box>
  );
}

export default Thread;
