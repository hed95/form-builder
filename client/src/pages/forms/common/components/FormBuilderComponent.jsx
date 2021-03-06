import React from 'react';
import {FormBuilder, Formio} from 'react-formio';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {EXECUTING} from "../../../../core/api/actionTypes";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import useEnvContext from "../../../../core/context/useEnvContext";
import keycloakTokenProvider from '../../../../core/auth/KeycloakTokenProvider';
import {useKeycloak} from "react-keycloak";
import '../../../../core/form/SubFormComponent';
import FormJsonSchemaEditor from "../../edit/components/FormJsonSchemaEditor";
import {useTranslation} from "react-i18next";
import PreviewFormModal from "../../create/components/PreviewFormModal";
import {isMobile} from "react-device-detect";
import {host} from "../../../../core/host";

const FormBuilderComponent = ({
                                  form,
                                  updateField,
                                  messageKeyPrefix,
                                  updateForm,
                                  status,
                                  backToForms,
                                  formChoices,
                                  openPreview,
                                  save,
                                  closePreview,
                                  formInvalid,
                                  changeDisplay,
                                  openInSchemaEditorMode,
                                  changeSchemaView,
                                  onRawJSONUpdate,
                                  changeJSONEditorMode
                              }) => {
    const {t} = useTranslation();
    const {envContext} = useEnvContext();
    const {keycloak} = useKeycloak();

    Formio.plugins.forEach(plugin => {
        Formio.deregisterPlugin(plugin);
    });


    Formio.baseUrl = `${host}/${envContext.id}`;
    Formio.formsUrl = `${host}/${envContext.id}/form`;
    Formio.formUrl = `${host}/${envContext.id}/form`;
    Formio.projectUrl = `${host}/${envContext.id}`;
    Formio.plugins = [{
        priority: 0,
        preRequest: async function (requestArgs) {
            if (!requestArgs.opts.header) {
                requestArgs.opts.header = new Headers({
                    'Accept': 'application/json',
                    'Content-type': 'application/json; charset=UTF-8'
                });
            }
            const token = await keycloakTokenProvider.fetchKeycloakToken(envContext, keycloak);
            requestArgs.opts.header.set('Authorization', `Bearer ${token}`);
            requestArgs.opts.header.set('x-user-email', keycloak.tokenParsed.email);
            requestArgs.url = requestArgs.url.replace("_id", "id");
            return requestArgs;
        }
    }, {
        priority: 0,
        requestResponse: function (response) {
            return {
                ok: response.ok,
                json: () => response.json().then((result) => {
                    if (result.forms) {
                        return result.forms.map((form) => {
                            form['_id'] = form.id;
                            return form;
                        });
                    }
                    result['_id'] = result.id;
                    return result;
                }),
                status: response.status,
                headers: response.headers
            };

        }
    }];

    const actions = <React.Fragment>
        <Row>
            <Col className="d-flex flex-column">
            <ButtonToolbar>
                    <Button data-cy="cancel-edit-form"
                            variant="secondary"
                            className="mr-2"
                            block={isMobile}
                            onClick={() => backToForms()}>{t('form.cancel.label')}</Button>
                    <Button data-cy="edit-schema-form"
                            variant="info"
                            className="mr-2"
                            block={isMobile}
                            onClick={(e) => {
                                e.preventDefault();
                                changeSchemaView();
                            }}>{openInSchemaEditorMode ? t('form.edit.label-formbuilder') : t('form.schema.edit.label')}</Button>
                    <Button data-cy="preview-form"
                            variant="dark"
                            block={isMobile}
                            className="mr-2"
                            onClick={() => openPreview()}>{t('form.preview.label')}</Button>
                    <Button data-cy="persist-form"
                            variant="primary"
                            className="mr-2"
                            block={isMobile}
                            disabled={formInvalid()}
                            onClick={() => save()}>{status === EXECUTING ? t(`${messageKeyPrefix}.updating-label`) : t(`${messageKeyPrefix}.update-label`)}</Button>

                </ButtonToolbar>
            </Col>
        </Row>
    </React.Fragment>;
    if (!form.data.display) {
        return <div/>
    }
    return <Container>
        {!openInSchemaEditorMode ? <React.Fragment>
            <Row>
                <Container>
                    <Row>
                        <Col>
                            <hr className="hr-text" data-content={t('form.create.actions')}/>
                        </Col>
                    </Row>
                    {actions}
                    <Row>
                        <Col>
                            <hr className="hr-text" data-content={t('form.details')}/>
                        </Col>
                    </Row>
                    <Row className="justify-content-center align-items-center">
                        <Col>
                            <Form>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="title">
                                        <Form.Label
                                            className="font-weight-bold">{t(`${messageKeyPrefix}.form-title.label`)}</Form.Label>
                                        <Form.Control type="text"
                                                      required
                                                      name="title"
                                                      defaultValue={form.data.title}
                                                      onChange={(event) => updateField("title", event.target.value)}
                                                      isInvalid={form.missing.title}
                                                      placeholder={t(`${messageKeyPrefix}.form-title.placeholder`)}/>
                                        <Form.Control.Feedback type="invalid">
                                            {t(`${messageKeyPrefix}.form-title.missing`)}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="name">
                                        <Form.Label
                                            className="font-weight-bold">{t(`${messageKeyPrefix}.form-name.label`)}</Form.Label>
                                        <Form.Control type="text"
                                                      required
                                                      name="name"
                                                      defaultValue={form.data.name}
                                                      onChange={(event) => updateField("name", event.target.value)}
                                                      isInvalid={form.missing.name}
                                                      placeholder={t(`${messageKeyPrefix}.form-name.placeholder`)}/>
                                        <Form.Control.Feedback type="invalid">
                                            {t(`${messageKeyPrefix}.form-name.missing`)}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="path">
                                        <Form.Label
                                            className="font-weight-bold">{t(`${messageKeyPrefix}.form-path.label`)}</Form.Label>
                                        <Form.Control type="text"
                                                      required
                                                      name="path"
                                                      defaultValue={form.data.path}
                                                      onChange={(event) => updateField("path", event.target.value)}
                                                      isInvalid={form.missing.path}
                                                      placeholder={t(`${messageKeyPrefix}.form-path.placeholder`)}/>
                                        <Form.Control.Feedback type="invalid">
                                            {t(`${messageKeyPrefix}.form-path.missing`)}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="display">
                                        <Form.Label
                                            className="font-weight-bold">{t(`${messageKeyPrefix}.form-type.select`)}</Form.Label>

                                        <Form.Control as="select"
                                                      data-cy="displayType"
                                                      placeholder={t(`${messageKeyPrefix}.form-type.select-placeholder`)}
                                                      value={form.data.display}
                                                      onChange={(e) => {
                                                          changeDisplay(e.target.value)
                                                      }}>
                                            {formChoices.map((choice) => {
                                                return <option key={choice.key}
                                                               value={choice.value}>{choice.text}</option>
                                            })}

                                        </Form.Control>
                                    </Form.Group>

                                </Form.Row>

                            </Form>
                        </Col>
                    </Row>
                </Container>
            </Row>
            <Row>
                <Col>
                    <hr className="hr-text" data-content={t('form.create.choice.form-builder-label')}/>
                </Col>
            </Row>
            <Row>
                <Container>
                    <FormBuilder

                        form={{
                        display: form.data.display,
                        components: form.data.components ? form.data.components : [],
                        title: form.data.title,
                        name: form.data.name,
                        path: form.data.path
                        }} onChange={(form) => updateForm(form)}/>
                </Container>
            </Row>
        </React.Fragment> : <React.Fragment><Row className="mb-2 mt-2">
            <Col>
                <FormJsonSchemaEditor
                    refreshOnContentChange={false}
                    onChangeJSON={(json) => {
                        onRawJSONUpdate(json)
                    }}
                    onChangeText={(text) => {
                        onRawJSONUpdate(JSON.parse(text))
                    }}
                    json={form.data}
                    handleEditModeView={changeJSONEditorMode}
                    mode={form.jsonEditorMode}
                    indentation={2}
                />
            </Col>
        </Row></React.Fragment>}
        <Row>
            <Col>
                <hr className="hr-text" data-content={t('form.create.actions')}/>
            </Col>
        </Row>
        <PreviewFormModal form={form.data}
                          title={form.title}
                          open={form.displayPreview}
                          onClosePreview={closePreview}/>
        {actions}
    </Container>

};


export default FormBuilderComponent;
