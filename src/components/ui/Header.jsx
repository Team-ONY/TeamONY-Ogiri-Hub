import { useState } from 'react';
import {
  Box,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  VStack,
  Text,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileIcon from '../../Icons/ProfileIcon';
import ThreadIcon from '../../Icons/TheadIcon';
import HomeIcon from '../../Icons/HomeIcon';
import LogoutIcon from '../../Icons/LogoutIcon'; // LogoutIconを正しくインポート

const MotionFlex = motion(Flex);

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    if (path === '/logout') {
      navigate('/signin');
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const menuItems = [
    { path: '/home', label: 'Home', icon: <HomeIcon /> },
    { path: '/thread', label: 'Thread', icon: <ThreadIcon /> },
    { path: '/profile', label: 'Profile', icon: <ProfileIcon /> },
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <Box
      as="header"
      p={0}
      bg="black"
      display="flex"
      justifyContent="flex-end"
      width="100%"
      position="fixed"
      top="0"
      left="0"
      height="80px"
      zIndex="1000"
      borderBottom="1px solid rgba(255, 25, 136, 0.1)"
      borderRadius="lg"
    >
      <IconButton
        icon={<HamburgerIcon boxSize={6} />}
        variant="ghost"
        color="pink.400"
        _hover={{
          bg: 'whiteAlpha.50',
          color: 'pink.300',
        }}
        onClick={toggleDrawer}
        aria-label="Open Menu"
        mt="20px"
        mr="20px"
        transition="all 0.2s"
      />
      <Drawer isOpen={isOpen} placement="left" onClose={toggleDrawer} size="xs">
        <DrawerOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
        <DrawerContent
          bg="black"
          color="white"
          display="flex"
          flexDirection="column"
        >
          <DrawerHeader
            fontSize="2xl"
            fontWeight="bold"
            color="white"
            borderBottomWidth="1px"
            borderBottomColor="whiteAlpha.100"
            textAlign="center"
            py={6}
          >
            <Text
              bgGradient="linear(to-r, pink.400, purple.500)"
              bgClip="text"
              letterSpacing="wider"
            >
              ✨ Ogiri Hub ✨
            </Text>
          </DrawerHeader>
          <DrawerBody p={4} display="flex" flexDirection="column">
            <VStack spacing={3} align="stretch" mt={4}>
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

            <Spacer />

            {/* Logoutアイコンを個別に使用する場合 */}
            <MotionFlex
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => handleNavigation('/logout')}
              align="center"
              p={4}
              mb={6}
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default Header;
