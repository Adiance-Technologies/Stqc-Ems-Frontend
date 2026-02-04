// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Box, Grid, Text, theme } from '@chakra-ui/react';
import CustomCard from '../components/CustomCard';
import { FaRegUser } from "react-icons/fa";
import { GiCctvCamera } from "react-icons/gi";
import SessionTimeout from './SessionTimeout';
import { getDashboardData } from '../actions/adminActions';
import { fetchLatestMessage } from '../actions/cameraActions';
import { PiPlugsConnectedFill } from "react-icons/pi";

const Dashboard = () => {

  const [gpus, setGpus] = useState([]); // New state for GPUs
  const [totalCameraCount, setTotalCameraCount] = useState(0);
  const [userCameraCount, setUserCameraCount] = useState(0);
  const [offlineCameraCount, setOfflineCameraCount] = useState(0);
  const [connectedOnce, setConnectedOnce] = useState(0);
  const [todaysConnectedCamera, setTodaysConnectedCamera] = useState(0);
  const getDashboardDat = async () => {
    try {
      const response = await getDashboardData();
      console.log('Dashboard response:', response);
      setConnectedOnce(response.data.connectedOnce);
      setTodaysConnectedCamera(response.data.todaysConnectedCamera);
      setTotalCameraCount(response.data.totalCamera);
      setUserCameraCount(response.data.userCameraCount);
      setOfflineCameraCount(response.data.totalCamera - response.data.userCameraCount);
      // console.log('Dashboard data:', response.data.totalCamera);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  const fetchData = async () => {
    try {
      const response = await fetchLatestMessage();
      console.log('Latest message:', response.data);
      setServerInfo({
        totalRam: response.data.serverInfo.totalRam,
        usedRam: response.data.serverInfo.usedRam,
        ramUsagePercent: parseFloat(response.data.serverInfo.ramUsagePercent),
        freeRamPercent: parseFloat(response.data.serverInfo.freeRamPercent),
        totalStorage: response.data.serverInfo.totalStorage,
        usedStorage: response.data.serverInfo.usedStorage,
        storageUsagePercent: parseFloat(response.data.serverInfo.storageUsagePercent),
        freeStoragePercent: parseFloat(response.data.serverInfo.freeStoragePercent),
        bandwidth: response.data.serverInfo.bandwidth,
        bandwidthUsagePercent: parseFloat(response.data.serverInfo.bandwidthUsagePercent),
        cpuLoadPercent: parseFloat(response.data.serverInfo.cpuLoadPercent),
        connectedClients: response.data.serverInfo.connectedClients,
        os: response.data.serverInfo.os,
      });
    } catch (error) {
      console.error('Error fetching latest message:', error);
    }
  }

  const [serverInfo, setServerInfo] = useState({
    totalRam: 'N/A',
    usedRam: 'N/A',
    ramUsagePercent: 0,
    freeRamPercent: 0,
    totalStorage: 'N/A',
    usedStorage: 'N/A',
    storageUsagePercent: 0,
    freeStoragePercent: 0,
    bandwidth: 'N/A',
    bandwidthUsagePercent: 0,
    cpuLoadPercent: 0,
    connectedClients: 0,
    os: {
      platform: 'N/A',
      distro: 'N/A',
      arch: 'N/A',
      uptime: 'N/A'
    }
  });

  useEffect(() => {

    getDashboardDat();
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000); // Call fetchData every 5 seconds
    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  return (
    <Box p={4}>
      <SessionTimeout timeoutDuration={1800000} />

      <Box padding='1% 2% 0.1%'>
        <Text
          sx={{
            color: "var(--primary-txt, #141E35)",
            fontFamily: "Inter",
            fontSize: "2xl",
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "normal",
            textTransform: "capitalize",
            textAlign: "left",
          }}
        >
          Overall Camera Info
        </Text>
      </Box>
      <Grid
        width='100%'
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        gap={6}
        padding='1% 2% 0.1%'
      >
        <CustomCard
          title="Total Camera"
          value={`${totalCameraCount}`}
          // sanand="55539"
          online={`${serverInfo.connectedClients}`}
          offline={`${totalCameraCount - serverInfo.connectedClients}`}
          color="purple.500"
          bcolor="white"
          IconComponent={GiCctvCamera}
        />
        <CustomCard
          title="Connected Once"
          value={`${connectedOnce}`}
          color="orange.500"
          bcolor="white"
          IconComponent={PiPlugsConnectedFill}
        />
        <CustomCard
          title="User Cameras"
          value={`${userCameraCount}`}
          color="blue.500"
          bcolor="white"
          IconComponent={FaRegUser}
        />
        <CustomCard
          title="Today's Connected"
          value={`${todaysConnectedCamera}`}
          color="yellow.300"
          bcolor="white"
          IconComponent={PiPlugsConnectedFill}
        />
      </Grid>

    </Box>
  );
}

export default Dashboard;
