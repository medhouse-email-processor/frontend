import React, { useState, useEffect } from 'react'
// import { updateSender } from '../services/api'

const SenderEditForm = ({ senderId, onClose, senders, onUpdateSuccess }) => {
    const [companyName, setCompanyName] = useState('')
    const [email, setEmail] = useState('')
    const [regions, setRegions] = useState([])
    const [selectedRegion, setSelectedRegion] = useState('')
    const [cities, setCities] = useState([])
    const [selectedCity, setSelectedCity] = useState('')
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState('')

    useEffect(() => {
        const foundSender = senders.find(s => s.id === senderId)
        if (foundSender) {
            setCompanyName(foundSender.companyName)
            setEmail(foundSender.email)
            const regionKeys = Object.keys(foundSender.cities)
            setRegions(regionKeys)
            if (regionKeys.length > 0) {
                setSelectedRegion(regionKeys[0])
                setCities(foundSender.cities[regionKeys[0]])
            }
        }
    }, [senderId, senders])

    const handleRegionChange = (event) => {
        const region = event.target.value
        setSelectedRegion(region)
        setCities(senders.find(s => s.id === senderId).cities[region] || [])
        setSelectedCity('')
    }

    const handleCityChange = (event) => {
        setSelectedCity(event.target.value)
    }

    const validateForm = () => {
        const newErrors = {}
        if (!companyName) newErrors.companyName = 'Требуется наименование отправителя.'
        if (!email) newErrors.email = 'Введите корректный email.'
        if (!selectedRegion) newErrors.selectedRegion = 'Выберите регион.'
        if (!selectedCity) newErrors.selectedCity = 'Выберите город.'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!validateForm()) return

        const updatedData = { companyName, email, selectedRegion, selectedCity }
        // await updateSender(senderId, updatedData)
        console.log(updatedData)
        setStatus('Изменения сохранены.')
        onUpdateSuccess()
        onClose()
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Наименование:</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                {errors.companyName && <p className="error">{errors.companyName}</p>}
            </div>
            <div>
                <label>Электронная почта:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <div>
                <label>Выберите регион:</label>
                <select value={selectedRegion} onChange={handleRegionChange}>
                    {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                    ))}
                </select>
                {errors.selectedRegion && <p className="error">{errors.selectedRegion}</p>}
            </div>
            <div>
                <label>Выберите город:</label>
                <select value={selectedCity} onChange={handleCityChange}>
                    {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                {errors.selectedCity && <p className="error">{errors.selectedCity}</p>}
            </div>
            <button type="submit" className="button">Сохранить</button>
            <button type="button" onClick={onClose} className="button cancel">Отмена</button>
            {status && <p className="status">{status}</p>}
        </form>
    )
}

export default SenderEditForm
