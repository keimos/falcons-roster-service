import { MongoRepo } from "../repo/MongoRepo";

import log from '../logging/Log';
import { OvqDelegate } from "../delegate/OvqDelegate";
import { ComOrderEventTranslator } from "../translator/ComOrderEventTranslator";
import { OvqOrderListDTO } from "../dto/ComOvqDTO";
import {ComOrderDetailsDTO, LineItemDTO} from "../dto/ComOrderDetailsDTO";
import { SystemError } from "../error/SystemError";
import { BusinessError } from "../error/BusinessError";
import { ErrorCode } from "../utils/error-codes-enum";
import httpstatus = require('http-status');
import NodeCache = require("node-cache");

export class ComOrderDetailService {
    constructor(private mongoRepo: MongoRepo, private cache: NodeCache, private ovqDelegate: OvqDelegate, private translator: ComOrderEventTranslator) {}

    public async getOrderDetailByCustomerOrderNumberAndTrackingNumber(customerOrderNum: string, trackingNumber: string) {
        let order: ComOrderDetailsDTO = await this.getOrderDetailFromDB(customerOrderNum, trackingNumber);

        if (order === null && customerOrderNum) {
            try {
                order = await this.getOrderDetailFromOVQ(customerOrderNum, trackingNumber);
            } catch(err) {
                if(err instanceof SystemError) {
                    throw new BusinessError(ErrorCode.NOT_FOUND, 'Order Details Not Found', `Order Details for customer order number ${customerOrderNum} and tracking number ${trackingNumber} not found`)
                }
                throw err
            }
        }
        // depending on scac, call a service to get the trackingurl from mongoDB - scac_tracking_url
        if(order && order.lineItems != undefined) {
            let items = order.lineItems;
            for (const lineItem of items) {
                if (!lineItem.tracking) {
                    continue;
                }
                for (const tracking of lineItem.tracking) {
                    if (tracking.scac) {
                        let trackerUrl: string;
                        try{
                            trackerUrl = await this.getTrackerUrlsByScac(tracking.scac);
                        } catch(err) {
                            if(err instanceof SystemError) {
                                throw new BusinessError(ErrorCode.NOT_FOUND, 'Tracking Urls  Not Found', `SCAC Tracking URL for  ${tracking.scac} not found`)
                            }
                            throw err
                        }
                        if(trackerUrl) {
                            tracking.trackingUrl = trackerUrl
                        }
                    }
                }
            }
        }
        return order;
    }

    public async getOrderDetailFromDB(customerOrderNum: string, trackingNumber: string) {
        let query;
        if (customerOrderNum && trackingNumber) {
            query = { "customerOrderNumber": customerOrderNum, "lineItems.tracking.trackingNumber": trackingNumber };
        } else if (trackingNumber) {
            query = { "lineItems.tracking.trackingNumber": trackingNumber };
        } else if (customerOrderNum) {
            query = { "customerOrderNumber": customerOrderNum };
        }
        let obj: ComOrderDetailsDTO = await this.mongoRepo.readDocuments('ComOrderDetails', query, [['lastUpdatedTS', -1]]);
        return obj
    }

    private async getOrderDetailFromOVQ(customerOrderNum: string, trackingNumber: string) {
        let obj: ComOrderDetailsDTO = new ComOrderDetailsDTO()
        let ovqObj: OvqOrderListDTO = await this.ovqDelegate.getOrderDetails(customerOrderNum);
        const orderDetails: ComOrderDetailsDTO = this.translator.translate(ovqObj);

        if (trackingNumber) {
            for (const lineItem of orderDetails.lineItems) {
                for (const tracking of lineItem.tracking) {
                    if (tracking.trackingNumber === trackingNumber) {
                        return orderDetails
                    }
                }
            }
        }
        return obj;
    }

    public async getTrackerUrlsByScac(scac: string) {
        let trackingUrl: string = this.cache.get(scac)
        if(!trackingUrl){
            let query = {"scac": scac};
            const obj = await this.mongoRepo.readDocuments('scacTrackingUrls', query, [['createTS', -1]], {trackingUrl: 1, _id: 0});
            if(obj && obj.trackingUrl){
                trackingUrl = obj.trackingUrl
                this.cache.set(scac, obj.trackingUrl, 43200)
            }
        }
        return trackingUrl
    }
}