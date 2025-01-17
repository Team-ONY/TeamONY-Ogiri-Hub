ThreadList.jsxの変更点

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThreads, joinThread } from '../../services/threadService';
import {
  Box,
  Text,
  VStack,
  HStack,
  Tag,
  Icon,
  Button,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiHash,
  FiClock,
  FiMessageCircle,
  FiUser,
  FiUserPlus,
} from 'react-icons/fi';
import { auth } from '../../config/firebase';
import PropTypes from 'prop-types';
import JoinThreadModal from './JoinThreadModal';
import { FaCrown } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionTag = motion(Tag);

function ThreadList({
  searchTerm = '',
  sortBy = 'newest',
  threads,
  setThreads,
}) {
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
  }, [setThreads]);

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
      <VStack
        spacing={6}
        align="stretch"
        px={{ base: 1, md: 4 }}
        maxW="1400px"
        mx="auto"
      >
        {sortedThreads.map((thread) => (
          <MotionBox
            key={thread.id}
            width={{ base: '100%', md: '100%' }}
            maxWidth="1000px"
            mx="auto"
            transition={{ duration: 0.3 }}
          >
            <Box
              bg="linear-gradient(170deg, rgba(18, 18, 18, 0.8) 0%, rgba(30, 30, 30, 0.8) 100%)"
              borderRadius="xl"
              overflow="hidden"
              position="relative"
              width="100%"
              minHeight={{ base: '320px', md: '350px' }} // baseの高さを調整
            >
              <Flex flexDirection="column" height="100%" p={{ base: 6, md: 8 }}>
                {/* コンテンツ上部 */}
                <VStack align="stretch" spacing={4} flex="1">
                  <VStack align="start" spacing={2}>
                    <Flex align="center" width="100%">
                      <Text
                        fontSize={{ base: 'xl', md: '3xl' }}
                        fontWeight="bold"
                        bgGradient="linear(to-r, pink.400, purple.400)"
                        bgClip="text"
                        letterSpacing="tight"
                        textShadow="0 0 20px rgba(236, 72, 153, 0.3)"
                        noOfLines={2}
                      >
                        {thread.title}
                        {thread.createdBy === currentUser?.uid && (
                          <Icon
                            as={FaCrown}
                            color="yellow.400"
                            boxSize={5}
                            ml={2}
                            filter="drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))"
                          />
                        )}
                      </Text>
                    </Flex>
                    <Text
                      fontSize={{ base: 'md', md: 'lg' }}
                      color="gray.300"
                      dangerouslySetInnerHTML={{ __html: thread.content }}
                      noOfLines={3}
                    />
                  </VStack>

                  {/* タグ */}
                  {thread.tags && thread.tags.length > 0 && (
                    <HStack spacing={2} flexWrap="wrap" mt={2}>
                      {thread.tags.map((tag, tagIndex) => (
                        <MotionTag
                          key={`${tag}-${tagIndex}`} // 一意のキーを生成
                          px={{ base: 2, md: 4 }}
                          py={{ base: 1, md: 2 }}
                          bg={getTagColor(tag)}
                          color="white"
                          fontSize={{ base: 'xs', md: 'sm' }}
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <Icon as={FiHash} boxSize={3} />
                          {tag}
                        </MotionTag>
                      ))}
                    </HStack>
                  )}
                </VStack>

                {/* フッター部分 */}
                <Flex
                  mt="auto"
                  justifyContent="space-between"
                  alignItems="center" // 中央揃えに設定
                  pt={20}
                >
                  {/* メタ情報 */}
                  <VStack
                    align="start"
                    spacing={2}
                    color="whiteAlpha.700"
                    maxW="70%"
                  >
                    <HStack spacing={2} flexGrow={1}>
                      <Icon as={FiClock} boxSize={4} />
                      <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        isTruncated
                        whiteSpace="nowrap"
                      >
                        {new Date(
                          thread.createdAt.toDate()
                        ).toLocaleDateString()}
                      </Text>
                    </HStack>
                    <HStack spacing={2} flexGrow={1}>
                      <Icon as={FiMessageCircle} boxSize={4} />
                      <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        whiteSpace="nowrap"
                      >
                        {thread.commentCount || 0} コメント
                      </Text>
                    </HStack>
                    <HStack spacing={2} flexGrow={1}>
                      <Icon as={FiUser} boxSize={4} />
                      <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        whiteSpace="nowrap"
                      >
                        {thread.participantCount || 0} 参加者
                      </Text>
                    </HStack>
                  </VStack>

                  {/* 参加ボタンを同じFlex内に配置 */}
                  <Button
                    onClick={() => handleJoinClick(thread)}
                    leftIcon={<Icon as={FiUserPlus} boxSize={5} />}
                    bgGradient={
                      thread.participants &&
                      thread.participants.includes(currentUser?.uid)
                        ? 'linear(to-r, green.400, teal.400)'
                        : 'linear(to-r, pink.400, purple.400)'
                    }
                    color="white"
                    borderRadius="full"
                    px={4}
                    py={{ base: 3, md: 4 }}
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="medium"
                    h="auto"
                    alignItems="center"
                    display="flex"
                    gap={2}
                  >
                    {thread.participants &&
                    thread.participants.includes(currentUser?.uid)
                      ? 'スレッドに入る'
                      : '参加する'}
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </MotionBox>
        ))}
      </VStack>

      <JoinThreadModal
        isOpen={isOpen}
        onClose={onClose}
        thread={selectedThread}
        onJoin={handleJoinConfirm}
      />
    </>
  );
}

ThreadList.propTypes = {
  searchTerm: PropTypes.string,
  sortBy: PropTypes.oneOf(['newest', 'popular', 'commentCount']),
  threads: PropTypes.array.isRequired,
  setThreads: PropTypes.func.isRequired,
};

export default ThreadList;
