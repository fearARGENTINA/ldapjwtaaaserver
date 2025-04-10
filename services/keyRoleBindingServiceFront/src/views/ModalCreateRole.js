import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';
import { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/esm/Spinner';
import useSecretsApiService from '../services/SecretsApiService';
import { useAlertContext } from '../contexts/alertContext';

function ModalCreateRole({ secretId, afterCreateCallback, onHide, ...rest }) {
    const [isLoading, setIsLoading] = useState(false);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const { createRole } = useSecretsApiService();
    const [roleInput, setRoleInput] = useState("");
    const [distinguishedNameInput, setDistinguishedNameInput] = useState("");
    const alert = useAlertContext();

    const handleOnCreateRole = () => {
        setSubmitButtonDisabled(true)
        setIsLoading(true);
        const body = {
            secretId: Number(secretId), 
            role: roleInput, 
            distinguishedName: distinguishedNameInput
        }
        createRole(body)
            .then((createdRole) => {
                alert.success("Se ha creado el rol correctamente.")
                setRoleInput("");
                setDistinguishedNameInput("");
                afterCreateCallback(createdRole);
            })
            .catch((e) => {
                alert.error("No se pudo crear el rol especificado...")
            })
            .finally(() => {
                setIsLoading(false);
                setSubmitButtonDisabled(false);
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
                    Crear rol
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    isLoading ?
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    :
                        <Form onSubmit={handleOnCreateRole} className="w-100">
                            <Form.Group className="mb-3" controlId="RoleForm.RoleInput">
                                <Form.Label>Rol</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Nombre del rol" 
                                    value={roleInput}
                                    onChange={(e) => setRoleInput(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="RoleForm.DNInput">
                                <Form.Label>DN del rol</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="DN del rol" 
                                    value={distinguishedNameInput}
                                    onChange={(e) => setDistinguishedNameInput(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button className="mb-3" variant="primary" type="submit" disabled={submitButtonDisabled} style={{width: "100%"}}>
                                Crear
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

export default ModalCreateRole;