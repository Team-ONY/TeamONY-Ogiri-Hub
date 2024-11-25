export const validateComment = (comment) => {
  if (!comment.trim()) {
    return {
      isValid: false,
      error: 'コメントを入力してください',
    };
  }

  const urlPattern = /https?:\/\/[^\s]+/gi;
  if (urlPattern.test(comment)) {
    return {
      isValid: false,
      error: 'コメントにURLを含めることはできません',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

export const formatCommentDate = (timestamp) => {
  if (!timestamp?.toDate) return '';
  return new Date(timestamp.toDate()).toLocaleString();
};
