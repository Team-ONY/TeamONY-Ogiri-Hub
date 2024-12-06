import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Input,
  VStack,
  Heading,
  FormLabel,
  Icon,
  Text,
  RadioGroup,
  Radio,
  HStack,
  Image,
  Spinner,
  Center,
  FormControl,
  FormHelperText,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiEdit3, FiClock, FiUsers, FiSend, FiImage } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { generateImage } from '../../../services/api';

const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionButton = motion(Button);
const MotionModalContent = motion(ModalContent);

const CreateOgiriEventModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [maxResponses, setMaxResponses] = useState('');
  const [odaiType, setOdaiType] = useState('text'); // 'text' or 'image'
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');
  const [lastGeneratedTime, setLastGeneratedTime] = useState(0);

  const handleCreateEvent = async () => {
    // バリデーションを追加
    if (!title && odaiType === 'text') {
      setError('お題を入力してください');
      return;
    }
    if (!selectedImage && odaiType === 'image') {
      setError('画像を選択してください');
      return;
    }
    if (!duration) {
      setError('回答受付期間を入力してください');
      return;
    }
    if (!maxResponses) {
      setError('回答数を入力してください');
      return;
    }

    const newEvent = {
      title: odaiType === 'text' ? title : '',
      selectedImage: odaiType === 'image' ? selectedImage : null,
      duration: Number(duration),
      maxResponses: Number(maxResponses),
      odaiType,
      status: 'active',
    };

    onClose(newEvent);
  };

  // AI画像生成の処理
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setError('プロンプトを入力してください');
      return;
    }

    // 生成回数の制限
    if (generatedImages.length >= 3) {
      setError('画像生成は3回までです');
      return;
    }

    // 最後の生成から3秒以上経過していることを確認
    const now = Date.now();
    if (now - lastGeneratedTime < 3000) {
      setError('画像生成の間隔を空けてください');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const imageUrl = await generateImage(imagePrompt);

      setGeneratedImages((prevImages) => [...prevImages, imageUrl]);
      setSelectedImage(imageUrl);
      setLastGeneratedTime(Date.now());
    } catch (error) {
      console.error('画像生成エラー:', error);
      setError(
        error.message ||
          '画像の生成に失敗しました。しばらく待ってから再度お試しください。'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay backdropFilter="blur(10px)" />
      <MotionModalContent
        bg="linear-gradient(170deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)"
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius="2xl"
        boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        mx={4}
      >
        <ModalHeader pt={8} px={8}>
          <VStack align="center" spacing={3}>
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
              大喜利イベントの作成
            </Heading>
            <Text color="whiteAlpha.700" fontSize="md">
              面白い大喜利イベントを作成しましょう ✨
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton
          color="whiteAlpha.700"
          _hover={{
            color: 'white',
            bg: 'whiteAlpha.200',
          }}
        />
        <ModalBody px={8} py={6}>
          <VStack spacing={6} align="stretch">
            <MotionBox>
              <FormLabel color="white">お題タイプ</FormLabel>
              <RadioGroup value={odaiType} onChange={setOdaiType}>
                <HStack spacing={4}>
                  <Radio
                    value="text"
                    colorScheme="purple"
                    transform="scale(1)"
                    _hover={{
                      transform: 'scale(1.2)',
                      transition: 'transform 0.3s cubic-bezier(0.8, 0, 0.2, 1)',
                      backgroundColor: 'pink.300',
                    }}
                    _checked={{
                      transform: 'scale(1.3)',
                      transition: 'transform 0.4s cubic-bezier(0.8, 0, 0.2, 1)',
                      backgroundColor: 'purple.500',
                      color: 'white',
                      boxShadow: '0 0 20px rgba(255, 171, 245, 0.5)',
                    }}
                  >
                    テキスト
                  </Radio>
                  <Radio
                    value="image"
                    colorScheme="purple"
                    color="white"
                    transform="scale(1)"
                    _hover={{
                      transform: 'scale(1.2)',
                      transition: 'transform 0.3s cubic-bezier(0.8, 0, 0.2, 1)',
                      backgroundColor: 'pink.300',
                    }}
                    _checked={{
                      transform: 'scale(1.3)',
                      transition: 'transform 0.4s cubic-bezier(0.8, 0, 0.2, 1)',
                      backgroundColor: 'purple.500',
                      color: 'white',
                      boxShadow: '0 0 20px rgba(255, 171, 245, 0.5)',
                    }}
                  >
                    AI生成画像
                  </Radio>
                </HStack>
              </RadioGroup>
            </MotionBox>

            {odaiType === 'text' ? (
              <MotionBox>
                <FormLabel color="white">
                  <Icon as={FiEdit3} /> テキストお題
                </FormLabel>
                <MotionInput
                  placeholder="面白いお題を入力してください"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  bg="blackAlpha.400"
                  color="white"
                  borderRadius="xl"
                  py={6}
                  px={6}
                  fontSize="lg"
                  border="2px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{
                    borderColor: 'pink.400',
                    transform: 'translateY(-2px)',
                  }}
                  _focus={{
                    borderColor: 'pink.400',
                    boxShadow: '0 0 0 1px rgba(255, 25, 136, 0.3)',
                    bg: 'blackAlpha.500',
                  }}
                  transition="all 0.3s ease"
                />
              </MotionBox>
            ) : (
              <MotionBox>
                <FormLabel color="white">
                  <Icon as={FiImage} /> AI画像生成
                </FormLabel>
                <VStack spacing={4} align="stretch">
                  <MotionInput
                    placeholder="画像生成のプロンプトを入力してください"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    bg="blackAlpha.400"
                    color="white"
                    borderRadius="xl"
                    py={6}
                    px={6}
                    fontSize="lg"
                    border="2px solid"
                    borderColor="whiteAlpha.200"
                    _hover={{
                      borderColor: 'pink.400',
                      transform: 'translateY(-2px)',
                    }}
                    _focus={{
                      borderColor: 'pink.400',
                      boxShadow: '0 0 0 1px rgba(255, 25, 136, 0.3)',
                      bg: 'blackAlpha.500',
                    }}
                    transition="all 0.3s ease"
                  />
                  {!isGenerating && (
                    <Button
                      onClick={handleGenerateImage}
                      colorScheme="purple"
                      leftIcon={<Icon as={FiImage} />}
                      isDisabled={generatedImages.length >= 3}
                    >
                      画像を生成 ({generatedImages.length}/3)
                    </Button>
                  )}

                  {isGenerating && (
                    <Center p={8}>
                      <VStack spacing={4}>
                        <Spinner
                          thickness="4px"
                          speed="0.65s"
                          emptyColor="gray.200"
                          color="purple.500"
                          size="xl"
                        />
                        <Text color="whiteAlpha.800">
                          AIが画像を生成中です...
                        </Text>
                      </VStack>
                    </Center>
                  )}

                  {selectedImage && (
                    <Box
                      borderRadius="xl"
                      overflow="hidden"
                      border="2px solid"
                      borderColor="whiteAlpha.200"
                      mb={4}
                    >
                      <Image
                        src={selectedImage}
                        alt="Selected image"
                        width="100%"
                        height="auto"
                        maxH="400px"
                        objectFit="contain"
                      />
                    </Box>
                  )}

                  {generatedImages.length > 0 && (
                    <HStack spacing={4} justify="center">
                      {generatedImages.map((image, index) => (
                        <Box
                          key={index}
                          cursor="pointer"
                          onClick={() => setSelectedImage(image)}
                          borderRadius="xl"
                          overflow="hidden"
                          border="2px solid"
                          borderColor={
                            selectedImage === image
                              ? 'pink.400'
                              : 'whiteAlpha.200'
                          }
                          width="100px"
                          height="100px"
                          transition="all 0.2s"
                          _hover={{
                            borderColor: 'pink.400',
                            transform: 'scale(1.05)',
                          }}
                        >
                          <Image
                            src={image}
                            alt={`Generated image ${index + 1}`}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                          />
                        </Box>
                      ))}
                    </HStack>
                  )}
                </VStack>
              </MotionBox>
            )}

            <MotionBox>
              <FormLabel
                color="whiteAlpha.900"
                fontSize="md"
                fontWeight="bold"
                display="flex"
                alignItems="center"
                gap={2}
                mb={3}
              >
                <Icon as={FiClock} />
                回答受付期間 (日数)
              </FormLabel>
              <MotionInput
                type="number"
                placeholder="受付期間を入力してください"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                bg="blackAlpha.400"
                color="white"
                borderRadius="xl"
                py={6}
                px={6}
                fontSize="lg"
                border="2px solid"
                borderColor="whiteAlpha.200"
                _hover={{
                  borderColor: 'pink.400',
                  transform: 'translateY(-2px)',
                }}
                _focus={{
                  borderColor: 'pink.400',
                  boxShadow: '0 0 0 1px rgba(255, 25, 136, 0.3)',
                  bg: 'blackAlpha.500',
                }}
                transition="all 0.3s ease"
              />
            </MotionBox>

            <MotionBox>
              <FormControl>
                <FormLabel
                  color="whiteAlpha.900"
                  fontSize="md"
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  gap={2}
                  mb={3}
                >
                  <Icon as={FiUsers} />
                  一人あたりの回答制限
                </FormLabel>
                <MotionInput
                  type="number"
                  placeholder="一人あたりの回答制限を入力してください"
                  value={maxResponses}
                  onChange={(e) => setMaxResponses(e.target.value)}
                  bg="blackAlpha.400"
                  color="white"
                  borderRadius="xl"
                  py={6}
                  px={6}
                  fontSize="lg"
                  border="2px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{
                    borderColor: 'pink.400',
                    transform: 'translateY(-2px)',
                  }}
                  _focus={{
                    borderColor: 'pink.400',
                    boxShadow: '0 0 0 1px rgba(255, 25, 136, 0.3)',
                    bg: 'blackAlpha.500',
                  }}
                  transition="all 0.3s ease"
                />
                <FormHelperText color="whiteAlpha.600">
                  一人のユーザーが投稿できる回答の最大数
                </FormHelperText>
              </FormControl>
            </MotionBox>

            {error && (
              <Text color="red.500" fontSize="sm" mt={2}>
                {error}
              </Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter px={8} pb={8} gap={4}>
          <MotionButton
            onClick={handleCreateEvent}
            bg="linear-gradient(135deg, #FF1988 0%, #805AD5 100%)"
            color="white"
            size="lg"
            height="56px"
            fontSize="lg"
            px={8}
            borderRadius="xl"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 15px -3px rgba(255, 25, 136, 0.3)',
              bg: 'linear-gradient(135deg, #FF1988 20%, #6B46C1 120%)',
            }}
            _active={{ transform: 'scale(0.95)' }}
            leftIcon={<Icon as={FiSend} />}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            イベントを作成
          </MotionButton>
          <Button
            variant="ghost"
            onClick={onClose}
            color="whiteAlpha.700"
            _hover={{
              bg: 'whiteAlpha.100',
              color: 'white',
            }}
            height="56px"
            fontSize="lg"
            px={8}
            borderRadius="xl"
          >
            キャンセル
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  );
};

CreateOgiriEventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateOgiriEventModal;
