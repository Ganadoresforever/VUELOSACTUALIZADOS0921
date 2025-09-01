import { useMemo, useState } from "react";
import { useFlightStore } from "@/stores/flightStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { calculateFlightTotal } from "@/services";

const Success = () => {
    const { searchInfo, selectedFlight, selectedReturnFlight } = useFlightStore();
    const base = import.meta.env.BASE_URL || '/';

    const [openMobAerolineas, setOpenMobAerolineas] = useState(false);
    const [openMobVistos, setOpenMobVistos] = useState(false);
    const [openMobSobre, setOpenMobSobre] = useState(false);
    const [openMobRecursos, setOpenMobRecursos] = useState(false);

    const bookingId = useMemo(() => {
        const id = Math.floor(Math.random() * (10 ** 9)).toString().padStart(9, '0');
        return id;
    }, []);

    const flightCalculation = calculateFlightTotal(searchInfo, selectedFlight, selectedReturnFlight);
    const total = flightCalculation.finalTotal;

    const formatDate = (date?: Date | null) => {
        if (!date) return "";
        try { return format(date, "dd MMM yy HH:mm 'hrs'", { locale: es }); } catch { return ""; }
    };

    const totalPassengersText = useMemo(() => {
        const adults = searchInfo.adults || 0;
        const children = searchInfo.children || 0;
        const babies = searchInfo.babies || 0;
        const parts: string[] = [];
        if (adults) parts.push(`${adults} adulto${adults > 1 ? 's' : ''}`);
        if (children) parts.push(`${children} niño${children > 1 ? 's' : ''}`);
        if (babies) parts.push(`${babies} bebé${babies > 1 ? 's' : ''}`);
        return parts.join(', ');
    }, [searchInfo.adults, searchInfo.children, searchInfo.babies]);

    return (
        <div className="min-h-screen bg-white">
            <div className="modal modal-loader"><span className="loader"></span></div>
            {/* NAV SUPERIOR */}
            <nav className="w-full bg-white border-b border-gray-100 px-2">
                <div className="max-w-[1248px] mx-auto flex flex-row items-center justify-between py-2">
                    <div className="flex items-center">
                        <img width="68" height="62" src={`${base}assets/svg/logo-tiquetesbaratos.png`} className="sm:w-[68px] sm:h-[62px]" />
                    </div>
                    <div className="hidden sm:flex flex-row items-end gap-6 pr-0">
                        <div className="flex items-center gap-1">
                            <img src={`${base}assets/svg/col_flag.avif`} alt="Colombia" className="w-6 h-6 rounded-full" />
                            <span className="text-sm text-gray-700">Español - COP</span>
                        </div>
                        <a href="#" className="text-sm text-gray-700 hover:text-blue-600">Ayuda</a>
                        <div className="flex items-center gap-1">
                            <img src={`${base}assets/svg/phone-call.png`} alt="Teléfono" className="w-5 h-5" />
                            <span className="text-sm text-gray-700">Para reservar <span className="font-semibold">601 743 6620</span></span>
                        </div>
                        <button className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1 hover:bg-gray-100">
                            <span className="text-sm text-gray-700">Iniciar sesión</span>
                            <img width="18px" src={`${base}assets/svg/burger_menu.png`} />
                        </button>
                    </div>
                    <div className="sm:hidden flex flex-row items-center gap-2">
                        <img width="25px" src={`${base}assets/svg/burger_menu.png`} />
                    </div>
                </div>
            </nav>

            {/* NAV HORIZONTAL */}
            <nav className="w-full bg-white border-b border-gray-200 hidden sm:block">
                <div className="max-w-[1248px] mx-auto flex flex-row items-center gap-10 h-12">
                    <button className="flex flex-row items-end gap-2 group focus:outline-none">
                        <img width="24px" src={`${base}assets/svg/plane_icon.png`} className="icon-menu active" />
                        <span className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600">Vuelos</span>
                    </button>
                    <button className="flex flex-row items-end gap-2 group focus:outline-none">
                        <img width="24px" src={`${base}assets/svg/hotel_icon.png`} className="icon-menu" />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 pb-1">Hoteles</span>
                    </button>
                    <button className="flex flex-row items-end gap-2 group focus:outline-none">
                        <img width="22px" src={`${base}assets/svg/luggage_icon.png`} className="icon-menu" />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 pb-1">Hotel + Vuelo</span>
                    </button>
                    <button className="flex flex-row items-end gap-2 group focus:outline-none">
                        <img width="22px" src={`${base}assets/svg/disney_icon.png`} className="icon-menu" />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 pb-1">Disney</span>
                    </button>
                    <button className="flex flex-row items-end gap-2 group focus:outline-none">
                        <img width="22px" src={`${base}assets/svg/fire_icon.png`} className="icon-menu" />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 pb-1">Ofertas</span>
                    </button>
                </div>
            </nav>

            {/* SIDE MENU MÓVIL */}
            <div className="relative px-3 mb-1 sm:px-0 sm:mb-0">
                <div className="flex flex-row overflow-x-hidden gap-5 cc-blur sm:hidden">
                    <div className="nav__item nav__item__active">
                        <img width="18px" src={`${base}assets/svg/plane_icon.png`} />
                        <p>Vuelos</p>
                    </div>
                    <div className="nav__item">
                        <img width="18px" src={`${base}assets/svg/hotel_icon.png`} />
                        <p>Hoteles</p>
                    </div>
                    <div className="nav__item">
                        <img width="14px" src={`${base}assets/svg/luggage_icon.png`} />
                        <p>Vuelo + Hotel</p>
                    </div>
                    <div className="nav__item">
                        <img width="18px" src={`${base}assets/svg/disney_icon.png`} />
                        <p>Disney</p>
                    </div>
                    <div className="nav__item">
                        <img width="18px" src={`${base}assets/svg/fire_icon.png`} />
                        <p>Ofertas</p>
                    </div>
                </div>
            </div>

            {/* BOOKING / RESUMEN */}
            <div className="relative h-full min-h-[800px]">
                <div className="bg-[#0e61aa] min-h-[300px]"></div>

                <div className="absolute top-0 right-0 w-full flex items-center justify-center px-1">
                    <div className="w-full max-w-[800px]">
                        <div className="px-4 mt-10 mb-7">
                            <p className="font-bold text-4xl text-white">!Hola!</p>
                            <p className="font-bold text-2xl text-white">Gracias por reservar con TiquetesBaratos.com</p>
                            <p className="text-md text-white">Tu reservación con número <b>{bookingId}</b> se encuentra confirmada y su pago está en proceso de validación.</p>
                        </div>

                        <div className="bg-white shadow-lg rounded-2xl pt-[50px] px-5 pb-[40px]">
                            <div className="flex flex-col md:flex-row md:justify-between">
                                <div>
                                    <div className="flex flex-row items-center gap-1">
                                        <img src={`${base}assets/svg/plane_blue_right.png`} width="30px" />
                                        <p className="text-[#0e61aa] text-3xl font-bold">Vuelo de ida</p>
                                    </div>
                                    <p className="font-bold text-gray-800 mt-1">{searchInfo.origin?.name || 'Origen'} - {searchInfo.destination?.name || 'Destino'}</p>
                                    <p>Fecha de salida: <span className="font-bold">{formatDate(searchInfo.startDate as any)}</span></p>
                                    <p>Pasajeros: <span className="font-bold">{totalPassengersText || 'N/A'}</span></p>
                                    <p>Aerolínea: <span className="font-bold">{selectedFlight?.airline || 'N/A'}</span></p>

                                    {flightCalculation.isRoundtrip && (
                                        <div id="container-flight-back" className="block">
                                            <div className="flex flex-row items-center gap-1 mt-10">
                                                <img src={`${base}assets/svg/plane_blue_left.png`} width="30px" />
                                                <p className="text-[#0e61aa] text-3xl font-bold">Vuelo de regreso</p>
                                            </div>
                                            <p className="font-bold text-gray-800 mt-1">{searchInfo.destination?.name || 'Destino'} - {searchInfo.origin?.name || 'Origen'}</p>
                                            <p>Fecha de salida: <span className="font-bold">{formatDate(searchInfo.endDate as any)}</span></p>
                                            <p>Pasajeros: <span className="font-bold">{totalPassengersText || 'N/A'}</span></p>
                                            <p>Aerolínea: <span className="font-bold">{selectedReturnFlight?.airline || 'N/A'}</span></p>
                                        </div>
                                    )}
                                </div>

                                <img src={`${base}assets/svg/plane.svg`} />
                            </div>

                            <hr className="mt-10 mb-4" />

                            <p className="text-gray-800 text-xs">Te enviamos un correo con la información de tu reservación al siguiente correo: <b>{searchInfo.email || 'tiquetesbaratos@gmail.com'}</b> En caso de no recibir el correro electrónico de tu reservación por favor comunicate al telefóno: (601)7436620</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="bg-[#003b98] px-5 py-10 text-white">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:max-w-screen-xl sm:mx-auto">
                    <div className="flex flex-col items-center sm:items-start sm:w-1/4 mb-8 sm:mb-0">
                        <img width="100px" src={`${base}assets/svg/tb_icon.png`} className="mb-6" />
                        <div className="hidden sm:block">
                            <p className="mb-2">¡Síguenos en nuestras redes!</p>
                            <img width="130px" src={`${base}assets/svg/redes_icon.png`} />
                            <p className="mt-2 mb-1">¡Comunícate con nosotros!</p>
                            <img width="90px" src={`${base}assets/svg/canales_icon.png`} />
                        </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-start sm:w-3/4">
                        <div className="mb-4 text-center sm:hidden">
                            <p className="mb-2">¡Síguenos en nuestras redes!</p>
                            <img width="130px" src={`${base}assets/svg/redes_icon.png`} />
                            <p className="mt-2 mb-1">¡Comunícate con nosotros!</p>
                            <img width="90px" src={`${base}assets/svg/canales_icon.png`} />
                        </div>

                        <div className="hidden sm:grid sm:grid-cols-4 sm:gap-10 sm:mt-8 sm:w-full">
                            <div>
                                <p className="font-bold mb-2">Aerolíneas Destacadas</p>
                                <ul className="space-y-4 text-sm">
                                    <li>Avianca</li>
                                    <li>Copa Airlines</li>
                                    <li>LATAM</li>
                                    <li>Iberia Airlines</li>
                                    <li>Airfrance Airlines</li>
                                    <li>AeroMexico Airlines</li>
                                    <li>United Airlines</li>
                                    <li>Continental Airlines</li>
                                    <li>American Airlines</li>
                                    <li>AirCanada.com</li>
                                    <li>JetBlue Airways</li>
                                    <li>Satena</li>
                                    <li>Clic Air</li>
                                    <li>Viva Aerobus</li>
                                    <li>Volaris</li>
                                    <li>Wingo</li>
                                    <li>JetSMART</li>
                                    <li>Delta Airlines</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold mb-2">Los más Vistos</p>
                                <ul className="space-y-4 text-sm">
                                    <li>Tiquetes Bogotá</li>
                                    <li>Boletos Aéreos</li>
                                    <li>Oferta Vuelos</li>
                                    <li>Vuelos en Promoción</li>
                                    <li>Tiquetes Nacionales</li>
                                    <li>Tiquetes Oferta</li>
                                    <li>Tiquetes Aéreos</li>
                                    <li>Destinos</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold mb-2">Sobre tiquetesbaratos.com</p>
                                <ul className="space-y-4 text-sm">
                                    <li>Quiénes Somos</li>
                                    <li>Términos y Condiciones</li>
                                    <li>Acerca de Anato</li>
                                    <li>Política de Privacidad</li>
                                    <li>Compra Segura</li>
                                    <li>Superintendencia de Industria y Comercio</li>
                                    <li>Superintendencia de Transporte</li>
                                    <li>Aerocivil</li>
                                    <li>Contra la Pornografía Infantil</li>
                                    <li>Derechos del pasajero y/o deberes del transportador</li>
                                    <li>Ley Retracto y/o Desistimiento</li>
                                    <li>Política de sostenibilidad</li>
                                    <li>Contrato de transporte aéreo de Colombia</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold mb-2">Recursos</p>
                                <ul className="space-y-4 text-sm">
                                    <li>TiquetesBaratos | Empresas</li>
                                    <li>Registra tu hotel</li>
                                    <li className="font-bold">Promociones</li>
                                    <li>Promociones a destino</li>
                                    <li>Ofertas Hoteles y Paquetes</li>
                                    <li>Consulte su Reserva</li>
                                    <li className="font-bold">Contáctanos</li>
                                    <li>Web Check-in</li>
                                    <li className="font-bold">Contáctenos</li>
                                    <li>Preguntas Frecuentes</li>
                                    <li className="font-bold">Pago en Línea</li>
                                </ul>
                            </div>
                        </div>

                        {/* Acordeones móviles */}
                        <div className="w-full sm:hidden">
                            <button onClick={() => setOpenMobAerolineas(v => !v)} className="w-full py-3 flex justify-between items-center border-b border-white">
                                <p className="font-semibold">Aerolíneas Destacadas</p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-chevron-down transition-transform duration-300 ${openMobAerolineas ? 'rotate-180' : ''}`} viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" /></svg>
                            </button>
                            {openMobAerolineas && (
                                <ul className="flex flex-col gap-4 pl-4 pb-3 text-sm">
                                    <li>Avianca</li><li>Copa Airlines</li><li>LATAM</li><li>Iberia Airlines</li><li>Airfrance Airlines</li><li>AeroMexico Airlines</li><li>United Airlines</li><li>Continental Airlines</li><li>American Airlines</li><li>AirCanada.com</li><li>JetBlue Airways</li><li>Satena</li><li>Clic Air</li><li>Viva Aerobus</li><li>Volaris</li><li>Wingo</li><li>JetSMART</li><li>Delta Airlines</li>
                                </ul>
                            )}

                            <button onClick={() => setOpenMobVistos(v => !v)} className="w-full py-3 flex justify-between items-center border-b border-white">
                                <p className="font-semibold">Los más Vistos</p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-chevron-down transition-transform duration-300 ${openMobVistos ? 'rotate-180' : ''}`} viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" /></svg>
                            </button>
                            {openMobVistos && (
                                <ul className="flex flex-col gap-2 pl-4 pb-3 text-sm">
                                    <li>Tiquetes Bogotá</li><li>Boletos Aéreos</li><li>Oferta Vuelos</li><li>Vuelos en Promoción</li><li>Tiquetes Nacionales</li><li>Tiquetes Oferta</li><li>Tiquetes Aéreos</li><li>Destinos</li>
                                </ul>
                            )}

                            <button onClick={() => setOpenMobSobre(v => !v)} className="w-full py-3 flex justify-between items-center border-b border-white">
                                <p className="font-semibold">Sobre tiquetesbaratos.com</p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-chevron-down transition-transform duration-300 ${openMobSobre ? 'rotate-180' : ''}`} viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" /></svg>
                            </button>
                            {openMobSobre && (
                                <ul className="flex flex-col gap-2 pl-4 pb-3 text-sm">
                                    <li>Quiénes Somos</li><li>Términos y Condiciones</li><li>Acerca de Anato</li><li>Política de Privacidad</li><li>Compra Segura</li><li>Superintendencia de Industria y Comercio</li><li>Superintendencia de Transporte</li><li>Aerocivil</li><li>Contra la Pornografía Infantil</li><li>Derechos del pasajero y/o deberes del transportador</li><li>Ley Retracto y/o Desistimiento</li><li>Política de sostenibilidad</li><li>Contrato de transporte aéreo de Colombia</li>
                                </ul>
                            )}

                            <button onClick={() => setOpenMobRecursos(v => !v)} className="w-full py-3 flex justify-between items-center border-b border-white">
                                <p className="font-semibold">Recursos</p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-chevron-down transition-transform duration-300 ${openMobRecursos ? 'rotate-180' : ''}`} viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" /></svg>
                            </button>
                            {openMobRecursos && (
                                <ul className="flex flex-col gap-2 pl-4 pb-3 text-sm">
                                    <li>TiquetesBaratos | Empresas</li><li>Registra tu hotel</li><li className="font-bold">Promociones</li><li>Promociones a destino</li><li>Ofertas Hoteles y Paquetes</li><li>Consulte su Reserva</li><li className="font-bold">Contáctanos</li><li>Web Check-in</li><li className="font-bold">Contáctenos</li><li>Preguntas Frecuentes</li><li className="font-bold">Pago en Línea</li>
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-t border-white" />

                <p className="text-sm text-center mt-10 text-white">
                    TiquetesBaratos - PRICE RES S.A.S. NIT. 900.474.794-8 , Calle 97A # 8-10 Of 204, Bogotá D.C., Bogotá – Colombia, Teléfonos: 601 743 0044. Todos los derechos reservados. Registro Nacional de Turismo No. 44091. soportepqrco@pricetravel.com
                </p>
                <p className="text-sm text-center mt-5 text-white">
                    En desarrollo de lo dispuesto en el artículo 17 de la ley 679 de 2001, la agencia rechaza la explotación, la pornografía, el turismo sexual y demás formas de abuso sexual con menores, que son sancionados penal y administrativamente conforme a las leyes colombianas.
                </p>
            </footer>
        </div>
    );
};

export default Success;


