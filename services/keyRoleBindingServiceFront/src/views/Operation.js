    import Badge from "react-bootstrap/esm/Badge";
import CloseButton from "react-bootstrap/esm/CloseButton";
import { BsXCircleFill } from 'react-icons/bs';
import ParseValue from "./ParseValue";

function Operation({operation, handleOperationDelete}) {
    return (
        <>
            <div className="d-flex justify-content-end border border-bottom-0 rounded-top p-1 fs-5">
                <BsXCircleFill onClick={() => {
                    handleOperationDelete(operation)
                }} />
            </div>
            <div style={{fontSize: "14px"}} className="border border-top-0 rounded-bottom p-1">
                <span className="d-inline-block bg-primary m-1 rounded p-1">{operation["Field"]["fieldName"]}<Badge>{operation["Field"]["fieldType"]["fieldType"]}</Badge></span>
                <Badge className="d-inline-block bg-dark m-1 rounded p-1">{operation["Operator"]["OperationName"]}</Badge>
                <span className="d-inline-block bg-primary m-1 rounded p-1">
                    <ParseValue value={operation["ComparisonValue"]} valueType={operation["ComparisonValueType"]["valueType"]} keyPrefix={operation["id"]} />
                    <Badge>{operation["ComparisonValueType"]["valueType"]}</Badge>
                </span>
            </div>
        </>
    )
}

export default Operation;