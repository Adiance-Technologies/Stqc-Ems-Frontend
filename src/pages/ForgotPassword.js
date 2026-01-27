import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { forgotPassword } from "../actions/userActions";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleForgotPassword = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        if (!email) {
            setErrorMessage("Please enter your email address");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            const response = await forgotPassword(email);
            if (response.success) {
                setSuccessMessage(response.data || "Password reset email sent successfully. Please check your inbox.");
                setEmail("");
            } else {
                setErrorMessage(response.data || "Failed to send reset email. Please try again.");
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
                        Forgot Password
                    </Heading>
                    <Text color="gray.500" mb={6}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Text>
                    <Box w="full">
                        <FormControl mb={4}>
                            <FormLabel>Email Address</FormLabel>
                            <Input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                            />
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
                            onClick={handleForgotPassword}
                            colorScheme="purple"
                            w="full"
                            mb={4}
                            isLoading={isLoading}
                            loadingText="Sending..."
                        >
                            Send Reset Link
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

export default ForgotPasswordPage;

