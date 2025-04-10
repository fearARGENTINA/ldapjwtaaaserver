import secret from '../assets/images/ultra-secreto.png';
import { SECRETS } from './routes/paths';

export const ALERT_ERROR="ALERT_ERROR"
export const ALERT_SUCCESS="ALERT_SUCCESS"
export const ALERT_NONE="ALERT_NONE"
export const ALERT_VARIANTS = {
    ALERT_ERROR: "danger",
    ALERT_SUCCESS: "success"
}

export const ACCESS_TOKEN = 'ACCESS_TOKEN';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';
// export const URI_API = process.env.REACT_APP_API_URI
export const URI_API = "https://admin-auth-api.domain.local/"
export const URI_LOGIN = `/login`;
export const URI_OTP = `/otp`;
export const URI_LOGOUT = `/logout`;
export const URI_USER = `/user`
export const URI_REFRESH = `/refresh`
export const URI_GET_SECRETS = `/secrets`
export const URI_CREATE_SECRET = `/secrets`
export const URI_UPDATE_SECRET = `/secrets`
export const URI_DELETE_SECRET = `/secrets/{0}`
export const URI_REFRESH_SECRET = `/secrets/{0}/refresh`
export const URI_GET_ROLES = `/roles`
export const URI_CREATE_ROLE = `/roles`
export const URI_UPDATE_ROLE = `/roles`
export const URI_DELETE_ROLE = `/roles/{0}`

export const ALL_APPS = [
    {
        image: secret,
        title: "Administrar secretos",
        text: "Este módulo te permitirá consultar, crear y modificar los secretos creados",
        goTo: SECRETS,
    },
]