import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import { ALL_APPS } from "../config/consts.js";
import { useAuthContext } from "../contexts/authContext.js";
import AppBox from "./AppBox";

function Apps() {
    const {hasRole} = useAuthContext();

    return (
        <>
            <h3 className="mb-5">Módulos disponibles</h3>
            <div className="d-flex justify-content-center">
                <Row className="text-center" style={{width: "100%"}}>
                    {
                        ALL_APPS.map((app) => 
                            <Col key={app.title} sm={12} md={6} className="mb-3">
                                <AppBox image={app.image} title={app.title} text={app.text} goTo={app.goTo}/>
                            </Col>
                        )
                    }
                </Row>
            </div>
        </>
    ) 
}

export default Apps;
