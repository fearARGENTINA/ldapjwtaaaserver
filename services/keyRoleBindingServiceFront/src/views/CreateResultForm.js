import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Form from 'react-bootstrap/Form';

function CreateResultForm({onSubmit, mappingTypeId, resultTypes}) {
    const [result, setResult] = useState({
        MappingTypeId: mappingTypeId,
        ResultTypeId: resultTypes?.[0]?.id,
        Result: "",
    })

    return <>
        {
            mappingTypeId && 
            resultTypes &&
                <div className="mt-5">
                    <h3>Crear resultado</h3>
                    <Form     
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit(result)
                        }}
                    >
                        <Form.Select 
                            onChange={(e) => setResult((res) => ({...res, ResultTypeId: Number(e.target.value)}))}
                            aria-label={`Seleccione tipo de resultado`} 
                            value={result?.ResultTypeId} 
                            required
                        >
                            {
                                resultTypes && resultTypes.map(({id, ResultType}, i) => (
                                    <option key={`option-result-type-${mappingTypeId}-${id}-${i}`} value={id}>{ResultType}</option>
                                ))
                            }
                        </Form.Select>
                        <Form.Control 
                            type="text"
                            onChange={(e) => setResult((res) => ({...res, Result: e.target.value}))} 
                            placeholder={"Resultado"}
                            value={result?.Result}
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

export default CreateResultForm;