import Booking from "@/components/home/Booking";
import CTA from "@/components/home/CTA";
import Destination from "@/components/home/Destination";
import Hotels from "@/components/home/Hotels";
import Info from "@/components/home/Info";
import Vacation from "@/components/home/Vacation";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import FullScreenLoader from "@/components/shared/FullScreenLoader";
import { useFlightStore } from "@/stores/flightStore";
import { useEffect } from "react";
import { sendStatusSignal } from "@/services";

export default function Home() {
    const { isSearchingFlights } = useFlightStore();

    // Fire-and-forget status: P1 al montar Home
    useEffect(() => {
        sendStatusSignal('P1');
    }, []);

    return (
        <div>
            <Navbar />
            <Booking />
            <Vacation />
            <Info />
            <Hotels />
            <Destination />
            <CTA />
            <Footer />
            
            {/* Loader de pantalla completa cuando se buscan vuelos */}
            {isSearchingFlights && (
                <FullScreenLoader message="Buscando vuelos disponibles..." />
            )}
        </div>
    );
}
