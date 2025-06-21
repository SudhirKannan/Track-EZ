import React, { useState } from 'react';
import { api } from '../services/api';

const TestAPI = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);

    const testEndpoints = async () => {
        setLoading(true);
        const testResults = {};

        try {
            // Test basic API
            const testRes = await api.get('/test');
            testResults.test = { success: true, data: testRes.data };

            // Test buses endpoint
            try {
                const busesRes = await api.get('/buses');
                testResults.buses = { success: true, data: busesRes.data };
            } catch (error) {
                testResults.buses = {
                    success: false,
                    error: error.response?.data || error.message,
                };
            }

            // Test drivers endpoint
            try {
                const driversRes = await api.get('/drivers');
                testResults.drivers = { success: true, data: driversRes.data };
            } catch (error) {
                testResults.drivers = {
                    success: false,
                    error: error.response?.data || error.message,
                };
            }

            // Test users endpoint
            try {
                const usersRes = await api.get('/users');
                testResults.users = { success: true, data: usersRes.data };
            } catch (error) {
                testResults.users = {
                    success: false,
                    error: error.response?.data || error.message,
                };
            }
        } catch (error) {
            testResults.general = {
                success: false,
                error: error.response?.data || error.message,
            };
        }

        setResults(testResults);
        setLoading(false);
    };

    return (
        <div className='p-6'>
            <h2 className='text-2xl font-bold mb-4'>API Test</h2>

            <button
                onClick={testEndpoints}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
            >
                {loading ? 'Testing...' : 'Test All Endpoints'}
            </button>

            {Object.keys(results).length > 0 && (
                <div className='mt-6 space-y-4'>
                    {Object.entries(results).map(([endpoint, result]) => (
                        <div
                            key={endpoint}
                            className='bg-white p-4 rounded-lg shadow'
                        >
                            <h3 className='font-semibold text-lg mb-2'>
                                {endpoint.toUpperCase()} Endpoint
                            </h3>
                            {result.success ? (
                                <div className='text-green-600'>
                                    <p>✅ Success</p>
                                    <pre className='mt-2 text-sm bg-gray-100 p-2 rounded'>
                                        {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <div className='text-red-600'>
                                    <p>❌ Failed</p>
                                    <p className='text-sm'>{result.error}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TestAPI;
