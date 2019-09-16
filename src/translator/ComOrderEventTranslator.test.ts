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
import { OvqOrderListDTO, OvqOrderDTO, OvqOrderLinesDTO, OvqOrderLineDTO, OvqOrderLineExtnDTO, OvqItemDTO, OrderStatus, OvqPersonInfoBillToDTO, OvqPersonInfoShipToDTO, OvqOrderExtnDTO, OvqHDTrackingInfoListDTO, OvqHDTrackingInfoDTO, HDSplOrd, OvqHDOnlineProductListDTO, OvqHDOnlineProductDTO } from '../dto/ComOvqDTO';

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

            let comEvent: ComEventDTO = { _id: '0' };

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

            let comEvent: ComEventDTO = { _id: '0', OrderList: [] };

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
            let comEvent: ComEventDTO = { _id: '0', OrderList: [{ Order: [] }] };

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
                        documentType: "0001",
                        orderNumber: "123",
                        lineItems: [
                            {
                                sku: "999",
                                qty: "1",
                                deliveryType: "SHP",
                                comStatus: "shipped"
                            }
                        ]
                    },
                    {
                        documentType: "0005",
                        orderNumber: "123",
                        lineItems: [
                            {
                                sku: "999",
                                qty: "1",
                                deliveryType: "SHP",
                                trackingNumber: "123-456",
                                trackingType: "LastMile",
                                comStatus: "shipped",
                                manufacturername: "manufacturername"
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
                expect(lineItem.quantity).to.be.eq("1");
                expect(lineItem.expectedDeliveryDate).to.be.eq('2019-01-01');
                expect(lineItem.comStatus).to.be.eq('shipped');
                expect(lineItem.tracking[0].levelOfService).to.be.eq('basic');
                expect(lineItem.tracking[0].scac).to.be.eq('ACME');
                expect(lineItem.tracking[0].trackingNumber).to.be.eq('123-456');
                expect(lineItem.tracking[0].trackingType).to.be.eq('LastMile');
                expect(lineItem.po).to.be.eq('123');
                expect(lineItem.manufacturerName).to.be.eq('manufacturername');
            });
            it('should contain customerInfo', () => {
                expect(comOrderDetails[0].customerInfo.firstName).to.be.eq('Homer');
                expect(comOrderDetails[0].customerInfo.middleName).to.be.eq('D');
                expect(comOrderDetails[0].customerInfo.lastName).to.be.eq('Poe');
                expect(comOrderDetails[0].customerInfo.email).to.be.eq('dummyEmail@fake.com');
                expect(comOrderDetails[0].customerInfo.phoneNumber).to.be.eq('123-456-7890');
                expect(comOrderDetails[0].customerInfo.mobileNumber).to.be.eq('098-765-4321');
            });
        });
    });
    describe('function: translate OVQ response', () => {
        let ovqDetails = new OvqOrderListDTO();
        
        const orderDate = "2019-06-03T04:07:00-04:00";
        const emailAddress = "emailaaaa@homedepot.com";
        const poNumber = "01630219";
        const itemDescription = "some desc";
        const status = "Scheduled";
        const scac = "USPS";
        const levelOfService = "Basic";
        const trackingNumber = "123-456";
        const manufacturerName = "manufacturername";


        before(() => {
            const eventMeta = {
                orders: [
                    {
                        orderDate: "2019-06-03T04:07:00-04:00",
                        documentType: "0001",
                        orderNumber: "W1239579",
                        email: "homer@homedepot.com",
                        po: "1234",
                        levelOfService: "Basic",
                        lineItems: [
                            {
                                sku: "999",
                                qty: "5.00",
                                deliveryType: "SHP",
                                comStatus: "shipped",
                                manufacturername: "manufacturername"
                            }
                        ]
                    },
                    {
                        documentType: "0005",
                        orderNumber: "W1239579",
                        trackingNumber: "track",
                        expectedDeliveryDate: "2019-06-05T03:28:09-04:00",
                        lineItems: [
                            {
                                sku: "999",
                                qty: "5.00",
                                deliveryType: "SHP",
                                trackingNumber: "123-456",
                                trackingType: "LastMile",
                                comStatus: "shipped"
                            }
                        ]
                    }
                ]
            }
            ovqDetails = createMockOVQObject(eventMeta);
        });
        describe('Given an OVQ Order dto, when the function is invoked, then it ', () => {
            let comTranslator = new ComOrderEventTranslator();
            let response: ComOrderDetailsDTO;
            before(() => {
                response = comTranslator.translate(ovqDetails)
            })
            it('should translate order attributes', () => {
                expect(response).to.not.be.null
                expect(response.lastUpdatedTS).to.not.be.null
                expect(response.customerOrderNumber).to.eq("W1239579")
                expect(response.orderedDate).to.eq(orderDate)
            });
            it('should translate line items', () => {
                expect(response.lineItems.length).to.eq(1)
                expect(response.lineItems[0].skuDescription).to.eq(itemDescription)
                expect(response.lineItems[0].quantity).to.eq("5.00")
                expect(response.lineItems[0].tracking[0].scac).to.eq(scac)
                expect(response.lineItems[0].tracking[0].trackingNumber).to.eq(trackingNumber)
                expect(response.lineItems[0].manufacturerName).to.eq(manufacturerName)
            });

            it('should translate shipTo', () => {
                expect(response.shipTo).to.not.be.null
                expect(response.shipTo.addressLineOne).to.eq(ovqDetails.Order[0].PersonInfoShipTo.AddressLine1)
                expect(response.shipTo.city).to.eq(ovqDetails.Order[0].PersonInfoShipTo.City)
                expect(response.shipTo.zip).to.eq(ovqDetails.Order[0].PersonInfoShipTo.ZipCode)
                expect(response.shipTo.state).to.eq(ovqDetails.Order[0].PersonInfoShipTo.State)
            });
        })
    });

});

function createMockOVQObject(attributes: any) {

    let ovqDetails = new OvqOrderListDTO();
    ovqDetails.Order = new Array();

    for (const orderAtr of attributes.orders) {
        const order = createOVQOrder(orderAtr);
        ovqDetails.Order.push(order);
    }

    return ovqDetails;
}

function createOVQOrder(orderAtr: any) {
    let ovqOrderDTO = new OvqOrderDTO();
    let billInfo = new OvqPersonInfoBillToDTO();
    let shipInfo = new OvqPersonInfoShipToDTO();
    let extnReference = new OvqOrderExtnDTO();
    let extn = new OvqOrderLineExtnDTO();
    let item = new OvqItemDTO();
    let orderStatus = new OrderStatus();
    let orderLines = new OvqOrderLinesDTO();
    let orderLine = new OvqOrderLineDTO;

    billInfo.EMailID = orderAtr.email;
    shipInfo.AddressLine1 = "1234 test street"
    shipInfo.City = "Atlanta"
    shipInfo.State = "GA"
    shipInfo.ZipCode = "23937"
    extnReference.ExtnHostOrderReference = orderAtr.orderNumber;
    extnReference.ExtnPONumber = orderAtr.po;

    extn.ExtnOMSID = '204798123'
    extn.ExtnSKUCode = '1000018123'
    let trackingInfo = new OvqHDTrackingInfoDTO()
    trackingInfo.TrackingNumber = orderAtr.lineItems[0].trackingNumber;
    trackingInfo.TrackingType = orderAtr.lineItems[0].trackingType;
    trackingInfo.SCAC = 'USPS'
    const trackingList = new OvqHDTrackingInfoListDTO();
    trackingList.HDTrackingInfo = [trackingInfo]
    extn.HDTrackingInfoList = trackingList
    const productList = new OvqHDOnlineProductListDTO();
    let productDTO = new OvqHDOnlineProductDTO();
    productDTO.LevelOfServiceDesc = 'Basic'
    productList.HDOnlineProduct = [productDTO]
    extn.HDOnlineProductList = productList
    

    item.ItemDesc = 'some desc';
    item.UnitCost = "152.00";
    item.ManufacturerName = "manufacturername";
    orderStatus.StatusDate = "2019-06-03T03:28:09-04:00"
    orderStatus.StatusDescription = "Scheduled"

    orderLine.DeliveryMethod = "SHP";
    orderLine.Extn = extn;
    orderLine.Item = item;
    orderLine.OrderStatuses = [orderStatus]
    orderLine.OrderedQty = orderAtr.lineItems[0].qty
    orderLine.ShipNode = "MVNDR-60085653"

    orderLines.OrderLine = [orderLine];

    ovqOrderDTO.DocumentType = orderAtr.documentType;
    ovqOrderDTO.OrderDate = orderAtr.orderDate;
    ovqOrderDTO.PersonInfoBillTo = billInfo
    ovqOrderDTO.PersonInfoShipTo = shipInfo
    ovqOrderDTO.Extn = extnReference
    ovqOrderDTO.OrderLines = orderLines;

    return ovqOrderDTO;
}

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

function createOrder(orderAtr: any): OrderEntity {
    var order: OrderEntity = {
        PersonInfoBillTo: [
            {
                _attributes: {
                    FirstName: "Homer",
                    MiddleName: "D",
                    LastName: "Poe",
                    EMailID: "dummyEmail@fake.com",
                    DayPhone: "123-456-7890",
                    MobilePhone: "098-765-4321"
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
            OrderDate: "2018-12-29",
            DocumentType: orderAtr.documentType
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

function createOrderLines(lineItemsAtr: any): Array<OrderLinesEntity> {
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
    item._attributes.ItemDesc = "This is some dummy sku";
    item._attributes.ManufacturerName = "manufacturername";
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
                    SCAC: "ACME",
                    LevelOfService: "basic"
                }
            }
        ]
    };
    extn.HDOnlineProductList = new Array();
    extn.HDOnlineProductList[0] = {
        HDOnlineProduct: [
            {
                _attributes: {
                    LevelOfServiceDesc: "some desc of basic"
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
