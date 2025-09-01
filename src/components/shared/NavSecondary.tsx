import logo from "@/assets/images/logo.png";
import {FaPhoneAlt} from "react-icons/fa";
import {Link} from "react-router";

export default function NavSecondary() {
    return (
        <div className="border-b border-light shadow">
            <div className="py-4 max-container px-4 text-sm text-dark flex items-center justify-between">
                <Link to="/">
                    <img src={logo} alt="Baratos Logo" className="w-17 h-15.5" />
                </Link>

                <button className="h-10.5 px-2 border border-transparent hover:border-light rounded-lg flex items-center gap-1">
                    <FaPhoneAlt className="" />
                    <span>Para reservar</span>
                    <span className="font-bold pl-1">601 743 6620</span>
                </button>
            </div>
        </div>
    );
}
