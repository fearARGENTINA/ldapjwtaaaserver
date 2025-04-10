import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import Table from './Table';
import { DefaultFilterForColumn } from "./Filter";
import { useAlertContext } from "../contexts/alertContext";
import useSecretsApiService from "../services/SecretsApiService";
import SecretCell from "./SecretCell";
import Button from "react-bootstrap/esm/Button";
import ModalDeleteSecret from "./ModalDeleteSecret";
import Form from 'react-bootstrap/Form';
import ModalEditRole from "./ModalEditRole";
import { BsXCircleFill } from "react-icons/bs";
import ModalCreateRole from "./ModalCreateRole";

function ViewAllSecrets() {
    const [pageCount, setPageCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [data, setData] = useState([]);
    const fetchIdRef = useRef(0);
    const [loading, setLoading] = useState(false);
    const [selectedSecret, setSelectedSecret] = useState({});
    const [selectedRole, setSelectedRole] = useState({});
    const [deleteModalHide, setDeleteModalHide] = useState(true);
    const [updateRoleModalHide, setUpdateRoleModalHide] = useState(true);
    const [createRoleModalHide, setCreateRoleModalHide] = useState(true);
    const [newSecretAudience, setNewSecretAudience] = useState("")
    const [fetchLimit, setFetchLimit] = useState(100);
    const [fetchSkip, setFetchSkip] = useState(0);
    const [fetchFilters, setFetchFilters] = useState({});
    const [submitNewSecretButtonDisabled, setSubmitNewSecretButtonDisabled] = useState(false);
    const { getSecrets, refreshSecret, createSecret } = useSecretsApiService();
    const alert = useAlertContext();

    const fetchAPIData = async ({ limit, skip, filters }) => {
        try {
            setFetchLimit(limit)
            setFetchSkip(skip)
            setFetchFilters(filters)
            setLoading(true);
            let data = await getSecrets({limit, skip, filters});
            setData(data?.secrets);
            setPageCount(data?.paging?.pages);
            setTotalCount(data?.paging?.total);
        } catch (e) {
            setData([]);
            setPageCount(0);
        } finally {
            setLoading(false);
        }
    };
  
    const fetchData = useCallback(
        ({ pageSize, pageIndex, filters }) => {
            const fetchId = ++fetchIdRef.current;
            setLoading(true);
            if (fetchId === fetchIdRef.current) {
                fetchAPIData({
                    limit: pageSize,
                    skip: pageSize * pageIndex,
                    filters: filters
                });
            }
        },
        []
    );
  
    const refreshSecretHandler = ({secretId, rowId}) => {
        refreshSecret(secretId)
            .then((secret) => {
                let newData = [...data]
                newData[rowId] = secret
                setData(newData)
            })
            .catch(() => {
                alert.error("No se pudo refrescar el secreto especificado...")
            })
    };
    
    const afterDeletionCallback = () => {
        const newData = [...data];
        newData.splice(selectedSecret?.rowId, 1);
        setData(newData);
    };

    const deleteSecretHandler = ({rowId}) => {
        setSelectedSecret({
            rowId,
            secret: data[rowId]
        });
        
        setDeleteModalHide(false);
    };
    
    const handleSecretCreate = (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitNewSecretButtonDisabled(true);
        createSecret({audience: newSecretAudience})
            .then((secret) => {
                alert.success("Secreto creado correctamente.")
                fetchAPIData({limit:fetchLimit, skip:fetchSkip, filters:fetchFilters})
            })
            .catch(() => alert.error("No se pudo crear el secreto especificado..."))
            .finally(() => {
                setLoading(false);
                setSubmitNewSecretButtonDisabled(false);
            })
    }

    const handleDoubleClickRole = ({role, roleRowId, secretRowId}) => {
        setSelectedRole({
            roleRowId,
            secretRowId,
            role,
        });

        setUpdateRoleModalHide(false);
    }
    
    const handleClickCreateRole = ({secretRowId}) => {
        setSelectedSecret({
            secretRowId,
            secret: data[secretRowId],
        });

        setCreateRoleModalHide(false);
    }

    const afterCreateRoleCallback = (createdRole) => {
        let newData = [...data]
        newData[selectedSecret?.secretRowId].Roles.push(createdRole)
        setData(newData)
    }

    const afterUpdateRoleCallback = (updatedRole) => {
        let newData = [...data]
        newData[selectedRole?.secretRowId].Roles[selectedRole?.roleRowId] = updatedRole
        setData(newData)
    }
    
    const afterDeleteRoleCallback = () => {
        const newData = [...data];
        newData[selectedRole?.secretRowId].Roles.splice(selectedRole?.roleRowId, 1);
        setData(newData);
    }

    const columns = useMemo(() => [
        { 
            minWidth: 200, 
            Header: "Audiencia", 
            accessor: "Audience", 
            show: true, 
            Filter: DefaultFilterForColumn 
        },
        { 
            minWidth: 500, 
            disableFilters: true, 
            Header: "Secreto", 
            accessor: "SecretKey", 
            Cell: SecretCell, 
            show: true, 
            Filter: DefaultFilterForColumn 
        },
        { 
            minWidth: 200, 
            disableFilters: true, 
            Header: "Roles", 
            id: "Roles", 
            accessor: "Roles", 
            show: true,
            Cell: ({value, row}) => <div>
                {
                    value?.map((v, i) => 
                        value && 
                            <div
                                key={`role-${v?.id}`} 
                            >
                                <div 
                                    onDoubleClick={() => handleDoubleClickRole({
                                        role: v, 
                                        secretRowId: row.id, 
                                        roleRowId: i})
                                    }
                                    className="badge bg-secondary"
                                >
                                    {v?.Role}
                                </div>
                            </div>
                        )
                }
                <Button 
                    onClick={() => handleClickCreateRole({
                        secretRowId: row.id, 
                        })
                    }
                    className="badge bg-primary"
                >
                    Crear rol
                </Button>
            </div>
        },
        { 
            minWidth: 200, 
            disableFilters: true, 
            Header: "Acciones", 
            accessor: "id", 
            show: true,
            id: "id", 
            Cell: ({value, row}) => (
                <>
                    <Button variant="primary" onClick={() => refreshSecretHandler({secretId: value, rowId: row.id})}>Refrescar secreto</Button>
                    <Button variant="danger" className="bt-3" onClick={() => deleteSecretHandler({secretId: value, rowId: row.id})}>Eliminar secreto</Button>
                </>
            )
        },
    ]);
    
    return (
        <div className="container mx-auto flex flex-col">
            <div className="flex justify-center mt-8">
                <Table
                    pageCount={pageCount}
                    fetchData={fetchData}
                    columns={columns}
                    loading={loading}
                    data={data}
                    totalCount={totalCount}
                />
            </div>
            <>
                <h4 className="text-center">Crear un nuevo secreto</h4>
                <Form onSubmit={handleSecretCreate} className="w-100">
                    <Form.Group className="mb-3" controlId="SecretForm.SecretInput">
                        <Form.Label>Audiencia</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Nombre de la audiencia" 
                            value={newSecretAudience}
                            onChange={(e) => setNewSecretAudience(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={submitNewSecretButtonDisabled} style={{width: "100%"}}>
                        Crear
                    </Button>
                </Form>
            </>
            <ModalDeleteSecret 
                audience={selectedSecret?.secret?.Audience} 
                secretId={selectedSecret?.secret?.id} 
                afterDeletionCallback={() => afterDeletionCallback()}
                show={!deleteModalHide} 
                onHide={() => setDeleteModalHide(true)} 
            />
            <ModalEditRole
                role={selectedRole?.role} 
                afterUpdateCallback={afterUpdateRoleCallback}
                afterDeleteCallback={afterDeleteRoleCallback}
                show={!updateRoleModalHide} 
                onHide={() => setUpdateRoleModalHide(true)} 
            />
            <ModalCreateRole
                secretId={selectedSecret?.secret?.id}
                afterCreateCallback={afterCreateRoleCallback}
                show={!createRoleModalHide} 
                onHide={() => setCreateRoleModalHide(true)}
            />

        </div>
    );
}

export default ViewAllSecrets;