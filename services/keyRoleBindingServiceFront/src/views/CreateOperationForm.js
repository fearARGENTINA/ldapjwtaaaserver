import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Form from 'react-bootstrap/Form';

function CreateOperationForm({onSubmit, fields, resultId, operators, comparisonValueTypes}) {
    const [operation, setOperation] = useState({
        FieldId: fields?.[0]?.id,
        OperatorId: operators?.[0]?.id,
        ComparisonValue: "",
        ComparisonValueTypeId: comparisonValueTypes?.[0]?.id,
        ResultId: resultId,
    })

    return <>
        {
            fields && 
            resultId && 
            operators && 
            comparisonValueTypes &&
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(operation)
                }}>
                    <Form.Select 
                        onChange={(e) => setOperation((op) => ({...op, FieldId: Number(e.target.value)}))}
                        aria-label={`Seleccione campo`} 
                        value={operation?.FieldId} 
                        required
                    >
                        {
                            fields && fields.map(({id, fieldName}, i) => (
                                <option key={`option-field-${resultId}-${id}-${i}`} value={id}>{fieldName}</option>
                            ))
                        }
                    </Form.Select>
                    <Form.Select 
                        onChange={(e) => setOperation((op) => ({...op, OperatorId: Number(e.target.value)}))} 
                        aria-label={`Seleccione operador`} 
                        value={operation?.OperatorId} 
                        required
                    >
                        {
                            operators && operators.map(({id, OperationName, Description}, i) => (
                                <option key={`option-operator-${resultId}-${id}-${i}`} value={id}>{`${OperationName} (${Description})`}</option>
                            ))
                        }
                    </Form.Select>
                    <Form.Select 
                        onChange={(e) => setOperation((op) => ({...op, ComparisonValueTypeId: Number(e.target.value)}))} 
                        aria-label={`Seleccione tipo de valor de comparación`} 
                        value={operation?.ComparisonValueTypeId} 
                        required
                    >
                        {
                            comparisonValueTypes && comparisonValueTypes.map(({id, valueType}, i) => (
                                <option key={`option-compvalue-${resultId}-${id}-${i}`} value={id}>{valueType}</option>
                            ))
                        }
                    </Form.Select>
                    <Form.Control 
                        type="text"
                        onChange={(e) => setOperation((op) => ({...op, ComparisonValue: e.target.value}))} 
                        placeholder="Valor de comparación" 
                        value={operation?.ComparisonValueType}
                        required
                    />
                    <Button className="mb-4" variant="primary" type="submit" style={{width: "100%"}}>
                        Crear
                    </Button>
                </Form>
        }
    </>
}

export default CreateOperationForm;