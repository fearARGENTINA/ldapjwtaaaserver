import { useEffect, useState } from "react";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import { useAlertContext } from "../contexts/alertContext";
import useMappingsApiService from "../services/MappingsApiService";
import Spinner from "react-bootstrap/esm/Spinner";
import ManageFields from "./ManageFields";

function ManageFieldsGroups() {
    const [fieldsGroups, setFieldsGroups] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { getFieldsGroups } = useMappingsApiService();
    
    const alert = useAlertContext();
    
    useEffect(() => {
        setIsLoading(true);
        getFieldsGroups()
            .then((fieldsGroups) => setFieldsGroups(fieldsGroups))
            .catch(() => alert.error("Hubo un problema al cargar los grupos de campos..."))
            .finally( () => setIsLoading(false))

    }, [setFieldsGroups])

    return (
        <>
            <h3 className="mb-2">Grupos de campos</h3>
            <div>
                <Tabs
                    defaultActiveKey="fieldGroup-1"
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
                            fieldsGroups && fieldsGroups.map((fieldGroup) => {
                                return (
                                    <Tab
                                        key={`fieldGroup-${fieldGroup["id"]}`}
                                        eventKey={`fieldGroup-${fieldGroup["id"]}`} 
                                        title={fieldGroup?.FieldGroupName}>
                                        <div>
                                            <p>{fieldGroup["Description"]}</p>
                                            <ManageFields fieldGroupId={fieldGroup["id"]}/>
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

export default ManageFieldsGroups;