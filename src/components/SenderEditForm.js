import React, { useState, useEffect } from 'react'
import { getSenders, updateSender } from '../services/api'

const SenderEditForm = () => {
    const [senders, setSenders] = useState([])
    const [selectedSenderId, setSelectedSenderId] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [email, setEmail] = useState('')
    const [cities, setCities] = useState('')
    const [cellCoordinates, setCellCoordinates] = useState('')
    const [daichinCoordinates, setDaichinCoordinates] = useState({ names: '', coordinates: '' })
    const [testmedCoordinates, setTestmedCoordinates] = useState({ names: '', coordinates: '' })
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    // Fetch senders on component mount
    useEffect(() => {
        const fetchSenders = async () => {
            const response = await getSenders()
            if (response.success === false) {
                setStatus('Ошибка загрузки отправителей: ' + response.message)
            } else {
                setSenders(response)
            }
        }
        fetchSenders()
    }, [])

    // Load selected sender's data into the form
    useEffect(() => {
        if (selectedSenderId) {
            const sender = senders.find(s => s.id === parseInt(selectedSenderId))
            if (sender) {
                setCompanyName(sender.companyName || '')
                setEmail(sender.email || '')

                // Reverse the cities dictionary
                const citiesObj = sender.cities || {}
                const reversedCities = {}

                // Step 1: Identify main cities (where key === value) and initialize them
                Object.entries(citiesObj).forEach(([subCity, mainCity]) => {
                    if (subCity === mainCity) {
                        reversedCities[mainCity] = []
                    }
                })

                // Step 2: Assign sub-cities to their main cities
                Object.entries(citiesObj).forEach(([subCity, mainCity]) => {
                    if (subCity !== mainCity) { // Skip main city entries
                        reversedCities[mainCity].push(subCity)
                    }
                })

                // Step 3: Convert reversedCities to string format
                const citiesStr = Object.entries(reversedCities)
                    .map(([mainCity, subCities]) => {
                        // If no sub-cities, return just the main city
                        if (subCities.length === 0) {
                            return mainCity
                        }
                        // Otherwise, format as "MainCity [SubCity1, SubCity2]"
                        return `${mainCity} [${subCities.filter(city => city !== mainCity).join(', ')}]`
                    })
                    .join(',\n')

                setCities(citiesStr)
                setCellCoordinates((sender.cellCoordinates || []).join(', '))
                setDaichinCoordinates({
                    names: (sender.daichinCoordinates?.names || []).join(', '),
                    coordinates: (sender.daichinCoordinates?.coordinates || []).join(', ')
                })
                setTestmedCoordinates({
                    names: (sender.testmedCoordinates?.names || []).join(', '),
                    coordinates: (sender.testmedCoordinates?.coordinates || []).join(', ')
                })
            }
        } else {
            // Reset form when no sender is selected
            resetForm()
        }
    }, [selectedSenderId, senders])

    const resetForm = () => {
        setCompanyName('')
        setEmail('')
        setCities('')
        setCellCoordinates('')
        setDaichinCoordinates({ names: '', coordinates: '' })
        setTestmedCoordinates({ names: '', coordinates: '' })
        setPassword('')
        setErrors({})
    }

    const parseCities = (input) => {
        const cityDict = {}
        const regex = /([^,\[\]]+)\s*\[([^\]]+)\](,|$)/g
        let match

        while ((match = regex.exec(input)) !== null) {
            const mainCity = match[1].trim()
            const subCities = match[2].split(',').map(city => city.trim())
            cityDict[mainCity] = [mainCity, ...subCities]
        }

        const processedPart = input.replace(regex, '').trim()
        processedPart.split(',')
            .map(city => city.trim())
            .filter(city => city)
            .forEach(city => {
                if (!Object.keys(cityDict).some(mainCity => cityDict[mainCity].includes(city))) {
                    cityDict[city] = [city]
                }
            })

        if (processedPart.includes(']')) {
            throw new Error('Некорректный формат городов. Проверьте, что после "]" идет запятая или конец строки.')
        }

        return JSON.stringify(cityDict)
    }

    const validateForm = () => {
        const newErrors = {}

        if (!selectedSenderId) newErrors.senderId = 'Выберите отправителя для обновления.'
        if (!companyName) newErrors.companyName = 'Требуется наименование отправителя.'

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const domainRegex = /^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!email || (!emailRegex.test(email) && !domainRegex.test(email))) {
            newErrors.email = 'Введите корректный email (user@example.com) или домен (@example.com).'
        }

        if (!cities) newErrors.cities = 'Введите города в формате "Город [Подгород1, Подгород2]"'

        const cellRegex = /^[A-Z]+\d+$/
        if (!cellCoordinates) newErrors.cellCoordinates = 'Введите координаты ячеек (A1, B2 и т.д.).'
        else {
            const cells = cellCoordinates.split(',').map(cell => cell.trim())
            if (cells.some(cell => !cellRegex.test(cell))) {
                newErrors.cellCoordinates = 'Некоторые координаты неверны. Используйте формат A1, B2 и т.д.'
            }
        }

        const coordinateRegex = /^[^,]+(,[^,]+)*$/
        if (!daichinCoordinates.names || !coordinateRegex.test(daichinCoordinates.names)) {
            newErrors.daichinCoordinates = 'Введите корректный список имен для Daichin (через запятую).'
        }
        if (!daichinCoordinates.coordinates || !coordinateRegex.test(daichinCoordinates.coordinates)) {
            newErrors.daichinCoordinates = 'Введите корректный список координат для Daichin (через запятую).'
        }
        if (!testmedCoordinates.names || !coordinateRegex.test(testmedCoordinates.names)) {
            newErrors.testmedCoordinates = 'Введите корректный список имен для Testmed (через запятую).'
        }
        if (!testmedCoordinates.coordinates || !coordinateRegex.test(testmedCoordinates.coordinates)) {
            newErrors.testmedCoordinates = 'Введите корректный список координат для Testmed (через запятую).'
        }

        if (!password || password.length < 8) newErrors.password = 'Пароль должен состоять минимум из 8 символов.'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleUpdateSender = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        setStatus('Обновляем отправителя...')

        try {
            const requestBody = {
                companyName,
                email,
                cities: parseCities(cities),
                cellCoordinates: cellCoordinates.split(',').map(cell => cell.trim()),
                daichinCoordinates: {
                    names: daichinCoordinates.names.split(',').map(name => name.trim()),
                    coordinates: daichinCoordinates.coordinates.split(',').map(coord => coord.trim()),
                },
                testmedCoordinates: {
                    names: testmedCoordinates.names.split(',').map(name => name.trim()),
                    coordinates: testmedCoordinates.coordinates.split(',').map(coord => coord.trim()),
                },
                password, // Include password for admin verification
            }

            const response = await updateSender(selectedSenderId, requestBody)

            if (response.success) {
                setStatus('Отправитель успешно обновлен!')
                // Update local senders list
                setSenders(senders.map(s =>
                    s.id === parseInt(selectedSenderId) ? { ...s, ...response.data.sender } : s
                ))
            } else {
                setStatus('Ошибка: ' + response.message)
            }
        } catch (error) {
            setStatus('Произошла ошибка: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleUpdateSender}>
            <div>
                <label>Отправитель:</label>
                <select
                    value={selectedSenderId}
                    onChange={(e) => setSelectedSenderId(e.target.value)}
                >
                    <option value="">Выберите отправителя</option>
                    {senders.map((sender) => (
                        <option key={sender.id} value={sender.id}>
                            {sender.companyName} ({sender.email})
                        </option>
                    ))}
                </select>
                {errors.senderId && <p className="error">{errors.senderId}</p>}
            </div>

            {selectedSenderId && (
                <>
                    <div>
                        <label>Наименование:</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                        {errors.companyName && <p className="error">{errors.companyName}</p>}
                    </div>
                    <div>
                        <label>Электронная почта (или домен):</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@domain.com или @domain.com"
                        />
                        {errors.email && <p className="error">{errors.email}</p>}
                    </div>
                    <div>
                        <label>Города (в формате Город [Подгород1, Подгород2]):</label>
                        <textarea
                            value={cities}
                            onChange={(e) => setCities(e.target.value)}
                            rows={7}
                        />
                        {errors.cities && <p className="error">{errors.cities}</p>}
                    </div>
                    <div>
                        <label>Координаты ячеек:</label>
                        <input
                            placeholder='Координаты (через запятую)'
                            type="text"
                            value={cellCoordinates}
                            onChange={(e) => setCellCoordinates(e.target.value)}
                        />
                        {errors.cellCoordinates && <p className="error">{errors.cellCoordinates}</p>}
                    </div>
                    <div>
                        <label>Параметры Дайчин:</label>
                        <div>
                            <input
                                type="text"
                                placeholder="Наименования (через запятую)"
                                value={daichinCoordinates.names}
                                onChange={(e) => setDaichinCoordinates({ ...daichinCoordinates, names: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Координаты (через запятую)"
                                value={daichinCoordinates.coordinates}
                                onChange={(e) => setDaichinCoordinates({ ...daichinCoordinates, coordinates: e.target.value })}
                            />
                        </div>
                        {errors.daichinCoordinates && <p className="error">{errors.daichinCoordinates}</p>}
                    </div>
                    <div>
                        <label>Параметры Тест-Медикал:</label>
                        <div>
                            <input
                                type="text"
                                placeholder="Наименования (через запятую)"
                                value={testmedCoordinates.names}
                                onChange={(e) => setTestmedCoordinates({ ...testmedCoordinates, names: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Координаты (через запятую)"
                                value={testmedCoordinates.coordinates}
                                onChange={(e) => setTestmedCoordinates({ ...testmedCoordinates, coordinates: e.target.value })}
                            />
                        </div>
                        {errors.testmedCoordinates && <p className="error">{errors.testmedCoordinates}</p>}
                    </div>
                    <div>
                        <label>Пароль (для админ действий):</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {errors.password && <p className="error">{errors.password}</p>}
                    </div>
                    <button type="submit" className="button" disabled={isLoading}>
                        {isLoading ? 'Обновляем...' : 'Обновить отправителя'}
                    </button>
                </>
            )}
            {status && <p className={isLoading ? 'loading' : 'status'}>{status}</p>}
        </form>
    )
}

export default SenderEditForm