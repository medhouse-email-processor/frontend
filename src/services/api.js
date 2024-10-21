const API_URL = 'http://127.0.0.1:5000/api'

export const fetchEmails = async (senderId, day) => {
    const response = await fetch(`${API_URL}/email/fetch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ senderId, day }),
    })
    return response.json()
}

export const uploadFiles = async (mainFolderName, folderId) => {
    const response = await fetch(`${API_URL}/drive/upload`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mainFolderName, folderId }),
    })
    return response.json()
}
