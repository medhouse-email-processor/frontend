import React, { useState } from 'react'
import { fetchEmails, uploadFiles } from '../services/api' // Assuming API functions are stored in api.js

const FetchAndUpload = () => {
    const [senderId, setSenderId] = useState('')
    const [date, setDate] = useState('')
    const [folderId, setFolderId] = useState('')
    const [status, setStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleFetchAndUpload = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setStatus('Fetching files...')

        try {
            // Step 1: Fetch files
            const fetchResponse = await fetchEmails(Number(senderId), date)

            if (fetchResponse.success) {
                setStatus(fetchResponse.message)
                const { mainFolderName, fetchedFiles } = fetchResponse
                console.log('Fetched Files:', fetchedFiles) // Log the files (you can use them if needed)

                // Step 2: Upload files to Google Drive
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
                        required
                    />
                </div>
                <div>
                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Google Drive Folder ID:</label>
                    <input
                        type="text"
                        value={folderId}
                        onChange={(e) => setFolderId(e.target.value)}
                        required
                    />
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
