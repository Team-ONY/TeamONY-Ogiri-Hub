import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Heading,
  Container,
  FormControl,
  InputGroup,
  InputLeftElement,
  Divider,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { EmailIcon, LockIcon, AtSignIcon } from '@chakra-ui/icons';
import { translateFirebaseError } from '../../utils/translateError';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { updateProfile } from 'firebase/auth';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
`;

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      // バリデーション
      if (!username || !email || !password) {
        setError('All fields are required');
        return;
      }

      // ユーザー作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // displayNameを設定
      await updateProfile(user, {
        displayName: username,
      });

      // Firestoreにユーザー情報を保存
      try {
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          username: username,
          email: email,
          createdAt: new Date(),
        });

        console.log('User document successfully created');
        navigate('/signin');
      } catch (firestoreError) {
        console.error('Firestore error: ', firestoreError);
        setError('Failed to save user data');
        // Firestoreへの保存に失敗した場合、作成したユーザーを削除することも検討
      }
    } catch (err) {
      console.error('Firebase error: ', err);
      setError(translateFirebaseError(err.code));
    }
  };

  return (
    <Container maxW="lg" centerContent>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          w="500px"
          p={8}
          mt={10}
          borderRadius="xl"
          bg="blackAlpha.400"
          backdropFilter="blur(10px)"
          as={motion.div}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <VStack spacing={6}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Heading size="xl" color="white" mb={6}>
                Sign Up
              </Heading>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" mt={1}>
                    <AtSignIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    w="400px"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    bg="gray.800"
                    border="none"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    _hover={{ bg: 'gray.700' }}
                    _focus={{
                      bg: 'gray.700',
                      borderColor: 'pink.400',
                      boxShadow: '0 0 0 1px #FF1988',
                    }}
                    size="lg"
                    borderRadius="full"
                  />
                </InputGroup>
              </FormControl>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" mt={1}>
                    <EmailIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    w="400px"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="gray.800"
                    border="none"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    _hover={{ bg: 'gray.700' }}
                    _focus={{
                      bg: 'gray.700',
                      borderColor: 'pink.400',
                      boxShadow: '0 0 0 1px #FF1988',
                    }}
                    size="lg"
                    borderRadius="full"
                  />
                </InputGroup>
              </FormControl>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" mt={1}>
                    <LockIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    w="400px"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="gray.800"
                    border="none"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    _hover={{ bg: 'gray.700' }}
                    _focus={{
                      bg: 'gray.700',
                      borderColor: 'pink.400',
                      boxShadow: '0 0 0 1px #FF1988',
                    }}
                    size="lg"
                    borderRadius="full"
                  />
                </InputGroup>
              </FormControl>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                w="300px"
                bg="#FF1988"
                color="white"
                size="lg"
                _hover={{
                  bg: '#FF339D',
                  transform: 'scale(1.02)',
                }}
                _active={{
                  bg: '#E6006E',
                }}
                borderRadius="full"
                onClick={handleSignUp}
                transition="all 0.2s"
                as={motion.button}
                whileTap={{ scale: 0.95 }}
                sx={{
                  background:
                    'linear-gradient(45deg, #FF1988, #FF339D, #E6006E)',
                  backgroundSize: '200% 200%',
                  animation: `${gradientAnimation} 10s ease infinite`,
                }}
              >
                Sign Up
              </Button>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Text color="red.400" fontSize="sm" textAlign="center">
                  {error}
                </Text>
              </motion.div>
            )}

            <Divider borderColor="gray.600" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <VStack spacing={4} w="100%">
                <Text color="white" fontSize="md" fontWeight="bold">
                  Already have an account?
                </Text>
                <Button
                  w="300px"
                  as={RouterLink}
                  to="/signin"
                  variant="outline"
                  color="white"
                  borderColor="gray.500"
                  _hover={{
                    bg: 'whiteAlpha.100',
                    borderColor: 'white',
                  }}
                  size="lg"
                  borderRadius="full"
                >
                  Sign in
                </Button>
              </VStack>
            </motion.div>
          </VStack>
        </Box>
      </motion.div>
    </Container>
  );
}

export default SignUp;
