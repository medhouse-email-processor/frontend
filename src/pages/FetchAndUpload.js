// src/pages/FetchAndUpload.js
import React, { useState, useEffect } from 'react'
import { fetchEmails, uploadFiles, baseURL, getSenders, getFolderId } from '../services/api'

const FetchAndUpload = () => {
    const [senderId, setSenderId] = useState('')
    const [date, setDate] = useState('')
    const [folderId, setFolderId] = useState('')
    const [status, setStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [detectedDocs, setDetectedDocs] = useState(0)
    const [excelDocs, setExcelDocs] = useState(0)
    const [fileDetails, setFileDetails] = useState({})
    const [senders, setSenders] = useState([])
    const [downloadUrl, setDownloadUrl] = useState('')
    const [uploadToDrive, setUploadToDrive] = useState(false)

    useEffect(() => {
        const fetchSenders = async () => {
            try {
                const response = await getSenders()
                setSenders(response)
            } catch (error) {
                console.error('Error fetching senders:', error)
            }
        }

        const fetchFolderId = async () => {
            try {
                const response = await getFolderId()
                if (response.success && response.folderId) {
                    setFolderId(response.folderId)
                }
            } catch (error) {
                console.error('Error fetching folder ID:', error)
            }
        }

        fetchSenders()
        fetchFolderId() // Load folderId on component mount
    }, [])

    const validateForm = () => {
        const newErrors = {}
        if (!senderId) {
            newErrors.senderId = 'Please select a valid sender.'
        }
        if (!date) {
            newErrors.date = 'Please select a valid date.'
        }
        if (uploadToDrive && !folderId) {
            newErrors.folderId = 'Google Drive Folder ID is required.'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleFetchAndUpload = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setStatus('Fetching files...')
        setDetectedDocs(0)
        setExcelDocs(0)
        setFileDetails({})

        try {
            const fetchResponse = await fetchEmails(Number(senderId), date, uploadToDrive)
            console.log(fetchResponse)

            if (fetchResponse.success) {
                const { mainFolderName, fetchedFiles, downloadUrl } = fetchResponse
                setDetectedDocs(fetchResponse.messages.length)
                setExcelDocs(fetchedFiles.length)
                setDownloadUrl(downloadUrl || '')

                const filesByFolder = fetchedFiles.reduce((acc, file) => {
                    const folder = file.city || 'city_undefined'
                    if (!acc[folder]) acc[folder] = []
                    acc[folder].push(file.filename)
                    return acc
                }, {})

                setFileDetails(filesByFolder)
                setStatus('Files fetched. Uploading files...')

                if (uploadToDrive) {
                    const uploadResponse = await uploadFiles(mainFolderName, folderId)
                    setStatus(uploadResponse.success ? 'Files uploaded successfully!' : uploadResponse.message)
                } else {
                    setStatus('Files fetched but not uploaded to Google Drive.')
                }
            } else {
                setStatus(`Error fetching files: ${fetchResponse.message}`)
            }
        } catch (error) {
            setStatus(`An error occurred: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container">
            <h1>Fetch and Upload Files</h1>
            <form onSubmit={handleFetchAndUpload}>
                <div>
                    <label>Sender:</label>
                    <select value={senderId} onChange={(e) => setSenderId(e.target.value)}>
                        <option value="">Select a sender</option>
                        {senders.map((sender) => (
                            <option key={sender.id} value={sender.id}>
                                {sender.companyName} ({sender.email})
                            </option>
                        ))}
                    </select>
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
                <div className="toggle-container">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={uploadToDrive}
                            onChange={() => setUploadToDrive(!uploadToDrive)}
                        />
                        <span className="slider"></span>
                    </label>
                    <span>Upload to Google Drive</span>
                </div>
                {uploadToDrive && (
                    <div>
                        <label>Google Drive Folder ID:</label>
                        <input
                            type="text"
                            value={folderId}
                            onChange={(e) => setFolderId(e.target.value)}
                        />
                        {errors.folderId && <p className="error">{errors.folderId}</p>}
                    </div>
                )}
                <button type="submit" className="button" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Fetch and Upload'}
                </button>
            </form>

            {status && <p className={isLoading ? 'loading' : 'status'}>{status}</p>}

            {/* Display details of fetched files */}
            {detectedDocs > 0 && (
                <div>
                    <h3>Detected Files</h3>
                    <p>Total Emails: {detectedDocs}</p>
                    <p>Total Excel Documents: {excelDocs}</p>

                    <div className="file-list">
                        {Object.entries(fileDetails).map(([folder, files]) => (
                            <div key={folder}>
                                <h4>Folder: {folder}</h4>
                                <ul>
                                    {files.map((filename, index) => (
                                        <li key={index}>{filename}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Conditionally render download button only if there are no errors */}
            {downloadUrl && (
                <div className="download-button-container">
                    <a href={`${baseURL}/${downloadUrl}`} className="button download-button">
                        Click here to download
                    </a>
                </div>
            )}
        </div>
    )
}

export default FetchAndUpload
