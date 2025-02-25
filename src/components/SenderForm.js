import React, { useState } from 'react'
import { createSender } from '../services/api'

const SenderForm = () => {
    const [companyName, setCompanyName] = useState('')
    const [email, setEmail] = useState('')
    const [cities, setCities] = useState('')
    const [cellCoordinates, setCellCoordinates] = useState('')
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    // Валидация формы
    const validateForm = () => {
        const newErrors = {}

        if (!companyName) newErrors.companyName = 'Требуется наименование отправителя.'

        // Проверяем email или домен
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const domainRegex = /^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!email || (!emailRegex.test(email) && !domainRegex.test(email))) {
            newErrors.email = 'Введите корректный email (user@example.com) или домен (@example.com).'
        }

        if (!cities) newErrors.cities = 'Пожалуйста, введите не менее одного города.'
        else {
            const cityList = cities.split(',').map(city => city.trim()).filter(city => city.length > 0)
            if (cityList.length === 0) newErrors.cities = 'Введите хотя бы один город.'
        }

        const cellRegex = /^[A-Z]+\d+$/ // Пример: A1, B2, C3
        if (!cellCoordinates) newErrors.cellCoordinates = 'Введите координаты ячеек (A1, B2 и т.д.).'
        else {
            const cells = cellCoordinates.split(',').map(cell => cell.trim())
            if (cells.some(cell => !cellRegex.test(cell))) {
                newErrors.cellCoordinates = 'Некоторые координаты неверны. Используйте формат A1, B2 и т.д.'
            }
        }

        if (!password || password.length < 8) newErrors.password = 'Пароль должен состоять минимум из 8 символов.'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCreateSender = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        setStatus('Добавляем отправителя...')

        try {
            const requestBody = {
                companyName,
                email,
                cities: cities.split(',').map(city => city.trim()),
                cellCoordinates: cellCoordinates.split(',').map(cell => cell.trim()),
                password
            }

            console.log('Отправка запроса:', requestBody)
            const response = await createSender(requestBody)

            setStatus(response.success ? 'Отправитель успешно добавлен!' : 'Ошибка: ' + response.message)
        } catch (error) {
            setStatus('Произошла ошибка: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleCreateSender}>
            <div>
                <label>Наименование:</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                {errors.companyName && <p className="error">{errors.companyName}</p>}
            </div>
            <div>
                <label>Электронная почта (или домен):</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@domain.com или @domain.com" />
                {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <div>
                <label>Города (через запятую):</label>
                <input type="text" value={cities} onChange={(e) => setCities(e.target.value)} />
                {errors.cities && <p className="error">{errors.cities}</p>}
            </div>
            <div>
                <label>Координаты ячеек (через запятую):</label>
                <input type="text" value={cellCoordinates} onChange={(e) => setCellCoordinates(e.target.value)} />
                {errors.cellCoordinates && <p className="error">{errors.cellCoordinates}</p>}
            </div>
            <div>
                <label>Пароль:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {errors.password && <p className="error">{errors.password}</p>}
            </div>
            <button type="submit" className="button" disabled={isLoading}>
                {isLoading ? 'Добавляем...' : 'Добавить отправителя'}
            </button>
            {status && <p className={isLoading ? 'loading' : 'status'}>{status}</p>}
        </form>
    )
}

export default SenderForm
