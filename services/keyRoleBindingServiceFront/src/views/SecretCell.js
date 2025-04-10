import { useState } from 'react';
import Button from 'react-bootstrap/Button';

function SecretCell({value}) {
    const [hide, setHide] = useState(true)

    return (
        <div>
            <p>
                {
                    hide ? 
                        "*".repeat(value.length)
                    :
                        value
                }
            </p>
            <Button onClick={() => setHide((h) => !h)}>
                Ver
            </Button>
        </div>
    )
}

export default SecretCell;