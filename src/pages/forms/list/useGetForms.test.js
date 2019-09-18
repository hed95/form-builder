import {act, renderHook} from "react-hooks-testing-library";
import useGetForms from "./useGetForms";
import {EXECUTING, SUCCESS} from "../../../core/api/actionTypes";

jest.useFakeTimers();
jest.mock("react-keycloak", () => ({
    useKeycloak: () => {
        return [];
    }
}));

jest.mock('react-toast-notifications', () => ({
    withToastManager: () => {
        return jest.fn();
    },
    useToasts: () => {
        return {
            addToast: () => {
                return jest.fn();
            }
        }
    }
}));


describe('useGetForms', () => {
    beforeEach(() => {
        window.URL.createObjectURL = jest.fn();
        window.URL.revokeObjectURL = jest.fn();

        const naviModule = require('react-navi');
        naviModule.useNavigation = jest.fn(() => {
            return {
                getCurrentValue: () => {
                    return {
                        url: {
                            href: '/forms'
                        }
                    }
                }
            }
        });

        const contextModule = require('../../../core/context/useEnvContext');
        contextModule.default = () => {
            return {
                envContext: {}
            }
        };
        require('react-keycloak');

    });
    it('gets forms and status EXECUTING', () => {

        const apiModule = require('../../../core/api/index');
        apiModule.default = () => {
            return [{
                status: EXECUTING
            }, jest.fn()]
        };

        const {result, unmount} = renderHook(() => useGetForms());
        unmount();
        expect(result.current.status).toBe(EXECUTING);
    });


    it('can handle pagination', async () => {
        const makeRequest = jest.fn();
        const apiModule = require('../../../core/api/index');
        apiModule.default = () => {
            return [{}, makeRequest]
        };
        const {result, unmount} = renderHook(() => useGetForms());

        unmount();

        expect(result.current.forms.activePage).toBe(0);

        act(() => result.current.handlePaginationChange(null, {activePage: 2}));

        expect(makeRequest).toBeCalled();
    });

    it('gets forms and status SUCCESS', () => {
        const naviModule = require('react-navi');
        naviModule.useNavigation = jest.fn(() => {
            return {
                getCurrentValue: () => {
                    return {
                        url: {
                            href: '/forms'
                        }
                    }
                }
            }
        });

        const apiModule = require('../../../core/api/index');
        apiModule.default = () => {
            return [{
                status: SUCCESS,
                response: {
                    data: {
                        total: 1,
                        forms: [{
                            id: 'formid',
                            name: 'formName',
                            title: 'formTitle',
                            path: 'formPath'
                        }]
                    }
                }
            }, jest.fn()]
        };


        const {result, unmount} = renderHook(() => useGetForms());
        unmount();
        expect(result.current.status).toBe(SUCCESS);
        expect(result.current.forms.data.length).toBe(1);
        expect(result.current.forms.total).toBe(1);

    });

    it('can handle title search', () => {
        const naviModule = require('react-navi');
        naviModule.useNavigation = jest.fn(() => {
            return {
                getCurrentValue: () => {
                    return {
                        url: {
                            href: '/forms'
                        }
                    }
                }
            }
        });

        const makeRequest = jest.fn();
        const apiModule = require('../../../core/api/index');
        apiModule.default = () => {
            return [{}, makeRequest]
        };

        const {result, unmount} = renderHook(() => useGetForms());

        act(() => {
            result.current.handleTitleSearch(null, {value: 'text'});
            jest.runTimersToTime(1000);
        });
        unmount();
        expect(makeRequest).toBeCalled();
        expect(result.current.forms.searchTitle).toBe('text')

    });
});
