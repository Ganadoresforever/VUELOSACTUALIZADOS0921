import { useEffect, useRef } from 'react';
import { useFlightStore } from '@/stores/flightStore';

export const useInitialization = () => {
    const { searchInfo, updateSearchInfo } = useFlightStore();
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Esperar un momento para que Zustand termine de cargar los datos del localStorage
        const timer = setTimeout(() => {
            // Solo inicializar si:
            // 1. No se ha inicializado antes
            // 2. Realmente no hay información previa (no solo cargando)
            // 3. Los datos no están en localStorage
            if (!hasInitialized.current && 
                !searchInfo.startDate && 
                !searchInfo.endDate && 
                !searchInfo.origin && 
                !searchInfo.destination) {

                updateSearchInfo({
                    adults: 1,
                    children: 0,
                    childAges: [],
                    tripType: 'one-way'
                });
                
                hasInitialized.current = true;
            }
        }, 100); // Esperar 100ms para que localStorage se cargue

        return () => clearTimeout(timer);
    }, [searchInfo, updateSearchInfo]);
};
