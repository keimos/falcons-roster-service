"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vcapApplication = process.env.VCAP_APPLICATION;
if (vcapApplication) {
    require('newrelic');
}
const App_1 = require("./App");
const KafkaFactory_1 = require("./common/KafkaFactory");
const KafkaService_1 = require("./common/KafkaService");
const Log_1 = require("./logging/Log");
const ComOrderEventsService_1 = require("./service/ComOrderEventsService");
const kafkaFactory = new KafkaFactory_1.KafkaFactory();
const kafka = new KafkaService_1.KafkaService(kafkaFactory, process.env.KafkaCluster);
const comOrderEventsService = new ComOrderEventsService_1.ComOrderEventsService(kafka);
const topicName = process.env.KafkaTopic;
if (topicName) {
    comOrderEventsService.loadEvents(topicName);
}
else {
    throw 'Topic not defined, expected env variable "KafkaTopic"';
}
const app = new App_1.App();
const port = getPort();
app.express.listen(port, (err) => {
    if (err) {
        Log_1.default.error(`Unable to start application: ${err}`);
        process.exit(1);
    }
    Log_1.default.info(`Application successfully started on port [${port}]`);
});
function getPort() {
    const environmentPort = process.env.PORT || '3000';
    return parseInt(environmentPort, 10);
}