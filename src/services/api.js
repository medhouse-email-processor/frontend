import axios from 'axios'

const API_URL = 'https://beta.gamma-med.kz/api'
// const API_URL = 'http://127.0.0.1:5000/api'

export const fetchEmails = async (senderId, day) => {
    try {
        const response = await axios.post(`${API_URL}/email/fetch`, {
            senderId,
            day,
        })
        return response.data // axios returns the data directly in `response.data`
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

export const uploadFiles = async (mainFolderName, folderId) => {
    try {
        const response = await axios.post(`${API_URL}/drive/upload`, {
            mainFolderName,
            folderId,
        })
        return response.data
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

export const createSender = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/admin/sender/create`, data)
        return { success: true, message: 'Sender created successfully', data: response.data }
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}

export const checkGoogleAuth = async () => {
    try {
        const response = await axios.get(`${API_URL}/drive/auth/check`)
        return response.data
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message }
    }
}