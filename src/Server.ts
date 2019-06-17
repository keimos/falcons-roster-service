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
// import { MongoService } from './common/MongoService';
import { ComOrderEventsService } from './service/ComOrderEventsService';
import { MongoRepo } from './repo/MongoRepo';

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

comOrderEventsService.loadEvents();

// Create/launch the application
const app: App = new App();

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
