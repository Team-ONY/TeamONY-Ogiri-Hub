import { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  IconButton,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import { HiPencil } from 'react-icons/hi';
import { motion } from 'framer-motion';
import {PropTypes} from 'prop-types';

const MotionBox = motion(Box);

const UserInfoCard = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAvatarListOpen, setIsAvatarListOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openAvatarList = () => setIsAvatarListOpen(true);
  const closeAvatarList = () => setIsAvatarListOpen(false);

  return (
    <>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        mb={6}
        bg="rgba(255, 255, 255, 0.05)"
        borderRadius="xl"
        p={6}
        position="relative"
        backdropFilter="blur(10px)"
        boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
        border="1px solid rgba(255, 255, 255, 0.1)"
      >
        <IconButton
          icon={<HiPencil />}
          position="absolute"
          top={4}
          right={4}
          colorScheme="purple"
          variant="ghost"
          borderRadius="full"
          onClick={openModal}
          _hover={{
            bg: 'rgba(138, 43, 226, 0.2)',
          }}
        />
        <VStack spacing={4}>
          <Avatar
            size="2xl"
            name={user ? user.displayName : 'Anonymous'}
            src={user?.photoURL || 'defaultPhotoURL'}
            border="4px solid"
            borderColor="purple.500"
            boxShadow="0 0 20px rgba(138, 43, 226, 0.4)"
          />
          <Text
            fontSize="2xl"
            fontWeight="bold"
            bgGradient="linear(to-r, purple.400, pink.400)"
            bgClip="text"
          >
            {user?.displayName}
          </Text>
          <Text color="whiteAlpha.600">@{user?.email?.substr(0, user?.email?.indexOf('@'))}</Text>
        </VStack>
      </MotionBox>

      {/* プロフィール編集モーダル */}
      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent
          bg="linear-gradient(170deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="2xl"
          boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37), 0 8px 32px 0 rgba(128, 90, 213, 0.37)"
          px={{ base: 4, md: 8 }}
        >
          <ModalHeader color="white">プロフィール編集</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={6}>
              {/* アバター編集セクション */}
              <Box>
                <Text color="whiteAlpha.800" mb={2}>アバターを選択</Text>
                <Box display="flex" gap={4} mb={4}>
                  {/* ファイルアップロード */}
                  <Button
                    colorScheme="purple"
                    onClick={() => document.getElementById('avatar-upload').click()}
                  >
                    アバターをアップロード
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => console.log("アップロードされたファイル:", e.target.files[0])}
                  />
                </Box>
                {/* アバター一覧表示ボタン */}
                <Button colorScheme="purple" onClick={openAvatarList}>
                  アバター一覧を表示
                </Button>
              </Box>

              {/* 保存ボタン */}
              <Button
                width="100%"
                colorScheme="pink"
                onClick={() => console.log("プロフィール保存")}
              >
                保存
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* アバター一覧モーダル */}
      <Modal isOpen={isAvatarListOpen} onClose={closeAvatarList} isCentered>
        <ModalOverlay />
        <ModalContent
          bg="rgba(0, 0, 0, 0.9)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="2xl"
          boxShadow="0 8px 32px 0 rgba(236, 72, 153, 0.37)"
          px={{ base: 4, md: 8 }}
        >
          <ModalHeader color="white">アバター一覧</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <SimpleGrid columns={3} spacing={4}>
              {[...Array(9)].map((_, idx) => (
                <Avatar
                  key={idx}
                  src={`https://via.placeholder.com/150?text=Avatar+${idx + 1}`}
                  cursor="pointer"
                  size="xl"
                  onClick={() => console.log(`アバター${idx + 1}が選択されました`)}
                  _hover={{
                    boxShadow: '0 0 10px rgba(236, 72, 153, 0.6)',
                  }}
                />
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

UserInfoCard.propTypes = {
  user: PropTypes.object.isRequired,
};

export default UserInfoCard;
