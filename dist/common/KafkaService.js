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
class KafkaService {
    constructor(kafkaFactory, host) {
        this.kafkaFactory = kafkaFactory;
        this.host = host;
        this.localMode = false;
        this.postToKafka = (topicName, messageJsons) => __awaiter(this, void 0, void 0, function* () {
            const kafkaClient = yield this.kafkaFactory.createClient(this.host);
            const kafaProducer = this.kafkaFactory.createProducer(kafkaClient);
            return new Promise((resolve, reject) => {
                Log_1.default.info(`Sending [${messageJsons.length}] objects to Kafka...`);
                kafaProducer.send([{ topic: topicName, messages: messageJsons }], (err, data) => {
                    if (err) {
                        Log_1.default.error(`An error occurred while sending messages to Kafka : ${err.message}`);
                        reject(new Error(`An error occurred while sending messages to the event queue : ${err.message}`));
                    }
                    else {
                        Log_1.default.info(`Kafka response : ${data}`);
                        resolve(true);
                    }
                });
            });
        });
        Log_1.default.verbose(`Kafka host: ${host}`);
        if (!(host)) {
            Log_1.default.warn('Kafka host must be specified. Kafka will not be called. Running in "local" mode...');
            this.localMode = true;
        }
    }
    readFromQueue(topicName, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            const kafkaClient = yield this.kafkaFactory.createClient(this.host);
            const kafkaConsumer = yield this.kafkaFactory.createConsumer(kafkaClient, topicName);
            kafkaConsumer.on('message', function (message) {
                cb(message);
            });
        });
    }
    postToQueue(topicName, stringifiedObjects) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.localMode) {
                Log_1.default.warn('Running in local mode. Not Sending events to Kafka!');
                return null;
            }
            return yield this.postToKafka(topicName, stringifiedObjects);
        });
    }
}
exports.KafkaService = KafkaService;