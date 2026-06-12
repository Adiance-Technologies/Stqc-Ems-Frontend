import axios from 'axios';

const baseURL = `${process.env.REACT_APP_IP}/api`;
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

export async function handleGetConfig(deviceId) {
    // console.log('getConfig', deviceId);
    try {
        const params = { deviceId: deviceId };
        const response = await instance.get('/camera/getConfig', {
            params: params,
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json',
            //     // Add any other headers if needed
            // },
        });
        return response.data;
    } catch (error) {
        // Handle errors, and include an error message in the response
        throw error;
    }
}

export async function getVideoEncodeChannelMain(deviceId) {
    try {
        const params = { deviceId: deviceId };
        // const token = localStorage.getItem('token');

        // const response = await instance.get('/allcamera', {
        const response = await instance.get('/video-encode-channel-main', {
            params: params,
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json',
            //     // Add any other headers if needed
            // },
        });
        return response;

    } catch (error) {
        throw error;
    }
}

export async function getVideoEncodeChannelSub(deviceId) {
    try {
        const params = { deviceId: deviceId };
        // const token = localStorage.getItem('token');

        // const response = await instance.get('/allcamera', {
        const response = await instance.get('/video-encode-channel-sub', {
            params: params,
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json',
            //     // Add any other headers if needed
            // },
        });
        return response;

    } catch (error) {
        throw error;
    }
}

export async function get_videoSettings(deviceId) {
    try {
        const params = { deviceId: deviceId };

        // const response = await instance.get('/allcamera', {
        const response = await instance.get('/videoSettings', {
            params: params,
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getVideoSettings(deviceId) {
    try {
        const params = { deviceId: deviceId };
        // const token = localStorage.getItem('token');

        // const response = await instance.get('/allcamera', {
        const response = await instance.get('/video-settings', {
            params: params,
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json',
            //     // Add any other headers if needed
            // },
        });
        return response;

    } catch (error) {
        throw error;
    }
}

export async function getImageInfo(deviceId) {
    try {
        const params = { deviceId: deviceId };
        // const token = localStorage.getItem('token');

        // const response = await instance.get('/allcamera', {
        const response = await instance.get('/image-info', {
            params: params,
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json',
            //     // Add any other headers if needed
            // },
        });
        return response;

    } catch (error) {
        throw error;
    }
}

export async function getNetworkInterfaceSettings(deviceId) {
    try {
        const params = { deviceId: deviceId };
        // const token = localStorage.getItem('token');

        // const response = await instance.get('/allcamera', {
        const response = await instance.get('/network-interface-settings', {
            params: params,
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json',
            //     // Add any other headers if needed
            // },
        });
        return response;

    } catch (error) {
        throw error;
    }
}

export async function getNetInfo(deviceId) {
    try {
        const params = { deviceId: deviceId };
        // const token = localStorage.getItem('token');

        // const response = await instance.get('/allcamera', {
        const response = await instance.get('/network-info', {
            params: params,
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json',
            //     // Add any other headers if needed
            // },
        });
        return response;

    } catch (error) {
        throw error;
    }
}

export async function getTimeSettings(deviceId) {
    try {
        const params = { deviceId: deviceId };
        // const token = localStorage.getItem('token');

        // const response = await instance.get('/allcamera', {
        const response = await instance.get('/time-settings', {
            params: params,
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json',
            //     // Add any other headers if needed
            // },
        });
        return response;

    } catch (error) {
        throw error;
    }
}

export async function getDeviceInfo(deviceId) {
    try {
        const params = { deviceId: deviceId };
        // const token = localStorage.getItem('token');

        // const response = await instance.get('/allcamera', {
        const response = await instance.get('/device-info', {
            params: params,
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json',
            //     // Add any other headers if needed
            // },
        });
        return response;

    } catch (error) {
        throw error;
    }
}

/////////////////// CameraList /////////////////////

export async function getP2pCameras(page, deviceId, status, order) {
    try {
        const params = { page: page, querySearch: deviceId, status: status, order: order };
        // const token = localStorage.getItem('token');

        // const response = await instance.get('/allcamera', {
        const response = await instance.get('/camera/get-p2p-cameras', {
            params: params,
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json',
            //     // Add any other headers if needed
            // },
        });
        return response;

    } catch (error) {
        throw error;
    }
}

export async function addP2pCamera(deviceId, productType, isPTZ) {
    // const token = localStorage.getItem('token');
    console.log('formData2', deviceId, productType, isPTZ);
    try {
        const response = await instance.post('/camera/add-p2p-camera',
            { deviceId, productType, isPTZ }
            // , {
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json',
            //         // Add any other headers if needed
            //     }
            // }
        );
        return response;
    } catch (error) {
        throw error;
    }
}

// One-time set of the per-camera OTA token (used as `deviceToken` in the
// channel-62 secure-OTA MQTT payload). The backend refuses to overwrite an
// already-set token, so the UI should call this only when the field is empty.
export async function setCameraOtaToken(deviceId, otaDeviceToken) {
    try {
        const response = await instance.post('/camera/ota-token', {
            deviceId,
            otaDeviceToken,
        });
        return response;
    } catch (error) {
        throw error;
    }
}

// adding camera from an excel

export async function addMultiP2pCamera(formData) {
    // const token = localStorage.getItem('token');
    // console.log('formData2',formData);
    try {
        const response = await instance.post('/camera/addMultipleP2PCameras',
            formData,
        );
        return response;
    } catch (error) {
        throw error;
    }
}

export async function addMultipleCamera(formData) {
    // const token = localStorage.getItem('token');
    // console.log('formData2',formData);
    try {
        const response = await instance.post('/camera/addMultipleCameras',
            formData,
        );
        return response;
    } catch (error) {
        throw error;
    }
}

//////////////////////////////// POST REQUESTS ///////////////////////////////////////

// export async function setVideoEncodeChannelMain(bitRate, frameRate, codecType, resolution, bitRateType, deviceId) {
//     // const token = localStorage.getItem('token');
//     const params = { deviceId: deviceId };
//     console.log(bitRate, frameRate, codecType, resolution, bitRateType, deviceId)
//     try {
//         const response = await instance.post('/video-encode-channel-main',
//             {
//                 codecType: codecType,
//                 resolution: resolution,
//                 bitRateControlType: bitRateType,
//                 constantBitRate: bitRate,
//                 frameRate: frameRate,
//             },
//             {
//                 params: params
//             }
//             // , {
//             //     headers: {
//             //         'Authorization': `Bearer ${token}`,
//             //         'Content-Type': 'application/json',
//             //         // Add any other headers if needed
//             //     }
//             // }
//         );
//         return response;
//     } catch (error) {
//         throw error;
//     }
// }
export async function setVideoEncodeChannelMain(quality, frameRate, constantBitRate, deviceId) {
    // const token = localStorage.getItem('token');
    const params = { deviceId: deviceId };
    console.log(quality, frameRate, constantBitRate, deviceId)
    try {
        const response = await instance.post('/videoSettings',
            {
                quality,
                frameRate,
                constantBitRate
            },
            {
                params: params
            }
            // , {
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json',
            //         // Add any other headers if needed
            //     }
            // }
        );
        return response;
    } catch (error) {
        throw error;
    }
}

export async function setVideoSettings(hue, saturation, brightness, contrast, flipEnabled, mirrorEnabled, deviceId) {
    // const token = localStorage.getItem('token');
    const params = { deviceId: deviceId };
    try {
        const response = await instance.post('/video-settings',
            {
                hueLevel: hue,
                saturationLevel: saturation,
                brightnessLevel: brightness,
                contrastLevel: contrast,
                flipEnabled: flipEnabled,
                mirrorEnabled: mirrorEnabled
            },
            {
                params: params
            }
            // , {
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json',
            //         // Add any other headers if needed
            //     }
            // }
        );
        return response;
    } catch (error) {
        throw error;
    }
}

export async function setImageInfo(irCut, deviceId) {
    // const token = localStorage.getItem('token');
    const params = { deviceId: deviceId };
    try {
        const response = await instance.post('/image-info',
            {
                irCutMode: irCut,
            },
            {
                params: params
            }
            // , {
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json',
            //         // Add any other headers if needed
            //     }
            // }
        );
        return response;
    } catch (error) {
        throw error;
    }
}

/////////////////////// POST REQUESTS ///////////////////////////

export async function addCamera(deviceId) {
    // const token = localStorage.getItem('token');
    try {
        const response = await instance.post('/camera/add-camera',
            {
                deviceId: deviceId,
            }
            // , {
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json',
            //         // Add any other headers if needed
            //     }
            // }
        );
        return response;
    } catch (error) {
        throw error;
    }
}

////////////////////// MQTT ///////////////////////////

export async function fetchLatestMessage() {
    try {

        const response = await instance.get('/alert/latest-message');
        return response;

    } catch (error) {
        throw error;
    }
}

///////////////////// Get NVR /////////////////////////

export async function getNvr(page, nvrName) {
    try {
        const params = { page: page, nvrName: nvrName };
        const response = await instance.get('/camera/getNvr', {
            params: params
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function createNvr(nvrId, nvrName, email, nvrChannel) {
    try {
        const response = await instance.post('/camera/createNvr', {
            nvrId: nvrId,
            nvrName: nvrName,
            email: email,
            channel: nvrChannel,
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function updateNvr(nvrId, nvrName, email) {
    try {
        const params = { nvrId: nvrId }
        const response = await instance.post('/camera/updateNvr', {
            nvrName: nvrName,
            email: email,
        },
            { params: params }
        );
        return response;
    } catch (error) {
        throw error;
    }
}

export async function deleteNvr(nvrId) {
    try {
        const response = await instance.post('/camera/deleteNvr', {
            nvrId: nvrId,
        });
        return response;
    } catch (error) {
        throw error;
    }
}

// Get ABD list (with pagination + search by name)
export async function getAbd(page, abdName) {
    try {
        const params = { page: page, abdName: abdName };
        const response = await instance.get('/abd/getAbd', {
            params: params
        });
        return response;
    } catch (error) {
        throw error;
    }
}

// Create ABD
export async function createAbd(abdId, abdName, email, channel) {
    try {
        const response = await instance.post('/abd/createAbd', {
            abdId: abdId,
            // abdName: abdName,
            // email: email,
            channel: channel,
        });
        return response;
    } catch (error) {
        throw error;
    }
}

// Update ABD (email + name)
export async function updateAbd(abdId, abdName, email) {
    try {
        const params = { abdId: abdId };
        const response = await instance.post(
            '/abd/updateAbd',
            {
                abdName: abdName,
                email: email,
            },
            { params: params }
        );
        return response;
    } catch (error) {
        throw error;
    }
}

// Delete ABD
export async function deleteAbd(abdId) {
    try {
        const response = await instance.post('/abd/deleteAbd', {
            abdId: abdId,
        });
        return response;
    } catch (error) {
        throw error;
    }
}


export async function generateDeviceId(networkType, productType, count) {
    try {
        const response = await instance.post('/camera/generateDeviceId', {
            networkType,
            productType,
            count
        })
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getAllDeviceIds(page, deviceId, isBurned) {
    try {
        const params = { page: page, deviceId: deviceId, burned: isBurned };
        const response = await instance.get('/camera/getAllDeviceIds', {
            params: params
        })
        return response;
    } catch (error) {
        throw error;
    }
}
