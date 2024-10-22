import React, { useState, useEffect } from 'react'
import { fetchEmails, uploadFiles, checkGoogleAuth } from '../services/api'
import { useLocation } from 'react-router-dom'

const FetchAndUpload = () => {
    const [senderId, setSenderId] = useState('')
    const [date, setDate] = useState('')
    const [folderId, setFolderId] = useState('')
    const [status, setStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [isAuthenticated, setIsAuthenticated] = useState(null)
    const [authUrl, setAuthUrl] = useState('')
    const [detectedDocs, setDetectedDocs] = useState(0)
    const [excelDocs, setExcelDocs] = useState(0)
    const [fileDetails, setFileDetails] = useState({})
    const location = useLocation() // Use location to access query params

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const searchParams = new URLSearchParams(location.search)
                const authSuccess = searchParams.get('authSuccess')

                if (authSuccess) {
                    setIsAuthenticated(true)
                } else {
                    const response = await checkGoogleAuth()
                    if (response.authenticated) {
                        setIsAuthenticated(true)
                    } else {
                        setIsAuthenticated(false)
                        setAuthUrl(response.authUrl)
                    }
                }
            } catch (error) {
                setStatus('Error checking Google authentication: ' + error.message)
            }
        }

        checkAuthStatus()
    }, [location])

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
        setDetectedDocs(0)
        setExcelDocs(0)
        setFileDetails({})

        try {
            const fetchResponse = await fetchEmails(Number(senderId), date)

            if (fetchResponse.success) {
                const { mainFolderName, fetchedFiles } = fetchResponse
                setDetectedDocs(fetchResponse.messages.length)
                setExcelDocs(fetchedFiles.length)

                // Organize filenames by folder name (city)
                const filesByFolder = fetchedFiles.reduce((acc, file) => {
                    const folder = file.city || 'city_undefined'
                    if (!acc[folder]) acc[folder] = []
                    acc[folder].push(file.filename)
                    return acc
                }, {})

                setFileDetails(filesByFolder)
                setStatus('Files fetched. Uploading files...')

                // Upload files to Google Drive
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

    if (isAuthenticated === null) {
        return <p>Checking Google authentication...</p>
    }

    if (isAuthenticated === false) {
        return (
            <div>
                <h2>You need to authenticate with Google to upload files.</h2>
                <a href={authUrl}>Authenticate with Google</a>
            </div>
        )
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

            {/* Display details of fetched files */}
            {detectedDocs > 0 && (
                <div>
                    <h3>Detected Files</h3>
                    <p>Total Emails: {detectedDocs}</p>
                    <p>Total Excel Documents: {excelDocs}</p>

                    {/* Wrap the files section with a scrollable div */}
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
        </div>
    )
}

export default FetchAndUpload
