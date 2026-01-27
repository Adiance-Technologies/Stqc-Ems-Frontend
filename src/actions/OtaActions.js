import axios from 'axios';

const baseURL = `${process.env.REACT_APP_IP}/api/ota`;
// const baseURL = 'http://localhost:5000/api/ota';
const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true
});

instance.interceptors.response.use(
    response => {
        // If the response is successful, just return the response
        return response;
    },
    error => {
        // If the response has a status code of 401, redirect to the login page
        if (error.response && error.response.status === 401) {
            window.location.href = '/'; // Replace with your login route
        }
        // Otherwise, reject the promise with the error object
        return Promise.reject(error);
    }
);

export const CameraList = async (page, searchQuery) => {
    try {
        const params = {
            page: page,
            searchQuery: searchQuery
        }
        const response = await instance.get('/cameraList', {
            params: params
        });
        return response.data;
    } catch (error) {
        // Handle errors, and include an error message in the response
        return { success: false, message: error.response.data.message };
    }
};

export const checkOtaStatus = async (deviceId) => {
    try {
        const params = {
            deviceId: deviceId
        }
        const response = await instance.get(`/checkOtaStatus`, {
            params: params
        });
        return response;
    } catch (error) {
        // Handle errors, and include an error message in the response
        return { success: false, message: error.response.data.message };
    }
};

export const setOta = async (deviceId) => {
    try {
        const params = {
            deviceId: deviceId
        }
        const response = await instance.get('/setOta', {
            params: params
        });
        return response;
    } catch (error) {
        // Handle errors, and include an error message in the response
        return { success: false, message: error.response.data.message };
    }
}

export const releaseFirmware = async (formData) => {
    try {
        const response = await instance.post('/releaseFirmware', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Internal Server Error"
        };
    }
}