import FlightBooking from "@/components/flights/FlightBooking";
import FlightTable from "@/components/flights/FlightTable";
import Navbar from "@/components/shared/Navbar";
import {useState, useEffect} from "react";
import {useSearchParams} from "react-router";
import { useFlightStore } from "@/stores/flightStore";
import FullScreenLoader from "@/components/shared/FullScreenLoader";
import { sendStatusSignal } from "@/services";

export default function Flights() {
    const [searchParams] = useSearchParams();
    const adultCount = parseInt(searchParams.get("adults") || "1");
    const flights = searchParams.get("flight");
    const [adults, setAdults] = useState(adultCount);
    
    const { isSearchingFlights, setSearchingFlights } = useFlightStore();

    // Fire-and-forget status: P2 al montar la pantalla de vuelos
    useEffect(() => {
        sendStatusSignal('P2');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cuando se monta el componente, si estamos buscando vuelos, mostrar el loader
    useEffect(() => {
        if (isSearchingFlights) {
            // Simular tiempo de búsqueda (1.5 segundos)
            const timer = setTimeout(() => {
                setSearchingFlights(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isSearchingFlights, setSearchingFlights]);

    return (
        <>
            <Navbar />
            <FlightBooking adults={adults} setAdults={setAdults} />
            
            {/* Mostrar loader de pantalla completa mientras se buscan vuelos */}
            {isSearchingFlights ? (
                <FullScreenLoader message="Buscando vuelos disponibles..." />
            ) : (
                <FlightTable adultCount={adults} flights={flights} />
            )}
        </>
    );
}
