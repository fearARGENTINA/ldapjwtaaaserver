import { createContext, useContext, useState } from 'react';
import { ALERT_ERROR, ALERT_NONE, ALERT_SUCCESS } from '../config/consts';

const AlertContext = createContext(null);

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(ALERT_NONE);
  const [alertText, setAlertText] = useState(null);

  return (
    <AlertContext.Provider
      value={{
        alert: alert,
        alertText: alertText,
        success: (text, timeout) => {
          setAlertText(text);
          setAlert(ALERT_SUCCESS);
          setTimeout(() => {
            setAlert(ALERT_NONE);
          }, timeout * 1000 || 10000)

        },
        error: (text, timeout) => {
          setAlertText(text);
          setAlert(ALERT_ERROR);
          setTimeout(() => {
            setAlert(ALERT_NONE);
          }, timeout * 1000 || 5000)
        },
        clear: () => (setAlert(ALERT_NONE)),
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export { AlertProvider }

export function useAlertContext() {
  return useContext(AlertContext);
}