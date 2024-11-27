// src/components/Thread/CreateOogiriButton.jsx
import { IconButton } from '@chakra-ui/react';
import LaughIcon from '../../../Icons/LaughIcon';
import { useNavigate } from 'react-router-dom';

const CreateOgiriButton = () => {
  const navigate = useNavigate();

  const handleCreateOogiriEvent = () => {
    navigate('/create-oogiri');
  };

  return (
    <IconButton
      icon={<LaughIcon />}
      position="fixed"
      bottom="20px"
      right="20px"
      boxSize="78px"
      bgGradient="linear(to-r, pink.400, purple.400)"
      color="white"
      borderRadius="full"
      shadow="md"
      _hover={{
        bgGradient: 'linear(to-r, pink.500, purple.500)',
        transform: 'scale(1.05)',
      }}
      onClick={handleCreateOogiriEvent}
      zIndex="10"
    />
  );
};

export default CreateOgiriButton;
