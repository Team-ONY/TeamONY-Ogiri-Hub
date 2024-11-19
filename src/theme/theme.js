import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    ogiri: {
      pink: '#FFA500',
      lightPink: '#FFB347',
      darkPink: '#FF8C00',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'transparent',
      },
    },
  },
  config: {
    initializeAnalytics: 'dark',
    useSystemColorMode: false,
  },
  components: {
    Input: {
      defaultProps: {
        focusBorderColor: 'pink.500',
      },
    },
  },
});
