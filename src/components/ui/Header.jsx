import {
  Box,
  Flex,
  IconButton,
  Text,
  Avatar,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HamburgerIcon, BellIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';

// フレーマーモーションを使用したBox
const MotionBox = motion(Box);

function Header({ isDesktop, toggleSidebar }) {
  const navigate = useNavigate();
  const user = auth.currentUser;

  // レスポンシブなフォントサイズの設定
  const logoFontSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const iconSize = useBreakpointValue({ base: 5, md: 6 });
  const bellIconSize = useBreakpointValue({ base: 6, md: 8 });

  const handleAvatarClick = () => {
    navigate('/profile');
  };
  const handleLogoClick = () => {
    navigate('/home');
  };

  return (
    <Box
      as="header"
      height={{ base: '50px', md: '60px' }}
      width="100%"
      bg="black"
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="1000"
      borderBottom="none"
    >
      {/* アニメーションするグラデーションボーダー */}
      <MotionBox
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        height="2px"
        bgGradient="linear(to-r, pink.400, purple.500)"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <Flex
        h="100%"
        px={{ base: 2, md: 4 }}
        alignItems="center"
        justifyContent="space-between"
        maxWidth="container.xl"
        mx="auto"
      >
        {/* 以下、既存のコード */}
        <Flex alignItems="center">
          {!isDesktop && (
            <IconButton
              icon={<HamburgerIcon boxSize={iconSize} />}
              onClick={toggleSidebar}
              variant="ghost"
              color="pink.400"
              mr={2}
              size={{ base: 'xs', md: 'sm' }}
            />
          )}

          <Text
            onClick={handleLogoClick}
            bgGradient="linear(to-r, pink.400, purple.500)"
            bgClip="text"
            fontSize={logoFontSize}
            fontWeight="bold"
            cursor="pointer"
            whiteSpace="nowrap"
          >
            Ogiri Hub
          </Text>
        </Flex>

        <Flex align="center" gap={{ base: 1, md: 2 }} alignItems="center">
          <IconButton
            icon={<BellIcon boxSize={bellIconSize} color="pink.400" />}
            variant="ghost"
            borderRadius="md"
            border="2px solid transparent"
            _hover={{
              bg: 'whiteAlpha.200',
              color: 'purple.500',
            }}
            size={{ base: 'xs', md: 'sm' }}
            mr={{ base: 1, md: 2 }}
          />
          <Avatar
            size={{ base: 'xs', md: 'sm' }}
            name={user ? user.displayName : 'Anonymous'}
            src={user?.photoURL || 'defaultPhotoURL'}
            onClick={handleAvatarClick}
            cursor="pointer"
          />
        </Flex>
      </Flex>
    </Box>
  );
}

Header.propTypes = {
  isDesktop: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Header;
