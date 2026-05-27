import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { check2FAStatus } from '../../services/api/authService';
import { authSuccess, authFailure } from '../../features/authSlice';

const TwoFactorPrompt = ({ challenge, tempToken, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        // Countdown timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onCancel(); // Time expired
                    toast.error("2FA session expired. Please sign in again.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onCancel]);

    useEffect(() => {
        // Polling logic
        const pollTimer = setInterval(async () => {
            try {
                const response = await check2FAStatus(tempToken);
                if (response?.isVerified) {
                    clearInterval(pollTimer);
                    dispatch(authSuccess({ user: response.user }));
                    toast.success(response.message || "2FA Verified successfully!");
                    navigate("/"); // Go to dashboard
                }
            } catch (error) {
                clearInterval(pollTimer);
                dispatch(authFailure(error?.message));
                toast.error(error?.message || "2FA session ended");
                onCancel();
            }
        }, 3000); // poll every 3 seconds

        return () => clearInterval(pollTimer);
    }, [tempToken, dispatch, navigate, onCancel]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Verify it's you</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                We sent an email to your inbox. Tap the number below on your device to sign in.
            </p>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8 shadow-inner border border-gray-200 dark:border-gray-600">
                <span className="text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">
                    {challenge}
                </span>
            </div>

            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Waiting for verification...
            </p>
            <p className="text-xs text-gray-400 mb-6">
                Expires in {formatTime(timeLeft)}
            </p>

            <button 
                onClick={onCancel}
                className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium"
            >
                Cancel and return to Sign In
            </button>
        </div>
    );
};

export default TwoFactorPrompt;
