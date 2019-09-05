import { App } from "../App";
import { COMOrderDetailController } from "./ComOrderDetailController";
import { ComOrderDetailService } from "../service/ComOrderDetailService";
import * as chai from 'chai';
import { before, describe } from 'mocha';
import chaiHttp = require('chai-http');
import httpstatus = require('http-status');
import { SinonStub, stub } from "sinon";
import { RestTemplate } from "../common/RestTemplate";
import { readFileSync } from "fs";
import { MongoRepo } from "../repo/MongoRepo";
import { OvqDelegate } from "../delegate/OvqDelegate";
import { ComOrderEventTranslator } from "../translator/ComOrderEventTranslator";
import { response } from "express";
import { SystemError } from "../error/SystemError";

// Dependencies
let app: App;
let comOrderDetailController: COMOrderDetailController;
let comOrderDetailService: ComOrderDetailService;
let mongoRepo: MongoRepo;
let ovqDelegate: OvqDelegate;
let comOrderEventTranslator: ComOrderEventTranslator;

// Initialize chai
chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /api/v1/orders', () => {
    let responseBody: any;
    let responseStatusCode: number;
    let restTemplateStub: SinonStub;
    let readDocumentsStub: SinonStub;

    describe('Given a valid customer Order Number and Tracking Number', () => {
        describe('when we do not have the order cached, we call OVQ', () => {
            const response = readFileSync('./test/Ovq/OVQResponse.json', 'utf8');
            const customerOrderNumber = '123'

            before((done) => {
                restTemplateStub = stub(RestTemplate, 'postToExternalSource');
                restTemplateStub.resolves(response);
                mongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments');
                readDocumentsStub.resolves(null);

                ovqDelegate = new OvqDelegate();
                comOrderEventTranslator = new ComOrderEventTranslator();
                comOrderDetailService = new ComOrderDetailService(mongoRepo, ovqDelegate, comOrderEventTranslator);
                comOrderDetailController = new COMOrderDetailController(comOrderDetailService);
                app = new App(comOrderDetailController);
                const uri = `/api/v1/orders?customerOrderNumber=${customerOrderNumber}&trackingNumber=9Z34HER`;
                chai.request(app.express).get(uri).then((res) => {
                    responseBody = res.body;
                    responseStatusCode = res.status
                    done();
                });
            })

            after(() => {
                restTemplateStub.restore();
                readDocumentsStub.restore();
            });

            it('should return 200 response', () => {
                expect(responseStatusCode).eq(httpstatus.OK);
            })
            it('should call OVQ', () => {
                expect(restTemplateStub.calledOnce).to.be.true;
                expect(restTemplateStub.getCall(0).args[1]).to.contain(customerOrderNumber)
            })
            it('should return a response body with order details', () => {
                expect(response).contains.name.match("TrackingNumber");
            })
        })
        describe('when we have the order cached, we get the order from cache', () => {
            let mongoResponse
            const customerOrderNumber = '123'

            before((done) => {
                restTemplateStub = stub(RestTemplate, 'postToExternalSource');
                mongoResponse = '{"lastUpdatedTS":"2019-09-04T19:48:49.677Z","customerOrderNumber":"W11919755","orderedDate":"2019-09-02T23:27:00-04:00","customerInfo":{"email":"test@homedepot.com","phoneNumber":"5555555546","mobileNumber":"5555555546","firstName":"Satheskumar","middleName":"","lastName":"Kulandaisamy"},"shipTo":{"addressLineOne":"1151 NW COPANS RD","city":"POMPANO BEACH","zip":"30189","state":"FL"},"lineItems":[{"skuDescription":"MONTICELLO D","omsID":"202988041","sku":"1000062324","quantity":"5.00","expectedDeliveryDate":"2019-09-03T10:50:34-04:00","comStatus":"Included In Shipment","levelOfServiceDesc":null,"po":"01633384","tracking":[{"scac":"UPSC","trackingNumber":"50000005000018","trackingType":"LastMile","levelOfService":"Basic"},{"scac":"UPSC","trackingNumber":null,"trackingType":"LineHaul","levelOfService":null}]}]}'
                mongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments');
                readDocumentsStub.resolves(JSON.parse(mongoResponse));
                
                ovqDelegate = new OvqDelegate();
                comOrderEventTranslator = new ComOrderEventTranslator();
                comOrderDetailService = new ComOrderDetailService(mongoRepo, ovqDelegate, comOrderEventTranslator);
                comOrderDetailController = new COMOrderDetailController(comOrderDetailService);
                app = new App(comOrderDetailController);
                const uri = `/api/v1/orders?customerOrderNumber=${customerOrderNumber}&trackingNumber=9Z34HER`;
                chai.request(app.express).get(uri).then((res) => {
                    responseBody = res.body;
                    responseStatusCode = res.status
                    done();
                });
            })
            after(() => {
                restTemplateStub.restore();
                readDocumentsStub.restore();
            });
            it('should be successful', () => {
                expect(responseStatusCode).to.eq(httpstatus.OK)
            })
            it('not call OVQ', () => {
                expect(restTemplateStub.calledOnce).to.be.false;
            })
            it('should return a response body from the cache', () => {
                let cacheResponse = JSON.stringify(responseBody)
                expect(cacheResponse).contains.name.match("customerOrderNumber");
                expect(cacheResponse).contains.name.match(customerOrderNumber);
            })
        })
        describe('when the order details are not in the cache or OVQ', () => {
            const customerOrderNumber = '123'
            const trackingNumber = '9Z34HER'

            before((done) => {
                restTemplateStub = stub(RestTemplate, 'postToExternalSource');
                mongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments');
                readDocumentsStub.resolves(null);
                let ovqResponse = JSON.stringify({
                    "data": {
                        "order": {
                            "OrderList": null
                        }
                    }
                })
                restTemplateStub.resolves(ovqResponse)
                
                ovqDelegate = new OvqDelegate();
                comOrderEventTranslator = new ComOrderEventTranslator();
                comOrderDetailService = new ComOrderDetailService(mongoRepo, ovqDelegate, comOrderEventTranslator);
                comOrderDetailController = new COMOrderDetailController(comOrderDetailService);
                app = new App(comOrderDetailController);
                const uri = `/api/v1/orders?customerOrderNumber=${customerOrderNumber}&trackingNumber=${trackingNumber}`;
                chai.request(app.express).get(uri).then((res) => {
                    responseBody = res.body;
                    responseStatusCode = res.status
                    done();
                });
            })
            after(() => {
                restTemplateStub.restore();
                readDocumentsStub.restore();
            });
            it('should try to retrieve data from the cache', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            })
            it('should try to call OVQ', () => {
                expect(restTemplateStub.calledOnce).to.be.true;
            })
            it('should return not found for this order', () => {
                let response = JSON.stringify(responseBody)
                expect(responseStatusCode).to.be.eq(httpstatus.NOT_FOUND)
                expect(response).contains.name.match(customerOrderNumber);
                expect(response).contains.name.match(trackingNumber);
                expect(response).contains.name.match(`Order Details for customer order number ${customerOrderNumber} and tracking number ${trackingNumber} not found`);
            })
        })
    })
    describe('Given neither a customer order number and tracking number', () => {
        before((done) => {
            ovqDelegate = new OvqDelegate();
            mongoRepo = new MongoRepo();

            comOrderEventTranslator = new ComOrderEventTranslator();
            comOrderDetailService = new ComOrderDetailService(mongoRepo, ovqDelegate, comOrderEventTranslator);
            comOrderDetailController = new COMOrderDetailController(comOrderDetailService);
            app = new App(comOrderDetailController);
            const uri = `/api/v1/orders`;
            chai.request(app.express).get(uri).then((res) => {
                responseBody = res.body;
                responseStatusCode = res.status
                done();
            });
        })
        it('should return invalid request system error', () => {
            expect(responseStatusCode).to.eq(httpstatus.BAD_REQUEST)
        })
    })
})