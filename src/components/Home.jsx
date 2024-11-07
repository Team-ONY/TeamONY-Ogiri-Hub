import { Box, Heading, Text, VStack } from '@chakra-ui/react';

function Home() {
  return (
    <Box
      p={8}
      mt={10}
      borderRadius="xl"
      bg="blackAlpha.400"
      backdropFilter="blur(10px)"
    >
      <VStack spacing={6}>
        <Heading size="xl" color="white" mb={6}>
          ホーム
        </Heading>
        <Text color="white" fontSize="lg">
          ようこそ！こちらはホーム画面です。
        </Text>
      </VStack>
    </Box>
  );
}

export default Home;
