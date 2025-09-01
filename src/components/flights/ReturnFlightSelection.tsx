import {MdFlight} from "react-icons/md";
import {FaCircleInfo} from "react-icons/fa6";
import {FaPlane} from "react-icons/fa";
import {CgChevronDown, CgChevronRight} from "react-icons/cg";
import {BsCalendar2Date} from "react-icons/bs";
import {Link, useSearchParams} from "react-router";
import {useState, useEffect} from "react";
import {BiInfoCircle} from "react-icons/bi";
import { useFlightStore } from "@/stores/flightStore";
import { generateAllAirlinesFlights } from "@/utils/flightGenerator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import FlightLoader from "@/components/shared/FlightLoader";

export default function ReturnFlightSelection() {
    const [searchParams] = useSearchParams();
    const adultCount = parseInt(searchParams.get("adults") || "1");
    
    const { 
        searchInfo, 
        selectedFlight, 
        selectedReturnFlight, 
        setSelectedReturnFlight, 
        isGeneratingFlights, 
        setGeneratingFlights 
    } = useFlightStore();
    
    const [selectedReturnFlightLocal, setSelectedReturnFlightLocal] = useState<{
        id: number | null;
        tier: string;
    }>({
        id: null,
        tier: "basic",
    });

    const [returnFlights, setReturnFlights] = useState<any[]>([]);

    // Generar vuelos de regreso cuando se monta el componente
    useEffect(() => {
        if (searchInfo.destination && searchInfo.origin && searchInfo.endDate) {
            setGeneratingFlights(true);
            
            // Simular tiempo de generación (2 segundos)
            setTimeout(() => {
                const newReturnFlights = generateAllAirlinesFlights(
                    searchInfo.destination!.code,
                    searchInfo.origin!.code,
                    searchInfo.endDate!
                );
                setReturnFlights(newReturnFlights);
                setGeneratingFlights(false);
            }, 2000);
        }
    }, [searchInfo.destination, searchInfo.origin, searchInfo.endDate, setGeneratingFlights]);

    // Sincronizar selección local con el store
    useEffect(() => {
        if (selectedReturnFlight) {
            setSelectedReturnFlightLocal({
                id: selectedReturnFlight.id,
                tier: selectedReturnFlight.fareType,
            });
        }
    }, [selectedReturnFlight]);

    // Obtener vuelo de regreso seleccionado
    const selected = selectedReturnFlightLocal.id ? 
        returnFlights.flatMap((group) => group.flights).find((f: any) => f.id === selectedReturnFlightLocal.id) : null;
    
    const selectedGroup = selectedReturnFlightLocal.id ? 
        returnFlights.find((group) => group.flights.some((f: any) => f.id === selectedReturnFlightLocal.id)) : null;
    
    const selectedPrice = selected?.prices[selectedReturnFlightLocal.tier as keyof typeof selected.prices];
    const fareTypeKeys = ["basic", "standard", "plus", "premium"];

    // Formatear fecha para mostrar
    const formattedDate = searchInfo.endDate ? 
        format(searchInfo.endDate, "EEEE, d 'de' MMMM yyyy", { locale: es }) : 
        "Fecha no seleccionada";

    // Manejar selección de vuelo de regreso
    const handleReturnFlightSelection = (flightId: number, tier: string) => {
        setSelectedReturnFlightLocal({ id: flightId, tier });
        
        // Encontrar el vuelo y grupo seleccionados
        const flight = returnFlights.flatMap((group) => group.flights).find((f: any) => f.id === flightId);
        const group = returnFlights.find((g) => g.flights.some((f: any) => f.id === flightId));
        
        if (flight && group) {
            const flightSelection = {
                id: flight.id,
                departureTime: flight.departureTime,
                arrivalTime: flight.arrivalTime,
                duration: flight.duration,
                airline: group.name,
                fareType: tier,
                price: flight.prices[tier as keyof typeof flight.prices],
                flightNumber: flight.flightNumber,
                direct: flight.direct,
            };
            
            setSelectedReturnFlight(flightSelection);
        }
    };

    // Si se están generando vuelos, mostrar loader
    if (isGeneratingFlights) {
        return (
            <div className="max-container px-4 lg:px-0 pb-52">
                <FlightLoader 
                    message="Generando opciones de vuelo de regreso..." 
                    showPlane={true} 
                />
            </div>
        );
    }

    // Si no hay vuelos de regreso, mostrar mensaje
    if (!returnFlights.length) {
        return (
            <div className="max-container px-4 lg:px-0 pb-52">
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                        No se encontraron vuelos de regreso
                    </h3>
                    <p className="text-gray-500">
                        Intenta con otras fechas o contacta con soporte
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-container px-4 lg:px-0 pb-60 sm:pb-56 lg:pb-52">
            {/* Header de vuelo de regreso */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <FaPlane className="w-6 h-6 text-blue-600 rotate-180" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Selecciona tu vuelo de regreso
                        </h2>
                        <p className="text-gray-600">
                            <span className="font-medium">{searchInfo.destination?.name} ({searchInfo.destination?.code})</span>
                            {" "}→{" "}
                            <span className="font-medium">{searchInfo.origin?.name} ({searchInfo.origin?.code})</span>
                            {" "}• {formattedDate}
                        </p>
                    </div>
                </div>
            </div>

            {/* Resumen del vuelo de ida seleccionado */}
            {selectedFlight && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Vuelo de ida seleccionado:</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">{selectedFlight.departureTime}</span>
                        <FaPlane className="w-4 h-4" />
                        <span className="font-medium">{selectedFlight.arrivalTime}</span>
                        <span className="text-gray-400">•</span>
                        <span>{selectedFlight.airline}</span>
                        <span className="text-gray-400">•</span>
                        <span>Vuelo {selectedFlight.flightNumber}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-medium">${selectedFlight.price?.toLocaleString()}</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col-reverse lg:flex-row gap-5 items-center justify-between my-6 bg-white">
                <p className="text-base text-gray-700">Tarifas por viajero con impuestos y sobrecargos en ($ COP)</p>
                <div className="flex items-center flex-wrap gap-2 justify-center lg:justify-start">
                    <label className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-full text-sm font-medium h-10 px-4 bg-[#FFEB3B] text-blue-700 border border-blue-700">
                        <input type="checkbox" />
                        Más Económicos
                    </label>

                    <button className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-full text-sm font-medium h-10 px-4 bg-white text-blue-700 border border-blue-700">
                        Filtros
                        <CgChevronDown className="w-4 h-4 ml-1" />
                    </button>

                    <button className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-full text-sm font-medium h-10 px-4 bg-white text-blue-700 border border-blue-700">
                        <BsCalendar2Date className="w-4 h-4 mr-1" />
                        Fechas cercanas
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {returnFlights.map((info, index) => (
                    <div key={`return-group-${index}`} className={`hidden lg:block border-2 ${info.borderColor} overflow-hidden rounded-lg `}>
                        <div className={`${info.bgColor} text-white flex items-center gap-4`}>
                            <div className="bg-white w-40 px-3 py-2">
                                <img src={info.logo} alt={info.name} />
                            </div>
                            <p className="font-medium">Vuelo de regreso</p>
                        </div>

                        <div className="p-3">
                            <div className="border border-gray-300 rounded-lg ">
                                <div className="grid grid-cols-5 gap-5 border-b p-3 border-gray-300">
                                    <div className="flex items-center col-span-2 gap-2">
                                        <button className="flex items-center gap-2 border rounded-full px-2 border-purple-600 text-purple-600 ">
                                            <MdFlight className="-rotate-90" /> Vuelos de regreso
                                        </button>
                                        <p>{formattedDate}</p>
                                    </div>
                                    <div className="grid grid-cols-6 col-span-3 text-center">
                                        <p className="col-span-2 text-blue-600 flex items-center gap-1">
                                            ¿Qué incluye cada tarifa? <FaCircleInfo />
                                        </p>
                                        {info.fareTypes.map((fareType: string) => (
                                            <p key={fareType}>{fareType}</p>
                                        ))}
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-300">
                                    {info.flights.map(({id, departureTime, arrivalTime, duration, flightNumber, direct, prices}: any) => (
                                        <div key={id} className="grid grid-cols-5 gap-5">
                                            <div className="col-span-2 pl-3 flex items-center justify-between ">
                                                <div className="flex flex-col items-center ">
                                                    <span className="text-xs text-black/50">{duration}</span>
                                                    <div className="-mt-2 flex items-center gap-5 font-semibold">
                                                        <span>{departureTime}</span>
                                                        <div className="flex items-center gap-0.5 text-gray-500">
                                                            <span className="inline-block size-3 rounded-full border border-gray-400"></span>
                                                            <span className="inline-block w-30 border-b border-dashed"></span>
                                                            <FaPlane />
                                                        </div>
                                                        <span>{arrivalTime}</span>
                                                    </div>
                                                </div>
                                                <span className="font-medium text-blue-600">{direct ? "Directo" : "Con escala"}</span>
                                            </div>

                                            <div
                                                className={`grid ${
                                                    info.fareTypes.length === 3 ? "grid-cols-5" : "grid-cols-6"
                                                } col-span-3 items-center text-center`}
                                            >
                                                <p className="col-span-2">Vuelo {flightNumber}</p>

                                                {info.fareTypes.map((_, idx: number) => {
                                                    const tierKey = fareTypeKeys[idx];
                                                    return (
                                                        <label
                                                            key={tierKey}
                                                            className={`flex flex-col items-center gap-1 cursor-pointer py-3 ${
                                                                tierKey === "basic"
                                                                    ? "bg-yellow-200"
                                                                    : tierKey === "standard"
                                                                    ? "bg-gray-100"
                                                                    : tierKey === "plus"
                                                                    ? "bg-gray-200"
                                                                    : "bg-purple-100"
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="return-flight-selection"
                                                                checked={selectedReturnFlightLocal.id === id && selectedReturnFlightLocal.tier === tierKey}
                                                                onChange={() => handleReturnFlightSelection(id, tierKey)}
                                                            />
                                                            <span className="cursor-pointer">
                                                                ${prices[tierKey as keyof typeof prices]?.toLocaleString() || 'N/A'}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Versión móvil */}
            <div className="space-y-8">
                {returnFlights.map((info, index) => (
                    <div key={`mobile-return-flight-${index}`} className={`lg:hidden border-2 overflow-hidden rounded-lg ${info.borderColor}`}>
                        <div className={`text-white flex items-center  gap-4 ${info.bgColor}`}>
                            <div className="bg-white w-40 px-3 py-1">
                                <img src={info.logo} alt={info.name} />
                            </div>
                            <p className="font-medium">Vuelo de regreso</p>
                        </div>

                        <div className="border  border-gray-300 rounded-lg">
                            {/* Mobile Header */}
                            <div className="lg:hidden p-3 border-b border-gray-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <button className="flex items-center gap-2 border rounded-full px-2 border-purple-600 text-purple-600">
                                        <FaPlane className="-rotate-90 w-4 h-4" /> Vuelos de regreso
                                    </button>
                                </div>
                                <p className="text-blue-600 flex items-center gap-1">
                                    ¿Qué incluye cada tarifa? <BiInfoCircle className="w-4 h-4" />
                                </p>
                            </div>

                            {/* Mobile Flight Cards */}
                            <div className=" space-y-4 p-3">
                                {info.flights.map(({id, departureTime, arrivalTime, duration, flightNumber, direct, prices}: any) => (
                                    <div key={id} className="border border-gray-300 rounded-lg overflow-hidden">
                                        {/* Flight Info Header */}
                                        <div className="bg-gray-50 p-3 border-b">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-5 font-semibold">
                                                    <span>{departureTime}</span>
                                                    <div className="flex items-center gap-0.5 text-gray-500">
                                                        <span className="inline-block size-2 rounded-full border border-gray-400"></span>
                                                        <span className="inline-block w-20 border-b border-dashed"></span>
                                                        <FaPlane className="w-4 h-4" />
                                                    </div>
                                                    <span>{arrivalTime}</span>
                                                </div>
                                                <span className="text-blue-600 font-medium">{direct ? "Directo" : "1 parada"}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span>{duration}</span>
                                                <span>Vuelo {flightNumber}</span>
                                            </div>
                                        </div>

                                        {/* Fare Options */}
                                        <div className="divide-y divide-gray-200">
                                            {info.fareTypes.map((fareType: string, idx: number) => {
                                                const tierKey = fareTypeKeys[idx];
                                                const bg =
                                                    tierKey === "basic"
                                                        ? "bg-yellow-100"
                                                        : tierKey === "standard"
                                                        ? "bg-gray-100"
                                                        : tierKey === "plus"
                                                        ? "bg-gray-200"
                                                        : "bg-purple-100";

                                                return (
                                                    <div key={tierKey} className={`${bg} p-3 flex items-center justify-between`}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full border border-gray-400 bg-gray-300 flex items-center justify-center">
                                                                <BiInfoCircle className="w-3 h-3 text-gray-600" />
                                                            </div>
                                                            <span className="font-medium">{fareType}</span>
                                                        </div>
                                                        <label className="flex items-center gap-2">
                                                            <span className="font-bold">
                                                                $ {prices[tierKey as keyof typeof prices]?.toLocaleString() || 'N/A'}
                                                            </span>
                                                            <input
                                                                type="radio"
                                                                name="mobile-return-flight-selection"
                                                                checked={selectedReturnFlightLocal.id === id && selectedReturnFlightLocal.tier === tierKey}
                                                                onChange={() => handleReturnFlightSelection(id, tierKey)}
                                                                className="w-5 h-5"
                                                            />
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Booking Summary */}
            <div className="fixed inset-x-0 bottom-0 bg-white border-t-2 border-gray-200 shadow-lg">
                <div className="max-container px-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
                        {selectedGroup && selectedReturnFlightLocal.id ? (
                            <>
                                {/* Información del vuelo de regreso seleccionado */}
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Logo de la aerolínea */}
                                    <div className="flex-shrink-0">
                                        <img src={selectedGroup.logo} alt={selectedGroup.name} className="h-4 sm:h-5 w-auto" />
                                    </div>

                                    {/* Detalles del vuelo */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-gray-800 text-lg truncate">
                                                {searchInfo.destination?.code} → {searchInfo.origin?.code}
                                            </h4>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {selectedGroup.fareTypes[fareTypeKeys.indexOf(selectedReturnFlightLocal.tier)]}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <span className="font-medium">{selected?.departureTime}</span>
                                                <FaPlane className="w-3 h-3" />
                                                <span className="font-medium">{selected?.arrivalTime}</span>
                                            </span>
                                            <span className="text-gray-400">•</span>
                                            <span>{selected?.direct ? "Directo" : "Con escala"}</span>
                                            <span className="text-gray-400">•</span>
                                            <span>Vuelo {selected?.flightNumber}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen de precios */}
                                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6 sm:mr-6">
                                    <div className="hidden sm:block text-right">
                                        <div className="text-sm text-gray-500 mb-1">Precio por pasajero</div>
                                        <div className="text-2xl font-bold text-gray-800">
                                            ${selectedPrice?.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="text-left sm:text-right sm:border-l border-gray-200 sm:pl-6">
                                        <div className="text-sm text-gray-500 mb-1">Total ({adultCount + searchInfo.children} pasajeros)</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            ${((selectedPrice || 0) * (adultCount + searchInfo.children)).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {adultCount} adulto{adultCount !== 1 ? 's' : ''}
                                            {searchInfo.children > 0 && ` + ${searchInfo.children} niño${searchInfo.children !== 1 ? 's' : ''}`}
                                        </div>
                                    </div>
                                    
                                    {/* Total combinado de ida y regreso */}
                                    {selectedFlight && (
                                        <div className="text-left sm:text-right sm:border-l border-gray-200 sm:pl-6">
                                            <div className="text-sm text-gray-500 mb-1">Total del viaje</div>
                                            <div className="text-2xl font-bold text-green-600">
                                                ${(((selectedPrice || 0) + (selectedFlight.price || 0)) * (adultCount + searchInfo.children)).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Ida + Regreso
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Botón de continuar */}
                                <div className="flex-shrink-0">
                                    <Link
                                        to={`/checkout?adults=${adultCount}&logo=${selectedGroup.logo}`}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold h-14 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Continuar al checkout
                                        <CgChevronRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center w-full py-4">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <span className="bg-blue-500 text-white inline-flex items-center justify-center size-6 rounded-full text-sm font-medium">2</span>
                                    <span className="text-lg">
                                        Selecciona tu <strong className="text-gray-700">vuelo de regreso</strong> para continuar
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
