"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var convert = require('xml-js');
class ComOrderEventsService {
    constructor(kafkaService) {
        this.kafkaService = kafkaService;
    }
    loadEvents() {
        console.log('init loadEvents');
        this.kafkaService.readFromQueue('COMOrderRecallPublish', this.printEvents);
    }
    printEvents(message) {
        var result1 = convert.xml2json(message.value, { compact: true, spaces: 4, alwaysArray: true });
        result1 = JSON.parse(result1);
        const comOrderDetails = translate(result1);
        console.log(comOrderDetails);
    }
}
exports.ComOrderEventsService = ComOrderEventsService;
function translate(event) {
    if (event.OrderList[0].Order[0]) {
        try {
            if (event.OrderList[0].Order[0].OrderLines[0].OrderLine[0]._attributes.FulfillmentType != "STH") {
                console.log(event.OrderList[0].Order[0].OrderLines[0].OrderLine[0]._attributes.FulfillmentType);
                return null;
            }
        }
        catch (err) {
            console.log(err);
        }
        const orderDetailsDTO = new ComOrderDetailsDTO();
        orderDetailsDTO.customerOrderNumber = event.OrderList[0].Order[0].Extn[0]._attributes.ExtnHostOrderReference;
        orderDetailsDTO.orderedDate = event.OrderList[0].Order[0]._attributes.OrderDate;
        const shipTo = new LocationDTO();
        shipTo.streetLineOne = event.OrderList[0].Order[0].PersonInfoShipTo[0]._attributes.AddressLine1;
        shipTo.city = event.OrderList[0].Order[0].PersonInfoShipTo[0]._attributes.City;
        shipTo.zip = event.OrderList[0].Order[0].PersonInfoShipTo[0]._attributes.ZipCode;
        shipTo.state = event.OrderList[0].Order[0].PersonInfoShipTo[0]._attributes.State;
        orderDetailsDTO.shipTo = shipTo;
        orderDetailsDTO.lineItems = new Array();
        for (const orderLine of event.OrderList[0].Order[0].OrderLines) {
            const lineItem = new LineItemDTO();
            lineItem.desc = orderLine.OrderLine[0].Item[0].ItemDesc;
            lineItem.omsID = orderLine.OrderLine[0].Extn[0]._attributes.ExtnOMSID;
            lineItem.sku = orderLine.OrderLine[0].Extn[0]._attributes.ExtnSKUCode;
            orderDetailsDTO.lineItems.push(lineItem);
        }
        console.log(event.OrderList[0].Order[0].OrderLines[0].OrderLine[0].Extn[0].HDTrackingInfoList);
        if (event.OrderList[0].Order[0].OrderLines[0].OrderLine[0].Extn[0].HDTrackingInfoList[0].HDTrackingInfo) {
            orderDetailsDTO.trackingNumber = event.OrderList[0].Order[0].OrderLines[0].OrderLine[0].Extn[0].HDTrackingInfoList[0].HDTrackingInfo.TrackingNumber;
            orderDetailsDTO.scac = event.OrderList[0].Order[0].OrderLines[0].OrderLine[0].Extn[0].HDTrackingInfoList[0].HDTrackingInfo.SCAC;
        }
        return orderDetailsDTO;
    }
}
class ComOrderDetailsDTO {
}
exports.ComOrderDetailsDTO = ComOrderDetailsDTO;
class LocationDTO {
}
exports.LocationDTO = LocationDTO;
class LineItemDTO {
}
exports.LineItemDTO = LineItemDTO;