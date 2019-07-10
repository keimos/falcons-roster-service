import * as chai from 'chai';
import chaiExclude from 'chai-exclude';
// import chaiHttp = require('chai-http');
// import httpstatus = require('http-status');
import * as randomstring from 'randomstring';

import { fail, AssertionError } from 'assert';
import { before } from 'mocha';
import { match, SinonSpy, spy, SinonStub, stub } from 'sinon';
import { ComOrderDetailService } from './ComOrderDetailService';
import { MongoRepo } from '../repo/MongoRepo';
import { read } from 'fs';


const expect = chai.expect;
chai.use(chaiExclude);

describe('Class: ComOrderDetailService', () => {
    describe('Function: getOrderDetailByCustomerOrderNumberAndTrackingNumber', () => {
        describe('Given a customerOrderNumber and Tracking Number, when the function is invoked, then it', () => {
            let readDocumentsStub: SinonStub;
            let orderDetail: any;
            const expectedDbObj = [{customerOrderNumber: '123', trackingNumber: '9Z34HER'}];
            before(async () => {
                const mongoRepo: MongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
                readDocumentsStub.resolves(expectedDbObj);
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo);

                orderDetail = await comOrderDetailService.getOrderDetailByCustomerOrderNumberAndTrackingNumber('123', '9Z34HER');
            });
            after(() => {
                readDocumentsStub.restore();
            });
            it('should call mongoService', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with both customerOrderNumber and trackingNumber', () => {
                expect(readDocumentsStub.getCall(0).args[0]).to.be.deep.eq({"customerOrderNumber": '123', "lineItems.trackingNumber": '9Z34HER'});
            });
            it('should return object from mongo', () => {
                expect(orderDetail).to.be.eq(expectedDbObj)
            });
        });
        describe('Given only a customerOrderNumber, when the function is invoked, then it', () => {
            let readDocumentsStub: SinonStub;
            let orderDetail: any;
            const expectedDbObj = [{customerOrderNumber: '123', trackingNumber: '9Z34HER'}];
            before(async () => {
                const mongoRepo: MongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
                readDocumentsStub.resolves(expectedDbObj);
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo);

                orderDetail = await comOrderDetailService.getOrderDetailByCustomerOrderNumberAndTrackingNumber('123', null);
            });
            after(() => {
                readDocumentsStub.restore();
            });
            it('should call mongoService', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with only customerOrderNumber', () => {
                expect(readDocumentsStub.getCall(0).args[0]).to.be.deep.eq({"customerOrderNumber": '123'});
            });
            it('should return object from mongo', () => [
                expect(orderDetail).to.be.eq(expectedDbObj)
            ])
        });
        describe('Given only a trackingOrderNumber, when the function is invoked, then it', () => {
            let readDocumentsStub: SinonStub;
            let orderDetail: any;
            const expectedDbObj = [{customerOrderNumber: '123', trackingNumber: '9Z34HER'}];
            before(async () => {
                const mongoRepo: MongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
                readDocumentsStub.resolves(expectedDbObj);
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo);

                orderDetail = await comOrderDetailService.getOrderDetailByCustomerOrderNumberAndTrackingNumber(null, '9Z34HER');
            });
            after(() => {
                readDocumentsStub.restore();
            });
            it('should call mongoService', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with only trackingNumber', () => {
                expect(readDocumentsStub.getCall(0).args[0]).to.be.deep.eq({"lineItems.trackingNumber": '9Z34HER'});
            });
            it('should return object from mongo', () => [
                expect(orderDetail).to.be.eq(expectedDbObj)
            ])
        });
    });
});