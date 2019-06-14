'use strict';
const vcapApplication = JSON.parse(process.env.VCAP_APPLICATION);
let appName;
let key;
if (vcapApplication) {
    if (vcapApplication.space_name === 'PR') {
        appName = 'COMOrderDetailService';
        key = process.env.NewRelicKey;
    }
    else {
        appName = vcapApplication.application_name;
        key = process.env.NewRelicKey;
    }
}
exports.config = {
    app_name: [appName],
    license_key: key,
    distributed_tracing: {
        enabled: true
    },
    proxy: process.env.NewRelicProxy,
    logging: {
        level: 'info'
    },
    allow_all_headers: true,
    attributes: {
        exclude: [
            'request.headers.cookie',
            'request.headers.authorization',
            'request.headers.proxyAuthorization',
            'request.headers.setCookie*',
            'request.headers.x*',
            'response.headers.cookie',
            'response.headers.authorization',
            'response.headers.proxyAuthorization',
            'response.headers.setCookie*',
            'response.headers.x*'
        ]
    }
};