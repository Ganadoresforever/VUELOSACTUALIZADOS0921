"use client";

import {useState} from "react";
import logo from "@/assets/images/logo.png";
import flag from "@/assets/icons/spain.svg";

import {FaBed, FaPhoneAlt} from "react-icons/fa";
import {FaWhatsapp, FaFacebookMessenger} from "react-icons/fa6";
import {FiMenu, FiX} from "react-icons/fi";
import {BsFire} from "react-icons/bs";
import {IoMdAirplane} from "react-icons/io";
import {RiBearSmileFill} from "react-icons/ri";
import {FaSuitcaseRolling} from "react-icons/fa";
import {Link} from "react-router";

const tabs = [
    {name: "Vuelos", icon: IoMdAirplane},
    {name: "Hoteles", icon: FaBed},
    {name: "Hotel + Vuelo", icon: FaSuitcaseRolling},
    {name: "Disney", icon: RiBearSmileFill},
    {name: "Ofertas", icon: BsFire},
];

export default function Navbar() {
    const [activeTab, setActiveTab] = useState(tabs[0].name);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="border-b-2 border-gray-300">
            <div className="max-container px-4 lg:px-0">
                {/* Top bar */}
                <div className="py-4 text-sm text-dark flex items-center justify-between">
                    <Link to="/">
                        <img src={logo} alt="Baratos Logo" className="w-17 h-15.5" />
                    </Link>

                    {/* Desktop actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        <button className="flex items-center gap-1 px-2 h-10.5 border border-transparent hover:border-light rounded-lg">
                            <img src={flag} alt="" className="size-6 rounded-full object-cover" />
                            Español - COP
                        </button>
                        <button className="h-10.5 px-2 border border-transparent hover:border-light rounded-lg">Ayuda</button>
                        <button className="h-10.5 px-2 border border-transparent hover:border-light rounded-lg flex items-center gap-1">
                            <FaPhoneAlt />
                            <span>Para reservar</span>
                            <span className="font-bold pl-1">601 743 6620</span>
                        </button>
                        <button className="h-10.5 px-3 border border-black/30 rounded-lg flex items-center gap-3">
                            Iniciar sesión
                            <FiMenu className="text-base" />
                        </button>
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="lg:hidden px-3 py-2 border rounded-lg border-black/30 flex items-center gap-2"
                    >
                        <FiMenu className="text-xl" />
                    </button>
                </div>

                {/* Tabs (shared in both views) */}
                <div className="hidden lg:flex justify-start w-full overflow-x-auto items-center gap-4 text-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            className={`flex items-center border-b-3 shrink-0 gap-2 font-medium h-auto py-2 px-4 rounded-none ${
                                activeTab === tab.name ? "border-blue-600" : "text-muted hover:border-gray-400 border-transparent"
                            }`}
                            onClick={() => setActiveTab(tab.name)}
                            aria-selected={activeTab === tab.name}
                            role="tab"
                        >
                            <tab.icon className={`size-4.5 ${activeTab === tab.name ? "text-blue-600" : "text-muted"}`} />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Drawer */}
            {menuOpen && (
                <div className="fixed inset-0 z-50 bg-white p-5 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <button className="flex items-center gap-2">
                            <img src={flag} alt="" className="size-6 rounded-full object-cover" />
                            Español (COP)
                        </button>
                        <button onClick={() => setMenuOpen(false)}>
                            <FiX className="text-2xl" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                className="flex items-center gap-3 text-lg font-medium"
                                onClick={() => {
                                    setActiveTab(tab.name);
                                    setMenuOpen(false);
                                }}
                            >
                                <tab.icon className="size-5" />
                                <span>{tab.name}</span>
                            </button>
                        ))}

                        <hr className="my-4" />

                        <Link to="/ayuda" className="flex items-center justify-between">
                            <span className="text-base">Ayuda</span>
                            <span>›</span>
                        </Link>

                        <Link to="/reserva" className="flex items-center justify-between">
                            <div className="flex gap-2 items-center">
                                <FaPhoneAlt className="text-base" />
                                <span>Para reservar</span>
                            </div>
                            <span className="font-bold">601 743 6620</span>
                        </Link>

                        <Link to="https://wa.me/" className="flex items-center gap-3 text-base">
                            <FaWhatsapp />
                            Whatsapp
                        </Link>

                        <Link to="https://facebook.com/" className="flex items-center gap-3 text-base">
                            <FaFacebookMessenger />
                            Messenger
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
