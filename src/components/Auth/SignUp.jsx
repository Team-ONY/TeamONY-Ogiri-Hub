import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { translateFirebaseError } from '../../utils/translateError';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // ユーザ名を保存する処理を追加することも可能です
    } catch (err) {
      setError(translateFirebaseError(err.code));
    }
  };

  return (
    <Box>
      <Input
        placeholder="ユーザ名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="パスワード"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleSignUp}>サインアップ</Button>
      {error && <Text color="red.500">{error}</Text>}
    </Box>
  );
}

export default SignUp;
