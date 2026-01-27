// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import SessionTimeout from './SessionTimeout';
import { Box, Button, Checkbox, CheckboxGroup, CircularProgress, FormControl, FormLabel, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useDisclosure } from '@chakra-ui/react';
import { addP2pCamera, getP2pCameras } from '../actions/cameraActions';
import { Link } from 'react-router-dom';
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { toast, ToastContainer } from 'react-toastify';
import { FaSort } from "react-icons/fa";
import { MdAdd, MdError } from 'react-icons/md';
import { createUser, deleteEmsUser, deleteUser, getAllEmsUsers, getAllUsers, updateEmsUser } from '../actions/adminActions';
import Multiselect from "multiselect-react-dropdown";
import { createEmsUser } from '../actions/userActions';
// import { getDepartments } from '../actions/departmentActions';

// const roleOptions = [
//     { value: "admin", label: "Admin" },
//     { value: "user", label: "User" },
//     { value: "Godown", label: "Godown" },
// ];

const UserManagementEms = () => {

    const [users, setUsers] = useState([]);
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [querySearch, setQuerySearch] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [department, setDepartment] = useState('');
    const [designation, setDesignation] = useState('');
    const [page, setPage] = useState(1);
    const [resultPerPage, setResultPerPage] = useState(5);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeModal, setActiveModal] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [input, setInput] = useState(null);
    const [file, setFile] = useState(null);

    const [editableUserId, setEditableUserId] = useState(null);
    const [roleOptions] = useState(["view", "admin", "user", "Godown", "itsupport", "sales"]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [errors, setErrors] = useState({});

    const handleEdit = (user) => {
        setEditableUserId(user._id);
        setSelectedRoles(user.role);
    };

    const getConfig = async (page, input) => {
        try {
            const response = await getAllEmsUsers(page, input);
            // Ensure users is always an array, even if response.data is undefined/null
            setUsers(Array.isArray(response.data) ? response.data : []);
            console.log('response', response.data);
            setTotalPages(response.totalPages || 1);
            setResultPerPage(response.limit || resultPerPage);
        } catch (error) {
            // Set users to empty array on error to prevent map errors
            setUsers([]);
            const errorMessage = error?.response?.data?.message || 'An error occurred while fetching users';
            toast.error(errorMessage);
            console.error('Error:', error);
            // navigate('/404');
        }
    };

    const handleUpdateUser = async (id) => {
        try {
            const response = await updateEmsUser(selectedRoles, id);
            setEditableUserId(null);
            getConfig(currentPage, input);
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    useEffect(() => {
        getConfig(1, '');
    }, []);

    const openModal = (modal, id, cameraName) => {
        // console.log("cameraId");
        setActiveModal(modal);
        setUserIdToDelete(id);
        // setSelectedCameraId(cameraId);
        // setSelectedCameraName(cameraName);
        if (modal === 'Add Camera') {
            // Reset form when opening Add User modal
            setName('');
            setEmail('');
            setMobile('');
            setPassword('');
            setEmployeeId('');
            setDepartment('');
            setDesignation('');
            setErrors({});
        }
        onOpen();
    };

    const closeModal = () => {
        setActiveModal(null);
        // setActiveTab("General");
        onClose();
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
            await getConfig(nextPage, input);
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
            await getConfig(PrevPage, input);
            setcurrentPage(PrevPage);
        } finally {
            setLoadingPrev(false); // Hide loading spinner
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!name || name.trim() === '') {
            newErrors.name = 'Name is required';
        }

        if (!email || email.trim() === '') {
            newErrors.email = 'Email is required';
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!mobile || mobile.trim() === '') {
            newErrors.mobile = 'Mobile number is required';
        }

        if (!password || password.trim() === '') {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        if (!employeeId || employeeId.trim() === '') {
            newErrors.employeeId = 'Employee ID is required';
        }

        if (!department || department.trim() === '') {
            newErrors.department = 'Department is required';
        }

        if (!designation || designation.trim() === '') {
            newErrors.designation = 'Designation is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddUser = async () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            const addUser = await createEmsUser(name, email, mobile, password, employeeId, department, designation);
            if (addUser.success) {
                toast.success('User created successfully');
                // Reset form
                setName('');
                setEmail('');
                setMobile('');
                setPassword('');
                setEmployeeId('');
                setDepartment('');
                setDesignation('');
                setErrors({});
                closeModal();
                getConfig(1, '');
            } else {
                toast.error(addUser.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred while creating user');
        }
    }

    // const handleDeleteUser = async (id) => {
    //     try {
    //         const response = await deleteUser(id);
    //         getConfig();
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const confirmDelete = async () => {
        try {
            const deleteAdmin = await deleteEmsUser(userIdToDelete);
            getConfig(currentPage, input); // Refresh data after deletion
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete user');
        } finally {
            closeModal();
        }
    };

    useState(() => {
        setPrevButtonDisabled(currentPage === 1);
        setNextButtonDisabled(currentPage === totalPages);
        // fetchCameraList(currentPage);
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
                        User Management Ems
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
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter Name/Email"
                        size="md"
                        maxWidth="200px"
                        focusBorderColor="green.400" // Custom border color on focus
                        _focus={{
                            boxShadow: 'none', // Remove default shadow
                            borderColor: 'green.400', // Custom border color on focus
                        }}
                    />
                    <Button
                        onClick={() => {
                            setcurrentPage(1);
                            getConfig(1, input);
                        }}
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
                    borderRadius="md">
                    <Table>
                        {/* <TableCaption>Your Installed Camera List</TableCaption> */}
                        <Thead bg="gray.100">
                            <Tr>
                                <Th>Sr.No.</Th>
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Mob.</Th>
                                <Th>Role</Th>
                                <Th>Edit/Delete</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {Array.isArray(users) && users.length > 0 ? (
                                users.map((user, index) => (
                                    <Tr key={user._id}>
                                        <Td>{index + 1}</Td>
                                        <Td>{user.name}</Td>
                                        <Td>{user.email}</Td>
                                        <Td>{user.mobile}</Td>
                                        <Td>
                                            {editableUserId === user._id ? (
                                                <Multiselect
                                                    isObject={false}
                                                    options={roleOptions}
                                                    selectedValues={selectedRoles}
                                                    onSelect={(selected) => setSelectedRoles(selected)}
                                                    onRemove={(selected) => setSelectedRoles(selected)}
                                                    placeholder="Select Roles"
                                                    style={{
                                                        chips: { background: "#3182CE" },
                                                        searchBox: { border: "1px solid #ccc", borderRadius: "5px" }
                                                    }}
                                                />
                                            ) : (
                                                user.role && Array.isArray(user.role) ? user.role.join(", ") : "N/A"
                                            )}
                                        </Td>
                                        <Td textAlign="center" display={'flex'} gap={2}>
                                            {editableUserId === user._id ? (
                                                <Button
                                                    variant="outline"
                                                    colorScheme="green"
                                                    onClick={() => {
                                                        handleUpdateUser(user._id)
                                                    }}
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    colorScheme="blue"
                                                    onClick={() => {
                                                        setEditableUserId(user._id);
                                                        setSelectedRoles(user.role || []); // pre-select user's roles
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            )}

                                            <Button
                                                variant={'outline'}
                                                colorScheme="red"
                                                onClick={() => openModal('Delete User', user._id)}
                                            >
                                                Delete
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan={6} textAlign="center" py={8}>
                                        <Text color="gray.500">No users found</Text>
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>

                    {/* <Table border="1px solid #ddd">
                        <Thead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Mobile</Th>
                                <Th>Role</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users.map((user, index) => (
                                <Tr key={user._id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{user.name}</Td>
                                    <Td>{user.email}</Td>
                                    <Td>{user.mobile}</Td>
                                    <Td>
                                        {editableUserId === user._id ? (
                                            <Multiselect
                                                isObject={false}
                                                options={roleOptions}
                                                selectedValues={selectedRoles}
                                                onSelect={(selected) => setSelectedRoles(selected)}
                                                onRemove={(selected) => setSelectedRoles(selected)}
                                                placeholder="Select Roles"
                                                style={{
                                                    chips: { background: "#3182CE" },
                                                    searchBox: { border: "1px solid #ccc", borderRadius: "5px" }
                                                }}
                                            />
                                        ) : (
                                            user.role.join(", ")
                                        )}
                                    </Td>
                                    <Td textAlign="center" display={'flex'} gap={2}>
                                        {editableUserId === user._id ? (
                                            <Button
                                                variant="outline"
                                                colorScheme="green"
                                                onClick={() => {
                                                    // handleSaveRoles(user._id, selectedRoles);
                                                    setEditableUserId(null);
                                                }}
                                            >
                                                Save
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                colorScheme="blue"
                                                onClick={() => {
                                                    setEditableUserId(user._id);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        )}

                                        <Button
                                            variant={'outline'}
                                            colorScheme="red"
                                            onClick={() => openModal('Delete User', user._id)}
                                        >
                                            Delete
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table> */}


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

            </Box >
            <Modal
                onClose={onClose}
                isOpen={isOpen && activeModal === "Add Camera"}
                isCentered
                size={"lg"}
            >
                <ModalOverlay />
                <ModalContent color={"black"}>
                    <ModalHeader textAlign={"center"} p={1} mt={4}>
                        Add User
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
                            {/* Name */}
                            <FormControl width="350px" mt={5} isInvalid={errors.name}>
                                <FormLabel textAlign="start">
                                    Name: <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <Input
                                    placeholder="Name"
                                    borderColor={errors.name ? "red.500" : "gray"}
                                    borderRadius="10px"
                                    px={4}
                                    _placeholder={{ color: "gray.400" }}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) {
                                            setErrors({ ...errors, name: '' });
                                        }
                                    }}
                                />
                                {errors.name && (
                                    <Text color="red.500" fontSize="sm" mt={1}>{errors.name}</Text>
                                )}
                            </FormControl>

                            {/* Email */}
                            <FormControl width="350px" mt={5} isInvalid={errors.email}>
                                <FormLabel textAlign="start">
                                    Email: <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <Input
                                    placeholder="Email"
                                    borderColor={errors.email ? "red.500" : "gray"}
                                    borderRadius="10px"
                                    type="email"
                                    px={4}
                                    _placeholder={{ color: "gray.400" }}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) {
                                            setErrors({ ...errors, email: '' });
                                        }
                                    }}
                                />
                                {errors.email && (
                                    <Text color="red.500" fontSize="sm" mt={1}>{errors.email}</Text>
                                )}
                            </FormControl>

                            {/* Mobile */}
                            <FormControl width="350px" mt={5} isInvalid={errors.mobile}>
                                <FormLabel textAlign="start">
                                    Mobile: <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <Input
                                    placeholder="Mobile"
                                    borderColor={errors.mobile ? "red.500" : "gray"}
                                    borderRadius="10px"
                                    type="number"
                                    px={4}
                                    _placeholder={{ color: "gray.400" }}
                                    value={mobile}
                                    onChange={(e) => {
                                        setMobile(e.target.value);
                                        if (errors.mobile) {
                                            setErrors({ ...errors, mobile: '' });
                                        }
                                    }}
                                />
                                {errors.mobile && (
                                    <Text color="red.500" fontSize="sm" mt={1}>{errors.mobile}</Text>
                                )}
                            </FormControl>

                            {/* Password */}
                            <FormControl width="350px" mt={5} isInvalid={errors.password}>
                                <FormLabel textAlign="start">
                                    Password: <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <Input
                                    placeholder="Password"
                                    borderColor={errors.password ? "red.500" : "gray"}
                                    type="password"
                                    borderRadius="10px"
                                    px={4}
                                    _placeholder={{ color: "gray.400" }}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) {
                                            setErrors({ ...errors, password: '' });
                                        }
                                    }}
                                />
                                {errors.password && (
                                    <Text color="red.500" fontSize="sm" mt={1}>{errors.password}</Text>
                                )}
                            </FormControl>

                            {/* Employee ID */}
                            <FormControl width="350px" mt={5} isInvalid={errors.employeeId}>
                                <FormLabel textAlign="start">
                                    Employee ID: <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <Input
                                    placeholder="Employee ID"
                                    borderColor={errors.employeeId ? "red.500" : "gray"}
                                    borderRadius="10px"
                                    px={4}
                                    _placeholder={{ color: "gray.400" }}
                                    value={employeeId}
                                    onChange={(e) => {
                                        setEmployeeId(e.target.value);
                                        if (errors.employeeId) {
                                            setErrors({ ...errors, employeeId: '' });
                                        }
                                    }}
                                />
                                {errors.employeeId && (
                                    <Text color="red.500" fontSize="sm" mt={1}>{errors.employeeId}</Text>
                                )}
                            </FormControl>

                            {/* Department */}
                            <FormControl width="350px" mt={5} isInvalid={errors.department}>
                                <FormLabel textAlign="start">
                                    Department: <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <Select
                                    placeholder="Select Department"
                                    borderColor={errors.department ? "red.500" : "gray"}
                                    borderRadius="10px"
                                    // px={4}
                                    value={department}
                                    onChange={(e) => {
                                        setDepartment(e.target.value);
                                        if (errors.department) {
                                            setErrors({ ...errors, department: '' });
                                        }
                                    }}
                                >
                                    <option value="torque">Torque</option>
                                    <option value="support">Torque-Support</option>
                                    <option value="robotics">Torque-Robotics</option>
                                    <option value="embedded">Embedded</option>
                                    <option value="r&d">R&D</option>
                                    <option value="production">Production</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="sales">Sales</option>
                                    <option value="execution">Execution</option>
                                    <option value="reception">Reception</option>
                                    <option value="hr">HR</option>
                                    <option value="itsupport">Itsupport</option>
                                    <option value="management">Management</option>
                                    <option value="accounts">Accounts</option>
                                    <option value="design">Design Department</option>
                                    <option value="government-sales">Government Sales</option>
                                </Select>
                                {errors.department && (
                                    <Text color="red.500" fontSize="sm" mt={1}>{errors.department}</Text>
                                )}
                            </FormControl>


                            {/* Designation */}
                            <FormControl width="350px" mt={5} isInvalid={errors.designation}>
                                <FormLabel textAlign="start">
                                    Designation: <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <Select
                                    placeholder="Select Designation"
                                    borderColor={errors.designation ? "red.500" : "gray"}
                                    borderRadius="10px"
                                    // px={4}
                                    value={designation}
                                    onChange={(e) => {
                                        setDesignation(e.target.value);
                                        if (errors.designation) {
                                            setErrors({ ...errors, designation: '' });
                                        }
                                    }}
                                >
                                    <option value="head">Head</option>
                                    <option value="employee">Employee</option>
                                    <option value="intern">Intern</option>
                                    <option value="consultant">Consultant</option>
                                    <option value="director">Director</option>
                                </Select>
                                {errors.designation && (
                                    <Text color="red.500" fontSize="sm" mt={1}>{errors.designation}</Text>
                                )}
                            </FormControl>

                        </Box>

                        {uploadStatus && (
                            <Text
                                display={"flex"}
                                alignItems={"center"}
                                justifyContent={"center"}
                                color={"red"}
                            >
                                <MdError /> &nbsp;{uploadStatus}
                            </Text>
                        )}
                    </ModalBody>

                    <ModalFooter marginRight={"10px"} justifyContent={"space-evenly"}>
                        <Button
                            onClick={() => {
                                setErrors({});
                                setName('');
                                setEmail('');
                                setMobile('');
                                setPassword('');
                                setEmployeeId('');
                                setDepartment('');
                                setDesignation('');
                                closeModal();
                            }}
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
                            onClick={() => handleAddUser()}
                            w="150px"
                            fontWeight={"normal"}
                        >
                            Add User
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>


            <Modal isOpen={isOpen && activeModal === "Delete User"} onClose={closeModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete this user?
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default UserManagementEms;
