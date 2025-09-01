import {Route, Routes} from "react-router";
import {routes} from "./routes";

export default function App() {
    return (
        <>
            <Routes>
                {routes.map(({id, path, Element}) => (
                    <Route key={id} path={path} element={<Element />} />
                ))}
            </Routes>
        </>
    );
}
