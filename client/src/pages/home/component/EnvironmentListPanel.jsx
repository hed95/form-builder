import React, {useContext} from 'react';
import useEnvContext from "../../../core/context/useEnvContext";
import {useNavigation} from "react-navi";
import {useTranslation} from "react-i18next";
import _ from 'lodash';
import uuid4 from 'uuid4';
import {ApplicationContext} from "../../../core/AppRouter";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog, faCogs, faEdit, faGlobe} from '@fortawesome/free-solid-svg-icons'
import Card from "react-bootstrap/Card";
import ListGroupItem from "react-bootstrap/ListGroupItem";
import Container from "react-bootstrap/Container";

const EnvironmentListPanel = ({environments}) => {
    const {changeContext} = useEnvContext();
    const navigation = useNavigation();
    const {setState} = useContext(ApplicationContext);
    const {t} = useTranslation();


    const handleClick = async (environment) => {
        setState(state => ({
            ...state,
            activeMenuItem: t('menu.forms.name')
        }));
        changeContext(environment);
        await navigation.navigate(`/forms/${environment.id}`, {replace: true});
    };
    return <Container>
        <div style={{textAlign: 'center'}}>
            <h1 className="display-5"><FontAwesomeIcon icon={faCogs}/><span
                className="ml-2">{t('home.environments')}</span></h1>
        </div>
        {
            _.chunk(environments, 3).map(envs => {
                const cols = _.map(envs, environment => {
                    return <Col className="col-sm-4 d-flex mb-2" key={environment.id}>
                        <Card border="secondary" className="w-100 h-100" key={uuid4()}>
                            <Card.Header><FontAwesomeIcon icon={faCog}/>
                                <span> {environment.label ? environment.label : environment.id}</span></Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    {environment.description}
                                </Card.Text>
                            </Card.Body>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem><FontAwesomeIcon
                                    icon={faGlobe}/><span> {t('environment.url', {url: environment.url})}</span></ListGroupItem>
                                <ListGroupItem
                                    variant={environment.editable ? 'success' : 'danger'}><FontAwesomeIcon
                                    icon={faEdit}/><span> {t('environment.create', {editable: environment.editable ? t('yes') : t('no')})}</span></ListGroupItem>
                            </ListGroup>
                            <Card.Footer className="text-center">
                                <Card.Link href="#" onClick={async () => {
                                    await handleClick(environment);
                                }} className="stretched-link">View forms</Card.Link>
                            </Card.Footer>
                        </Card>
                    </Col>
                });
                return <Container key={uuid4()} className="mt-4"><Row className="d-flex justify-content-center" key={uuid4()}>{cols}</Row></Container>
            })
        }

    </Container>

};

export default EnvironmentListPanel;
