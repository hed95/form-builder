import {lazy, map, mount, redirect, route} from 'navi'
import Home from "../pages/home/component/Home";
import React, {Suspense, useState} from "react";
import {Main} from "./Main";
import {Router, View} from "react-navi";
import {useKeycloak} from 'react-keycloak';
import secureLS from '../core/storage';
import {useTranslation} from "react-i18next";
import config from "react-global-configuration"
import _ from 'lodash';
import {Logout} from "../common/Logout";
import Unauthorized from "../common/Unauthorized";
import Overlay from "../common/Overlay";

const hasAuthorization = (authorizationRoles, context, matcher) => {
    const roles = context.keycloak.tokenParsed.realm_access.roles;
    const isAuthorizedAccess = _.intersectionWith(authorizationRoles, roles).length >= 1;
    return isAuthorizedAccess
        ? matcher
        : redirect(
            '/unauthorized')
};

export const withAccessAuthorization = (matcher) => {
    return map((request, context) => {
            return hasAuthorization(context.config.get('keycloak.access-roles'), context, matcher);
        }
    );
};


export const withPromotionAuthorization = (matcher) => {
    return map((request, context) => {
            return hasAuthorization(context.config.get('keycloak.promotion-roles'), context, matcher);
        }
    );
};


export const withEditAuthorization = (matcher) => {
    return map((request, context) => {
            return hasAuthorization(context.config.get('keycloak.edit-roles'), context, matcher);
        }
    );
};

export const withEnvContext = (matcher) => {
    return withAccessAuthorization(map((request, context) => {
            if (context.environment) {
                return matcher;
            }

            if (request.params.env) {
                context.setEnvFromUrl(request);
                return matcher
            }
            return redirect(
                '/');

        }
    ));
};

const routes = mount({
    '/': withAccessAuthorization(route({
        title: 'Home',
        view: <Home/>
    })),
    "/unauthorized": route({
        title: 'Logout',
        view: <Unauthorized/>
    }),
    '/logout': route({
        title: 'Logout',
        view: <Logout/>
    }),
    '/migrations': lazy(() => import('../pages/forms/migration/migrationRoutes')),
    '/forms': lazy(() => import('../pages/forms/formsRoute'))
});
export const ApplicationContext = React.createContext([{}, () => {
}]);

export const AppRouter = () => {
    const [keycloak, initialised] = useKeycloak();
    const {t} = useTranslation();
    const environments = config.get('environments');

    const environmentLocalStorage = secureLS.get('ENVIRONMENT');
    const [state, setState] = useState({
        environment: environmentLocalStorage ? _.find(environments, {id: environmentLocalStorage}) : null,
        activeMenuItem: environmentLocalStorage ? t('menu.forms.name') : (window.location.pathname ? window.location.pathname : t('menu.home.name'))
    });

    return <Overlay active={!initialised} styleName="mt-5" children={

        (<ApplicationContext.Provider value={{state, setState}}>
                <Router routes={routes} context={{
                    isAuthenticated: keycloak.authenticated,
                    environment: state.environment,
                    keycloak: keycloak,
                    config: config,
                    setEnvFromUrl: (request) => {
                        const env = _.find(environments, {id: request.params.env});
                        if (env) {
                            setState(state => ({
                                environment: env,
                                activeMenuItem:  env? t('menu.forms.name') : (window.location.pathname ? window.location.pathname : t('menu.home.name'))
                            }));
                            secureLS.set('ENVIRONMENT', env.id);
                        }
                    }
                }}>
                    <Main>
                        <Suspense fallback={null}>
                            <View/>
                        </Suspense>
                    </Main>
                </Router>
            </ApplicationContext.Provider>
        )
    } loadingText={t('loading')}>
    </Overlay>
};



