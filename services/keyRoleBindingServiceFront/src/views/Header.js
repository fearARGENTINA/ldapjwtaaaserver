import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useAuthContext } from '../contexts/authContext';
import logo from '../assets/images/logo.png';
import { APPS, LOGIN } from '../config/routes/paths';

function Header() {
    const {isAuthenticated, user, logout} = useAuthContext();
    
    function handleLogout(e) {
      e.preventDefault();
      logout();
    }

    return(
      <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand>
            <img
              src={logo}
              width="100"
              height="100"
              alt="logo"
            />
          </Navbar.Brand>
          <Navbar.Brand>ADMINISTRACIÓN AUTH-SEC</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse className="justify-content-end">
              {isAuthenticated ?
                <Nav className="justify-content-end">
                  <Nav.Link href={APPS}>Módulos</Nav.Link>
                  <Nav.Link onClick={handleLogout}>Cerrar sesión</Nav.Link>
                </Nav>
                :
                <Nav className="justify-content-end">
                  <Nav.Link href={LOGIN}>Iniciar sesión</Nav.Link>
                </Nav>
              }
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {
        isAuthenticated && user && 
          <Navbar bg="light" expand="lg">
            <Container className="justify-content-end">
              <Navbar.Text className="justify-content-end">Usuario: {user}</Navbar.Text>
            </Container>
          </Navbar>
      }
      </>
    )
}

export default Header;