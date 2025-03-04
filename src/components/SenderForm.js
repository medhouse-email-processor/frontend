import React, { useState } from 'react'
import { createSender } from '../services/api'

const SenderForm = () => {
    const [companyName, setCompanyName] = useState('')
    const [email, setEmail] = useState('')
    const [cities, setCities] = useState(defaultCities)
    const [cellCoordinates, setCellCoordinates] = useState('')
    const [daichinCoordinates, setDaichinCoordinates] = useState({ names: '', coordinates: '' })
    const [testmedCoordinates, setTestmedCoordinates] = useState({ names: '', coordinates: '' })
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const parseCities = (input) => {
        const cityDict = {}
        const regex = /([^,\[\]]+)\s*\[([^\]]+)\](,|$)/g // Ensures ] is followed by a comma or end of string
        let match

        // Process cities with sub-cities
        while ((match = regex.exec(input)) !== null) {
            const mainCity = match[1].trim()
            const subCities = match[2].split(',').map(city => city.trim())

            if (cityDict[mainCity]) {
                cityDict[mainCity] = [...new Set([...cityDict[mainCity], ...subCities])]
            } else {
                cityDict[mainCity] = [mainCity, ...subCities]
            }
        }

        // Remove processed cities from input to check for standalone cities
        const processedPart = input.replace(regex, '').trim()

        // Process standalone cities (not inside brackets)
        processedPart.split(',')
            .map(city => city.trim())
            .filter(city => city) // Remove empty entries
            .forEach(city => {
                if (!Object.keys(cityDict).some(mainCity => cityDict[mainCity].includes(city))) {
                    cityDict[city] = [city]
                }
            })

        // Final validation: check for improperly formatted cities
        if (processedPart.includes(']')) {
            throw new Error('Некорректный формат городов. Проверьте, что после "]" идет запятая или конец строки.')
        }

        return JSON.stringify(cityDict)
    }

    const validateForm = () => {
        const newErrors = {}

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

        // Validate daichinCoordinates and testmedCoordinates
        const coordinateRegex = /^[^,]+(,[^,]+)*$/ // Ensures comma-separated values
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

    const handleCreateSender = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        setStatus('Добавляем отправителя...')

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
                password,
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
                <label>Города (в формате Город [Подгород1, Подгород2]):</label>
                <textarea
                    value={cities}
                    onChange={(e) => setCities(e.target.value)}
                    rows={4}
                />
                {errors.cities && <p className="error">{errors.cities}</p>}
            </div>
            <div>
                <label>Координаты ячеек (через запятую):</label>
                <input type="text" value={cellCoordinates} onChange={(e) => setCellCoordinates(e.target.value)} />
                {errors.cellCoordinates && <p className="error">{errors.cellCoordinates}</p>}
            </div>
            <div>
                <label>Daichin Coordinates:</label>
                <div>
                    <input
                        type="text"
                        placeholder="Имена (через запятую)"
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
                <label>Testmed Coordinates:</label>
                <div>
                    <input
                        type="text"
                        placeholder="Имена (через запятую)"
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

const defaultCities = 'Актау [Жанаозен, Форт-Шевченко],\nАктобе [Алга, Жем, Кандыагаш, Темир, Хромтау, Шалкар, Эмба],\nАлматы [Алатау, Есик, Жаркент, Каскелен, Конаев, Сарканд, Талгар, Талдыкорган, Текели, Ушарал, Уштобе],\nАстана [Косшы, Нур-Султан],\nАтырау [Кулсары],\nКараганда [Караганды, Балхаш, Байконыр, Жезказган, Каражал, Каркаралинск, Приозёрск, Сарань, Сатпаев, Темиртау, Шахтинск],\nКокшетау [Акколь, Атбасар, Державинск, Ерейментау, Есиль, Макинск, Степногорск, Степняк, Щучинск],\nКостанай [Аркалык, Аулиеколь, Житикара, Затобольск, Лисаковск, Рудный, Тобыл],\nПавлодар [Аксу, Экибастуз],\nПетропавловск [Булаево, Мамлютка, Сергеевка, Тайынша],\nСемей [Абай, Аягоз, Курчатов, Серебрянск, Шемонаиха],\nТараз [Жанатас, Каратау, Шу],\nУральск [Аксай],\nУсть-Каменогорск [Алтай, Зайсан, Риддер, Серебрянск, Шар],\nШымкент [Арал, Арыс, Жетысай, Казалинск, Кентау, Кызылорда, Ленгер, Сарыагаш, Туркестан, Шардара]'

export default SenderForm