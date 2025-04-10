import { Navigate, Outlet } from "react-router-dom";
import { APPS } from "../../config/routes/paths";
import {useAuthContext} from "../../contexts/authContext";

export default function PublicRoute() {
    const {isAuthenticated} = useAuthContext();
    
    if (isAuthenticated) {
        return <Navigate to={APPS} />;
    }

    return (
        <div>
            <Outlet />
        </div>
    )
}