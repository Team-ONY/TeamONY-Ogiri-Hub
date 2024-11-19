import { createContext, useState } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  CloseButton,
  SlideFade,
  Box,
  Flex,
} from '@chakra-ui/react';
import { PropTypes } from 'prop-types';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    status: 'error',
  });

  const showAlert = (message, status = 'error') => {
    setAlert({ isOpen: true, message, status });
    setTimeout(() => {
      closeAlert();
    }, 3000);
  };

  const closeAlert = () => {
    setAlert({ isOpen: false, message: '', status: 'error' });
  };

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert, alert }}>
      {children}
      <SlideFade in={alert.isOpen} offsetY="20px">
        {alert.isOpen && (
          <Box
            position="fixed"
            bottom="20px"
            left="50%"
            transform="translateX(-50%)"
            zIndex={9999}
            width="100%"
            maxWidth="400px"
            px={4}
          >
            <Alert
              status={alert.status}
              variant="subtle"
              borderRadius="xl"
              boxShadow="2xl"
              py={4}
              px={6}
              bgGradient="linear(to-r, purple.500, pink.500)"
              color="white"
              _hover={{
                bgGradient: 'linear(to-r, purple.600, pink.600)',
              }}
            >
              <Flex
                width="100%"
                alignItems="center"
                justifyContent="space-between"
              >
                <Flex alignItems="center">
                  <AlertIcon color="white" mr={3} />
                  <AlertTitle fontSize="md" fontWeight="bold">
                    {alert.message}
                  </AlertTitle>
                </Flex>
                <CloseButton
                  onClick={closeAlert}
                  color="white"
                  ml={8}
                  _hover={{
                    bg: 'whiteAlpha.300',
                  }}
                />
              </Flex>
            </Alert>
          </Box>
        )}
      </SlideFade>
    </AlertContext.Provider>
  );
};

AlertProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
