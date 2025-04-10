import { useEffect, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Form from 'react-bootstrap/Form';

function CreateFieldForm({onSubmit, fieldGroupId, fieldTypes}) {
    const [field, setField] = useState({
        fieldName: "",
        fieldTypeId: fieldTypes?.[0]?.id,
        fieldGroupId: fieldGroupId,
    })

    useEffect(() => {
        setField((f) => ({...f, fieldTypeId: fieldTypes?.[0]?.id}))
    }, [fieldTypes])

    return <>
        {
            fieldGroupId && 
            fieldTypes &&
                <div className="mt-5">
                    <h3>Crear campo</h3>
                    <Form     
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit(field)
                        }}
                    >
                        <Form.Select 
                            onChange={(e) => setField((f) => ({...f, fieldTypeId: Number(e.target.value)}))}
                            aria-label={`Seleccione tipo de campo`} 
                            value={field?.fieldTypeId} 
                            required
                        >
                            {
                                fieldTypes && fieldTypes.map(({id, fieldType}, i) => (
                                    <option key={`option-field-type-${fieldGroupId}-${id}-${i}`} value={id}>{fieldType}</option>
                                ))
                            }
                        </Form.Select>
                        <Form.Control 
                            type="text"
                            onChange={(e) => setField((f) => ({...f, fieldName: e.target.value}))} 
                            placeholder={"Campo"}
                            value={field?.fieldName}
                            required
                        />
                        <Button className="mb-4" variant="primary" type="submit" style={{width: "100%"}}>
                            Crear
                        </Button>
                    </Form>
                </div>
        }
    </>
}

export default CreateFieldForm;