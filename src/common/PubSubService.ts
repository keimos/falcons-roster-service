import log from '../logging/Log';
import { MessageQueueService } from './MessageQueueService';

import * as PubSub from '@google-cloud/pubsub';

export class PubSubService extends MessageQueueService {


    public publishers: Map<string, PubSub.Publisher> = new Map<string, PubSub.Publisher>();

    public pubSub: PubSub.PubSub;

    /**
     * Create a PubSubService, wrapping the given Google PubSub.
     * @param pubSub 
     */
    constructor(pubSub?: PubSub.PubSub) {
        super();
        this.pubSub = (pubSub) ? pubSub : PubSub();
    }


    protected async postToQueue(topicName: string, stringifiedObjects: Array<string>): Promise<boolean> {

        // Publish to the given topic
        const publisher: PubSub.Publisher = await this.getPublisher(topicName);

        // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
        const pubSubResultPromises: Array<Promise<boolean>> = new Array();
        for (const stringifiedObject of stringifiedObjects) {
            pubSubResultPromises.push(this.postToPubSub(publisher, stringifiedObject));
        }

        // Post all of the messages
        return new Promise<boolean>((resolve, reject) => {
            Promise.all(pubSubResultPromises).then(() => {
                log.info(`done posting to ${topicName}`);
                resolve(true);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * Return the PubSub Publisher for the given topic. If it doesn't exist, then one is created.
     * @param topicName 
     */
    protected async getPublisher(topicName: string): Promise<PubSub.Publisher> {

        // Does the publisher exist? If not, create it.
        let publisher: PubSub.Publisher;
        if (!this.publishers.has(topicName) || !this.publishers.get(topicName)) {

            // Verify that the topic exists
            const topicExists: any = await this.pubSub.topic(topicName).exists();
            if (!topicExists[0]) {
                throw Error(`Unable to connect to topic [${topicName}]. Topic does not exist.`);
            }

            // Create the Publisher
            log.info(`Creating Google PubSub publisher for topic [${topicName}]!`);
            publisher = this.pubSub.topic(topicName).publisher({
                batching: {
                    maxMessages: 999,
                    maxMilliseconds: 20
                }
            });
            this.publishers.set(topicName, publisher);
        }

        // Return the publisher
        return this.publishers.get(topicName);
    }


    protected postToPubSub(publisher: any, payload: string) {
        return new Promise<boolean>((resolve, reject) => {
            const dataBuffer = Buffer.from(payload);
            publisher.publish(dataBuffer)
                .then((messageId: any) => {
                    log.debug(`PUBSUB: Message ${messageId} published.`);
                    resolve(true);
                })
                .catch((err: Error) => {
                    log.error('ERROR:', err);
                    reject(err);
                });
        });
    }



}
