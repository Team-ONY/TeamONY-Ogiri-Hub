export const checkThreadAccess = async (thread, currentUser, viewType) => {
  if (!thread) {
    return {
      hasAccess: false,
      message: 'スレッドが見つかりませんでした。',
      redirectPath: '/thread',
    };
  }

  if (viewType === 'admin') {
    if (thread.createdBy !== currentUser.uid) {
      return {
        hasAccess: false,
        message: '管理者権限がありません。',
        redirectPath: `/thread/${thread.id}`,
      };
    }
  } else {
    const isParticipant = thread.participants?.includes(currentUser.uid);
    if (!isParticipant) {
      return {
        hasAccess: false,
        message: 'このスレッドに参加する必要があります。',
        redirectPath: '/thread',
      };
    }
  }

  return {
    hasAccess: true,
    message: null,
    redirectPath: null,
  };
};
