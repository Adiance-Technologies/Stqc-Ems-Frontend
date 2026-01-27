import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    RadioGroup,
    Radio,
    VStack,
    Box,
    Text,
    Stack,
    Progress,
    useColorModeValue,
    useToast,
    Divider,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import theme from "../theme";
// import { createTicket } from "../actions/userActions";
// import { getAllCameras } from "../actions/userActions";
import Select from "react-select";
import { getAllUsers } from "../actions/adminActions";

const questions = [
    {
        label: "Is your camera getting power?",
        name: "question1",
        options: ["Yes", "No", "Not Sure"],
    },
    {
        label: "Light is there in ethernet cable?",
        name: "question2",
        options: ["Yes", "No", "Sometimes"],
    },
    {
        label: "Is your camera getting internet?",
        name: "question3",
        options: ["Yes", "No", "Not Checked"],
    },
    {
        label: "Is simcard inserted in camera if sim bases camera?",
        name: "question4",
        options: ["Yes", "No", "Not Applicable"],
    },
];

function GenerateTicketModel({ isOpen, onClose, fetchTickets }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [cameraName, setCameraName] = useState(""); // change from [] to ""
    const [camerasData, setCamerasData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(''); // New state for selected users
    const [selectedDids, setSelectedDids] = useState([]);
    const [step, setStep] = useState(1);
    const toast = useToast();

    const handleClose = async () => {
        setStep(1);
        setTitle("");
        setDescription("");
        setSelectedDids([]);
        onClose();
    };

    const showToast = (msg, status, id) => {
        if (!toast.isActive(id)) {
            toast({
                id: id,
                description: msg,
                status: status,
                duration: 1500,
                position: "bottom-center",
                isClosable: true,
            });
        }
    };

    const [formData, setFormData] = useState({
        question1: "",
        question2: "",
        question3: "",
        question4: "",
    });

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const textColor = useColorModeValue(
        "custom.lightModeText",
        "custom.darkModeText"
    );

    const secondaryTextColor = useColorModeValue(
        "custom.lightSecondaryText",
        "custom.darkSecondaryText"
    );

    const radioColor = useColorModeValue(
        "custom.darkModePrimary",
        "custom.primary"
    );

    const bgColor = useColorModeValue(
        theme.colors.custom.primary,
        theme.colors.custom.darkModePrimary
    );
    const handleNext = () => setStep((s) => s + 1);
    const handleBack = () => setStep((s) => s - 1);

    const [allUsers, setAllUsers] = useState([]);
    // 🔹 Fetch function (outside useEffect)
    const fetchAllCamera = async () => {
        try {
            // const response = await getAllCameras(1, 1000000);
            const response2 = await getAllUsers(1, cameraName, 10000000);

            console.log("response", response2);

            // const cameraDropdownOptions = (response?.cameras || []).map((camera) => ({
            //     value: camera.deviceId,
            //     label: camera.name || camera.deviceId,
            // }));

            // setCamerasData(cameraDropdownOptions);
            setAllUsers(response2?.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // 🔹 Transform camera data (memoized)
    const transformedOptions = useMemo(() => {
        return (camerasData || []).map((did) => ({
            value: did.value,
            label: did.label,
        }));
    }, [camerasData]);

    // 🔹 Transform user data
    const [transformedUserOption, setTransformedUserOption] = useState([]);
    useEffect(() => {
        if (allUsers && allUsers.length > 0) {
            const transformed = allUsers.map((user) => ({
                value: user._id,
                label: user.name ? `${user.name} (${user.email})` : user.email || "Unnamed User",
            }));
            setTransformedUserOption(transformed);
            console.log("transformedUserOption", transformed);
        } else {
            setTransformedUserOption([]);
        }
    }, [allUsers]);

    const [selectedUserOption, setSelectedUserOption] = useState(null); // option object or null
    const [selectedUserId, setSelectedUserId] = useState(""); // id string or ""
    // When user picks/unpicks via the UI, update BOTH states

    const getAllCamerasOfUser = async (id) => {
        try {
            console.log("Fetching cameras for user:", id); // single id
            // const response = await getAllCameras(1, 1000000, id);
            // const cameraDropdownOptions = (response?.cameras || []).map((camera) => ({
            //     value: camera.deviceId,
            //     label: camera.name || camera.deviceId,
            // }));
            // setCamerasData(cameraDropdownOptions);
        } catch (error) {
            console.error("Error fetching cameras for user:", error);
        }
    }


    // new
    const handleUserChange = (selectedOption) => {
        // selectedOption is either an option object or null
        setSelectedUserOption(selectedOption || null);
        const id = selectedOption ? selectedOption.value : "";
        setSelectedUserId(id);

        if (id) {
            getAllCamerasOfUser(id); // pass a single id
        } else {
            setCamerasData([]); // clear cameras if user cleared selection
        }
    };

    // const transformedUserOptions = camerasData.map((user) => {
    //     return {
    //         value: user.value, // Device ID
    //         label: user.label, // Camera Name
    //     };
    // });


    const handleSubmit = async () => {
        const hardwareChecks = questions.map((question) => ({
            question: question.label,
            answer: formData[question.name],
        }));
        const finalData = {
            hardwareChecks,
            title,
            description,
            userId: selectedUserId,   // add this
            cameraName: selectedDids,
        };
        // console.log("Submitted Data:", finalData);

        // const response = await createTicket(finalData);
        // if (response.success) {
        //     showToast(response.message, "success", "ticket-success");
        // } else {
        //     showToast(response.message, "error", "ticket-error");
        // }
        fetchTickets(); //alling fetchTickets function to update the tickets list
        onClose();
        setStep(1);
        setTitle("");
        setDescription("");
        setSelectedDids([]);
        setFormData({
            question1: "",
            question2: "",
            question3: "",
            question4: "",
        });
    };

    const totalSteps = questions.length + 1;
    // const bg = useColorModeValue("white", "gray.800");

    const MAX_CHARACTERS = 50;

    useEffect(() => {
        fetchAllCamera();
    }, []);

    const modalOverlayBg = useColorModeValue(
        "rgba(255, 255, 255, 0.85)",
        "rgba(0, 0, 0, 0.85)"
    );
    const modalBoxShadow = useColorModeValue(
        "0 8px 40px rgba(0, 0, 0, 0.3)",
        "0 8px 40px rgba(0, 0, 0, 0.3)"
    );

    const focusColor = useColorModeValue(
        "#4E5258", // light mode color (example)
        "#A3AEBD" // dark mode color (example)
    );
    //  const bgColor = useColorModeValue("custom.primary", "custom.darkModePrimary");
    const modalBg = useColorModeValue(
        theme.colors.custom.lightModeBg,
        theme.colors.custom.darkModeBg
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="lg"
            isCentered
            motionPreset="scale"
        >
            <ModalOverlay bg={modalOverlayBg} />
            <ModalContent
                bg={modalBg}
                color={textColor}
                w={{ base: "90%", md: "90%", lg: "100%" }}
                maxW="656px"
                boxShadow={modalBoxShadow}
            >
                <ModalHeader
                    textAlign={"center"}
                    p={1}
                    mt={3}
                    fontSize={"md"}
                    color={textColor}
                >
                    Generate Support Ticket
                </ModalHeader>
                {/* <ModalCloseButton /> */}

                <Box px={6} pt={2}>
                    <Progress
                        value={(step / totalSteps) * 100}
                        size="sm"
                        sx={{
                            "& > div": {
                                background: radioColor, // this targets the filled bar
                            },
                        }}
                        // filledTrackColor={bgColor} // custom color for filled portion
                        borderRadius="md"
                        mb={3}
                    />
                    <Text fontSize="sm" color="gray.500" mb={2}>
                        Step {step} of {totalSteps}
                    </Text>
                    <Divider />
                </Box>

                <ModalBody textAlign="center">
                    {step === 1 && (
                        <VStack spacing={5} align="stretch">
                            <FormControl isRequired>
                                <FormLabel
                                    fontSize="sm"
                                    textAlign="start"
                                    color={textColor}
                                    fontWeight={"bold"}
                                >
                                    Problem Title
                                </FormLabel>
                                <InputGroup>
                                    <Input
                                        placeholder="Enter a brief title"
                                        borderColor={secondaryTextColor}
                                        color={textColor}
                                        px={4}
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value); // Always update input value
                                        }}
                                        _placeholder={{
                                            color: secondaryTextColor,
                                            fontSize: "15px",
                                        }}
                                        _focus={{
                                            borderColor: focusColor,
                                            boxShadow: ` 0 0 0 0.35px ${focusColor}`,
                                        }}
                                        _hover={{
                                            boxShadow: `0 0 0 0.3px ${focusColor}`, // show shadow on hover
                                            borderColor: focusColor, // keep border unchanged
                                        }}
                                        pr="4em" // Add right padding to make space for InputRightElement
                                        borderRadius={"10px"}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                // handleSearch();
                                            }
                                        }}
                                        maxLength={MAX_CHARACTERS}
                                    />
                                    <InputRightElement width={"4em"}>
                                        <Box color="gray.500" fontSize="sm">
                                            {title?.length} / {MAX_CHARACTERS}
                                        </Box>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel
                                    fontSize="sm"
                                    textAlign="start"
                                    color={textColor}
                                    fontWeight={"bold"}
                                >
                                    Problem Description
                                </FormLabel>
                                <Textarea
                                    placeholder="Describe your issue in detail"
                                    borderColor={secondaryTextColor}
                                    borderRadius="10px"
                                    color={textColor}
                                    px={4}
                                    value={description}
                                    // onChange={(e) => handleChange("description", e.target.value)}
                                    onChange={(e) => {
                                        setDescription(e.target.value); // Always update input value
                                    }}
                                    _placeholder={{
                                        color: secondaryTextColor,
                                        fontSize: "15px",
                                    }}
                                    _focus={{
                                        borderColor: focusColor,
                                        boxShadow: ` 0 0 0 0.35px ${focusColor}`,
                                    }}
                                    _hover={{
                                        boxShadow: `0 0 0 0.3px ${focusColor}`, // show shadow on hover
                                        borderColor: focusColor, // keep border unchanged
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            // handleSearch();
                                        }
                                    }}
                                    boxShadow="base"
                                    minHeight="120px"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel
                                    textAlign="start"
                                    fontSize="sm"
                                    color={textColor}
                                    fontWeight={"bold"}
                                >
                                    Users
                                </FormLabel>

                                <Select
                                    placeholder="Select User"
                                    // remove isMulti
                                    value={selectedUserOption}                      // single option object
                                    options={transformedUserOption}
                                    onChange={handleUserChange}                     // receives single option
                                    menuPlacement="auto"
                                    menuPosition="fixed"
                                    color={textColor}
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            borderColor: focusColor,
                                            boxShadow: `0 0 0 0.35px ${focusColor}`,
                                            borderRadius: "10px",
                                            padding: "4px",
                                            overflowY: "hidden",
                                            maxHeight: "70px",
                                            "&:hover": {
                                                boxShadow: `0 0 0 0.3px ${focusColor}`,
                                                borderColor: focusColor,
                                            },
                                            backgroundColor: "transparent",
                                            transition: "all 0.2s ease-in-out",
                                        }),
                                        placeholder: (provided) => ({
                                            ...provided,
                                            color: secondaryTextColor,
                                            fontSize: "15px",
                                            textAlign: "left",
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: "10px",
                                            textAlign: "left",
                                            color: "#1A1A1A",
                                        }),
                                        option: (provided) => ({
                                            ...provided,
                                            textAlign: "left",
                                        }),
                                        multiValue: (provided) => ({
                                            ...provided,
                                            backgroundColor: bgColor,
                                            borderRadius: "6px",
                                        }),
                                        multiValueLabel: (provided) => ({
                                            ...provided,
                                            color: textColor,
                                        }),
                                        multiValueRemove: (provided) => ({
                                            ...provided,
                                            ":hover": {
                                                backgroundColor: "transparent",
                                            },
                                        }),
                                    }}
                                />
                            </FormControl>


                            <FormControl isRequired>
                                <FormLabel
                                    textAlign="start"
                                    fontSize="sm"
                                    color={textColor}
                                    fontWeight={"bold"}
                                >
                                    Camera Names
                                </FormLabel>
                                <Select
                                    placeholder="Select Devices"
                                    isMulti
                                    value={selectedDids}
                                    options={transformedOptions}
                                    onChange={(selectedOptions) => {
                                        console.log("Selected Options:", selectedOptions);
                                        setSelectedDids(selectedOptions);
                                    }}
                                    menuPlacement="auto"
                                    menuPosition="fixed"
                                    color={textColor}
                                    // size={{ base: "sm", md: "md" }}
                                    styles={{
                                        control: (provided, state) => ({
                                            ...provided,
                                            borderColor: focusColor, // Custom purple border color on focus
                                            boxShadow: `0 0 0 0.35px ${focusColor}`, // Custom purple box shadow
                                            borderRadius: "10px",
                                            padding: "4px",
                                            overflowY: "hidden",
                                            maxHeight: "70px", // Still restricts height but without scroll
                                            "&:hover": {
                                                boxShadow: `0 0 0 0.3px ${focusColor}`, // mimic _hover
                                                borderColor: focusColor,
                                            },
                                            backgroundColor: "transparent",
                                            transition: "all 0.2s ease-in-out",
                                        }),
                                        placeholder: (provided) => ({
                                            ...provided,
                                            color: secondaryTextColor, // same as _placeholder.color
                                            fontSize: "15px", // same as _placeholder.fontSize
                                            textAlign: "left",
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: "10px", // Applies borderRadius to the dropdown menu
                                            textAlign: "left",
                                            color: "#1A1A1A",
                                        }),
                                        option: (provided) => ({
                                            ...provided,
                                            textAlign: "left", // Aligns options text to the left
                                        }),
                                        multiValue: (provided) => ({
                                            ...provided,
                                            backgroundColor: bgColor, // light purple tag background
                                            borderRadius: "6px",
                                        }),
                                        multiValueLabel: (provided) => ({
                                            ...provided,
                                            color: textColor,
                                        }),
                                        multiValueRemove: (provided) => ({
                                            ...provided,
                                            // color: theme.colors.custom.primary,
                                            ":hover": {
                                                backgroundColor: "transparent",
                                            },
                                        }),
                                    }}
                                />
                            </FormControl>
                        </VStack>
                    )}

                    {step > 1 && step <= totalSteps && (
                        <FormControl isRequired>
                            <FormLabel fontWeight="medium" mb={4} color={textColor}>
                                {questions[step - 2].label}
                            </FormLabel>
                            <RadioGroup
                                onChange={(value) =>
                                    handleChange(questions[step - 2].name, value)
                                }
                                value={formData[questions[step - 2].name]}
                            >
                                <VStack align="start" spacing={3}>
                                    {questions[step - 2].options.map((option) => (
                                        <Radio
                                            key={option}
                                            value={option}
                                            colorScheme="none"
                                            _checked={{
                                                borderColor: radioColor,
                                                _before: {
                                                    content: '""',
                                                    display: "inline-block",
                                                    w: "10px",
                                                    h: "10px",
                                                    borderRadius: "50%",
                                                    bg: radioColor,
                                                    position: "relative",
                                                },
                                            }}
                                        >
                                            {option}
                                        </Radio>
                                    ))}
                                </VStack>
                            </RadioGroup>
                        </FormControl>
                    )}
                </ModalBody>

                <ModalFooter px={6} py={4}>
                    <Stack
                        direction={{ base: "column", sm: "row" }}
                        spacing={4}
                        w="full"
                        justify={{ base: "space-between", md: "flex-end" }}
                    >
                        {step > 1 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                w={{ base: "120px", md: "150px" }} // Adjust width for mobile
                                border="1px"
                                background="0"
                                // color="red.500"
                                // borderColor="red.500"
                                _hover={{ background: "none" }}
                                borderRadius="md"
                            >
                                Back
                            </Button>
                        )}
                        {step < totalSteps ? (
                            <Button
                                onClick={handleNext}
                                borderRadius="md"
                                w={{ base: "150px", md: "150px" }} // Adjust width for mobile
                                background={bgColor}
                                color={textColor}
                                fontWeight="bold"
                                // _hover={{
                                // backgroundColor: useColorModeValue(
                                // theme.colors.custom.darkModePrimary,
                                // theme.colors.custom.primary
                                // ),
                                // color: useColorModeValue(
                                // theme.colors.custom.darkModeText,
                                // theme.colors.custom.lightModeText
                                // ),
                                // }}
                                isDisabled={
                                    step === 1
                                        ? !title.trim() ||
                                        !description.trim() ||
                                        selectedDids.length === 0
                                        : !formData[questions[step - 2].name]
                                }
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                colorScheme="green"
                                onClick={handleSubmit}
                                borderRadius="md"
                                isDisabled={
                                    !title ||
                                    !description ||
                                    !formData.question1 ||
                                    !formData.question2 ||
                                    !formData.question3 ||
                                    !formData.question4 ||
                                    selectedDids.length === 0
                                }
                            >
                                Submit Ticket
                            </Button>
                        )}
                    </Stack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default GenerateTicketModel;
