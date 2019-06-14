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
const expect = chai.expect;
describe('Class: MessageQueueService', () => {
    let messageQueueService;
    let stringifyObjectsStub;
    let postToQueueStub;
    describe('function: sendObjects()', () => {
        describe('Given a list of Objects, When sendObjects is called, then it', () => {
            let sendObjectsResult;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                messageQueueService = new PubSubService_1.PubSubService();
                stringifyObjectsStub = sinon_1.stub(messageQueueService, 'stringifyObjects');
                stringifyObjectsStub.returns(['']);
                postToQueueStub = sinon_1.stub(messageQueueService, 'postToQueue');
                postToQueueStub.resolves(true);
                sendObjectsResult = yield messageQueueService.sendObjects('someTopicName', [{}]);
            }));
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
        describe('Given an empty list of Objects, when sendObjects is called, then it', () => {
            let sendObjectsResult;
            mocha_1.before(() => __awaiter(this, void 0, void 0, function* () {
                messageQueueService = new PubSubService_1.PubSubService();
                stringifyObjectsStub = sinon_1.stub(messageQueueService, 'stringifyObjects');
                postToQueueStub = sinon_1.stub(messageQueueService, 'postToQueue');
                sendObjectsResult = yield messageQueueService.sendObjects('', []);
            }));
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
    describe('function: stringifyObjects()', () => {
        let stringifyObjectsResult;
        describe('Given an null array of objects, when the array of objects is converted to an array of strings', () => {
            mocha_1.before(() => {
                stringifyObjectsResult = messageQueueService.stringifyObjects(null);
            });
            it('then it should return null', () => {
                expect(stringifyObjectsResult).to.be.null;
            });
        });
        describe('Given an empty array of objects, when the array of objects is converted to an array of strings', () => {
            mocha_1.before(() => {
                stringifyObjectsResult = messageQueueService.stringifyObjects([]);
            });
            it('then it should return null', () => {
                expect(stringifyObjectsResult).to.be.null;
            });
        });
        describe('Given an array of objects, when the array of objects is converted to an array of strings', () => {
            mocha_1.before(() => {
                stringifyObjectsResult = messageQueueService.stringifyObjects([{ value: 'value1' }, { value: 'value2' }]);
            });
            it('then it should return an array of strings of the JSON stringified objects', () => {
                expect(stringifyObjectsResult).to.deep.eq(['{"value":"value1"}', '{"value":"value2"}']);
            });
        });
    });
});