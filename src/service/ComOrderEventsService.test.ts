import * as chai from 'chai';
import chaiExclude from 'chai-exclude';
// import chaiHttp = require('chai-http');
// import httpstatus = require('http-status');
import * as randomstring from 'randomstring';

import { fail, AssertionError } from 'assert';
import { before } from 'mocha';
import { match, SinonSpy, spy, SinonStub, stub } from 'sinon';
import { SystemError } from '../error/SystemError'
import { ComOrderEventsService } from './ComOrderEventsService';
import { KafkaService } from '../common/KafkaService';
import { ComOrderEventTranslator } from '../translator/ComOrderEventTranslator';
import { MongoRepo } from '../repo/MongoRepo';
import { ComOrderDetailsDTO } from '../dto/ComOrderDetailsDTO';
import { readFileSync } from 'fs';

const expect = chai.expect;
chai.use(chaiExclude);

describe('Class: ComOrderEventsService', () => {
    describe('Function: processEvent', () => {
        let comOrderEventsService: ComOrderEventsService;
        let translateStub: SinonStub;
        let insertDocumentsStub: SinonStub;
        before(() => {
            translateStub = stub(ComOrderEventTranslator, 'translate');
            insertDocumentsStub = stub(MongoRepo.getInstance(), 'insertDocuments');

            comOrderEventsService = new ComOrderEventsService(new KafkaService(null, null));

            const mockComOrderDetails = new Array();
            mockComOrderDetails.push({});
            translateStub.returns(mockComOrderDetails);
            insertDocumentsStub.resolves(null);

            comOrderEventsService.processEvent({value: "<xml></xml>"})
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
        let comOrderEventsService: ComOrderEventsService;
        let insertDocumentsStub: SinonStub;
        describe('Given a valid xml without tracking details', () => {
            before(() => {
                insertDocumentsStub = stub(MongoRepo.getInstance(), 'insertDocuments');
    
                comOrderEventsService = new ComOrderEventsService(new KafkaService(null, null));
    
                insertDocumentsStub.resolves(null);
    
                const xml = readFileSync('./test/comXMLs/noTracking.xml', 'utf8');
    
                comOrderEventsService.processEvent({value: xml})
            });
            after(() => {
                insertDocumentsStub.restore();
            });
            it('should not call to insert details in mongo', () => {
                expect(insertDocumentsStub.calledOnce).to.be.false;
            });
        });
        describe('Given a valid xml with tracking details', () => {
            before(() => {
                insertDocumentsStub = stub(MongoRepo.getInstance(), 'insertDocuments');
    
                comOrderEventsService = new ComOrderEventsService(new KafkaService(null, null));
    
                insertDocumentsStub.resolves(null);
    
                const xml = readFileSync('./test/comXMLS/first.xml', 'utf8');
    
                comOrderEventsService.processEvent({value: xml})
            });
            after(() => {
                insertDocumentsStub.restore();
            });
            it('should call to insert details in mongo', () => {
                expect(insertDocumentsStub.calledOnce).to.be.true;
            });
            it('document to insert into mongo should be valid?', () => {
                const comOrderDetailsList: Array<ComOrderDetailsDTO> = insertDocumentsStub.getCall(0).args[1];
                const expectedJson: Array<ComOrderDetailsDTO> = JSON.parse(readFileSync('./test/comXMLS/first.json', 'utf8'));
                expect(comOrderDetailsList).excluding('lastUpdatedTS').to.be.deep.eq(expectedJson);
            })
        });
    })
});