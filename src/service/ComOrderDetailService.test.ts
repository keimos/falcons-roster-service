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


const expect = chai.expect;
chai.use(chaiExclude);

describe('Class: ComOrderDetailService', () => {
    describe('Function: getOrderDetailByCustomerOrderNumber', () => {
        describe('Given a customerOrderNumber, when the function is invoked, then it', () => {
            let readDocumentsStub: SinonStub;
            let orderDetail: any;
            const expectedObj = [{customerOrderNumber: '123'}];
            before(async () => {
                const mongoRepo: MongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
                readDocumentsStub.resolves(expectedObj);
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo);

                orderDetail = await comOrderDetailService.getOrderDetailByCustomerOrderNumber('123');
            })
            it('should call mongoService', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should return object from mongo', () => [
                expect(orderDetail).to.be.eq(expectedObj)
            ])
        });
        // describe('Given a null customerOrderNumber, when the function is invoked, then it', () => {
        //     it('should not call mongoService');
        //     it('should return null');
        // });
    });
});