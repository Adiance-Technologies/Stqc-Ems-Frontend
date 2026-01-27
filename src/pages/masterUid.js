import {
    Box, Button, Checkbox, CircularProgress, FormControl, FormLabel, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr, VStack, useBreakpointValue, useDisclosure, useToast
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { generateDeviceId, getAllDeviceIds } from '../actions/cameraActions';
import { Form } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';

const MasterUid = () => {
    const toast = useToast();
    const [deviceId, setDeviceId] = useState('');
    const [deviceIds, setDeviceIds] = useState('');
    const [certFile, setCertFile] = useState(null);
    const [keyFile, setKeyFile] = useState(null);
    const [deviceList, setDeviceList] = useState([]);
    const [isBurned, setIsBurned] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [networkType, setNetworkType] = useState('');
    const [productType, setProductType] = useState('');
    const [count, setCount] = useState(0);

    const handleCheckboxChange = async (e) => {
        const checked = e.target.checked;
        setIsBurned(checked);
        fetchData(currentPage, deviceId, !isBurned);
    }

    const fetchData = async (page, deviceId, isBurned) => {
        try {
            // const res = await axios.get('http://localhost:5000/api/camera/getAllDeviceIds');
            const res = await getAllDeviceIds(page, deviceId, isBurned);
            console.log('naitik', res);
            setDeviceList(res.data.data)
            setTotalPages(res.data.totalPages);
            setTotalItems(res.data.totalRecords);
            currentPage(res.data.currentPage);
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // pagination code

    const [currentPage, setcurrentPage] = useState(1);
    const [loadingNext, setLoadingNext] = useState(false);
    const [loadingPrev, setLoadingPrev] = useState(false);
    const [prevButtonDisabled, setPrevButtonDisabled] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const handleNextClick = async () => {

        const nextPage = currentPage + 1;
        setLoadingNext(true); // Show loading spinner
        try {
            await fetchData(nextPage);
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
            await fetchData(PrevPage);
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

    const handleGenerateUIDs = async () => {
        try {
            const response = await generateDeviceId(networkType, productType, count);
            toast({ title: 'UIDs generated successfully', status: 'success' });
            setActiveModal(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    }

    const handleUpload = async () => {
        if (!certFile || !keyFile || !deviceIds) {
            toast({ title: 'All fields required', status: 'error' });
            return;
        }

        const formData = new FormData();
        formData.append('deviceIds', JSON.stringify(deviceIds.split(',')));
        formData.append('cert', certFile);
        formData.append('key', keyFile);

        try {
            const res = await axios.post('http://localhost:5000/api/batches', formData);
            toast({ title: 'Upload successful', status: 'success' });
            console.log(res.data);
        } catch (err) {
            toast({ title: 'Upload failed', status: 'error' });
            console.error(err);
        }
    };

    const isMobile = useBreakpointValue({ base: true, md: false });

    const [activeModal, setActiveModal] = useState(null);
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

    return (
        <>
            <Box p={8} mx={isMobile ? 0 : 20} display={'flex'} flexDirection={'column'}>
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
                        Master List
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
                        onClick={() => { fetchData(1, deviceId) }}
                        colorScheme='blue'
                        variant='outline'
                        size='md' // Changed to 'md' for better alignment
                    >
                        Search
                    </Button>

                    <Button
                        onClick={() => openModal('Generate UIDs')}
                        colorScheme='green'
                        variant='outline'
                        size='md' // Changed to 'md' for better alignment
                    >
                        ADD
                    </Button>

                    <Checkbox
                        isChecked={isBurned}
                        onChange={handleCheckboxChange}
                        colorScheme="red"
                        size="lg"
                    >
                        Burned
                    </Checkbox>

                </Stack>
                {/* <Box p={8} maxW="lg" mx="auto" mt={10} borderWidth={1} borderRadius="lg">
                <VStack spacing={4}>
                    <Input
                        placeholder="Device IDs (comma separated)"
                        value={deviceIds}
                        onChange={(e) => setDeviceIds(e.target.value)}
                    />
                    <Input type="file" onChange={(e) => setCertFile(e.target.files[0])} />
                    <Input type="file" onChange={(e) => setKeyFile(e.target.files[0])} />
                    <Button colorScheme="blue" onClick={handleUpload}>Upload</Button>
                </VStack>
            </Box> */}
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
                    <Table variant="simple">
                        {/* <TableCaption>Uploaded Devices</TableCaption> */}
                        <Thead bg="gray.100">
                            <Tr>
                                <Th>Device ID</Th>
                                <Th>Mac/Wifi-Mac</Th>
                                <Th>Product Type</Th>
                                <Th>Network Type</Th>
                                <Th>Burned</Th>
                                <Th>Timestamp</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {deviceList.map((device) => (
                                <Tr key={device.deviceId}>
                                    <Td>{device.deviceId}</Td>
                                    <Td>{device.macAddr}/{device.macWifiAddr}</Td>
                                    <Td>{device.productType}</Td>
                                    <Td>{device.networkType}</Td>
                                    <Td>
                                        <input
                                            type="checkbox"
                                            checked={device.burned}
                                            readOnly // Prevents editing if you just want to display status
                                        />
                                    </Td>
                                    <Td>{new Date(device.createdAt).toLocaleString()}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
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
                </TableContainer>
                <Box>
                    Total Items: {totalItems}
                </Box>

            </Box >

            <Modal
                onClose={onClose}
                isOpen={isOpen && activeModal === "Generate UIDs"}
                isCentered
                size={"lg"}
            >
                <ModalOverlay />
                <ModalContent color={"black"}>
                    <ModalHeader textAlign={"center"} p={1} mt={4}>
                        Generate UIDs
                    </ModalHeader>
                    <ModalBody pb={6} textAlign="center">

                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            width="100%"
                            p={1}
                        >
                            {/* <Box width="350px" textAlign={'start'}>
                                {error && <Text color="red.500">{error}</Text>}
                            </Box> */}
                            <FormControl width="350px" mt={5}>
                                <FormLabel htmlFor="camera-type" textAlign="start">
                                    Product Type:
                                </FormLabel>
                                <Select
                                    id="camera-type"
                                    placeholder="Select Camera Type"
                                    borderColor="gray"
                                    borderRadius="10px"
                                    value={productType}
                                    onChange={(e) => setProductType(e.target.value)}
                                >
                                    <option value="S-Series">S-Series</option>
                                    <option value="A-Series">A-Series</option>
                                    <option value="Novatek">Novatek</option>
                                    <option value="Innofusion">Innofusion</option>
                                </Select>
                            </FormControl>

                            <FormControl width="350px" mt={5}>
                                <FormLabel htmlFor="camera-type" textAlign="start">
                                    Network Type:
                                </FormLabel>
                                <Select
                                    id="camera-type"
                                    placeholder="Select Camera Type"
                                    borderColor="gray"
                                    borderRadius="10px"
                                    value={networkType}
                                    onChange={(e) => setNetworkType(e.target.value)}
                                >
                                    <option value="POE">POE</option>
                                    <option value="WIFI">WIFI</option>
                                    <option value="4G">4G</option>
                                    <option value="5G">5G</option>
                                </Select>
                            </FormControl>
                            <FormControl width="350px" mt={5}>
                                <FormLabel htmlFor="camera-type" textAlign="start">
                                    Count:
                                </FormLabel>
                                <Input type='String' placeholder='Enter Camera Type' borderColor="gray" borderRadius="10px" value={count} onChange={(e) => setCount(e.target.value)} />
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
                            onClick={() => (handleGenerateUIDs())}
                            w="150px"
                            fontWeight={"normal"}
                        >
                            Generate
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default MasterUid;
