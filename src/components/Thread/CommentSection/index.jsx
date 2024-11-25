// components/thread/CommentSection/index.jsx
import { VStack, Flex, Spinner, Text } from '@chakra-ui/react';
import { CommentItem } from './CommentItem';
import PropTypes from 'prop-types';

export const CommentSection = ({
  comments,
  isLoading,
  hasMore,
  onDelete,
  user,
  thread,
}) => {
  // デバッグ用のログを追加
  console.log('CommentSection props:', {
    commentsLength: comments.length,
    isLoading,
    hasMore,
  });

  if (isLoading && (!comments || comments.length === 0)) {
    return (
      <Flex justify="center" py={8}>
        <Spinner size="lg" color="pink.400" />
      </Flex>
    );
  }

  if (!comments) {
    return null;
  }

  return (
    <VStack spacing={4} align="stretch" mt={6}>
      {comments.length > 0 ? (
        <>
          {comments.map((comment, index) => (
            <CommentItem
              key={comment.uniqueKey || comment.id}
              comment={comment}
              isAdmin={comment.isAdmin}
              onDelete={onDelete}
              user={user}
              thread={thread}
              index={index}
            />
          ))}

          {hasMore && (
            <Flex justify="center" my={4}>
              <Spinner size="sm" color="pink.400" />
            </Flex>
          )}
        </>
      ) : (
        <Text color="gray.400" textAlign="center" py={8}>
          コメントはまだありません
        </Text>
      )}
    </VStack>
  );
};

CommentSection.propTypes = {
  comments: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  hasMore: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  user: PropTypes.object,
  thread: PropTypes.object,
};
