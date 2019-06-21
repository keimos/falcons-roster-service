import { MongoRepo } from "../repo/MongoRepo";

import log from '../logging/Log';

export class ComOrderDetailService {
    constructor(private mongoRepo: MongoRepo) {}

    public async getOrderDetailByCustomerOrderNumber(customerOrderNum: string) {
        log.info(`customerOrderNumber: ${customerOrderNum}`);
        const obj = await this.mongoRepo.readDocuments({"customerOrderNumber": customerOrderNum}, [['lastUpdatedTS', -1]], 'ComOrderDetails');
        log.info(obj);
        return obj;
    }
}