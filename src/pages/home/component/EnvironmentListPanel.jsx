import React, {useContext} from 'react';
import {Container, Grid, Icon, Item, Label} from "semantic-ui-react";
import useEnvContext from "../../../core/context/useEnvContext";
import {useNavigation} from "react-navi";
import {useTranslation} from "react-i18next";
import _ from 'lodash';
import uuid4 from 'uuid4';
import {ApplicationContext} from "../../../core/AppRouter";

const EnvironmentListPanel = ({environments}) => {
    const {changeContext} = useEnvContext();
    const navigation = useNavigation();
    const {setState} = useContext(ApplicationContext);
    const {t} = useTranslation();


    const handleClick = (environment) => {
        setState(state => ({
            ...state,
            activeMenuItem: t('menu.forms.name')
        }));
        changeContext(environment);
        navigation.navigate(`/forms/${environment.id}`, {replace: true});
    };
    return <Grid columns={3} divided stackable>
        {
            _.map(_.chunk(environments, 3), (environments) => {
                return <Grid.Row key={uuid4()}>
                    {
                        _.map(environments, (environment) => {
                            return <Grid.Column key={uuid4()}>
                                <Container>
                                <Item.Group link divided relaxed key={uuid4()}>
                                    <Item onClick={() => {
                                        handleClick(environment);
                                    }} key={environment.id}>
                                        <Item.Image size='tiny' src="/cog-solid.svg"/>
                                        <Item.Content>
                                            <Item.Header
                                                as="a">{environment.label ? environment.label : environment.id}</Item.Header>
                                            <Item.Meta>
                                                <Icon name='globe'/><span>{t('environment.url', {url: environment.url})}</span>
                                            </Item.Meta>
                                            <Item.Description>{environment.description}</Item.Description>
                                            <Item.Extra>
                                                <Label
                                                    color={environment.editable ? 'teal' : 'red'}>{t('environment.create', {editable: environment.editable ? t('yes') : t('no')})}</Label>

                                            </Item.Extra>

                                        </Item.Content>
                                    </Item>
                                </Item.Group>
                                </Container>
                            </Grid.Column>
                        })
                    }
                </Grid.Row>
            })
        }
    </Grid>;
};

export default EnvironmentListPanel;
