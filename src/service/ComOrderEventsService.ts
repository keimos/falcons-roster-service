import { KafkaService } from "../common/KafkaService";
import { ComOrderDetailsDTO, LocationDTO, LineItemDTO } from "../dto/ComOrderDetailsDTO";
import { MongoRepo } from "../repo/MongoRepo";
import { ComEventDTO } from "../dto/ComEventDTO";

import { get } from "lodash";
var convert = require('xml-js');

export class ComOrderEventsService {
    constructor(private kafkaService: KafkaService) {
    }

    public loadEvents() {
        console.log('init loadEvents');
        this.kafkaService.readFromQueue('COMOrderRecallPublish', this.processEvent);
    }


    private processEvent(message: any) {
        const jsonEvent = convert.xml2json(message.value, { compact: true, spaces: 4, alwaysArray: true });
        const eventObj = JSON.parse(jsonEvent);

        logEvents(message.value, jsonEvent, eventObj);
        
        try {
            const comOrderDetails = translate(eventObj);
            if (comOrderDetails) {
                // console.log(comOrderDetails);
                MongoRepo.getInstance().insertDocuments('ComOrderDetails', comOrderDetails, (() => {
                    console.log('saved into mongo');
                }));
            } else {
                console.log('nothing to save');
            }
        } catch (err) {
            console.log(err);
        }
    }
}

function translate(event: ComEventDTO): Array<ComOrderDetailsDTO> {

    const list: Array<any> = new Array();
    if (!event.OrderList) {
        console.log('no orders on this event, skipping')
        return null;
    }
    for (const order of event.OrderList[0].Order) {
        const orderDetailsDTO: ComOrderDetailsDTO = new ComOrderDetailsDTO();
        orderDetailsDTO.lastUpdatedTS = new Date();
        orderDetailsDTO.customerOrderNumber = order.Extn[0]._attributes.ExtnHostOrderReference;
        orderDetailsDTO.orderedDate = new Date(order._attributes.OrderDate);
        orderDetailsDTO.email = order.PersonInfoBillTo[0]._attributes.EMailID;
        orderDetailsDTO.po = order.Extn[0]._attributes.ExtnPONumber;


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
                lineItem.omsID = orderLine.Extn[0]._attributes.ExtnOMSID
                lineItem.sku = orderLine.Extn[0]._attributes.ExtnSKUCode;
                lineItem.quantity = orderLine._attributes.OrderedQty;

                if (orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes) {
                    lineItem.expectedDeliveryDate = new Date(orderLine.OrderStatuses[0].OrderStatus[0].Details[0]._attributes.ExpectedDeliveryDate);
                }
                lineItem.comStatus = get(orderLine, 'orderLine.OrderStatuses[0].OrderStatus[0]._attributes.StatusDescription');

                lineItem.levelOfService = get(orderLine, 'orderLine.Extn[0].HDOnlineProductList[0].HDOnlineProduct[0]._attributes.LevelOfServiceDesc');

                if (orderLine.Extn[0].HDTrackingInfoList && orderLine.Extn[0].HDTrackingInfoList[0].HDTrackingInfo) {
                    lineItem.trackingNumber = orderLine.Extn[0].HDTrackingInfoList[0].HDTrackingInfo[0]._attributes.TrackingNumber;
                    lineItem.scac = orderLine.Extn[0].HDTrackingInfoList[0].HDTrackingInfo[0]._attributes.SCAC;
                }

                // we only want to capture events that have tracking numbers.
                if (lineItem.trackingNumber) {
                    orderDetailsDTO.lineItems.push(lineItem);
                }
            }
        }

        /*
            if no line items were translated, then that means that no line item was STH.  
            We only want to save orders to the array that are STH.
        */
        if (orderDetailsDTO.lineItems.length > 0) {
            list.push(orderDetailsDTO);
        }

    }

    return list;
}


function logEvents(xml: string, json: string, obj: any) {
    MongoRepo.getInstance().insertDocuments('rawlog_ComOrderDetails', [obj], (() => {
        console.log('saved log into mongo');
    }));
    // console.log('')
    // console.log('*************XMLBODY***********');
    // console.log(xml);
    // console.log('*************JSONBODY***********');
    // console.log(json);
    // console.log('*******************************');
    // console.log('*******************************');
    // console.log('')
    // console.log('')
}