import { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import {
  Box,
  Button,
  Input,
  Flex,
  Avatar,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionInput = motion(Input);
const MotionSelect = motion(Select);

const ProfileEdit = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [icon, setIcon] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const iconOptions = ['icon1.png', 'icon2.png', 'icon3.png']; // アイコンの選択肢

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || '');
      setEmail(user.email || '');
      setIcon(user.photoURL || '');
    }
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, {
          displayName: username,
          photoURL: icon,
        });
        await updateEmail(user, email);
        if (password) {
          await updatePassword(user, password);
        }
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
          username,
          email,
          photoURL: icon,
        });
        setSuccess('プロフィールが更新されました');
        setError(''); // 成功時はエラーメッセージをクリア
      }
    } catch (err) {
      console.error(err);
      setError('プロフィールの更新に失敗しました');
      setSuccess(''); // 失敗時は成功メッセージをクリア
    }
  };

  return (
    <MotionBox
      minH="100vh"
      bg="linear(to-br, blackAlpha.800, gray.900)" // commonStyles.bgGradient を直接指定
      px={4}
      pt={24}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        maxW="700px"
        mx="auto"
        p={8}
        borderRadius="2xl" // commonStyles.borderRadius を直接指定
        bg="rgba(0, 0, 0, 0.4)"
        backdropFilter="blur(16px)"
        border="1px solid rgba(255, 255, 255, 0.1)" // commonStyles.border を直接指定
        boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)" // commonStyles.boxShadow を直接指定
      >
        <Flex direction="column" align="center" mb={6}>
          <Avatar size="2xl" src={icon} mb={4} />
          <MotionSelect
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            mb={4}
            bg="rgba(255, 255, 255, 0.06)"
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }} // commonStyles.inputHoverBg を直接指定
            _focus={{
              bg: 'rgba(255, 255, 255, 0.08)', // commonStyles.inputFocusBg を直接指定
              boxShadow: '0 0 0 2px pink.400', // commonStyles.inputFocusBoxShadow を直接指定
              borderColor: 'transparent',
            }}
            borderRadius="2xl" // commonStyles.borderRadius を直接指定
            fontSize="lg" // commonStyles.fontSize を直接指定
            fontWeight="bold" // commonStyles.fontWeight を直接指定
            transition="all 0.3s"
            border="1px solid rgba(255, 255, 255, 0.1)" // commonStyles.border を直接指定
            boxShadow="0 0 30px rgba(236, 72, 153, 0.3)"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 25px rgba(236, 72, 153, 0.5)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {iconOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </MotionSelect>
        </Flex>
        <FormControl mb={4} isInvalid={!!error}>
          {' '}
          {/* errorがnullでない場合にisInvalidをtrueにする */}
          <FormLabel htmlFor="password" color="white">
            パスワード
          </FormLabel>
          <MotionInput
            id="password"
            type="password" // パスワード入力用にtypeを設定
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="新しいパスワードを入力してください"
            bg="rgba(255, 255, 255, 0.06)"
            color="white"
            _placeholder={{ color: 'gray.400' }}
            _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }} // commonStyles.inputHoverBg を直接指定
            _focus={{
              bg: 'rgba(255, 255, 255, 0.08)', // commonStyles.inputFocusBg を直接指定
              boxShadow: '0 0 0 2px pink.400', // commonStyles.inputFocusBoxShadow を直接指定
              borderColor: 'transparent',
            }}
            borderRadius="2xl" // commonStyles.borderRadius を直接指定
            fontSize="lg" // commonStyles.fontSize を直接指定
            fontWeight="bold" // commonStyles.fontWeight を直接指定
            transition="all 0.3s"
            border="1px solid rgba(255, 255, 255, 0.1)" // commonStyles.border を直接指定
            boxShadow="0 0 30px rgba(236, 72, 153, 0.3)"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 25px rgba(236, 72, 153, 0.5)',
            }}
            whileTap={{ scale: 0.95 }}
          />
          <FormErrorMessage>{error}</FormErrorMessage>{' '}
          {/* エラーメッセージを表示 */}
        </FormControl>
        {/* ... existing code for email and password ... */}
        <MotionButton
          onClick={handleUpdateProfile}
          colorScheme="pink"
          w="full"
          mt={4} // マージントップを追加
          bg="rgba(255, 255, 255, 0.06)"
          color="white"
          _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }} // commonStyles.inputHoverBg を直接指定
          _active={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          borderRadius="2xl" // commonStyles.borderRadius を直接指定
          fontSize="lg" // commonStyles.fontSize を直接指定
          fontWeight="bold" // commonStyles.fontWeight を直接指定
          transition="all 0.3s"
          border="1px solid rgba(255, 255, 255, 0.1)" // commonStyles.border を直接指定
          boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)" // commonStyles.boxShadow を直接指定
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 25px rgba(236, 72, 153, 0.5)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          更新
        </MotionButton>
        {error && (
          <Text color="red.500" mt={2}>
            {error}
          </Text>
        )}{' '}
        {/* エラーメッセージ */}
        {success && (
          <Text color="green.500" mt={2}>
            {success}
          </Text>
        )}{' '}
        {/* 成功メッセージ */}
      </Box>
    </MotionBox>
  );
};

export default ProfileEdit;
