import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { Box, Container, Flex } from '@chakra-ui/react';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Deviceinfo from './pages/Deviceinfo';
import CameraList from './pages/cameraList';
import CameraAnalysis from './pages/CameraAnalysis';
import UserManagement from './pages/userManagement';
import UserManagementEms from './pages/userManagementEms';
import UserCameraList from './pages/UserCameraList';
import OtaPage from './pages/otaPage';
import GptHistory from './pages/gptHistory';
import MasterUid from './pages/masterUid';
import BaseFirmware from './pages/BaseFirmware';

function MainApp() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/forgotpassword' || location.pathname.startsWith('/resetpassword');

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Container maxW="100vw" p="0">
      <Box>
        <Flex direction="column" height="100vh">
          {!isLoginPage && <Header isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />}
          <Flex>
            {!isLoginPage && <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />}
            <Flex p="20px" width="100%">
              <Box
                as="main"
                flex="1"
                position="absolute"
                left={isLoginPage ? '0' : { base: '0', lg: isCollapsed ? '80px' : '280px' }}
                top={isLoginPage ? '0' : '60px'}
                width={
                  isLoginPage
                    ? '100%'
                    : {
                      base: '100%',
                      lg: isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 280px)',
                    }
                }
                transition="left 0.2s, width 0.2s"
                overflowY="auto"
                flexWrap="wrap"
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/login" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgotpassword" element={<ForgotPassword />} />
                  <Route path="/resetpassword/:token" element={<ResetPassword />} />
                  <Route path="/deviceinfo" element={<Deviceinfo />} />
                  <Route path="/cameraAnalysis/:deviceId" element={<CameraAnalysis />} />
                  <Route path="/ota" element={<OtaPage />} />
                  <Route path="/cameraList" element={<CameraList />} />
                  <Route path="/usercameralist" element={<UserCameraList />} />
                  <Route path="/gptHistory" element={<GptHistory />} />
                  <Route path="/userManagement" element={<UserManagement />} />
                  <Route path="/userManagementEms" element={<UserManagementEms />} />
                  <Route path="/basefirmware" element={<BaseFirmware />} />
                  {/* <Route path="/batch" element={<BatchUpload />} /> */}
                  <Route path="/batch" element={<MasterUid />} />
                </Routes>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
