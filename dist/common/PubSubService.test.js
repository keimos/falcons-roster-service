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
const sinon_1 = require("sinon");
const PubSubService_1 = require("./PubSubService");
class ExposedPrivatePubSubService extends PubSubService_1.PubSubService {
    postToQueue(topicName, stringifiedObjects) {
        const _super = Object.create(null, {
            postToQueue: { get: () => super.postToQueue }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.postToQueue.call(this, topicName, stringifiedObjects);
        });
    }
    getPublisher(topicName) {
        const _super = Object.create(null, {
            getPublisher: { get: () => super.getPublisher }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.getPublisher.call(this, topicName);
        });
    }
    postToPubSub(publisher, payload) {
        const _super = Object.create(null, {
            postToPubSub: { get: () => super.postToPubSub }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.postToPubSub.call(this, publisher, payload);
        });
    }
}
class FakePubSub {
    constructor() {
        this.desc = 'fake pubsub';
    }
    topic(name) { }
}
class FakeTopic {
    constructor() {
        this.desc = 'faketopic';
    }
    exists() { }
    publisher() { }
}
class FakePublisher {
    constructor() {
        this.desc = 'fake publisher';
    }
    publish() { }
}
const expect = chai.expect;
describe('Class: PubSubService', () => {
    let pubSubService;
    describe('function: postToQueue()', () => {
        let getPublisherStub;
        let postToPubSubStub;
        describe('Given a list of 2 strings and a valid topic, when postToQueue is called, then it', () => {
            pubSubService = new ExposedPrivatePubSubService();
            let response;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                getPublisherStub = sinon_1.stub(pubSubService, 'getPublisher');
                postToPubSubStub = sinon_1.stub(pubSubService, 'postToPubSub');
                const fakePublisher = {};
                getPublisherStub.resolves(fakePublisher);
                postToPubSubStub.resolves(true);
                response = yield pubSubService.postToQueue('someTopicName', ['', '']);
            }));
            after(() => {
                getPublisherStub.restore();
                postToPubSubStub.restore();
            });
            it('should call getPublisher()', () => {
                expect(getPublisherStub.called).to.be.true;
            });
            it('should call postToPubSub() 2 times', () => {
                expect(postToPubSubStub.calledTwice).to.be.true;
            });
            it('should return true', () => {
                expect(response).to.be.true;
            });
        });
        describe('Given a list of 2 strings and an invalid topic, when postToQueue is called, then it', () => {
            let error;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                getPublisherStub = sinon_1.stub(pubSubService, 'getPublisher');
                postToPubSubStub = sinon_1.stub(pubSubService, 'postToPubSub');
                const fakePublisher = {};
                getPublisherStub.rejects(Error('unknown topic'));
                postToPubSubStub.resolves(true);
                try {
                    yield pubSubService.postToQueue('someTopicName', ['', '']);
                }
                catch (err) {
                    error = err;
                }
            }));
            after(() => {
                getPublisherStub.restore();
                postToPubSubStub.restore();
            });
            it('should call getPublisher()', () => {
                expect(getPublisherStub.called).to.be.true;
            });
            it('should not call postToPubSub()', () => {
                expect(postToPubSubStub.calledTwice).to.be.false;
            });
            it('should return an error', () => {
                expect(error.message).to.eq('unknown topic');
            });
        });
        describe('Given a list of 2 strings and an valid topic, when postToQueue is called and fails, then it', () => {
            pubSubService = new ExposedPrivatePubSubService();
            let error;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                getPublisherStub = sinon_1.stub(pubSubService, 'getPublisher');
                postToPubSubStub = sinon_1.stub(pubSubService, 'postToPubSub');
                const fakePublisher = {};
                getPublisherStub.resolves(fakePublisher);
                postToPubSubStub.onFirstCall().rejects(Error('someError'));
                postToPubSubStub.onSecondCall().resolves(true);
                try {
                    yield pubSubService.postToQueue('someTopicName', ['', '']);
                }
                catch (err) {
                    error = err;
                }
            }));
            after(() => {
                getPublisherStub.restore();
                postToPubSubStub.restore();
            });
            it('should call getPublisher()', () => {
                expect(getPublisherStub.called).to.be.true;
            });
            it('should call postToPubSub() 2 times', () => {
                expect(postToPubSubStub.calledTwice).to.be.true;
            });
            it('should return an error', () => {
                expect(error.message).to.eq('someError');
            });
        });
    });
    describe('function: getPublisher()', () => {
        const myPubSub = new FakePubSub();
        let topicStub;
        let existStub;
        let publisherStub;
        describe('Given a valid already initialized topic, when getPublisher() is called, then it', () => {
            let response;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                pubSubService = new ExposedPrivatePubSubService(myPubSub);
                topicStub = sinon_1.stub(myPubSub, 'topic');
                const fakeTopic = { exists: () => { } };
                topicStub.resolves(fakeTopic);
                pubSubService.publishers.set('someValidTopic', 'myPublisher');
                response = yield pubSubService.getPublisher('someValidTopic');
            }));
            after(() => {
                topicStub.restore();
            });
            it('should not verify that the topic exists in pubsub', () => {
                expect(topicStub.called).to.be.false;
            });
            it('should return the publisher', () => {
                expect(response).to.eq('myPublisher');
            });
        });
        describe('Given a new valid topic, when getPublisher() is called, then it', () => {
            let response;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                pubSubService = new ExposedPrivatePubSubService(myPubSub);
                topicStub = sinon_1.stub(myPubSub, 'topic');
                const fakeTopic = new FakeTopic();
                existStub = sinon_1.stub(fakeTopic, 'exists');
                existStub.resolves([true]);
                topicStub.returns(fakeTopic);
                publisherStub = sinon_1.stub(fakeTopic, 'publisher');
                publisherStub.returns('myPublisher:someNewTopic');
                response = yield pubSubService.getPublisher('someNewTopic');
            }));
            after(() => {
                topicStub.restore();
            });
            it('should verify that the topic exists in pubsub', () => {
                expect(existStub.called).to.be.true;
            });
            it('should initalize the publisher', () => {
                expect(publisherStub.calledWith({
                    batching: {
                        maxMessages: 999,
                        maxMilliseconds: 20
                    }
                })).to.be.true;
            });
            it('should add the publisher to the map', () => {
                pubSubService.publishers.has('someNewTopic');
            });
            it('should return the publisher', () => {
                response = 'myPublisher:someNewTopic';
            });
        });
        describe('Given an invalid topic, when getPublisher() is called, then it', () => {
            let error;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                pubSubService = new ExposedPrivatePubSubService(myPubSub);
                topicStub = sinon_1.stub(myPubSub, 'topic');
                const fakeTopic = new FakeTopic();
                existStub = sinon_1.stub(fakeTopic, 'exists');
                existStub.resolves([false]);
                topicStub.returns(fakeTopic);
                publisherStub = sinon_1.stub(fakeTopic, 'publisher');
                try {
                    yield pubSubService.getPublisher('someInvalidTopic');
                }
                catch (err) {
                    error = err;
                }
            }));
            after(() => {
                topicStub.restore();
            });
            it('should verify that the topic exists in pubsub', () => {
                expect(existStub.called).to.be.true;
            });
            it('should throw an error', () => {
                expect(error.message).to.eq('Unable to connect to topic [someInvalidTopic]. Topic does not exist.');
            });
        });
        describe('Given a valid topic but a null publisher in the map, when getPublisher() is called, then it', () => {
            let response;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                pubSubService = new ExposedPrivatePubSubService(myPubSub);
                pubSubService.publishers.set('someNewTopic', null);
                topicStub = sinon_1.stub(myPubSub, 'topic');
                const fakeTopic = new FakeTopic();
                existStub = sinon_1.stub(fakeTopic, 'exists');
                existStub.resolves([true]);
                topicStub.returns(fakeTopic);
                publisherStub = sinon_1.stub(fakeTopic, 'publisher');
                publisherStub.returns('myPublisher:someNewTopic');
                response = yield pubSubService.getPublisher('someNewTopic');
            }));
            after(() => {
                topicStub.restore();
            });
            it('should verify that the topic exists in pubsub', () => {
                expect(existStub.called).to.be.true;
            });
            it('should initalize the publisher', () => {
                expect(publisherStub.calledWith({
                    batching: {
                        maxMessages: 999,
                        maxMilliseconds: 20
                    }
                })).to.be.true;
            });
            it('should add the publisher to the map', () => {
                pubSubService.publishers.has('someNewTopic');
            });
            it('should return the publisher', () => {
                response = 'myPublisher:someNewTopic';
            });
        });
    });
    describe('function: postToPubSub()', () => {
        describe('given a valid publisher and a payload, when postToPubSub() is called, then it', () => {
            pubSubService = new ExposedPrivatePubSubService();
            let result;
            let publishStub;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                const fakePublisher = new FakePublisher();
                publishStub = sinon_1.stub(fakePublisher, 'publish');
                publishStub.resolves('myMessageId');
                result = yield pubSubService.postToPubSub(fakePublisher, 'somePayload');
            }));
            after(() => {
                publishStub.restore();
            });
            it('should call publish()', () => {
                expect(publishStub.called).to.be.true;
            });
            it('should resolve to true', () => {
                expect(result).to.be.true;
            });
        });
        describe('given an bad publisher, when postToPubSub() is called, then it', () => {
            pubSubService = new ExposedPrivatePubSubService();
            let error;
            let publishStub;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                const fakePublisher = new FakePublisher();
                publishStub = sinon_1.stub(fakePublisher, 'publish');
                publishStub.rejects(Error('someError'));
                try {
                    yield pubSubService.postToPubSub(fakePublisher, 'somePayload');
                }
                catch (err) {
                    error = err;
                }
            }));
            after(() => {
                publishStub.restore();
            });
            it('should call publish()', () => {
                expect(publishStub.called).to.be.true;
            });
            it('should return an error', () => {
                expect(error.message).to.eq('someError');
            });
        });
    });
});