import { useState, useCallback } from 'react';

interface AlertState {
    message: string;
    isVisible: boolean;
    type: 'error' | 'info' | 'warning';
}

export const useCustomAlert = () => {
    const [alertState, setAlertState] = useState<AlertState>({
        message: '',
        isVisible: false,
        type: 'error'
    });

    const showAlert = useCallback((message: string, type: 'error' | 'info' | 'warning' = 'error') => {
        console.log('useCustomAlert showAlert called:', { message, type }); // Debug log
        setAlertState({
            message,
            isVisible: true,
            type
        });
        console.log('useCustomAlert showAlert - estado actualizado a visible: true'); // Debug log
    }, []);

    const hideAlert = useCallback(() => {
        console.log('useCustomAlert hideAlert called'); // Debug log
        setAlertState(prev => {
            console.log('useCustomAlert hideAlert - estado anterior:', prev); // Debug log
            return {
                ...prev,
                isVisible: false
            };
        });
    }, []);

    const showError = useCallback((message: string) => {
        console.log('useCustomAlert showError called with:', message); // Debug log
        showAlert(message, 'error');
    }, [showAlert]);

    const showInfo = useCallback((message: string) => {
        showAlert(message, 'info');
    }, [showAlert]);

    const showWarning = useCallback((message: string) => {
        showAlert(message, 'warning');
    }, [showAlert]);

    return {
        alertState,
        showAlert,
        hideAlert,
        showError,
        showInfo,
        showWarning
    };
};
