// Refactored React Footer Component with Responsive Dropdowns in Small Screens
import {Link} from "react-router";
import {useState} from "react";
import logo from "@/assets/images/logo.png";
import {BsTwitter} from "react-icons/bs";
import {FaFacebookF, FaFacebookMessenger, FaYoutube} from "react-icons/fa6";
import {IoLogoWhatsapp} from "react-icons/io";
import {FaAngleDown, FaAngleUp} from "react-icons/fa";
import {aboutData, airlinesData, mostViewedData, resourcesData} from "@/constant/footer";
import NewsLatter from "./NewsLatter";

const socialIcons = [
    {icon: FaFacebookF, href: "#"},
    {icon: BsTwitter, href: "#"},
    {icon: FaYoutube, href: "#"},
];

const contactIcons = [
    {icon: FaFacebookMessenger, href: "#"},
    {icon: IoLogoWhatsapp, href: "#"},
];

const FooterColumn = ({title, items}: {title: string; items: string[]}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="w-full sm:w-auto border-b border-white md:border-transparent pb-1 md:pb-0">
            <div className="sm:hidden flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <h3 className="font-semibold text-base mb-2">{title}</h3>
                <span className="text-xl">{isOpen ? <FaAngleUp /> : <FaAngleDown />}</span>
            </div>
            <h3 className="font-semibold text-base mb-4 hidden sm:block">{title}</h3>
            <ul className={`space-y-5 text-xs font-semibold ${isOpen ? "block" : "hidden sm:block"}`}>
                {items.map((item, idx) => (
                    <li key={idx}>
                        <Link to="#" className="border-b border-transparent pb-0.5 hover:border-blue-400 duration-300">
                            {item}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default function Footer() {
    return (
        <footer className="bg-primary pt-6">
            <div className="max-container px-4 md:px-12 xl:px-4">
                <NewsLatter />

                <div className="grid lg:grid-cols-12 gap-10 lg:gap-0 text-white">
                    <div className="lg:col-span-3 flex  lg:flex-col gap-13">
                        <div>
                            <img src={logo} alt="Baratos Logo" className="w-25 h-23" />
                        </div>
                        <div className="flex flex-col md:flex-row lg:flex-col gap-13">
                            <div>
                                <p className="text-sm mb-4">¡Síguenos en nuestras redes!</p>
                                <div className="flex space-x-2">
                                    {socialIcons.map(({icon: Icon, href}, idx) => (
                                        <Link
                                            key={idx}
                                            to={href}
                                            className="size-8 rounded-full bg-white text-blue-500 flex items-center justify-center"
                                        >
                                            <Icon className="size-4" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm mb-4">¡Comunícate con nosotros!</p>
                                <div className="flex space-x-2">
                                    {contactIcons.map(({icon: Icon, href}, idx) => (
                                        <Link
                                            key={idx}
                                            to={href}
                                            className="size-8 rounded-full bg-white text-blue-500 flex items-center justify-center"
                                        >
                                            <Icon className="size-4" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex lg:col-span-9 flex-wrap gap-5 items-start justify-between">
                        <FooterColumn title="Aerolíneas Destacadas" items={airlinesData} />
                        <FooterColumn title="Los más Vistos" items={mostViewedData} />
                        <FooterColumn title="Sobre tiquetesbaratos.com" items={aboutData} />
                        <FooterColumn title="Recursos" items={resourcesData} />
                    </div>
                </div>

                <div className="md:border-t border-white mt-8 px-4 space-y-10 py-8 text-sm text-center text-white">
                    <p>
                        TiquetesBaratos - PRICE RES S.A.S. NIT. 900.474.794-8 , Calle 99 # 10-19 of 701 Bogotá D.C., Bogotá – Colombia, Teléfonos: 601
                        743 0044. Todos los derechos reservados. Registro Nacional de Turismo No. 44091. soporteprco@pricetravel.com
                    </p>
                    <p>
                        En desarrollo de lo dispuesto en el artículo 17 de la ley 679 de 2001, la agencia rechaza la explotación, la pornografía, el
                        turismo sexual y demás formas de abuso sexual con menores, que son sancionados penal y administrativamente conforme a las
                        leyes colombianas.
                    </p>
                </div>
            </div>
        </footer>
    );
}
