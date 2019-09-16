import { KafkaClient, Producer, Consumer, Offset, ConsumerGroup } from 'kafka-node';
import { KafkaFactory } from './KafkaFactory';

import log from '../logging/Log';
const vcapApplication: any = process.env.VCAP_APPLICATION;

export class KafkaService {

    private localMode: boolean = false;

    /**
     * Create a new KafkaService that calls Kafka at the given host and writing to the given topic.
     *
     * @param host The Kafka host URL
     * @param topic The Kafka topic to which this service will post objects.
     */
    constructor(private kafkaFactory: KafkaFactory, private host?: string) {
        // super();

        // Log local mode
        log.verbose(`Kafka host: ${host}`);
        if (!(host)) {
            log.warn('Kafka host must be specified. Kafka will not be called. Running in "local" mode...');
            this.localMode = true;
        }
    }

    public async readFromQueue(topicName: string, cbClass: any) {
        const kc: ConsumerGroup = await this.kafkaFactory.createConsumerGroup(this.host, topicName);
            const myCbClass = cbClass;
            kc.on('message', function (message) {
                if (vcapApplication) {
                    const newrelic = require('newrelic');
                    newrelic.startBackgroundTransaction('processEvent', 'processEvent', async function() {
                        await myCbClass.processEvent(message, cbClass);
                        newrelic.endTransaction();
                    });
                } else {
                    myCbClass.processEvent(message, cbClass);
                }
            });
    }

    public async postToQueue(topicName: string, stringifiedObjects: Array<string>): Promise<boolean> {
        if (this.localMode) {
            log.warn('Running in local mode. Not Sending events to Kafka!');
            return null;
        }
        return await this.postToKafka(topicName, stringifiedObjects);
    }

    /**
     * Given an array of JSON messages (stringified objects), send the objects to Kafka.
     */
    public postToKafka = async (topicName: string, messageJsons: Array<string>): Promise<boolean> => {

        // Connect to Kafka
        const kafkaClient: KafkaClient = await this.kafkaFactory.createClient(this.host);
        const kafaProducer: Producer = this.kafkaFactory.createProducer(kafkaClient);

        // Send the messages
        return new Promise<boolean>((resolve, reject) => {
            log.info(`Sending [${messageJsons.length}] objects to Kafka...`);
            kafaProducer.send([{ topic: topicName, messages: messageJsons }], (err: Error, data: any) => {
                if (err) {
                    log.error(`An error occurred while sending messages to Kafka : ${err.message}`);
                    reject(new Error(`An error occurred while sending messages to the event queue : ${err.message}`));
                } else {
                    log.info(`Kafka response : ${data}`);
                    resolve(true);
                }
            });
        });

    }
}
