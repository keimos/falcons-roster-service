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
const kafka_node_1 = require("kafka-node");
const Log_1 = require("../logging/Log");
class KafkaFactory {
    createClient(host) {
        return new Promise((resolve, reject) => {
            const kafkaClient = this.createKafkaClient(host, 500, 2);
            kafkaClient.on('ready', () => {
                Log_1.default.info(`Kafka client connection to [${host}] ready...`);
                resolve(kafkaClient);
            });
            kafkaClient.on('error', (err) => {
                Log_1.default.error(`Unable to connect to Kafka at [${host}]: ${err.message}`);
                reject(Error(`Unable to connect to event queue : ${err.message}`));
            });
        });
    }
    createKafkaClient(host, connectTimeout, retries) {
        return new kafka_node_1.KafkaClient({ kafkaHost: host, connectTimeout, connectRetryOptions: { retries } });
    }
    createProducer(kafkaClient) {
        return new kafka_node_1.Producer(kafkaClient);
    }
    createConsumer(kafkaClient, topicName) {
        return __awaiter(this, void 0, void 0, function* () {
            const offset = yield this.getOffset(kafkaClient, topicName);
            var consumer = new kafka_node_1.Consumer(kafkaClient, [
                { topic: topicName, offset: offset }
            ], {
                fromOffset: true
            });
            return consumer;
        });
    }
    getOffset(kafkaClient, topicName) {
        return new Promise((resolve, reject) => {
            const offset = new kafka_node_1.Offset(kafkaClient);
            offset.fetchEarliestOffsets([topicName], function (error, offsets) {
                console.log(offsets[topicName][0]);
                resolve(offsets[topicName][0]);
            });
        });
    }
}
exports.KafkaFactory = KafkaFactory;