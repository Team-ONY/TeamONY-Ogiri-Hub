import { useState, useEffect } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';
import PropTypes from 'prop-types';

function Layout({ children }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box minH="100vh" overflow="hidden" margin="0" padding="0">
      <Flex position="relative" h="100%">
        {(isDesktop || (!isDesktop && isSidebarOpen)) && (
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        )}

        <Box
          flex="1"
          marginLeft={isDesktop ? '250px' : '0'}
          marginTop="80px"
          width="100%"
          overflowX="hidden"
        >
          <Header isDesktop={isDesktop} toggleSidebar={toggleSidebar} />
          {children}
        </Box>
      </Flex>
    </Box>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
