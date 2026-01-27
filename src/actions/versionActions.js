import axios from 'axios';

const baseURL = `${process.env.REACT_APP_IP}/api/version`;
// const baseURL = 'http://localhost:5000/api/version';

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

// Base Firmware Code

export const getAllFirmware = async () => {
  try {
    const res = await instance.get(`/firmware/getAllFirmware`);
    return res.data;
  } catch (err) {
    console.error("Firmware fetch failed:", err);
    throw err;
  }
};

export const uploadFirmware = async (cameraName, versionName, binFile, romFile, releaseNotesFile) => {
  try {
    const formData = new FormData();
    formData.append("cameraName", cameraName);
    formData.append("versionName", versionName);
    formData.append("firmwareFiles", binFile);
    formData.append("firmwareFiles", romFile);
    formData.append("releaseNotes", releaseNotesFile);

    const res = await instance.post(`/firmware/${cameraName}/${versionName}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error("Firmware upload failed:", err);
    throw err;
  }
};

export const downloadFirmwareById = async (id, type) => {
  try {
    console.log("Downloading firmware/release notes | id:", id, "type:", type);

    // Make API request with blob response
    const response = await instance.get(
      `/firmware/download/${id}?type=${type}`,
      { responseType: "blob" } // important for binary files
    );

    // Determine filename from Content-Disposition header
    let filename = "download";
    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      filename = disposition
        .split("filename=")[1]
        .replace(/["']/g, "")
        .trim();
    } else if (type === "releaseNotes") {
      filename = "releaseNotes.txt";
    } else if (type === "firmware") {
      filename = "firmwareFiles.zip";
    }

    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Firmware download failed:", error);

    // Check if backend sent JSON error instead of file
    let message = "Download failed";
    if (error.response && error.response.data) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result;
          console.error("Backend response:", text);
        };
        reader.readAsText(error.response.data);
      } catch (e) { }
      message = error.response.data?.message || message;
    }

    return { success: false, message };
  }
};