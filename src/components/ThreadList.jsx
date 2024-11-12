import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThreads, joinThread } from '../services/threadService';
import {
  Box,
  Text,
  VStack,
  HStack,
  Tag,
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiHash,
  FiClock,
  FiMessageCircle,
  FiUser,
  FiUserPlus,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { auth } from '../config/firebase';
import PropTypes from 'prop-types';

const MotionBox = motion(Box);
const MotionTag = motion(Tag);

function ThreadList({ searchTerm, sortBy }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchThreads = async () => {
      const threadsData = await getThreads();
      setThreads(threadsData);
    };
    fetchThreads();
  }, []);

  const handleJoinClick = async (thread) => {
    const isJoined =
      thread.participants && thread.participants.includes(currentUser?.uid);

    if (isJoined) {
      navigate(`/thread/${thread.id}`);
    } else {
      setSelectedThread(thread);
      onOpen();
    }
  };

  const handleJoinConfirm = async () => {
    try {
      await joinThread(selectedThread.id, currentUser?.uid);
      const updatedThreads = await getThreads();
      setThreads(updatedThreads);
      navigate(`/thread/${selectedThread.id}`);
      onClose();
    } catch (error) {
      console.error('Error joining the thread:', error);
    }
  };

  const getTagColor = (tag) => {
    const colors = [
      'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
      'linear-gradient(135deg, #FF4D4D 0%, #F9CB28 100%)',
      'linear-gradient(135deg, #00B5EE 0%, #7928CA 100%)',
      'linear-gradient(135deg, #FF0080 0%, #FF4D4D 100%)',
      'linear-gradient(135deg, #7928CA 0%, #00B5EE 100%)',
    ];
    const index =
      tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  const filteredThreads = threads.filter((thread) => {
    const titleMatch = thread.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const contentMatch = thread.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return titleMatch || contentMatch;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.createdAt.toDate() - a.createdAt.toDate();
    } else if (sortBy === 'popular') {
      return b.participantCount - a.participantCount;
    } else if (sortBy === 'commentCount') {
      return b.commentCount - a.commentCount;
    }
    return 0;
  });

  return (
    <>
      <VStack spacing={6} align="stretch" px={4} maxW="1200px" mx="auto">
        {sortedThreads.map((thread, index) => (
          <MotionBox
            key={thread.id}
            bg="linear-gradient(170deg, rgba(18, 18, 18, 0.8) 0%, rgba(30, 30, 30, 0.8) 100%)"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
            boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.2)',
              borderColor: 'pink.400',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            overflow="hidden"
            position="relative"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="100%"
              bgGradient="linear(to-r, rgba(255,20,147,0.03) 0%, rgba(255,90,182,0.03) 50%, rgba(255,20,147,0.03) 100%)"
              pointerEvents="none"
            />

            <Box p={8} position="relative">
              <VStack align="stretch" spacing={6}>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={4} flex={1}>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      bgGradient="linear(to-r, pink.400, purple.400)"
                      bgClip="text"
                      letterSpacing="tight"
                      lineHeight="1.2"
                    >
                      {thread.title}
                    </Text>
                    <Text
                      fontSize="lg"
                      color="gray.300"
                      dangerouslySetInnerHTML={{ __html: thread.content }}
                    />
                  </VStack>
                  <Button
                    onClick={() => handleJoinClick(thread)}
                    leftIcon={<Icon as={FiUserPlus} />}
                    bgGradient={
                      thread.participants &&
                      thread.participants.includes(currentUser?.uid)
                        ? 'linear(to-r, green.400, teal.400)'
                        : 'linear(to-r, pink.400, purple.400)'
                    }
                    color="white"
                    _hover={{
                      bgGradient:
                        thread.participants &&
                        thread.participants.includes(currentUser?.uid)
                          ? 'linear(to-r, green.500, teal.500)'
                          : 'linear(to-r, pink.500, purple.500)',
                    }}
                    borderRadius="full"
                    px={8}
                    h="50px"
                    fontSize="md"
                    fontWeight="medium"
                    backdropFilter="blur(10px)"
                    transition="all 0.2s"
                    display="flex"
                    gap={2}
                    flexShrink={0}
                  >
                    {thread.participants &&
                    thread.participants.includes(currentUser?.uid)
                      ? 'スレッドに入る'
                      : '参加する'}
                  </Button>
                </HStack>

                {thread.tags && thread.tags.length > 0 && (
                  <HStack spacing={2} flexWrap="wrap">
                    {thread.tags.map((tag, tagIndex) => (
                      <MotionTag
                        key={tagIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + tagIndex * 0.1 }}
                        px={4}
                        py={2}
                        bg={getTagColor(tag)}
                        color="white"
                        fontSize="sm"
                        fontWeight="medium"
                        borderRadius="full"
                        _hover={{
                          bg: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-1px)',
                        }}
                        sx={{ transition: 'all 0.2s' }}
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <Icon as={FiHash} boxSize={3} />
                        {tag}
                      </MotionTag>
                    ))}
                  </HStack>
                )}

                <HStack
                  spacing={6}
                  color="whiteAlpha.700"
                  pt={4}
                  borderTop="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <HStack spacing={2}>
                    <Icon as={FiClock} boxSize={4} />
                    <Text fontSize="sm">
                      {new Date(thread.createdAt.toDate()).toLocaleDateString()}
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiMessageCircle} boxSize={4} />
                    <Text fontSize="sm">
                      {thread.commentCount || 0} コメント
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiUser} boxSize={4} />
                    <Text fontSize="sm">
                      {thread.participantCount || 0} 参加者
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          </MotionBox>
        ))}
      </VStack>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          bg="linear-gradient(170deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="2xl"
          p={4}
        >
          <ModalHeader
            bgGradient="linear(to-r, pink.400, purple.400)"
            bgClip="text"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Icon as={FiAlertCircle} />
            スレッド参加の確認
          </ModalHeader>
          <ModalCloseButton color="whiteAlpha.600" />
          <ModalBody color="whiteAlpha.900">
            <VStack align="stretch" spacing={4}>
              <Text fontWeight="bold">
                「{selectedThread?.title}」に参加しますか？
              </Text>
              <Box
                bg="whiteAlpha.100"
                p={4}
                borderRadius="xl"
                fontSize="sm"
                color="whiteAlpha.800"
              >
                <Text fontWeight="bold" mb={2}>
                  スレッドのルール
                </Text>
                <VStack align="start" spacing={2}>
                  <Text>• 参加者への敬意を持った発言を心がけてください</Text>
                  <Text>• 不適切な発言や画像の投稿は禁止です</Text>
                  <Text>• 話題に関係のない投稿は控えめにお願いします</Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} color="whiteAlpha.600">
              キャンセル
            </Button>
            <Button
              onClick={handleJoinConfirm}
              bgGradient="linear(to-r, pink.400, purple.400)"
              color="white"
              leftIcon={<Icon as={FiCheckCircle} />}
              _hover={{
                bgGradient: 'linear(to-r, pink.500, purple.500)',
              }}
            >
              参加する
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

ThreadList.propTypes = {
  searchTerm: PropTypes.string,
  sortBy: PropTypes.oneOf(['newest', 'popular', 'commentCount']),
};

ThreadList.defaultProps = {
  searchTerm: '',
  sortBy: 'newest',
};

export default ThreadList;
