import { KafkaService } from "../common/KafkaService";
var convert = require('xml-js');

export class ComOrderEventsService {
    constructor(private kafkaService: KafkaService){}

    public loadEvents() {
        console.log('init loadEvents');
        this.kafkaService.readFromQueue('COMOrderRecallPublish', this.printEvents);
    }


    private printEvents(message: any) {
        // console.log(message.value);
        var result1 = convert.xml2json(message.value, {compact: true, spaces: 4, alwaysArray: true});
        // console.log('*************BODY***********');
        // console.log(result1);
        // console.log('*******************************');
        result1 = JSON.parse(result1);
        const comOrderDetails = translate(result1);
        console.log(comOrderDetails);
        // var result1 = convert.xml2json(message, {compact: true, spaces: 4});
    }
}

function translate(event: any) {
    if (event.OrderList[0].Order[0]) {
        try {
            if ( event.OrderList[0].Order[0].OrderLines[0].OrderLine[0]._attributes.FulfillmentType != "STH" ) {
                console.log(event.OrderList[0].Order[0].OrderLines[0].OrderLine[0]._attributes.FulfillmentType)
                return null;
            }
        } catch (err) {
            console.log(err);
            // console.log('######### START ##########');
            // console.log(JSON.stringify(event));
            // console.log('######################');
        }
        const orderDetailsDTO: ComOrderDetailsDTO = new ComOrderDetailsDTO();
        orderDetailsDTO.customerOrderNumber = event.OrderList[0].Order[0].Extn[0]._attributes.ExtnHostOrderReference;
        orderDetailsDTO.orderedDate = event.OrderList[0].Order[0]._attributes.OrderDate;

        const shipTo: LocationDTO = new LocationDTO();
        shipTo.streetLineOne = event.OrderList[0].Order[0].PersonInfoShipTo[0]._attributes.AddressLine1;
        shipTo.city = event.OrderList[0].Order[0].PersonInfoShipTo[0]._attributes.City;
        shipTo.zip = event.OrderList[0].Order[0].PersonInfoShipTo[0]._attributes.ZipCode;
        shipTo.state = event.OrderList[0].Order[0].PersonInfoShipTo[0]._attributes.state;

        orderDetailsDTO.shipTo = shipTo;

        orderDetailsDTO.lineItems = new Array();
        for (const orderLine of event.OrderList[0].Order[0].OrderLines ) {
            const lineItem: LineItemDTO = new LineItemDTO();
            lineItem.desc = orderLine.OrderLine[0].Item[0].ItemDesc;
            lineItem.omsID = orderLine.OrderLine[0].Extn[0]._attributes.ExtnOMSID
            lineItem.sku = orderLine.OrderLine[0].Extn[0]._attributes.ExtnSKUCode;

            orderDetailsDTO.lineItems.push(lineItem);
        }

        return orderDetailsDTO;
    }
}


export class ComOrderDetailsDTO {
    public customerOrderNumber;
    public orderedDate;
    public shipTo: LocationDTO;
    public lineItems: Array<LineItemDTO>;
}

export class LocationDTO {
    public streetLineOne: string;
    public city: string;
    public state: string;
    public zip: string;
}

export class LineItemDTO {
    public sku: string;
    public desc: string;
    public omsID: string;
}