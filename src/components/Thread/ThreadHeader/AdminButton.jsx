// components/thread/ThreadHeader/AdminButton.jsx
import { Icon } from '@chakra-ui/react';
import { FaCrown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Button } from '@chakra-ui/react';
import { PropTypes } from 'prop-types';

const MotionButton = motion(Button);

export const AdminButton = ({ onClick }) => {
  return (
    <MotionButton
      onClick={onClick}
      leftIcon={<Icon as={FaCrown} />}
      bg="linear-gradient(135deg, #FF1988 0%, #FF8C00 100%)"
      color="white"
      size="sm"
      px={6}
      borderRadius="full"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 15px -3px rgba(255, 25, 136, 0.3)',
        bg: 'linear-gradient(135deg, #FF1988 20%, #FF8C00 120%)',
      }}
      _active={{ transform: 'scale(0.95)' }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      管理者ページ
    </MotionButton>
  );
};

AdminButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
