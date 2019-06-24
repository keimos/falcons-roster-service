import * as bodyParser from 'body-parser';
import * as express from 'express';

import serviceLog from './logging/ServiceLog';
import { COMOrderDetailController } from './controller/ComOrderDetailController';

/**
 * Main application class. Initializes routes and controllers.
 */
export class App {

    // Main Express application
    public express: express.Application;

    /**
     * Construct and initialize the application.
     */
    constructor(private comOrderDetailController: COMOrderDetailController) {
        this.express = express();
        this.express.use(bodyParser({ limit: '50000mb' }));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));

        serviceLog.init(this.express, this.initRoutes);
    }

    /**
     * Initialize the routes and controllers.
     */
    public initRoutes = () => {
        // ## Add new routes and controllers here ##
        this.express.use('/api/', this.comOrderDetailController.router);
    }
}
