import { KafkaService } from "../common/KafkaService";
import { ComOrderDetailsDTO, LocationDTO, LineItemDTO } from "../dto/ComOrderDetailsDTO";
import { MongoRepo } from "../repo/MongoRepo";
import { ComEventDTO } from "../dto/ComEventDTO";

import { get } from "lodash";
import { ComOrderEventTranslator } from "../translator/ComOrderEventTranslator";
import { NewRelicMetricLogger } from "../logging/NewRelicMetricLogger";
var convert = require('xml-js');

export class ComOrderEventsService {
    private newrelic: NewRelicMetricLogger;
    constructor(private kafkaService: KafkaService) {
        this.newrelic = new NewRelicMetricLogger();
    }

    public loadEvents(topic: string) {
        this.kafkaService.readFromQueue(topic, this.processEvent);
    }


    public processEvent(message: any) {
        if(this.newrelic.cloud) {
            this.newrelic.newrelic.startBackgroundTransaction('processEvent', 'processEvent', this.processEvent);
        }
        const jsonEvent = convert.xml2json(message.value, { compact: true, spaces: 4, alwaysArray: true });
        const eventObj = JSON.parse(jsonEvent);

        logEvents(message.value, jsonEvent, eventObj);
        
        try {
            const comOrderDetails: Array<ComOrderDetailsDTO> = ComOrderEventTranslator.translate(eventObj);
            if (comOrderDetails.length > 0) {
                // console.log(comOrderDetails);
                MongoRepo.getInstance().insertDocuments('ComOrderDetails', comOrderDetails, (() => {
                    // console.log('saved into mongo');
                }));
            } else {
                // console.log('nothing to save');
            }
        } catch (err) {
            console.log(err);
        }
    }
}

function logEvents(xml: string, json: string, comObj: any) {
    if (process.env.logToDB || process.env.logToDB === 'true') {
        const obj = {
            obj: comObj,
            lastUpdatedTS: new Date()
        }
        MongoRepo.getInstance().insertDocuments('newRawlog_ComOrderDetails', [obj], (() => {
        // console.log('saved log into mongo');
        }));
    }
    // console.log('')
    // console.log('*************XMLBODY***********');
    // console.log(xml);
    // console.log('*************JSONBODY***********');
    // console.log(json);
    // console.log('*******************************');
    // console.log('*******************************');
    // console.log('')
    // console.log('')
}