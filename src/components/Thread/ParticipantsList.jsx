import { Box, VStack, Text, Avatar, Flex, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { IoSparklesSharp } from 'react-icons/io5';
import { FaCrown } from 'react-icons/fa';
import PropTypes from 'prop-types';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export const ParticipantsList = ({ participants, threadCreatorId }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      position="relative"
      minW="350px"
    >
      {/* 装飾的な背景要素 */}
      <Box
        position="absolute"
        top="-30px"
        right="-30px"
        width="200px"
        height="200px"
        bgGradient="radial(circle at center, purple.500 0%, transparent 70%)"
        opacity="0.15"
        borderRadius="full"
        filter="blur(20px)"
      />

      <Box
        bg="rgba(0, 0, 0, 0.7)"
        backdropFilter="blur(20px)"
        borderRadius="24px"
        border="1px solid"
        borderColor="whiteAlpha.200"
        overflow="hidden"
        position="relative"
      >
        {/* グラデーションアクセント */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="2px"
          bgGradient="linear(to-r, pink.400, purple.500)"
        />

        <VStack spacing={6} p={6}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            bgGradient="linear(to-r, pink.400, purple.400)"
            bgClip="text"
          >
            Participants
          </Text>

          <VStack spacing={4} width="100%" align="stretch">
            {participants?.map((participant, index) => (
              <MotionFlex
                key={`${participant.uid}-${index}`}
                align="center"
                justify="space-between"
                bg="whiteAlpha.50"
                p={3}
                borderRadius="xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Flex align="center" gap={3}>
                  <Box position="relative">
                    <Avatar
                      name={participant.displayName}
                      src={participant.photoURL}
                      size="md"
                      border="2px solid"
                      borderColor={
                        participant.uid === threadCreatorId
                          ? 'pink.400'
                          : 'transparent'
                      }
                    />
                    {participant.uid === threadCreatorId && (
                      <Icon
                        as={FaCrown}
                        position="absolute"
                        bottom="-2"
                        right="-2"
                        color="pink.400"
                        w={4}
                        h={4}
                      />
                    )}
                  </Box>
                  <Text color="white" fontSize="sm" fontWeight="medium">
                    {participant.displayName}
                  </Text>
                </Flex>

                <Icon
                  as={IoSparklesSharp}
                  color="pink.400"
                  opacity={0.6}
                  w={4}
                  h={4}
                />
              </MotionFlex>
            ))}
          </VStack>
        </VStack>
      </Box>
    </MotionBox>
  );
};

ParticipantsList.propTypes = {
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      uid: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      photoURL: PropTypes.string,
    })
  ).isRequired,
  threadCreatorId: PropTypes.string.isRequired,
};
