import {FaPhoneAlt} from "react-icons/fa";
import {FaFacebookMessenger} from "react-icons/fa6";
import {IoLogoWhatsapp} from "react-icons/io";

import appStore from "@/assets/images/app-store.png";
import playStore from "@/assets/images/google-play.png";

export default function CTA() {
    return (
        <div className="bg-[#f2f3f5]">
            <div className="max-container pt-6 pb-12 px-4 md:px-12 xl:px-4 flex flex-col xl:flex-row items-center text-center xl:text-left divide-black/20 divide-y xl:divide-y-0 xl:divide-x">
                <div className="xl:pr-10 pb-4 xl:pb-0 xl:pl-10">
                    <h2 className="text-lg m:text-xl mb-4 font-semibold text-muted ">¡Comunícate con nosotros!</h2>
                    <div className="text-sm grid grid-cols-2  md:flex  md:flex-row w-full  gap-4">
                        <button className="h-10.5 px-4 w-full md:w-auto bg-white border border-transparent hover:border-light rounded-lg flex items-center gap-2.5 text-dark ">
                            <IoLogoWhatsapp className="text-green-500 text-lg" />
                            <span>Por Messenger</span>
                        </button>
                        <button className="h-10.5 px-4 bg-white border border-transparent hover:border-light rounded-lg flex items-center gap-2.5 text-dark ">
                            <FaFacebookMessenger className="text-blue-500 text-lg" />
                            <span>Por Messenger</span>
                        </button>
                        <button className="h-10.5 col-span-2 md:col-span-1 px-4 bg-white border border-transparent hover:border-light rounded-lg flex items-center gap-2.5 text-dark justify-center md:justify-start">
                            <FaPhoneAlt className="" />
                            <span>Para reservar</span>
                            <span className="font-bold pl-1">601 743 6620</span>
                        </button>
                    </div>
                </div>
                <div className="pt-4 xl:pt-0 xl:pl-20 flex flex-col md:flex-row xl:flex-col gap-4 xl:gap-0 justify-between w-full xl:w-auto items-center">
                    <h2 className="text-lg m:text-xl xl:mb-4 font-semibold text-muted ">¡Ahorra hasta 10% extra en Hoteles con nuestra app!</h2>
                    <div className="flex items-center gap-4">
                        <img src={playStore} alt="play store" />
                        <img src={appStore} alt="app store" />
                    </div>
                </div>
            </div>
        </div>
    );
}
