import React, { useState } from 'react'
import { createSender } from '../services/api'

const CreateSender = () => {
    const [companyName, setCompanyName] = useState('')
    const [email, setEmail] = useState('')
    const [cities, setCities] = useState('')
    const [cellCoordinates, setCellCoordinates] = useState('')
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {}

        if (!companyName) {
            newErrors.companyName = 'Требуется наименование отправителя.'
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email || !emailRegex.test(email)) {
            newErrors.email = 'Пожалуйста, введите рабочую электронную почту.'
        }

        if (!cities) {
            newErrors.cities = 'Пожалуйста, введите не менее одного города.'
        } else {
            const cityList = cities.split(',').map(city => city.trim()).filter(city => city.length > 0) // Trim & remove empty entries
            if (cityList.length === 0) {
                newErrors.cities = 'Введите хотя бы один город.'
            }
        }

        const cellRegex = /^[A-Z]+\d+$/ // Pattern for "A1", "B2", etc.
        if (!cellCoordinates) {
            newErrors.cellCoordinates = 'Координаты ячеек должны быть по образу A1, B2 и т.д.'
        } else {
            const cells = cellCoordinates.split(',').map(cell => cell.trim()) // Split and trim spaces
            if (cells.some(cell => !cellRegex.test(cell))) { // Check if any cell is invalid
                newErrors.cellCoordinates = 'Некоторые координаты неверны. Используйте формат A1, B2 и т.д.'
            }
        }

        if (!password || password.length < 8) {
            newErrors.password = 'Пароль должен состоять как минимум из 8 символов.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCreateSender = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        setStatus('Добавляем отправителя...')

        try {
            const cityArray = cities.split(',').map(city => city.trim())
            const cellsArray = cellCoordinates.split(',').map(cell => cell.trim())

            const requestBody = {
                companyName,
                email,
                cities: cityArray,
                cellCoordinates: cellsArray,
                password // Including password in the request
            }

            console.log(requestBody)

            const createResponse = await createSender(requestBody)

            if (createResponse.success) {
                setStatus('Отправитель успешно добавлен!')
            } else {
                setStatus('Ошибка при добавлении отправителя: ' + createResponse.message)
            }
        } catch (error) {
            setStatus('Произошла ошибка: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container">
            <h1>Добавить отправителя</h1>
            <form onSubmit={handleCreateSender}>
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
                    <label>Электронная почта:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="error">{errors.email}</p>}
                </div>
                <div>
                    <label>Города (перечисленные через запятую):</label>
                    <input
                        type="text"
                        value={cities}
                        onChange={(e) => setCities(e.target.value)}
                    />
                    {errors.cities && <p className="error">{errors.cities}</p>}
                </div>
                <div>
                    <label>Координаты ячеек (перечисленные через запятую):</label>
                    <input
                        type="text"
                        value={cellCoordinates}
                        onChange={(e) => setCellCoordinates(e.target.value)}
                    />
                    {errors.cellCoordinates && <p className="error">{errors.cellCoordinates}</p>}
                </div>
                <div>
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {errors.password && <p className="error">{errors.password}</p>}
                </div>
                <button type="submit" className="button" disabled={isLoading}>
                    {isLoading ? 'Добавляем...' : 'Добавить отправителя'}
                </button>
            </form>
            {status && <p className={isLoading ? 'loading' : 'status'}>{status}</p>}
        </div>
    )
}

export default CreateSender
