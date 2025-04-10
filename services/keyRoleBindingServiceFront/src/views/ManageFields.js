import { useEffect, useState } from "react";
import { useAlertContext } from "../contexts/alertContext";
import useMappingsApiService from "../services/MappingsApiService";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/esm/Button';
import ListItemInputSelectEditable from "./ListItemInputSelectEditable";
import CreateFieldForm from "./CreateFieldForm";

function ManageFields({fieldGroupId}) {
    const [fields, setFields] = useState([]);
    const [fieldsTypes, setFieldsTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { getFields, getFieldTypes, createField, updateField, deleteField } = useMappingsApiService();
    
    const alert = useAlertContext();
    
    useEffect(() => {
        setIsLoading(true);
        getFields({fieldGroupId, order: true})
            .then((fields) => setFields(fields))
            .catch(() => alert.error("Hubo un problema al cargar los campos..."))
            .finally( () => setIsLoading(false))
            
        getFieldTypes({})
            .then((fieldTypes) => setFieldsTypes(fieldTypes))
            .catch(() => alert.error("Hubo un problema al cargar los tipos de campos..."))
        
    }, [setFields, setFieldsTypes])

    function handleFieldUpdate(field) {
        if (field) {
            setIsLoading(true)
            updateField(field)
                .then((updatedField) => {
                    getFields({fieldGroupId, order: true})
                        .then((orderedFields) => {
                            setFields(orderedFields)
                        })
                        .finally(() => setIsLoading(false))
                })
                .catch((e) => {
                    alert.error("No se pudo actualizar el campo indicado.");
                    setIsLoading(false)
                })
        }
    }
    
    function handleFieldCreate(field) {
        if (field) {
            setIsLoading(true)
            createField(field)
                .then((createdField) => {
                    getFields({fieldGroupId, order: true})
                        .then((orderedFields) => {
                            setFields(orderedFields)
                        })
                        .finally(() => setIsLoading(false))
                })
                .catch((e) => {
                    alert.error("No se pudo crear el campo indicado.");
                    setIsLoading(false)
                })
        }
    }

    function handleFieldDelete(field) {
        if (field) {
            setIsLoading(true)
            deleteField(field?.id)
                .then((deletedField) => {
                    getFields({fieldGroupId, order: true})
                        .then((orderedFields) => {
                            setFields(orderedFields)
                        })
                        .finally(() => setIsLoading(false))
                })
                .catch((e) => {
                    alert.error("No se pudo eliminar el campo indicado.");
                    setIsLoading(false)
                })
        }
    }

    return (
        <>
            <h3 className="mb-2">Gestionar campos:</h3>
            <h5>Doble click para editar</h5>
            <div>
                <Row className="d-flex justify-content-center text-center" style={{width: '100%'}}>
                    <Col sm={12} md={6}>
                        <ListGroup as="ol">
                        {
                            fields && fields.map((field) => (
                                <ListItemInputSelectEditable
                                    id={field?.id}
                                    key={field?.id}
                                    text={field?.fieldName}
                                    selectedValue={field?.fieldType?.id}
                                    options={fieldsTypes.map((fieldType) => ({value: fieldType?.id, text: fieldType?.fieldType}))}
                                    handleOnCloseClick={() => handleFieldDelete(field)}
                                    handleOnSaveClick={(id, {text, selectedValue}) => handleFieldUpdate({...field, fieldName: text, fieldTypeId: selectedValue})}
                                />
                            ))
                        }
                        </ListGroup>
                    </Col>
                </Row>
                <CreateFieldForm 
                    onSubmit={handleFieldCreate} 
                    fieldGroupId={fieldGroupId} 
                    fieldTypes={fieldsTypes}
                />
            </div>
        </>
    )
}

export default ManageFields;