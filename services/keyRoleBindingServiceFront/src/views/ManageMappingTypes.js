import { useEffect, useState } from "react";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import { useAlertContext } from "../contexts/alertContext";
import useMappingsApiService from "../services/MappingsApiService";
import Spinner from "react-bootstrap/esm/Spinner";
import OperationsResults from "./OperationsResults";
import { BsCheckCircle, BsCircle } from "react-icons/bs";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";

function ManageMappingTypes({mappingTypeGroupId}) {
    const [mappingTypes, setMappingTypes] = useState([]);
    const [fields, setFields] = useState([]);
    const [operators, setOperators] = useState([]);
    const [comparisonValueTypes, setComparisonValueTypes] = useState([]);
    const [resultTypes, setResultTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { getMappingTypes, getFields, getOperators, getComparisonValueTypes, getResultTypes } = useMappingsApiService();
    
    const alert = useAlertContext();
    
    useEffect(() => {
        setIsLoading(true);
        getMappingTypes({mappingTypeGroupId})
            .then((mappingTypes) => setMappingTypes(mappingTypes))
            .catch(() => alert.error("Hubo un problema al cargar los mapeos..."))
            .finally( () => setIsLoading(false))
        
        getFields({})
            .then((fields) => setFields(fields))
            .catch(() => alert.error("Hubo un problema al cargar los campos..."))
        
        getOperators({})
            .then((operators) => setOperators(operators))
            .catch(() => alert.error("Hubo un problema al cargar los operadores..."))
        
        getComparisonValueTypes()
            .then((comparisonValueTypes) => setComparisonValueTypes(comparisonValueTypes))
            .catch(() => alert.error("Hubo un problema al cargar los tipos de valores de comparación..."))
            
        getResultTypes({})
            .then((resultTypes) => setResultTypes(resultTypes))
            .catch(() => alert.error("Hubo un problema al cargar los tipos de resultados..."))

    }, [setMappingTypes, setFields, setOperators, setComparisonValueTypes, setResultTypes])

    return (
        <>
            <div>
                <Tabs
                    defaultActiveKey="mappingType-1"
                    id="uncontrolled-tab-example"
                    className="mb-5"
                    fill
                >
                    {
                        isLoading ?
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                        : 
                            mappingTypes && mappingTypes.map((mappingType) => {
                                return (
                                    <Tab 
                                        key={`mappingType-${mappingType["id"]}`} 
                                        eventKey={`mappingType-${mappingType["id"]}`} 
                                        title={`${mappingType["MappingTypeName"]} (${mappingType["Required"]})`}>
                                        <div>
                                            <Row className="d-flex justify-content-center">
                                                <Col md={4}>
                                                    <h4>{mappingType["Required"]}</h4>
                                                    <ul>
                                                        {
                                                            mappingType?.RequiredDependencies?.map((dep, i) => {
                                                                    const mapping = mappingTypes[mappingTypes.findIndex((m) => m?.id === dep["MappingTypeId"])]
                                                                    return (
                                                                        <li key={`required-if-${mappingType?.id}-${i}`}>
                                                                            {
                                                                                mapping["MappingTypeName"]
                                                                            }
                                                                        </li>
                                                                    )
                                                                } 
                                                            )
                                                        }
                                                    </ul>
                                                </Col>
                                            </Row>
                                            <p>{mappingType["Description"]}</p>
                                            <p className="fw-bold">¿Agregable? (posibilidad de matchear mas de un resultado): <span className="fs-3">{mappingType?.IsAggregatable ? <BsCheckCircle className="text-success" /> : <BsCircle className="text-danger" />}</span></p>
                                            <OperationsResults
                                                mappingType={mappingType}
                                                results={mappingType["Results"]}
                                                fields={fields}
                                                operators={operators}
                                                comparisonValueTypes={comparisonValueTypes}
                                                resultTypes={resultTypes}
                                            />
                                        </div>
                                    </Tab>
                                )
                            })
                    }
                </Tabs>
            </div>
        </>
    )
}

export default ManageMappingTypes;