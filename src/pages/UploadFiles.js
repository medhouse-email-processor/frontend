import React, { useState } from 'react'
import { uploadFiles } from '../services/api'

function UploadFiles() {
    const [folderId, setFolderId] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const handleUpload = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            const result = await uploadFiles(folderId)
            if (result.success) {
                setSuccess(result.message)
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('Failed to upload files.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>Upload Files to Google Drive</h2>
            <form onSubmit={handleUpload}>
                <label>
                    Google Drive Folder ID:
                    <input type="text" value={folderId} onChange={(e) => setFolderId(e.target.value)} required />
                </label>
                <button type="submit" disabled={loading}>Upload Files</button>
            </form>

            {loading && <p>Uploading files, please wait...</p>}
            {success && <p className="success">{success}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    )
}

export default UploadFiles
