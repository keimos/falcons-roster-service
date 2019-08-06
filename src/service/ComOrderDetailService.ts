import { MongoRepo } from "../repo/MongoRepo";

import log from '../logging/Log';
import { OvqDelegate } from "../delegate/OvqDelegate";
import { ComOrderEventTranslator } from "../translator/ComOrderEventTranslator";
import { OvqOrderListDTO } from "../dto/ComOvqDTO";
import { ComOrderDetailsDTO } from "../dto/ComOrderDetailsDTO";

export class ComOrderDetailService {
    constructor(private mongoRepo: MongoRepo, private ovqDelegate: OvqDelegate, private translator: ComOrderEventTranslator) {}

    public async getOrderDetailByCustomerOrderNumberAndTrackingNumber(customerOrderNum: string, trackingNumber: string) {
        log.info(`customerOrderNumber: ${customerOrderNum} & trackingNumber: ${trackingNumber}`);
        
        let orders: Array<ComOrderDetailsDTO> = await this.getOrderDetailFromMongoCache(customerOrderNum, trackingNumber);
        log.debug(orders);

        if (orders.length === 0 && customerOrderNum) {
            orders = await this.getOrderDetailFromOVQ(customerOrderNum, trackingNumber);
        }
        return orders;
    }

    public async getOrderDetailFromMongoCache(customerOrderNum: string, trackingNumber: string) {
        let query;
        if (customerOrderNum && trackingNumber) {
            query = { "customerOrderNumber": customerOrderNum, "lineItems.trackingNumber": trackingNumber };
        } else if (trackingNumber) {
            query = { "lineItems.trackingNumber": trackingNumber };
        } else if (customerOrderNum) {
            query = { "customerOrderNumber": customerOrderNum };
        }
        let obj: Array<ComOrderDetailsDTO> = await this.mongoRepo.readDocuments(query, [['lastUpdatedTS', -1]], 'ComOrderDetails');

        return obj;
    }

    private async getOrderDetailFromOVQ(customerOrderNum: string, trackingNumber: string) {
        let obj: Array<ComOrderDetailsDTO> = new Array();
        let ovqObj: OvqOrderListDTO = await this.ovqDelegate.getOrderDetails(customerOrderNum);
        const orderDetails: ComOrderDetailsDTO = this.translator.translate(ovqObj);

        if (trackingNumber) {
            for (const lineItem of orderDetails.lineItems) {
                if (lineItem.trackingNumber === trackingNumber) {
                    obj = [orderDetails];
                    break;
                }
            }
        }
        return obj;
    }
    
}