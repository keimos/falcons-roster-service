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
const chai = require("chai");
const mocha_1 = require("mocha");
const randomstring = require("randomstring");
const sinon_1 = require("sinon");
const KafkaFactory_1 = require("./KafkaFactory");
const KafkaService_1 = require("./KafkaService");
const expect = chai.expect;
describe('Class: KafkaService', () => {
    let kafkaService;
    let kafkaFactory;
    let postToKafkaStub;
    let stringifyObjectsStub;
    let createClientStub;
    let createProducerStub;
    describe('function: postToQueue', () => {
        let kafaService;
        let postToKafkaStub;
        let response;
        describe('Given that the KafaService is instantiated with a null host and topic, When postToQueue() is called, then it', () => {
            mocha_1.before(() => {
                kafkaService = new KafkaService_1.KafkaService(null);
                postToKafkaStub = sinon_1.stub(kafkaService, 'postToKafka');
                response = kafkaService.postToQueue('someTopic', ['']);
            });
            it('should return null (be in local mode)', () => {
                response = null;
            });
            it('should not call postToKafka()', () => {
                expect(postToKafkaStub.called).to.be.false;
            });
        });
        describe('Given that the KafkaService is instantiated with a host and topic, When postToQueue() is called, then it', () => {
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                kafkaService = new KafkaService_1.KafkaService(null, 'someHost');
                postToKafkaStub = sinon_1.stub(kafkaService, 'postToKafka');
                postToKafkaStub.resolves(true);
                response = yield kafkaService.postToQueue('someTopic', ['']);
            }));
            it('should call postToKafka()', () => {
                expect(postToKafkaStub.called).to.be.true;
            });
            it('should return the response given by postToKafak()', () => {
                expect(response).to.be.true;
            });
        });
    });
    describe('function: postToKafka', () => {
        describe('Given an array of strings, when postToKafka() is called successfully, then it', () => {
            let kafkaResponse;
            let sendStub;
            const host = randomstring.generate(10);
            const topic = randomstring.generate(10);
            const messageJsons = [randomstring.generate(10), randomstring.generate(10)];
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                kafkaFactory = new KafkaFactory_1.KafkaFactory();
                kafkaService = new KafkaService_1.KafkaService(kafkaFactory, host);
                const fakeProducer = { send: () => { } };
                sendStub = sinon_1.stub(fakeProducer, 'send');
                sendStub.yields(null, 'myData');
                createClientStub = sinon_1.stub(kafkaFactory, 'createClient');
                createProducerStub = sinon_1.stub(kafkaFactory, 'createProducer');
                createProducerStub.returns(fakeProducer);
                kafkaResponse = yield kafkaService.postToKafka(topic, messageJsons);
            }));
            after(() => {
                createClientStub.restore();
                createProducerStub.restore();
            });
            it('should have called createClient()', () => {
                expect(createClientStub.calledWith(host)).to.be.true;
            });
            it('should send a new message object with the topic name and message', () => {
                const message = sendStub.getCall(0).args[0];
                expect(message).to.deep.eq([{ topic, messages: messageJsons }]);
            });
            it('should have called send of the Producer once', () => {
                expect(sendStub.called).to.be.true;
            });
            it('should return true', () => {
                expect(kafkaResponse).to.be.true;
            });
        });
        describe('Given an array of strings, when postToKafka() is called and causes an error, then it', () => {
            let kafkaResponse;
            let sendStub;
            const host = randomstring.generate(10);
            const topic = randomstring.generate(10);
            const messageJsons = [randomstring.generate(10), randomstring.generate(10)];
            let exceptionThrown;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                kafkaFactory = new KafkaFactory_1.KafkaFactory();
                kafkaService = new KafkaService_1.KafkaService(kafkaFactory, host);
                exceptionThrown = null;
                const fakeProducer = { send: () => { } };
                sendStub = sinon_1.stub(fakeProducer, 'send');
                sendStub.yields(new Error('fakeError'), null);
                createClientStub = sinon_1.stub(kafkaFactory, 'createClient');
                createProducerStub = sinon_1.stub(kafkaFactory, 'createProducer');
                createProducerStub.returns(fakeProducer);
                try {
                    kafkaResponse = yield kafkaService.postToKafka(topic, messageJsons);
                }
                catch (err) {
                    kafkaResponse = false;
                    exceptionThrown = err;
                }
            }));
            after(() => {
                createClientStub.restore();
                createProducerStub.restore();
            });
            it('should have called createClient()', () => {
                expect(createClientStub.calledWith(host)).to.be.true;
            });
            it('should send a new message object with the topic name and message', () => {
                const message = sendStub.getCall(0).args[0];
                expect(message).to.deep.eq([{ topic, messages: messageJsons }]);
            });
            it('should have called send of the Producer once', () => {
                expect(sendStub.called).to.be.true;
            });
            it('should return error', () => {
                expect(exceptionThrown).to.not.be.null;
            });
            it('should return error with message', () => {
                expect(exceptionThrown.message).to.be.eq('An error occurred while sending messages to the event queue : fakeError');
            });
        });
    });
});