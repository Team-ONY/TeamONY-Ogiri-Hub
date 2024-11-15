import { Box, HStack, Text, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiOutlineStar } from 'react-icons/hi';
import { PropTypes } from 'prop-types';

const MotionBox = motion(Box);

const HallOfFameCard = ({ post }) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    mb={6}
    bg="rgba(255, 255, 255, 0.05)"
    borderRadius="xl"
    p={6}
    backdropFilter="blur(10px)"
    boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
    border="1px solid rgba(255, 255, 255, 0.1)"
    _hover={{
      transform: 'translateY(-5px)',
      transition: 'transform 0.2s',
    }}
  >
    <HStack mb={4}>
      <Icon as={HiOutlineStar} color="yellow.400" boxSize={6} />
      <Text color="white" fontSize="lg" fontWeight="bold">
        殿堂入り投稿
      </Text>
    </HStack>
    <Text color="whiteAlpha.800" fontSize="md">
      {post.content}
    </Text>
    <HStack mt={4} justify="space-between">
      <Text color="whiteAlpha.600" fontSize="sm">
        {new Date(post.createdAt?.toDate()).toLocaleDateString()}
      </Text>
      <HStack>
        <Icon as={HiOutlineStar} color="yellow.400" />
        <Text color="whiteAlpha.800">{post.likes}</Text>
      </HStack>
    </HStack>
  </MotionBox>
);

HallOfFameCard.propTypes = {
  post: PropTypes.object.isRequired,
};

export default HallOfFameCard;
