const vcapApplication: any = process.env.VCAP_APPLICATION;

export class NewRelicMetricLogger {
    private newrelic: any;
    private cloud: boolean = false;
    constructor() {
        if (vcapApplication) {
            this.newrelic = require('newrelic');
            this.cloud = true;
        }
    }

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