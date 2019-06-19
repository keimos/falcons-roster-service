"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chai_exclude_1 = require("chai-exclude");
const mocha_1 = require("mocha");
const sinon_1 = require("sinon");
const ComOrderEventsService_1 = require("./ComOrderEventsService");
const KafkaService_1 = require("../common/KafkaService");
const ComOrderEventTranslator_1 = require("../translator/ComOrderEventTranslator");
const MongoRepo_1 = require("../repo/MongoRepo");
const fs_1 = require("fs");
const expect = chai.expect;
chai.use(chai_exclude_1.default);
describe('Class: ComOrderEventsService', () => {
    describe('Function: processEvent', () => {
        let comOrderEventsService;
        let translateStub;
        let insertDocumentsStub;
        mocha_1.before(() => {
            translateStub = sinon_1.stub(ComOrderEventTranslator_1.ComOrderEventTranslator, 'translate');
            insertDocumentsStub = sinon_1.stub(MongoRepo_1.MongoRepo.getInstance(), 'insertDocuments');
            comOrderEventsService = new ComOrderEventsService_1.ComOrderEventsService(new KafkaService_1.KafkaService(null, null));
            const mockComOrderDetails = new Array();
            mockComOrderDetails.push({});
            translateStub.returns(mockComOrderDetails);
            insertDocumentsStub.resolves(null);
            comOrderEventsService.processEvent({ value: "<xml></xml>" });
        });
        after(() => {
            translateStub.restore();
            insertDocumentsStub.restore();
        });
        describe('Given a kafka message with a valid event in xml, When the function is invoked, then it', () => {
            it('should convert the xml to json', () => {
                expect(typeof translateStub.getCall(0).args[0]).to.be.eq('object');
            });
            it('should call translate()', () => {
                expect(translateStub.calledOnce).to.be.true;
            });
            it('should insert details in mongo', () => {
                expect(insertDocumentsStub.calledOnce).to.be.true;
            });
        });
    });
    describe('E2E Function: processEvent', () => {
        let comOrderEventsService;
        let insertDocumentsStub;
        describe('Given a valid xml without tracking details', () => {
            mocha_1.before(() => {
                insertDocumentsStub = sinon_1.stub(MongoRepo_1.MongoRepo.getInstance(), 'insertDocuments');
                comOrderEventsService = new ComOrderEventsService_1.ComOrderEventsService(new KafkaService_1.KafkaService(null, null));
                insertDocumentsStub.resolves(null);
                const xml = fs_1.readFileSync('./test/comXMLs/noTracking.xml', 'utf8');
                comOrderEventsService.processEvent({ value: xml });
            });
            after(() => {
                insertDocumentsStub.restore();
            });
            it('should not call to insert details in mongo', () => {
                expect(insertDocumentsStub.calledOnce).to.be.false;
            });
        });
        describe('Given a valid xml with tracking details', () => {
            mocha_1.before(() => {
                insertDocumentsStub = sinon_1.stub(MongoRepo_1.MongoRepo.getInstance(), 'insertDocuments');
                comOrderEventsService = new ComOrderEventsService_1.ComOrderEventsService(new KafkaService_1.KafkaService(null, null));
                insertDocumentsStub.resolves(null);
                const xml = fs_1.readFileSync('./test/comXMLS/first.xml', 'utf8');
                comOrderEventsService.processEvent({ value: xml });
            });
            after(() => {
                insertDocumentsStub.restore();
            });
            it('should call to insert details in mongo', () => {
                expect(insertDocumentsStub.calledOnce).to.be.true;
            });
            it('document to insert into mongo should be valid?', () => {
                const comOrderDetailsList = insertDocumentsStub.getCall(0).args[1];
                const expectedJson = JSON.parse(fs_1.readFileSync('./test/comXMLS/first.json', 'utf8'));
                expect(comOrderDetailsList).excluding('lastUpdatedTS').to.be.deep.eq(expectedJson);
            });
        });
    });
});