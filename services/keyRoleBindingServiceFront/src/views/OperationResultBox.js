import Badge from "react-bootstrap/esm/Badge";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Operation from "./Operation";
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { BsXCircleFill } from "react-icons/bs"
import CreateOperationForm from "./CreateOperationForm";
import ListItemInputEditable from "./ListItemInputditable";
import ListItemSelectEditable from "./ListItemSelectEditable";
import ListItemInputWithParseEditable from "./ListItemInputWithParseEditable";

function OperationResultBox({result, resultTypes, handleResultDelete, handleOperationCreate, handleOperationDelete, handleResultUpdate, comparisonValueTypes, fields, operators, ...props}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: props.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Container fluid className="mb-4">
                <Row className="mx-0">
                    <div className="d-flex justify-content-end border border-bottom-0 rounded-top p-1 fs-5">
                        <BsXCircleFill onClick={() => {
                            handleResultDelete(result)
                        }} />
                    </div>
                </Row>
                <Row className="mx-0">
                    <Col xs={8} className="border py-1">
                        <Row className="mx-0 justify-content-md-center">
                            {
                                result["Operations"] && result["Operations"].map((operation, i) => (
                                    <Col sm={6} className="mb-4" key={`operations-${operation["id"]}`}>
                                        <Operation
                                            operation={operation}
                                            handleOperationDelete={handleOperationDelete}
                                        />
                                    </Col>
                                ))
                            }
                            <Col sm={6} key={`operations-${result["id"]}-form`}>
                                <CreateOperationForm
                                    resultId={result["id"]}
                                    comparisonValueTypes={comparisonValueTypes} 
                                    fields={fields} 
                                    operators={operators} 
                                    onSubmit={handleOperationCreate}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={4} className="border py-1 d-flex flex-column justify-content-center fw-bold" style={{wordBreak: "break-all"}}>
                        <div>
                            <div className="mr-5">
                                <ListItemInputWithParseEditable 
                                    id={`result-${result["id"]}`}
                                    handleOnSaveClick={(id, value) => handleResultUpdate({...result, "Result": value})}
                                    text={result["Result"]}
                                    type={result?.ResultType?.ResultType}
                                />
                            </div>
                            <Badge bg="secondary">
                                {
                                    <ListItemSelectEditable
                                        handleOnSaveClick={(id, value) => handleResultUpdate({...result, "ResultTypeId": value})} 
                                        id={`result-type-${result["id"]}`}  
                                        selectedValue={result["ResultType"]["id"]}
                                        options={resultTypes.map((resultType) => ({value: resultType?.id, text: resultType?.ResultType}))}
                                    />
                                    
                                }
                            </Badge>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default OperationResultBox;