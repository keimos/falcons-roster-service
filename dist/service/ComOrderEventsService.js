"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoRepo_1 = require("../repo/MongoRepo");
const ComOrderEventTranslator_1 = require("../translator/ComOrderEventTranslator");
var convert = require('xml-js');
class ComOrderEventsService {
    constructor(kafkaService) {
        this.kafkaService = kafkaService;
    }
    loadEvents(topic) {
        this.kafkaService.readFromQueue(topic, this.processEvent);
    }
    processEvent(message) {
        const jsonEvent = convert.xml2json(message.value, { compact: true, spaces: 4, alwaysArray: true });
        const eventObj = JSON.parse(jsonEvent);
        try {
            const comOrderDetails = ComOrderEventTranslator_1.ComOrderEventTranslator.translate(eventObj);
            if (comOrderDetails.length > 0) {
                MongoRepo_1.MongoRepo.getInstance().insertDocuments('ComOrderDetails', comOrderDetails, (() => {
                }));
            }
            else {
            }
        }
        catch (err) {
            console.log(err);
        }
    }
}
exports.ComOrderEventsService = ComOrderEventsService;
function logEvents(xml, json, obj) {
    MongoRepo_1.MongoRepo.getInstance().insertDocuments('rawlog_ComOrderDetails', [obj], (() => {
    }));
}