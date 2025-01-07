import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  Icon,
} from '@chakra-ui/react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import { PropTypes } from 'prop-types';

const DeleteOgiriEventModal = ({ isOpen, onClose, onDelete, eventTitle }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="linear-gradient(170deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius="2xl"
        p={4}
        maxW="400px"
      >
        <ModalHeader
          bgGradient="linear(to-r, pink.400, purple.400)"
          bgClip="text"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={FiAlertCircle} />
          大喜利イベントの削除
        </ModalHeader>
        <ModalCloseButton color="whiteAlpha.600" />

        <ModalBody color="whiteAlpha.900">
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold">「{eventTitle}」を削除しますか？</Text>
            <Box
              bg="whiteAlpha.100"
              p={4}
              borderRadius="xl"
              fontSize="sm"
              color="whiteAlpha.800"
            >
              <Text>この操作は取り消すことができません。</Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            onClick={onClose}
            variant="ghost"
            color="whiteAlpha.700"
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            キャンセル
          </Button>
          <Button
            onClick={onDelete}
            bgGradient="linear(to-r, pink.400, purple.400)"
            color="white"
            _hover={{
              bgGradient: 'linear(to-r, pink.500, purple.500)',
            }}
            leftIcon={<FiX />}
          >
            削除する
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

DeleteOgiriEventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  eventTitle: PropTypes.string.isRequired,
};

export default DeleteOgiriEventModal;
