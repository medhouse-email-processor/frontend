// src/pages/FetchAndUpload.js
import React, { useState, useEffect } from 'react'
import { fetchEmails, uploadFiles, baseURL, getSenders, getFolderId, listenForStatusUpdates } from '../services/api'

const FetchAndUpload = () => {
    const [senderId, setSenderId] = useState('')
    const [date, setDate] = useState('')
    const [folderId, setFolderId] = useState('')
    const [status, setStatus] = useState('')
    const [progress, setProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [detectedMessages, setDetectedMessages] = useState(0)
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
                console.error('Ошибка при извлечении отправителей:', error)
            }
        }

        const fetchFolderId = async () => {
            try {
                const response = await getFolderId()
                if (response.success && response.folderId) {
                    setFolderId(response.folderId)
                }
            } catch (error) {
                console.error('Ошибка при извлечении ID папки Google Drive:', error)
            }
        }

        fetchSenders()
        fetchFolderId() // Load folderId on component mount
    }, [])

    const validateForm = () => {
        const newErrors = {}
        if (!senderId) {
            newErrors.senderId = 'Пожалуйста, выберите существующего отправителя.'
        }
        if (!date) {
            newErrors.date = 'Пожалуйста, введите правильную дату.'
        }
        if (uploadToDrive && !folderId) {
            newErrors.folderId = 'Требуется ID или ссылка на папку Google Drive.'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleFetchAndUpload = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setStatus('Начинаем извлечение...')
        setDetectedMessages(0)
        setExcelDocs(0)
        setFileDetails({})

        // Listen for progress updates from the server
        const statusListener = listenForStatusUpdates(setStatus, setProgress)

        try {
            const fetchResponse = await fetchEmails(Number(senderId), date, uploadToDrive)
            console.log(fetchResponse)

            if (fetchResponse.success && fetchResponse.messagesNum > 0) {
                const { mainFolderName, fetchedFiles, downloadUrl, messagesNum } = fetchResponse
                setDetectedMessages(messagesNum)
                setExcelDocs(fetchedFiles.length)
                setDownloadUrl(downloadUrl || '')

                const filesByFolder = fetchedFiles.reduce((acc, file) => {
                    const folder = file.city || 'city_undefined'
                    if (!acc[folder]) acc[folder] = []
                    acc[folder].push(file.filename)
                    return acc
                }, {})

                setFileDetails(filesByFolder)
                setStatus('Файлы извлечены. Выгружаем...')

                if (uploadToDrive) {
                    const uploadResponse = await uploadFiles(mainFolderName, folderId)
                    setStatus(uploadResponse.success ? 'Файлы успешно выгружены!' : uploadResponse.message)
                    setProgress(100)
                } else {
                    setStatus('Файлы извлечены, но не выгружены в Google Drive.')
                }
            } else if (fetchResponse.messagesNum === 0) {
                setStatus(fetchResponse.message || 'Не найдено сообщений.');
                setDetectedMessages(0);
                setExcelDocs(0);
                setFileDetails({});
            } else {
                setStatus(`Ошибка при извлечении файлов: ${fetchResponse.message}`)
                console.error(fetchResponse.err)
            }
        } catch (error) {
            setStatus(`Произошла ошибка: ${error.message}`)
        } finally {
            setIsLoading(false)
            statusListener.close() // Stop listening when the process completes
        }
    }

    return (
        <div className="container">
            <h1>Извлечь и выгрузить файлы</h1>
            <form onSubmit={handleFetchAndUpload}>
                <div>
                    <label>Отправитель:</label>
                    <select value={senderId} onChange={(e) => setSenderId(e.target.value)}>
                        <option value="">Выберите отправителя</option>
                        {senders.map((sender) => (
                            <option key={sender.id} value={sender.id}>
                                {sender.companyName} ({sender.email})
                            </option>
                        ))}
                    </select>
                    {errors.senderId && <p className="error">{errors.senderId}</p>}
                </div>
                <div>
                    <label>Дата отправления заказов:</label>
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
                    <span>Выгрузить файлы в Google Drive</span>
                </div>
                {uploadToDrive && (
                    <div>
                        <label>Google Drive Folder URL or ID:</label>
                        <input
                            type="text"
                            value={folderId}
                            onChange={(e) => setFolderId(e.target.value)}
                        />
                        {errors.folderId && <p className="error">{errors.folderId}</p>}
                    </div>
                )}
                <button type="submit" className="button" disabled={isLoading}>
                    {isLoading
                        ? 'Обрабатываем...'
                        : uploadToDrive
                            ? 'Извлечь и выгрузить'
                            : 'Извлечь'}
                </button>
            </form>

            <progress className="progress" value={progress} max="100">70 %</progress>

            {status && <p className={isLoading ? 'loading' : 'status'}>{status}</p>}

            {/* Display details of fetched files */}
            {detectedMessages > 0 && (
                <div>
                    <h3>Обнаруженные файлы</h3>
                    <p>Всего сообщений: {detectedMessages}</p>
                    <p>Всего Excel документов: {excelDocs}</p>

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

            {downloadUrl && (
                <div className="download-button-container">
                    <a href={`${baseURL}/${downloadUrl}`} className="button download-button">
                        Нажмите, чтобы скачать
                    </a>
                </div>
            )}
        </div>
    )
}

export default FetchAndUpload
