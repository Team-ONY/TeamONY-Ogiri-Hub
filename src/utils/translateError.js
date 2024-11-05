export const translateFirebaseError = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return '無効なメールアドレスです。';
    case 'auth/user-disabled':
      return 'このユーザーは無効になっています。';
    case 'auth/user-not-found':
      return 'ユーザーが見つかりません。';
    case 'auth/wrong-password':
      return 'パスワードが間違っています。';
    default:
      return 'エラーが発生しました。';
  }
};
