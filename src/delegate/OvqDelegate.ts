import { RestTemplate } from "../common/RestTemplate";
import log from '../logging/Log';
import { readFileSync } from 'fs';
import { sprintf } from 'sprintf-js';
import { SystemError } from "../error/SystemError";
import { ErrorCode } from "../utils/error-codes-enum";

export class OvqDelegate {
    private body: string;

    constructor() {
        this.body = readFileSync('src/config/OVQOrderDetailsTemplate.txt').toString();
    }
    public async getOrderDetails(customerOrderNumber: string){
        const uri = process.env.OVQ_URL
        const headers = {Authorization: process.env.OVQ_Token}
        this.body = sprintf(this.body, customerOrderNumber)  

        let response;
        try{
            response = await RestTemplate.postToExternalSource(uri, this.body,  headers);
            response = JSON.parse(response);
        } catch (err) {
            log.error(`failed to call OVQ COM: ${err}`);
        }

        if(response.data.order.OrderList == null) {
            throw new SystemError(ErrorCode.NOT_FOUND, 'Not Found Error', `Can not find customer order ${customerOrderNumber} in OVQ`);
        }

        return response.data.order.OrderList;
    }

}