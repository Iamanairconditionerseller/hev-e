/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = (config, pluginsDef) => {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const { connect } = require('react-redux');
    const LocaleUtils = require('../MapStore2/web/client/utils/LocaleUtils');
    const axios = require('../MapStore2/web/client/libs/ajax');

    // Add X-CSRFToken to genode requests
    axios.interceptors.request.use(function(cfg) {
        cfg.xsrfCookieName = "csrftoken";
        cfg.xsrfHeaderName = "X-CSRFToken";
        return cfg;
    }, function(error) {
        return Promise.reject(error);
    });

    const startApp = () => {
        // const ConfigUtils = require('../MapStore2/web/client/utils/ConfigUtils');
        // const {loadMaps} = require('../MapStore2/web/client/actions/maps');

        // rxjs recompose config
        const {setObservableConfig} = require('recompose');
        const rxjsConfig = require('recompose/rxjsObservableConfig').default;
        setObservableConfig(rxjsConfig);

        // initialize font-awesome style
        require('font-awesome/css/font-awesome.min.css');

        // initialize openlayers style
        require('openlayers/css/ol.css');

        // initialize no ui slider style
        require("react-nouislider/example/nouislider.css");

        // const { loadVersion } = require('../MapStore2/web/client/actions/version');
        // const { versionSelector } = require('../MapStore2/web/client/selectors/version');
        const { loadAfterThemeSelector } = require('../MapStore2/web/client/selectors/config');
        const StandardApp = require('../MapStore2/web/client/components/app/StandardApp');

        const { pages, initialState, storeOpts, appEpics = {} } = config;

        const StandardRouter = connect((state) => ({
            locale: state.locale || {},
            pages,
            loadAfterTheme: loadAfterThemeSelector(state)
        }))(require('../MapStore2/web/client/components/app/StandardRouter'));

        const { setSupportedLocales } = require('../MapStore2/web/client/epics/localconfig');

        const appStore = require('../MapStore2/web/client/stores/StandardStore').bind(null, initialState, {
            maptype: require('../MapStore2/web/client/reducers/maptype'),
            maps: require('../MapStore2/web/client/reducers/maps'),
            catalog: require('../MapStore2/web/client/reducers/catalog'),
            version: {
                current: 'no-version'
            }
        }, { ...appEpics, setSupportedLocales });

        const {setControlProperty} = require('../MapStore2/web/client/actions/controls');
        const initialActions = [
            () => setControlProperty('dataExplorer', 'enabled', false)
        ];

        LocaleUtils.setSupportedLocales({
            "it": {
                code: "it-IT",
                description: "Italiano"
            },
            "en": {
                code: "en-US",
                description: "English"
            }
        });

        LocaleUtils.getUserLocale = () => LocaleUtils.getSupportedLocales()[window.MS2Language || 'en'] && LocaleUtils.getSupportedLocales()[window.MS2Language || 'en'].code || 'en-US';

        const appConfig = {
            storeOpts,
            appEpics,
            appStore,
            pluginsDef,
            initialActions,
            appComponent: StandardRouter,
            printingEnabled: true
        };

        ReactDOM.render(
            <StandardApp {...appConfig} />,
            document.getElementById('container')
        );
    };

    if (!global.Intl) {
        // Ensure Intl is loaded, then call the given callback
        LocaleUtils.ensureIntl(startApp);
    } else {
        startApp();
    }
};
