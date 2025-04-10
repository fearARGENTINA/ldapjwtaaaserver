import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import { useAuthContext } from '../contexts/authContext';
import Spinner from 'react-bootstrap/esm/Spinner';
import QRCode from "react-qr-code";

function ModalOTP({ otpURI, otpAccessToken, onHide, ...rest }) {
    const [isLoading, setIsLoading] = useState(false);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const {otp} = useAuthContext();
    
    const handleOnSubmitOTP = (e) => {
        e.preventDefault();
        setSubmitButtonDisabled(true)
        setIsLoading(true);
        
        otp(otpCode, otpAccessToken)
            .finally(() => {
                setIsLoading(false)
                setSubmitButtonDisabled(false)    
            })
    }
    
    return (
        <Modal
            {...rest}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    One-Time Password
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    otpURI && 
                        <div>
                            <p>Escaneame en Google Authenticator</p>
                            <QRCode value={otpURI} />
                        </div>
                }
                {
                    isLoading ?
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    :
                        <Form onSubmit={handleOnSubmitOTP} className="w-100">
                            <Form.Group className="mb-3" controlId="OTPForm.OTPInput">
                                <Form.Label>Código OTP</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    min="0" 
                                    max="999999" 
                                    placeholder="012345" 
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" disabled={submitButtonDisabled} style={{width: "100%"}}>
                                Enviar
                            </Button>
                        </Form>
            }
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => { 
                    onHide();
                }}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ModalOTP;