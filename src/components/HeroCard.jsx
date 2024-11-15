import { motion } from 'framer-motion';
import { PropTypes } from 'prop-types';
import { Avatar, Text } from '@chakra-ui/react';

const HeroCard = ({ user }) => {
  const cardVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  HeroCard.propTypes = {
    user: PropTypes.object.isRequired,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover="hover"
      variants={cardVariants}
      className="hero-card"
    >
      <Avatar size="2xl" src={user.photoURL || 'defaultPhotoURL'} />
      <Text fontSize="2xl" color="white" fontWeight="bold">
        {user.displayName || 'Anonymous'}
      </Text>
      <Text color="whiteAlpha.700">{user.email}</Text>
    </motion.div>
  );
};

export default HeroCard;
