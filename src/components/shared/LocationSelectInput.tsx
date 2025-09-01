import type React from "react";
import {useState, useRef, useEffect, useCallback} from "react";
import city_1 from "@/assets/images/city-1.jpg";
import city_2 from "@/assets/images/city-2.jpg";
import city_3 from "@/assets/images/city-3.jpg";
import city_4 from "@/assets/images/city-4.jpg";
import city_5 from "@/assets/images/city-5.jpg";
import { SPANISH_TRANSLATIONS } from "@/constants/translations";

// Dummy Data for Locations
const popularOrigins = [
    {name: "Bogotá", code: "BOG", image: city_1},
    {name: "Medellín", code: "MDE", image: city_2},
    {name: "Cali", code: "CLO", image: city_3},
    {name: "Cartagena", code: "CTG", image: city_4},
    {name: "Barranquilla", code: "BAQ", image: city_5},
    {name: "Santa Marta", code: "SMR", image: city_1},
    {name: "San Andrés", code: "ADZ", image: city_2},
    {name: "Pereira", code: "PEI", image: city_3},
    {name: "Bucaramanga", code: "BGA", image: city_4},
    {name: "Cúcuta", code: "CUC", image: city_5},
    {name: "Armenia", code: "AXM", image: city_1},
    {name: "Manizales", code: "MZL", image: city_2},
    {name: "Leticia", code: "LET", image: city_3},
    {name: "Villavicencio", code: "VVC", image: city_4},
    {name: "Neiva", code: "NVA", image: city_5},
    {name: "Montería", code: "MTR", image: city_1},
    {name: "Riohacha", code: "RCH", image: city_2},
    {name: "Quibdó", code: "UIB", image: city_3},
    {name: "Yopal", code: "EYP", image: city_4},
    {name: "Florencia", code: "FLA", image: city_5},
    {name: "Valledupar", code: "VUP", image: city_1},
    {name: "Apartadó", code: "APO", image: city_2},
    {name: "Tumaco", code: "TCO", image: city_3},
    {name: "Popayán", code: "PPN", image: city_4},
    {name: "Buenaventura", code: "BUN", image: city_5},
    {name: "Ipiales", code: "IPI", image: city_1},
    {name: "Arauca", code: "AUC", image: city_2},
    {name: "Mitú", code: "MVP", image: city_3},
    {name: "Inírida", code: "PDA", image: city_4},
    {name: "Puerto Carreño", code: "PCR", image: city_5},
];

// Location Select Input Component
interface LocationSelectInputProps {
    label: string;
    icon: React.ElementType;
    value: string;
    onSelect: (location: {name: string; code: string}) => void;
    placeholder: string;
}

const LocationSelectInput: React.FC<LocationSelectInputProps> = ({label, icon: Icon, value, onSelect, placeholder}) => {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    return (
        <div className="relative flex-1" ref={inputRef}>
            <label className="block text-xs text-muted">{label}</label>
            <div className="flex items-center border-b border-gray-300 py-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <Icon className="text-dark mr-2" />
                <span className="text-black/50 flex-1 truncate">{value || placeholder}</span>
            </div>
            {isOpen && (
                <div className="absolute z-20 bg-white shadow-black rounded shadow-2xl w-[280px] sm:w-xs">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 px-2 mt-2.5">{SPANISH_TRANSLATIONS.datePicker.popularOrigins}</h4>
                    <div className="divide-y max-h-96 overflow-y-auto divide-light">
                        {popularOrigins.map((loc) => (
                            <div
                                key={loc.code}
                                className="flex items-center py-2 cursor-pointer hover:bg-gray-100  px-2"
                                onClick={() => {
                                    onSelect(loc);
                                    setIsOpen(false);
                                }}
                            >
                                <img src={loc.image || "/placeholder.svg"} alt={loc.name} className="w-12 rounded mr-3" />
                                <div>
                                    <div className="text-gray-800 font-medium">{loc.name}</div>
                                    <div className="text-xs text-black/50">{SPANISH_TRANSLATIONS.datePicker.colombia}</div>
                                </div>
                                <span className="ml-auto pr-3 text-black/50">{loc.code}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationSelectInput;

