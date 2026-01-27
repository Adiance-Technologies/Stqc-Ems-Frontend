// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
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
    useBreakpointValue,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
    HStack
} from '@chakra-ui/react';
import CustomCard from '../components/CustomCard';
import { BsCurrencyDollar } from 'react-icons/bs';
import PieChartComponent from '../components/PieChartComponent';
import { useNavigate } from 'react-router-dom';
import { addCamera, addMultipleCamera, get_videoSettings, getDeviceInfo, getImageInfo, getNetInfo, getNetworkInterfaceSettings, getTimeSettings, getVideoEncodeChannelMain, getVideoEncodeChannelSub, getVideoSettings, handleGetConfig, setImageInfo, setVideoEncodeChannelMain, setVideoSettings } from '../actions/cameraActions';
import SessionTimeout from './SessionTimeout';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const Deviceinfo = () => {
    const [subscribedTo, setSubscribedTo] = useState('');
    const [status, setStatus] = useState('');
    const [rtmpUrl, setRtmpUrl] = useState('');
    const [mqttUrl, setMqttUrl] = useState('');
    const [url, setUrl] = useState('');
    const [fwUpdate, setFwUpdate] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [serverName, setServerName] = useState('');
    const [enableStream, setEnableStream] = useState(false);
    const [enableAudio, setEnableAudio] = useState(false);
    const [telnet, setTelnet] = useState(false);
    const [hd, setHd] = useState(false);
    const [dst, setDst] = useState(false);
    const [autoUpdate, setAutoUpdate] = useState(false);
    const [onvifSetTZ, setOnvifSetTZ] = useState(false);
    const [enableDateTime, setEnableDateTime] = useState(false);
    const [interval, setInterval] = useState(1);

    const [isLoading, setIsLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeModal, setActiveModal] = useState(null);

    // get config
    const [serverAddress, setServerAddress] = useState('');
    const [serverPort, setServerPort] = useState('');
    const [rtspPort, setRtspPort] = useState('');
    const [planName, setPlanName] = useState('');

    const [constantBitRate, setConstantBitRate] = useState('');
    const [frameRate, setFrameRate] = useState('');
    const [codecType, setCodecType] = useState('');
    const [resolution, setResolution] = useState('');
    const [bitRateType, setBitRateType] = useState('');
    const [hue, setHue] = useState();
    const [saturation, setSaturation] = useState();
    const [brightness, setBrightness] = useState();
    const [contrast, setContrast] = useState();
    const [flipEnabled, setFlipEnabled] = useState(false);
    const [mirrorEnabled, setMirrorEnabled] = useState(false);
    const [irCutMode, setIrCutMode] = useState('');
    // 
    const [ip, setIp] = useState('');
    const [interfaceName, setInterfaceName] = useState('');
    const [imei, setImei] = useState('');
    const [signal, setSignal] = useState(0);
    // 
    const [localtime, setLocaltime] = useState('');
    const [ntpServer, setNtpServer] = useState('');
    const [timezone, setTimeZone] = useState('');
    // 
    const [deviceName, setDeviceName] = useState('');
    const [extSN2, setExtSN2] = useState('');
    const [firmwareReleaseDate, setFirmwareReleaseDate] = useState('');
    const [firmwareVersion, setFirmwareVersion] = useState('');
    const [hardwareVersion, setHardwareVersion] = useState('');
    const [macAddress, setMacAddress] = useState('');
    const [manufacturer, setManufacturer] = useState('');

    const [stream, setStream] = useState("");
    const [quality, setQuality] = useState("");
    const [videoInputChannelID, setvideoInputChannelID] = useState("");


    const [deviceId, setDeviceId] = useState('');
    const navigate = useNavigate();

    // const [configValue, setConfigValue] = useState('');

    // modal code
    const openModal = (modal) => {
        setActiveModal(modal);
        onOpen();
    };

    const closeModal = () => {
        setActiveModal(null);
        onClose();
    };

    // Function to handle input change
    const handleInputChange = (event) => {
        setDeviceId(event.target.value); // Update the input value in state
    };

    const setVideoConfigurations = async () => {
        try {
            console.log('setting video configurations', { quality, frameRate, constantBitRate, deviceId });
            const response = await setVideoEncodeChannelMain(quality, frameRate, constantBitRate, deviceId);

            toast.success('Video configurations updated successfully!');
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to update video configurations: ' + (error?.response?.data?.message || error.message));
        }
    };

    const handleVideoSettings = async () => {
        try {
            const response = await setVideoSettings(hue, saturation, brightness, contrast, flipEnabled, mirrorEnabled, deviceId);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleImageInfo = async () => {
        try {
            const response = await setImageInfo(irCutMode, deviceId);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleAddCamera = async () => {
        try {
            // alert for are you sure you want to add this camera? with cancel buttton
            if (window.confirm('Are you sure you want to add this camera?')) {
                // If the user confirms, proceed with the API call
                const response = await addCamera(deviceId);
                toast.success('Camera added successfully!');
            } else {
                // If the user cancels, do nothing
                return;
            }
            // const response = await addCamera(deviceId);
            // console.log('addCameraResponse',response);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error adding camera: ' + error.response.data.message);
        }
    };

    const getConfig = async () => {
        try {
            const responseNew = await handleGetConfig(deviceId);
            setServerAddress(responseNew?.server_addr || '');
            setServerPort(responseNew?.server_port || '');
            setRtspPort(responseNew?.remotePortRtsp || '');
            setPlanName(responseNew?.planName || '');

            const response3 = await getVideoSettings(deviceId);
            setHue(response3?.data?.hueLevel || 0);
            setSaturation(response3?.data?.saturationLevel || 0);
            setBrightness(response3?.data?.brightnessLevel || 0);
            setContrast(response3?.data?.contrastLevel || 0);
            setFlipEnabled(response3?.data?.flipEnabled || false);
            setMirrorEnabled(response3?.data?.mirrorEnabled || false);

            const response4 = await getImageInfo(deviceId);
            setIrCutMode(response4?.data?.irCutFilter?.irCutMode || '');

            const response5 = await getNetworkInterfaceSettings(deviceId);
            setIp(response5?.data?.lan?.staticIP || '');
            setInterfaceName(response5?.data?.interfaceName || '');

            const response6 = await getNetInfo(deviceId);
            setImei(response6?.data?.IMEI || '');
            setSignal(response6?.data?.Signal || '');

            const response7 = await getTimeSettings(deviceId);
            setLocaltime(response7?.data?.localTime || '');
            setNtpServer(response7?.data?.ntp?.ntpServerDomain || '');
            setTimeZone(response7?.data?.timeZone || '');

            const response8 = await getDeviceInfo(deviceId);
            setDeviceName(response8?.data?.deviceName || '');
            setExtSN2(response8?.data?.extSN2 || '');
            setFirmwareReleaseDate(response8?.data?.firmwareReleaseDate || '');
            setFirmwareVersion(response8?.data?.firmwareVersion || '');
            setHardwareVersion(response8?.data?.hardwareVersion || '');
            setMacAddress(response8?.data?.macAddress || '');
            setManufacturer(response8?.data?.manufacturer || '');

            const response10 = await get_videoSettings(deviceId);
            setFrameRate(response10?.data?.frameRate || '');
            setConstantBitRate(response10?.data?.constantBitRate || '');
            setBitRateType(response10?.data?.bitRateControlType || '');
            setQuality(response10?.data?.quality.quality || '');
            setCodecType(response10?.data?.codecType || '');
            setResolution(response10?.data?.resolution || '');
            setvideoInputChannelID(response10?.data?.videoInputChannelID || '');

            // ✅ Show success toast
            toast.success('Device configuration loaded successfully!');

        } catch (error) {
            console.error("Error fetching device info:", error);
            toast.error('Error fetching device info: ' + (error?.response?.data?.message || error.message));
        }
    };

    // Excel functions
    const [excelFile, setExcelFile] = React.useState(null);

    const handleExcelFileChange = (e) => {
        setExcelFile(e.target.files[0]);
    };

    const handleExcelUpload = async () => {
        if (!excelFile) {
            alert("Please select an Excel file to upload.");
            return;
        }

        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Assuming the first sheet contains the required data
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert sheet to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0 });

                const formattedData = { cameras: jsonData };
                // Send JSON data to the backend
                setIsLoading(true);
                const sendMultipleCamera = await addMultipleCamera(formattedData);
                setIsLoading(false);
                toast.success('Camera configs added successfully');
                closeModal();
            };

            reader.onerror = (error) => {
                console.error("Error reading the Excel file:", error);
                alert("Failed to read the Excel file. Please try again.");
            };

            reader.readAsArrayBuffer(excelFile);
        } catch (error) {
            console.error("Error processing the Excel file:", error);
            alert("An error occurred while processing the Excel file.");
        }
    };

    const isMobile = useBreakpointValue({ base: true, md: false });

    return (
        <Box p={8} mx={isMobile ? 0 : 20}>
            <SessionTimeout timeoutDuration={1800000} />

            <Box mt={4} mb={2}>
                <Text
                    sx={{
                        color: "var(--primary-txt, #141E35)",
                        fontFamily: "Inter",
                        fontSize: "4xl",
                        fontStyle: "normal",
                        fontWeight: "700",
                        lineHeight: "normal",
                        textTransform: "capitalize",
                        textAlign: "left",
                    }}
                >
                    Device Info
                </Text>
            </Box>

            <Flex
                as="nav"
                align="center"
                // justify="flex-end"
                w="100%" // Full width of the viewport or container
                // p={4} // Padding around the content
                bg="transparent" // Makes background transparent
            >
                <Flex w="100%"
                    spacing={4}
                    direction={['column', 'row']} // Column for mobile/tablet, row for desktop
                    justifyContent="space-between" // Space between elements in row direction
                    alignItems="center" // Center align items in column direction
                > {/* Box taking up half of the screen width */}
                    <Flex w="100%" spacing={4} direction={['column', 'row']}> {/* Flex container to space out children */}
                        <Input
                            flex={1}
                            minH={'40px'}
                            maxW='300px'
                            value={deviceId}
                            onChange={handleInputChange} // Capture input change
                            placeholder="Enter Config"
                        /> {/* Input takes maximum width available */}
                        <Button onClick={getConfig} colorScheme="blue" mt={[1, 0]} ml={[0, 4]}>Get</Button> {/* Margin left for spacing */}
                        <Button onClick={handleAddCamera} colorScheme="blue" mt={[1, 0]} ml={[0, 4]}>Add</Button>
                    </Flex>
                    <Flex w="100%" >
                        <Button w={['100%', 'auto']} onClick={() => openModal('Multiple Modal')} mt={[1, 0]} ml={[0, 4]}>Multiple Add</Button>
                    </Flex>
                </Flex>
            </Flex>
            <ToastContainer />

            {/* Camera Details */}
            {/* <Heading size="md" mb={4}>Camera Details</Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <FormControl>
                    <FormLabel>Subscribed to</FormLabel>
                    <Input
                        placeholder="Subscribed to"
                        value={subscribedTo}
                        onChange={(e) => setSubscribedTo(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Input
                        placeholder="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    />
                </FormControl>
            </Grid> */}

            {/* Stream Configurations */}
            {/* <Heading size="md" mt={8} mb={4}>Stream Configurations</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <FormControl display="flex" alignItems="center">
                    <FormLabel>Enable</FormLabel>
                    <Switch isChecked={enableStream} onChange={() => setEnableStream(!enableStream)} />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                    <FormLabel>Audio</FormLabel>
                    <Switch isChecked={enableAudio} onChange={() => setEnableAudio(!enableAudio)} />
                </FormControl>
            </Grid>

            <Grid templateColumns="repeat(3, 1fr)" gap={6} mt={4}>
                <FormControl>
                    <FormLabel>RTMP URL</FormLabel>
                    <Input
                        placeholder="RTMP URL"
                        value={rtmpUrl}
                        onChange={(e) => setRtmpUrl(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>MQTT URL</FormLabel>
                    <Input
                        placeholder="MQTT URL"
                        value={mqttUrl}
                        onChange={(e) => setMqttUrl(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>URL</FormLabel>
                    <Input
                        placeholder="URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </FormControl>
            </Grid>

            <Grid templateColumns="repeat(3, 1fr)" gap={6} mt={4}>
                <FormControl display="flex" alignItems="center">
                    <FormLabel>Telnet</FormLabel>
                    <Switch isChecked={telnet} onChange={() => setTelnet(!telnet)} />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                    <FormLabel>HD</FormLabel>
                    <Switch isChecked={hd} onChange={() => setHd(!hd)} />
                </FormControl>
                <FormControl>
                    <FormLabel>FW Update</FormLabel>
                    <Input
                        placeholder="FW update"
                        value={fwUpdate}
                        onChange={(e) => setFwUpdate(e.target.value)}
                    />
                </FormControl>
            </Grid> */}

            {/* Get Config */}
            <Heading size="md" mt={8} mb={4}>Get Config</Heading>
            <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                <FormControl>
                    <FormLabel>Server Add.</FormLabel>
                    <Input disabled value={serverAddress} placeholder="IP Address" />
                </FormControl>
                <FormControl>
                    <FormLabel>Server Port</FormLabel>
                    <Input disabled value={serverPort} placeholder="Interface Name" />
                </FormControl>
                <FormControl>
                    <FormLabel>RTSP Port</FormLabel>
                    <Input disabled value={rtspPort} placeholder="RTSP Port" />
                </FormControl>
                <FormControl>
                    <FormLabel>Plan Name</FormLabel>
                    <Input disabled value={planName} placeholder="Interface Name" />
                </FormControl>
            </Grid>

            {/* Date And Time Configurations */}
            <Heading size="md" mt={8} mb={4}>Date And Time Configurations</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <FormControl>
                    <FormLabel>LocalTime</FormLabel>
                    <Input disabled value={localtime} placeholder="IP Address" />
                </FormControl>
                <FormControl>
                    <FormLabel>NTP Server Domain</FormLabel>
                    <Input disabled value={ntpServer} placeholder="Interface Name" />
                </FormControl>
                <FormControl>
                    <FormLabel>Timezone</FormLabel>
                    <Input disabled value={timezone} placeholder="Interface Name" />
                </FormControl>
            </Grid>

            <HStack justify="space-between" align="center" mt={10} mb={4}>
                <Heading size="md">Video Configurations</Heading>
                <HStack>
                    <HStack>
                        <Select value={
                            (videoInputChannelID === 101 || quality === 102) ? 'main stream' : 'sub stream1'
                        } onChange={(e) => setStream(e.target.value)} placeholder='Stream'>
                            <option value="main stream">main stream</option>
                            <option value="sub stream1">sub stream1</option>
                        </Select>
                    </HStack>
                    <HStack>
                        <Select value={quality} onChange={(e) => setQuality(e.target.value)} placeholder='Quality'>
                            <option value="verylow">Very Low</option>
                            <option value="low">Low</option>
                            <option value="mid">Mid</option>
                            <option value="high">High</option>
                            <option value="veryhigh">Very High</option>
                        </Select>
                    </HStack>
                </HStack>
            </HStack>

            <Grid templateColumns="repeat(5, 1fr)" gap={6}>
                {/* Video configuration fields */}
                <FormControl>
                    <FormLabel>Bit Rate</FormLabel>
                    <Input value={constantBitRate} onChange={(e) => setConstantBitRate(e.target.value)} placeholder="Bit Rate" />
                </FormControl>
                <FormControl>
                    <FormLabel>FPS</FormLabel>
                    <Input value={frameRate} onChange={(e) => setFrameRate(e.target.value)} placeholder="FPS" />
                </FormControl>
                <FormControl>
                    <FormLabel>Profile</FormLabel>
                    <Select value={codecType} onChange={(e) => setCodecType(e.target.value)} placeholder='Codec Type'>
                        <option value="H.264">H.264</option>
                        <option value="H.265">H.265</option>
                        <option value="H.264+">H.264+</option>
                        <option value="H.265+">H.265+</option>
                    </Select>
                </FormControl>
                <FormControl>
                    <FormLabel>Bit Rate Type</FormLabel>
                    <Select value={bitRateType} onChange={(e) => setBitRateType(e.target.value)} placeholder="Select type">
                        <option>CBR</option>
                        <option>VBR</option>
                    </Select>
                </FormControl>
                <FormControl>
                    <FormLabel>Resolution</FormLabel>
                    <HStack spacing={4}>
                        <Select
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="Select resolution"
                            w="200px"
                        >
                            {videoInputChannelID === 101 ? (
                                <>
                                    <option value="2304x1296">Very High</option>
                                    <option value="1920x1080">High</option>
                                    <option value="1280x720">Mid</option>
                                </>
                            ) : (
                                <>
                                    <option value="800x448">Low</option>
                                    <option value="640x360">Very Low</option>
                                </>
                            )}
                        </Select>


                    </HStack>
                </FormControl>
                {/* Button for saving settings */}
                <Box alignSelf="flex-end">
                    <Button colorScheme="blue" onClick={setVideoConfigurations}>
                        Save Configuration
                    </Button>
                </Box>
            </Grid>


            <Heading size="md" mt={10} mb={4}>Display Configurations</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <FormControl>
                    <FormLabel htmlFor="hue-slider">Hue</FormLabel>
                    <Slider
                        id="hue-slider"
                        value={hue}
                        onChange={(value) => setHue(value)}
                        min={0}
                        max={100}
                        aria-label="hue-slider"
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    <Box pt={2}>
                        <Text fontSize="sm">Current Hue: {hue}</Text>
                    </Box>
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="hue-slider">Saturation</FormLabel>
                    <Slider
                        id="hue-slider"
                        value={saturation}
                        onChange={(value) => setSaturation(value)}
                        min={0}
                        max={100}
                        aria-label="hue-slider"
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    <Box pt={2}>
                        <Text fontSize="sm">Current Saturation: {saturation}</Text>
                    </Box>
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="hue-slider">Brightness</FormLabel>
                    <Slider
                        id="hue-slider"
                        value={brightness}
                        onChange={(value) => setBrightness(value)}
                        min={0}
                        max={100}
                        aria-label="hue-slider"
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    <Box pt={2}>
                        <Text fontSize="sm">Current Brightness: {brightness}</Text>
                    </Box>
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="hue-slider">Contrast</FormLabel>
                    <Slider
                        id="hue-slider"
                        value={contrast}
                        onChange={(value) => setContrast(value)}
                        min={0}
                        max={100}
                        aria-label="hue-slider"
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    <Box pt={2}>
                        <Text fontSize="sm">Current Contrast: {contrast}</Text>
                    </Box>
                </FormControl>
                <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="ssl-switch" mb="0">
                        Flip
                    </FormLabel>
                    <Switch isChecked={flipEnabled} onChange={(e) => setFlipEnabled(e.target.checked)} id="ssl-switch" />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="ssl-switch" mb="0">
                        Mirror
                    </FormLabel>
                    <Switch isChecked={mirrorEnabled} onChange={(e) => setMirrorEnabled(e.target.checked)} id="ssl-switch" />
                </FormControl>
                <Box alignSelf="flex-end">
                    <Button colorScheme="blue" onClick={handleVideoSettings}>
                        Set Video Settings
                    </Button>
                </Box>
                {/* <FormControl>
                    <FormLabel>IR Cut</FormLabel>
                    <Select placeholder="Select mode">
                        <option>Day & Night</option>
                        <option>Day Only</option>
                        <option>Night Only</option>
                    </Select>
                </FormControl> */}
            </Grid>

            <Heading size="md" mt={10} mb={4}>Image Configurations</Heading>
            <Grid templateColumns="repeat(6, 1fr)" gap={6}>
                <FormControl>
                    <FormLabel>IRCut</FormLabel>
                    <Select value={irCutMode} onChange={(e) => setIrCutMode(e.target.value)} placeholder='modes'>
                        <option value='auto'>IrLedMode</option>
                        <option value='light'>Light Mode</option>
                        <option value='smart'>Smart Mode</option>
                        <option value='daylight'>Daylight Mode</option>
                        <option value='night'>Night Mode</option>
                    </Select>
                </FormControl>
                <Box alignSelf="flex-end">
                    <Button colorScheme="blue" onClick={handleImageInfo}>
                        Set IrCut
                    </Button>
                </Box>
            </Grid>

            {/* <Heading size="md" mt={10} mb={4}>Image Configurations</Heading>
            <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                <FormControl>
                    <FormLabel>Flip</FormLabel>
                    <Checkbox>Enable</Checkbox>
                </FormControl>
                <FormControl>
                    <FormLabel>Mirror</FormLabel>
                    <Checkbox>Enable</Checkbox>
                </FormControl>
                <FormControl>
                    <FormLabel>WDR</FormLabel>
                    <Select placeholder="Off">
                        <option>On</option>
                        <option>Off</option>
                    </Select>
                </FormControl>
            </Grid> */}

            <Heading size="md" mt={10} mb={4}>PTZ Configurations</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <FormControl>
                    <FormLabel>Left</FormLabel>
                    <Input placeholder="Position" />
                </FormControl>
                {/* Repeat for other PTZ directions */}
            </Grid>

            <Heading size="md" mt={10} mb={4}>Device Info Configurations</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <FormControl>
                    <FormLabel>Device Name</FormLabel>
                    <Input disabled value={deviceName} placeholder="Device Name" />
                </FormControl>
                <FormControl>
                    <FormLabel>Ext SN2</FormLabel>
                    <Input disabled value={extSN2} placeholder="Ext SN2" />
                </FormControl>
                <FormControl>
                    <FormLabel>Firmware Release Date</FormLabel>
                    <Input disabled value={firmwareReleaseDate} placeholder="Date" />
                </FormControl>
                <FormControl>
                    <FormLabel>Firmware Version</FormLabel>
                    <Input disabled value={firmwareVersion} placeholder="Firmware Version" />
                </FormControl>
                <FormControl>
                    <FormLabel>Hardware Version</FormLabel>
                    <Input disabled value={hardwareVersion} placeholder="Hardware Version" />
                </FormControl>
                <FormControl>
                    <FormLabel>Mac Address</FormLabel>
                    <Input disabled value={macAddress} placeholder="Mac Address" />
                </FormControl>
                <FormControl>
                    <FormLabel>Manufacturer</FormLabel>
                    <Input disabled value={manufacturer} placeholder="Manufacturer" />
                </FormControl>
                {/* Additional device info fields */}
            </Grid>

            <Heading size="md" mt={10} mb={4}>Network Info Configurations</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <FormControl>
                    <FormLabel>IP</FormLabel>
                    <Input disabled value={ip} placeholder="IP Address" />
                </FormControl>
                <FormControl>
                    <FormLabel>Interface Name</FormLabel>
                    <Input disabled value={interfaceName} placeholder="Interface Name" />
                </FormControl>
                <FormControl>
                    <FormLabel>IMEI</FormLabel>
                    <Input disabled value={imei} placeholder="Interface Name" />
                </FormControl>
                <FormControl>
                    <FormLabel>Signal</FormLabel>
                    <Input disabled value={signal} placeholder="Interface Name" />
                </FormControl>
                {/* Additional network info fields */}
            </Grid>

            {/* Modal Code */}
            <Modal
                onClose={onClose}
                isOpen={isOpen && activeModal === "Multiple Modal"}
                isCentered
                size={"lg"}
            >
                <ModalOverlay />
                <ModalContent color={"black"}>
                    <ModalHeader textAlign={"center"} p={1} mt={4}>
                        Add Multiple Camera
                    </ModalHeader>
                    <ModalBody pb={6} textAlign="center">
                        {isLoading ? (<Spinner />)
                            : (
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    width="100%"
                                >
                                    <Button
                                        color="gray.500"
                                        variant="outline"
                                        onClick={() => window.open("/deviceInfoSample.xlsx", "_blank")}
                                    >
                                        Sample Download
                                    </Button>
                                    <FormControl width="350px" mt={5}>
                                        <FormLabel
                                            htmlFor="excel-upload"
                                            textAlign="start"
                                        >
                                            Upload Excel File:
                                        </FormLabel>

                                        <Input
                                            id="excel-upload"
                                            type="file"
                                            accept=".xlsx, .xls"
                                            borderColor="gray"
                                            borderRadius="10px"
                                            px={4}
                                            py={1}
                                            onChange={handleExcelFileChange}
                                        />
                                    </FormControl>
                                </Box>
                            )}
                    </ModalBody>
                    <ModalFooter marginRight={"10px"} justifyContent={"space-evenly"}>
                        <Button
                            onClick={closeModal}
                            w="150px"
                            border="1px"
                            background="0"
                            color="red.500"
                            borderColor="red.500"
                            _hover={{ background: "none" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleExcelUpload()}
                            w="150px"
                            fontWeight={"normal"}
                        >
                            Add Camera
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default Deviceinfo;
