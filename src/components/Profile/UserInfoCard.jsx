import { Link } from 'react-router-dom';
import { Box, VStack, Text, IconButton, Avatar } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiPencil } from 'react-icons/hi';
import { PropTypes } from 'prop-types';

const MotionBox = motion(Box);

const UserInfoCard = ({ user }) => (
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
      as={Link}
      to="/profile-edit"
      icon={<HiPencil />}
      position="absolute"
      top={4}
      right={4}
      colorScheme="purple"
      variant="ghost"
      borderRadius="full"
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
      <Text color="whiteAlpha.600">@{user?.email?.substr(0 , user?.email?.indexOf('@'))}</Text>
    </VStack>
  </MotionBox>
);

UserInfoCard.propTypes = {
  user: PropTypes.object.isRequired,
};

export default UserInfoCard;
