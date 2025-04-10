import { useEffect, useState } from "react";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import {
    DndContext, 
    closestCenter,
    MouseSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import OperationResultBox from "./OperationResultBox";
import useMappingsApiService from "../services/MappingsApiService";
import { useAlertContext } from "../contexts/alertContext";
import Spinner from "react-bootstrap/esm/Spinner";
import CreateResultForm from "./CreateResultForm";

function OperationsResults({mappingType, results, resultTypes, fields, operators, comparisonValueTypes}) {
    const [resultsState, setResultsState] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    
    const { deleteResult, createResult, updateResult, getResults, deleteOperation, createOperation } = useMappingsApiService();

    const alert = useAlertContext();

    useEffect(() => {
        setResultsState(results.sort((a,b) => b["Position"] - a["Position"]).reverse())
    }, [setResultsState])

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 5
            }
        })
    );
    function handleDragEnd(event) {
        const {active, over} = event;
        if (active?.id !== over?.id) {
            const oldIndex = resultsState.findIndex(result => result?.id === active?.id);
            const newIndex = resultsState.findIndex(result => result?.id === over?.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newResult = { ...resultsState[oldIndex], "Position": resultsState[newIndex]["Position"] }
                setIsLoading(true);
                updateResult(newResult)
                .then(() => {
                        getResults({mappingTypeId: newResult["MappingTypeId"], order: true})
                            .then((orderedResults) => {
                                setResultsState(orderedResults)
                            })
                            .finally(() => setIsLoading(false))
                    })
                    .catch(() => {
                        alert.error("No se pudo reordenar los resultados, lo lamentamos.");
                        setIsLoading(false)
                    })
            }
        }
    }
    
    function handleOperationDelete(operation) {
        if (operation) {
            setIsLoading(true)
            deleteOperation(operation.id)
                .then(() => {
                    getResults({mappingTypeId: mappingType["id"], order: true})
                        .then((orderedResults) => {
                            setResultsState(orderedResults)
                        })
                        .finally(() => setIsLoading(false))
                })
                .catch((e) => {
                    alert.error("No se pudo eliminar la operacion indicada.");
                    setIsLoading(false)
                })
        }
    }

    function handleOperationCreate(operation) {
        if (operation) {
            setIsLoading(true)
            createOperation(operation)
                .then((newOperation) => {
                    getResults({mappingTypeId: mappingType["id"], order: true})
                        .then((orderedResults) => {
                            setResultsState(orderedResults)
                        })
                        .finally(() => setIsLoading(false))
                })
                .catch((e) => {
                    alert.error("No se pudo crear la operacion indicada.");
                    setIsLoading(false)
                })
        }
    }

    function handleResultUpdate(result) {
        if (result) {
            setIsLoading(true)
            updateResult(result)
                .then((updatedResult) => {
                    getResults({mappingTypeId: mappingType["id"], order: true})
                        .then((orderedResults) => {
                            setResultsState(orderedResults)
                        })
                        .finally(() => setIsLoading(false))
                })
                .catch((e) => {
                    alert.error("No se pudo actualizar el resultado indicado.");
                    setIsLoading(false)
                })
        }
    }
    
    function handleResultCreate(result) {
        if (result) {
            setIsLoading(true)
            createResult(result)
                .then((createdResult) => {
                    getResults({mappingTypeId: mappingType["id"], order: true})
                        .then((orderedResults) => {
                            setResultsState(orderedResults)
                        })
                        .finally(() => setIsLoading(false))
                })
                .catch((e) => {
                    alert.error("No se pudo crear el resultado indicado.");
                    setIsLoading(false)
                })
        }
    }

    function handleResultDelete(result) {
        if (result) {
            setIsLoading(true)
            deleteResult(result?.id)
                .then((deletedResult) => {
                    getResults({mappingTypeId: mappingType["id"], order: true})
                        .then((orderedResults) => {
                            setResultsState(orderedResults)
                        })
                        .finally(() => setIsLoading(false))
                })
                .catch((e) => {
                    alert.error("No se pudo eliminar el resultado indicado.");
                    setIsLoading(false)
                })
        }
    }
    
    return (
        <div>
            <Container fluid>
                <Row className="mx-0 fw-bold">
                    <Col xs={8} className="border border-bottom-0 py-1">
                        Operaciones
                    </Col>
                    <Col xs={4} className="border border-bottom-0 py-1">
                        Resultado <small className="fw-normal">(para editar resultado/tipo de resultado, hacer doble click sobre el elemento)</small>
                    </Col>
                </Row>
            </Container>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
            {
                isLoading ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                :
                <>
                    <SortableContext 
                        items={resultsState}
                        strategy={verticalListSortingStrategy}
                    >
                        {
                            resultsState && resultsState.map((result) => (
                                <OperationResultBox
                                    id={result["id"]}
                                    key={result["id"]}
                                    result={result}
                                    handleResultDelete={handleResultDelete} 
                                    handleOperationCreate={handleOperationCreate}
                                    handleOperationDelete={handleOperationDelete}
                                    handleResultUpdate={handleResultUpdate}
                                    fields={fields}
                                    operators={operators}
                                    comparisonValueTypes={comparisonValueTypes}
                                    resultTypes={resultTypes.filter((resultType) => mappingType?.AllowedResultTypes.includes(resultType?.id) )}
                                />
                            ))
                        }
                    </SortableContext>
                    <CreateResultForm 
                        onSubmit={handleResultCreate} 
                        mappingTypeId={mappingType?.id} 
                        resultTypes={resultTypes.filter((resultType) => mappingType?.AllowedResultTypes.includes(resultType?.id) )}
                    />
                </>
            }                       
            </DndContext>
        </div>
    )
}

export default OperationsResults