import {Navigation} from "swiper/modules";
import {Swiper, SwiperSlide} from "swiper/react";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";

import placeOne from "@/assets/images/place-1.jpg";
import placeTwo from "@/assets/images/place-2.jpg";
import placeThree from "@/assets/images/place-3.jpg";
import placeFour from "@/assets/images/place-4.jpg";
import placeFive from "@/assets/images/place-5.jpg";
import placeSix from "@/assets/images/place-6.jpg";

import "swiper/css";

const destinationsData = [
    {
        id: 1,
        name: "San Andrés",
        image: placeOne,
        description: "¡En paquete es más barato!",
    },
    {
        id: 2,
        name: "Santa Marta",
        image: placeTwo,
        description: "¡En paquete es más barato!",
        offer: "Ahorra hasta un 30%",
    },
    {
        id: 3,
        name: "Cartagena",
        image: placeThree,
        description: "¡En paquete es más barato!",
        offer: "Ahorra hasta un 30%",
    },
    {
        id: 4,
        name: "Aruba",
        image: placeFour,
        description: "¡En paquete es más barato!",
        offer: "Ahorra hasta un 30%",
    },
    {
        id: 5,
        name: "Punta Cana",
        image: placeFive,
        description: "¡En paquete es más barato!",
        offer: "Ahorra hasta un 30%",
    },
    {
        id: 6,
        name: "Cancún",
        image: placeSix,
        description: "¡En paquete es más barato!",
        offer: "Ahorra hasta un 30%",
    },
];

export default function Destination() {
    return (
        <div className="max-container px-4 mb-6">
            <div className="">
                <h2 className="text-3xl font-poppins font-semibold text-muted">Prepara la maletas</h2>
                <p className="text-muted mt-2 mb-4">Increíbles destinos para tus vacaciones</p>
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
                                <img src={destination.image || "/placeholder.svg"} alt={destination.name} className="w-full rounded-t rounded-br-[50px]" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h3 style={{textShadow: "1px 1px 2px #000"}} className="text-[32px] font-poppins font-semibold ">
                                        {destination.name}
                                    </h3>
                                    <p style={{textShadow: "1px 1px 2px #000"}} className="font-medium">
                                        {destination.description}
                                    </p>
                                    {destination.offer && (
                                        <p style={{textShadow: "1px 1px 2px #000"}} className="font-medium text-xl">
                                            {destination.offer}
                                        </p>
                                    )}
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
