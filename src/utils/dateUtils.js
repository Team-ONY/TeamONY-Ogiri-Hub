export const formatDate = (timestamp) => {
  if (!timestamp) return '';

  const date = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return '今';
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分前`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}時間前`;
  } else if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}日前`;
  } else {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
};
