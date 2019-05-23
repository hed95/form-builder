import React from 'react';
import {lazy, map, mount, redirect, route} from 'navi'
import FormList from "./list/components/FormList";

export const withEnvContext = (matcher) => {
    return map((request, context) =>
        context.environment
            ? matcher
            : redirect(
            '/')
    );
};

export default mount({
    '/:env': withEnvContext(route({
        "title": "Forms",
        "view": <FormList/>
    })),
    '/:env/create': lazy(() => import('../forms/create/createFormRoutes')),
    '/:env/:formId/edit': lazy(() => import('../forms/edit/editFormRoutes')),
    '/:env/:formId/preview': lazy(() => import('../forms/preview/previewFormRoutes')),
    '/:env/:formId/promote': lazy(() => import('../forms/promote/formPromotionRoutes'))

});
