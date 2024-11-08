import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import { createThread } from '../services/threadService';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionTextarea = motion(Textarea);
const MotionButton = motion(Button);

function CreateThread() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const toast = useToast();

  const handleCreateThread = async () => {
    if (!title || !content) {
      toast({
        title: 'エラー',
        description: 'タイトルと内容を入力してください。',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await createThread(title, content);
      toast({
        title: '作成完了',
        description: 'スレッドが作成されました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setTitle('');
      setContent('');
    } catch (err) {
      toast({
        title: 'エラー',
        description: `スレッドの作成に失敗しました: ${err}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <MotionBox
      p={8}
      mt={20}
      borderRadius="2xl"
      bg="blackAlpha.400"
      backdropFilter="blur(10px)"
      boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={8}>
        <Heading size="xl" color="white" fontWeight="bold">
          新規スレッド作成
        </Heading>
        <VStack spacing={4} align="stretch" w="100%">
          <MotionInput
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            bg="blackAlpha.500"
            color="white"
            borderRadius="full"
            py={4}
            px={6}
            fontSize="md"
            border="2px solid"
            borderColor="blackAlpha.500"
            _hover={{ borderColor: 'gray.600' }}
            _focus={{ borderColor: 'pink.400', boxShadow: '0 0 0 1px #FF1988' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          />
          <MotionTextarea
            placeholder="内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            bg="blackAlpha.500"
            color="white"
            borderRadius="2xl"
            py={4}
            px={6}
            fontSize="md"
            border="2px solid"
            borderColor="blackAlpha.500"
            _hover={{ borderColor: 'gray.600' }}
            _focus={{ borderColor: 'pink.400', boxShadow: '0 0 0 1px #FF1988' }}
            rows={5}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
          <MotionButton
            onClick={handleCreateThread}
            colorScheme="pink"
            size="lg"
            fontWeight="bold"
            borderRadius="full"
            px={10}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 15px -3px rgba(255, 25, 136, 0.3)',
            }}
            _active={{ transform: 'scale(0.95)' }}
          >
            <Text letterSpacing="wide">作成</Text>
          </MotionButton>
        </VStack>
      </VStack>
    </MotionBox>
  );
}

export default CreateThread;
