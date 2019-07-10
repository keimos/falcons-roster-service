import * as chai from 'chai';
import chaiHttp = require('chai-http');
import httpstatus = require('http-status');

import { before, describe } from 'mocha';
import { match, SinonStub, stub } from 'sinon';

import { readFileSync } from 'fs';
import { App } from '../App';
import { COMOrderDetailController } from './ComOrderDetailController';
import { ComOrderDetailService } from '../service/ComOrderDetailService';
import { MongoRepo } from '../repo/MongoRepo';
import { ErrorCode } from '../utils/error-codes-enum';
import { SystemError } from '../error/SystemError';

// Dependencies
let app: App;
let comOrderDetailController: COMOrderDetailController;
let comOrderDetailService : ComOrderDetailService;

//Stubs
let getOrderDetailByCustomerOrderNumberAndTrackingNumber: SinonStub;
let readDocumentsStub: SinonStub;

// Initialize chai
chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /api/v1/orders', ()=>{
    describe('Given a valid customer Order Number and Tracking Number is null', ()=>{
        let responseBody: any;
        let responseStatusCode: number;
        const expectedObj = [{customerOrderNumber: '123'}];
        before((done) =>{
            comOrderDetailService = new ComOrderDetailService(null); 

            //Stub
            getOrderDetailByCustomerOrderNumberAndTrackingNumber = stub(comOrderDetailService, 'getOrderDetailByCustomerOrderNumberAndTrackingNumber');
            getOrderDetailByCustomerOrderNumberAndTrackingNumber.resolves(expectedObj);
   
            comOrderDetailController = new COMOrderDetailController(comOrderDetailService);
            app = new App(comOrderDetailController);
            chai.request(app.express).get('/api/v1/orders?customerOrderNumber=W123').then((res) => {
                responseBody = res.body;
                responseStatusCode = res.status
                done();
            });
        })
        it('should return 200 response',() =>{
            expect(responseStatusCode).eq(httpstatus.OK);
        })
        it('should call ComOrderDetailsService to get the details from db',() =>{
            expect(getOrderDetailByCustomerOrderNumberAndTrackingNumber.calledOnce).to.be.true;
        })
        it('should return a body with order details',() =>{
            expect(responseBody).contains.name.match("customerOrderNumber");
        })
    })
    describe('Given a valid tracking Number and customerOrderNumber is null', ()=>{
        let responseBody: any;
        let responseStatusCode: number;
        const expectedObj = [{trackingNumber: '9Z34HER'}];
        before((done) =>{
            comOrderDetailService = new ComOrderDetailService(null); 

            //Stub
            getOrderDetailByCustomerOrderNumberAndTrackingNumber = stub(comOrderDetailService, 'getOrderDetailByCustomerOrderNumberAndTrackingNumber');
            getOrderDetailByCustomerOrderNumberAndTrackingNumber.resolves(expectedObj);
   
            comOrderDetailController = new COMOrderDetailController(comOrderDetailService);
            app = new App(comOrderDetailController);
            chai.request(app.express).get('/api/v1/orders?trackingNumber=9Z34HER').then((res) => {
                responseBody = res.body;
                responseStatusCode = res.status
                done();
            });
        })
        it('should return 200 response',() =>{
            expect(responseStatusCode).eq(httpstatus.OK);
        })
        it('should call ComOrderDetailsService to get the details from db',() =>{
            expect(getOrderDetailByCustomerOrderNumberAndTrackingNumber.calledOnce).to.be.true;
        })
        it('should return a body with order details',() =>{
            expect(responseBody).contains.name.match("trackingNumber");
        })
    })
    describe('Given a valid customerOrderNumber and tracking Number', ()=>{
        let responseBody: any;
        let responseStatusCode: number;
        const expectedObj = [{customerOrderNumber: '123', trackingNumber: '9Z34HER'}];
        before((done) =>{
            comOrderDetailService = new ComOrderDetailService(null); 

            //Stub
            getOrderDetailByCustomerOrderNumberAndTrackingNumber = stub(comOrderDetailService, 'getOrderDetailByCustomerOrderNumberAndTrackingNumber');
            getOrderDetailByCustomerOrderNumberAndTrackingNumber.resolves(expectedObj);
   
            comOrderDetailController = new COMOrderDetailController(comOrderDetailService);
            app = new App(comOrderDetailController);
            chai.request(app.express).get('/api/v1/orders?customerOrderNumber=123&trackingNumber=9Z34HER').then((res) => {
                responseBody = res.body;
                responseStatusCode = res.status
                done();
            });
        })
        it('should return 200 response',() =>{
            expect(responseStatusCode).eq(httpstatus.OK);
        })
        it('should call ComOrderDetailsService to get the details from db',() =>{
            expect(getOrderDetailByCustomerOrderNumberAndTrackingNumber.calledOnce).to.be.true;
        })
        it('should return a body with order details',() =>{
            expect(responseBody).contains.name.match("customerOrderNumber");
            expect(responseBody).contains.name.match("trackingNumber");
        })
    })
    describe('When customer Order Number and Tracking Order Number is null or empty',()=>{
        it('should return Invalid Request',() =>{
            expect(SystemError).to.throw.name.match("must provide at least 1 query param (customerOrderNumber or trackingNumber)");
        })
    })
}
)
