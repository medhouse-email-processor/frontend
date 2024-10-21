import React, { useState } from 'react'
import { fetchEmails } from '../services/api'

function FetchFiles() {
    const [senderId, setSenderId] = useState('')
    const [day, setDay] = useState('')
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleFetch = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const result = await fetchEmails(senderId, day)
            if (result.success) {
                setFiles(result.fetchedFiles)
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('Failed to fetch files.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>Fetch Emails</h2>
            <form onSubmit={handleFetch}>
                <label>
                    Sender ID:
                    <input type="text" value={senderId} onChange={(e) => setSenderId(e.target.value)} required />
                </label>
                <label>
                    Date (YYYY-MM-DD):
                    <input type="date" value={day} onChange={(e) => setDay(e.target.value)} required />
                </label>
                <button type="submit" disabled={loading}>Fetch Files</button>
            </form>

            {loading && <p>Fetching files, please wait...</p>}
            {error && <p className="error">{error}</p>}
            <ul>
                {files.map((file, index) => (
                    <li key={index}>
                        <p>{file.filename} ({file.city || 'Unknown city'})</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default FetchFiles
