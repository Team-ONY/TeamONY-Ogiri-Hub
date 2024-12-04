import {
  Box,
  VStack,
  Text,
  Flex,
  Avatar,
  useDisclosure,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import CreateThreadModal from '../Thread/CreateThreadModal';
import PropTypes from 'prop-types';

import HomeIcon from '../../Icons/HomeIcon';
import ThreadIcon from '../../Icons/TheadIcon';
import ProfileIcon from '../../Icons/ProfileIcon';
import LogoutIcon from '../../Icons/LogoutIcon';
import PlusIcon from '../../Icons/PlusIcon';

const MotionFlex = motion(Flex);
const MotionBox = motion(Box);

function Sidebar({ isOpen, toggleSidebar }) {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { isOpen: isCreateThreadModalOpen, onOpen, onClose } = useDisclosure();

  const handleNavigation = (path) => {
    if (path === '/logout') {
      logout();
      navigate('/signin');
      toggleSidebar();
    } else if (path === '/create-thread') {
      onOpen();
    } else {
      navigate(path);
      toggleSidebar();
    }
  };

  const isActivePath = (path) => location.pathname === path;

  const menuItems = [
    { path: '/home', label: 'Home', icon: <HomeIcon /> },
    { path: '/thread', label: 'Thread', icon: <ThreadIcon /> },
    {
      path: '/create-thread',
      label: 'Create Thread',
      icon: <PlusIcon />,
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: user ? (
        <Avatar
          size="sm"
          name={user.displayName}
          src={user.photoURL || 'defaultPhotoURL'}
        />
      ) : (
        <ProfileIcon />
      ),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <>
      <MotionBox
        initial={{ x: '-100%' }}
        animate={{ x: isOpen || window.innerWidth >= 768 ? '0%' : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        width="250px"
        height="100vh"
        bg="black"
        position="fixed"
        left="0"
        top={{ base: '50px', md: '60px' }}
        display="flex"
        flexDirection="column"
        zIndex="1000"
        borderRight="1px solid rgba(255, 25, 136, 0.1)"
      >
        <VStack spacing={3} align="stretch" p={4} flexGrow={1}>
          <AnimatePresence>
            {menuItems.map((item, index) => (
              <MotionFlex
                key={item.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 100,
                }}
                onClick={() => handleNavigation(item.path)}
                align="center"
                p={4}
                cursor="pointer"
                bg={
                  isActivePath(item.path)
                    ? 'rgba(255, 182, 193, 0.1)'
                    : 'transparent'
                }
                borderRadius="xl"
                position="relative"
                _hover={{
                  bg: 'rgba(255, 182, 193, 0.15)',
                  transform: 'translateY(-2px)',
                }}
                _active={{
                  transform: 'scale(0.98)',
                }}
                role="group"
              >
                {isActivePath(item.path) && (
                  <Box
                    position="absolute"
                    left={0}
                    top={0}
                    bottom={0}
                    width="3px"
                    bgGradient="linear(to-b, pink.400, purple.500)"
                    borderRadius="full"
                  />
                )}
                <Box
                  p={2}
                  borderRadius="lg"
                  fontSize="xl"
                  mr={3}
                  transition="all 0.2s"
                  _groupHover={{
                    transform: 'scale(1.1) rotate(5deg)',
                  }}
                >
                  {item.icon}
                </Box>
                <Text
                  fontSize="md"
                  fontWeight={isActivePath(item.path) ? 'bold' : 'medium'}
                  color={isActivePath(item.path) ? 'pink.300' : 'white'}
                  letterSpacing="wide"
                  transition="all 0.2s"
                  _groupHover={{
                    color: 'pink.300',
                  }}
                >
                  {item.label}
                </Text>
              </MotionFlex>
            ))}
          </AnimatePresence>
        </VStack>

        <Box position="absolute" bottom="70px" left="0" right="0">
          <MotionFlex
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleLogout}
            align="center"
            p={4}
            m={4}
            cursor="pointer"
            borderRadius="xl"
            bg="rgba(255, 182, 193, 0.05)"
            _hover={{
              bg: 'rgba(255, 182, 193, 0.1)',
              transform: 'translateY(-2px)',
            }}
            _active={{
              transform: 'scale(0.98)',
            }}
            transition="all 0.2s"
            role="group"
            boxShadow="0 -10px 15px -3px rgba(0, 0, 0, 0.1)"
          >
            <Box
              p={2}
              borderRadius="lg"
              fontSize="xl"
              mr={3}
              transition="all 0.2s"
              _groupHover={{
                transform: 'scale(1.1) rotate(-5deg)',
              }}
            >
              <LogoutIcon />
            </Box>
            <Text
              fontSize="md"
              fontWeight="medium"
              bgGradient="linear(to-r, pink.400, purple.500)"
              bgClip="text"
              letterSpacing="wide"
            >
              Logout
            </Text>
          </MotionFlex>
        </Box>
      </MotionBox>

      <CreateThreadModal isOpen={isCreateThreadModalOpen} onClose={onClose} />
    </>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
