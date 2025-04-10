import { ALERT_NONE, ALERT_VARIANTS } from "../config/consts";
import { useAlertContext } from "../contexts/alertContext";
import Alert from 'react-bootstrap/Alert';

const Alerts = () => {
    const alert = useAlertContext();
    if (alert.alert !== ALERT_NONE) {
        return (
            <div className="alert-modal">
                <Alert key={alert.alertText} variant={ALERT_VARIANTS[alert.alert]} onClose={() => alert.clear()} dismissible>{alert.alertText}</Alert>
            </div>
        )
    } else {
        return null;
    }
}

export default Alerts;