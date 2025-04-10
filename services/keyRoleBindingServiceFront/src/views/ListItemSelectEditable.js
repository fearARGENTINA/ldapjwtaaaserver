import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';

const ListItemSelectEditable = ({id, options, selectedValue, handleOnSaveClick}) => {
    const initialOption = options[options.findIndex(option => option?.value === selectedValue)]
    const [edit, setEdit] = useState(false);
    const [value, setValue] = useState(selectedValue);
    const handleOnDoubleClick = (e) => {
        setEdit(true)
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === "Escape") {
            setEdit(false);
        }
    }

    const handleOnChange = (e) => {
        setValue(Number(e.target.value));
    }

    const handleCancelClick = (e) => {
        setEdit(false);
        setValue(initialOption?.value);
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
                                <Col>
                                    <Form.Select 
                                        key={id}
                                        onChange={handleOnChange} 
                                        aria-label={`Seleccione elemento de la lista`} 
                                        value={value}
                                        onKeyDown={handleKeyDown}
                                        onBlur={handleCancelClick} 
                                        autoFocus
                                        required
                                    >
                                        {
                                            options && options.map(({text, value}, i) => (
                                                <option key={`option-edit-${id}-${i}`} value={value}>{text}</option>
                                            ))
                                        }
                                    </Form.Select>
                                        
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button onMouseDown={(e) => {
                                        if ( value !== initialOption?.value ) {
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
                        options?.[options.findIndex(option => option?.value === selectedValue)]?.text
                }
            </div>           
        </ListGroup.Item>
    )
}

export default ListItemSelectEditable;