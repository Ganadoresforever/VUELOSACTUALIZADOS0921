import {useState} from "react";

export default function NewsLatter() {
    const [checked, setChecked] = useState(false);
    return (
        <div className="md:px-8 px-4 py-5 w-full bg-white md:max-w-screen-md xl:max-w-screen-lg mx-auto mb-12 rounded-xl -mt-13 border border-light shadow-lg">
            <h5 className="text-[26px] font-poppins font-semibold text-muted">¡No te pierdas ninguna oferta!</h5>
            <p className="text-muted">Recibirás información para que vivas la mejor experiencia</p>
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
                <input type="text" className="border border-light px-3 py-5 md:px-4 md:py-5 rounded-md" placeholder="Correo electrónico " />
                <div className="inline-block bg-gray-100 border border-gray-300 rounded-md p-3 md:p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="fake-captcha"
                                className="w-7 h-7 cursor-pointer"
                                checked={checked}
                                onChange={() => setChecked(!checked)}
                            />
                            <label htmlFor="fake-captcha" className="cursor-pointer text-sm text-gray-800">
                                I'm not a robot
                            </label>
                        </div>
                        <div className="flex flex-col items-end">
                            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-8 h-8" />
                            <p className="text-[9px] text-gray-500">reCAPTCHA</p>
                            <p className="text-[5px] text-dark">Provided - Termination</p>
                        </div>
                    </div>
                </div>
                <button className="border-2 md:col-span-2 xl:col-span-1 h-[70px] md:h-[87px] xl:h-full border-blue-500 text-blue-500 font-semibold rounded-lg">
                    Subscribe ahora
                </button>
            </div>
        </div>
    );
}
