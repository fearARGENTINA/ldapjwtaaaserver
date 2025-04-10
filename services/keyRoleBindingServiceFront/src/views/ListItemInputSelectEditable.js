import { useEffect, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import CloseButton from "react-bootstrap/esm/CloseButton";
import Spinner from "react-bootstrap/esm/Spinner";

const ListItemInputSelectEditable = ({id, text, options, selectedValue, handleOnSaveClick, handleOnCloseClick}) => {
    const initialOption = options[options.findIndex(option => option?.value === selectedValue)]
    const initialText = text
    const [edit, setEdit] = useState(false);
    const [value, setValue] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(false)
        setValue({text, selectedValue})
    }, [text, selectedValue])

    const handleOnDoubleClick = (e) => {
        setEdit(true)
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === "Escape") {
            setEdit(false);
        }
    }

    const handleOnChangeSelect = (e) => {
        setValue((v) => ({...v, selectedValue: Number(e.target.value)}));
    }
    
    const handleOnChangeText = (e) => {
        setValue((v) => ({...v, text: e.target.value}));
    }

    const handleCancelClick = (e) => {
        setEdit(false);
        setValue({selectedValue: initialOption?.value, text: initialText});
    }

    const handleSubmit = (id, data) => {
        handleOnSaveClick(id, data)
    }

    const handleClose = (e) => {
        handleOnCloseClick(e)
    }
    return (
        <ListGroup.Item
            as="li"
            key={id}
            className="d-flex justify-content-center align-items-start"
            onDoubleClick={handleOnDoubleClick}
        >
            { 
                isLoading ?
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                :   
                    <>
                        {
                            edit ?
                                <>
                                    <Row style={{width: "100%"}}>
                                        <Col xs={12}>
                                            <Row>
                                                <Col xs={6}>
                                                    <Form.Control
                                                        key={id}
                                                        type="text"
                                                        onKeyDown={handleKeyDown}
                                                        value={value?.text}
                                                        onChange={handleOnChangeText}
                                                        style={{width: "100%"}}
                                                        autoFocus
                                                    />
                                                </Col>
                                                <Col xs={6}>
                                                    <Form.Select
                                                        key={id}
                                                        onChange={handleOnChangeSelect} 
                                                        aria-label={`Seleccione elemento de la lista`} 
                                                        value={value?.selectedValue}
                                                        onKeyDown={handleKeyDown}
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
                                                
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Button onMouseDown={(e) => {
                                                if ( value.text !== initialText || value.selectedValue !== selectedValue ) {
                                                    handleSubmit(id, value);
                                                }
                                                handleCancelClick(e);
                                            }}>Guardar</Button>
                                        </Col>
                                        <Col>
                                            <Button onMouseDown={handleCancelClick}>Cancelar</Button>
                                        </Col>
                                        <Col xs={2} className="d-flex justify-content-end fs-2">
                                            <CloseButton onClick={handleClose} />
                                        </Col>
                                    </Row>
                                </>
                            : 
                                <Row style={{width: "100%"}}>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={5} className="text-start">
                                                { text }
                                            </Col>
                                            <Col xs={5}>
                                                { 
                                                    options?.[options.findIndex(option => option?.value === selectedValue)]?.text
                                                }
                                            </Col>
                                            <Col xs={2} className="d-flex justify-content-end fs-2">
                                                <CloseButton onClick={handleClose} />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                        }
                    </>
                
            }
        </ListGroup.Item>
    )
}

export default ListItemInputSelectEditable;