const vcapApplication: any = process.env.VCAP_APPLICATION;

export class NewRelicMetricLogger {
    constructor() {
        if (vcapApplication) {
            this.newrelic = require('newrelic');
            this.cloud = true;
        }
    }
    public newrelic: any;
    public cloud: boolean = false;

    public logMetric(key: string, value: number) {
        if (this.cloud) {
            this.newrelic.recordMetric(`Custom/${key}`, value);
        }
    }

    public logEvent(event: string, map: any) {
        if (this.cloud) {
            this.newrelic.recordCustomEvent(`${event}`, map);
        }
    }
}