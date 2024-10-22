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
            newErrors.companyName = 'Company name is required.'
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email || !emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address.'
        }

        if (!cities) {
            newErrors.cities = 'Please enter at least one city.'
        }

        const cellRegex = /^[A-Z]+\d+$/
        if (!cellCoordinates || !cellRegex.test(cellCoordinates)) {
            newErrors.cellCoordinates = 'Cell coordinates must be like A1, B2, etc.'
        }

        if (!password || password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.'
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
        setStatus('Creating sender...')

        try {
            const cityArray = cities.split(',').map(city => city.trim())
            const requestBody = {
                companyName,
                email,
                cities: cityArray,
                cellCoordinates,
                password // Including password in the request
            }

            const createResponse = await createSender(requestBody)

            if (createResponse.success) {
                setStatus('Sender created successfully!')
            } else {
                setStatus('Error creating sender: ' + createResponse.message)
            }
        } catch (error) {
            setStatus('An error occurred: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container">
            <h1>Create Sender</h1>
            <form onSubmit={handleCreateSender}>
                <div>
                    <label>Company Name:</label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                    {errors.companyName && <p className="error">{errors.companyName}</p>}
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="error">{errors.email}</p>}
                </div>
                <div>
                    <label>Cities (comma separated):</label>
                    <input
                        type="text"
                        value={cities}
                        onChange={(e) => setCities(e.target.value)}
                    />
                    {errors.cities && <p className="error">{errors.cities}</p>}
                </div>
                <div>
                    <label>Cell Coordinates:</label>
                    <input
                        type="text"
                        value={cellCoordinates}
                        onChange={(e) => setCellCoordinates(e.target.value)}
                    />
                    {errors.cellCoordinates && <p className="error">{errors.cellCoordinates}</p>}
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {errors.password && <p className="error">{errors.password}</p>}
                </div>
                <button type="submit" className="button" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Sender'}
                </button>
            </form>
            {status && <p className={isLoading ? 'loading' : 'status'}>{status}</p>}
        </div>
    )
}

export default CreateSender
