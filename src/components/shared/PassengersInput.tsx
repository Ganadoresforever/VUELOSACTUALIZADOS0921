import type React from "react";
import {useState, useRef, useEffect, useCallback} from "react";
import {FaUsers} from "react-icons/fa";
import {CgClose} from "react-icons/cg";
import { SPANISH_TRANSLATIONS } from "@/constants/translations";

// Passengers Input Component
interface PassengersInputProps {
    label: string;
    value: string;
    onUpdatePassengers: (adults: number, children: number, childAges: number[]) => void;
    adults: number;
    children: number;
    childAges: number[];
}

const PassengersInput: React.FC<PassengersInputProps> = ({label, value, onUpdatePassengers, adults, children, childAges}) => {
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

    const handleAdultChange = (delta: number) => {
        const newAdults = Math.max(1, adults + delta); // Minimum 1 adult
        onUpdatePassengers(newAdults, children, childAges);
    };

    const handleChildChange = (delta: number) => {
        const newChildren = Math.max(0, children + delta);
        const newChildAges =
            newChildren > children
                ? [...childAges, 0] // Add a default age for new child
                : childAges.slice(0, newChildren); // Remove ages if children decrease
        onUpdatePassengers(adults, newChildren, newChildAges);
    };

    const handleChildAgeChange = (index: number, age: number) => {
        const newChildAges = [...childAges];
        newChildAges[index] = age;
        onUpdatePassengers(adults, children, newChildAges);
    };

    return (
        <div className="relative flex-1" ref={inputRef}>
            <label className="block text-xs text-muted">{label}</label>
            <div className="flex items-center border-b border-gray-300 py-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <FaUsers className="text-dark mr-2" />
                <span className="text-black/50 flex-1">{value || `${adults} adulto${adults !== 1 ? 's' : ''}`}</span>
            </div>
            {isOpen && (
                <div className="absolute z-20 bg-white border border-gray-200 rounded-lg shadow-2xl shadow-black/60  p-4 w-64 right-0">
                    <div className="flex items-center -mt-1 text-xl mb-4 text-dark justify-between font-medium">
                        <h2>{SPANISH_TRANSLATIONS.passengers.passengers}</h2>
                        <CgClose onClick={() => setIsOpen(!isOpen)} className="cursor-pointer" />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-700">{SPANISH_TRANSLATIONS.passengers.adults}</span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleAdultChange(-1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                                -
                            </button>
                            <span className="font-semibold text-gray-800">{adults}</span>
                            <button
                                onClick={() => handleAdultChange(1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-700">{SPANISH_TRANSLATIONS.passengers.children}</span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleChildChange(-1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                                -
                            </button>
                            <span className="font-semibold text-gray-800">{children}</span>
                            <button
                                onClick={() => handleChildChange(1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    {children > 0 && (
                        <div className=" border-b pb-3 border-light">
                            {Array.from({length: children}).map((_, index) => (
                                <div key={index} className=" flex items-center justify-between">
                                    <label htmlFor={`child-age-${index}`} className="block text-xs text-black/50 mb-1">
                                        {SPANISH_TRANSLATIONS.passengers.childAge} {index + 1}
                                    </label>
                                    <select
                                        id={`child-age-${index}`}
                                        value={childAges[index] || 0}
                                        onChange={(e) => handleChildAgeChange(index, Number.parseInt(e.target.value))}
                                        className=" border border-gray-300 rounded-md w-21 px-3 py-2 text-gray-800"
                                    >
                                        {Array.from({length: 18}, (_, i) => i).map((age) => (
                                            <option key={age} value={age}>
                                                {age}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                    <button onClick={() => setIsOpen(!isOpen)} className="bg-blue-500 text-white mt-2 w-full py-3 rounded-md font-medium">
                        {SPANISH_TRANSLATIONS.passengers.apply}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PassengersInput;

