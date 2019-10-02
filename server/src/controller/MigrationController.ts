import {BaseHttpController, controller, httpPost, next, request, response} from "inversify-express-utils";
import TYPE from "../container/TYPE";
import * as express from 'express';
import axios from 'axios';
import logger from "../util/logger";
import _ from 'lodash';
import {inject} from "inversify";
import {KeycloakService} from "../auth/KeycloakService";

@controller('')
export class MigrationController extends BaseHttpController {

    constructor(@inject(TYPE.KeycloakService) private readonly keycloakService: KeycloakService) {
        super();

    }

    @httpPost('/load-migration-forms', TYPE.ProtectMiddleware)
    public async loadMigrationForms(@request() req: express.Request,
                                    @response() res: express.Response,
                                    @next() next: express.NextFunction): Promise<void> {

        logger.info('Loading formio forms...');
        const formio = req.body.formio;
        const environment = req.body.env;
        try {
            const tokenResponse = await axios({
                headers: {
                    "Content-Type": "application/json"
                },
                method: 'POST',
                url: `${formio.url}/user/login`,
                data: {
                    data: {
                        email: formio.username,
                        password: formio.password
                    }
                }
            });
            logger.debug('New formio token received');

            const responseFromFormio = await axios({
                headers: {
                    "Content-Type": "application/json",
                    'x-jwt-token': tokenResponse.headers['x-jwt-token']
                },
                url: `${formio.url}/form?&limit=${formio.limit}&skip=${((formio.activePage) * formio.limit)}${formio.searchTitle !== '' ? `&title__regex=/${formio.searchTitle}/i` : ''}`,
                method: 'GET',
            });

            if (responseFromFormio.data) {
                logger.debug('Loaded forms from formio server', {
                    size: responseFromFormio.data.length
                });
                const names = responseFromFormio.data.map((form) => {
                    return form.name;
                });
                const token = await this.keycloakService.token(environment.id);

                const existing = await axios({
                    url: `${environment.url}/form?select=name&filter=name__in__${names.join('|')}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (existing.data.total !== 0) {
                    responseFromFormio.data.map((form) => {
                        const found = _.find(existing.data.forms, (f) => {
                            return f.name === form.name;
                        });
                        if (found) {
                            form['exists'] = true;
                        }
                        return form;
                    })
                }

                res.json(responseFromFormio);
            } else {
                res.json([]);
            }
        } catch(e) {
            logger.error('Failed to load forms due to '.concat(e.message));
            throw e;
        }

    }

    @httpPost('/migrate', TYPE.ProtectMiddleware)
    public async migrate(@request() req: express.Request,
                         @response() res: express.Response,): Promise<void> {

        const formio = req.body.formio;
        const environment = req.body.env;
        const formIdsToMigrate = req.body.formsIdsForMigration;

        const tokenResponse = await axios({
            headers: {
                "Content-Type": "application/json"
            },
            method: 'POST',
            url: `${formio.url}/user/login`,
            data: {
                data: {
                    email: formio.username,
                    password: formio.password
                }
            }
        });

        const formsSuccessfullyMigrated = [];
        const formsFailedToMigrate = [];
        const santize = (form) => {
            return _.omit(form, ['submissionAccess',
                'access', 'machineName', '_id', 'tags', 'created', 'modified']);
        };
        const token = await this.keycloakService.token(environment.id);
        for await (const formId of formIdsToMigrate) {
            const form = await axios({
                method: 'GET',
                url: `${formio.url}/form/${formId}`,
                headers: {
                    "Content-Type": "application/json",
                    'x-jwt-token': tokenResponse.headers['x-jwt-token']
                },
            });
            try {
                const response = await axios({
                    url: `${environment.url}/form`,
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    data: santize(form.data)
                });

                if (response.status === 201) {
                    formsSuccessfullyMigrated.push({formId: formId, name: form.data.name});
                } else {
                    logger.error(`Failed to migrate ${formId} due to ${response.data}`);
                    formsFailedToMigrate.push({formId: formId, name: form.data.name});
                }
            } catch (e) {
                logger.error(`Failed to migrate ${formId} due to ${e.message}`);
                formsFailedToMigrate.push({formId: formId, name: form.data.name});
            }
        }

        res.json({
            formsSuccessfullyMigrated: formsSuccessfullyMigrated,
            formsFailedToMigrate: formsFailedToMigrate
        });

    }
}