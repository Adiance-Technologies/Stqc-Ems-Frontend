import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Image,
    VStack,
    Heading,
    Text,
    useBreakpointValue,
    Alert,
    AlertIcon,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import { resetPassword } from "../actions/userActions";
import { useNavigate, useParams } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setErrorMessage("Invalid reset token. Please request a new password reset.");
        }
    }, [token]);

    const handleResetPassword = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        if (!password || !confirmPassword) {
            setErrorMessage("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        // Password validation: at least 8 characters, one uppercase, one lowercase, one digit, one special character
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setErrorMessage(
                "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character."
            );
            return;
        }

        setIsLoading(true);
        try {
            const response = await resetPassword(token, password);
            if (response.success) {
                setSuccessMessage(response.data || "Password reset successfully!");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setErrorMessage(response.data || "Failed to reset password. The link may have expired.");
            }
        } catch (error) {
            setErrorMessage("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex height="100vh">
            <Box flex="1" display="flex" alignItems="center" justifyContent="center">
                <VStack spacing={6} w="full" maxW="md" p={8} alignItems="flex-start">
                    <Image
                        position={'fixed'}
                        left={8}
                        top={0}
                        src="./ArcisAi.png"
                        objectFit={'contain'}
                        alt="Logo"
                        boxSize="100px"
                        mx="auto"
                        mb={4}
                    />
                    <Heading as="h2" size="lg" mb={2}>
                        Reset Password
                    </Heading>
                    <Text color="gray.500" mb={6}>
                        Enter your new password below.
                    </Text>
                    <Box w="full">
                        <FormControl mb={4}>
                            <FormLabel>New Password</FormLabel>
                            <InputGroup>
                                <Input
                                    onChange={(e) => setPassword(e.target.value)}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={password}
                                />
                                <InputRightElement h={'full'}>
                                    <Button
                                        variant={'ghost'}
                                        onClick={() => setShowPassword((showPassword) => !showPassword)}
                                    >
                                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>

                        <FormControl mb={4}>
                            <FormLabel>Confirm Password</FormLabel>
                            <InputGroup>
                                <Input
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                />
                                <InputRightElement h={'full'}>
                                    <Button
                                        variant={'ghost'}
                                        onClick={() => setShowConfirmPassword((showConfirmPassword) => !showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <ViewIcon /> : <ViewOffIcon />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>

                        {errorMessage && (
                            <Alert status="error" mb={4} borderRadius="md">
                                <AlertIcon />
                                {errorMessage}
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert status="success" mb={4} borderRadius="md">
                                <AlertIcon />
                                {successMessage}
                            </Alert>
                        )}

                        <Button
                            onClick={handleResetPassword}
                            colorScheme="purple"
                            w="full"
                            mb={4}
                            isLoading={isLoading}
                            loadingText="Resetting..."
                            isDisabled={!token}
                        >
                            Reset Password
                        </Button>

                        <Text align="center" w="full">
                            Remember your password?{" "}
                            <Text
                                as="span"
                                color="purple.500"
                                cursor="pointer"
                                onClick={() => navigate("/login")}
                                _hover={{ textDecoration: "underline" }}
                            >
                                Sign in
                            </Text>
                        </Text>
                    </Box>
                </VStack>
            </Box>
        </Flex>
    );
};

export default ResetPasswordPage;

