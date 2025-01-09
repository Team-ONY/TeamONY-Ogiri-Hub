// components/thread/CommentSection/CommentItem.jsx
import { memo } from 'react';
import { Box, Text, Flex, Avatar, Icon, IconButton } from '@chakra-ui/react';
import { FaCrown, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { PropTypes } from 'prop-types';
import { formatCommentDate } from '../../../utils/commentHelpers';

const MotionBox = motion(Box);

export const CommentItem = memo(
  ({ comment, isAdmin, onDelete, user, thread, index }) => {
    return (
      <MotionBox
        data-comment-index={index}
        key={comment.id}
        p={4}
        bg="blackAlpha.400"
        borderRadius="xl"
        width="100%"
        style={{ boxSizing: 'border-box' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        mb={4}
      >
        <Flex
          align="center"
          mb={2}
          justifyContent="space-between"
          flexWrap="wrap"
          width="100%"
          style={{ boxSizing: 'border-box' }}
        >
          <Flex align="center" gap={2}>
            <Avatar
              name={comment.createdByUsername}
              src={comment.userPhotoURL}
              size="sm"
              mr={2}
              border={isAdmin ? '2px solid' : 'none'}
              borderColor="pink.400"
            />
            <Flex align="center" gap={2}>
              <Text color="gray.400" fontSize="sm">
                {comment.createdByUsername}
              </Text>
              {isAdmin && (
                <Icon
                  as={FaCrown}
                  color="pink.400"
                  w={3}
                  h={3}
                  title="スレッド管理者"
                />
              )}
              <Text color="gray.500" fontSize="xs">
                {formatCommentDate(comment.createdAt)}
              </Text>
            </Flex>
          </Flex>
          {user && user.uid === thread.createdBy && (
            <IconButton
              aria-label="Delete comment"
              icon={<Icon as={FaTrash} />}
              onClick={() => onDelete(comment.id)}
              colorScheme="red"
              variant="ghost"
              minWidth="30px"
            />
          )}
        </Flex>
        <Text color="gray.300" fontSize="md" pl={10}>
          {comment.text}
        </Text>
      </MotionBox>
    );
  }
);

CommentItem.displayName = 'CommentItem';
CommentItem.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string,
    createdAt: PropTypes.object,
    createdBy: PropTypes.string,
    createdByUsername: PropTypes.string,
    userPhotoURL: PropTypes.string,
    isAdmin: PropTypes.bool,
  }).isRequired,
  isAdmin: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  user: PropTypes.object,
  thread: PropTypes.object,
  index: PropTypes.number.isRequired,
};
