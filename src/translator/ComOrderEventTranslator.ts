 import { ComEventDTO } from "../dto/ComEventDTO";
import { ComOrderDetailsDTO, LocationDTO, LineItemDTO, TrackingDetailDTO, CustomerInfoDTO } from "../dto/ComOrderDetailsDTO";

import { OvqOrderListDTO, OvqOrderDTO } from "../dto/ComOvqDTO";

export class ComOrderEventTranslator {

    //this method translates the COM object found in the kafka topic
    public static translate(event: ComEventDTO): Array<ComOrderDetailsDTO> {

        const list: Array<any> = new Array();
        let containsTracking: boolean = false;
        if (!event.OrderList || event.OrderList.length === 0 || !event.OrderList[0].Order || event.OrderList[0].Order.length === 0) {
            console.log('no orders on this event, skipping')
            return new Array();
        }
        if (event.OrderList.length > 1) console.log(`***OrderList has more than one!!!: ${event.OrderList.length}`);  // I dont think this can happen, but log it to see if we ever do see it
        const orderDetailsDTO: ComOrderDetailsDTO = new ComOrderDetailsDTO();

        // we need to first find the sales order (0001), and create our base order object
        for (const order of event.OrderList[0].Order) {
            if (order._attributes.DocumentType === '0001') {
                orderDetailsDTO.lastUpdatedTS = (new Date()).toISOString();
                orderDetailsDTO.customerOrderNumber = order.Extn[0]._attributes.ExtnHostOrderReference;
                orderDetailsDTO.orderedDate = order._attributes.OrderDate;

                orderDetailsDTO.customerInfo = new CustomerInfoDTO();
                orderDetailsDTO.customerInfo.email = order.PersonInfoBillTo[0]._attributes.EMailID;
                orderDetailsDTO.customerInfo.phoneNumber = order.PersonInfoBillTo[0]._attributes.DayPhone;
                orderDetailsDTO.customerInfo.mobileNumber = order.PersonInfoBillTo[0]._attributes.MobilePhone;
                orderDetailsDTO.customerInfo.firstName = order.PersonInfoBillTo[0]._attributes.FirstName;
                orderDetailsDTO.customerInfo.middleName = order.PersonInfoBillTo[0]._attributes.MiddleName;
                orderDetailsDTO.customerInfo.lastName = order.PersonInfoBillTo[0]._attributes.LastName;


                const shipTo: LocationDTO = new LocationDTO();
                shipTo.addressLineOne = order.PersonInfoShipTo[0]._attributes.AddressLine1;
                shipTo.city = order.PersonInfoShipTo[0]._attributes.City;
                shipTo.zip = order.PersonInfoShipTo[0]._attributes.ZipCode;
                shipTo.state = order.PersonInfoShipTo[0]._attributes.State;

                orderDetailsDTO.shipTo = shipTo;

                orderDetailsDTO.lineItems = new Array();
                for (const orderLine of order.OrderLines[0].OrderLine) {

                    // we are only intrested in orders that are of type SHP, these are STH home deliveries.
                    if (orderLine._attributes.DeliveryMethod == "SHP") {
                        const lineItem: LineItemDTO = new LineItemDTO();
                        lineItem.skuDescription = orderLine.Item[0]._attributes.ItemDesc;
                        lineItem.manufacturerName = orderLine.Item[0]._attributes.ManufacturerName;
                        lineItem.omsID = orderLine.Extn[0]._attributes.ExtnOMSID;
                        lineItem.sku = orderLine.Extn[0]._attributes.ExtnSKUCode.toString();
                        lineItem.quantity = orderLine._attributes.OrderedQty.toString();

                        if (orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes) {
                            lineItem.expectedDeliveryDate = orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes.ExpectedDeliveryDate;
                        }
                        lineItem.comStatus = orderLine.OrderStatuses[0].OrderStatus[0]._attributes.StatusDescription;

                        try {
                            lineItem.levelOfServiceDesc = orderLine.Extn[0].HDOnlineProductList[0].HDOnlineProduct[0]._attributes.LevelOfServiceDesc;
                        } catch (err){}
                        orderDetailsDTO.lineItems.push(lineItem);
                    }
                }
                // theres only 1 sales order so we can break out of the loop
                break;
            }
        }

        /*
            Next we need to find each 0005 object and enrich our base order object with the tracking details found.
            Each 0005 object represents a different PO, so various lines from the sales order could be split across various 0005 objects
        */
        for (const order of event.OrderList[0].Order) {
            if (order._attributes.DocumentType === '0005') {
                for (const orderLine of order.OrderLines[0].OrderLine) {

                    // we are only intrested in orders that are of type SHP, these are STH home deliveries.
                    if (orderLine._attributes.DeliveryMethod == "SHP") {

                        var trackingArray = new Array<TrackingDetailDTO>()
                        if (orderLine.Extn[0].HDTrackingInfoList && orderLine.Extn[0].HDTrackingInfoList[0].HDTrackingInfo) {
                            for(const obj of  orderLine.Extn[0].HDTrackingInfoList[0].HDTrackingInfo){
                                var trackingObj = new TrackingDetailDTO()
                                trackingObj.scac = obj._attributes.SCAC;
                                trackingObj.trackingNumber =obj._attributes.TrackingNumber;
                                trackingObj.trackingType = obj._attributes.TrackingType;
                                trackingObj.levelOfService = obj._attributes.LevelOfService;
                                trackingArray.push(trackingObj)

                            }
                        }

                        //we need to find the correct line item from orderDetailsDTO (our base order).
                        if (trackingArray.length > 0) {
                            for (const myLine of orderDetailsDTO.lineItems) {
                                if (myLine.sku === orderLine.Extn[0]._attributes.ExtnSKUCode.toString()) {
                                    myLine.po = order.Extn[0]._attributes.ExtnPONumber;
                                    myLine.tracking = trackingArray;
                                    containsTracking = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        // we have no reason to cache the order if it doesnt have tracking details (the ASN hasnt been sent)
        if (containsTracking) {
            list.push(orderDetailsDTO);
        }

        return list;
    }

    //this method translates the COM object found in OVQ
    public translate(orders: OvqOrderListDTO): ComOrderDetailsDTO {
        const list: Array<any> = new Array();
        let containsTracking: boolean = false;

        const orderDetailsDTO: ComOrderDetailsDTO = new ComOrderDetailsDTO();

        // we need to first find the sales order (0001), and create our base order object
        for (const order of orders.Order) {
            if (order.DocumentType === '0001') {
                orderDetailsDTO.lastUpdatedTS = (new Date()).toISOString();
                orderDetailsDTO.customerOrderNumber = order.Extn.ExtnHostOrderReference;
                orderDetailsDTO.orderedDate = order.OrderDate;

                orderDetailsDTO.customerInfo = new CustomerInfoDTO();
                orderDetailsDTO.customerInfo.email = order.PersonInfoBillTo.EMailID;
                orderDetailsDTO.customerInfo.phoneNumber = order.PersonInfoBillTo.DayPhone;
                orderDetailsDTO.customerInfo.mobileNumber = order.PersonInfoBillTo.MobilePhone;
                orderDetailsDTO.customerInfo.firstName = order.PersonInfoBillTo.FirstName;
                orderDetailsDTO.customerInfo.lastName = order.PersonInfoBillTo.LastName;


                const shipTo: LocationDTO = new LocationDTO();
                shipTo.addressLineOne = order.PersonInfoShipTo.AddressLine1;
                shipTo.city = order.PersonInfoShipTo.City;
                shipTo.zip = order.PersonInfoShipTo.ZipCode;
                shipTo.state = order.PersonInfoShipTo.State;

                orderDetailsDTO.shipTo = shipTo;

                orderDetailsDTO.lineItems = new Array();
                for (const orderLine of order.OrderLines.OrderLine) {

                    // we are only intrested in orders that are of type SHP, these are STH home deliveries.
                    if (orderLine.DeliveryMethod == "SHP") {
                        const lineItem: LineItemDTO = new LineItemDTO();
                        lineItem.skuDescription = orderLine.Item.ItemDesc;
                        lineItem.omsID = orderLine.Extn.ExtnOMSID
                        lineItem.sku = orderLine.Extn.ExtnSKUCode;
                        lineItem.quantity = orderLine.OrderedQty;
                        lineItem.manufacturerName = orderLine.Item.ManufacturerName;

                        try {
                            lineItem.levelOfServiceDesc = orderLine.Extn.HDOnlineProductList.HDOnlineProduct[0].LevelOfServiceDesc;
                        } catch (err){}
                        orderDetailsDTO.lineItems.push(lineItem);
                    }
                }
                // theres only 1 sales order so we can break out of the loop
                break;
            }
        }

        /*
            Next we need to find each 0005 object and enrich our base order object with the tracking details found.
            Each 0005 object represents a different PO, so various lines from the sales order could be split across various 0005 objects
        */
        for (const order of orders.Order) {
            if (order.DocumentType === '0005') {
                for (const orderLine of order.OrderLines.OrderLine) {
                    // we are only intrested in orders that are of type SHP, these are STH home deliveries.
                    if (orderLine.DeliveryMethod == "SHP") {

                        var trackingArray = new Array<TrackingDetailDTO>()
                        if (orderLine.Extn.HDTrackingInfoList && orderLine.Extn.HDTrackingInfoList.HDTrackingInfo) {
                            for(const obj of  orderLine.Extn.HDTrackingInfoList.HDTrackingInfo){
                                var trackingObj = new TrackingDetailDTO()
                                trackingObj.scac = obj.SCAC;
                                trackingObj.trackingNumber =obj.TrackingNumber;
                                trackingObj.trackingType = obj.TrackingType;
                                trackingObj.levelOfService = obj.LevelOfService;
                                trackingArray.push(trackingObj)

                            }
                        }

                        //we need to find the correct line item from orderDetailsDTO (our base order).
                        if (trackingArray.length > 0) {
                            for (const myLine of orderDetailsDTO.lineItems) {
                                if (myLine.sku === orderLine.Extn.ExtnSKUCode) {
                                    myLine.po = order.Extn.ExtnPONumber;
                                    myLine.tracking = trackingArray;
                                    containsTracking = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        // we have no reason to cache the order if it doesnt have tracking details (the ASN hasnt been sent)
        if (containsTracking) {
            return orderDetailsDTO;
        }

        return null;
    }
}
