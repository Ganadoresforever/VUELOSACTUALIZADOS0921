import {FaChevronRight} from "react-icons/fa";

import payment_1 from "@/assets/icons/payment-1.svg";
import payment_2 from "@/assets/icons/payment-2.svg";
import payment_3 from "@/assets/icons/payment-3.svg";
import payment_4 from "@/assets/icons/payment-4.svg";
import payment_5 from "@/assets/icons/payment-5.svg";
import payment_6 from "@/assets/icons/payment-6.png";
import payment_7 from "@/assets/icons/payment-7.svg";
import payment_8 from "@/assets/icons/payment-8.svg";
import payment_9 from "@/assets/icons/payment-9.svg";

import support_1 from "@/assets/icons/info-1.svg";
import support_2 from "@/assets/icons/info-2.svg";

import banner from "@/assets/images/banner.jpg";

export default function InfoSections() {
    const paymentLogos = [payment_1, payment_2, payment_3, payment_4, payment_5, payment_6, payment_7, payment_8, payment_9];

    return (
        <div className="max-container px-4 py-10 space-y-8">
            <div className="bg-white rounded-2xl flex gap-5 lg:flex-row items-center flex-col justify-between border border-light py-7 px-12">
                <div className="lg:pr-12 shrink-0 lg:border-r border-light">
                    <h3 className="text-xl font-poppins text-dark font-medium">Pagos cómodos y seguros</h3>
                    <div className="hidden lg:flex items-center  text-blue-500 font-medium">
                        Consulta nuestras formas de pago
                        <FaChevronRight className="text-xs mt-0.5 ml-1" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-5 lg:gap-10 w-full items-center justify- justify-center">
                    {paymentLogos.map((src, index) => (
                        <img key={index} src={src || "/placeholder.svg"} alt={`Payment method ${index + 1}`} className="object-contain max-h-6" />
                    ))}
                </div>
                <div className="flex lg:hidden items-center  text-blue-500 font-medium">
                    Consulta nuestras formas de pago
                    <FaChevronRight className="text-xs mt-0.5 ml-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="py-7 flex items-start gap-4 px-7 lg:px-10 border rounded-2xl border-light">
                    <img src={support_1} alt="" />
                    <div>
                        <h3 className="text-xl font-poppins text-dark font-medium">Reserva ahora y paga después</h3>
                        <p className="text-muted mt-2">Te damos más tiempo para pagar tu hospedaje</p>
                        <div className="flex items-center  text-blue-500 font-medium">
                            Cómo funciona
                            <FaChevronRight className="text-xs mt-0.5 ml-1" />
                        </div>
                    </div>
                </div>
                <div className="py-7 flex items-start gap-4 px-7 lg:px-10 border rounded-2xl border-light">
                    <img src={support_2} alt="" />
                    <div>
                        <h3 className="text-xl font-poppins text-dark font-medium">Nuestros expertos a tu servicio</h3>
                        <p className="text-muted mt-2">Atención 24 horas, 365 días del año</p>
                        <div className="flex items-center  text-blue-500 font-medium">
                            Contáctanos
                            <FaChevronRight className="text-xs mt-0.5 ml-1" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative bg-gray-800 rounded-xl overflow-hidden lg:pl-20 p-6 lg:py-16  text-white">
                <img src={banner} alt="Woman looking at mountains" className="absolute inset-0 w-full h-full object-cover brightness-50" />
                <div className="relative z-10 max-w-md">
                    <h2 className="text-3xl font-bold mb-3">Obtén descuentos al instante</h2>
                    <p className=" mb-6">
                        <span className="font-semibold">Ahorra hasta 10%</span> en tu próximo viaje comprando con tu cuenta en Tiquetes Baratos
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-[#196BDE] hover:bg-blue-700 text-white px-3 py-4 rounded-md font-semibold transition-colors">
                            Iniciar sesión
                        </button>
                        <button className="border border-white text-white hover:bg-white hover:text-gray-800 px-3 py-4 rounded-md font-semibold bg-gray-900 transition-colors">
                            Crear cuenta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
