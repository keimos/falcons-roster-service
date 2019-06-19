"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ComOrderDetailsDTO_1 = require("../dto/ComOrderDetailsDTO");
class ComOrderEventTranslator {
    static translate(event) {
        const list = new Array();
        if (!event.OrderList || event.OrderList.length === 0 || !event.OrderList[0].Order || event.OrderList[0].Order.length === 0) {
            console.log('no orders on this event, skipping');
            return new Array();
        }
        if (event.OrderList.length > 1)
            console.log(`***OrderList has more than one!!!: ${event.OrderList.length}`);
        for (const order of event.OrderList[0].Order) {
            const orderDetailsDTO = new ComOrderDetailsDTO_1.ComOrderDetailsDTO();
            orderDetailsDTO.lastUpdatedTS = (new Date()).toISOString();
            orderDetailsDTO.customerOrderNumber = order.Extn[0]._attributes.ExtnHostOrderReference;
            orderDetailsDTO.orderedDate = order._attributes.OrderDate;
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
                        lineItem.expectedDeliveryDate = orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes.ExpectedDeliveryDate;
                    }
                    lineItem.comStatus = orderLine.OrderStatuses[0].OrderStatus[0]._attributes.StatusDescription;
                    try {
                        lineItem.levelOfService = orderLine.Extn[0].HDOnlineProductList[0].HDOnlineProduct[0]._attributes.LevelOfServiceDesc;
                    }
                    catch (err) { }
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
}
exports.ComOrderEventTranslator = ComOrderEventTranslator;