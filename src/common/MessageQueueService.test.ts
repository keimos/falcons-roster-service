import * as chai from 'chai';
import { before } from 'mocha';
import { SinonStub, stub } from 'sinon';
import { MessageQueueService } from './MessageQueueService';
import { PubSubService } from './PubSubService';

const expect = chai.expect;

describe('Class: MessageQueueService', () => {
    // Prepare
    let messageQueueService: MessageQueueService;

    let stringifyObjectsStub: SinonStub;

    let postToQueueStub: SinonStub;

    describe('function: sendObjects()', () => {

        //
        describe('Given a list of Objects, When sendObjects is called, then it', () => {

            // Prepare / Call
            let sendObjectsResult: boolean;
            before(async () => {

                // Prepare
                messageQueueService = new PubSubService();

                // Mock
                stringifyObjectsStub = stub(messageQueueService, 'stringifyObjects');
                stringifyObjectsStub.returns(['']);
                postToQueueStub = stub(messageQueueService, <any>'postToQueue');
                postToQueueStub.resolves(true);

                // Call
                sendObjectsResult = await messageQueueService.sendObjects('someTopicName', [{}]);
            });

            // Clean Mocks
            after(() => {
                stringifyObjectsStub.restore();
                postToQueueStub.restore();
            });

            it('should call stringifyObjects()', () => {
                expect(stringifyObjectsStub.called).to.be.true;
            });
            it('should call postToQueue()', () => {
                expect(postToQueueStub.called).to.be.true;
            });
        });

        //
        describe('Given an empty list of Objects, when sendObjects is called, then it', () => {

            // Prepare / Call
            let sendObjectsResult: boolean;
            before(async () => {

                // Prepare
                messageQueueService = new PubSubService();

                // Mock
                stringifyObjectsStub = stub(messageQueueService, 'stringifyObjects');
                postToQueueStub = stub(messageQueueService, <any>'postToQueue');
                // Call
                sendObjectsResult = await messageQueueService.sendObjects('', []);
            });

            // Clean Mocks
            after(() => {
                stringifyObjectsStub.restore();
                postToQueueStub.restore();
            });

            it('should not call stringifyObjects()', () => {
                expect(stringifyObjectsStub.called).to.be.false;
            });
            it('should not call postToQueue()', () => {
                expect(postToQueueStub.called).to.be.false;
            });
            it('should return undefined', () => {
                expect(sendObjectsResult).to.be.undefined;
            });
        });

    });
    //
    describe('function: stringifyObjects()', () => {

        // Prepare
        let stringifyObjectsResult: Array<string>;

        //
        describe('Given an null array of objects, when the array of objects is converted to an array of strings', () => {

            // Call
            before(() => {
                stringifyObjectsResult = messageQueueService.stringifyObjects(null);
            });

            // Assert
            it('then it should return null', () => {
                expect(stringifyObjectsResult).to.be.null;
            });
        });

        //
        describe('Given an empty array of objects, when the array of objects is converted to an array of strings', () => {

            // Call
            before(() => {
                stringifyObjectsResult = messageQueueService.stringifyObjects([]);
            });

            // Assert
            it('then it should return null', () => {
                expect(stringifyObjectsResult).to.be.null;
            });
        });

        //
        describe('Given an array of objects, when the array of objects is converted to an array of strings', () => {

            // Call
            before(() => {
                stringifyObjectsResult = messageQueueService.stringifyObjects([{ value: 'value1' }, { value: 'value2' }]);
            });

            // Assert
            it('then it should return an array of strings of the JSON stringified objects', () => {
                expect(stringifyObjectsResult).to.deep.eq(['{"value":"value1"}', '{"value":"value2"}']);
            });
        });
    });
});