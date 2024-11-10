import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThreads } from '../services/threadService';
import { Box, Text, VStack, HStack, Tag, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiHash, FiClock, FiMessageCircle } from 'react-icons/fi';

const MotionBox = motion(Box);
const MotionTag = motion(Tag);

function ThreadList() {
  const [threads, setThreads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThreads = async () => {
      const threadsData = await getThreads();
      setThreads(threadsData);
    };
    fetchThreads();
  }, []);

  // タグのランダムな背景色を生成する関数
  const getTagColor = (tag) => {
    const colors = [
      'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
      'linear-gradient(135deg, #FF4D4D 0%, #F9CB28 100%)',
      'linear-gradient(135deg, #00B5EE 0%, #7928CA 100%)',
      'linear-gradient(135deg, #FF0080 0%, #FF4D4D 100%)',
      'linear-gradient(135deg, #7928CA 0%, #00B5EE 100%)',
    ];
    // タグ文字列からインデックスを生成
    const index =
      tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  return (
    <VStack spacing={4} align="stretch">
      {threads.map((thread, index) => (
        <MotionBox
          key={thread.id}
          p={6}
          bg="linear-gradient(170deg, rgba(18, 18, 18, 0.8) 0%, rgba(30, 30, 30, 0.8) 100%)"
          backdropFilter="blur(10px)"
          borderRadius="2xl"
          border="1px solid"
          borderColor="whiteAlpha.100"
          boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          cursor="pointer"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.2)',
            borderColor: 'pink.400',
          }}
          onClick={() => navigate(`/thread/${thread.id}`)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <VStack align="stretch" spacing={4}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              bgGradient="linear(to-r, pink.400, purple.400)"
              bgClip="text"
            >
              {thread.title}
            </Text>

            <Text fontSize="md" color="gray.300" noOfLines={2}>
              {thread.content}
            </Text>

            <Box>
              <HStack spacing={4} mb={2}>
                {thread.tags &&
                  thread.tags.map((tag, tagIndex) => (
                    <MotionTag
                      key={tagIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + tagIndex * 0.1 }}
                      px={4}
                      py={2}
                      borderRadius="full"
                      bgGradient={getTagColor(tag)}
                      color="white"
                      fontSize="sm"
                      fontWeight="bold"
                      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 10px -2px rgba(0, 0, 0, 0.2)',
                      }}
                      sx={{ transition: 'all 0.2s' }}
                      cursor="pointer"
                    >
                      <Icon as={FiHash} mr={1} />
                      {tag}
                    </MotionTag>
                  ))}
              </HStack>
            </Box>

            <HStack spacing={4} color="whiteAlpha.600" fontSize="sm">
              <HStack>
                <Icon as={FiClock} />
                <Text>
                  {new Date(thread.createdAt.toDate()).toLocaleDateString()}
                </Text>
              </HStack>
              <HStack>
                <Icon as={FiMessageCircle} />
                <Text>{thread.commentCount || 0} コメント</Text>
              </HStack>
            </HStack>
          </VStack>
        </MotionBox>
      ))}
    </VStack>
  );
}

export default ThreadList;
