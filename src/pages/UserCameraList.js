// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import SessionTimeout from './SessionTimeout';
import { Box, Button, Checkbox, CircularProgress, FormControl, FormLabel, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import { addP2pCamera, getP2pCameras } from '../actions/cameraActions';
import { Link } from 'react-router-dom';
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { toast, ToastContainer } from 'react-toastify';
import { FaSave, FaSort } from "react-icons/fa";
import { MdAdd, MdDelete, MdEdit, MdError } from 'react-icons/md';
import { addCameraToUser, bulkAddCameraToUser, createUser, deleteUser, getAllUsers, getUserCameras, handleDeleteCameraFromUser, updateUserCamera } from '../actions/adminActions';
import { ImCross } from 'react-icons/im';

const UserCameraList = () => {

    const [userCameras, setUserCameras] = useState([]);
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [resultPerPage, setResultPerPage] = useState(5);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeModal, setActiveModal] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [file, setFile] = useState(null);
    const [deviceId, setDeviceId] = useState('');
    const [currentPage, setcurrentPage] = useState(1);
    const [loadingNext, setLoadingNext] = useState(false);
    const [loadingPrev, setLoadingPrev] = useState(false);
    const [prevButtonDisabled, setPrevButtonDisabled] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
    const [totalPages, setTotalPages] = useState();
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const role = localStorage.getItem('userRole') || [];

    const getConfig = async (page, search, limit) => {
        try {
            const response = await getUserCameras(page, search, limit);
            console.log(response);
            setUserCameras(response.data);
            setTotalPages(response.pagination.pages);
            setResultPerPage(response.pagination.limit);
        } catch (error) {
            toast.error(error.response.data.message);
            console.error('Error:', error);
            // navigate('/404');
        }
    };

    useEffect(() => {
        getConfig();
    }, []);

    const openModal = (modal, id, cameraName) => {
        // console.log("cameraId");
        setActiveModal(modal);
        setUserIdToDelete(id);
        // setSelectedCameraId(cameraId);
        // setSelectedCameraName(cameraName);
        onOpen();
    };

    const closeModal = () => {
        setActiveModal(null);
        // setActiveTab("General");
        onClose();
    };

    // pagination code

    const handleNextClick = async () => {

        const nextPage = currentPage + 1;
        setLoadingNext(true); // Show loading spinner
        try {
            await getConfig(nextPage, search);
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
            await getConfig(PrevPage, search);
            setcurrentPage(PrevPage);
        } finally {
            setLoadingPrev(false); // Hide loading spinner
        }
    };

    // Add Single Camera Function

    const handleAddCamera = async () => {
        try {
            const addUser = await addCameraToUser(name, email, deviceId);
            console.log('addUser', addUser);
            closeModal();
            getConfig();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const [isUploadMode, setIsUploadMode] = useState(false);
    const [excelFile, setExcelFile] = React.useState(null);

    const handleExcelFileChange = (e) => {
        setExcelFile(e.target.files[0]);
    };


    // Function to generate and download sample excel
    const handleDownloadSample = () => {
        // 1. Define the data structure (Rows match your backend requirements)
        const sampleData = [
            { deviceId: "ATPL-123456-TEST", email: "user@example.com" },
            { deviceId: "ATPL-987654-DEMO", email: "admin@test.com" }
        ];

        // 2. Create a worksheet
        const worksheet = XLSX.utils.json_to_sheet(sampleData);

        // 3. Create a workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cameras");

        // 4. Trigger download
        XLSX.writeFile(workbook, "Camera_Upload_Sample.xlsx");
    };

    // Inside UserCameraList.js

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
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0 });

                // --- ADDED MAPPING LOGIC ---
                // This ensures the backend receives 'deviceId' and 'email' 
                // regardless of whether the Excel header is 'Device ID', 'deviceid', 'Email', etc.
                const normalizedCameras = jsonData.map((row) => ({
                    deviceId: row.deviceId || row.DeviceId || row.deviceID || row['Device ID'],
                    email: row.email || row.Email || row.emailId || row.EmailId
                }));

                // Filter out empty rows (where deviceId or email might be missing)
                const validCameras = normalizedCameras.filter(cam => cam.deviceId && cam.email);

                const formattedData = { cameras: validCameras };
                // ---------------------------

                console.log("Sending Payload:", formattedData); // Debug log

                try {
                    // Send JSON data to the backend
                    const response = await bulkAddCameraToUser(formattedData);

                    // Check success
                    if (response && response.data && response.data.success) {
                        toast.success("Cameras processed successfully!");
                        closeModal();
                        getConfig(); // Refresh the table
                    } else {
                        // If partial success or specific backend message
                        toast.info("Upload processed. Check console for details.");
                        closeModal();
                        getConfig();
                    }
                } catch (apiError) {
                    console.error("API Error:", apiError);
                    toast.error("Failed to upload cameras.");
                }
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

    // Edit Functionality

    const [editableCameraId, setEditableCameraId] = useState(null);
    const [editedCamera, setEditedCamera] = useState({});

    const handleEditClick = (camera) => {
        // console.log("camera", camera);
        setEditableCameraId(camera._id);
        setEditedCamera(camera);
    };

    const handleInputChange = (field, value) => {
        setEditedCamera({ ...editedCamera, [field]: value });
    };

    const handleSave = async () => {
        // console.log("Updated Camera Data:", editedCamera);
        try {
            const updateUsersCamera = await updateUserCamera(editedCamera.name, editedCamera.deviceId, editedCamera.email, editedCamera.isp2p, editedCamera.productType, editedCamera.plan, editedCamera.remotePortRtsp);
            setEditableCameraId(null); // Exit edit mode
            getConfig(page, deviceId, email);
            toast.success("Camera Updated Successfully");
        } catch (error) {
            console.error('Error:', error);
            toast.error("Error Updating Camera");
        }
    };

    const handleCancel = () => {
        setEditableCameraId(null); // Exit edit mode without saving
    };

    // Delete Functionality

    const confirmDelete = async (deviceId) => {
        try {
            // alert are you sure you want to delete camera from the user
            const confirmDelete = window.confirm("Are you sure you want to delete this camera from the user?");
            const deleteAdmin = await handleDeleteCameraFromUser(deviceId);
            getConfig(); // Refresh data after deletion
        } catch (error) {
            console.error('Error:', error);
        } finally {
            // closeModal();
        }
    };

    useState(() => {
        setPrevButtonDisabled(currentPage === 1);
        setNextButtonDisabled(currentPage === totalPages);
        // fetchCameraList(currentPage);
    }, [currentPage, totalPages]);

    const isMobile = useBreakpointValue({ base: true, md: false });

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
                            fontSize: '4xl',
                            fontStyle: "normal",
                            fontWeight: "700",
                            lineHeight: "normal",
                            textTransform: "capitalize",
                            textAlign: "left",
                        }}
                    >
                        User's Camera List
                    </Text>
                </Box>

                <Stack
                    direction={['column', 'row']} // Column on mobile, row on larger screens
                    // justify="flex-end"
                    align="center"
                    spacing={4} // Space between Input and Button
                    mb={1}
                >
                    <Box>
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Enter Name/Email/Device ID"
                            size="md"
                            maxWidth="200px"
                            mr={2}
                            focusBorderColor="green.400" // Custom border color on focus
                            _focus={{
                                boxShadow: 'none', // Remove default shadow
                                borderColor: 'green.400', // Custom border color on focus
                            }}
                        />
                    </Box>
                    <Box alignSelf="flex-start">
                        <Button
                            onClick={() => { getConfig(page, search) }}
                            colorScheme='blue'
                            variant='outline'
                            mr={2}
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
                    </Box>
                </Stack>
                <TableContainer
                    width="100%"
                    // maxW="1200px"
                    mx="auto"
                    mt="4"
                    // border="1px"
                    // borderColor="gray.200"
                    boxShadow={"0px 5px 22px 0px rgba(0, 0, 0, 0.04)"}
                    borderRadius="md">
                    <Table>
                        {/* <TableCaption>Your Installed Camera List</TableCaption> */}
                        <Thead bg="gray.100">
                            <Tr>
                                <Th>Sr.No.</Th>
                                <Th>Name</Th>
                                <Th>Device ID</Th>
                                <Th>Email</Th>
                                <Th>P2P</Th>
                                <Th>Product Type</Th>
                                <Th>Plan</Th>
                                <Th>Port</Th>
                                {role?.includes('admin') && (
                                    <Th>Edit/Delete</Th>
                                )}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {userCameras && userCameras.length > 0 ? (
                                userCameras.map((camera, index) => (
                                    <Tr key={camera._id}>
                                        <Td>
                                            {index + 1 + (currentPage - 1) * resultPerPage}
                                        </Td>
                                        <Td>
                                            {editableCameraId === camera._id ? (
                                                <Input
                                                    value={editedCamera.name || ''}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                />
                                            ) : (
                                                camera.name
                                            )}
                                        </Td>
                                        <Td>
                                            {/* {editableCameraId === camera._id ? (
                                                <Input
                                                    value={editedCamera.deviceId || ''}
                                                    onChange={(e) => handleInputChange('deviceId', e.target.value)}
                                                />
                                            ) : (
                                                camera.deviceId
                                            )} */}
                                            {camera.deviceId}
                                        </Td>
                                        <Td>
                                            {editableCameraId === camera._id ? (
                                                <Input
                                                    value={editedCamera.email || ''}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                />
                                            ) : (
                                                camera.email
                                            )}
                                        </Td>
                                        <Td>
                                            {editableCameraId === camera._id ? (
                                                <Checkbox
                                                    isChecked={editedCamera.isp2p === 1}
                                                    onChange={(e) =>
                                                        handleInputChange('isp2p', e.target.checked ? 1 : 0)
                                                    }
                                                >
                                                </Checkbox>
                                            ) : (
                                                <Checkbox
                                                    isChecked={camera.isp2p}
                                                    disabled
                                                >
                                                </Checkbox>
                                            )}
                                        </Td>
                                        <Td>
                                            {editableCameraId === camera._id ? (
                                                <Select
                                                    value={editedCamera.productType || ''}
                                                    onChange={(e) =>
                                                        handleInputChange('productType', e.target.value)
                                                    }
                                                >
                                                    <option value="A-Series">A-Series</option>
                                                    <option value="S-Series">S-Series</option>
                                                    <option value="vod">VOD</option>
                                                    <option value="Wifi-S-Series">WiFi S-Series</option>
                                                    <option value="Wifi-Augentix">WiFi-Augentix</option>
                                                    <option value="4g-Augentix">4g-Augentix</option>
                                                </Select>
                                            ) : (
                                                camera.productType
                                            )}
                                        </Td>
                                        <Td>
                                            {editableCameraId === camera._id ? (
                                                <Select
                                                    value={editedCamera.plan || ''}
                                                    onChange={(e) => handleInputChange('plan', e.target.value)}
                                                >
                                                    <option value="LIVE">LIVE</option>
                                                    <option value="DVR-1">DVR-1</option>
                                                    <option value="DVR-3">DVR-3</option>
                                                    <option value="DVR-7">DVR-7</option>
                                                    <option value="DVR-15">DVR-15</option>
                                                    <option value="DVR-30">DVR-30</option>
                                                </Select>
                                            ) : (
                                                camera.plan
                                            )}
                                        </Td>
                                        <Td>
                                            {editableCameraId === camera._id ? (
                                                <Input
                                                    value={editedCamera.remotePortRtsp || ''}
                                                    onChange={(e) =>
                                                        handleInputChange('remotePortRtsp', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                camera.remotePortRtsp
                                            )}
                                        </Td>
                                        {role?.includes('admin') && (
                                            <Td textAlign="center" display={'flex'}>
                                                {
                                                    editableCameraId === camera._id ? (
                                                        <>
                                                            <Button variant="outline" onClick={handleSave} mr={1} color='#603eb7'>
                                                                <FaSave />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                colorScheme="red"
                                                                onClick={handleCancel}
                                                            >
                                                                <ImCross />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Box>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleEditClick(camera)}
                                                                color='#9678e1'
                                                                mr={1}
                                                            >
                                                                <MdEdit />
                                                            </Button>
                                                            <Button variant="outline" colorScheme="red" onClick={() => confirmDelete(camera.deviceId)}>
                                                                <MdDelete />
                                                            </Button>
                                                        </Box>
                                                    )
                                                }
                                            </Td>
                                        )}
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan="9" textAlign="center" borderColor="gray.300">
                                        No data available
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>

                    </Table>
                </TableContainer>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                    {currentPage}/{totalPages}
                    <Box>
                        <Button sx={{ marginRight: '5px' }} hidden={currentPage === 1} onClick={handlePrevClick} startIcon={<MdAdd />} >
                            {loadingPrev ? <CircularProgress isIndeterminate size={10} /> : 'Prev'}
                        </Button>
                        <Button hidden={currentPage === totalPages} onClick={handleNextClick} startIcon={<MdAdd />} >
                            {loadingNext ? <CircularProgress isIndeterminate size={10} /> : 'Next'}
                        </Button>
                    </Box>
                </div>
            </Box >
            <Modal
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
                        Add User
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
                                    onClick={handleDownloadSample} // <--- New function
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
                                //   padding="10px"
                                p={1}
                            >
                                <FormControl width="350px" mt={5}>
                                    <FormLabel
                                        htmlFor="device-name"
                                        textAlign="start"
                                    >
                                        Name:
                                    </FormLabel>
                                    <Input
                                        placeholder="Name"
                                        borderColor="gray"
                                        borderRadius="10px"
                                        px={4}
                                        _placeholder={{ color: "gray.400" }}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl width="350px" mt={5}>
                                    <FormLabel
                                        htmlFor="device-name"
                                        textAlign="start"
                                    >
                                        Email:
                                    </FormLabel>
                                    <Input
                                        placeholder="Email"
                                        borderColor="gray"
                                        borderRadius="10px"
                                        type='email'
                                        px={4}
                                        _placeholder={{ color: "gray.400" }}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl width="350px" mt={5}>
                                    <FormLabel
                                        htmlFor="device-name"
                                        textAlign="start"
                                    >
                                        DeviceId:
                                    </FormLabel>
                                    <Input
                                        placeholder="DeviceId"
                                        borderColor="gray"
                                        borderRadius="10px"
                                        px={4}
                                        _placeholder={{ color: "gray.400" }}
                                        value={deviceId}
                                        onChange={(e) => setDeviceId(e.target.value)}
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
                            onClick={() => (isUploadMode ? handleExcelUpload() : handleAddCamera())}
                            w="150px"
                            fontWeight={"normal"}
                        >
                            {isUploadMode ? "Upload File" : "Add Camera"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* <Modal isOpen={isOpen && activeModal === "Delete User Camera"} onClose={closeModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete this users camera?
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={confirmDelete}>
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal> */}
        </>
    );
}

export default UserCameraList;
