import React from 'react';
import { Box, VStack, Button, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, IconButton, HStack, Flex, Image, Heading } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link, useLocation } from 'react-router-dom';
import { RiDashboardFill, RiLiveLine } from "react-icons/ri";
import { BsRecordCircle } from 'react-icons/bs';
import logo from '../images/ArcisAi.png';
import logi from '../images/logi.png';

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const role = localStorage.getItem('userRole') || [];

  return (
    <>
      {/* Sidebar for larger screens */}

      <Box
        display={{ base: 'none', lg: 'flex' }}
        flexDirection="column"
        width={isCollapsed ? "80px" : "280px"}
        background='#1C2536'
        height="100vh"
        boxShadow="md"
        transition="width 0.2s"
        position="fixed"
        top="0"
        left="0"
        zIndex={99999}
      >
        <Box flexShrink={0}>
          {!isCollapsed ?
            <Image m={'1.5rem'} src={logo} alt="Logo" width="60%" />
            : <Image m={'auto'} my={5} src={logi} alt="Logo" width="60%" />
          }
          <hr />
        </Box>
        <Box
          padding="1rem"
          flex="1"
          overflowY="auto"
          css={{
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#4A5568",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#718096",
            },
          }}
        >
          <VStack spacing={4} align="stretch">
            {role.includes("admin") && <>
              <Link to="/dashboard" style={{ textDecoration: 'none', width: '100%' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/dashboard') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <RiDashboardFill color={isActive('/dashboard') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>Dashboard</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/cameraList" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/cameraList') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/cameraList') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/cameraList') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>Camera List</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/deviceinfo" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/deviceinfo') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/deviceinfo') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/deviceinfo') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>Device Info</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/usercameralist" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/usercameralist') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/usercameralist') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/usercameralist') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>Camera List (User)</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/userManagement" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/userManagement') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/userManagement') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/userManagement') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>VMS User Management</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/userManagementEms" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/userManagementEms') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/userManagementEms') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/userManagementEms') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>EMS User Management</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/ota" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/ota') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/ota') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/ota') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>OTA</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/basefirmware" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/basefirmware') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/basefirmware') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/basefirmware') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>BFW Releases</span>}
                  </HStack>
                </Button>
              </Link>
            </>
            }

          </VStack>
        </Box>
      </Box>

      {/* Hamburger icon for mobile view */}
      <IconButton
        ref={btnRef}
        icon={<HamburgerIcon />}
        display={{ base: 'block', lg: 'none' }}
        onClick={onOpen}
        position="fixed"
        top="1rem"
        left="1rem"
        zIndex={11}
      />

      {/* Drawer for mobile view */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <Button colorScheme="teal" variant="ghost" onClick={onClose} fontSize="sm">
                  Dashboard
                </Button>
              </Link>
              <Link to="/deviceinfo" style={{ textDecoration: 'none' }}>
                <Button colorScheme="teal" variant="ghost" onClick={onClose} fontSize="sm">
                  Deviceinfo
                </Button>
              </Link>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default Sidebar;
