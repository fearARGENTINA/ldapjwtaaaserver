import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';

function AppBox({image, title, text, goTo}) {
    return (
        <div className="d-flex justify-content-center">
            <Link to={goTo} style={{ textDecoration: 'none', width: '15rem' }} >
                <Card className="card-box">
                    <Card.Img className="card-image" variant="top" src={image} />
                    <Card.Body>
                        <Card.Title className="card-title">{title}</Card.Title>
                        <Card.Text className="card-text">{text}</Card.Text>
                    </Card.Body>
                </Card> 
            </Link>
        </div>
    )
}

export default AppBox;