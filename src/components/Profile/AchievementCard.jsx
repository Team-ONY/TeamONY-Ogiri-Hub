import { Box, Grid, HStack, Text, Icon, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { TrophyIcon } from '@heroicons/react/24/outline';

import { PropTypes } from 'prop-types';

const MotionBox = motion(Box);

const AchievementBadge = ({ icon: IconComponent, name }) => (
  <VStack
    p={4}
    spacing={2}
    bg="rgba(255, 255, 255, 0.05)"
    borderRadius="lg"
    _hover={{
      transform: 'scale(1.05)',
      transition: 'transform 0.2s',
    }}
  >
    <Icon as={IconComponent} boxSize={6} color="purple.400" />
    <Text color="white" fontSize="sm" textAlign="center">
      {name}
    </Text>
  </VStack>
);

AchievementBadge.propTypes = {
  icon: PropTypes.elementType.isRequired,
  name: PropTypes.string.isRequired,
};

const AchievementCard = ({ achievements }) => (
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
    <HStack mb={4}>
      <Icon as={TrophyIcon} color="purple.400" boxSize={6} />
      <Text color="white" fontSize="xl" fontWeight="bold">
        アチーブメント
      </Text>
    </HStack>
    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          icon={achievement.icon}
          name={achievement.name}
        />
      ))}
    </Grid>
  </MotionBox>
);

AchievementCard.propTypes = {
  achievements: PropTypes.array.isRequired,
};

export default AchievementCard;
