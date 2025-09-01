import {IoInformationCircle} from "react-icons/io5";
import {HiLockClosed} from "react-icons/hi2";
import { useFlightStore } from "@/stores/flightStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Reservation({logo}: {logo: string}) {
    const { searchInfo, selectedFlight, selectedReturnFlight } = useFlightStore();
    
    // Calcular información del vuelo
    const isRoundtrip = searchInfo.tripType === "roundtrip";
    const totalPassengers = searchInfo.adults + searchInfo.children;
    
    // Precio base del vuelo de ida
    const outboundPrice = selectedFlight?.price || 0;
    
    // Precio base del vuelo de regreso (si existe)
    const returnPrice = selectedReturnFlight?.price || 0;
    
    // Precio total por pasajero
    const pricePerPassenger = outboundPrice + returnPrice;
    
    // Total para todos los pasajeros
    const totalForAllPassengers = pricePerPassenger * totalPassengers;
    
    // Impuestos y tasas (dejamos en 0 como solicitaste)
    const taxesAndFees = 0;
    
    // Total final
    const finalTotal = totalForAllPassengers + taxesAndFees;
    
    // Formatear fecha de salida
    const departureDate = searchInfo.startDate ? 
        format(searchInfo.startDate, "EEEE, d MMMM yyyy", { locale: es }) : 
        "Fecha no disponible";
    
    // Formatear fecha de regreso (si es roundtrip)
    const returnDate = searchInfo.endDate ? 
        format(searchInfo.endDate, "EEEE, d MMMM yyyy", { locale: es }) : 
        null;

    return (
        <div className="md:col-span-3 space-y-4">
            <div className="bg-white  border border-light rounded-md">
                <div className="p-3  space-y-1">
                    <h2 className="text-xl font-semibold mb-2">Tu reservación</h2>
                    
                    {/* Vuelo de ida */}
                    <div className="flex items-center justify-between">
                        <p>{departureDate}</p>
                        <div className="flex items-center text-xs font-semibold gap-1">
                            <img src={logo} alt="Aerolínea" className="h-6" />
                        </div>
                    </div>
                    <p>
                        Vuelo: {selectedFlight?.flightNumber || "N/A"} <span className="text-blue-600">{selectedFlight?.direct ? "Directo" : "1 Parada"}</span>
                    </p>
                    <p>
                        Sale: <strong>{searchInfo.origin?.name || "Origen"} - {selectedFlight?.departureTime || "00:00"}</strong>
                    </p>
                    <p>
                        Llega: <strong>{searchInfo.destination?.name || "Destino"} - {selectedFlight?.arrivalTime || "00:00"}</strong>
                    </p>
                    <p>
                        Tarifa: <span className="text-blue-600">{selectedFlight?.fareType || "N/A"}</span>
                    </p>
                    
                    {/* Vuelo de regreso (si es roundtrip) */}
                    {isRoundtrip && selectedReturnFlight && (
                        <>
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <p className="text-sm text-gray-600 mb-1">Vuelo de regreso:</p>
                                <p>
                                    Vuelo: {selectedReturnFlight.flightNumber} <span className="text-blue-600">{selectedReturnFlight.direct ? "Directo" : "1 Parada"}</span>
                                </p>
                                <p>
                                    Sale: <strong>{searchInfo.destination?.name || "Destino"} - {selectedReturnFlight.departureTime}</strong>
                                </p>
                                <p>
                                    Llega: <strong>{searchInfo.origin?.name || "Origen"} - {selectedReturnFlight.arrivalTime}</strong>
                                </p>
                                <p>
                                    Tarifa: <span className="text-blue-600">{selectedReturnFlight.fareType}</span>
                                </p>
                            </div>
                        </>
                    )}
                </div>
                <div className="space-y-1  bg-yellow-50 p-4 rounded ">
                    <div className="flex items-center justify-between">
                        <p>{totalPassengers} {searchInfo.adults === 1 ? "Adulto" : "Adulto(s)"}{searchInfo.children > 0 && ` + ${searchInfo.children} ${searchInfo.children === 1 ? "Niño" : "Niño(s)"}`}</p>
                        <p>$ {totalForAllPassengers.toLocaleString()} COP</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="flex items-center gap-1">
                            Impuestos, tasas y cargos <IoInformationCircle className="text-primary" />
                        </p>
                        <p>$ {taxesAndFees.toLocaleString()} COP</p>
                    </div>
                    <div className="text-xl text-muted font-semibold flex items-center justify-between">
                        <span>Total</span> <span>$ {finalTotal.toLocaleString()} COP</span>
                    </div>
                </div>
            </div>
            <div className=" bg-[#FAFAFA] p-4 rounded-md border-light border text-center">
                <p className="font-medium mb-1 flex  items-center gap-1 justify-center">
                    <HiLockClosed /> Su información personal y su transacción están seguras
                </p>
                <p className="font-semibold">www.TiquetesBaratos.com</p>
                <p className="text-muted mt-1">
                    <strong>No GUARDA INFORMACIÓN</strong> sobre las tarjetas de crédito de los usuarios que realicen las transacciones en nuestro
                    portal. Nuestra plataforma de pago en línea está avalada por VeriSign
                </p>
            </div>
        </div>
    );
}
