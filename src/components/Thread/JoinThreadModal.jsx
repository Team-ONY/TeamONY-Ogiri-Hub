import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Checkbox,
  Box,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FiAlertCircle } from 'react-icons/fi';
import { useState } from 'react';
import PropTypes from 'prop-types';

const JoinThreadModal = ({ isOpen, onClose, thread, onJoin }) => {
  const [agreedRules, setAgreedRules] = useState({});
  const toast = useToast();

  const handleCheckRule = (index) => {
    setAgreedRules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleJoin = async () => {
    if (!allRulesAgreed) {
      toast({
        title: 'エラー',
        description: 'すべてのルールに同意する必要があります。',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    await onJoin();
    onClose();
  };

  const allRulesAgreed = thread?.rules?.every((_, index) => agreedRules[index]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="linear-gradient(170deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius="2xl"
        p={4}
      >
        <ModalHeader display="flex" alignItems="center" gap={2}>
          <Icon as={FiAlertCircle} color="pink.400" />
          <Text bgGradient="linear(to-r, pink.400, purple.400)" bgClip="text">
            スレッドに参加
          </Text>
        </ModalHeader>

        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Text fontWeight="bold" color="white">
              「{thread?.title}」に参加しますか？
            </Text>

            <Box
              bg="whiteAlpha.50"
              p={4}
              borderRadius="xl"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontWeight="bold" mb={4} color="white">
                スレッドのルール
              </Text>
              <VStack align="start" spacing={3}>
                {thread?.rules?.map((rule, index) => (
                  <Checkbox
                    key={index}
                    isChecked={agreedRules[index]}
                    onChange={() => handleCheckRule(index)}
                    colorScheme="pink"
                  >
                    <Text color="whiteAlpha.900">{rule}</Text>
                  </Checkbox>
                ))}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            variant="ghost"
            onClick={onClose}
            color="whiteAlpha.600"
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleJoin}
            bgGradient="linear(to-r, pink.400, purple.400)"
            color="white"
            isDisabled={!allRulesAgreed}
            _hover={{
              bgGradient: 'linear(to-r, pink.500, purple.500)',
            }}
            _disabled={{
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
          >
            同意して参加する
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

JoinThreadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  thread: PropTypes.shape({
    title: PropTypes.string.isRequired,
    rules: PropTypes.arrayOf(PropTypes.string),
  }),
  onJoin: PropTypes.func.isRequired,
};

export default JoinThreadModal;
