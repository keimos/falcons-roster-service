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
import { read, readFileSync } from 'fs';
import { OvqDelegate } from '../delegate/OvqDelegate';
import { ComOrderEventTranslator } from '../translator/ComOrderEventTranslator';
import { ComOrderDetailsDTO, LineItemDTO, TrackingDetailDTO } from '../dto/ComOrderDetailsDTO';


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
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo, new OvqDelegate(), new ComOrderEventTranslator());

                orderDetail = await comOrderDetailService.getOrderDetailByCustomerOrderNumberAndTrackingNumber('123', '9Z34HER');
            });
            after(() => {
                readDocumentsStub.reset();
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
        describe('Given a customerOrderNumber and Tracking Number, and Mongo does not have the order details, when the function is invoked, then it', () => {
            let readDocumentsStub: SinonStub;
            let translatorStub: SinonStub;
            let ovqStub: SinonStub;
            let orderDetail: any;
            const translator = new ComOrderEventTranslator();
            const mongoRepo: MongoRepo = new MongoRepo();
            const ovqDelegate = new OvqDelegate();

            const emptyDbObj = new Array<any>();

            before(async () => {
                translatorStub = stub(translator, 'translate')
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
                ovqStub = stub(ovqDelegate, 'getOrderDetails')
                readDocumentsStub.resolves(emptyDbObj);
                let order = new ComOrderDetailsDTO();
                order.lineItems = new Array();
                order.lineItems[0] = new LineItemDTO();
                order.lineItems[0].tracking = new Array();
                order.lineItems[0].tracking[0] = new TrackingDetailDTO();
                order.lineItems[0].tracking[0].trackingNumber = '923DGS';
                translatorStub.returns(order);
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo, ovqDelegate, translator);

                orderDetail = await comOrderDetailService.getOrderDetailByCustomerOrderNumberAndTrackingNumber('123', '9Z34HER');
            });
            after(() => {
                readDocumentsStub.reset();
            });
            it('should call mongoService', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with both customerOrderNumber and trackingNumber', () => {
                expect(readDocumentsStub.getCall(0).args[0]).to.be.deep.eq({"customerOrderNumber": '123', "lineItems.trackingNumber": '9Z34HER'});
            });
            it('should call OVQ because the details are not in Mongo', () => {
                expect(ovqStub.calledOnce).to.be.true;
            });
            it('should return object from mongo', () => {
                expect(orderDetail.length).to.be.eq(0);
            });
        });
    });
    describe('Function: getOrderDetailFromMongoCache', () => {
        let readDocumentsStub: SinonStub;
        let orderDetail: any;
        let comOrderDetailService: ComOrderDetailService;

        before(async () => {
            const mongoRepo: MongoRepo = new MongoRepo();
            readDocumentsStub = stub(mongoRepo, 'readDocuments')

            comOrderDetailService = new ComOrderDetailService(mongoRepo, new OvqDelegate(), new ComOrderEventTranslator());

        });
        
        describe('Given a customerOrderNumber and Tracking Number, when the function is invoked, then it', () => {
            const expectedDbObj = [{customerOrderNumber: '123', trackingNumber: '9Z34HER'}];
            
            before(async() => {
                readDocumentsStub.reset()
                readDocumentsStub.resolves(expectedDbObj);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromMongoCache('123', '9Z34HER');
                
            })
            it('should call mongoService', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with both customerOrderNumber and trackingNumber', () => {
                expect(readDocumentsStub.getCall(0).args[0]).to.be.deep.eq({"customerOrderNumber": '123', "lineItems.trackingNumber": '9Z34HER'});
            });
            it('should return object from mongo', () => {
                expect(orderDetail).to.be.eq(expectedDbObj)
            });1
        })
        
        describe('Given a customerOrderNumber only, when the function is invoked, then it', () => {
            const expectedDbObj = [{customerOrderNumber: '123'}];
            before(async() => {
                readDocumentsStub.reset();
                readDocumentsStub.resolves(expectedDbObj);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromMongoCache('123', null);
            })
            it('should call mongoService', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with only customerOrderNumber ', () => {
                expect(readDocumentsStub.getCall(0).args[0]).to.be.deep.eq({"customerOrderNumber": '123'});
            });
            it('should return object from mongo', () => {
                expect(orderDetail).to.be.eq(expectedDbObj)
            });
        })

        describe('Given a tracking number only, when the function is invoked, then it', () => {
            const trackingNumber = '123GGD';
            const expectedDbObj = [{trackingNumber: trackingNumber}];
            before(async() => {
                readDocumentsStub.reset();
                readDocumentsStub.resolves(expectedDbObj);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromMongoCache(null, trackingNumber);
            })
            it('should call mongoService', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with only customerOrderNumber ', () => {
                expect(readDocumentsStub.getCall(0).args[0]).to.be.deep.eq({"lineItems.trackingNumber": trackingNumber});
            });
            it('should return object from mongo', () => {
                expect(orderDetail).to.be.eq(expectedDbObj)
            });
        })
    })
    describe('Function: getOrderDetailFromOVQ', () => {
        let getOrderDetailsStub: SinonStub;
        let translateStub: SinonStub;
        let orderDetail: Array<ComOrderDetailsDTO>;
        let order: ComOrderDetailsDTO;

        const ovqDelegate: OvqDelegate = new OvqDelegate();
        const translator: ComOrderEventTranslator = new ComOrderEventTranslator();
        before(async () => {
            getOrderDetailsStub = stub(ovqDelegate, 'getOrderDetails');
            translateStub = stub(translator, 'translate');
        });
        describe('Given an order has a matching tracking number, when the function is invoked with order number and tracking number, then it', () => {
            const trackingNumber = '9Z34HER';
            before(async () => {
                getOrderDetailsStub.reset();
                translateStub.reset();
                order = new ComOrderDetailsDTO();
                order.lineItems = new Array();
                order.lineItems[0] = new LineItemDTO();
                order.lineItems[0].tracking = new Array();
                order.lineItems[0].tracking[0] = new TrackingDetailDTO();
                order.lineItems[0].tracking[0].trackingNumber = trackingNumber;
                translateStub.returns(order);
                
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(null, ovqDelegate, translator);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromOVQ('123', trackingNumber);

            });
            it('should call Ovq once ', () => {
                expect(getOrderDetailsStub.calledOnce).to.be.true;
            });
            it ('should call translate once ', () => {
                expect(translateStub.calledOnce).to.be.true;
            });
            it('should return order details', () => {
                expect(orderDetail).to.be.deep.eq([order]);
            });

        })

        describe('Given an order does NOT have a matching tracking number, when the function is invoked with order number and tracking number, then it', () => {
            before(async () => {
                getOrderDetailsStub.reset();
                translateStub.reset();
                order = new ComOrderDetailsDTO();
                order.lineItems = new Array();
                order.lineItems[0] = new LineItemDTO();
                order.lineItems[0].tracking = new Array();
                order.lineItems[0].tracking[0] = new TrackingDetailDTO();
                order.lineItems[0].tracking[0].trackingNumber = '127FRE';
                translateStub.returns(order);
                
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(null, ovqDelegate, translator);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromOVQ('123', '986AAX');
            });
            it('should call Ovq', () => {
                expect(getOrderDetailsStub.calledOnce).to.be.true;
            });
            it ('should call translate', () => {
                expect(translateStub.calledOnce).to.be.true;
            });
            it('should return an empty list of order details', () => {
                expect(orderDetail.length).to.be.eq(0);
                expect(orderDetail).to.be.deep.eq([]);
            });

        })

        describe('Given a tracking number is not passed in, when the function is invoked with only order number, then it', () => {
            before(async () => {
                getOrderDetailsStub.reset();
                translateStub.reset();
                order = new ComOrderDetailsDTO();
                order.lineItems = new Array();
                order.lineItems[0] = new LineItemDTO();
                order.lineItems[0].tracking = new Array();
                order.lineItems[0].tracking[0] = new TrackingDetailDTO();
                order.lineItems[0].tracking[0].trackingNumber = '127FRE';
                translateStub.returns(order);
                
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(null, ovqDelegate, translator);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromOVQ('123', null);
            });
            it('should call Ovq', () => {
                expect(getOrderDetailsStub.calledOnce).to.be.true;
            });
            it ('should call translate', () => {
                expect(translateStub.calledOnce).to.be.true;
            });
            it('should return an empty list of order details', () => {
                expect(orderDetail.length).to.be.eq(0);
                expect(orderDetail).to.be.deep.eq([]);
            });

        })
    })

});