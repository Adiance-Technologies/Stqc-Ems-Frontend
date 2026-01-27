import {
  Avatar,
  Button,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import { MdAccountCircle } from 'react-icons/md';
import logo from '../images/logi.png';
import { useNavigate } from 'react-router-dom';
import ToggleButton from './ToggleButton';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { logout } from '../actions/userActions';

const Header = ({ isCollapsed, toggleCollapse }) => {
  const fontSize = useBreakpointValue({ base: '0.5rem', md: 'large', lg: 'xx-large' });
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const headerBgColor = useColorModeValue('rgba(255,255,255,0.8)', '#1A202C');

  return (
    <Stack
      pl={4}
      pr={4}
      pt={1}
      pb={1}
      justifyContent="space-between"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'fixed',
        width: { lg: isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 280px)' },
        // width: '100%',
        zIndex: 10,
        backdropFilter: 'blur(6px)',
        backgroundColor: headerBgColor,
        left: { base: '0', lg: isCollapsed ? '80px' : '280px' },
        transition: 'left 0.2s',
        top: '0px',
      }}
    >
      {/* <img width="3%" src={logo} alt="logo" /> */}
      <IconButton
        icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        onClick={toggleCollapse}
        mb={6}
        aria-label="Collapse sidebar"
        sx={{
          bg: 'transparent',
          color: '#9DA4AE',
          _hover: {
            bg: '#2C5282',
            color: 'white',
          },
        }}
      />

      <Heading fontSize={fontSize} display="flex" justifyContent="center" alignItems="center">
        <img width="6%" src={logo} alt="logo" />
        &nbsp; EMS
      </Heading>

      <Stack direction="row" alignItems="center">
        <ToggleButton onClick={toggleCollapse} />
        <Menu>
          <MenuButton
            fontSize={fontSize}
            as={IconButton}
            icon={<MdAccountCircle />}
            aria-label="Profile"
            variant="outline"
          />
          <MenuList p="0" overflow={"hidden"}>
            {/* <MenuItem>
              <Avatar size="sm" mr="2" />
              <Stack spacing="0">
                <Text fontWeight="bold">Purvesh Prajapati</Text>
                <Text fontSize="sm">9427917633</Text>
              </Stack>
            </MenuItem> */}
            <MenuItem color="red" onClick={handleLogout} >
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    </Stack>
    </Stack >
  );
};

export default Header;
