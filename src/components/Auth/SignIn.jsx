import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { translateFirebaseError } from '../../utils/translateError';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(translateFirebaseError(err.code));
    }
  };

  return (
    <Box>
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
      <Button onClick={handleSignIn}>サインイン</Button>
      {error && <Text color="red.500">{error}</Text>}
    </Box>
  );
}

export default SignIn;
