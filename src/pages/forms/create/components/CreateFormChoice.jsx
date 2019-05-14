import {useNavigation} from "react-navi";
import React from 'react';
import {Button, Container, Divider, Grid, Segment} from 'semantic-ui-react'
import {useTranslation} from "react-i18next";
import useEnvContext from "../../../../core/context/useEnvContext";

const CreateFormChoice = () => {
    const navigation = useNavigation();
    const {envContext} = useEnvContext();
    const {t} = useTranslation();
    return <Container><Segment placeholder size="large" color="teal" raised>
        <Grid columns={2} relaxed='very' stackable>
            <Grid.Column>
                <Button primary content={t('form.create.choice.form-builder-label')} icon="wpforms" size="big"
                        onClick={() => {
                            navigation.navigate(`/forms/${envContext.id}/create/builder`);
                        }}/>
            </Grid.Column>

            <Grid.Column verticalAlign='middle'>
                <Button secondary content={t('form.create.choice.form-upload-label')} icon='upload' size='big'
                        onClick={() => {
                            navigation.navigate(`/forms/${envContext.id}/create/file-upload`);
                        }}/>
            </Grid.Column>
        </Grid>

        <Divider vertical>Or</Divider>
    </Segment></Container>

};

export default CreateFormChoice;
