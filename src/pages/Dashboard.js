// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Box, Grid, Text, theme } from '@chakra-ui/react';
import CustomCard from '../components/CustomCard';
import { BsCurrencyDollar } from 'react-icons/bs';
import { FaRegUser } from "react-icons/fa";
import { GiCctvCamera } from "react-icons/gi";
import PieChartComponent from '../components/PieChartComponent';
// import mqtt from 'mqtt';
import { fetchLatestMessage } from '../actions/cameraActions';
import SessionTimeout from './SessionTimeout';
import { getDashboardData } from '../actions/adminActions';
import { MdOutlineSdStorage } from "react-icons/md";
import { GrStorage } from "react-icons/gr";
import { VscRadioTower } from "react-icons/vsc";
import { PiNetwork } from "react-icons/pi";
import { PiPlugsConnectedFill } from "react-icons/pi";

const Dashboard = () => {
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

  const [mediaserverInfo, setMediaServerInfo] = useState({
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

  const [appserverInfo, setAppServerInfo] = useState({
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

  const [gpus, setGpus] = useState([]); // New state for GPUs
  const [totalCameraCount, setTotalCameraCount] = useState(0);
  const [userCameraCount, setUserCameraCount] = useState(0);
  const [offlineCameraCount, setOfflineCameraCount] = useState(0);
  const [connectedOnce, setConnectedOnce] = useState(0);
  const [todaysConnectedCamera, setTodaysConnectedCamera] = useState(0);
  const getDashboardDat = async () => {
    try {
      const response = await getDashboardData();
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

  useEffect(() => {
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

        setMediaServerInfo({
          totalRam: response.data.mediaServerInfo.totalRam,
          usedRam: response.data.mediaServerInfo.usedRam,
          ramUsagePercent: parseFloat(response.data.mediaServerInfo.ramUsagePercent),
          freeRamPercent: parseFloat(response.data.mediaServerInfo.freeRamPercent),
          totalStorage: response.data.mediaServerInfo.totalStorage,
          usedStorage: response.data.mediaServerInfo.usedStorage,
          storageUsagePercent: parseFloat(response.data.mediaServerInfo.storageUsagePercent),
          freeStoragePercent: parseFloat(response.data.mediaServerInfo.freeStoragePercent),
          bandwidth: response.data.mediaServerInfo.bandwidth,
          bandwidthUsagePercent: parseFloat(response.data.mediaServerInfo.bandwidthUsagePercent),
          cpuLoadPercent: parseFloat(response.data.mediaServerInfo.cpuLoadPercent),
          connectedClients: response.data.mediaServerInfo.connectedClients,
          os: response.data.mediaServerInfo.os,
        });

        setAppServerInfo({
          totalRam: response.data.etaarcis.totalRam,
          usedRam: response.data.etaarcis.usedRam,
          ramUsagePercent: parseFloat(response.data.etaarcis.ramUsagePercent),
          freeRamPercent: parseFloat(response.data.etaarcis.freeRamPercent),
          totalStorage: response.data.etaarcis.totalStorage,
          usedStorage: response.data.etaarcis.usedStorage,
          storageUsagePercent: parseFloat(response.data.etaarcis.storageUsagePercent),
          freeStoragePercent: parseFloat(response.data.etaarcis.freeStoragePercent),
          bandwidth: response.data.etaarcis.bandwidth,
          bandwidthUsagePercent: parseFloat(response.data.etaarcis.bandwidthUsagePercent),
          cpuLoadPercent: parseFloat(response.data.etaarcis.cpuLoadPercent),
          connectedClients: response.data.etaarcis.connectedClients,
          os: response.data.etaarcis.os,
        });

        // console.log("GPUs:", response.data);
        setGpus(response.data.mediaServerInfo.gpus); // Assuming the first item has the gpus
      } catch (error) {
        console.error("Error fetching server info:", error);
      }
    };

    getDashboardDat();
    fetchData(); // Fetch data immediately on mount

    const intervalId = setInterval(() => {
      fetchData();
    }, 5000); // Call fetchData every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  const pieChartCpu = {
    chart: {
      type: 'pie',
      height: '100%',
    },
    colors: [theme.colors.purple[500], theme.colors.blue[500]],
    labels: ['free', 'used'],
    title: {
      text: 'Provisioning CPU Usage',
      align: 'left',
    },
    legend: {
      position: 'top',
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false
      }
    },
    tooltip: {
      fillSeriesColor: false
    },
    states: {
      active: {
        filter: {
          type: 'none'
        }
      },
      hover: {
        filter: {
          type: 'none'
        }
      }
    },
  };

  const pieChartSeriesCpu = [100 - serverInfo.cpuLoadPercent, serverInfo.cpuLoadPercent];

  const pieChartRam = {
    chart: {
      type: 'pie',
      height: '100%',
    },
    colors: [theme.colors.purple[500], theme.colors.blue[500]],
    labels: ['free', 'used'],
    title: {
      text: 'Provisioning Ram Usage',
      align: 'left',
    },
    legend: {
      position: 'top',
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false
      }
    },
    tooltip: {
      fillSeriesColor: false
    },
    states: {
      active: {
        filter: {
          type: 'none'
        }
      },
      hover: {
        filter: {
          type: 'none'
        }
      }
    },
  };

  const pieChartSeriesRam = [serverInfo.freeRamPercent, serverInfo.ramUsagePercent];

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
        {/* <CustomCard
          title="Online Cameras"
          value={`${serverInfo.connectedClients}`}
          color="green.500"
          bcolor="white"
          IconComponent={GiCctvCamera}
        />
        <CustomCard
          title="Offline Cameras"
          value={`${totalCameraCount - serverInfo.connectedClients}`}
          color="red.500"
          bcolor="white"
          IconComponent={GiCctvCamera}
        /> */}
        <CustomCard
          title="Today's Connected"
          value={`${todaysConnectedCamera}`}
          color="yellow.300"
          bcolor="white"
          IconComponent={PiPlugsConnectedFill}
        />
      </Grid>


      {/* Provisioning Server */}
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
          Provisioning Server
        </Text>
      </Box>
      <Grid
        width='100%'
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        gap={6}
        padding='1% 2% 0.1%'
      >
        <CustomCard
          title="Ram Usage"
          value={`${serverInfo.usedRam}/${serverInfo.totalRam}`}
          // sanand="55539"
          color="blue.500"
          bcolor="white"
          IconComponent={MdOutlineSdStorage}
        />
        <CustomCard
          title="Storage Usage"
          value={`${serverInfo.usedStorage}/${serverInfo.totalStorage}`}
          color="green.500"
          bcolor="white"
          IconComponent={GrStorage}
        />
        <CustomCard
          title="Network Bedwidth"
          value={`${serverInfo.bandwidth}`}
          color="orange.500"
          bcolor="white"
          IconComponent={VscRadioTower}
        />
        <CustomCard
          title="Connected Devices"
          value={`${serverInfo.connectedClients}`}
          color="purple.500"
          bcolor="white"
          IconComponent={PiNetwork}
        />
      </Grid>

      {/* App server */}
      <Box padding='1.5% 2% 0.1%'>
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
          App Server
        </Text>
      </Box>
      <Grid
        width='100%'
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        gap={6}
        padding='1% 2% 0.1%'
      >
        <CustomCard
          title="Ram Usage"
          value={`${appserverInfo.usedRam}/${appserverInfo.totalRam}`}
          // sanand="55539"
          // color="blue.500"
          bcolor="white"
        // IconComponent={BsCurrencyDollar}
        />
        <CustomCard
          title="Storage Usage"
          value={`${appserverInfo.usedStorage}/${appserverInfo.totalStorage}`}
          // color="green.500"
          bcolor="white"
        // IconComponent={BsCurrencyDollar}
        />
        <CustomCard
          title="Network Bedwidth"
          value={`${appserverInfo.bandwidth}`}
          // color="orange.500"
          bcolor="white"
        // IconComponent={BsCurrencyDollar}
        />
        <CustomCard
          title="CPU Usage"
          value={`${appserverInfo.cpuLoadPercent} %`}
          // color="purple.500"
          bcolor="white"
        // IconComponent={BsCurrencyDollar}
        />
      </Grid>

      {/* media server */}
      <Box padding='1.5% 2% 0.1%'>
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
          Media Server
        </Text>
      </Box>
      <Grid
        width='100%'
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        gap={6}
        padding='1% 2% 0.1%'
      >
        <CustomCard
          title="Ram Usage"
          value={`${mediaserverInfo.usedRam}/${mediaserverInfo.totalRam}`}
          // sanand="55539"
          color="blue.500"
          bcolor="white"
          IconComponent={BsCurrencyDollar}
        />
        <CustomCard
          title="Storage Usage"
          value={`${mediaserverInfo.usedStorage}/${mediaserverInfo.totalStorage}`}
          color="green.500"
          bcolor="white"
          IconComponent={BsCurrencyDollar}
        />
        <CustomCard
          title="Network Bedwidth"
          value={`${mediaserverInfo.bandwidth}`}
          color="orange.500"
          bcolor="white"
          IconComponent={BsCurrencyDollar}
        />
        <CustomCard
          title="CPU Usage"
          value={`${mediaserverInfo.cpuLoadPercent} %`}
          color="purple.500"
          bcolor="white"
          IconComponent={BsCurrencyDollar}
        />
        {gpus?.slice(1).map((gpu) => (
          <CustomCard
            key={gpu.id}  // unique key is still needed
            title={gpu.name}
            value={`${gpu.memoryUsagePercent} %`}
            sanand={`${gpu.temperature} °C`}
            bcolor="white"
          />
        ))}
      </Grid>


      <Grid
        width="100%"
        templateColumns={{
          base: "repeat(1, 1fr)",
          xl: "2fr 2fr",
          lg: "2fr 2fr",
          md: "1fr 1fr",
          sm: "1fr 1fr",
        }}
        gap={6}
        padding="2% 2%"
        height="500px"
      >
        <Box height="100%" display="flex" flexDirection="column">
          <Box flex="1">
            <PieChartComponent
              options={pieChartCpu}
              series={pieChartSeriesCpu}
            />
          </Box>
        </Box>
        <Box height="100%" display="flex" flexDirection="column">
          <Box flex="1">
            <PieChartComponent
              options={pieChartRam}
              series={pieChartSeriesRam}
            />
          </Box>
        </Box>
      </Grid>

    </Box>
  );
}

export default Dashboard;
