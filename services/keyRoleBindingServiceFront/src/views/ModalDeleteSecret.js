import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/esm/Button';
import { useState } from 'react';
import Spinner from 'react-bootstrap/esm/Spinner';
import useSecretsApiService from '../services/SecretsApiService';
import { useAlertContext } from '../contexts/alertContext';

function ModalDeleteSecret({ secretId, audience, afterDeletionCallback, onHide, ...rest }) {
    const [isLoading, setIsLoading] = useState(false);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const { deleteSecret } = useSecretsApiService();
    const alert = useAlertContext();

    const handleOnDeleteSecret = () => {
        setSubmitButtonDisabled(true)
        setIsLoading(true);
        
        deleteSecret(secretId)
            .then((secret) => {
                alert.success("Se ha eliminado el secreto correctamente.")
                afterDeletionCallback()
            })
            .catch(() => alert.error("No se pudo eliminar el secreto especificado..."))
            .finally(() => {
                setIsLoading(false)
                setSubmitButtonDisabled(false)    
                onHide();
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
                    Eliminar secreto
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    isLoading ?
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    :
                        <>
                            <p>Esta seguro que quiere eliminar el secreto para la audience</p>
                            <p className="text-center fw-bold">{audience}</p>
                            <Button variant="danger" type="submit" disabled={submitButtonDisabled} style={{width: "100%"}} onClick={() => handleOnDeleteSecret()}>
                                Eliminar
                            </Button>
                        </>
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

export default ModalDeleteSecret;