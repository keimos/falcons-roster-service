import { Request, Response, Router, NextFunction } from "express";
import { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR } from 'http-status';

import serviceLog from '../logging/ServiceLog';


import log from '../logging/Log';
import { ComOrderDetailService } from "../service/ComOrderDetailService";
import { BADFAMILY } from "dns";
import { SystemError } from "../error/SystemError";
import { ErrorCode } from "../utils/error-codes-enum";

export class COMOrderDetailController {
    public router: Router;

    constructor(private comOrderDetailService: ComOrderDetailService) {
        this.initRoutes();
    }
    /**
     * Initialze the routes for this controller.
     */
    public initRoutes() {
        this.router = Router();
        this.router.get('/v1/orders', this.getOrderDetails);
    }

    private getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
        const customerOrderNumber = req.query.customerOrderNumber;
        try {
            if (customerOrderNumber){
                const orderDetail = await this.comOrderDetailService.getOrderDetailByCustomerOrderNumber(customerOrderNumber);
                res.status(OK);
                this.returnResponse(orderDetail, res, next);
            }else{
                const err: SystemError = new SystemError(ErrorCode.INVALID_REQUEST, 'customerOrderNumber', 'can not be null');
                throw err;
            }
        } catch (err) {
            next(err);
        }
    }

    /**
     * Completes the service call and Returns the HTTP response body.
     *
     * @param responseBody The response object to return to the client
     * @param res The HTTP response
     * @param next The next (Express) function in the chain
     */
    private returnResponse(responseBody: any, res: Response, next: NextFunction) {

        // Used to log the response in Log
        serviceLog.setResponseBody(responseBody);

        // Send the response
        res.send(responseBody);
        next();
    }
}