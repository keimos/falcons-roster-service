import { MongoRepo } from "../repo/MongoRepo";

import log from '../logging/Log';
import { OvqDelegate } from "../delegate/OvqDelegate";
import { ComOrderEventTranslator } from "../translator/ComOrderEventTranslator";
import { OvqOrderListDTO } from "../dto/ComOvqDTO";
import { ComOrderDetailsDTO } from "../dto/ComOrderDetailsDTO";
import { SystemError } from "../error/SystemError";
import { BusinessError } from "../error/BusinessError";
import { ErrorCode } from "../utils/error-codes-enum";
import httpstatus = require('http-status');

export class ComOrderDetailService {
    constructor(private mongoRepo: MongoRepo, private ovqDelegate: OvqDelegate, private translator: ComOrderEventTranslator) {}

    public async getOrderDetailByCustomerOrderNumberAndTrackingNumber(customerOrderNum: string, trackingNumber: string) {
        log.info(`customerOrderNumber: ${customerOrderNum} & trackingNumber: ${trackingNumber}`);
        
        let order: ComOrderDetailsDTO = await this.getOrderDetailFromMongoCache(customerOrderNum, trackingNumber);
        log.debug(order);
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
        return order;
    }

    public async getOrderDetailFromMongoCache(customerOrderNum: string, trackingNumber: string) {
        let query;
        if (customerOrderNum && trackingNumber) {
            query = { "customerOrderNumber": customerOrderNum, "lineItems.tracking.trackingNumber": trackingNumber };
        } else if (trackingNumber) {
            query = { "lineItems.tracking.trackingNumber": trackingNumber };
        } else if (customerOrderNum) {
            query = { "customerOrderNumber": customerOrderNum };
        }
        let obj: ComOrderDetailsDTO = await this.mongoRepo.readDocuments(query, [['lastUpdatedTS', -1]], 'ComOrderDetails');
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
    
}