"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("../logging/Log");
const MessageQueueService_1 = require("./MessageQueueService");
const PubSub = require("@google-cloud/pubsub");
class PubSubService extends MessageQueueService_1.MessageQueueService {
    constructor(pubSub) {
        super();
        this.publishers = new Map();
        this.pubSub = (pubSub) ? pubSub : PubSub();
    }
    postToQueue(topicName, stringifiedObjects) {
        return __awaiter(this, void 0, void 0, function* () {
            const publisher = yield this.getPublisher(topicName);
            const pubSubResultPromises = new Array();
            for (const stringifiedObject of stringifiedObjects) {
                pubSubResultPromises.push(this.postToPubSub(publisher, stringifiedObject));
            }
            return new Promise((resolve, reject) => {
                Promise.all(pubSubResultPromises).then(() => {
                    Log_1.default.info(`done posting to ${topicName}`);
                    resolve(true);
                }).catch((err) => {
                    reject(err);
                });
            });
        });
    }
    getPublisher(topicName) {
        return __awaiter(this, void 0, void 0, function* () {
            let publisher;
            if (!this.publishers.has(topicName) || !this.publishers.get(topicName)) {
                const topicExists = yield this.pubSub.topic(topicName).exists();
                if (!topicExists[0]) {
                    throw Error(`Unable to connect to topic [${topicName}]. Topic does not exist.`);
                }
                Log_1.default.info(`Creating Google PubSub publisher for topic [${topicName}]!`);
                publisher = this.pubSub.topic(topicName).publisher({
                    batching: {
                        maxMessages: 999,
                        maxMilliseconds: 20
                    }
                });
                this.publishers.set(topicName, publisher);
            }
            return this.publishers.get(topicName);
        });
    }
    postToPubSub(publisher, payload) {
        return new Promise((resolve, reject) => {
            const dataBuffer = Buffer.from(payload);
            publisher.publish(dataBuffer)
                .then((messageId) => {
                Log_1.default.debug(`PUBSUB: Message ${messageId} published.`);
                resolve(true);
            })
                .catch((err) => {
                Log_1.default.error('ERROR:', err);
                reject(err);
            });
        });
    }
}
exports.PubSubService = PubSubService;