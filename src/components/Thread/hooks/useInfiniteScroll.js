// hooks/useInfiniteScroll.js
import { useCallback, useEffect } from 'react';
import throttle from 'lodash.throttle';

export const useInfiniteScroll = (callback, options) => {
  const { hasMoreComments, displayedComments } = options;

  const scrollCallback = useCallback(
    throttle(() => {
      if (!hasMoreComments) return;

      const lastComment = document.querySelector(
        `[data-comment-index="${displayedComments.length - 1}"]`
      );

      if (!lastComment) return;

      const lastCommentPosition = lastComment.getBoundingClientRect();
      const isLastCommentVisible =
        lastCommentPosition.bottom <= window.innerHeight;

      if (isLastCommentVisible) {
        callback();
      }
    }, 200),
    [callback, hasMoreComments, displayedComments.length]
  );

  useEffect(() => {
    window.addEventListener('scroll', scrollCallback);
    return () => {
      scrollCallback.cancel();
      window.removeEventListener('scroll', scrollCallback);
    };
  }, [scrollCallback]);
};
