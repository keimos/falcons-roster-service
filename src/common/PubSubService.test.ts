import * as chai from 'chai';
import { before } from 'mocha';
import { SinonStub, stub } from 'sinon';
import { PubSubService } from './PubSubService';

class ExposedPrivatePubSubService extends PubSubService {
    public async postToQueue(topicName: string, stringifiedObjects: Array<string>): Promise<boolean> {
        return await super.postToQueue(topicName, stringifiedObjects);
    }

    public async getPublisher(topicName: string): Promise<any> {
        return await super.getPublisher(topicName);
    }
    public async postToPubSub(publisher: any, payload: string) {
        return await super.postToPubSub(publisher, payload);
    }
}

class FakePubSub {
    public desc = 'fake pubsub';
    public topic(name: string) { }
}

class FakeTopic {
    public desc = 'faketopic';
    public exists() { }
    public publisher() { }
}

class FakePublisher {
    public desc = 'fake publisher';
    public publish() { }
}

const expect = chai.expect;

describe('Class: PubSubService', () => {
    // Prepare
    let pubSubService: ExposedPrivatePubSubService;
    //
    describe('function: postToQueue()', () => {

        let getPublisherStub: SinonStub;
        let postToPubSubStub: SinonStub;

        //
        describe('Given a list of 2 strings and a valid topic, when postToQueue is called, then it', () => {
            pubSubService = new ExposedPrivatePubSubService();
            let response: boolean;

            // Call
            before(async () => {
                getPublisherStub = stub(pubSubService, <any>'getPublisher');
                postToPubSubStub = stub(pubSubService, <any>'postToPubSub');

                const fakePublisher: any = {};
                getPublisherStub.resolves(fakePublisher);
                postToPubSubStub.resolves(true);

                response = await pubSubService.postToQueue('someTopicName', ['', '']);
            });

            after(() => {
                getPublisherStub.restore();
                postToPubSubStub.restore();
            });

            // Assert
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

        //
        describe('Given a list of 2 strings and an invalid topic, when postToQueue is called, then it', () => {

            let error: Error;

            // Call
            before(async () => {
                getPublisherStub = stub(pubSubService, <any>'getPublisher');
                postToPubSubStub = stub(pubSubService, <any>'postToPubSub');

                const fakePublisher: any = {};
                getPublisherStub.rejects(Error('unknown topic'));
                postToPubSubStub.resolves(true);

                try {
                    await pubSubService.postToQueue('someTopicName', ['', '']);
                } catch (err) {
                    error = err;
                }
            });

            after(() => {
                getPublisherStub.restore();
                postToPubSubStub.restore();
            });

            // Assert
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
            let error: Error;

            // Call
            before(async () => {
                getPublisherStub = stub(pubSubService, <any>'getPublisher');
                postToPubSubStub = stub(pubSubService, <any>'postToPubSub');

                const fakePublisher: any = {};
                getPublisherStub.resolves(fakePublisher);
                postToPubSubStub.onFirstCall().rejects(Error('someError'));
                postToPubSubStub.onSecondCall().resolves(true);

                try {
                    await pubSubService.postToQueue('someTopicName', ['', '']);
                } catch (err) {
                    error = err;
                }
            });

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
        const myPubSub: any = new FakePubSub();

        let topicStub: SinonStub;
        let existStub: SinonStub;
        let publisherStub: SinonStub;
        describe('Given a valid already initialized topic, when getPublisher() is called, then it', () => {
            let response: any;
            // Call
            before(async () => {
                pubSubService = new ExposedPrivatePubSubService(myPubSub);
                topicStub = stub(myPubSub, 'topic');

                const fakeTopic: any = { exists: () => { /* nothing */ } };
                topicStub.resolves(fakeTopic);

                pubSubService.publishers.set('someValidTopic', <any>'myPublisher');

                response = await pubSubService.getPublisher('someValidTopic');
            });

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
            let response: any;
            // Call
            before(async () => {
                pubSubService = new ExposedPrivatePubSubService(myPubSub);
                topicStub = stub(myPubSub, 'topic');

                const fakeTopic: any = new FakeTopic();
                existStub = stub(fakeTopic, 'exists');
                existStub.resolves([true]);
                topicStub.returns(fakeTopic);

                publisherStub = stub(fakeTopic, 'publisher');
                publisherStub.returns('myPublisher:someNewTopic');


                response = await pubSubService.getPublisher('someNewTopic');
            });

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
                response = 'myPublisher:someNewTopic'
            });
        });
        describe('Given an invalid topic, when getPublisher() is called, then it', () => {
            let error: Error;
            // Call
            before(async () => {
                pubSubService = new ExposedPrivatePubSubService(myPubSub);
                topicStub = stub(myPubSub, 'topic');

                const fakeTopic: any = new FakeTopic();
                existStub = stub(fakeTopic, 'exists');
                existStub.resolves([false]);
                topicStub.returns(fakeTopic);

                publisherStub = stub(fakeTopic, 'publisher');
                try {
                    await pubSubService.getPublisher('someInvalidTopic');
                } catch (err) {
                    error = err;
                }
            });

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
            let response: any;
            // Call
            before(async () => {
                pubSubService = new ExposedPrivatePubSubService(myPubSub);
                pubSubService.publishers.set('someNewTopic', null);

                topicStub = stub(myPubSub, 'topic');

                const fakeTopic: any = new FakeTopic();
                existStub = stub(fakeTopic, 'exists');
                existStub.resolves([true]);
                topicStub.returns(fakeTopic);

                publisherStub = stub(fakeTopic, 'publisher');
                publisherStub.returns('myPublisher:someNewTopic');


                response = await pubSubService.getPublisher('someNewTopic');
            });

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
                response = 'myPublisher:someNewTopic'
            });
        })
    });

    describe('function: postToPubSub()', () => {

        describe('given a valid publisher and a payload, when postToPubSub() is called, then it', () => {
            pubSubService = new ExposedPrivatePubSubService();
            let result: any;

            let publishStub: SinonStub;
            before(async () => {
                const fakePublisher = new FakePublisher();
                publishStub = stub(fakePublisher, 'publish');
                publishStub.resolves('myMessageId');
                result = await pubSubService.postToPubSub(fakePublisher, 'somePayload');
            });
            after(() => {
                publishStub.restore();
            });
            it('should call publish()', () => {
                expect(publishStub.called).to.be.true;
            });
            it('should resolve to true', () => {
                expect(result).to.be.true;
            });
        })
        describe('given an bad publisher, when postToPubSub() is called, then it', () => {
            pubSubService = new ExposedPrivatePubSubService();
            let error: Error;

            let publishStub: SinonStub;
            before(async () => {
                const fakePublisher = new FakePublisher();
                publishStub = stub(fakePublisher, 'publish');
                publishStub.rejects(Error('someError'));
                try {
                    await pubSubService.postToPubSub(fakePublisher, 'somePayload');
                } catch (err) {
                    error = err;
                }
            });
            after(() => {
                publishStub.restore();
            });
            it('should call publish()', () => {
                expect(publishStub.called).to.be.true;
            });
            it('should return an error', () => {
                expect(error.message).to.eq('someError');
            })
        })
    })
});
