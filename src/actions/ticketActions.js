import axios from 'axios';

const baseURL = `https://view.arcisai.io/backend/api/ticket`;
// const baseURL = 'http://localhost:5000/api';

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

// get tickets api
export async function getAllTickets(page, status, ticketType, ticketName, ticketId) {
    try {
        const params = { page: page, status: status, ticketType: ticketType, ticketName: ticketName, ticketId: ticketId };
        const response = await instance.get('/getAllTickets', {
            params: params,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}


export async function getTicketByID(ticketId) {
    try {
        console.log('Sending ticketId in body:', ticketId);
        const response = await instance.get(`/getTicketById/${ticketId}`, ticketId); // POST request with body
        return response.data;
    } catch (error) {
        console.error('Error fetching ticket:', error);
        throw error;
    }
}

export async function updateStatus(ticketId, status) {
    try {
        const response = await instance.post(`/updateStatus`, {
            ticketId,
            status
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function checkCameraStatus(deviceId) {
    try {
        const response = await axios.post(`https://kappa-arcisai-6ivgp.ondigitalocean.app/backend/api/ticket/checkCameraStatus`, {
            deviceId: deviceId,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}