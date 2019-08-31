import useEnvContext from "../context/useEnvContext";
import VariableReplacer from "./VariableReplacer";
import {KeycloakTokenProvider} from "../KeycloakTokenProvider";
import FormioUtils from "formiojs/utils";
import {useKeycloak} from "react-keycloak";

const useFormDataReplacer = () => {
    const {envContext} = useEnvContext();
    const [keycloak] = useKeycloak();
    const variableReplacer = new VariableReplacer();
    const keycloakTokenProvider = new KeycloakTokenProvider();


    const performFormParse = async (form) => {
        const variableReplacements = envContext ? envContext['variable-replacements'] : null;
        if (!variableReplacements) {
            return form;
        }
        const updatedForm = variableReplacer.replace(form, variableReplacements);
        const components = updatedForm.components;
        const token = await keycloakTokenProvider.fetchKeycloakToken(envContext, keycloak);
        if (token) {
            FormioUtils.eachComponent(components, (component) => {
                if (component.data && component.dataSrc === 'url') {
                    component.data.headers.push({
                        "key": "Authorization",
                        "value": `Bearer ${token}`
                    });
                }
            });
        }

        return Promise.resolve(updatedForm);
    };

    return {
        performFormParse,
    }
};

export default useFormDataReplacer;
