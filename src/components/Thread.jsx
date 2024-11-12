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
    <Box minH="100vh" bg={bgGradient} pt={20} px={4}>
      <MotionBox
        maxW="1200px"
        mx="auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Flex justify="space-between" align="center" mb={8}>
          <Flex align="center">
            <ThreadIcon style={{ fill: 'white' }} boxSize={6} mr={2} />
            <Heading
              color="white"
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="bold"
              bgGradient={`linear(to-r, ${accentColor}, purple.400)`}
              bgClip="text"
            >
              THREAD FORUM
            </Heading>
          </Flex>

          <MotionButton
            leftIcon={<AddIcon />}
            colorScheme="pink"
            size="md"
            onClick={() => navigate('/create-thread')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            borderRadius="lg"
            bgGradient={`linear(to-r, ${accentColor}, purple.400)`}
            _hover={{
              bgGradient: 'linear(to-r, pink.500, purple.500)',
            }}
          >
            新規スレッド作成
          </MotionButton>
        </Flex>

        <Flex
          gap={4}
          mb={8}
          direction={{ base: 'column', md: 'row' }}
          align="center"
        >
          <InputGroup maxW={{ base: '100%', md: '400px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="スレッドを検索..."
              bg="whiteAlpha.100"
              border="none"
              color="white"
              _placeholder={{ color: 'gray.400' }}
              _hover={{ bg: 'whiteAlpha.200' }}
              _focus={{
                bg: 'whiteAlpha.200',
                boxShadow: `0 0 0 1px ${accentColor}`,
                borderColor: 'transparent',
              }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </InputGroup>

          <Menu closeOnSelect={true}>
            {({ isOpen }) => (
              <>
                <MenuButton
                  as={Button}
                  rightIcon={
                    <ChevronDownIcon
                      transform={isOpen ? 'rotate(180deg)' : undefined}
                      transition="transform 0.2s"
                    />
                  }
                  bg="whiteAlpha.100"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  _active={{ bg: 'whiteAlpha.300' }}
                  borderRadius="lg"
                  px={6}
                  h="40px"
                  transition="all 0.2s"
                  backdropFilter="blur(8px)"
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                >
                  <Flex align="center" gap={2}>
                    <TimeIcon />
                    <Text>
                      {sortBy === 'newest'
                        ? '最新順'
                        : sortBy === 'popular'
                          ? '人気順'
                          : 'コメント数順'}
                    </Text>
                  </Flex>
                </MenuButton>
                <MenuList
                  bg="rgba(0, 0, 0, 0.9)"
                  backdropFilter="blur(16px)"
                  borderColor="whiteAlpha.200"
                  boxShadow="dark-lg"
                  py={2}
                >
                  <MotionMenuItem
                    _hover={{ bg: 'whiteAlpha.200' }}
                    _focus={{ bg: 'whiteAlpha.200' }}
                    color="white"
                    transition="all 0.2s"
                    whileHover={{ x: 5 }}
                    px={4}
                    py={3}
                    bg="transparent"
                    onClick={() => handleSortChange('newest')}
                  >
                    <Flex align="center" justify="space-between" w="full">
                      <Flex align="center" gap={3}>
                        <TimeIcon />
                        <Text>最新順</Text>
                      </Flex>
                      {sortBy === 'newest' && <CheckIcon color={accentColor} />}
                    </Flex>
                  </MotionMenuItem>
                  <MotionMenuItem
                    _hover={{ bg: 'whiteAlpha.200' }}
                    _focus={{ bg: 'whiteAlpha.200' }}
                    color="white"
                    transition="all 0.2s"
                    whileHover={{ x: 5 }}
                    px={4}
                    py={3}
                    bg="transparent"
                    onClick={() => handleSortChange('popular')}
                  >
                    <Flex align="center" justify="space-between" w="full">
                      <Flex align="center" gap={3}>
                        <StarIcon />
                        <Text>人気順</Text>
                      </Flex>
                      {sortBy === 'popular' && (
                        <CheckIcon color={accentColor} />
                      )}
                    </Flex>
                  </MotionMenuItem>
                  <MotionMenuItem
                    _hover={{ bg: 'whiteAlpha.200' }}
                    _focus={{ bg: 'whiteAlpha.200' }}
                    color="white"
                    transition="all 0.2s"
                    whileHover={{ x: 5 }}
                    px={4}
                    py={3}
                    bg="transparent"
                    onClick={() => handleSortChange('commentCount')}
                  >
                    <Flex align="center" justify="space-between" w="full">
                      <Flex align="center" gap={3}>
                        <ChatIcon />
                        <Text>コメント数順</Text>
                      </Flex>
                      {sortBy === 'commentCount' && (
                        <CheckIcon color={accentColor} />
                      )}
                    </Flex>
                  </MotionMenuItem>
                </MenuList>
              </>
            )}
          </Menu>
        </Flex>

        <Box mb={8}>
          <Box overflow="hidden" mx={-4} px={4}>
            <HStack
              spacing={3}
              overflow="auto"
              pb={4}
              pt={2}
              sx={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
                '-ms-overflow-style': 'none',
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
                      backgroundColor:
                        tag === 'すべて'
                          ? 'rgba(236, 64, 122, 0.3)'
                          : 'rgba(255, 255, 255, 0.2)',
                    }}
                    whileTap={{ scale: 0.95 }}
                    size="lg"
                    variant="subtle"
                    bg={
                      tag === 'すべて'
                        ? 'rgba(236, 64, 122, 0.2)'
                        : 'whiteAlpha.100'
                    }
                    color="white"
                    cursor="pointer"
                    px={4}
                    py={2}
                    borderRadius="full"
                    borderWidth="1px"
                    borderColor={
                      tag === 'すべて' ? 'pink.400' : 'whiteAlpha.200'
                    }
                    backdropFilter="blur(8px)"
                    _hover={{
                      borderColor:
                        tag === 'すべて' ? 'pink.300' : 'whiteAlpha.400',
                    }}
                    textTransform="uppercase"
                    fontSize="sm"
                    fontWeight="medium"
                    letterSpacing="wide"
                  >
                    <Flex align="center" gap={2}>
                      {tag === 'すべて' && <StarIcon boxSize={3} />}
                      {tag}
                    </Flex>
                  </MotionTag>
                )
              )}
            </HStack>
          </Box>
        </Box>

        <MotionBox
          bg="blackAlpha.500"
          backdropFilter="blur(10px)"
          borderRadius="xl"
          p={6}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ThreadList searchTerm={searchTerm} sortBy={sortBy} />
        </MotionBox>
      </MotionBox>
    </Box>
  );
}

export default Thread;
