// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import SessionTimeout from './SessionTimeout';
import { Box, Button, Checkbox, CircularProgress, FormControl, FormLabel, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import { addMultiP2pCamera, addP2pCamera, getP2pCameras, setCameraOtaToken } from '../actions/cameraActions';
import { Link } from 'react-router-dom';
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { toast, ToastContainer } from 'react-toastify';
import { FaSort } from "react-icons/fa";
import { MdAdd, MdError } from 'react-icons/md';
import '../App.css';

const CameraList = () => {

    const [cameraa, setCameraa] = useState([]);
    const [deviceId, setDeviceId] = useState('');
    const [cameraType, setCameraType] = useState('');
    const [channel, setChannel] = useState('');
    const [querySearch, setQuerySearch] = useState('');
    const [page, setPage] = useState(1);
    const [resultPerPage, setResultPerPage] = useState(10);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeModal, setActiveModal] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const [order, setOrder] = useState('desc');
    const [isPtz, setIsPtz] = useState(0);
    const [otaTokenModalDevice, setOtaTokenModalDevice] = useState(null);
    const [otaTokenInput, setOtaTokenInput] = useState('');
    const [otaTokenSaving, setOtaTokenSaving] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const getConfig = async (page, querySearch, status, order) => {
        // console.log("checking", page, querySearch);
        try {
            const response = await getP2pCameras(page, querySearch, status, order);
            console.log("getP2pCameras", response.data);
            console.log("getP2pCameras", response.data);
            setCameraa(response.data.data);
            setTotalPages(response.data.totalPages);
            setResultPerPage(response.data.resultPerPage);
        } catch (error) {
            toast.error(error.response.data.message);
            console.error('Error:', error);
            // navigate('/404');
        }
    };

    // const fetchMasterMqtt = async () => {
    //     try {
    //         const response = await getMqttMaster();
    //         console.log("getMqttMaster", response);
    //     } catch (error) {
    //         console.error('Error fetching MQTT master:', error);
    //     }
    // };

    useEffect(() => {
        getConfig();
        // fetchMasterMqtt();
    }, []);

    const openModal = (modal, cameraId, cameraName) => {
        // console.log("cameraId");
        setActiveModal(modal);
        // setSelectedCameraId(cameraId);
        // setSelectedCameraName(cameraName);
        onOpen();
    };

    const closeModal = () => {
        setActiveModal(null);
        // setActiveTab("General");
        onClose();
    };

    // Handle Add Camera Function
    // const handleAddCamera = async () => {
    //     try {
    //         const response = await addP2pCamera(deviceId);
    //         toast.success(response.data.message);
    //         getConfig();
    //         setDeviceId('');
    //         // setFrameRate(response.data.frameRate);
    //         // navigate('/404');
    //     } catch (error) {
    //         setDeviceId('');
    //         toast.error(error.response.data.message);
    //         console.error('Error:', error);
    //         // navigate('/404');
    //     }
    // }
    const handleAddCamera = async () => {
        if (!cameraType || !deviceId) {
            setError("Device ID is required!");
            setUploadStatus('Please provide a device ID.');
            return;
        }

        const formData = new FormData();
        formData.append('deviceId', deviceId);
        formData.append('productType', cameraType);
        formData.append('isPTZ', isPtz);

        if (cameraType === 'vod') {
            // Check if the file size exceeds 30MB (30MB = 31457280 bytes)
            const MAX_SIZE = 30 * 1024 * 1024; // 30MB in bytes
            if (!file) {
                setUploadStatus('Please upload a file.');
                return;
            }

            if (file.size > MAX_SIZE) {
                setUploadStatus('The file size exceeds the 30MB limit.');
                return;
            }

            formData.append('video', file);
        }

        // Debugging FormData
        for (const [key, value] of formData.entries()) {
            // console.log(`${key}:`, value);
        }

        try {
            const response = await addP2pCamera(deviceId, cameraType, isPtz);
            toast.success(response.data.message);
            closeModal();
            // console.log("response", response);
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // const [status, setStatus] = useState("offline"); // Default to offline

    const openSetOtaToken = (deviceId) => {
        setOtaTokenModalDevice(deviceId);
        setOtaTokenInput('');
    };

    const closeSetOtaToken = () => {
        setOtaTokenModalDevice(null);
        setOtaTokenInput('');
        setOtaTokenSaving(false);
    };

    const handleSaveOtaToken = async () => {
        if (!otaTokenInput.trim()) {
            toast.error('Token is required');
            return;
        }
        setOtaTokenSaving(true);
        try {
            await setCameraOtaToken(otaTokenModalDevice, otaTokenInput.trim());
            toast.success('OTA token saved');
            closeSetOtaToken();
            await getConfig(currentPage, querySearch, status, order);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setOtaTokenSaving(false);
        }
    };

    const handleStatusSort = async () => {
        const newStatus = status === "offline" ? "online" : "offline"; // Toggle between online & offline
        console.log("newStatus", newStatus);
        try {
            await getConfig(page, querySearch, newStatus, order); // Fetch cameras with new status
            setStatus(newStatus); // Update status for the next click
        } catch (error) {
            console.error("Error fetching cameras:", error);
        }
    };

    const handleOrderSort = async () => {
        const newOrder = order === "asc" ? "desc" : "asc";
        try {
            await getConfig(page, querySearch, status, newOrder);
            setOrder(newOrder);
        } catch (error) {
            console.error("Error fetching cameras:", error);
        }
    };


    // pagination code

    const [currentPage, setcurrentPage] = useState(1);
    const [loadingNext, setLoadingNext] = useState(false);
    const [loadingPrev, setLoadingPrev] = useState(false);
    const [prevButtonDisabled, setPrevButtonDisabled] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
    const [totalPages, setTotalPages] = useState();

    const handleNextClick = async () => {

        const nextPage = currentPage + 1;
        setLoadingNext(true); // Show loading spinner
        try {
            await getConfig(nextPage, querySearch, status, order);
            setcurrentPage(nextPage);
            // console.log(currentPage);

        } finally {
            setLoadingNext(false); // Hide loading spinner
        }

    };
    const handlePrevClick = async () => {

        const PrevPage = currentPage - 1;
        setLoadingPrev(true); // Show loading spinner
        try {
            await getConfig(PrevPage, querySearch, status, order);
            setcurrentPage(PrevPage);
        } finally {
            setLoadingPrev(false); // Hide loading spinner
        }

    };

    useState(() => {
        setPrevButtonDisabled(currentPage === 1);
        setNextButtonDisabled(currentPage === totalPages);
        // fetchCameraList(currentPage);
    }, [currentPage, totalPages]);

    const isMobile = useBreakpointValue({ base: true, md: false });

    // function to download sample excel file
    const handleDownloadSample = () => {
        // 1. Define the sample data matching your Schema
        const sampleData = [
            {
                deviceId: "ABCD-1234-XYZW",
                productType: "Augentix Camera",
                isPTZ: 1 // Example for YES
            },
            {
                deviceId: "EFGH-5678-IJKL",
                productType: "Standard Bullet",
                isPTZ: 0 // Example for NO
            }
        ];

        // 2. Create a worksheet
        const worksheet = XLSX.utils.json_to_sheet(sampleData);

        // 3. Create a workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CameraTemplate");

        // 4. Trigger the download
        XLSX.writeFile(workbook, "CameraListSample.xlsx");
    };

    // handle excel upload

    const [isUploadMode, setIsUploadMode] = React.useState(false);
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
                const sendMultipleCamera = await addMultiP2pCamera(formattedData);
                console.log("sendMultipleCamera", sendMultipleCamera);
                toast.success('Cameras added successfully');
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

    return (
        <>
            <Box p={8} mx={isMobile ? 0 : 20} display={'flex'} flexDirection={'column'}>
                <ToastContainer />
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
                        Camera List
                    </Text>
                </Box>

                <Stack
                    direction={['column', 'row']} // Column on mobile, row on larger screens
                    // justify="flex-end"
                    align="center"
                    spacing={4} // Space between Input and Button
                    mb={1}
                >
                    <Input
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                        placeholder="Enter Device ID"
                        size="md"
                        maxWidth="200px"
                        focusBorderColor="green.400" // Custom border color on focus
                        _focus={{
                            boxShadow: 'none', // Remove default shadow
                            borderColor: 'green.400', // Custom border color on focus
                        }}
                    />
                    <Button
                        onClick={() => { getConfig(1, deviceId) }}
                        colorScheme='blue'
                        variant='outline'
                        size='md' // Changed to 'md' for better alignment
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => openModal('Add Camera')}
                        colorScheme='green'
                        variant='outline'
                        size='md' // Changed to 'md' for better alignment
                    >
                        ADD
                    </Button>
                </Stack>

                <TableContainer
                    width="100%"
                    // maxW="1200px"
                    mx="auto"
                    mt="4"
                    // border="1px"
                    // borderColor="gray.200"
                    boxShadow={"0px 5px 22px 0px rgba(0, 0, 0, 0.04)"}
                    borderRadius="md"
                >
                    <Table> {/* variant='striped' colorScheme='gray' */}
                        {/* <TableCaption>Your Installed Camera List</TableCaption> */}
                        <Thead bg="gray.100">
                            <Tr>
                                <Th>Sr.No.</Th>
                                <Th>Device ID</Th>
                                {/* <Th>Product Type</Th> */}
                                <Th>MQTT Url</Th>
                                <Th display="flex" alignItems="center" justifyContent="space-between">
                                    Status
                                    <Button onClick={handleStatusSort} variant="ghost" color="white" size="xs" ml={2}>
                                        <FaSort />
                                    </Button>
                                </Th>
                                <Th>
                                    Last OFF
                                    <Button onClick={handleOrderSort} variant="ghost" color="white" size="xs" ml={2}>
                                        <FaSort />
                                    </Button>
                                </Th>
                                <Th>ON Time</Th>
                                <Th>OTA Token</Th>
                                {/* <Th>Web Url</Th> */}
                                {/* <Th>Telnet Url</Th> */}
                                {/* <Th>Media Url</Th> */}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {cameraa
                                .map((camera, index) => (
                                    <Tr key={index}>
                                        <Td>{index + 1 + (currentPage - 1) * resultPerPage}</Td>
                                        <Td>
                                            {camera.deviceId}
                                        </Td>
                                        {/* <Td>{camera.productType}</Td> */}
                                        <Td>{camera.mqttUrl}</Td>

                                        {/* Status column with status icon */}
                                        <Td>
                                            {camera.status === 'online' ? '🟢' : '🔴'}
                                        </Td>

                                        <Td>{camera.lastCloseTime}</Td>
                                        <Td>{camera.lastStartTime}</Td>
                                        <Td>
                                            {camera.otaDeviceToken ? (
                                                <Text
                                                    fontFamily="mono"
                                                    fontSize="xs"
                                                    color="gray.600"
                                                    title={`${camera.otaDeviceToken} (locked — one-time set)`}
                                                >
                                                    🔒 {camera.otaDeviceToken.slice(0, 10)}…
                                                </Text>
                                            ) : (
                                                <Button
                                                    size="xs"
                                                    colorScheme="blue"
                                                    variant="outline"
                                                    onClick={() => openSetOtaToken(camera.deviceId)}
                                                >
                                                    Set Token
                                                </Button>
                                            )}
                                        </Td>
                                        {/* <Td>
                                            <Link to={camera.weburl} target="_blank" rel="noopener noreferrer">
                                                <FaArrowUpRightFromSquare />
                                            </Link>
                                        </Td>
                                        <Td>
                                            <Button colorScheme='blue' variant='outline' size='sm'>
                                                Enable
                                            </Button> */}
                                        {/* </Td> */}
                                        {/* <Td></Td> */}
                                    </Tr>
                                ))
                            }
                        </Tbody>

                    </Table>
                </TableContainer>
                {/* if total pages is there than only show some data */}
                {totalPages > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                        Page: {currentPage}/{totalPages}
                        <Box>
                            <Button sx={{ marginRight: '5px' }} hidden={currentPage === 1} onClick={handlePrevClick} startIcon={<MdAdd />} >
                                {loadingPrev ? <CircularProgress isIndeterminate size={10} /> : 'Prev'}
                            </Button>
                            <Button hidden={currentPage === totalPages} onClick={handleNextClick} startIcon={<MdAdd />} >
                                {loadingNext ? <CircularProgress isIndeterminate size={10} /> : 'Next'}
                            </Button>
                        </Box>
                    </div>
                )}


            </Box >
            {/* <Modal
                onClose={onClose}
                isOpen={isOpen && activeModal === "Add Camera"}
                isCentered
                size={"lg"}
            >
                <ModalOverlay />
                <ModalContent
                    // bg={useColorModeValue("white", theme.colors.custom.darkModeBg)}
                    color={"black"}
                >
                    <ModalHeader
                        textAlign={"center"}
                        p={1}
                        mt={4}
                    // color={useColorModeValue(
                    //     theme.colors.custom.lightModeText,
                    //     theme.colors.custom.darkModeText
                    // )}
                    >
                        Add Camera
                    </ModalHeader>
                    <ModalBody pb={6} textAlign="center">
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            width="100%"
                            //   padding="10px"
                            p={1}
                        >
                            <FormControl width="350px" mt={5}>
                                <FormLabel
                                    htmlFor="device-name"
                                    textAlign="start"
                                // color={useColorModeValue(
                                //     theme.colors.custom.lightModeText,
                                //     theme.colors.custom.darkModeText
                                // )}
                                >
                                    DeviceId:
                                </FormLabel>
                                <Input
                                    id="device-name"
                                    placeholder="Device Name"
                                    borderColor="gray"
                                    borderRadius="10px"
                                    px={4}
                                    _placeholder={{ color: "gray.400" }}
                                    value={deviceId}
                                    onChange={(e) => setDeviceId(e.target.value)}
                                // _focus={{
                                //     borderColor: theme.colors.custom.primary, // Custom purple border color on focus
                                //     boxShadow: `0 0 0 1px ${theme.colors.custom.primary}`, // Custom purple box shadow
                                // }}
                                />
                            </FormControl>
                            <FormControl width="350px" mt={5}>
                                <FormLabel
                                    htmlFor="device-name"
                                    textAlign="start"
                                >
                                    Camera Type:
                                </FormLabel>
                                <Select
                                    id="camera-type"
                                    placeholder="Select Camera Type"
                                    borderColor="gray"
                                    borderRadius="10px"
                                    value={cameraType}
                                    onChange={(e) => setCameraType(e.target.value)}
                                >
                                    <option value="A-Series">A-Series</option>
                                    <option value="S-Series">S-Series</option>
                                    <option value="vod">VOD</option>
                                    <option value="Wifi-S-Series">WiFi S-Series</option>
                                    <option value="NVR">NVR</option>
                                </Select>
                            </FormControl>
                            {cameraType === 'NVR' && (
                                <FormControl width="350px" mt={5}>
                                    <FormLabel
                                        htmlFor="device-name"
                                        textAlign="start"
                                    >
                                        Channel:
                                    </FormLabel>
                                    <Input id="channel" placeholder="Channel" value={channel} onChange={(e) => setChannel(e.target.value)} />
                                </FormControl>
                            )}
                            {cameraType === 'vod' && (
                                <FormControl width="350px" mt={5}>
                                    <FormLabel htmlFor="video-upload" textAlign="start">
                                        Upload Video:
                                    </FormLabel>
                                    <Input
                                        id="videoFile"
                                        type="file"
                                        accept="video/*"
                                        borderColor="gray"
                                        borderRadius="10px"
                                        px={4}
                                        onChange={handleFileChange}
                                    />
                                </FormControl>
                            )}
                        </Box>
                        {uploadStatus &&
                            <Text display={'flex'}
                                alignItems={'center'}
                                justifyContent={'center'}
                                color={'red'}>
                                <MdError />&nbsp;{uploadStatus}
                            </Text>}
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
                            onClick={() => handleAddCamera()}
                            w="150px"
                            // background={useColorModeValue(
                            //     theme.colors.custom.primary,
                            //     theme.colors.custom.darkModePrimary
                            // )}
                            // color={useColorModeValue(
                            //     theme.colors.custom.lightModeText,
                            //     theme.colors.custom.darkModeText
                            // )}
                            fontWeight={"normal"}
                        // _hover={{
                        //     backgroundColor: useColorModeValue(
                        //         theme.colors.custom.darkModePrimary,
                        //         theme.colors.custom.primary
                        //     ),
                        //     color: useColorModeValue(
                        //         theme.colors.custom.darkModeText,
                        //         theme.colors.custom.lightModeText
                        //     ),
                        // }}
                        >
                            Add Camera
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal > */}

            <Modal
                onClose={onClose}
                isOpen={isOpen && activeModal === "Add Camera"}
                isCentered
                size={"lg"}
            >
                <ModalOverlay />
                <ModalContent color={"black"}>
                    <ModalHeader textAlign={"center"} p={1} mt={4}>
                        Add Camera
                        <Box position="absolute" top="10px" right="10px">
                            <Checkbox
                                colorScheme="teal"
                                isChecked={isUploadMode}
                                onChange={(e) => setIsUploadMode(e.target.checked)}
                            >
                                Upload Excel
                            </Checkbox>
                        </Box>
                    </ModalHeader>
                    <ModalBody pb={6} textAlign="center">
                        {isUploadMode ? (
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
                                    onClick={handleDownloadSample} // Updated function call
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
                        ) : (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                width="100%"
                                p={1}
                            >
                                <FormControl width="350px" mt={5} isRequired>
                                    <FormLabel htmlFor="device-name" textAlign="start">
                                        DeviceId:
                                    </FormLabel>
                                    <Input
                                        id="device-name"
                                        placeholder="Device Name"
                                        borderColor="gray"
                                        borderRadius="10px"
                                        px={4}
                                        _placeholder={{ color: "gray.400" }}
                                        value={deviceId}
                                        onChange={(e) => setDeviceId(e.target.value)}
                                    />
                                </FormControl>
                                <Box width="350px" textAlign={'start'}>
                                    {error && <Text color="red.500">{error}</Text>}
                                </Box>
                                <FormControl width="350px" mt={5}>
                                    <FormLabel htmlFor="camera-type" textAlign="start">
                                        Camera Type:
                                    </FormLabel>
                                    <Select
                                        id="camera-type"
                                        placeholder="Select Camera Type"
                                        borderColor="gray"
                                        borderRadius="10px"
                                        value={cameraType}
                                        onChange={(e) => setCameraType(e.target.value)}
                                    >
                                        <option value="Wifi-Augentix">WiFi-Augentix</option>
                                    </Select>
                                </FormControl>
                                <FormControl width="350px" mt={5} display={'flex'} justifyContent={"space-between"}>
                                    <FormLabel htmlFor="is-ptz" textAlign="start">
                                        PTZ Camera:
                                    </FormLabel>
                                    <Checkbox
                                        id="is-ptz"
                                        isChecked={isPtz}
                                        onChange={(e) => setIsPtz(e.target.checked ? 1 : 0)}
                                        borderColor="gray"
                                        borderRadius="10px"
                                    >
                                        Is PTZ?
                                    </Checkbox>
                                </FormControl>
                                {cameraType === "NVR" && (
                                    <FormControl width="350px" mt={5}>
                                        <FormLabel htmlFor="channel" textAlign="start">
                                            Channel:
                                        </FormLabel>
                                        <Input
                                            id="channel"
                                            placeholder="Channel"
                                            value={channel}
                                            onChange={(e) => setChannel(e.target.value)}
                                        />
                                    </FormControl>
                                )}
                                {cameraType === "vod" && (
                                    <FormControl width="350px" mt={5}>
                                        <FormLabel htmlFor="video-upload" textAlign="start">
                                            Upload Video:
                                        </FormLabel>
                                        <Input
                                            id="videoFile"
                                            type="file"
                                            accept="video/*"
                                            borderColor="gray"
                                            borderRadius="10px"
                                            px={4}
                                            onChange={handleFileChange}
                                        />
                                    </FormControl>
                                )}
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
                            onClick={() => (isUploadMode ? handleExcelUpload() : handleAddCamera())}
                            w="150px"
                            fontWeight={"normal"}
                        >
                            {isUploadMode ? "Upload File" : "Add Camera"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={Boolean(otaTokenModalDevice)}
                onClose={closeSetOtaToken}
                isCentered
                size="md"
            >
                <ModalOverlay />
                <ModalContent color="black">
                    <ModalHeader>Set OTA Token</ModalHeader>
                    <ModalBody>
                        <Text mb={2}>
                            Device: <strong>{otaTokenModalDevice}</strong>
                        </Text>
                        <Text mb={3} fontSize="sm" color="gray.600">
                            This token is provided by the firmware engineer and never expires.
                            It cannot be changed once set.
                        </Text>
                        <FormControl>
                            <FormLabel>OTA Device Token</FormLabel>
                            <Input
                                value={otaTokenInput}
                                onChange={(e) => setOtaTokenInput(e.target.value)}
                                placeholder="Paste base64 device token"
                                autoFocus
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter gap={2}>
                        <Button onClick={closeSetOtaToken} variant="outline" colorScheme="red">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveOtaToken}
                            colorScheme="blue"
                            isLoading={otaTokenSaving}
                        >
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </>
    );
}

export default CameraList;
