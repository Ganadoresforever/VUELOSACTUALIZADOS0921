import {Navigation} from "swiper/modules";
import {Swiper, SwiperSlide} from "swiper/react";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";

import vacation_1 from "@/assets/images/vacation-1.jpg";
import vacation_2 from "@/assets/images/vacation-2.jpg";
import vacation_3 from "@/assets/images/vacation-3.jpg";
import vacation_4 from "@/assets/images/vacation-4.jpg";
import vacation_5 from "@/assets/images/vacation-5.jpg";
import vacation_6 from "@/assets/images/vacation-6.jpg";

import "swiper/css";

const destinationsData = [
    {
        id: 1,
        image: vacation_1,
        offer: "¡Vuela a reservar!",
    },
    {
        id: 2,
        image: vacation_2,
        offer: "Hasta 45% de descuento",
    },
    {
        id: 3,
        image: vacation_3,
        offer: "Hasta 30% de descuento",
    },
    {
        id: 4,
        image: vacation_4,
        offer: "Hasta 40% de descuento",
    },
    {
        id: 5,
        image: vacation_5,
        offer: "Hasta 45% de descuento",
    },
    {
        id: 6,
        image: vacation_6,
        offer: "Ahorra hasta un 30%",
    },
];

export default function Vacation() {
    return (
        <div className="max-container px-6 mt-10">
            <div className="">
                <h2 className="text-3xl  font-poppins font-semibold text-muted">Aprovecha nuestras ofertas</h2>
                <p className="text-muted mb-4 mt-2">Aventúrate a descubrir nuevos lugares</p>
            </div>

            <div className="relative">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={12}
                    slidesPerView={1}
                    slidesPerGroup={1}
                    breakpoints={{
                        768: {
                            slidesPerView: 2,
                            slidesPerGroup: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                            slidesPerGroup: 3,
                        },
                    }}
                    navigation={{
                        prevEl: ".swiper-button-prev-custom",
                        nextEl: ".swiper-button-next-custom",
                        disabledClass: "opacity-0 cursor-default",
                    }}
                    className="mySwiper"
                >
                    {destinationsData.map((destination) => (
                        <SwiperSlide key={destination.id}>
                            <div className="relative">
                                <img src={destination.image || "/placeholder.svg"} alt={destination.offer} className="w-full rounded-t " />
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <p style={{textShadow: "1px 1px 2px #000"}} className="font-medium text-xl">
                                        {destination.offer}
                                    </p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <button
                    className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                    aria-label="Previous slide"
                >
                    <FaArrowLeft className=" text-gray-600" />
                </button>
                <button
                    className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                    aria-label="Next slide"
                >
                    <FaArrowRight className=" text-gray-600" />
                </button>
            </div>
        </div>
    );
}
