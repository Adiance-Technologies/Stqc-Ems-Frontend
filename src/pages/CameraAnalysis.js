// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Input,
    Switch,
    FormLabel,
    FormControl,
    Grid,
    Heading,
    Select,
    Textarea,
    Checkbox,
    Button,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Text,
    theme
} from '@chakra-ui/react';
import CustomCard from '../components/CustomCard';
import { BsCurrencyDollar } from 'react-icons/bs';
import PieChartComponent from '../components/PieChartComponent';
import BarChartComponent from '../components/BarChartComponent';
import { useNavigate, useParams } from 'react-router-dom';
import { addCamera, getDeviceInfo, getImageInfo, getNetInfo, getNetworkInterfaceSettings, getTimeSettings, getVideoEncodeChannelMain, getVideoEncodeChannelSub, getVideoSettings, setImageInfo, setVideoEncodeChannelMain, setVideoSettings } from '../actions/cameraActions';
import SessionTimeout from './SessionTimeout';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LineChartComponent from '../components/LineChartComponent';
import { getHealth } from '../actions/healthActions';

const CameraAnalysis = () => {

    const { deviceId } = useParams()
    const [healthData, setHealthData] = useState([]);

    const barChartOptions = {
        chart: {
            type: 'bar',
            height: '100%',
            background: 'transparent',
            stacked: false,
            // toolbar: {
            //   show: false
            // }
        },
        colors: [theme.colors.blue[500], theme.colors.green[500]],

        // title is sent separately...

        // title: {
        //   text: 'Monthly Sales Data Comparison',
        //   align: 'left',
        // },
        fill: {
            opacity: 1,
            type: 'solid'
        },
        grid: {
            strokeDashArray: 1,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        xaxis: {
            categories: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        },
        legend: {
            position: 'top',
        },
        dataLabels: {
            enabled: false,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '30px',
            },
        }
    };
    const barChartTitle = 'Monthly Sales Data Comparison';
    const barChartSeries = [
        {
            name: 'Sales 2023',
            data: [65, 59, 80, 81, 56, 55, 65],
        }
        // ,
        // {
        //   name: 'Sales 2024',
        //   data: [75, 69, 70, 91, 66, 65],
        // },
    ];

    // Second line chart
    const lineChartOptions2 = {
        chart: {
            type: 'line',
            height: '100%',
            background: 'transparent',
            stacked: false,
            toolbar: {
                show: true,
                tools: {
                    download: true,  // Include download option
                    zoom: false,     // Disable zoom
                    pan: false,      // Disable pan
                }
            },
            zoom: {
                enabled: false
            },
        },
        colors: [theme.colors.blue[500], theme.colors.green[500], theme.colors.orange[500]],
        fill: {
            opacity: 1,
            type: 'solid'
        },
        grid: {
            strokeDashArray: 1,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        xaxis: {
            categories: healthData?.outBandWidthAvg?.map(item => item.time) ?? [],
        },
        legend: {
            position: 'top',
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        markers: {
            size: 5,
            colors: ['#fff'],
            strokeWidth: 2,
        },
        yaxis: {
            min: -100,  // Set minimum value for y-axis
            max: 100, // Set maximum value for y-axis (adjust as needed)
            title: {
                text: 'Sales',
            },
        },
    };

    // Line chart data (series)
    // Find the maximum length of the available data arrays
    const maxDataLength = Math.max(
        healthData?.signalAvg?.length || 0,
        healthData?.outBandWidthAvg?.length || 0,
        healthData?.hourlyTemperature_C?.length || 0
    );

    // Function to normalize data to the maximum length, filling with 0
    const normalizeData = (dataArray) =>
        Array.from({ length: maxDataLength }, (_, index) =>
            dataArray?.[index]?.value ?? 0
        );

    console.log("healthData", healthData);

    // Prepare the line chart series with normalized data
    const lineChartSeries2 = [
        {
            name: 'Signal',
            data: normalizeData(healthData?.signalAvg),
        },
        {
            name: 'Bandwidth',
            data: normalizeData(healthData?.outBandWidthAvg),
        },
        {
            name: 'Temperature',
            data: normalizeData(healthData?.hourlyTemperature_C),
        }
    ];



    /////////////////// First LINE CHART //////////////////// Second is above

    const lineChartOptions = {
        chart: {
            type: 'line',
            height: '100%',
            background: 'transparent',
            stacked: false,
            toolbar: {
                show: true,
                tools: {
                    download: true,  // Include download option
                    zoom: false,     // Disable zoom
                    pan: false,      // Disable pan
                }
            },
            zoom: {
                enabled: false
            },
        },
        colors: [theme.colors.blue[500], theme.colors.green[500]],
        fill: {
            opacity: 1,
            type: 'solid'
        },
        grid: {
            strokeDashArray: 1,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        xaxis: {
            categories: healthData?.hourlyCPU?.map(item => item.time) ?? [],
        },
        legend: {
            position: 'top',
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        markers: {
            size: 5,
            colors: ['#fff'],
            strokeWidth: 2,
        },
        yaxis: {
            min: 0,  // Set minimum value for y-axis
            max: 100, // Set maximum value for y-axis (adjust as needed)
            title: {
                text: 'Sales',
            },
        },
    };

    // Line chart data (series)
    const lineChartSeries = [
        {
            name: 'Storage',
            data: healthData?.hourlySD_Card?.map(item => item.value) ?? [],
        },
        {
            name: 'CPU Usage',
            data: healthData?.hourlyCPU?.map(item => item.value) ?? [],
        }
    ];

    //////////////////// THIRD LINE CHART ////////////////////

    const lineChartOptions3 = {
        chart: {
            type: 'line',
            height: '100%',
            background: 'transparent',
            stacked: false,
            toolbar: {
                show: true,
                tools: {
                    download: true,  // Include download option
                    zoom: false,     // Disable zoom
                    pan: false,      // Disable pan
                }
            },
            zoom: {
                enabled: false
            },
        },
        colors: [theme.colors.blue[500], theme.colors.green[500]],
        fill: {
            opacity: 1,
            type: 'solid'
        },
        grid: {
            strokeDashArray: 1,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        xaxis: {
            categories: healthData?.p2pStatus?.map(item => item.time) ?? [],
        },
        legend: {
            position: 'top',
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        markers: {
            size: 5,
            colors: ['#fff'],
            strokeWidth: 2,
        },
        yaxis: {
            min: 0,  // Set minimum value for y-axis
            max: 1, // Set maximum value for y-axis (adjust as needed)
            title: {
                text: 'Sales',
            },
        },
    };

    // Line chart data (series)
    // const lineChartSeries3 = [
    //     // {
    //     //     name: 'Storage',
    //     //     data: healthData.p2pStatus ? healthData.p2pStatus.map(item => item.value) : [],
    //     // },
    //     {
    //         name: 'P2P Status',
    //         data: healthData.p2pStatus
    //             ? healthData.p2pStatus.map(item => item.value === 'online' ? 1 : 0)
    //             : [],

    //     }
    // ];
    const lineChartSeries3 = [
        {
            name: 'P2P Status',
            data: healthData?.p2pStatus?.map(item => item.value === 'online' ? 1 : 0) ?? [],
        }
    ];

    const fetchData = async () => {
        try {
            const response = await getHealth(deviceId);
            console.log("Server Info:", response);
            setHealthData(response.data);
        } catch (error) {
            console.error("Error fetching server info:", error);
        }
    };

    // const [cpuUsageValue, setCpuUsageValue] = useState('');
    // const cpuUsage = async () => {
    //     try {
    //         // console.log("CPU value:", healthData);
    //         healthData.CPU.map((item) => {
    //             setCpuUsageValue(item.value);
    //             console.log("CPU value:", item.value);
    //         });

    //     } catch (error) {
    //         console.error("Error fetching server info:", error);
    //     }
    // };

    useEffect(() => {
        fetchData();
        // cpuUsage();
    }, [deviceId]);

    return (
        <Box p={8}>
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
                height="100%"
            >
                {/* <Box height="100%" display="flex" flexDirection="column">
                    <Box flex="1">
                        <BarChartComponent
                            options={barChartOptions}
                            series={barChartSeries}
                            title={barChartTitle}
                        />
                    </Box>
                </Box> */}
                <Box height="100%" display="flex" flexDirection="column">
                    <Box flex="1">
                        {lineChartSeries.some(series => series.data.length > 0) ? (
                            <LineChartComponent
                                options={lineChartOptions}
                                series={lineChartSeries}
                                title="CPU & Storage Usage"
                            />
                        ) : (
                            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                <span>No data available of CPU & Storage Usage</span>
                            </Box>
                        )}
                    </Box>
                </Box>
                <Box height="100%" display="flex" flexDirection="column">
                    <Box flex="1">
                        {lineChartSeries2.some(series => series.data.some(value => value !== 0)) ? (
                            <LineChartComponent
                                options={lineChartOptions2}
                                series={lineChartSeries2}
                                title="Signal, Bandwidth & Temperature"
                            />
                        ) : (
                            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                <span>No data available of Signal, Bandwidth & Temperature</span>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Grid>
            <Grid
                width="100%"
                gap={6}
                padding="2% 2%"
                height="100%"
            >
                <Box height="100%" display="flex" flexDirection="column">
                    <Box flex="1">
                        <LineChartComponent
                            options={lineChartOptions3}
                            series={lineChartSeries3}
                            title="P2P STATUS"
                        />
                    </Box>
                </Box>
            </Grid>

        </Box>
    );
}

export default CameraAnalysis;
