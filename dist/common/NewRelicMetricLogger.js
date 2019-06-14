"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vcapApplication = process.env.VCAP_APPLICATION;
class NewRelicMetricLogger {
    constructor() {
        this.cloud = false;
        if (vcapApplication) {
            this.newrelic = require('newrelic');
            this.cloud = true;
        }
    }
    logMetric(key, value) {
        if (this.cloud) {
            this.newrelic.recordMetric(`Custom/${key}`, value);
        }
    }
    logEvent(event, map) {
        if (this.cloud) {
            this.newrelic.recordCustomEvent(`${event}`, map);
        }
    }
}
exports.NewRelicMetricLogger = NewRelicMetricLogger;