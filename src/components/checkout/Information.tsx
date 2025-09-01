import type {ReactNode} from "react";
import {TbCaretLeftRightFilled} from "react-icons/tb";
import { useFlightStore } from "@/stores/flightStore";

const InputWrapper = ({children, label}: {label: string; children: ReactNode}) => {
    return (
        <div className="relative ">
            <label className="absolute bg-[#FAFAFA] text-black/80 text-xs z-10 -mt-2 ml-3">{label}</label>
            <div>{children}</div>
        </div>
    );
};
const currentYear = new Date().getFullYear();
const years = Array.from({length: 101}, (_, i) => currentYear - i); // current year to +100
const months = Array.from({length: 12}, (_, i) => i + 1); // 1 to 12
const days = Array.from({length: 31}, (_, i) => i + 1); // 1 to 31

const labels = ["Día", "Mes", "Año"];
const options = [days, months, years];

export default function Information({adultCount = 1, logo}: {adultCount: number; logo: string}) {
    const { setNavigatingToPayment } = useFlightStore();

    const handleNavigateToPayment = () => {
        setNavigatingToPayment(true);
        // Simular tiempo de navegación (1.5 segundos)
        setTimeout(() => {
            window.location.href = `/payments?logo=${logo}`;
        }, 1500);
    };

    return (
        <div className="md:col-span-4 mb-32">
            <div>
                <h2 className="font-semibold text-lg mb-4">Información de los viajeros</h2>

                {Array.from({length: adultCount}, (_, index) => {
                    const id = index + 1;
                    return (
                        <div key={id} className="mb-4 border rounded-md overflow-hidden border-gray-300">
                            <h3 className="font-medium py-2 px-3 bg-[#F2F3F5]">Adulto {id}</h3>
                            <div className="grid grid-cols-2 items-end p-3 bg-[#FAFAFA] gap-4">
                                <InputWrapper label="Primer nombre">
                                    <input type="text" className="border px-3 border-gray-300 rounded w-full h-12 bg-white" />
                                </InputWrapper>
                                <InputWrapper label="Primer apellido">
                                    <input type="text" className="border px-3 border-gray-300 rounded w-full h-12 bg-white" />
                                </InputWrapper>

                                <div className="col-span-2 md:col-span-1">
                                    <InputWrapper label="Cédula de ciudadanía">
                                        <input type="text" className="border px-3 border-gray-300 rounded w-full h-12 bg-white" />
                                    </InputWrapper>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <h2 className="mb-2">Fecha de Nacimiento</h2>
                                    <div className="grid grid-cols-3 gap-4">
                                        {labels.map((label, i) => (
                                            <InputWrapper key={i} label={label}>
                                                <div className="relative w-full">
                                                    <select className="appearance-none border border-gray-300 rounded w-full bg-white px-3 h-11 pr-10 text-sm">
                                                        <option value="">--</option>
                                                        {options[i].map((val) => (
                                                            <option key={val} value={val}>
                                                                {val}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-black/60">
                                                        <TbCaretLeftRightFilled className="rotate-90 size-3" />
                                                    </div>
                                                </div>
                                            </InputWrapper>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Contact Info Section */}
            <div className="mb-4 border rounded-md overflow-hidden border-gray-300">
                <h3 className="font-medium py-2 px-3 bg-[#F2F3F5]">Información del contacto</h3>
                <div className="grid grid-cols-2 items-end p-3 bg-[#FAFAFA] gap-4">
                    {/* <InputWrapper label="Teléfono o Celular (10 dígitos)">
                        <div className="relative w-full">
                            <select className="appearance-none border border-gray-300 rounded w-full bg-white px-3 h-12 pr-10 text-sm">
                                <option>--</option>
                                <option>1</option>
                                <option>2</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-black/60">
                                <TbCaretLeftRightFilled className="rotate-90 size-3" />
                            </div>
                        </div>
                    </InputWrapper> */}
                    <InputWrapper label="Teléfono o Celular (10 dígitos)">
                        <input type="number" className="border px-3 border-gray-300 rounded w-full h-12 bg-white" />
                    </InputWrapper>
                    <InputWrapper label="Correo electrónico">
                        <input type="text" className="border px-3 border-gray-300 rounded w-full h-12 bg-white" />
                    </InputWrapper>
                </div>
            </div>

            <div className="text-sm flex items-start gap-10">
                <p>
                    Al hacer click en el botón Reservar y pagar, usted está aceptando los{" "}
                    <a href="" className="text-blue-600">
                        Términos y Condiciones de la compra y la Política de Privacidad.
                    </a>
                </p>
                <button 
                    onClick={handleNavigateToPayment}
                    className="bg-blue-500 text-white py-3.5 px-10 shrink-0 rounded-md"
                >
                    Reservar y pagar
                </button>
            </div>
        </div>
    );
}
