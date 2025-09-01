import {MdFlight} from "react-icons/md";
import {FaCircleInfo} from "react-icons/fa6";
import {FaPlane} from "react-icons/fa";
import {CgChevronDown, CgChevronRight} from "react-icons/cg";
import {BsCalendar2Date} from "react-icons/bs";
import {Link} from "react-router";
import {useState, useEffect, useMemo} from "react";
import {BiInfoCircle} from "react-icons/bi";
import { useFlightStore } from "@/stores/flightStore";
import { generateAllAirlinesFlights } from "@/utils/flightGenerator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import FullScreenLoader from "@/components/shared/FullScreenLoader";



export default function FlightTable({adultCount, flights}: {adultCount: number; flights: string | null}) {
    const { 
        searchInfo, 
        generatedFlights, 
        setGeneratedFlights, 
        selectedFlight, 
        setSelectedFlight, 
        isGeneratingFlights, 
        setGeneratingFlights,
        isNavigatingToCheckout,
        setNavigatingToCheckout
    } = useFlightStore();
    
    const [selectedFlightLocal, setSelectedFlightLocal] = useState<{
        id: number | null;
        tier: string;
    }>({
        id: null,
        tier: "basic",
    });

    // Generar vuelos dinámicamente cuando cambie la información de búsqueda
    useEffect(() => {
        if (searchInfo.origin && searchInfo.destination && searchInfo.startDate) {
            // Solo generar nuevos vuelos si no los tenemos
            if (!generatedFlights || 
                !generatedFlights[0]?.flights[0]) {
                
                // Mostrar loader mientras se generan los vuelos
                setGeneratingFlights(true);
                
                // Limpiar selección local cuando se generen nuevos vuelos
                setSelectedFlightLocal({
                    id: null,
                    tier: "basic",
                });
                
                // Simular tiempo de generación (2 segundos)
                setTimeout(() => {
                    if (searchInfo.origin && searchInfo.destination && searchInfo.startDate) {
                        const newFlights = generateAllAirlinesFlights(
                            searchInfo.origin.code,
                            searchInfo.destination.code,
                            searchInfo.startDate
                        );
                        setGeneratedFlights(newFlights);
                    }
                    setGeneratingFlights(false);
                }, 2000);
            }
        }
    }, [searchInfo.origin, searchInfo.destination, searchInfo.startDate, generatedFlights, setGeneratedFlights, setGeneratingFlights]);

    // Sincronizar selección local con el store
    useEffect(() => {
        if (selectedFlight) {
            setSelectedFlightLocal({
                id: selectedFlight.id,
                tier: selectedFlight.fareType,
            });
        }
    }, [selectedFlight]);

    // Limpiar selección local cuando cambie la información de búsqueda
    useEffect(() => {
        setSelectedFlightLocal({
            id: null,
            tier: "basic",
        });
    }, [searchInfo.origin, searchInfo.destination, searchInfo.startDate]);

    // Obtener vuelos a mostrar
    const flightGroupsToShow = useMemo(() => {
        if (!generatedFlights || !searchInfo.origin || !searchInfo.destination) {
            return [];
        }
        return generatedFlights;
    }, [generatedFlights, searchInfo.origin, searchInfo.destination]);

    // Obtener información del vuelo seleccionado
    const selected = selectedFlightLocal.id ? 
        flightGroupsToShow.flatMap((group) => group.flights).find((f) => f.id === selectedFlightLocal.id) : null;
    
    const selectedGroup = selectedFlightLocal.id ? 
        flightGroupsToShow.find((group) => group.flights.some((f) => f.id === selectedFlightLocal.id)) : null;
    
    const selectedPrice = selected?.prices[selectedFlightLocal.tier as keyof typeof selected.prices];
    //const formattedPrice = selectedPrice?.toLocaleString();

    const fareTypeKeys = ["basic", "standard", "plus", "premium"];

    // Formatear fecha para mostrar
    const formattedDate = searchInfo.startDate ? 
        format(searchInfo.startDate, "EEEE, d 'de' MMMM yyyy", { locale: es }) : 
        "Fecha no seleccionada";

    // Manejar selección de vuelo
    const handleFlightSelection = (flightId: number, tier: string) => {
        setSelectedFlightLocal({ id: flightId, tier });
        
        // Encontrar el vuelo y grupo seleccionados
        const flight = flightGroupsToShow.flatMap((group) => group.flights).find((f) => f.id === flightId);
        const group = flightGroupsToShow.find((g) => g.flights.some((f) => f.id === flightId));
        
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
            
            setSelectedFlight(flightSelection);
        }
    };

    // Si no hay información de búsqueda, mostrar mensaje
    if (!searchInfo.origin || !searchInfo.destination || !searchInfo.startDate) {
        return (
            <div className="max-container px-4 lg:px-0 pb-52">
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                        Completa la información de búsqueda
                    </h3>
                    <p className="text-gray-500">
                        Selecciona origen, destino y fecha para ver los vuelos disponibles
                    </p>
                </div>
            </div>
        );
    }

    // Si se están generando vuelos, mostrar loader
    if (isGeneratingFlights) {
        return (
            <div className="max-container px-4 lg:px-0 pb-52">
                <FullScreenLoader 
                    message="Generando opciones de vuelo..." 
                />
            </div>
        );
    }

    // Si no hay vuelos generados, mostrar mensaje
    if (!flightGroupsToShow.length) {
        return (
            <div className="max-container px-4 lg:px-0 pb-52">
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                        No se encontraron vuelos
                    </h3>
                    <p className="text-gray-500">
                        Intenta con otras fechas o rutas
                    </p>
                </div>
            </div>
        );
    }

    // Si se está navegando a checkout, mostrar loader
    if (isNavigatingToCheckout) {
        return (
            <FullScreenLoader message="Preparando tu reserva..." />
        );
    }

    return (
        <div className="max-container px-4 lg:px-0 pb-64 sm:pb-56 lg:pb-52">
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
                {flightGroupsToShow.map((info, index) => (
                    <div key={`group-${index}`} className={`hidden lg:block border-2 ${info.borderColor} overflow-hidden rounded-lg `}>
                        <div className={`${info.bgColor} text-white flex items-center gap-4`}>
                            <div className="bg-white w-20 px-3 py-2">
                                <img src={info.logo} alt={info.name} />
                            </div>
                            <p className="font-medium">{flights}</p>
                        </div>

                        <div className="p-3">
                            <div className="border border-gray-300 rounded-lg ">
                                <div className="grid grid-cols-5 gap-5 border-b p-3 border-gray-300">
                                    <div className="flex items-center col-span-2 gap-2">
                                        <button className="flex items-center gap-2 border rounded-full px-2 border-purple-600 text-purple-600 ">
                                            <MdFlight className="rotate-90" /> Vuelos de ida
                                        </button>
                                        <p>{formattedDate}</p>
                                    </div>
                                    <div className="grid grid-cols-6 col-span-3 text-center">
                                        <p className="col-span-2 text-blue-600 flex items-center gap-1">
                                            ¿Qué incluye cada tarifa? <FaCircleInfo />
                                        </p>
                                        {info.fareTypes.map((fareType) => (
                                            <p key={fareType}>{fareType}</p>
                                        ))}
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-300">
                                    {info.flights.map(({id, departureTime, arrivalTime, duration, flightNumber, direct, prices}) => (
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

                                                {info.fareTypes.map((_, idx) => {
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
                                                                name="flight-selection"
                                                                checked={selectedFlightLocal.id === id && selectedFlightLocal.tier === tierKey}
                                                                onChange={() => handleFlightSelection(id, tierKey)}
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

            <div className="space-y-8">
                {flightGroupsToShow.map((info, index) => (
                    <div key={`mobile-flight-${index}`} className={`lg:hidden border-2 overflow-hidden rounded-lg ${info.borderColor}`}>
                        <div className={`text-white flex items-center gap-4 ${info.bgColor}`}>
                            <div className="bg-white w-12 sm:w-16 md:w-20 px-3 py-1">
                                <img src={info.logo} alt={info.name} className="h-4 sm:h-5 w-auto object-contain" />
                            </div>
                            <p className="font-medium">{flights}</p>
                        </div>

                        <div className="border  border-gray-300 rounded-lg">
                            {/* Mobile Header */}
                            <div className="lg:hidden p-3 border-b border-gray-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <button className="flex items-center gap-2 border rounded-full px-2 border-purple-600 text-purple-600">
                                        <FaPlane className="rotate-90 w-4 h-4" /> Vuelos de ida
                                    </button>
                                </div>
                                <p className="text-blue-600 flex items-center gap-1">
                                    ¿Qué incluye cada tarifa? <BiInfoCircle className="w-4 h-4" />
                                </p>
                            </div>

                            {/* Mobile Flight Cards */}
                            <div className=" space-y-4 p-3">
                                {info.flights.map(({id, departureTime, arrivalTime, duration, flightNumber, direct, prices}) => (
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
                                            {info.fareTypes.map((fareType, idx) => {
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
                                                                name="mobile-flight-selection"
                                                                checked={selectedFlightLocal.id === id && selectedFlightLocal.tier === tierKey}
                                                                onChange={() => handleFlightSelection(id, tierKey)}
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
                        {selectedGroup && selectedFlightLocal.id ? (
                            <>
                                {/* Información del vuelo seleccionado */}
                                <div className="flex items-start sm:items-center gap-4 flex-1">
                                    {/* Logo de la aerolínea */}
                                    <div className="flex-shrink-0">
                                        <img src={selectedGroup.logo} alt={selectedGroup.name} className="h-4 sm:h-5 w-auto" />
                                    </div>

                                    {/* Detalles del vuelo */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-gray-800 text-lg truncate">
                                                {searchInfo.origin?.code} → {searchInfo.destination?.code}
                                            </h4>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {selectedGroup.fareTypes[fareTypeKeys.indexOf(selectedFlightLocal.tier)]}
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
                                    <div className="hidden sm:block text-left sm:text-right">
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
                                </div>

                                {/* Botón de reserva */}
                                <div className="flex-shrink-0">
                                    {searchInfo.tripType === "roundtrip" ? (
                                        <Link
                                            to={`/flights/return?adults=${adultCount}`}
                                            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            Seleccionar vuelo de regreso
                                            <CgChevronRight className="w-5 h-5 ml-2" />
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setNavigatingToCheckout(true);
                                                // Simular tiempo de navegación (1.5 segundos)
                                                setTimeout(() => {
                                                    window.location.href = `/checkout?adults=${adultCount}&logo=${selectedGroup.logo}`;
                                                }, 1500);
                                            }}
                                            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            Reservar ahora
                                            <CgChevronRight className="w-5 h-5 ml-2" />
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center w-full py-4">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <span className="bg-green-500 text-white inline-flex items-center justify-center size-6 rounded-full text-sm font-medium">1</span>
                                    <span className="text-lg">
                                        Selecciona tu <strong className="text-gray-700">vuelo</strong> para continuar
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
