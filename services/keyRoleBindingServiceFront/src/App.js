import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './App.css'
import { AuthContextProvider } from './contexts/authContext';
import Frame from './views/Frame';
import { AlertProvider } from './contexts/alertContext';

function App() {
  return (
    <Container>
      <Row>
        <Col md={{span: 10, offset: 1}}>
          <AlertProvider>
            <AuthContextProvider>
              <Frame></Frame>
            </AuthContextProvider>
          </AlertProvider>
        </Col>
      </Row>
    </Container>
  );
}

export default App;