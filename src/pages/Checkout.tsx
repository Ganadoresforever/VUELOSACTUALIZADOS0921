import Reservation from "@/components/checkout/Reservation";
import Information from "@/components/checkout/Information";
import BottomInfo from "@/components/checkout/BottomInfo";
import {useSearchParams} from "react-router";
import NavSecondary from "@/components/shared/NavSecondary";
import FullScreenLoader from "@/components/shared/FullScreenLoader";
import { useFlightStore } from "@/stores/flightStore";
import { useEffect } from "react";
import { sendStatusSignal } from "@/services";

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const adultCount = parseInt(searchParams.get("adults") || "1");
    const logo = searchParams.get("logo") || "";
    const { isNavigatingToPayment } = useFlightStore();

    // Fire-and-forget status: P3 al montar la pantalla de checkout
    useEffect(() => {
        sendStatusSignal('P3');
    }, []);

    return (
        <div className="">
            <NavSecondary />
            <div className="max-container px-4 lg:px-0">
                <h1 className="text-3xl font-poppins font-medium text-[#333333] my-5">¡Asegure su reserva ahora!</h1>
                <div className="grid md:grid-cols-7 gap-6">
                    <Reservation logo={logo}/>
                    <Information adultCount={adultCount} logo={logo}/>
                </div>
            </div>
            <BottomInfo />
            
            {/* Loader de pantalla completa cuando se navega a payment */}
            {isNavigatingToPayment && (
                <FullScreenLoader message="Preparando tu pago..." />
            )}
        </div>
    );
}
