import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';
import { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/esm/Spinner';
import useSecretsApiService from '../services/SecretsApiService';
import { useAlertContext } from '../contexts/alertContext';

function ModalEditRole({ role, afterUpdateCallback, afterDeleteCallback, onHide, ...rest }) {
    const [isLoading, setIsLoading] = useState(false);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const { updateRole, deleteRole } = useSecretsApiService();
    const [roleInput, setRoleInput] = useState(role?.Role ? role?.Role : "");
    const [distinguishedNameInput, setDistinguishedNameInput] = useState(role?.DistinguishedName ? role?.DistinguishedName : "");
    const alert = useAlertContext();

    useEffect(() => {
        setRoleInput(role?.Role ? role?.Role : "")
        setDistinguishedNameInput(role?.DistinguishedName ? role?.DistinguishedName : "")
    }, [role])

    const handleOnUpdateRole = () => {
        setSubmitButtonDisabled(true)
        setIsLoading(true);
        const body = {
            id: role?.id, 
            secretId: role?.SecretId, 
            role: roleInput, 
            distinguishedName: distinguishedNameInput
        
        }
        updateRole(body)
            .then((updatedRole) => {
                alert.success("Se ha actualizado el rol correctamente.")
                afterUpdateCallback(updatedRole);
            })
            .catch((e) => {
                alert.error("No se pudo actualizar el rol especificado...")
            })
            .finally(() => {
                setIsLoading(false);
                setSubmitButtonDisabled(false);
                onHide();
            })
    }
    
    const handleOnDeleteRole = () => {
        setSubmitButtonDisabled(true)
        setIsLoading(true);

        deleteRole(role?.id)
            .then((deletedRole) => {
                alert.success("Se ha eliminado el rol correctamente.")
                afterDeleteCallback();
            })
            .catch((e) => {
                alert.error("No se pudo eliminar el rol especificado...")
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
                    Actualizar rol
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    isLoading ?
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    :
                        <Form onSubmit={handleOnUpdateRole} className="w-100">
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
                                Actualizar
                            </Button>
                            <Button variant="danger" type="submit" disabled={submitButtonDisabled} style={{width: "100%"}} onClick={handleOnDeleteRole}>
                                Eliminar
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

export default ModalEditRole;