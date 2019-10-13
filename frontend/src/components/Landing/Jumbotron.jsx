import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  ButtonToolbar,
  Button,
} from 'react-bootstrap';

import logo from '../../assets/img/images/landing/berkeleytime.png';

function Jumbotron() {
  return (
    <div className="jumbo">
      <Container className="jumbo-container">
        <Row>
          <Col lg={5}>
            <div className="jumbo-heading">
              <h1>BerkeleyTime</h1>
              <p>Course discovery, simplified. Built by students for students.</p>
              <ButtonToolbar className="jumbo-heading-buttons">
                <Button variant="bt-blue" size="bt-lg" as={Link} to="/catalog">Explore courses now</Button>
                <Button variant="bt-white" size="bt-lg" as={Link} to="/about">About Us</Button>
              </ButtonToolbar>
            </div>
          </Col>
          <Col lg={7}>
            <div className="jumbo-img-container">
              <img className="jumbo-img" src={logo} alt="jumbotron" />
            </div>
          </Col>
        </Row>
      </Container>
    </div>

  );
}

export default Jumbotron;
