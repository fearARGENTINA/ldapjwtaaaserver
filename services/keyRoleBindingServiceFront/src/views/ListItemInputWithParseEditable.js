import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import ListGroup from 'react-bootstrap/ListGroup';
import ParseValue from "./ParseValue";

const ListItemInputWithParseEditable = ({id, text, type, handleOnSaveClick}) => {
    const initialValue = text
    const [edit, setEdit] = useState(false);
    const [value, setValue] = useState(text);

    const handleOnDoubleClick = (e) => {
        setEdit(true)
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === "Escape") {
            setEdit(false);
        }
    }

    const handleOnChange = (e) => {
        setValue(e.target.value);
    }

    const handleCancelClick = (e) => {
        setEdit(false);
        setValue(initialValue);
    }

    return (
        <ListGroup.Item
            as="li"
            key={id}
            className="d-flex justify-content-center align-items-start"
            onDoubleClick={handleOnDoubleClick}
        >
            <div>
                { 
                    edit ?
                        <>
                            <Row>
                                <Col xs={12}>
                                    <input 
                                        key={id}
                                        type="text"
                                        onKeyDown={handleKeyDown}
                                        value={value}
                                        onChange={handleOnChange}
                                        onBlur={handleCancelClick}
                                        style={{width: "100%"}}
                                        autoFocus />
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <Button onMouseDown={(e) => {
                                        if ( value !== text ) {
                                            handleOnSaveClick(id, value);
                                        }
                                        handleCancelClick(e);
                                    }}>Guardar</Button>
                                </Col>
                                <Col>
                                    <Button onMouseDown={handleCancelClick}>Cancelar</Button>
                                </Col>
                            </Row>
                        </>
                    : 
                        <ParseValue value={text} valueType={type} keyPrefix={id} />
                }
            </div>
        </ListGroup.Item>
    )
}

export default ListItemInputWithParseEditable;