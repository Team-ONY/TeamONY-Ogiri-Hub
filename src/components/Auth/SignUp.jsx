import { useState, useRef, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const glowAnimation = keyframes`
  0% { box-shadow: -5px 0 15px rgba(255, 20, 147, 0.7), 5px 0 15px rgba(138, 43, 226, 0.7); }
  50% { box-shadow: -10px 0 20px rgba(255, 20, 147, 0.9), 10px 0 20px rgba(138, 43, 226, 0.9); }
  100% { box-shadow: -5px 0 15px rgba(255, 20, 147, 0.7), 5px 0 15px rgba(138, 43, 226, 0.7); }
`;

const AnimatedEmoji = ({ delay }) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    // リサイズ時にもサイズを更新
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const randomPosition = () => ({
    x: Math.random() * (containerSize.width - 50), // 絵文字のサイズを考慮
    y: Math.random() * (containerSize.height - 50), // 絵文字のサイズを考慮
    rotate: Math.random() * 360,
  });

  return (
    <Box
      ref={containerRef}
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, ...randomPosition() }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0, 1, 1, 0],
          ...randomPosition(),
        }}
        transition={{
          duration: 4,
          times: [0, 0.2, 0.8, 1],
          repeat: Infinity,
          delay,
        }}
        style={{
          position: 'absolute',
          width: 'fit-content',
          height: 'fit-content',
        }}
      >
        <Text fontSize="4xl" fontFamily="emoji">
          🤣
        </Text>
      </motion.div>
    </Box>
  );
};
AnimatedEmoji.propTypes = {
  delay: PropTypes.number.isRequired,
};

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      if (!username || !email || !password) {
        setError('全てのフィールドを入力してください');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

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
        setError('ユーザーデータの保存に失敗しました');
      }
    } catch (err) {
      console.error('Firebase error: ', err);
      setError(translateFirebaseError(err.code));
    }
  };

  return (
    <Box
      h="100%"
      w="100%"
      bg="#0a0a0a"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        right="0"
        width="50%"
        height="100%"
        bg="linear-gradient(135deg, #8A2BE2 0%, #FF1493 100%)"
        opacity="0.1"
        filter="blur(100px)"
        transform="skewX(-12deg)"
      />
      <Box
        position="absolute"
        top="20%"
        left="10%"
        width="300px"
        height="300px"
        borderRadius="full"
        bg="linear-gradient(45deg, #8A2BE2 0%, transparent 60%)"
        opacity="0.1"
        filter="blur(50px)"
      />

      <Container maxW="6xl" position="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Box display="flex" gap={8} position="relative">
            <Box
              w="40%"
              h="600px"
              position="relative"
              display={{ base: 'none', lg: 'block' }}
            >
              <Box
                position="absolute"
                top="50%"
                left="0"
                transform="translateY(-50%)"
                w="100%"
                h="80%"
                bg="linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(255, 20, 147, 0.2))"
                borderRadius="30px"
                backdropFilter="blur(20px)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w="3px"
                  h="100%"
                  bg="linear-gradient(to bottom, #8A2BE2, #FF1493)"
                />

                <VStack h="100%" justify="center" spacing={8} p={10}>
                  <VStack spacing={2} align="start" w="100%">
                    <Text color="white" fontSize="xl" fontWeight="600">
                      Welcome to
                    </Text>
                    <Heading
                      color="white"
                      fontSize="6xl"
                      fontWeight="bold"
                      lineHeight="1.1"
                      textAlign="left"
                      w="100%"
                    >
                      Ogiri
                      <Text
                        bgGradient="linear(to-r, #8A2BE2, #FF1493)"
                        bgClip="text"
                        display="inline"
                      >
                        Hub
                      </Text>
                    </Heading>
                  </VStack>

                  <Text color="whiteAlpha.800" fontSize="lg" lineHeight="1.6">
                    あなたの面白い回答が
                    <br />
                    みんなを笑顔にする
                  </Text>

                  <Box
                    position="absolute"
                    w="100%"
                    h="100%"
                    overflow="hidden"
                    top={0}
                    left={0}
                  >
                    <AnimatedEmoji delay={0} />
                    <AnimatedEmoji delay={1} />
                    <AnimatedEmoji delay={2} />
                    <AnimatedEmoji delay={3} />
                  </Box>
                </VStack>
              </Box>
            </Box>

            <Box w={{ base: '100%', lg: '60%' }} position="relative">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <Box
                  bg="rgba(20, 20, 20, 0.8)"
                  backdropFilter="blur(20px)"
                  borderRadius="30px"
                  overflow="hidden"
                  p={10}
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  position="relative"
                >
                  <Box
                    position="absolute"
                    top="0"
                    right="0"
                    w="150px"
                    h="150px"
                    bg="linear-gradient(45deg, #8A2BE2, transparent)"
                    opacity="0.1"
                    filter="blur(30px)"
                    borderRadius="full"
                  />

                  <VStack spacing={8} align="stretch">
                    <VStack spacing={3} align="start">
                      <Text
                        color="whiteAlpha.600"
                        fontSize="sm"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        Sign Up
                      </Text>
                      <Heading color="white" fontSize="2xl" fontWeight="500">
                        アカウントを作成して大喜利を始めよう
                      </Heading>
                    </VStack>

                    <VStack spacing={6}>
                      <FormControl>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none" mt={1.5}>
                            <AtSignIcon color="gray.400" />
                          </InputLeftElement>
                          <Input
                            variant="filled"
                            placeholder="ユーザー名"
                            bg="rgba(255, 255, 255, 0.05)"
                            border="1px solid rgba(255, 255, 255, 0.08)"
                            color="white"
                            h="54px"
                            fontSize="md"
                            borderRadius="16px"
                            _hover={{
                              bg: 'rgba(255, 255, 255, 0.08)',
                            }}
                            _focus={{
                              bg: 'rgba(255, 255, 255, 0.08)',
                              borderColor: '#8A2BE2',
                            }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <InputGroup>
                          <InputLeftElement color="whiteAlpha.600" mt={1.5}>
                            <EmailIcon />
                          </InputLeftElement>
                          <Input
                            variant="filled"
                            placeholder="メールアドレス"
                            bg="rgba(255, 255, 255, 0.05)"
                            border="1px solid rgba(255, 255, 255, 0.08)"
                            color="white"
                            h="54px"
                            fontSize="md"
                            borderRadius="16px"
                            _hover={{
                              bg: 'rgba(255, 255, 255, 0.08)',
                            }}
                            _focus={{
                              bg: 'rgba(255, 255, 255, 0.08)',
                              borderColor: '#8A2BE2',
                            }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <InputGroup>
                          <InputLeftElement color="whiteAlpha.600" mt={1.5}>
                            <LockIcon />
                          </InputLeftElement>
                          <Input
                            variant="filled"
                            type="password"
                            placeholder="パスワード"
                            bg="rgba(255, 255, 255, 0.05)"
                            border="1px solid rgba(255, 255, 255, 0.08)"
                            color="white"
                            h="54px"
                            fontSize="md"
                            borderRadius="16px"
                            _hover={{
                              bg: 'rgba(255, 255, 255, 0.08)',
                            }}
                            _focus={{
                              bg: 'rgba(255, 255, 255, 0.08)',
                              borderColor: '#8A2BE2',
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>
                    </VStack>

                    {error && (
                      <Text color="red.300" fontSize="sm">
                        {error}
                      </Text>
                    )}

                    <VStack spacing={5} pt={4}></VStack>
                    <Button
                      w="100%"
                      bgGradient="linear(to-r, #8A2BE2, #FF1493)"
                      animation={`${glowAnimation} 3s infinite`}
                      color="white"
                      h="54px"
                      fontSize="md"
                      fontWeight="500"
                      borderRadius="16px"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(138, 43, 226, 0.4)',
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                      transition="all 0.2s"
                      onClick={handleSignUp}
                    >
                      アカウントを作成
                    </Button>

                    <Divider borderColor="whiteAlpha.200" />

                    <Box textAlign="center">
                      <Text color="whiteAlpha.700" fontSize="sm">
                        すでにアカウントをお持ちの方は{' '}
                        <Text
                          as={RouterLink}
                          to="/signin"
                          color="purple.300"
                          _hover={{ textDecoration: 'underline' }}
                        >
                          サインイン
                        </Text>
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

export default SignUp;
