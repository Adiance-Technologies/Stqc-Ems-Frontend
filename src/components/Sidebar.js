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
        background='#FFFFFF'
        borderRight='1px solid #D6DBE5'
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
                  bg={isActive('/dashboard') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/dashboard') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <RiDashboardFill color={isActive('/dashboard') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>Dashboard</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/cameraList" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/cameraList') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/cameraList') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/cameraList') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>Camera List</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/deviceinfo" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/deviceinfo') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/deviceinfo') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/deviceinfo') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>Device Info</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/usercameralist" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/usercameralist') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/usercameralist') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/usercameralist') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>Camera List (User)</span>}
                  </HStack>
                </Button>
              </Link>

              {/* <Link to="/userManagement" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/userManagement') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/userManagement') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/userManagement') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>VMS User Management</span>}
                  </HStack>
                </Button>
              </Link> */}

              <Link to="/userManagementEms" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/userManagementEms') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/userManagementEms') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/userManagementEms') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>EMS User Management</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/ota" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/ota') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/ota') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/ota') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>OTA</span>}
                  </HStack>
                </Button>
              </Link>

              {/* Provisioning / Devices / Certificates — folded back in from MPS */}
              <Link to="/provisioning" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/provisioning') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/provisioning') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/provisioning') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>Provisioning</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/devices" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/devices') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/devices') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/devices') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>Devices</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/certificates" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/certificates') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/certificates') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/certificates') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>Certificates</span>}
                  </HStack>
                </Button>
              </Link>

              <Link to="/qc-reports" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/qc-reports') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/qc-reports') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/qc-reports') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>QC Reports</span>}
                  </HStack>
                </Button>
              </Link>

              {/* <Link to="/basefirmware" style={{ textDecoration: 'none' }}>
                <Button
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/basefirmware') ? '#EEF2FF' : 'transparent'}
                  color={isActive('/basefirmware') ? '#4338CA' : '#3C4759'}
                  fontSize="sm"
                  _hover={{ bg: '#EEF1F7', color: '#0B0F19' }}
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/basefirmware') ? '#4F46E5' : '#6B7280'} />
                    {!isCollapsed && <span>BFW Releases</span>}
                  </HStack>
                </Button>
              </Link> */}
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
