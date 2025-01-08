import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
  FormLabel,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiEdit3,
  FiHash,
  FiPaperclip,
  FiMessageSquare,
  FiUpload,
} from 'react-icons/fi';
import PropTypes from 'prop-types';
import { createThread } from '../../services/threadService';

// Motion components
const MotionInput = motion(Input);
const MotionTextarea = motion(Textarea);
const MotionButton = motion(Button);

// Common styles
const inputStyles = {
  bg: 'blackAlpha.400',
  color: 'white',
  borderRadius: 'xl',
  py: { base: 5, md: 7 },
  px: { base: 4, md: 6 },
  fontSize: { base: 'md', md: 'lg' },
  border: '2px solid',
  borderColor: 'whiteAlpha.100',
  transition: 'all 0.3s ease',
  _hover: {
    borderColor: 'pink.400',
    transform: 'translateY(-2px)',
  },
  _focus: {
    borderColor: 'pink.400',
    boxShadow: '0 0 0 1px rgba(255, 25, 136, 0.3)',
    bg: 'blackAlpha.500',
  },
};

const FormSection = ({ icon, label, children }) => (
  <Box>
    <FormLabel
      color="whiteAlpha.700"
      fontSize={{ base: 'sm', md: 'md' }}
      fontWeight="medium"
      mb={3}
      display="flex"
      alignItems="center"
      gap={2}
    >
      <Icon as={icon} />
      {label}
    </FormLabel>
    {children}
  </Box>
);

const CreateThreadModal = ({ isOpen, onClose, onThreadCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const toast = useToast();
  const [inputValue, setInputValue] = useState('');

  const MAX_TITLE_LENGTH = 30;
  const MAX_TAG_LENGTH = 30;
  const MAX_TAGS_COUNT = 5;

  const handleCreateThread = async () => {
    // タイトルが空または文字数超過の場合のエラーチェックを追加
    if (!title || title.length > MAX_TITLE_LENGTH) { // 変更
      toast({
        title: 'エラー',
        description: `タイトルは１文字以上${MAX_TITLE_LENGTH}文字以下にしてください。`, // 変更
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // タグの検証を追加
    /*1. タグの配列(tags)の長さをチェック、MAX_TAGS_COUNT(5個)より大きいならエラー*/
    if (tags.length > MAX_TAGS_COUNT) {
      toast({
        title: 'エラー',
        description: `タグは${MAX_TAGS_COUNT}個までです。`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    //タグ文字数
    //2. 各タグの文字数をチェック、filterで30文字超のタグを抽出。１つでも存在すればエラー。
    const longTags = tags.filter(tag => tag.length > MAX_TAG_LENGTH);
    if (longTags.length > 0) {
      toast({
        title: 'エラー',
        description: `タグは${MAX_TAG_LENGTH}文字以下にしてください。`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!content) {
      toast({
        title: 'エラー',
        description: 'スレッドの内容を入力してください。',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await createThread(title, content, tags, attachments);
      await onThreadCreated();
      toast({
        title: '作成完了',
        description: 'スレッドが作成されました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setTitle('');
      setContent('');
      setTags([]);
      setAttachments([]);
      onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="linear-gradient(170deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius="2xl"
        boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
        px={{ base: 4, md: 8 }}
      >
        <ModalHeader>
          <Heading
            size="xl"
            bgGradient="linear(to-r, pink.400, purple.400)"
            bgClip="text"
            fontWeight="extrabold"
            letterSpacing="tight"
            display="flex"
            alignItems="center"
            gap={3}
          >
            <Icon as={FiEdit3} />
            Create New Thread
          </Heading>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={{ base: 6, md: 8 }} align="stretch">
            <FormSection icon={FiEdit3} label="Thread Title">
              <MotionInput
                placeholder="素敵なタイトルを入力してください"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                {...inputStyles}
              />
              {/* 現在のタイトル文字数を表示 */}
              <Text
                color={
                  title.length > MAX_TITLE_LENGTH ? 'red.400' : 'whiteAlpha.700'
                } // 追加
                fontSize="sm"
                mt={2}
                textAlign="right"
                ml="auto"
              >
                {title.length}/{MAX_TITLE_LENGTH} 文字
              </Text>
            </FormSection>

            <FormSection icon={FiHash} label="Tags">
              <MotionInput
                placeholder="タグをカンマ区切りで入力 (例: 質問, 相談, 雑談)"
                value={inputValue} // 入力中の文字列をそのまま表示
                onChange={(e) => {
                  const currentInput = e.target.value;
                  setInputValue(currentInput); // 入力値を保持

                  // タグの処理
                  const newTags = currentInput
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag !== '')
                  setTags(newTags);
                }}
                {...inputStyles}
              />
              {/* タグの入力状況を表示 */}
              <Text
                color={
                  tags.length >= MAX_TAGS_COUNT ? 'red.400' : 'whiteAlpha.700'
                } // 追加 
                mt={2} 
                fontSize="sm" 
                textAlign="right"
              >                
                {tags.length}/5
              </Text>

            </FormSection>

            <FormSection icon={FiPaperclip} label="Attachments">
              <FileUploadBox setAttachments={setAttachments} />
            </FormSection>

            <FormSection icon={FiMessageSquare} label="Thread Content">
              <MotionTextarea
                placeholder="スレッドの内容を入力してください"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                {...inputStyles}
              />
            </FormSection>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <MotionButton
            onClick={handleCreateThread}
            bg="linear-gradient(135deg, #FF1988 0%, #805AD5 100%)"
            color="white"
            size={{ base: 'lg', md: 'xl' }}
            height={{ base: '50px', md: '60px' }}
            width={{ base: '100%', md: '250px' }}
            fontSize={{ base: 'lg', md: 'xl' }}
            borderRadius="xl"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 15px -3px rgba(255, 25, 136, 0.3)',
            }}
            leftIcon={<FiEdit3 />}
          >
            スレッドを作成
          </MotionButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const FileUploadBox = ({ setAttachments }) => (
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
    h={{ base: '150px', md: '200px' }}
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
      w={{ base: 8, md: 10 }}
      h={{ base: 8, md: 10 }}
      color="pink.400"
      filter="drop-shadow(0 0 8px rgba(255, 25, 136, 0.3))"
    />
    <VStack spacing={2}>
      <Text color="white" fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
        ドラッグ＆ドロップ
      </Text>
      <Text color="whiteAlpha.700" fontSize={{ base: 'sm', md: 'md' }}>
        または クリックしてファイルを選択
      </Text>
    </VStack>
    <Text color="whiteAlpha.500" fontSize={{ base: 'xs', md: 'sm' }} mt={2}>
      対応形式: JPG, PNG, GIF, PDF など
    </Text>
  </Box>
);

CreateThreadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onThreadCreated: PropTypes.func.isRequired,
};

FormSection.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

FileUploadBox.propTypes = {
  setAttachments: PropTypes.func.isRequired,
};

export default CreateThreadModal;
