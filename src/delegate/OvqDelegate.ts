import { RestTemplate } from "../common/RestTemplate";
import log from '../logging/Log';
import { readFileSync } from 'fs';

export class OvqDelegate {
    private body: string;

    constructor() {
        this.body = readFileSync('src/config/OVQOrderDetailsTemplate.txt').toString();
    }
    public async getOrderDetails(customerOrderNumber: string){
        const uri = process.env.OVQ_URL
        const headers = {Authorization: process.env.OVQ_Token}

        let response;
        try{
            response = await RestTemplate.postToExternalSource(uri, this.body,  headers);
            response = JSON.parse(response);
        } catch (err) {
            log.error(`failed to call OVQ COM: ${err}`);
        }
        return response.data.order.OrderList;
    }

}