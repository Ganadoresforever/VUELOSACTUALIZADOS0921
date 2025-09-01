
import {useState, useCallback, useMemo} from "react";
import {FaPlaneDeparture, FaPlaneArrival} from "react-icons/fa";
import {format} from "date-fns";
import {es} from "date-fns/locale";
import {useNavigate} from "react-router";
import { useFlightStore } from "@/stores/flightStore";
import { SPANISH_TRANSLATIONS } from "@/constants/translations";
import { useInitialization } from "@/hooks/useInitialization";
import LocationSelectInput from "@/components/shared/LocationSelectInput";
import DatePickerInput from "@/components/shared/DatePickerInput";
import PassengersInput from "@/components/shared/PassengersInput";


export default function Booking() {
    const navigate = useNavigate();
    
    // Usar el store de Zustand
    const { 
        searchInfo, 
        updateSearchInfo,
        isSearchingFlights,
        setSearchingFlights
    } = useFlightStore();
    
    // Inicializar valores por defecto
    useInitialization();
    
    // Estado local para errores
    const [originError, setOriginError] = useState("");
    const [destinationError, setDestinationError] = useState("");
    const [sameLocationError, setSameLocationError] = useState("");
    
    // Extraer valores del store
    const {
        tripType,
        origin,
        destination,
        startDate,
        endDate,
        adults,
        children,
        childAges
    } = searchInfo;

    const formatDateDisplay = useCallback((date: Date | null) => {
        return date ? format(date, "MMM dd, yyyy", {locale: es}) : "";
    }, []);

    const formatRangeDisplay = useCallback(
        (start: Date | null, end: Date | null) => {
            if (start && end) {
                return `${format(start, "MMM dd", {locale: es})} - ${format(end, "MMM dd, yyyy", {locale: es})}`;
            } else if (start) {
                return formatDateDisplay(start);
            }
            return "";
        },
        [formatDateDisplay]
    );

    const dateDisplay = useMemo(() => {
        if (tripType === "roundtrip" && startDate && endDate) {
            return formatRangeDisplay(startDate, endDate);
        } else if (startDate) {
            return formatDateDisplay(startDate);
        }
        return "";
    }, [tripType, startDate, endDate, formatRangeDisplay, formatDateDisplay]);

    const handleDateSelect = (date: Date | null) => {
        updateSearchInfo({ startDate: date, endDate: null });
    };

    const handleDateRangeSelect = (start: Date | null, end: Date | null) => {
        updateSearchInfo({ startDate: start, endDate: end });
    };

    const handlePassengersUpdate = (newAdults: number, newChildren: number, newChildAges: number[]) => {
        updateSearchInfo({ adults: newAdults, children: newChildren, childAges: newChildAges });
    };

    const formatPassengersDisplay = () => {
        let display = `${adults} adulto${adults !== 1 ? "s" : ""}`;
        if (children > 0) {
            display += `, ${children} niño${children !== 1 ? "s" : ""}`;
        }
        return display;
    };

    const validateForm = () => {
        let isValid = true;

        // Reset errors
        setOriginError("");
        setDestinationError("");
        setSameLocationError("");

        // Validate origin
        if (!origin) {
            setOriginError(SPANISH_TRANSLATIONS.validation.selectOrigin);
            isValid = false;
        }

        // Validate destination
        if (!destination) {
            setDestinationError(SPANISH_TRANSLATIONS.validation.selectDestination);
            isValid = false;
        }

        // Validate same location
        if (origin && destination && origin.code === destination.code) {
            setSameLocationError(SPANISH_TRANSLATIONS.validation.sameLocation);
            isValid = false;
        }

        return isValid;
    };

    // Added search handler
    const handleSearch = () => {
        if (!validateForm()) return;
        
        // Mostrar loader
        setSearchingFlights(true);
        
        // Simular tiempo de búsqueda (1.5 segundos)
        setTimeout(() => {
            // Guardar toda la información en el store antes de navegar
            updateSearchInfo({
                tripType,
                origin,
                destination,
                startDate,
                endDate,
                adults,
                children,
                childAges
            });
            
            const flightRoute = `${origin?.name} (${origin?.code}) - ${destination?.name} (${destination?.code})`;
            navigate(`/flights?adults=${adults}&flight=${flightRoute}`);
            setSearchingFlights(false);
        }, 1500);
    };

    return (
        <div className="relative bg-[#0665B6] flex items-center   border-b-2 border-gray-300 pb-5 pt-5 ">
            <div className=" max-container w-full px-4">
                <h2 style={{textShadow: "1px 1px 1px #000"}} className="text-right text-[calc(1.0375rem+1.95vw)] mb-4 text-white relative">
                    Colombia, por ti viajaré.
                </h2>
                <div style={{boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)"}} className="relative   z-10 bg-white  rounded pb-8 pr-7 pl-5 pt-6 w-full ">
                    <div className="flex gap-4 mb-3">
                        {[
                            {value: "one-way", label: SPANISH_TRANSLATIONS.tripTypes.oneWay},
                            {value: "roundtrip", label: SPANISH_TRANSLATIONS.tripTypes.roundTrip},
                        ].map(({value, label}) => (
                            <label key={value} className="flex items-center space-x-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="trip-type"
                                    value={value}
                                    checked={tripType === value}
                                    onChange={() => updateSearchInfo({ tripType: value as "one-way" | "roundtrip" })}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                        tripType === value ? "border-blue-600" : "border-gray-300"
                                    }`}
                                >
                                    {tripType === value && <div className="size-3 bg-blue-600 rounded-full" />}
                                </div>
                                <span className="text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <LocationSelectInput
                                label={SPANISH_TRANSLATIONS.labels.origin}
                                icon={FaPlaneDeparture}
                                value={origin ? `${origin.name} (${origin.code})` : ""}
                                onSelect={(loc) => {
                                    updateSearchInfo({ origin: loc, startDate: null, endDate: null });
                                    setOriginError("");
                                    setSameLocationError("");
                                }}
                                placeholder={SPANISH_TRANSLATIONS.labels.origin}
                            />
                            {originError && <p className="text-red-500 text-xs mt-1">{originError}</p>}
                        </div>
                        <div className="flex-1">
                            <LocationSelectInput
                                label={SPANISH_TRANSLATIONS.labels.destination}
                                icon={FaPlaneArrival}
                                value={destination ? `${destination.name} (${destination.code})` : ""}
                                onSelect={(loc) => {
                                    updateSearchInfo({ destination: loc, startDate: null, endDate: null });
                                    setDestinationError("");
                                    setSameLocationError("");
                                }}
                                placeholder={SPANISH_TRANSLATIONS.labels.destination}
                            />
                            {destinationError && <p className="text-red-500 text-xs mt-1">{destinationError}</p>}
                            {sameLocationError && <p className="text-red-500 text-xs mt-1">{sameLocationError}</p>}
                        </div>

                        <DatePickerInput
                            label={tripType === "one-way" ? SPANISH_TRANSLATIONS.labels.date : SPANISH_TRANSLATIONS.labels.dates}
                            value={dateDisplay}
                            isRoundtrip={tripType === "roundtrip"}
                            onSelectDate={handleDateSelect}
                            onSelectDateRange={handleDateRangeSelect}
                            startDate={startDate}
                            endDate={endDate}
                        />

                        <PassengersInput
                            label={SPANISH_TRANSLATIONS.labels.passengers}
                            value={formatPassengersDisplay()}
                            onUpdatePassengers={handlePassengersUpdate}
                            adults={adults}
                            children={children}
                            childAges={childAges}
                        />
                        <div className="md:col-span-1">
                            <button
                                onClick={handleSearch}
                                className="w-full block text-center bg-[#186cdf] hover:bg-primary text-white px-16 py-4 rounded-md font-semibold transition-colors"
                            >
                                {SPANISH_TRANSLATIONS.buttons.search}
                            </button>
                        </div>
                    </div>
                </div>
                <p style={{textShadow: "1px 1px 1px #000"}} className="text-white text-shadow-2xs text-right mt-5">
                    Descubre tu próximo destino en un solo lugar
                </p>
                
            </div>
            <div
                className="absolute top-0 left-0 w-1/2 hidden lg:block h-full bg-white transform origin-bottom-left skew-x-[38deg]"
                style={{transformOrigin: "bottom left"}}
            ></div>
        </div>
    );
}
