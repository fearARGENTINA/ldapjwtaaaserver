import { useState } from "react";
import { useAuthContext } from "../contexts/authContext";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import ModalOTP from "./ModalOTP";
import Spinner from "react-bootstrap/esm/Spinner";

function Login() {
  const {login} = useAuthContext()  
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);

  function handleUserInputChange(e) {
    setUser(e.target.value);
  }

  function handlePasswordInputChange(e) {
    setPassword(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    login(user, password)
      .then((data) => {
        if (data != null) {
          setOtpData(data);
          setIsLoading(false);
          setShowOtpModal(true);
        }
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <>
      <h3 className="mb-5">Utiliza tu cuenta de Windows</h3>
      <div className="d-flex justify-content-center">
        <Row className="d-flex justify-content-center text-center" style={{width: '100%'}}>
          <Col sm={12} md={6}>
            {
              isLoading ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
              ) : (
                <Form onSubmit={handleSubmit} className="w-100">
                  <Form.Group className="mb-3 form-group" controlId="formBasicUser">
                    <Form.Label>Usuario</Form.Label>
                    <Form.Control type="text" placeholder="Usuario" onChange={handleUserInputChange} required/>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control type="password" placeholder="Contraseña" onChange={handlePasswordInputChange} autoComplete="off" required/>
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Iniciar sesión
                  </Button>
                </Form>
              )
            }
          </Col>
        </Row>
      </div>
      <ModalOTP otpURI={otpData?.otp_uri} otpAccessToken={otpData?.access_token} show={showOtpModal} onHide={() => setShowOtpModal(false)} />
    </>
  );
}

export default Login;