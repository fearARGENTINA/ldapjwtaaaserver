import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "../componentes/router/PrivateRoute";
import PublicRoute from "../componentes/router/PublicRoute";
import { APPS, HOME, LOGIN, SECRETS } from "../config/routes/paths";
import { useAuthContext } from "../contexts/authContext";
import Header from "./Header";
import Login from "./Login";
import NotFound from "./NotFound";
import '../assets/css/style.css';
import Spinner from 'react-bootstrap/Spinner';
import Body from "./Body";
import Alerts from "./Alerts";
import Footer from "./Footer";
import ViewAllSecrets from "./ViewAllSecrets";
import Apps from "./Apps";

function Frame() {
    const {isLoading} = useAuthContext();

    return (
        <div className="App">
            {
                isLoading ?
                    <Body>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </Body>
                :
                    <BrowserRouter>
                        <Alerts />
                        <Header></Header>
                        <Body>
                            <Routes>
                                <Route path={HOME} element={<PublicRoute />}>
                                    <Route path={HOME} element={<Login />}></Route>
                                    <Route path={LOGIN} element={<Login />}></Route>
                                </Route>
                                <Route path={HOME} element={<PrivateRoute />}>
                                    <Route path={APPS} element={<Apps />}></Route>
                                    <Route path={SECRETS} element={<ViewAllSecrets />}></Route>
                                </Route>
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Body>
                        <Footer />
                    </BrowserRouter>
            }
        </div>
    );
}

export default Frame;