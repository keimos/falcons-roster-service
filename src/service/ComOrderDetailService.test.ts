import * as chai from 'chai';
import chaiExclude from 'chai-exclude';

import { before } from 'mocha';
import { SinonStub, stub } from 'sinon';
import { ComOrderDetailService } from './ComOrderDetailService';
import { MongoRepo } from '../repo/MongoRepo';
import { OvqDelegate } from '../delegate/OvqDelegate';
import { ComOrderEventTranslator } from '../translator/ComOrderEventTranslator';
import {ComOrderDetailsDTO, LineItemDTO, TrackingDetailDTO, TrackingUrlDTO} from '../dto/ComOrderDetailsDTO';
import { SystemError } from '../error/SystemError';
import { BusinessError } from '../error/BusinessError';
import { ErrorCode } from '../utils/error-codes-enum';
import NodeCache = require('node-cache');


const expect = chai.expect;
chai.use(chaiExclude);

describe('Class: ComOrderDetailService', () => {
    describe('Function: getOrderDetailByCustomerOrderNumberAndTrackingNumber', () => {
        describe('Given a customerOrderNumber and Tracking Number, when the function is invoked, then it', () => {
            let readDocumentsStub: SinonStub;
            let orderDetail: any;
            let order: ComOrderDetailsDTO;
            const cachedOrder =
                {
                    customerOrderNumber: '123',
                    trackingNumber: '9Z34HER',
                    lineItems: [
                        {
                            tracking: [
                                {
                                    trackingNumber: '127FRE',
                                    scac: 'ABC'
                                },
                                {
                                    trackingNumber: '117FRE',
                                    scac: 'DEF'
                                },

                            ]
                        }
                    ]
                };
            const result =
                {
                    customerOrderNumber: '123',
                    trackingNumber: '9Z34HER',
                    lineItems: [
                        {
                            tracking: [
                                {
                                    trackingNumber: '127FRE',
                                    scac: 'ABC',
                                    trackingUrls: {
                                        primaryUrl: 'http://something.com/abc',
                                        trackingUrl: 'http://something.com/abc'
                                    }
                                },
                                {
                                    trackingNumber: '117FRE',
                                    scac: 'DEF',
                                    trackingUrls: {
                                        primaryUrl: 'http://something.com/def',
                                        trackingUrl: 'http://something.com/def'
                                    }
                                }
                            ]
                        }
                    ]
                };
            const trackingUrl1 =   { primaryUrl: 'http://something.com/abc', trackingUrl: 'http://something.com/abc'};
            const trackingUrl2 =   { primaryUrl: 'http://something.com/def', trackingUrl: 'http://something.com/def'};
            before(async () => {
                const mongoRepo: MongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
                readDocumentsStub.onCall(0).resolves(cachedOrder);
                readDocumentsStub.onCall(1).resolves(trackingUrl1);
                readDocumentsStub.onCall(2).resolves(trackingUrl2);

                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo, new NodeCache(), new OvqDelegate(), new ComOrderEventTranslator());

                orderDetail = await comOrderDetailService.getOrderDetailByCustomerOrderNumberAndTrackingNumber('123', '9Z34HER');
            });
            after(() => {
                readDocumentsStub.restore();
            });
            it('should call mongo cache', () => {
                expect(readDocumentsStub.calledThrice).to.be.true;
            });
            it('should query with both customerOrderNumber and trackingNumber', () => {
                expect(readDocumentsStub.getCall(0).args[1]).to.be.deep.eq({"customerOrderNumber": '123', "lineItems.tracking.trackingNumber": '9Z34HER'});
            });
            it('should return updated object with tracking URLs', () => {
                expect(orderDetail).excluding('trackingUrls').to.be.deep.eq(cachedOrder)
                expect(orderDetail).to.be.deep.equal(result)
                expect(orderDetail.lineItems[0].tracking[0].trackingUrls.primaryUrl).to.be.equal('http://something.com/abc')
                expect(orderDetail.lineItems[0].tracking[0].trackingUrls.trackingUrl).to.be.equal('http://something.com/abc')
                expect(orderDetail.lineItems[0].tracking[1].trackingUrls.primaryUrl).to.be.equal('http://something.com/def')
                expect(orderDetail.lineItems[0].tracking[1].trackingUrls.trackingUrl).to.be.equal('http://something.com/def')
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
            let order = new ComOrderDetailsDTO();

            before(async () => {
                translatorStub = stub(translator, 'translate')
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
                ovqStub = stub(ovqDelegate, 'getOrderDetails')

                readDocumentsStub.resolves(null);
                order.lineItems = new Array();
                order.lineItems[0] = new LineItemDTO();
                order.lineItems[0].tracking = new Array();
                order.lineItems[0].tracking[0] = new TrackingDetailDTO();
                order.lineItems[0].tracking[0].trackingNumber = '9Z34HER';
                translatorStub.returns(order);
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo, new NodeCache(), ovqDelegate, translator);

                orderDetail = await comOrderDetailService.getOrderDetailByCustomerOrderNumberAndTrackingNumber('123', '9Z34HER');
            });
            after(() => {
                readDocumentsStub.restore();
            });
            it('should call mongo cache', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with both customerOrderNumber and trackingNumber', () => {
                expect(readDocumentsStub.getCall(0).args[1]).to.be.deep.eq({"customerOrderNumber": '123', "lineItems.tracking.trackingNumber": '9Z34HER'});
            });
            it('should call OVQ because the details are not in Mongo', () => {
                expect(ovqStub.calledOnce).to.be.true;
            });
            it('should return object from OVQ', () => {
                expect(orderDetail).to.be.deep.eq(order);
            });
        });
        describe('Given a customerOrderNumber and Tracking Number, and both Mongo and OVQ do not have order details, then', () => {
            let readDocumentsStub: SinonStub;
            let translatorStub: SinonStub;
            let ovqStub: SinonStub;
            let orderDetail: any;
            const translator = new ComOrderEventTranslator();
            const mongoRepo: MongoRepo = new MongoRepo();
            const ovqDelegate = new OvqDelegate();
            let comOrderDetailService: ComOrderDetailService
            let customerOrderNumber = '123'
            let trackingNumber = '9Z34HER'

            before(async () => {
                translatorStub = stub(translator, 'translate')
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
                ovqStub = stub(ovqDelegate, 'getOrderDetails')
                readDocumentsStub.resolves(null);
                ovqStub.throws(new SystemError(ErrorCode.NOT_FOUND, 'Not Found Error', `Can not find customer order ${customerOrderNumber} in OVQ`))
                comOrderDetailService = new ComOrderDetailService(mongoRepo, new NodeCache(), ovqDelegate, translator);
                orderDetail = await comOrderDetailService.getOrderDetailByCustomerOrderNumberAndTrackingNumber(customerOrderNumber, trackingNumber).catch((err) => {});
            });
            after(() => {
                readDocumentsStub.restore();
            });
            it('should call mongo cache', async () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with both customerOrderNumber and trackingNumber', async () => {
                expect(readDocumentsStub.getCall(0).args[1]).to.be.deep.eq({"customerOrderNumber": customerOrderNumber, "lineItems.tracking.trackingNumber": trackingNumber});
            });
            it('should call OVQ because the details are not in Mongo', async () => {
                expect(ovqStub.calledOnce).to.be.true;
            });
            it('should catch OVQ error if not found and return not found error', async () => {
                let expectedError = new BusinessError(ErrorCode.NOT_FOUND, 'Order Details Not Found', `Order Details for customer order number ${customerOrderNumber} and tracking number ${trackingNumber} not found`)
                orderDetail = await comOrderDetailService.getOrderDetailByCustomerOrderNumberAndTrackingNumber(customerOrderNumber, trackingNumber)
                    .catch((err) => {
                        expect(err.message).to.equal(expectedError.message);
                    });
            });
        });
    });
    describe('Function: getOrderDetailFromDB', () => {
        let readDocumentsStub: SinonStub;
        let orderDetail: any;
        let comOrderDetailService: ComOrderDetailService;
        
        describe('Given a customerOrderNumber and Tracking Number, when the function is invoked, then it', () => {
            const expectedDbObj = {customerOrderNumber: '123', trackingNumber: '9Z34HER'};
            
            before(async() => {
                const mongoRepo: MongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
    
                comOrderDetailService = new ComOrderDetailService(mongoRepo, new NodeCache(),  new OvqDelegate(), new ComOrderEventTranslator());
                readDocumentsStub.resolves(expectedDbObj);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromDB('123', '9Z34HER');
            })
            
            after(() => {
                readDocumentsStub.restore()
            })

            it('should call mongo cache', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with both customerOrderNumber and trackingNumber', () => {
                expect(readDocumentsStub.getCall(0).args[1]).to.be.deep.eq({"customerOrderNumber": '123', "lineItems.tracking.trackingNumber": '9Z34HER'});
            });
            it('should return object from mongo', () => {
                expect(orderDetail).to.be.eq(expectedDbObj)
            });1
        })
        
        describe('Given a customerOrderNumber only, when the function is invoked, then it', () => {
            const expectedDbObj = {customerOrderNumber: '123'};
            before(async() => {
                const mongoRepo: MongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
    
                comOrderDetailService = new ComOrderDetailService(mongoRepo, new NodeCache(),  new OvqDelegate(), new ComOrderEventTranslator());
                readDocumentsStub.resolves(expectedDbObj);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromDB('123', null);
            })

            after(() => {
                readDocumentsStub.restore()
            })

            it('should call mongo cache', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with only customerOrderNumber ', () => {
                expect(readDocumentsStub.getCall(0).args[1]).to.be.deep.eq({"customerOrderNumber": '123'});
            });
            it('should return object from mongo', () => {
                expect(orderDetail).to.be.eq(expectedDbObj)
            });
        })

        describe('Given a tracking number only, when the function is invoked, then it', () => {
            const trackingNumber = '123GGD';
            const expectedDbObj = {trackingNumber: trackingNumber};
            before(async() => {
                const mongoRepo: MongoRepo = new MongoRepo();
                readDocumentsStub = stub(mongoRepo, 'readDocuments')
    
                comOrderDetailService = new ComOrderDetailService(mongoRepo, new NodeCache(), new OvqDelegate(), new ComOrderEventTranslator());
                readDocumentsStub.resolves(expectedDbObj);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromDB(null, trackingNumber);
            })

            after(() => {
                readDocumentsStub.restore()
            })
            it('should call mongo cache', () => {
                expect(readDocumentsStub.calledOnce).to.be.true;
            });
            it('should query with only customerOrderNumber ', () => {
                expect(readDocumentsStub.getCall(0).args[1]).to.be.deep.eq({"lineItems.tracking.trackingNumber": trackingNumber});
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
        
        describe('Given an order has a matching tracking number, when the function is invoked with order number and tracking number, then it', () => {
            const trackingNumber = '9Z34HER';
            before(async () => {
                getOrderDetailsStub = stub(ovqDelegate, 'getOrderDetails');
                translateStub = stub(translator, 'translate');
                order = new ComOrderDetailsDTO();
                order.lineItems = new Array();
                order.lineItems[0] = new LineItemDTO();
                order.lineItems[0].tracking = new Array();
                order.lineItems[0].tracking[0] = new TrackingDetailDTO();
                order.lineItems[0].tracking[0].trackingNumber = trackingNumber;
                translateStub.returns(order);
                
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(null, new NodeCache(), ovqDelegate, translator);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromOVQ('123', trackingNumber);

            });

            after(() => {
                getOrderDetailsStub.restore();
                translateStub.restore();
            })
            it('should call Ovq once ', () => {
                expect(getOrderDetailsStub.calledOnce).to.be.true;
            });
            it ('should call translate once ', () => {
                expect(translateStub.calledOnce).to.be.true;
            });
            it('should return order details', () => {
                expect(orderDetail).to.be.deep.eq(order);
            });
        })

        describe('Given an order does NOT have a matching tracking number, when the function is invoked with order number and tracking number, then it', () => {
            before(async () => {
                getOrderDetailsStub = stub(ovqDelegate, 'getOrderDetails');
                translateStub = stub(translator, 'translate');
                order = new ComOrderDetailsDTO();
                order.lineItems = new Array();
                order.lineItems[0] = new LineItemDTO();
                order.lineItems[0].tracking = new Array();
                order.lineItems[0].tracking[0] = new TrackingDetailDTO();
                order.lineItems[0].tracking[0].trackingNumber = '127FRE';
                translateStub.returns(order);
                
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(null, new NodeCache(), ovqDelegate, translator);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromOVQ('123', '986AAX');
            });

            after(() => {
                getOrderDetailsStub.restore();
                translateStub.restore();
            })
            it('should call Ovq', () => {
                expect(getOrderDetailsStub.calledOnce).to.be.true;
            });
            it ('should call translate', () => {
                expect(translateStub.calledOnce).to.be.true;
            });
            it('should return an empty list of order details', () => {
                expect(orderDetail).to.be.empty
            });

        })

        describe('Given a tracking number is not passed in, when the function is invoked with only order number, then it', () => {
            before(async () => {
                getOrderDetailsStub = stub(ovqDelegate, 'getOrderDetails');
                translateStub = stub(translator, 'translate');
                order = new ComOrderDetailsDTO();
                order.lineItems = new Array();
                order.lineItems[0] = new LineItemDTO();
                order.lineItems[0].tracking = new Array();
                order.lineItems[0].tracking[0] = new TrackingDetailDTO();
                order.lineItems[0].tracking[0].trackingNumber = '127FRE';
                translateStub.returns(order);
                
                const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(null, new NodeCache(), ovqDelegate, translator);
                orderDetail = await (comOrderDetailService as any).getOrderDetailFromOVQ('123', null);
            });
            after(() => {
                getOrderDetailsStub.restore();
                translateStub.restore();
            })
            it('should call Ovq', () => {
                expect(getOrderDetailsStub.calledOnce).to.be.true;
            });
            it ('should call translate', () => {
                expect(translateStub.calledOnce).to.be.true;
            });
            it('should return an empty list of order details', () => {
                expect(orderDetail).to.be.empty
            });

        });
    });
});
describe('Function: getTrackerUrlsByScac', () => {
    const mongoRepo: MongoRepo = new MongoRepo();
    const nodeCache: NodeCache = new NodeCache();
    let readDocumentsStub: SinonStub
    let getFromCacheStub: SinonStub
    let setToCacheStub: SinonStub
    let trackingObj : TrackingUrlDTO
    const expectedUrlObj = {primary_url : 'http://somedomain.com/ups',tracking_url : 'http://somedomain.com/ups'}; 
    describe('given the function is called and there is no cached object, then it', () => {
        before(async() => {
            readDocumentsStub = stub(mongoRepo, 'readDocuments')
            readDocumentsStub.resolves(expectedUrlObj)
            
            getFromCacheStub = stub(nodeCache, 'get')
            getFromCacheStub.callThrough()
            
            setToCacheStub = stub(nodeCache, 'set')
            setToCacheStub.callThrough()
            
            const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo, nodeCache, null, null);
            trackingObj = await (comOrderDetailService as any).getTrackerUrlsByScac('UPS');
        });
        after(() => {
            readDocumentsStub.restore();
            getFromCacheStub.restore();
            setToCacheStub.restore();
            nodeCache.del('UPS');
        })
        it('should call mongo', () => {
            expect(readDocumentsStub.calledOnce).to.be.true
        });
        it('should save to cache', () => {
            expect(setToCacheStub.calledOnce).to.be.true
            expect(setToCacheStub.getCall(0).args[0]).to.be.deep.eq('UPS')
            expect(setToCacheStub.getCall(0).args[1]).to.be.deep.eq(trackingObj)
            expect(setToCacheStub.getCall(0).args[2]).to.be.deep.eq(43200)
        });
        it('should return object', () => {
            expect(trackingObj).to.be.eq(expectedUrlObj)
        });
    });
    describe('given the function is called and there is no cached object and no mongo object, then it', () => {
        before(async() => {
            readDocumentsStub = stub(mongoRepo, 'readDocuments')
            readDocumentsStub.resolves(null)
            
            getFromCacheStub = stub(nodeCache, 'get')
            getFromCacheStub.callThrough()
            
            setToCacheStub = stub(nodeCache, 'set')
            setToCacheStub.callThrough()
            
            const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo, nodeCache, null, null);
            trackingObj = await (comOrderDetailService as any).getTrackerUrlsByScac('UPS');
        });
        after(() => {
            readDocumentsStub.restore();
            getFromCacheStub.restore();
            setToCacheStub.restore();
            nodeCache.del('UPS');
        })
        it('should call cache', () => {
            expect(getFromCacheStub.calledOnce).to.be.true
        });
        it('should call mongo', () => {
            expect(readDocumentsStub.calledOnce).to.be.true
        });
        it('should not save to cache', () => {
            expect(setToCacheStub.called).to.be.false
        });
        it('should return object', () => {
            expect(trackingObj).to.be.null
        });
    });
    describe('given the function is called and there is a cached object, then it', () => {
        before(async() => {
            readDocumentsStub = stub(mongoRepo, 'readDocuments')
            readDocumentsStub.resolves(expectedUrlObj)
            
            nodeCache.set('UPS', expectedUrlObj, 1)
            getFromCacheStub = stub(nodeCache, 'get')
            getFromCacheStub.callThrough()
            
            setToCacheStub = stub(nodeCache, 'set')
            setToCacheStub.callThrough()
            
            const comOrderDetailService: ComOrderDetailService = new ComOrderDetailService(mongoRepo, nodeCache, null, null);
            trackingObj = await (comOrderDetailService as any).getTrackerUrlsByScac('UPS');
        });
        after(() => {
            readDocumentsStub.restore();
            getFromCacheStub.restore();
            setToCacheStub.restore();
            nodeCache.del('UPS')
        })
        it('should get from cache', () => {
            expect(getFromCacheStub.calledOnce).to.be.true
            expect(getFromCacheStub.getCall(0).args[0]).to.be.deep.eq('UPS')
        });
        it('should not call mongo', () => {
            expect(readDocumentsStub.notCalled).to.be.true
        });
        it('should not save to cache', () => {
            expect(setToCacheStub.notCalled).to.be.true
        });
        it('should return object', () => {
            expect(trackingObj).to.be.deep.eq(expectedUrlObj)
        });
    });
});