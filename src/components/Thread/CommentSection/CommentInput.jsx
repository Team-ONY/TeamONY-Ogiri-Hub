// components/thread/CommentSection/CommentInput.jsx
import { useState } from 'react';
import { Box, Flex, Avatar, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Input, Button } from '@chakra-ui/react';
import { PropTypes } from 'prop-types';

const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionButton = motion(Button);

export const CommentInput = ({ user, onSubmit, error }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(comment);
    setComment('');
  };

  return (
    <MotionBox
      p={5}
      bgGradient="radial(circle at top left, rgba(255, 105, 180, 0.8), rgba(0, 0, 0, 1))"
      borderRadius="2xl"
      boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
      position="fixed"
      bottom={4}
      left="50%"
      transform="translateX(-50%)"
      zIndex={10}
      width="1100px"
      maxWidth="95%"
      backdropFilter="blur(8px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Flex align="center" mb={6}>
        <Avatar
          name={user ? user.displayName : 'Anonymous'}
          src={user?.photoURL || ''}
          size="md"
          mr={3}
          border="2px solid"
          borderColor="pink.400"
        />
        <MotionInput
          placeholder="コメントを追加"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          bg="blackAlpha.700"
          color="white"
          borderRadius="xl"
          py={4}
          px={5}
          fontSize="md"
          border="2px solid"
          borderColor="whiteAlpha.300"
          _hover={{
            borderColor: 'pink.500',
            boxShadow: '0 0 15px rgba(255, 105, 180, 0.15)',
          }}
          _focus={{
            borderColor: 'pink.400',
            boxShadow: '0 0 0 2px rgba(255, 25, 136, 0.4)',
            bg: 'blackAlpha.800',
          }}
          _placeholder={{ color: 'whiteAlpha.600' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          flex="1"
        />
        <MotionButton
          onClick={handleSubmit}
          colorScheme="pink"
          size="lg"
          fontWeight="bold"
          borderRadius="xl"
          px={8}
          ml={3}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 20px -4px rgba(255, 25, 136, 0.3)',
            bg: 'pink.500',
          }}
          _active={{
            transform: 'scale(0.98)',
            bg: 'pink.600',
          }}
        >
          コメントする
        </MotionButton>
      </Flex>
      {error && (
        <Text
          color="pink.300"
          fontSize="sm"
          textAlign="center"
          mt={2}
          fontWeight="medium"
        >
          {error}
        </Text>
      )}
    </MotionBox>
  );
};

CommentInput.propTypes = {
  user: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
};
