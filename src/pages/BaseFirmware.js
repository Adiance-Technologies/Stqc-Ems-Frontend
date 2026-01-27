// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import SessionTimeout from './SessionTimeout';
import {
    Box, Button, Checkbox, CheckboxGroup, CircularProgress, FormControl, FormLabel,
    Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, List, ListItem,
    Textarea,
    Flex,
    ModalCloseButton,
    Divider,
    Badge,
    SimpleGrid
} from '@chakra-ui/react';
import { toast, ToastContainer } from 'react-toastify';
import { MdAdd } from 'react-icons/md';
import { deleteEmsUser, getAllEmsUsers } from '../actions/adminActions';
import { BsEye } from 'react-icons/bs';
import * as XLSX from "xlsx";
import { downloadFirmwareById, getAllFirmware, uploadFirmware } from '../actions/versionActions';
import { DownloadIcon } from '@chakra-ui/icons';
import { FaNoteSticky } from 'react-icons/fa6';

const BaseFirmware = () => {
    const [data, setData] = useState([]);
    const [email, setEmail] = useState('')
    const [page, setPage] = useState(1);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeModal, setActiveModal] = useState(null);;
    const [selectedId, setSelectedId] = useState('');
    const [cameraName, setCameraName] = useState('');
    const [versionName, setVersionName] = useState("");
    const [binFile, setBinFile] = useState(null);
    const [romFile, setRomFile] = useState(null);
    const [releaseNotes, setReleaseNotes] = useState(null);

    const handleFileUpload = async () => {
        if (!cameraName || !versionName || !romFile || !releaseNotes) {
            alert("All fields and files are required!");
            return;
        }

        try {
            const data = await uploadFirmware(cameraName, versionName, binFile, romFile, releaseNotes);
            if (data.success) {
                alert("Firmware uploaded successfully!");
                closeModal();
                getConfig();
            } else {
                alert("Upload failed: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            alert("Something went wrong!");
        }
    };

    const getConfig = async (page) => {
        try {
            const response = await getAllFirmware(page, email);
            console.log('basefmw', response);
            setData(response.data);
            setTotalPages(response.totalPages);
            setResultPerPage(response.limit);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load');
            console.error('Error:', error);
        }
    };

    const handleDownload = async (id, type) => {
        try {
            const response = downloadFirmwareById(id, type);
            console.log('response', response);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load');
            console.error('Error:', error);
        }
    }


    useEffect(() => {
        getConfig();
    }, []);

    const openModal = (modal, id) => {
        setActiveModal(modal);
        setSelectedId(id);
        onOpen();
    }

    const closeModal = () => {
        setActiveModal(null);
        onClose();
    };

    // pagination code
    const [currentPage, setcurrentPage] = useState(1);
    const [loadingNext, setLoadingNext] = useState(false);
    const [loadingPrev, setLoadingPrev] = useState(false);
    const [prevButtonDisabled, setPrevButtonDisabled] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
    const [totalPages, setTotalPages] = useState();
    const [resultPerPage, setResultPerPage] = useState(5);
    // const [downloading, setDownloading] = useState(null);

    const handleNextClick = async () => {
        const nextPage = currentPage + 1;
        setLoadingNext(true);
        try {
            await getConfig(nextPage);
            setcurrentPage(nextPage);
        } finally {
            setLoadingNext(false);
        }
    };

    const handlePrevClick = async () => {
        const PrevPage = currentPage - 1;
        setLoadingPrev(true);
        try {
            await getConfig(PrevPage);
            setcurrentPage(PrevPage);
        } finally {
            setLoadingPrev(false);
        }
    };

    const [userIdToDelete, setUserIdToDelete] = useState(null);

    const confirmDelete = async () => {
        try {
            // const deleteAdmin = await deleteLead(userIdToDelete);
            getConfig();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            closeModal();
        }
    };

    useState(() => {
        setPrevButtonDisabled(currentPage === 1);
        setNextButtonDisabled(currentPage === totalPages);
    }, [currentPage, totalPages]);

    return (
        <>
            <Box p={8} mx={20} display={'flex'} flexDirection={'column'}>
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
                        BaseFirmware
                    </Text>
                </Box>

                <Stack direction={['column', 'row']} align="center" spacing={4} mb={1}>
                    <Stack direction={['column', 'row']} align="center" spacing={4}>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter Device ID"
                            size="md"
                            maxWidth="200px"
                            focusBorderColor="green.400"
                            _focus={{ boxShadow: 'none', borderColor: 'green.400' }}
                        />
                        <Button onClick={() => { getConfig(currentPage) }} colorScheme='blue' variant='outline' size='md'>
                            Search
                        </Button>
                    </Stack>
                    <Button onClick={() => openModal('Add Leads')} colorScheme='green' variant='outline' size='md'>
                        ADD
                    </Button>
                </Stack>

                <TableContainer boxShadow={"0px 5px 22px 0px rgba(0, 0, 0, 0.04)"} borderRadius="md">
                    <Table>
                        <Thead bg="gray.100">
                            <Tr>
                                <Th>Sr.No.</Th>
                                <Th>Camera Name</Th>
                                <Th>VersionNo</Th>
                                <Th>Date</Th>
                                <Th>ReleaseNotes</Th>
                                <Th>Download</Th>
                                {/* <Th>Customer</Th> */}
                                {/* <Th>Edit/Delete</Th> */}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {data?.map((user, index) => (
                                <Tr key={user._id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{user?.cameraName}</Td>
                                    <Td>{user?.versionName}</Td>
                                    <Td>{user?.uploadedAt.split('T')[0]}</Td>
                                    <Td>
                                        <Button onClick={() => handleDownload(user._id, 'releaseNotes')}>
                                            <FaNoteSticky />
                                        </Button>
                                    </Td>
                                    <Td>
                                        <Button onClick={() => handleDownload(user._id, 'firmware')}>
                                            <DownloadIcon />
                                        </Button>
                                    </Td>
                                    {/* <Td>{user?.versionName}</Td> */}
                                    {/* <Td>{user.customerType}</Td> */}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>

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
                </TableContainer>
            </Box>

            {/* Delete confirm (unchanged) */}
            {/* <Modal isOpen={isOpen && activeModal === "Add Leads"} onClose={closeModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Leads</ModalHeader>
                    <ModalBody>
                        <Flex>
                            <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
                            <Button onClick={handleSubmitMultiple}>Upload Data</Button>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={closeModal}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal> */}
            <Modal isOpen={isOpen && activeModal === "Add Leads"} onClose={closeModal} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Firmware</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={3}>
                            <FormLabel>Camera Name</FormLabel>
                            <Input
                                placeholder="Enter camera name"
                                value={cameraName}
                                onChange={(e) => setCameraName(e.target.value)}
                            />
                        </FormControl>

                        <FormControl mb={3}>
                            <FormLabel>Version Name</FormLabel>
                            <Input
                                placeholder="Enter version name"
                                value={versionName}
                                onChange={(e) => setVersionName(e.target.value)}
                            />
                        </FormControl>

                        <FormControl mb={3}>
                            <FormLabel>Upload .bin File</FormLabel>
                            <Input
                                type="file"
                                // accept=".bin"
                                onChange={(e) => setBinFile(e.target.files[0])}
                            />
                        </FormControl>

                        <FormControl mb={3}>
                            <FormLabel>Upload .rom File</FormLabel>
                            <Input
                                type="file"
                                // accept=".rom"
                                onChange={(e) => setRomFile(e.target.files[0])}
                            />
                        </FormControl>

                        <FormControl mb={3}>
                            <FormLabel>Upload Release Notes (.txt)</FormLabel>
                            <Input
                                type="file"
                                accept=".txt"
                                onChange={(e) => setReleaseNotes(e.target.files[0])}
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleFileUpload}>
                            Submit
                        </Button>
                        <Button onClick={closeModal}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* <Modal isOpen={isOpen && activeModal === "Delete User"} onClose={closeModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalBody>Are you sure you want to delete this user?</ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={closeModal}>Cancel</Button>
                        <Button colorScheme="red" onClick={confirmDelete}>Delete</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal> */}
        </>
    );
}

export default BaseFirmware;
