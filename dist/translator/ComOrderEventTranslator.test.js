"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const mocha_1 = require("mocha");
const ComEventDTO_1 = require("../dto/ComEventDTO");
const ComOrderEventTranslator_1 = require("./ComOrderEventTranslator");
const expect = chai.expect;
describe('Class: ComOrderEventTranslator', () => {
    describe('function: translate', () => {
        mocha_1.before(() => {
        });
        after(() => {
        });
        describe('Given an event with null orderList, when the function is called, then it', () => {
            let comEvent = { _id: '0' };
            let comOrderDetails;
            mocha_1.before(() => {
                comOrderDetails = ComOrderEventTranslator_1.ComOrderEventTranslator.translate(comEvent);
            });
            it('should return an empty list', () => {
                expect(comOrderDetails.length).to.be.eq(0);
            });
        });
        describe('Given an event with empty orderList, when the function is called, then it', () => {
            let comEvent = { _id: '0', OrderList: [] };
            let comOrderDetails;
            mocha_1.before(() => {
                comOrderDetails = ComOrderEventTranslator_1.ComOrderEventTranslator.translate(comEvent);
            });
            it('should return an empty list', () => {
                expect(comOrderDetails.length).to.be.eq(0);
            });
        });
        describe('Given an event with empty orders, when the function is called, then it', () => {
            let comEvent = { _id: '0', OrderList: [{ Order: [] }] };
            let comOrderDetails;
            mocha_1.before(() => {
                comOrderDetails = ComOrderEventTranslator_1.ComOrderEventTranslator.translate(comEvent);
            });
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
                                comStatus: "shipped"
                            }
                        ]
                    }
                ]
            };
            let comOrderDetails;
            mocha_1.before(() => {
                let comEvent = createMockEvent(eventMeta);
                comOrderDetails = ComOrderEventTranslator_1.ComOrderEventTranslator.translate(comEvent);
            });
            it('should return a list of one', () => {
                expect(comOrderDetails.length).to.be.eq(1);
            });
            it('should contain customerOrderNumber', () => {
                expect(comOrderDetails[0].customerOrderNumber).to.be.eq('123');
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
            });
            it('should contain email', () => {
                expect(comOrderDetails[0].email).to.be.eq('dummyEmail@fake.com');
            });
            it('should contain po', () => {
                expect(comOrderDetails[0].po).to.be.eq('123');
            });
        });
    });
});
function createMockEvent(attributes) {
    var comEvent = new ComEventDTO_1.ComEventDTO();
    comEvent._id = "1";
    comEvent.OrderList = new Array();
    comEvent.OrderList[0] = new ComEventDTO_1.OrderListEntity();
    comEvent.OrderList[0].Order = new Array();
    for (const orderAtr of attributes.orders) {
        const order = createOrder(orderAtr);
        comEvent.OrderList[0].Order.push(order);
    }
    return comEvent;
}
function createOrder(orderAtr) {
    var order = {
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
    };
    return order;
}
function createOrderLines(lineItemsAtr) {
    var orderLinesList = new Array();
    var orderLines = new ComEventDTO_1.OrderLinesEntity();
    orderLines.OrderLine = new Array();
    var orderLine = new ComEventDTO_1.OrderLineEntity();
    orderLine._attributes = new ComEventDTO_1.Attributes8();
    orderLine._attributes.DeliveryMethod = lineItemsAtr[0].deliveryType;
    orderLine._attributes.OrderedQty = lineItemsAtr[0].qty;
    orderLine.Item = new Array();
    var item = new ComEventDTO_1.ItemEntity();
    item._attributes = new ComEventDTO_1.Attributes15();
    item._attributes.ItemDesc = "This is some dummy sku";
    orderLine.Item.push(item);
    orderLine.Extn = new Array();
    var extn = new ComEventDTO_1.ExtnEntity1();
    extn._attributes = new ComEventDTO_1.Attributes9();
    extn._attributes.ExtnOMSID = "123";
    extn._attributes.ExtnSKUCode = lineItemsAtr[0].sku;
    extn.HDTrackingInfoList = new Array();
    extn.HDTrackingInfoList[0] = {
        HDTrackingInfo: [
            {
                _attributes: {
                    TrackingNumber: lineItemsAtr[0].trackingNumber,
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
    orderLine.OrderStatuses[0] = new ComEventDTO_1.OrderStatusesEntity();
    orderLine.OrderStatuses[0].OrderStatus = new Array();
    orderLine.OrderStatuses[0].OrderStatus[0] = new ComEventDTO_1.OrderStatusEntity();
    orderLine.OrderStatuses[0].OrderStatus[0]._attributes = new ComEventDTO_1.Attributes33();
    orderLine.OrderStatuses[0].OrderStatus[0]._attributes.StatusDescription = lineItemsAtr[0].comStatus;
    orderLine.OrderStatuses[0].OrderStatus[0].Details = new Array();
    orderLine.OrderStatuses[0].OrderStatus[0].Details[0] = new ComEventDTO_1.DetailsEntity();
    orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes = new ComEventDTO_1.Attributes34();
    orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes.ExpectedDeliveryDate = "2019-01-01";
    orderLines.OrderLine.push(orderLine);
    orderLinesList.push(orderLines);
    return orderLinesList;
}