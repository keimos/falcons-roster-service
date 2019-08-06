import { RestTemplate } from "../common/RestTemplate";
import log from '../logging/Log';

export class OvqDelegate {
    public async getOrderDetails(customerOrderNumber: string){
        const uri = process.env.OVQ_URL
        const body = `{order(id: "${customerOrderNumber}") { OrderList { Order { DocumentType Extn { HDSplOrdList { `+
                    'HDSplOrd { SplOrdExpectedArrivalDate }}, ExtnPONumber, ExtnHostOrderReference} '+
                    'PersonInfoBillTo { EMailID } PersonInfoShipTo { AddressLine1, City, ZipCode, State } '+
                    'OrderDate OrderLines { OrderLine { OrderStatuses { OrderStatus {StatusDate, '+
                    'StatusDescription }} OrderedQty Extn { ExtnOMSID, ExtnSKUCode } '+
                    'ShipNode Item { ItemDesc, UnitCost} Extn { HDTrackingInfoList { '+
                    'HDTrackingInfo { TrackingNumber, SCAC, LevelOfService, TrackingType }}}}}}}';
        const headers = {Authorization: process.env.OVQ_Token}

        let response;
        try{
            response = await RestTemplate.postToExternalSource(uri, body,  headers);
            response = JSON.parse(response);
        } catch (err) {
            log.error(`failed to call OVQ COM: ${err}`);
        }
        return response.data.order.OrderList;
    }

}