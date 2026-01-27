import React, { useState, useEffect } from 'react';
import SessionTimeout from './SessionTimeout';
import { Box, Button, Checkbox, CircularProgress, Flex, FormControl, FormLabel, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import { toast, ToastContainer } from 'react-toastify';
import { CameraList, checkOtaStatus, releaseFirmware, setOta } from '../actions/OtaActions';
import { MdAdd } from 'react-icons/md';

const OtaPage = () => {

    const isMobile = useBreakpointValue({ base: true, md: false });
    const [cameraList, setCameraList] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loadingNext, setLoadingNext] = useState(false);
    const [loadingPrev, setLoadingPrev] = useState(false);
    // Check Update Functionality
    const [checkStatus, setCheckStatus] = useState('');
    const [updateMessage, setUpdateMessage] = useState(null);
    const [readyToUpdate, setReadyToUpdate] = useState(false);
    // Modal States
    const [activeModal, setActiveModal] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [productType, setProductType] = useState('');
    const [firmwareVersion, setFirmwareVersion] = useState('');
    const [description, setDescription] = useState('');

    // releaseFirmware code
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLatest, setIsLatest] = useState(true); // Default to true

    // fetch api

    const fetchOtaCameraList = async () => {
        const response = await CameraList(currentPage, search);
        setCameraList(response.data);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
    }

    const handleCheckOtaStatus = async (deviceId) => {
        try {
            const response = await checkOtaStatus(deviceId);
            setCheckStatus(deviceId);
            if (response.data.data === 'version up to date') {
                setReadyToUpdate(false);
                setUpdateMessage(response.data.data);
            } else if (response.data.data === 'update available') {
                setReadyToUpdate(true);
            } else {
                setUpdateMessage('Error checking update status');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleUpdate = async (deviceId) => {
        try {
            const response = await setOta(deviceId);
            setCheckStatus('');
            if (response.data === 'Please insert SD card! SD card needed') {
                toast.error(response.data);
            } else {
                toast.success(response.data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }


    const handleFirmwareRelease = async () => {
        if (!selectedFile) {
            toast.error("Please upload a firmware file");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('productType', productType);
            formData.append('firmware', firmwareVersion);
            formData.append('description', description);
            formData.append('isLatest', isLatest);
            formData.append('file', selectedFile);

            const response = await releaseFirmware(formData);

            if (response.success) {
                fetchOtaCameraList(currentPage, search);
                toast.success('Firmware released successfully');
                closeModal();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Something went wrong");
        }
    };
    // const handleFirmwareRelease = async () => {
    //     try {
    //         const response = await releaseFirmware(productType, firmwareVersion, description);
    //         fetchOtaCameraList(currentPage, search);
    //         toast.success('Firmware released successfully');
    //         closeModal();
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }

    // pagination code

    // const handleCheckOtaStatus = async (deviceId) => {
    //     setCheckingUpdate(true); // Indicate that the check is in progress
    //     try {
    //         const response = await checkOtaStatus(deviceId);
    //         console.log('response', response);

    //         if (response.status === 200) {
    //             setHasUpdate(false); // No update available
    //             setUpdateMessage(response.data.data); // Show message for up-to-date version
    //         } else if (response.status === 201) {
    //             setHasUpdate(true); // Update available
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         setUpdateMessage('Error checking update.');
    //     } finally {
    //         setCheckingUpdate(false); // End the checking process
    //     }
    // };

    const handleSearch = async () => {
        try {
            fetchOtaCameraList(1, search);
            setCheckStatus('');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleNextClick = async () => {

        const nextPage = currentPage + 1;
        setLoadingNext(true); // Show loading spinner
        try {
            await fetchOtaCameraList(nextPage, search);
            setCurrentPage(nextPage);
            // console.log(currentPage);

        } finally {
            setLoadingNext(false); // Hide loading spinner
        }

    };

    const handlePrevClick = async () => {

        const PrevPage = currentPage - 1;
        setLoadingPrev(true); // Show loading spinner
        try {
            await fetchOtaCameraList(PrevPage, search);
            setCurrentPage(PrevPage);
        } finally {
            setLoadingPrev(false); // Hide loading spinner
        }
    };

    // Modal Code

    const openModal = (modal) => {
        // console.log("cameraId");
        setActiveModal(modal);
        onOpen();
    };

    const closeModal = () => {
        setActiveModal(null);
        // setActiveTab("General");
        onClose();
    };

    useEffect(() => {
        fetchOtaCameraList();
    }, [checkStatus, currentPage]);

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
                        Ota List
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
                            // value={deviceId}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Enter Device ID"
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
                            onClick={() => handleSearch()}
                            colorScheme='blue'
                            variant='outline'
                            mr={2}
                            size='md' // Changed to 'md' for better alignment
                        >
                            Search
                        </Button>
                        <Button
                            onClick={() => openModal('Release')}
                            colorScheme='green'
                            variant='outline'
                            size='md' // Changed to 'md' for better alignment
                        >
                            Release
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
                                <Th>Device ID</Th>
                                <Th>Product Type</Th>
                                <Th>Current Firmware</Th>
                                <Th>Latest Firmware</Th>
                                <Th>Status</Th>
                                <Th>Check Update</Th>
                            </Tr>
                        </Thead>
                        <Tbody>

                            {/* ( */}
                            {cameraList ? (
                                cameraList.map((camera, index) => (
                                    <Tr key={camera._id}>
                                        <Td>{index + 1}</Td>
                                        <Td>{camera.deviceId}</Td>
                                        <Td>{camera.productType}</Td>
                                        <Td>{camera.currentFirmware}</Td>
                                        <Td>{camera.firmware}</Td>
                                        <Td color={camera.status === 'online' ? 'green' : 'red'}>{camera.status}</Td>
                                        <Td>
                                            {checkStatus === camera.deviceId ? (
                                                readyToUpdate ? (
                                                    <Button
                                                        variant={'outline'}
                                                        onClick={() => handleUpdate(camera.deviceId)}
                                                    >
                                                        Update
                                                    </Button>
                                                ) : (
                                                    <Text>{updateMessage}</Text>
                                                )
                                            ) : (
                                                <Button
                                                    variant={'outline'}
                                                    onClick={() => handleCheckOtaStatus(camera.deviceId)}>
                                                    Check
                                                </Button>
                                            )}
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Box w={'full'}>
                                    <Flex>
                                        <Text>No Data Available</Text>
                                    </Flex>
                                </Box>
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

                {/* Modals */}
                <Modal
                    onClose={onClose}
                    isOpen={isOpen && activeModal === "Release"}
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
                        >
                            Release Firmware
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
                                    <FormLabel htmlFor="product-type" textAlign="start">
                                        Product Type:
                                    </FormLabel>
                                    <Select
                                        placeholder="Select"
                                        borderColor="gray"
                                        borderRadius="10px"
                                        // px={4}
                                        value={productType}
                                        onChange={(e) => setProductType(e.target.value)}
                                    >
                                        <option value="PTZ_S_Series">PTZ_S_Series</option>
                                        <option value="VSPL">VSPL</option>
                                        <option value="Augentix">Augentix</option>
                                    </Select>
                                </FormControl>
                                <FormControl width="350px" mt={5}>
                                    <FormLabel htmlFor="email" textAlign="start">
                                        Firmware Version:
                                    </FormLabel>
                                    <Input
                                        placeholder="Firmware Version"
                                        borderColor="gray"
                                        borderRadius="10px"
                                        type="email"
                                        px={4}
                                        _placeholder={{ color: "gray.400" }}
                                        value={firmwareVersion}
                                        onChange={(e) => setFirmwareVersion(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl width="350px" mt={5}>
                                    <FormLabel htmlFor="device-id" textAlign="start">
                                        Description:
                                    </FormLabel>
                                    <Input
                                        placeholder="Description"
                                        borderColor="gray"
                                        borderRadius="10px"
                                        px={4}
                                        _placeholder={{ color: "gray.400" }}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl width="350px" mt={5}>
                                    <FormLabel textAlign="start">Firmware File (.tar.gz):</FormLabel>
                                    <Input
                                        type="file"
                                        p={1}
                                        borderColor="gray"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                    />
                                </FormControl>

                                <FormControl display="flex" alignItems="center" width="350px" mt={5}>
                                    <FormLabel mb="0">Set as Latest Firmware?</FormLabel>
                                    <Checkbox
                                        isChecked={isLatest}
                                        onChange={(e) => setIsLatest(e.target.checked)}
                                        colorScheme="blue"
                                    />
                                </FormControl>

                            </Box>
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
                                onClick={() => handleFirmwareRelease()}
                                w="150px"
                                fontWeight={"normal"}
                            >
                                Release
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </>
    );
}

export default OtaPage;
