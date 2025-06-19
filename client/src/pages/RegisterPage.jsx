import { Bus, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        studentId: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await register(formData);

        if (result.success) {
            switch (result.user.role) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'student':
                    navigate('/student');
                    break;
                case 'parent':
                    navigate('/parent');
                    break;
                case 'staff':
                    navigate('/staff');
                    break;
                default:
                    navigate('/');
            }
        } else {
            setError(
                result.message || 'Failed to create account. Please try again.'
            );
        }

        setLoading(false);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div>
                    <div className='flex justify-center'>
                        <Bus className='h-12 w-12 text-blue-600' />
                    </div>
                    <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
                        Create your TrackEZ account
                    </h2>
                    <p className='mt-2 text-center text-sm text-gray-600'>
                        Or{' '}
                        <Link
                            to='/login'
                            className='font-medium text-blue-600 hover:text-blue-500'
                        >
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
                    {error && (
                        <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>
                            {error}
                        </div>
                    )}

                    <div className='space-y-4'>
                        <div>
                            <label
                                htmlFor='name'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Full Name
                            </label>
                            <input
                                id='name'
                                name='name'
                                type='text'
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                placeholder='Enter your full name'
                            />
                        </div>

                        <div>
                            <label
                                htmlFor='email'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Email address
                            </label>
                            <input
                                id='email'
                                name='email'
                                type='email'
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                placeholder='Enter your email'
                            />
                        </div>

                        <div>
                            <label
                                htmlFor='password'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Password
                            </label>
                            <div className='mt-1 relative'>
                                <input
                                    id='password'
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className='appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                    placeholder='Enter your password'
                                />
                                <button
                                    type='button'
                                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className='h-4 w-4 text-gray-400' />
                                    ) : (
                                        <Eye className='h-4 w-4 text-gray-400' />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor='role'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Role
                            </label>
                            <select
                                id='role'
                                name='role'
                                value={formData.role}
                                onChange={handleChange}
                                className='mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                            >
                                <option value='student'>Student</option>
                                <option value='parent'>Parent</option>
                                <option value='staff'>Staff</option>
                                <option value='admin'>Admin</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor='phone'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Phone Number (Optional)
                            </label>
                            <input
                                id='phone'
                                name='phone'
                                type='tel'
                                value={formData.phone}
                                onChange={handleChange}
                                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                placeholder='Enter your phone number'
                            />
                        </div>

                        {formData.role === 'student' && (
                            <div>
                                <label
                                    htmlFor='studentId'
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Student ID (Optional)
                                </label>
                                <input
                                    id='studentId'
                                    name='studentId'
                                    type='text'
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                    placeholder='Enter your student ID'
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type='submit'
                            disabled={loading}
                            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
