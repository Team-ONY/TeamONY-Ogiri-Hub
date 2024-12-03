import { useState } from 'react';
import {
  Box,
  Flex,
  Avatar,
  Text,
  IconButton,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Textarea } from '@chakra-ui/react';
import { PropTypes } from 'prop-types';
import { IoSendSharp } from 'react-icons/io5';
import { IoSparklesSharp } from 'react-icons/io5';

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

export const CommentInput = ({ user, onSubmit, error }) => {
  const [comment, setComment] = useState('');
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const placeholderText = useBreakpointValue({
    base: `コメントを追加 (${isMac ? 'Cmd' : 'Ctrl'}+Enter)`,
    md: `コメントを追加（${isMac ? 'Cmd' : 'Ctrl'} + Enterで送信）`,
  });

  const handleSubmit = () => {
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;

    onSubmit(trimmedComment);
    setComment('');
  };

  const handleKeyPress = (e) => {
    // Macの場合はCmd+Enter、それ以外はCtrl+Enter
    if (e.key === 'Enter' && ((isMac && e.metaKey) || (!isMac && e.ctrlKey))) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      position="relative"
    >
      <Box
        bg="rgba(0, 0, 0, 0.7)"
        backdropFilter="blur(20px)"
        borderRadius="24px"
        border="1px solid"
        borderColor="whiteAlpha.200"
        overflow="hidden"
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="2px"
          bgGradient="linear(to-r, pink.400, purple.500)"
        />

        <Box p={4}>
          <Flex gap={3} align="center">
            <Box position="relative">
              <Avatar
                name={user ? user.displayName : 'Anonymous'}
                src={user?.photoURL || ''}
                size="sm"
                border="2px solid"
                borderColor="pink.400"
                boxShadow="0 0 20px rgba(255, 105, 180, 0.2)"
              />
              <Icon
                as={IoSparklesSharp}
                position="absolute"
                bottom="-1"
                right="-1"
                color="pink.400"
                w={3}
                h={3}
              />
            </Box>

            <Box flex={1} position="relative">
              <Textarea
                placeholder={placeholderText}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={handleKeyPress}
                bg="whiteAlpha.50"
                border="none"
                color="white"
                fontSize="sm"
                minH="40px"
                maxH="120px"
                py={2}
                px={3}
                borderRadius="xl"
                resize="none"
                _placeholder={{ color: 'whiteAlpha.500' }}
                _focus={{
                  bg: 'whiteAlpha.100',
                  boxShadow: 'none',
                }}
                sx={{
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 105, 180, 0.3)',
                    borderRadius: '4px',
                  },
                }}
              />
            </Box>

            <MotionIconButton
              icon={<IoSendSharp />}
              aria-label="Send comment"
              isDisabled={!comment.trim()}
              onClick={handleSubmit}
              size="sm"
              variant="ghost"
              color="pink.400"
              _hover={{
                bg: 'rgba(255, 105, 180, 0.1)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          </Flex>

          {error && (
            <Text
              color="red.400"
              fontSize="xs"
              mt={2}
              textAlign="center"
              fontWeight="medium"
            >
              {error}
            </Text>
          )}
        </Box>
      </Box>
    </MotionBox>
  );
};

CommentInput.propTypes = {
  user: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
};
