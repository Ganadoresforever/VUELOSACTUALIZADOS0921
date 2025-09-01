import type React from "react";
import {useState, useRef, useEffect, useCallback} from "react";
import {FaCalendarAlt, FaChevronLeft, FaChevronRight} from "react-icons/fa";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isWithinInterval,
    isBefore,
    startOfDay,
} from "date-fns";
import {es} from "date-fns/locale";
import { SPANISH_TRANSLATIONS } from "@/constants/translations";

// Date Picker Component
interface DatePickerInputProps {
    label: string;
    value: string;
    isRoundtrip: boolean;
    onSelectDate: (date: Date | null) => void;
    onSelectDateRange: (startDate: Date | null, endDate: Date | null) => void;
    startDate: Date | null;
    endDate: Date | null;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({label, value, isRoundtrip, onSelectDate, onSelectDateRange, startDate, endDate}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
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

    const renderCalendar = (month: Date) => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const days = eachDayOfInterval({start, end});

        const firstDayOfWeek = start.getDay();
        const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        return (
            <div className="grid grid-cols-7 text-center text-sm">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="font-medium text-black/50 py-2">
                        {SPANISH_TRANSLATIONS.daysOfWeek[day as keyof typeof SPANISH_TRANSLATIONS.daysOfWeek]}
                    </div>
                ))}
                {Array.from({length: paddingDays}).map((_, i) => (
                    <div key={`pad-${i}`} className="py-2" />
                ))}
                {days.map((day) => {
                    const today = startOfDay(new Date());
                    const isPast = isBefore(day, today);
                    const isSelected = !isPast && (isSameDay(day, startDate || new Date(0)) || isSameDay(day, endDate || new Date(0)));
                    const isInRange = !isPast && startDate && endDate && isWithinInterval(day, {start: startDate, end: endDate});

                    const dayClasses = `py-2 rounded-full transition-colors duration-200
                        ${isPast ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
                        ${isSelected ? "bg-blue-600 text-white" : ""}
                        ${isInRange && !isSelected ? "bg-blue-100 text-blue-800" : ""}
                        ${!isSelected && !isInRange && !isPast ? "hover:bg-gray-100" : ""}`;

                    const handleDayClick = () => {
                        if (isPast) return;

                        if (isRoundtrip) {
                            if (!startDate || (startDate && endDate)) {
                                onSelectDateRange(day, null);
                            } else if (startDate && !endDate) {
                                if (day < startDate) {
                                    onSelectDateRange(day, startDate);
                                } else {
                                    onSelectDateRange(startDate, day);
                                }
                                setIsOpen(false);
                            }
                        } else {
                            onSelectDate(day);
                            setIsOpen(false);
                        }
                    };

                    return (
                        <div key={day.toISOString()} className={dayClasses} onClick={handleDayClick}>
                            {format(day, "d")}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="relative flex-1" ref={inputRef}>
            <label className="block text-xs text-muted">{label}</label>
            <div className="flex items-center border-b border-gray-300 py-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <FaCalendarAlt className="text-dark mr-2" />
                <span className="text-black/50 flex-1 capitalize">{value || SPANISH_TRANSLATIONS.datePicker.selectDate}</span>
            </div>
            {isOpen && (
                <div className="absolute z-20 bg-white rounded-lg shadow-2xl shadow-black p-4 w-full sm:w-[400px] md:w-[600px] left-1/2 transform -translate-x-1/2 md:left-0 md:translate-x-0">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100">
                            <FaChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex flex-col items-center text-sm sm:text-base">
                            <span className="font-semibold">{format(currentMonth, "MMMM yyyy", {locale: es})}</span>
                            <span className="font-semibold">{format(addMonths(currentMonth, 1), "MMMM yyyy", {locale: es})}</span>
                        </div>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100">
                            <FaChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderCalendar(currentMonth)}
                        {renderCalendar(addMonths(currentMonth, 1))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePickerInput;
