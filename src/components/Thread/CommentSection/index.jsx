// components/thread/CommentSection/index.jsx
import { VStack, Flex, Spinner, Text, Button } from '@chakra-ui/react';
import { CommentItem } from './CommentItem';
import PropTypes from 'prop-types';

export const CommentSection = ({
  comments,
  isLoading,
  hasMore,
  onDelete,
  user,
  thread,
  onLoadMore,
}) => {
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
    <VStack
      spacing={4}
      align="stretch"
      mt={6}
      width="100%"
      maxWidth="900px"
      mx="auto"
    >
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
            <Flex justify="center" my={6}>
              <Button
                onClick={onLoadMore}
                isLoading={isLoading}
                bg="transparent"
                border="2px solid"
                borderColor="pink.400"
                color="pink.400"
                size="md"
                px={10}
                py={5}
                fontSize="sm"
                fontWeight="medium"
                letterSpacing="wide"
                rounded="full"
                _hover={{
                  bg: 'pink.50',
                  borderColor: 'pink.500',
                  color: 'pink.500',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px -8px rgba(255, 105, 180, 0.5)',
                }}
                _active={{
                  transform: 'translateY(0)',
                  bg: 'pink.100',
                }}
                _loading={{
                  opacity: 0.8,
                }}
              >
                もっと見る
              </Button>
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
  onLoadMore: PropTypes.func.isRequired,
};
