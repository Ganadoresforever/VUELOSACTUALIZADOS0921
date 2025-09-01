import hotelOne from "@/assets/images/hotel-1.jpg";
import hotelTwo from "@/assets/images/hotel-2.jpg";
import hotelThree from "@/assets/images/hotel-3.jpg";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";

import {Navigation} from "swiper/modules";
import {SwiperSlide, Swiper} from "swiper/react";

const hotelData = [
    {
        id: 1,
        title: "Hoteles con promoción",
        subtitle: "Flexibilidad en cambios",
        image: hotelOne,
        bgColor: "bg-blue-500",
        detailed: {
            category: "Varios Destinos",
            mainTitle: "Ofertas Especiales en Hoteles",
            description: "¡Aprovecha! ",
        },
    },
    {
        id: 2,
        title: "Decameron All Inclusive Hotels & Resorts",
        subtitle: "Varios Destinos",
        image: hotelTwo,
        bgColor: "bg-blue-600",
        detailed: {
            category: "Varios Destinos",
            mainTitle: "Decameron All Inclusive Hotels & Resorts",
            description: "Dile sí a Decameron y vive unas vacaciones con todo incluido",
        },
    },
    {
        id: 3,
        title: "Dreams® Resorts & Spas",
        subtitle: "Varios Destinos",
        image: hotelThree,
        bgColor: "bg-teal-600",
        detailed: {
            category: "Varios Destinos",
            mainTitle: "Dreams® Resorts & Spas",
            description: "¡Este es el año! Ahorra hasta 40% de descuento. ",
        },
    },
];

export default function Hotels() {
    return (
        <div className="max-container px-4 py-12">
            <div className="">
                <h2 className="text-3xl font-poppins font-semibold text-muted">Encuentra tu hotel ideal</h2>
                <p className="text-muted mt-2 mb-4">Las mejores opciones para tu viaje</p>
            </div>

            {/* {hotelData.map((card, id) => (
                    <div key={`hotel-card-${id}`}>
                        <div className="  border-gray-400 relative overflow-hidden group">
                            <img src={card.image} alt="" className="w-full rounded-t-md object-cover" />
                            <div className="p-5 border-x-2 border-black/20">
                                <h4 className="text-dark mb-2 font-medium ">{card.subtitle}</h4>
                                <h4 className="text-xl text-dark font-medium">{card.title}</h4>
                            </div>
                            <div className="bg-primary group-hover:-translate-y-[99%] p-5 absolute inset-x-0 text-white top-[99%] duration-300">
                                <p className="text-2xl mb-2 font-medium">{card.detailed.category}</p>
                                <p className="text-2xl mb-4 font-medium">{card.detailed.mainTitle}</p>
                                <p>{card.detailed.description}</p>
                            </div>
                        </div>
                    </div>
                ))} */}

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
                        prevEl: ".swiper-button-prev-hotel",
                        nextEl: ".swiper-button-next-hotel",
                        disabledClass: "opacity-0 cursor-default",
                    }}
                    className="mySwiper"
                >
                    {hotelData.map((hotel) => (
                        <SwiperSlide key={hotel.id}>
                            <div className="  border-gray-400 relative overflow-hidden group">
                                <img src={hotel.image} alt="" className="w-full rounded-t object-cover" />
                                <div className="p-5 border-x-2 border-black/20">
                                    <h4 className="text-dark mb-2 font-medium ">{hotel.subtitle}</h4>
                                    <h4 className="text-xl text-dark font-medium">{hotel.title}</h4>
                                </div>
                                <div
                                    className="bg-[#003b98] group-hover:-translate-y-[99%] p-5 absolute inset-x-0 text-white top-[99%] duration-300"
                                >
                                    <p className="text-2xl mb-2 font-medium">{hotel.detailed.category}</p>
                                    <p className="text-2xl mb-4 font-medium">{hotel.detailed.mainTitle}</p>
                                    <p>{hotel.detailed.description}</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <button
                    className="swiper-button-prev-hotel absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                    aria-label="Previous slide"
                >
                    <FaArrowLeft className=" text-gray-600" />
                </button>
                <button
                    className="swiper-button-next-hotel absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                    aria-label="Next slide"
                >
                    <FaArrowRight className=" text-gray-600" />
                </button>
            </div>
        </div>
    );
}
