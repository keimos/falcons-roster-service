"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const ServiceLog_1 = require("./logging/ServiceLog");
class App {
    constructor() {
        this.initRoutes = () => {
        };
        this.express = express();
        this.express.use(bodyParser({ limit: '50000mb' }));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        ServiceLog_1.default.init(this.express, this.initRoutes);
    }
}
exports.App = App;