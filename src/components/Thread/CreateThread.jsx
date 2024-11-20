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
  FormLabel,
  Container,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { createThread } from '../../services/threadService';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiEdit3,
  FiHash,
  FiPaperclip,
  FiMessageSquare,
  FiSend,
  FiUpload,
} from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionTextarea = motion(Textarea);
const MotionButton = motion(Button);

function CreateThread() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

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
      await createThread(title, content, tags, attachments);
      toast({
        title: '作成完了',
        description: 'スレッドが作成されました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setTitle('');
      setTags([]);
      setAttachments([]);
      setContent('');
      navigate('/thread');
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
    <Container maxW="1200px" px={4}>
      <MotionBox
        p={12}
        mt={20}
        borderRadius="3xl"
        bg="linear-gradient(170deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)"
        backdropFilter="blur(20px)"
        boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
        border="1px solid"
        borderColor="whiteAlpha.100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        position="relative"
      >
        <IconButton
          icon={<Icon as={FaArrowLeft} />}
          onClick={() => navigate('/thread')}
          bg="linear-gradient(135deg, #FF1988 0%, #805AD5 100%)"
          color="white"
          size="lg"
          borderRadius="full"
          aria-label="Back to threads"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 15px -3px rgba(255, 25, 136, 0.3)',
            bg: 'linear-gradient(135deg, #FF1988 20%, #6B46C1 120%)',
          }}
          _active={{ transform: 'scale(0.95)' }}
          position="absolute"
          top="30px"
          left="30px"
          zIndex={1} // Boxにかぶるから
        />
        <VStack spacing={10}>
          <Box textAlign="center">
            <Heading
              size="2xl"
              bgGradient="linear(to-r, pink.400, purple.400)"
              bgClip="text"
              fontWeight="extrabold"
              letterSpacing="tight"
              display="flex"
              alignItems="center"
              ml={-100}
              gap={3}
            >
              <Icon as={FiEdit3} />
              #Create New Thread
            </Heading>
            <Text color="whiteAlpha.700" mt={3} ml={-5}>
              あなたの素敵な投稿をお待ちしています ✨
            </Text>
          </Box>

          <VStack spacing={8} align="stretch" w="100%">
            <Box>
              <FormLabel
                color="whiteAlpha.700"
                fontSize="md"
                fontWeight="medium"
                mb={3}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FiEdit3} />
                Thread Title
              </FormLabel>
              <MotionInput
                placeholder="素敵なタイトルを入力してください"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                bg="blackAlpha.400"
                color="white"
                borderRadius="xl"
                py={7}
                px={6}
                fontSize="lg"
                border="2px solid"
                borderColor="whiteAlpha.100"
                _hover={{
                  borderColor: 'pink.400',
                  transform: 'translateY(-2px)',
                }}
                _focus={{
                  borderColor: 'pink.400',
                  boxShadow: '0 0 0 1px rgba(255, 25, 136, 0.3)',
                  bg: 'blackAlpha.500',
                }}
                sx={{ transition: 'all 0.3s ease' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              />
            </Box>

            <Box>
              <FormLabel
                color="whiteAlpha.700"
                fontSize="md"
                fontWeight="medium"
                mb={3}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FiHash} />
                Tags
              </FormLabel>
              <MotionInput
                placeholder="タグをカンマ区切りで入力 (例: 質問, 相談, 雑談)"
                value={tags.join(',')}
                onChange={(e) =>
                  setTags(e.target.value.split(',').map((tag) => tag.trim()))
                }
                bg="blackAlpha.400"
                color="white"
                borderRadius="xl"
                py={7}
                px={6}
                fontSize="lg"
                border="2px solid"
                borderColor="whiteAlpha.100"
                _hover={{
                  borderColor: 'pink.400',
                  transform: 'translateY(-2px)',
                }}
                _focus={{
                  borderColor: 'pink.400',
                  boxShadow: '0 0 0 1px rgba(255, 25, 136, 0.3)',
                  bg: 'blackAlpha.500',
                }}
                sx={{ transition: 'all 0.3s ease' }}
              />
            </Box>

            <Box>
              <FormLabel
                color="whiteAlpha.700"
                fontSize="md"
                fontWeight="medium"
                mb={3}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FiPaperclip} />
                Attachments
              </FormLabel>
              <Box
                position="relative"
                borderRadius="xl"
                border="2px dashed"
                borderColor="whiteAlpha.200"
                bg="blackAlpha.400"
                _hover={{
                  borderColor: 'pink.400',
                  bg: 'blackAlpha.500',
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.3s ease"
                cursor="pointer"
                h="200px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={4}
              >
                <input
                  type="file"
                  multiple
                  onChange={(e) => setAttachments(e.target.files)}
                  style={{
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    cursor: 'pointer',
                  }}
                />
                <Icon
                  as={FiUpload}
                  w={10}
                  h={10}
                  color="pink.400"
                  filter="drop-shadow(0 0 8px rgba(255, 25, 136, 0.3))"
                />
                <VStack spacing={2}>
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    ドラッグ＆ドロップ
                  </Text>
                  <Text color="whiteAlpha.700">
                    または クリックしてファイルを選択
                  </Text>
                </VStack>
                <Text color="whiteAlpha.500" fontSize="sm" mt={2}>
                  対応形式: JPG, PNG, GIF, PDF など
                </Text>
              </Box>
            </Box>

            <Box>
              <FormLabel
                color="whiteAlpha.700"
                fontSize="md"
                fontWeight="medium"
                mb={3}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FiMessageSquare} />
                Thread Content
              </FormLabel>
              <MotionTextarea
                placeholder="スレッドの内容を入力してください"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                bg="blackAlpha.400"
                color="white"
                borderRadius="xl"
                py={7}
                px={6}
                fontSize="lg"
                border="2px solid"
                borderColor="whiteAlpha.100"
                _hover={{
                  borderColor: 'pink.400',
                  transform: 'translateY(-2px)',
                }}
                _focus={{
                  borderColor: 'pink.400',
                  boxShadow: '0 0 0 1px rgba(255, 25, 136, 0.3)',
                  bg: 'blackAlpha.500',
                }}
                rows={10}
                sx={{ transition: 'all 0.3s ease' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
            </Box>

            <MotionButton
              onClick={handleCreateThread}
              bgGradient="linear(to-r, pink.400, purple.400)"
              size="lg"
              fontWeight="bold"
              borderRadius="xl"
              px={12}
              py={8}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px -5px rgba(255, 25, 136, 0.3)',
                bgGradient: 'linear(to-r, pink.500, purple.500)',
              }}
              _active={{ transform: 'scale(0.98)' }}
              display="flex"
              alignItems="center"
              gap={3}
            >
              <Icon as={FiSend} w={5} h={5} />
              <Text letterSpacing="wider" fontSize="xl">
                スレッドを作成
              </Text>
            </MotionButton>
          </VStack>
        </VStack>
      </MotionBox>
    </Container>
  );
}

export default CreateThread;
