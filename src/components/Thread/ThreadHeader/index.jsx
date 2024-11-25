// components/thread/ThreadHeader/index.jsx
import { VStack, Flex, Avatar, Text, Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AdminButton } from './AdminButton';
import PropTypes from 'prop-types';

const MotionBox = motion(Box);

export const ThreadHeader = ({
  thread,
  threadCreator,
  currentUser,
  onAdminClick,
}) => {
  if (!thread) return null;

  return (
    <MotionBox
      p={6}
      bg="blackAlpha.500"
      borderRadius="2xl"
      boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      width="1200px"
      mx="auto"
    >
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={4} flex={1}>
          <Flex align="center" width="100%">
            <Avatar
              name={threadCreator?.username || 'Anonymous'}
              src={threadCreator?.photoURL}
              size="lg"
              mr={4}
              border="3px solid"
              borderColor="pink.400"
              boxShadow="0 0 15px rgba(255, 25, 136, 0.3)"
            />
            <VStack align="start" spacing={1}>
              <Flex align="center" gap={2}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color="white"
                  bgGradient="linear(to-r, pink.400, purple.500)"
                  backgroundClip="text"
                >
                  {thread.title}
                </Text>
                {thread &&
                  currentUser &&
                  thread.createdBy === currentUser.uid && (
                    <AdminButton onClick={onAdminClick} />
                  )}
              </Flex>
              <Flex align="center" gap={2}>
                <Text fontSize="sm" color="pink.300" fontWeight="medium">
                  Posted by {threadCreator?.username || 'Anonymous'}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  •{' '}
                  {thread.createdAt?.toDate
                    ? new Date(thread.createdAt?.toDate()).toLocaleString()
                    : ''}
                </Text>
              </Flex>
            </VStack>
          </Flex>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            p={6}
            bg="blackAlpha.400"
            borderRadius="xl"
            borderLeft="4px solid"
            borderColor="pink.400"
            width="100%"
          >
            <Text
              color="gray.100"
              fontSize="lg"
              lineHeight="tall"
              letterSpacing="wide"
            >
              {thread.content}
            </Text>
          </MotionBox>
        </VStack>
      </Flex>
    </MotionBox>
  );
};

ThreadHeader.propTypes = {
  thread: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.object,
    createdBy: PropTypes.string.isRequired,
  }),
  threadCreator: PropTypes.shape({
    username: PropTypes.string,
    photoURL: PropTypes.string,
  }),
  currentUser: PropTypes.object,
  onAdminClick: PropTypes.func.isRequired,
};

export default ThreadHeader;
