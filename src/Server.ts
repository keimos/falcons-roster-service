const vcapApplication: any = process.env.VCAP_APPLICATION;
if (vcapApplication) {
  require('newrelic');
}
import { App } from './App';
import { KafkaFactory } from './common/KafkaFactory';
import { KafkaService } from './common/KafkaService';

import log from './logging/Log';
// import { PubSubService } from './common/PubSubService';
// import { MessageQueueService } from './common/MessageQueueService';
import { ComOrderEventsService } from './service/ComOrderEventsService';
import { MongoRepo } from './repo/MongoRepo';
import { COMOrderDetailController } from './controller/ComOrderDetailController';
import { ComOrderDetailService } from './service/ComOrderDetailService';
import { OvqDelegate } from './delegate/OvqDelegate';
import { ComOrderEventTranslator } from './translator/ComOrderEventTranslator';

// if (process.env.VCAP_APPLICATION) {
//   const nodeName: any = process.env.VCAP_APPLICATION;
//   require('appdynamics').profile({
//     accountAccessKey: process.env.APPDYNAMICS_AGENT_ACCOUNT_ACCESS_KEY,
//     accountName: 'customer1',
//     applicationName: 'Delivery-Visibility',
//     controllerHostName: process.env.APPDYNAMICS_CONTROLLER_HOST_NAME,
//     controllerPort: process.env.APPDYNAMICS_CONTROLLER_PORT,
//     controllerSslEnabled: true,
//     nodeName: nodeName.space_name + process.env.CF_INSTANCE_INDEX,
//     tierName: 'CarrierTrackingService',
//   });
// }

// Register singletons
const kafkaFactory: KafkaFactory = new KafkaFactory();
const kafka: KafkaService = new KafkaService(kafkaFactory, process.env.KafkaCluster);
const comOrderEventsService: ComOrderEventsService = new ComOrderEventsService(kafka);
const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(new MongoRepo(), new OvqDelegate(), new ComOrderEventTranslator())
const comOrderDetailController: COMOrderDetailController = new COMOrderDetailController(comOrderDetailService);

const topicName: string = process.env.KafkaTopic;
if (topicName) {
  comOrderEventsService.loadEvents(topicName);
} else {
  throw 'Topic not defined, expected env variable "KafkaTopic"';
}

// Create/launch the application
const app: App = new App(comOrderDetailController);

// Launch the application
const port: number = getPort();
app.express.listen(port, (err: string) => {

  // Crash
  if (err) {
    log.error(`Unable to start application: ${err}`);
    process.exit(1);
  }

  // Good!
  log.info(`Application successfully started on port [${port}]`);
});

/**
 * Returns the port that the application should run on, reading the PORT environment variable, defaulting to 3000 if not found.
 */
function getPort(): number {
  const environmentPort = process.env.PORT || '3000';
  return parseInt(environmentPort, 10);
}
