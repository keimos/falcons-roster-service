
import { KafkaClient, Producer, Consumer, Offset } from 'kafka-node';

import log from '../logging/Log';

/** !!!!THIS CLASS DOES NOT HAVE UNIT TESTS!!!!
 *
 * We have had dificulty testing this class because of the fact that the kafka client cannot be injected.
 * We have also not figured out how to invoke the event that would trigger the correct call back to fire
 *
 * Do not make motificiations to this class with out fully running manual tests
 */

export class KafkaFactory {

    /**
     * Create a new KafkaClient to connect to the given host.
     *
     * @param host
     */
    public createClient(host: string): Promise<KafkaClient> {

        return new Promise<KafkaClient>((resolve, reject) => {

            const kafkaClient: KafkaClient = this.createKafkaClient(host, 500, 2);

            kafkaClient.on('ready', () => {
                log.info(`Kafka client connection to [${host}] ready...`);
                resolve(kafkaClient);
            });

            kafkaClient.on('error', (err: Error) => {
                log.error(`Unable to connect to Kafka at [${host}]: ${err.message}`);
                reject(Error(`Unable to connect to event queue : ${err.message}`));
            });

        });
    }

    /**
     * Create a Kafka client with the given options.
     *
     * @param host
     * @param connectTimeout
     * @param retries
     */
    public createKafkaClient(host: string, connectTimeout: number, retries: number): KafkaClient {
        return new KafkaClient({ kafkaHost: host, connectTimeout, connectRetryOptions: { retries } });
    }

    /**
     * Create a Kafka Producer attached to the given KafkaClient.
     *
     * @param kafkaClient
     */
    public createProducer(kafkaClient: KafkaClient): Producer {
        return new Producer(kafkaClient);
    }

    /**
     * Create a Kafka Consumer attached to the given KafkaClient.
     *
     * @param kafkaClient
     */
    public async createConsumer(kafkaClient: KafkaClient, topicName: string): Promise<Consumer> {
        const offset = await this.getOffset(kafkaClient, topicName);
        var consumer = new Consumer(
            kafkaClient,
            [
                { topic: topicName, offset: offset}
            ],
            {
                fromOffset: true
            }
        );
        return consumer;
    }

    public getOffset(kafkaClient: KafkaClient, topicName: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const offset = new Offset(kafkaClient);
            offset.fetchEarliestOffsets([topicName], function (error, offsets) {
                console.log(offsets[topicName][0]);
                resolve(offsets[topicName][0])
            });
        });
    }
}
