import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { ACCESS_TOKEN, REFRESH_TOKEN, URI_LOGIN, URI_LOGOUT, URI_USER, URI_REFRESH, URI_API, URI_OTP } from "../config/consts";
import { useAlertContext } from "./alertContext";

export const AuthContext = createContext();

const createAxiosAuthInterceptor = (accessToken, refreshToken, updateAccessToken, endSession) => {    
    const axiosAuthInstance = axios.create({
        baseURL: URI_API
    })
    
    axiosAuthInstance.interceptors.request.use(
        config => {
            if (accessToken) {
                config.headers = {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
            return config;
        }
    );

    axiosAuthInstance.interceptors.response.use(
        response => {
            return response
        },
        error => {
            if ( error?.response?.data?.message === "Token expired" ) {
                axios
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

    return axiosAuthInstance;
}

export function AuthContextProvider({children}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState(localStorage.getItem(ACCESS_TOKEN));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem(REFRESH_TOKEN));
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(null)
    const alert = useAlertContext();
    
    const updateAccessToken = (token) => {
        localStorage.setItem(ACCESS_TOKEN, token);
        setAccessToken(token);
    }
    
    useEffect(() => {
        async function tryLogin() {
            setIsLoading(true)
            const userData = await getUser();
            setIsAuthenticated(userData !== null)
            if ( userData !== null) {
                setUser(String(userData))
            } else {
                logout();
            }
            setIsLoading(false);
        }
        if (accessToken) {
            tryLogin()
        } else {
            setIsLoading(false)
        }
    }, [accessToken])

    let getUser = async () => {
        let data = null
        if (accessToken) {
            data = await axiosAuthInstance
                .get(URI_USER)
                .then((response) => {
                    if (response?.data?.status === "success") {
                        if (response?.data?.user?.user) {
                            return response?.data?.user?.user
                        }
                    }
                })
        }
        return data
    }
        
    const login = (username, password) => {
        return axiosAuthInstance
            .post(URI_LOGIN, {
                username: username,
                password: password,
            }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            })
            .then((response) => {
                const status = response?.data?.status;
                
                if (status === "success") {
                    const rOTPResponse = response?.data?.data;
                    
                    if (rOTPResponse) {
                        return rOTPResponse
                    } else {
                        return null;
                    }
                }
            })
            .catch((error) => {
                if ( error?.response?.data?.message === "User blocked" ) {
                    alert.error("Usuario bloqueado")
                } else {
                    alert.error("Nombre de usuario/contraseña incorrecto/s")
                }
                return null;
            })
    }

    const otp = (otp, otp_access_token) => {
        return axiosAuthInstance
            .post(URI_OTP, {
                otp: otp,
            }, {
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${otp_access_token}`,
                },
                withCredentials: true,
            })
            .then(async (response) => {
                const status = response?.data?.status;
                
                if (status === "success") {
                    const rAccessToken = response?.data?.access_token;
                    const rRefreshToken = response?.data?.refresh_token;
                    
                    if (rAccessToken && rRefreshToken) {
                        localStorage.setItem(ACCESS_TOKEN, rAccessToken);
                        setAccessToken(rAccessToken);
                        localStorage.setItem(REFRESH_TOKEN, rRefreshToken);
                        setRefreshToken(rRefreshToken);
                        setUser(String(await getUser()));
                        setIsAuthenticated(true);
                        alert.success("Inicio de sesión correcto!");
                    }
                }
            })
            .catch((error) => {
                if ( error?.response?.data?.message === "User blocked" ) {
                    alert.error("Usuario bloqueado")
                } else {
                    alert.error("Código OTP incorrecto...")
                }
            })
    }

    const logout = () => {
        if (accessToken) {
            setIsLoading(true);
            axios
                .post(URI_API + URI_LOGOUT, {}, { headers: { Authorization: `Bearer ${accessToken}`}})
                .then((response) => {
                    alert.success("Cierre de sesion correcto!")
                })
                .catch(() => {
                    alert.error("Opss. Algo esta fallando. Disculpe las molestias...")
                })
                .finally(() => {
                    setAccessToken(null);
                    setRefreshToken(null);
                    setIsAuthenticated(false);
                    setIsLoading(false)
                    setUser(null);
                    localStorage.removeItem(ACCESS_TOKEN);
                    localStorage.removeItem(REFRESH_TOKEN);
                })
        }
    }
        
    let axiosAuthInstance = createAxiosAuthInterceptor(accessToken, refreshToken, updateAccessToken, logout);
    
    const value = {
        login,
        otp,
        logout,
        isAuthenticated,
        isLoading,
        user,
        accessToken,
        refreshToken,
        updateAccessToken
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
    return useContext(AuthContext);
}