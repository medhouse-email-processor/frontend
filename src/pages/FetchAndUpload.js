import React, { useState } from 'react'
import { fetchEmails, uploadFiles } from '../services/api'

const FetchAndUpload = () => {
    const [senderId, setSenderId] = useState('')
    const [date, setDate] = useState('')
    const [folderId, setFolderId] = useState('')
    const [status, setStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {}

        if (!senderId || isNaN(Number(senderId))) {
            newErrors.senderId = 'Sender ID must be a valid number.'
        }

        if (!date) {
            newErrors.date = 'Please select a valid date.'
        }

        if (!folderId) {
            newErrors.folderId = 'Google Drive Folder ID is required.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleFetchAndUpload = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        setStatus('Fetching files...')

        try {
            const fetchResponse = await fetchEmails(Number(senderId), date)

            if (fetchResponse.success) {
                setStatus(fetchResponse.message)
                const { mainFolderName, fetchedFiles } = fetchResponse
                console.log('Fetched Files:', fetchedFiles)

                setStatus('Uploading files...')
                const uploadResponse = await uploadFiles(mainFolderName, folderId)

                if (uploadResponse.success) {
                    setStatus('Files uploaded successfully!')
                } else {
                    setStatus('Error uploading files: ' + uploadResponse.message)
                }
            } else {
                setStatus('Error fetching files: ' + fetchResponse.message)
            }
        } catch (error) {
            setStatus('An error occurred: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container">
            <h1>Fetch and Upload Files</h1>
            <form onSubmit={handleFetchAndUpload}>
                <div>
                    <label>Sender ID:</label>
                    <input
                        type="number"
                        value={senderId}
                        onChange={(e) => setSenderId(e.target.value)}
                    />
                    {errors.senderId && <p className="error">{errors.senderId}</p>}
                </div>
                <div>
                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    {errors.date && <p className="error">{errors.date}</p>}
                </div>
                <div>
                    <label>Google Drive Folder ID:</label>
                    <input
                        type="text"
                        value={folderId}
                        onChange={(e) => setFolderId(e.target.value)}
                    />
                    {errors.folderId && <p className="error">{errors.folderId}</p>}
                </div>
                <button type="submit" className="button" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Fetch and Upload'}
                </button>
            </form>
            {status && <p className={isLoading ? 'loading' : 'status'}>{status}</p>}
        </div>
    )
}

export default FetchAndUpload
