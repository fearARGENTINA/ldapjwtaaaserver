import { useEffect, useState } from "react";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import { useAlertContext } from "../contexts/alertContext";
import useMappingsApiService from "../services/MappingsApiService";
import Spinner from "react-bootstrap/esm/Spinner";
import ManageMappingTypes from "./ManageMappingTypes";

function ManageMappingTypesGroups() {
    const [mappingTypesGroups, setMappingTypesGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { getMappingTypesGroups } = useMappingsApiService();
    
    const alert = useAlertContext();
    
    useEffect(() => {
        setIsLoading(true);
        getMappingTypesGroups()
            .then((mappingTypesGroups) => setMappingTypesGroups(mappingTypesGroups))
            .catch(() => alert.error("Hubo un problema al cargar los grupos de mapeos..."))
            .finally( () => setIsLoading(false))

    }, [setMappingTypesGroups])

    return (
        <>
            <h3 className="mb-2">Grupos de mapeos</h3>
            <div>
                <Tabs
                    defaultActiveKey="mappingTypeGroup-1"
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
                            mappingTypesGroups.map((mappingTypeGroup) => {
                                return (
                                    <Tab 
                                        key={`mappingTypeGroup-${mappingTypeGroup["id"]}`} 
                                        eventKey={`mappingTypeGroup-${mappingTypeGroup["id"]}`} 
                                        title={mappingTypeGroup["MappingTypeGroupName"]}
                                    >
                                        <div>
                                            <p>{mappingTypeGroup["Description"]}</p>
                                            <ManageMappingTypes mappingTypeGroupId={mappingTypeGroup["id"]}/>
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

export default ManageMappingTypesGroups;