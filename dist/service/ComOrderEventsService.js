"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ComOrderDetailsDTO_1 = require("../dto/ComOrderDetailsDTO");
const MongoRepo_1 = require("../repo/MongoRepo");
const lodash_1 = require("lodash");
var convert = require('xml-js');
class ComOrderEventsService {
    constructor(kafkaService) {
        this.kafkaService = kafkaService;
    }
    loadEvents() {
        console.log('init loadEvents');
        this.kafkaService.readFromQueue('COMOrderRecallPublish', this.processEvent);
    }
    processEvent(message) {
        var event = convert.xml2json(message.value, { compact: true, spaces: 4, alwaysArray: true });
        event = JSON.parse(event);
        MongoRepo_1.MongoRepo.getInstance().insertDocuments('rawlog_ComOrderDetails', [event], (() => {
            console.log('saved log into mongo');
        }));
        try {
            const comOrderDetails = translate(event);
            if (comOrderDetails) {
                MongoRepo_1.MongoRepo.getInstance().insertDocuments('ComOrderDetails', comOrderDetails, (() => {
                    console.log('saved into mongo');
                }));
            }
            else {
                console.log('nothing to save');
            }
        }
        catch (err) {
            console.log(err);
        }
    }
}
exports.ComOrderEventsService = ComOrderEventsService;
function translate(event) {
    const list = new Array();
    if (!event.OrderList) {
        console.log('no orders on this event, skipping');
        return null;
    }
    for (const order of event.OrderList[0].Order) {
        const orderDetailsDTO = new ComOrderDetailsDTO_1.ComOrderDetailsDTO();
        orderDetailsDTO.lastUpdatedTS = new Date();
        orderDetailsDTO.customerOrderNumber = order.Extn[0]._attributes.ExtnHostOrderReference;
        orderDetailsDTO.orderedDate = new Date(order._attributes.OrderDate);
        orderDetailsDTO.email = order.PersonInfoBillTo[0]._attributes.EMailID;
        orderDetailsDTO.po = order.Extn[0]._attributes.ExtnPONumber;
        const shipTo = new ComOrderDetailsDTO_1.LocationDTO();
        shipTo.addressLineOne = order.PersonInfoShipTo[0]._attributes.AddressLine1;
        shipTo.city = order.PersonInfoShipTo[0]._attributes.City;
        shipTo.zip = order.PersonInfoShipTo[0]._attributes.ZipCode;
        shipTo.state = order.PersonInfoShipTo[0]._attributes.State;
        orderDetailsDTO.shipTo = shipTo;
        orderDetailsDTO.lineItems = new Array();
        for (const orderLine of order.OrderLines[0].OrderLine) {
            if (orderLine._attributes.DeliveryMethod == "SHP") {
                const lineItem = new ComOrderDetailsDTO_1.LineItemDTO();
                lineItem.skuDescription = orderLine.Item[0]._attributes.ItemDesc;
                lineItem.omsID = orderLine.Extn[0]._attributes.ExtnOMSID;
                lineItem.sku = orderLine.Extn[0]._attributes.ExtnSKUCode;
                lineItem.quantity = orderLine._attributes.OrderedQty;
                if (orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes) {
                    lineItem.expectedDeliveryDate = new Date(orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes.ExpectedDeliveryDate);
                }
                lineItem.comStatus = lodash_1.get(orderLine, 'orderLine.OrderStatuses[0].OrderStatus[0]._attributes.StatusDescription');
                lineItem.levelOfService = lodash_1.get(orderLine, 'orderLine.Extn[0].HDOnlineProductList[0].HDOnlineProduct[0]._attributes.LevelOfServiceDesc');
                if (orderLine.Extn[0].HDTrackingInfoList && orderLine.Extn[0].HDTrackingInfoList[0].HDTrackingInfo) {
                    lineItem.trackingNumber = orderLine.Extn[0].HDTrackingInfoList[0].HDTrackingInfo[0]._attributes.TrackingNumber;
                    lineItem.scac = orderLine.Extn[0].HDTrackingInfoList[0].HDTrackingInfo[0]._attributes.SCAC;
                }
                if (lineItem.trackingNumber) {
                    orderDetailsDTO.lineItems.push(lineItem);
                }
            }
        }
        if (orderDetailsDTO.lineItems.length > 0) {
            list.push(orderDetailsDTO);
        }
    }
    return list;
}