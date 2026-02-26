'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Gift } from 'lucide-react';
import { loginApi } from '@/lib/api';
import { setToken } from '@/lib/auth.client';

interface LoginForm { username: string; password: string; }

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    async function onSubmit(data: LoginForm) {
        setError('');
        try {
            const res = await loginApi(data.username, data.password);
            setToken(res.access_token);
            router.replace('/functions');
        } catch {
            setError('Invalid username or password');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 p-4">
            <div className="card w-full max-w-md p-8">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary-100 rounded-full p-4 mb-3">
                        <Gift className="w-10 h-10 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Gift Tracker</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

                    {/* Username */}
                    <div className="form-group">
                        <label className="label">Username</label>
                        <input
                            {...register('username', { required: 'Username is required' })}
                            className="input"
                            placeholder="admin"
                            autoComplete="username"
                        />
                        {errors.username && (
                            <p className="text-xs text-red-500">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="label">Password</label>
                        <div className="relative">
                            <input
                                {...register('password', { required: 'Password is required' })}
                                type={showPw ? 'text' : 'password'}
                                className="input pr-10"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 text-center bg-red-50 rounded-lg py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary justify-center py-3 text-base mt-2"
                    >
                        {isSubmitting ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
