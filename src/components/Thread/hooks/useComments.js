import { useState, useCallback, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import {
  addCommentToThread,
  deleteCommentFromThread,
} from '../../../services/threadService';
import { validateComment } from '../../../utils/commentHelpers';

export const useComments = (threadId, thread, setThread, currentUser) => {
  const [displayedComments, setDisplayedComments] = useState([]);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState('');
  const [isNewCommentAdded, setIsNewCommentAdded] = useState(false);

  // スレッドデータが変更されたときのハンドラーを追加
  useEffect(() => {
    if (thread?.comments) {
      const sortedComments = [...thread.comments].sort(
        (a, b) =>
          b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      );

      const initialComments = sortedComments.slice(0, 20).map((comment) => ({
        ...comment,
        uniqueKey: `${comment.id}-initial`,
      }));

      setDisplayedComments(initialComments);
      setHasMoreComments(sortedComments.length > 20);
      setIsLoadingComments(false);
    }
  }, [thread]);

  const handleAddComment = useCallback(
    async (commentText) => {
      const validationResult = validateComment(commentText);
      if (!validationResult.isValid) {
        setError(validationResult.error);
        return;
      }

      try {
        const { uid: userId, displayName, photoURL } = currentUser;
        const createdAt = Timestamp.now();
        const newComment = {
          id: createdAt.toMillis().toString(),
          text: commentText,
          createdAt,
          createdBy: userId,
          createdByUsername: displayName,
          userPhotoURL: photoURL,
          isAdmin: thread.createdBy === userId,
          uniqueKey: `${createdAt.toMillis().toString()}-new`,
        };

        await addCommentToThread(
          threadId,
          commentText,
          userId,
          displayName,
          photoURL
        );

        setDisplayedComments((prev) => {
          const updated = [newComment, ...prev];
          return updated;
        });

        setIsNewCommentAdded(true);
        setError('');

        setThread((prevThread) => ({
          ...prevThread,
          comments: [newComment, ...(prevThread.comments || [])],
        }));
      } catch (error) {
        console.error('Error adding comment:', error);
        setError('コメントの追加中にエラーが発生しました。');
      }
    },
    [threadId, thread, currentUser, setThread]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        await deleteCommentFromThread(threadId, commentId);

        setDisplayedComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );

        setThread((prevThread) => ({
          ...prevThread,
          comments: (prevThread.comments || []).filter(
            (comment) => comment.id !== commentId
          ),
        }));
      } catch (error) {
        console.error('Error deleting comment:', error);
        setError('コメントの削除中にエラーが発生しました。');
      }
    },
    [threadId, setThread]
  );

  return {
    displayedComments,
    setDisplayedComments,
    hasMoreComments,
    setHasMoreComments,
    isLoadingComments,
    setIsLoadingComments,
    error,
    isNewCommentAdded,
    handleAddComment,
    handleDeleteComment,
  };
};
