import { Box, Grid, VStack, Text, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  ChatBubbleBottomCenterTextIcon,
  StarIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { PropTypes } from 'prop-types';

const MotionBox = motion(Box);

const StatItem = ({ icon, value, label }) => (
  <VStack
    spacing={2}
    p={4}
    bg="rgba(255, 255, 255, 0.02)"
    borderRadius="lg"
    _hover={{
      bg: 'rgba(255, 255, 255, 0.05)',
      transform: 'translateY(-2px)',
      transition: 'all 0.2s',
    }}
  >
    <Icon
      as={icon}
      boxSize={6}
      color="purple.400"
      _hover={{ color: 'pink.400' }}
      transition="color 0.2s"
    />
    <Text color="white" fontSize="2xl" fontWeight="bold">
      {value}
    </Text>
    <Text color="whiteAlpha.600" fontSize="sm">
      {label}
    </Text>
  </VStack>
);

StatItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

const StatCard = ({ stats }) => (
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
  >
    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
      <StatItem
        icon={ChatBubbleBottomCenterTextIcon}
        value={stats.totalPosts}
        label="投稿数"
      />
      <StatItem
        icon={StarIcon}
        value={stats.totalHallOfFame}
        label="殿堂入り"
      />
      <StatItem icon={FireIcon} value={stats.streak} label="連続投稿" />
    </Grid>
  </MotionBox>
);

StatCard.propTypes = {
  stats: PropTypes.object.isRequired,
};
export default StatCard;
