import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThreads } from '../services/threadService';
import { Box, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

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

  return (
    <VStack spacing={4} align="stretch">
      {threads.map((thread, index) => (
        <MotionBox
          key={thread.id}
          p={6}
          bg="blackAlpha.400"
          backdropFilter="blur(10px)"
          borderRadius="2xl"
          boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          cursor="pointer"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 15px 20px -5px rgba(0, 0, 0, 0.1)',
          }}
          onClick={() => navigate(`/thread/${thread.id}`)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <Text fontSize="xl" fontWeight="bold" color="pink.300" mb={1}>
            {thread.title}
          </Text>
          <Text fontSize="md" color="gray.300" noOfLines={2}>
            {thread.content}
          </Text>
        </MotionBox>
      ))}
    </VStack>
  );
}

export default ThreadList;
