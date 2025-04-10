import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import ListGroup from 'react-bootstrap/ListGroup';

const ListItemInputEditable = ({id, text, handleOnSaveClick}) => {
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
            <div style={{width: "100%", display: "inline-block", flex: 0}}>
                { 
                    edit ?
                        <>
                            <Row fluid>
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
                        text
                }
            </div>
        </ListGroup.Item>
    )
}

export default ListItemInputEditable;