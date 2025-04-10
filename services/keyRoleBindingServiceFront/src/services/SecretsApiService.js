import axios from "axios";
import { URI_API, URI_CREATE_ROLE, URI_CREATE_SECRET, URI_DELETE_ROLE, URI_DELETE_SECRET, URI_GET_ROLES, URI_GET_SECRETS, URI_REFRESH, URI_REFRESH_SECRET, URI_UPDATE_ROLE, URI_UPDATE_SECRET } from "../config/consts";
import { useAuthContext } from "../contexts/authContext";
import { format } from "react-string-format";
const queryString = require('query-string');

const createAxiosSecretsApiInterceptor = (accessToken, refreshToken, updateAccessToken, endSession) => {    
    const axiosServiceApiInstance = axios.create({
        baseURL: URI_API,
        paramsSerializer: (params) => queryString.stringify(params)
    })
    
    axiosServiceApiInstance.interceptors.request.use(
        config => {
            if (accessToken) {
                config.headers = {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
            return config;
        }
    );

    axiosServiceApiInstance.interceptors.response.use(
        response => {
            return response
        },
        async error => {
            if ( error?.response?.status === 401 ) {
                await axios
                    .post(URI_API + URI_REFRESH, {}, {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`
                        }
                    })
                    .then((response) => {
                        if (response?.data?.status === "success") {
                            if (response?.data?.access_token) {
                                updateAccessToken(response?.data?.access_token)
                            }
                        } else {
                            endSession();
                        }
                    })
                    .catch((error) => {
                        endSession();
                    })
            }
            return Promise.reject(error);
        }
    )

    return axiosServiceApiInstance;
}

function useSecretsApiService() {
    const { updateAccessToken, logout, accessToken, refreshToken } = useAuthContext();

    const axiosServiceApiInstance = createAxiosSecretsApiInterceptor(accessToken, refreshToken, updateAccessToken, logout);

    const getSecrets = ({id, audience, limit, skip, filters}) => {
        let params = {}

        if (id) {
            params['id'] = id
        }
        if (audience) {
            params["audience"] = audience
        }
        
        if (limit) {
            params["limit"] = limit
        }

        if (skip) {
            params["skip"] = skip
        }

        filters.forEach((filter) => {
            if (filter?.id === "Audience") {
                params["searchAudience"] = filter?.value
            }
        })
        return axiosServiceApiInstance
            .get(URI_GET_SECRETS, { params })
            .then((response) => response?.data)
            .catch((error) => Promise.reject(error.response?.data?.reason))
    }

    const createSecret = (body) => {
        return axiosServiceApiInstance
            .post(URI_CREATE_SECRET, {...body})
            .then((response) => response?.data?.secret)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const updateSecret = (body) => {
        return axiosServiceApiInstance
            .put(URI_UPDATE_SECRET, {...body})
            .then((response) => response?.data?.secret)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const refreshSecret = (id) => {
        const uri = format(URI_REFRESH_SECRET, id)
        return axiosServiceApiInstance
            .post(uri)
            .then((response) => response?.data?.secret)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }
    
    const deleteSecret = (id) => {
        const uri = format(URI_DELETE_SECRET, id)
        return axiosServiceApiInstance
            .delete(uri)
            .then((response) => response?.data?.secret)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const getRoles = ({id, role, distinguishedName, secretId}) => {
        let params = {}

        if (id) {
            params["id"] = id
        }

        if (role) {
            params["role"] = role
        }

        if (distinguishedName) {
            params["distinguishedName"] = distinguishedName
        }

        if (secretId) {
            params["secretId"] = secretId
        }
        return axiosServiceApiInstance
            .get(URI_GET_ROLES, { params })
            .then((response) => response?.data?.roles)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const createRole = (body) => {
        return axiosServiceApiInstance
            .post(URI_CREATE_ROLE, {...body})
            .then((response) => response?.data?.role)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }
    
    const updateRole = (body) => {
        return axiosServiceApiInstance
            .put(URI_UPDATE_ROLE, {...body})
            .then((response) => response?.data?.role)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const deleteRole = (id) => {
        const uri = format(URI_DELETE_ROLE, id)
        return axiosServiceApiInstance
            .delete(uri)
            .then((response) => response?.data?.role)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }
    
    return {
        getSecrets,
        createSecret,
        updateSecret,
        deleteSecret,
        refreshSecret,
        getRoles,
        createRole,
        updateRole,
        deleteRole,
    }
}

export default useSecretsApiService;