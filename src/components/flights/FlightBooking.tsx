
import {useCallback, useMemo} from "react";
import {FaPlaneDeparture, FaPlaneArrival} from "react-icons/fa";
import {format} from "date-fns";
import {es} from "date-fns/locale";
import {useNavigate} from "react-router";
import { useFlightStore } from "@/stores/flightStore";
import { SPANISH_TRANSLATIONS } from "@/constants/translations";
import LocationSelectInput from "@/components/shared/LocationSelectInput";
import DatePickerInput from "@/components/shared/DatePickerInput";
import PassengersInput from "@/components/shared/PassengersInput";

export default function FlightBooking({adults, setAdults}: {adults: number; setAdults: (count: number) => void}) {
    const navigate = useNavigate();
    // Usar el store de Zustand para obtener la información de búsqueda
    const { searchInfo, updateSearchInfo, setSearchingFlights } = useFlightStore();
    
    // Extraer valores del store
    const {
        tripType,
        origin,
        destination,
        startDate,
        endDate,
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
        setAdults(newAdults);
        updateSearchInfo({ adults: newAdults, children: newChildren, childAges: newChildAges });
    };

    const formatPassengersDisplay = () => {
        let display = `${adults} adulto${adults !== 1 ? "s" : ""}`;
        if (children > 0) {
            display += `, ${children} niño${children !== 1 ? "s" : ""}`;
        }
        return display;
    };

    const handleSearch = () => {
        // Validar que tengamos la información necesaria
        if (!origin || !destination || !startDate) {
            return;
        }

        // Activar el estado de búsqueda
        setSearchingFlights(true);
        
        // Navegar a la página de vuelos
        navigate(`/flights?adults=${adults}`);
    };

    // Verificar si el botón de búsqueda debe estar habilitado
    const isSearchEnabled = origin && destination && startDate;

    return (
        <div className=" max-container w-full mt-10">
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
                    <LocationSelectInput
                        label={SPANISH_TRANSLATIONS.labels.origin}
                        icon={FaPlaneDeparture}
                        value={origin ? `${origin.name} (${origin.code})` : ""}
                        onSelect={(loc) => updateSearchInfo({ origin: loc })}
                        placeholder={SPANISH_TRANSLATIONS.labels.origin}
                    />
                    <LocationSelectInput
                        label={SPANISH_TRANSLATIONS.labels.destination}
                        icon={FaPlaneArrival}
                        value={destination ? `${destination.name} (${destination.code})` : ""}
                        onSelect={(loc) => updateSearchInfo({ destination: loc })}
                        placeholder={SPANISH_TRANSLATIONS.labels.destination}
                    />
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
                            disabled={!isSearchEnabled}
                            className={`w-full block text-center px-16 py-4 rounded-md font-semibold transition-colors ${
                                isSearchEnabled 
                                    ? "bg-[#186cdf] hover:bg-primary text-white" 
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {SPANISH_TRANSLATIONS.buttons.search}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
