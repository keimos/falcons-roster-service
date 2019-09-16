import * as chai from 'chai';
import { before } from 'mocha';
import * as randomstring from 'randomstring';
import { SinonStub, stub } from 'sinon';
import { KafkaFactory } from './KafkaFactory';
import { KafkaService } from './KafkaService';

const expect = chai.expect;

describe('Class: KafkaService', () => {

    // Prepare
    let kafkaService: KafkaService;
    let kafkaFactory: KafkaFactory;
    let postToKafkaStub: SinonStub;
    let stringifyObjectsStub: SinonStub;

    let createClientStub: SinonStub;
    let createProducerStub: SinonStub;

    //

    describe('function: postToQueue', () => {
        let kafaService: KafkaService;
        let postToKafkaStub: SinonStub;

        let response: any;
        describe('Given that the KafaService is instantiated with a null host and topic, When postToQueue() is called, then it', () => {
            before(() => {
                kafkaService = new KafkaService(null);
                postToKafkaStub = stub(kafkaService, 'postToKafka');

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
            before(async () => {
                kafkaService = new KafkaService(null, 'someHost');
                postToKafkaStub = stub(kafkaService, 'postToKafka');
                postToKafkaStub.resolves(true);

                response = await kafkaService.postToQueue('someTopic', ['']);
            });
            it('should call postToKafka()', () => {
                expect(postToKafkaStub.called).to.be.true;
            });
            it('should return the response given by postToKafak()', () => {
                expect(response).to.be.true;
            });
        })
    });
    describe('function: postToKafka', () => {

        //
        describe('Given an array of strings, when postToKafka() is called successfully, then it', () => {

            // Prepare / Call
            let kafkaResponse: boolean;
            let sendStub: SinonStub;
            const host: string = randomstring.generate(10);
            const topic: string = randomstring.generate(10);
            const messageJsons: Array<string> = [randomstring.generate(10), randomstring.generate(10)];
            before(async () => {

                // Prepare
                kafkaFactory = new KafkaFactory();
                kafkaService = new KafkaService(kafkaFactory, host);

                // Mocks
                const fakeProducer = { send: () => { /* nothing */ } }; // Faked "Producer"
                sendStub = stub(fakeProducer, 'send');
                sendStub.yields(null, 'myData');

                createClientStub = stub(kafkaFactory, 'createClient');
                createProducerStub = stub(kafkaFactory, 'createProducer');
                createProducerStub.returns(fakeProducer);

                // Call
                kafkaResponse = await kafkaService.postToKafka(topic, messageJsons);
            });

            // Clear Mocks
            after(() => {
                createClientStub.restore();
                createProducerStub.restore();
            });

            // Assert
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

        //
        describe('Given an array of strings, when postToKafka() is called and causes an error, then it', () => {

            // Prepare / Call
            let kafkaResponse: boolean;
            let sendStub: SinonStub;
            const host: string = randomstring.generate(10);
            const topic: string = randomstring.generate(10);
            const messageJsons: Array<string> = [randomstring.generate(10), randomstring.generate(10)];
            let exceptionThrown: Error;
            before(async () => {

                // Prepare
                kafkaFactory = new KafkaFactory();
                kafkaService = new KafkaService(kafkaFactory, host);
                exceptionThrown = null;

                // Mocks
                const fakeProducer = { send: () => { /* nothing */ } }; // Faked "Producer"
                sendStub = stub(fakeProducer, 'send');
                sendStub.yields(new Error('fakeError'), null);

                createClientStub = stub(kafkaFactory, 'createClient');
                createProducerStub = stub(kafkaFactory, 'createProducer');
                createProducerStub.returns(fakeProducer);

                // Call
                try {
                    kafkaResponse = await kafkaService.postToKafka(topic, messageJsons);
                } catch (err) {
                    kafkaResponse = false;
                    exceptionThrown = err;
                }
            });

            // Clear Mocks
            after(() => {
                createClientStub.restore();
                createProducerStub.restore();
            });

            // Assert
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
