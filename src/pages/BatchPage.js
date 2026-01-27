import {
    Box, Button, Input, VStack, useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import axios from 'axios';

const BatchUpload = () => {
    const toast = useToast();
    const [deviceIds, setDeviceIds] = useState('');
    const [certFile, setCertFile] = useState(null);
    const [keyFile, setKeyFile] = useState(null);

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

    return (
        <Box p={8} maxW="lg" mx="auto" mt={10} borderWidth={1} borderRadius="lg">
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
        </Box>
    );
};

export default BatchUpload;
