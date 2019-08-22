import * as chai from 'chai';
// import chaiHttp = require('chai-http');
// import httpstatus = require('http-status');
import * as randomstring from 'randomstring';

import { fail, AssertionError } from 'assert';
import { before } from 'mocha';
import { match, SinonSpy, spy, SinonStub, stub } from 'sinon';
import { SystemError } from '../error/SystemError'
import { ComEventDTO, OrderEntity, OrderLineEntity, OrderLinesEntity, Attributes8, ItemEntity, Attributes15, ExtnEntity1, Attributes9, OrderStatusesEntity, OrderStatusEntity, Attributes33, DetailsEntity, Attributes34, OrderListEntity } from '../dto/ComEventDTO';
import { ComOrderDetailsDTO } from '../dto/ComOrderDetailsDTO';
import { ComOrderEventTranslator } from './ComOrderEventTranslator';
import { OvqOrderListDTO, OvqOrderDTO, OvqOrderLinesDTO, OvqOrderLineDTO, OvqOrderLineExtnDTO, OvqItemDTO, OrderStatus, OvqPersonInfoBillToDTO, OvqPersonInfoShipToDTO, OvqOrderExtnDTO, OvqHDTrackingInfoListDTO, OvqHDTrackingInfoDTO, HDSplOrd } from '../dto/ComOvqDTO';

const expect = chai.expect;

/**
 * ComOrderEventTranslator tests
 */
describe('Class: ComOrderEventTranslator', () => {
    
    //
    describe('function: translate COM Event', () => {
        
        before(() => {
        });
        after(() => {
        })
        
        describe('Given an event with null orderList, when the function is called, then it', () => {
            
            let comEvent: ComEventDTO = {_id: '0'};
            
            let comOrderDetails: Array<ComOrderDetailsDTO>;
            // Prepare / Call
            before(() => {
                comOrderDetails = ComOrderEventTranslator.translate(comEvent);
            });
            
            // Assert
            it('should return an empty list', () => {
                expect(comOrderDetails.length).to.be.eq(0);
            });
        });
        describe('Given an event with empty orderList, when the function is called, then it', () => {
            
            let comEvent: ComEventDTO = {_id: '0', OrderList: []};
            
            let comOrderDetails: Array<ComOrderDetailsDTO>;
            // Prepare / Call
            before(() => {
                comOrderDetails = ComOrderEventTranslator.translate(comEvent);
            });
            
            // Assert
            it('should return an empty list', () => {
                expect(comOrderDetails.length).to.be.eq(0);
            });
        });
        
        describe('Given an event with empty orders, when the function is called, then it', () => {
            let comEvent: ComEventDTO = {_id: '0', OrderList: [{Order: []}]};
            
            let comOrderDetails: Array<ComOrderDetailsDTO>;
            // Prepare / Call
            before(() => {
                comOrderDetails = ComOrderEventTranslator.translate(comEvent);
            });
            
            // Assert
            it('should return an empty list', () => {
                expect(comOrderDetails.length).to.be.eq(0);
            });
        });
        
        describe('Given a STH event with one order with tracking details, when the function is called, then it', () => {
            const eventMeta = {
                orders: [
                    {   
                        orderNumber: "123",
                        lineItems: [
                            {
                                sku: "999",
                                qty: 1,
                                deliveryType: "SHP",
                                trackingNumber: "123-456",
                                trackingType: "LastMile",
                                comStatus: "shipped"
                            }
                        ]
                    }
                ]
            }
            
            let comOrderDetails: Array<ComOrderDetailsDTO>;
            // Prepare / Call
            before(() => {
                let comEvent: ComEventDTO = createMockEvent(eventMeta);
                comOrderDetails = ComOrderEventTranslator.translate(comEvent);
            });
            
            // Assert
            it('should return a list of one', () => {
                expect(comOrderDetails.length).to.be.eq(1);
            });
            it('should contain customerOrderNumber', () => {
                expect(comOrderDetails[0].customerOrderNumber).to.be.eq('123')
            });
            it('should contain orderedDate', () => {
                expect(comOrderDetails[0].orderedDate).to.be.eq('2018-12-29');
            });
            it('should contain shipTo details', () => {
                const shipTo = comOrderDetails[0].shipTo;
                expect(shipTo.addressLineOne).to.be.eq('123 main st');
                expect(shipTo.city).to.be.eq('Atlanta');
                expect(shipTo.state).to.be.eq('GA');
                expect(shipTo.zip).to.be.eq('12345');
            });
            it('should contain one line item', () => {
                expect(comOrderDetails[0].lineItems.length).to.be.eq(1);
            });
            it('line item should contain details', () => {
                const lineItem = comOrderDetails[0].lineItems[0];
                expect(lineItem.sku).to.be.eq('999');
                expect(lineItem.skuDescription).to.be.eq('This is some dummy sku');
                expect(lineItem.omsID).to.be.eq('123');
                expect(lineItem.quantity).to.be.eq(1);
                expect(lineItem.expectedDeliveryDate).to.be.eq('2019-01-01');
                expect(lineItem.comStatus).to.be.eq('shipped');
                expect(lineItem.levelOfService).to.be.eq('basic');
                expect(lineItem.scac).to.be.eq('ACME');
                expect(lineItem.trackingNumber).to.be.eq('123-456');
                expect(lineItem.trackingType).to.be.eq('LastMile');
            });
            it('should contain email', () => {
                expect(comOrderDetails[0].email).to.be.eq('dummyEmail@fake.com');
            });
            it('should contain po', () => {
                expect(comOrderDetails[0].po).to.be.eq('123');
            });
        });
    });
    describe('function: translate OVQ response', () => {
        let ovqDetails = new OvqOrderListDTO();
        const customerOrderNumber = "W1239579";
        const orderDate = "2019-06-03T04:07:00-04:00";
        const emailAddress = "emailaaaa@homedepot.com";
        const poNumber = "01630219";
        const itemDescription = "CARPET";
        const quantity = "5.00";
        const expectedDeliveryDate = "2019-06-05T03:28:09-04:00";
        const status = "Scheduled";
        const scac = "UPSC";
        const levelOfService = "Basic";
        const trackingNumber = "50000005000018";

        
        before(() => {
            let ovqOrderDTO = new OvqOrderDTO();
            let billInfo = new OvqPersonInfoBillToDTO();
            let shipInfo = new OvqPersonInfoShipToDTO();
            let extnReference = new OvqOrderExtnDTO();
            let extn = new OvqOrderLineExtnDTO();
            let item = new OvqItemDTO();
            let orderStatus = new OrderStatus();
            let orderLines = new OvqOrderLinesDTO();
            let orderLine = new OvqOrderLineDTO;
            
            billInfo.EMailID = emailAddress
            shipInfo.AddressLine1 = "1234 test street"
            shipInfo.City = "Atlanta"
            shipInfo.State = "GA"
            shipInfo.ZipCode = "23937"
            extnReference.ExtnHostOrderReference = customerOrderNumber            
            extnReference.ExtnPONumber = poNumber           
            
            extn.ExtnOMSID = '204798123'
            extn.ExtnSKUCode = '1000018123'
            let trackingInfo = new OvqHDTrackingInfoDTO()
            trackingInfo.TrackingNumber = trackingNumber
            trackingInfo.LevelOfService = levelOfService
            trackingInfo.TrackingType = "LastMile"
            trackingInfo.SCAC = scac
            const trackingList = new OvqHDTrackingInfoListDTO();
            trackingList.HDTrackingInfo = [trackingInfo]
            extn.HDTrackingInfoList = trackingList

            let splOrdList = new HDSplOrd();
            splOrdList.SplOrdExpectedArrivalDate = expectedDeliveryDate
            extn.HDSplOrdList = [splOrdList]

            item.ItemDesc = itemDescription;
            item.UnitCost = "152.00";
            orderStatus.StatusDate = "2019-06-03T03:28:09-04:00"
            orderStatus.StatusDescription = status
            
            orderLine.Extn = extn;
            orderLine.Item = item;
            orderLine.OrderStatuses = [orderStatus]
            orderLine.OrderedQty = quantity
            orderLine.ShipNode = "MVNDR-60085653"
            
            orderLines.OrderLine = [orderLine];

            ovqOrderDTO.DocumentType = "0005"
            ovqOrderDTO.OrderDate = orderDate
            ovqOrderDTO.OvqPersonInfoBillTo = billInfo
            ovqOrderDTO.OvqPersonInfoShipTo = shipInfo
            ovqOrderDTO.OvqOrderExtn = extnReference
            ovqOrderDTO.OrderLines = orderLines
            ovqDetails.Order = [ovqOrderDTO];
        });
        describe('Given an OVQ Order dto, when the function is invoked, then it ',() => {
            let comTranslator = new ComOrderEventTranslator();
            let response: ComOrderDetailsDTO;
            before(() => {
                 response = comTranslator.translate(ovqDetails)
            })
            it('should translate order attributes', () => {
                expect(response).to.not.be.null
                expect(response.lastUpdatedTS).to.not.be.null
                expect(response.customerOrderNumber).to.eq(customerOrderNumber)
                expect(response.orderedDate).to.eq(orderDate)
                expect(response.email).to.eq(emailAddress)
                expect(response.po).to.eq(poNumber)
            });
            it('should translate line items', () => {
                expect(response.lineItems.length).to.eq(1)
                expect(response.lineItems[0].skuDescription).to.eq(itemDescription)
                expect(response.lineItems[0].quantity).to.eq(Number.parseInt(quantity))
                expect(response.lineItems[0].comStatus).to.be.eq(status)
                expect(response.lineItems[0].expectedDeliveryDate).to.eq(expectedDeliveryDate)
                expect(response.lineItems[0].levelOfService).to.eq(levelOfService)
                expect(response.lineItems[0].scac).to.eq(scac)
                expect(response.lineItems[0].trackingNumber).to.eq(trackingNumber)
            });
            
            it('should translate shipTo', () => {
                expect(response.shipTo).to.not.be.null
                expect(response.shipTo.addressLineOne).to.eq(ovqDetails.Order[0].OvqPersonInfoShipTo.AddressLine1)
                expect(response.shipTo.city).to.eq(ovqDetails.Order[0].OvqPersonInfoShipTo.City)
                expect(response.shipTo.zip).to.eq(ovqDetails.Order[0].OvqPersonInfoShipTo.ZipCode)
                expect(response.shipTo.state).to.eq(ovqDetails.Order[0].OvqPersonInfoShipTo.State)
            });
        })
    });

});




function createMockEvent(attributes: any): ComEventDTO {
    var comEvent: ComEventDTO = new ComEventDTO();
    comEvent._id = "1";
    comEvent.OrderList = new Array();
    comEvent.OrderList[0] = new OrderListEntity();
    comEvent.OrderList[0].Order = new Array();

   for (const orderAtr of attributes.orders) {
        const order = createOrder(orderAtr);
        comEvent.OrderList[0].Order.push(order);
    }

    return comEvent;
}

function createOrder(orderAtr: any) : OrderEntity {
    var order: OrderEntity = {
                PersonInfoBillTo: [
                    {
                        _attributes: {
                            EMailID: "dummyEmail@fake.com"
                        }
                    }
                ],
                PersonInfoShipTo: [
                    {
                        _attributes: {
                            AddressLine1: "123 main st",
                            City: "Atlanta",
                            ZipCode: "12345",
                            State: "GA"
                        }
                    }
                ],
                _attributes: {
                    OrderDate: "2018-12-29"
                },
                Extn: [
                    {
                        _attributes: {
                            ExtnHostOrderReference: orderAtr.orderNumber,
                            ExtnPONumber: "123"
                        }
                    }
                ],
                OrderLines: createOrderLines(orderAtr.lineItems)
            }
    return order;
}


//{
//    sku: "1",
//    qty: "1",
//    deliveryType: "SHP"
//}
function createOrderLines(lineItemsAtr: any) : Array<OrderLinesEntity>  {
    var orderLinesList: Array<OrderLinesEntity> = new Array();
    var orderLines: OrderLinesEntity = new OrderLinesEntity();
    orderLines.OrderLine = new Array();
    var orderLine: OrderLineEntity = new OrderLineEntity();

    orderLine._attributes = new Attributes8();
    orderLine._attributes.DeliveryMethod = lineItemsAtr[0].deliveryType;
    orderLine._attributes.OrderedQty = lineItemsAtr[0].qty;

    orderLine.Item = new Array();
    var item: ItemEntity = new ItemEntity();
    item._attributes = new Attributes15();
    item._attributes.ItemDesc = "This is some dummy sku" ;
    orderLine.Item.push(item);

    orderLine.Extn = new Array();
    var extn: ExtnEntity1 = new ExtnEntity1();
    extn._attributes = new Attributes9();
    extn._attributes.ExtnOMSID = "123";
    extn._attributes.ExtnSKUCode = lineItemsAtr[0].sku;
    extn.HDTrackingInfoList = new Array();
    extn.HDTrackingInfoList[0] = {
        HDTrackingInfo: [
            {
                _attributes: {
                    TrackingNumber: lineItemsAtr[0].trackingNumber,
                    TrackingType: lineItemsAtr[0].trackingType,
                    SCAC: "ACME"
                }
            }
        ]
    };
    extn.HDOnlineProductList = new Array();
    extn.HDOnlineProductList[0] = {
            HDOnlineProduct: [
                {
                    _attributes: {
                        LevelOfServiceDesc: "basic"
                    }
                }
            ]
    };

    orderLine.Extn.push(extn);

    orderLine.OrderStatuses = new Array();
    orderLine.OrderStatuses[0] = new OrderStatusesEntity();
    orderLine.OrderStatuses[0].OrderStatus = new Array();
    orderLine.OrderStatuses[0].OrderStatus[0] = new OrderStatusEntity();
    orderLine.OrderStatuses[0].OrderStatus[0]._attributes = new Attributes33();
    orderLine.OrderStatuses[0].OrderStatus[0]._attributes.StatusDescription = lineItemsAtr[0].comStatus;
    orderLine.OrderStatuses[0].OrderStatus[0].Details = new Array();
    orderLine.OrderStatuses[0].OrderStatus[0].Details[0] = new DetailsEntity();
    orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes = new Attributes34();
    orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes.ExpectedDeliveryDate = "2019-01-01";

    orderLines.OrderLine.push(orderLine);
    orderLinesList.push(orderLines);

    return orderLinesList;
}
