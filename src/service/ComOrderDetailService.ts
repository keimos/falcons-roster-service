import { MongoRepo } from "../repo/MongoRepo";

import log from '../logging/Log';

export class ComOrderDetailService {
    constructor(private mongoRepo: MongoRepo) {}

    public async getOrderDetailByCustomerOrderNumberAndTrackingNumber(customerOrderNum: string, trackingNumber: string) {
        log.info(`customerOrderNumber: ${customerOrderNum}`);
        let query;
        if(customerOrderNum && trackingNumber){
            query = {"customerOrderNumber": customerOrderNum,  "lineItems.trackingNumber": trackingNumber};
        }else if(trackingNumber){
            query = {"lineItems.trackingNumber": trackingNumber};
        }else if(customerOrderNum){
            query = {"customerOrderNumber": customerOrderNum};
        }
        const obj = await this.mongoRepo.readDocuments(query, [['lastUpdatedTS', -1]], 'ComOrderDetails');
        log.debug(obj);
        return obj;
    }
    
}