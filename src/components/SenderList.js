import React, { useState, useEffect } from 'react'
// import { getSenders } from '../services/api'
import SenderEditForm from './SenderEditForm'

// src/services/dummyData.js
export const dummySenders = [
    {
        id: 1,
        companyName: "Sender One",
        email: "contact@senderone.com",
        cities: {
            "Алматы": ["Алматы", "Алатау", "Есик"],
            "Астана": ["Астана", "Косшы"],
            "Караганда": ["Караганда", "Балхаш", "Жезказган"]
        }
    },
    {
        id: 2,
        companyName: "Sender Two",
        email: "info@sendertwo.kz",
        cities: {
            "Шымкент": ["Шымкент", "Арыс", "Кентау"],
            "Атырау": ["Атырау", "Кулсары"]
        }
    },
    {
        id: 3,
        companyName: "Sender Three",
        email: "support@senderthree.kz",
        cities: {
            "Павлодар": ["Павлодар", "Экибастуз"],
            "Петропавловск": ["Петропавловск", "Булаево"]
        }
    }
]

const SenderList = () => {
    const [senders, setSenders] = useState([])
    const [selectedSender, setSelectedSender] = useState(null)
    const [status, setStatus] = useState('')

    useEffect(() => {
        fetchSenders()
    }, [])

    const fetchSenders = async () => {
        try {
            // const data = await getSenders()
            // setSenders(data)
            setSenders(dummySenders)
        } catch (error) {
            setStatus('Ошибка при загрузке отправителей.')
        }
    }

    return (
        <div>
            <h2>Список отправителей</h2>
            {status && <p className="status">{status}</p>}
            <ul>
                {senders.map((sender) => (
                    <li key={sender.id}>
                        <button onClick={() => setSelectedSender(sender.id)}>
                            {sender.companyName}
                        </button>
                    </li>
                ))}
            </ul>

            {selectedSender && (
                <SenderEditForm
                    senderId={selectedSender}
                    onClose={() => setSelectedSender(null)}
                    onUpdateSuccess={fetchSenders} // Ensure this is handled in SenderEditForm
                    senders={senders}
                />
            )}
        </div>
    )
}

export default SenderList