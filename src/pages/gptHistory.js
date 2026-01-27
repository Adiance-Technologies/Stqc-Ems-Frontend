// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import SessionTimeout from './SessionTimeout';
import { Box, Button, Checkbox, CircularProgress, FormControl, FormLabel, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import { addMultiP2pCamera, addP2pCamera, getMqttMaster, getP2pCameras } from '../actions/cameraActions';
import { Link } from 'react-router-dom';
import { FaArrowUpRightFromSquare, FaRegCircle } from "react-icons/fa6";
import { toast, ToastContainer } from 'react-toastify';
import { FaRegDotCircle, FaSort } from "react-icons/fa";
import { MdAdd, MdError } from 'react-icons/md';
import { handleGetChatgptPrompt, handleUpdateChatgptReaction } from '../actions/adminActions';
import { AiFillLike, AiOutlineLike, AiFillDislike, AiOutlineDislike } from 'react-icons/ai';

const GptHistory = () => {

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

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const getConfig = async (page) => {
        // console.log("checking", page, querySearch);
        try {
            const response = await handleGetChatgptPrompt(page);
            console.log("getP2pCameras", response);
            setCameraa(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            toast.error(error.response.data.message);
            console.error('Error:', error);
            // navigate('/404');
        }
    };
    useEffect(() => {
        getConfig();
    }, []);

    const handleReaction = async (id, reaction) => {
        try {
            const response = await handleUpdateChatgptReaction(id, reaction);
            console.log("update reaction", response);
            getConfig(page);
        } catch (error) {
            toast.error(error.response.data.message);
            console.error('Error:', error);
            // navigate('/404');
        }
    };

    // const openModal = (modal, cameraId, cameraName) => {
    //     // console.log("cameraId");
    //     setActiveModal(modal);
    //     // setSelectedCameraId(cameraId);
    //     // setSelectedCameraName(cameraName);
    //     onOpen();
    // };

    // const closeModal = () => {
    //     setActiveModal(null);
    //     // setActiveTab("General");
    //     onClose();
    // };

    // const handleAddCamera = async () => {
    //     if (!cameraType || !deviceId) {
    //         setError("Device ID is required!");
    //         setUploadStatus('Please provide a device ID.');
    //         return;
    //     }

    //     const formData = new FormData();
    //     formData.append('deviceId', deviceId);
    //     formData.append('productType', cameraType);
    //     formData.append('isPTZ', isPtz);

    //     if (cameraType === 'vod') {
    //         // Check if the file size exceeds 30MB (30MB = 31457280 bytes)
    //         const MAX_SIZE = 30 * 1024 * 1024; // 30MB in bytes
    //         if (!file) {
    //             setUploadStatus('Please upload a file.');
    //             return;
    //         }

    //         if (file.size > MAX_SIZE) {
    //             setUploadStatus('The file size exceeds the 30MB limit.');
    //             return;
    //         }

    //         formData.append('video', file);
    //     }

    //     // Debugging FormData
    //     for (const [key, value] of formData.entries()) {
    //         // console.log(`${key}:`, value);
    //     }

    //     try {
    //         console.log("formDataaaa");
    //         const response = await addP2pCamera(formData);
    //         toast.success(response.data.message);
    //         closeModal();
    //         // console.log("response", response);
    //     } catch (error) {
    //         console.error("Error:", error.response?.data || error.message);
    //         toast.error(error.response?.data?.message || error.message);
    //     }
    // };

    // // const [status, setStatus] = useState("offline"); // Default to offline

    // const handleStatusSort = async () => {
    //     const newStatus = status === "offline" ? "online" : "offline"; // Toggle between online & offline
    //     console.log("newStatus", newStatus);
    //     try {
    //         await getConfig(page, querySearch, newStatus, order); // Fetch cameras with new status
    //         setStatus(newStatus); // Update status for the next click
    //     } catch (error) {
    //         console.error("Error fetching cameras:", error);
    //     }
    // };

    // const handleOrderSort = async () => {
    //     const newOrder = order === "asc" ? "desc" : "asc";
    //     try {
    //         await getConfig(page, querySearch, status, newOrder);
    //         setOrder(newOrder);
    //     } catch (error) {
    //         console.error("Error fetching cameras:", error);
    //     }
    // };


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
            await getConfig(nextPage);
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

    const [expandedRows, setExpandedRows] = useState({});

    const toggleRowExpansion = (index) => {
        setExpandedRows((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
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
                        GPT History
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
                    {/* <Button
                        onClick={() => openModal('Add Camera')}
                        colorScheme='green'
                        variant='outline'
                        size='md' // Changed to 'md' for better alignment
                    >
                        ADD
                    </Button> */}
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
                    <Table>
                        <Thead bg="gray.100">
                            <Tr>
                                <Th>Sr.No.</Th>
                                <Th>User Name</Th>
                                <Th>Query</Th>
                                <Th>Answer</Th>
                                <Th>Video Urls</Th>
                                <Th>Reaction</Th>
                                <Th>Date & Time</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {cameraa.map((camera, index) => {
                                const isExpanded = expandedRows[index];
                                const answerPreview = isExpanded
                                    ? camera.answer
                                    : camera.answer.split(' ').slice(0, 4).join(' ') + '...';

                                return (
                                    <Tr key={index}>
                                        <Td>{index + 1 + (currentPage - 1) * resultPerPage}</Td>
                                        <Td>{camera.userName}</Td>
                                        <Td style={{ minWidth: '200px', whiteSpace: 'normal' }}>
                                            {camera.question}
                                        </Td>
                                        <Td style={{ minWidth: '300px', whiteSpace: 'normal' }}>
                                            {answerPreview}
                                            <button
                                                onClick={() => toggleRowExpansion(index)}
                                                style={{
                                                    marginLeft: '5px',
                                                    color: 'blue',
                                                    textDecoration: 'underline',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {isExpanded ? 'See Less' : 'See More'}
                                            </button>
                                        </Td>

                                        <Td>
                                            {/* <Button> */}
                                            {camera.videoUrls ? (
                                                <Button onClick={() => (window.open(`https://media.arcisai.io:5080/mp4/${camera.videoUrls}`, '_blank'))}>
                                                    Video Url
                                                </Button>
                                            ) : ('-')}
                                            {/* </Button> */}
                                        </Td>
                                        <Td>
                                            <button
                                                onClick={() => handleReaction(camera._id, 'like')}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    marginRight: '8px',
                                                    color: camera.reaction === 'like' ? 'green' : 'gray',
                                                    scale: '1.2',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        animation: camera.reaction === 'like' ? 'bounce-in 0.5s ease' : '', // Animation for like only
                                                    }}
                                                >
                                                    {camera.reaction === 'like' ? <AiFillLike /> : <AiOutlineLike />}
                                                </span>
                                            </button>

                                            <button
                                                onClick={() => handleReaction(camera._id, 'dislike')}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    color: camera.reaction === 'dislike' ? 'red' : 'gray',
                                                    scale: '1.2',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        animation: camera.reaction === 'dislike' ? 'bounce-in 0.5s ease' : '', // Animation for dislike only
                                                    }}
                                                >
                                                    {camera.reaction === 'dislike' ? <AiFillDislike /> : <AiOutlineDislike />}
                                                </span>
                                            </button>
                                            
                                            <button
                                                onClick={() => handleReaction(camera._id, 'neutral')}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    color: camera.reaction === 'neutral' ? 'orange' : 'gray',
                                                    scale: '1.2',
                                                    marginLeft: '8px',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        animation: camera.reaction === 'neutral' ? 'bounce-in 0.5s ease' : '', // Animation for neutral only
                                                    }}
                                                >
                                                    {camera.reaction === 'neutral' ? <FaRegDotCircle /> : <FaRegCircle />}
                                                </span>
                                            </button>

                                        </Td>
                                        <Td>{camera.queryDate}{" - "}{camera.queryTime}</Td>
                                    </Tr>
                                );
                            })}
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
        </>
    );
}

export default GptHistory;
