"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("../logging/Log");
class MessageQueueService {
    sendObjects(topicName, listOfObjects) {
        return __awaiter(this, void 0, void 0, function* () {
            Log_1.default.info(`Sending [${listOfObjects.length}] events to [${topicName}].`);
            if (!listOfObjects.length) {
                return;
            }
            const stringifiedObjects = this.stringifyObjects(listOfObjects);
            yield this.postToQueue(topicName, stringifiedObjects);
        });
    }
    stringifyObjects(arrayOfObjects) {
        if (!arrayOfObjects || !arrayOfObjects.length) {
            return null;
        }
        const stringifiedObjects = new Array(arrayOfObjects.length);
        for (let i = 0, iLen = arrayOfObjects.length; i < iLen; i++) {
            stringifiedObjects[i] = JSON.stringify(arrayOfObjects[i]);
        }
        return stringifiedObjects;
    }
}
exports.MessageQueueService = MessageQueueService;