import log from '../logging/Log';

export abstract class MessageQueueService {

    public async sendObjects(topicName: string, listOfObjects: Array<object>): Promise<boolean> {
        // Do nothing if no objects
        log.info(`Sending [${listOfObjects.length}] events to [${topicName}].`)
        if (!listOfObjects.length) {
            return;
        }

        // Convert the objects to strings
        const stringifiedObjects: Array<string> = this.stringifyObjects(listOfObjects);

        await this.postToQueue(topicName, stringifiedObjects);
    }

    /**
     * Given a list of objects return an array of strings that is an array of each of the objects in JSON string form.
     *
     * @param arrayOfObjects
     */
    public stringifyObjects(arrayOfObjects: Array<object>): Array<string> {

        // No thing to do?
        if (!arrayOfObjects || !arrayOfObjects.length) {
            return null;
        }

        // Build the array of strings
        const stringifiedObjects: Array<string> = new Array(arrayOfObjects.length);
        for (let i = 0, iLen = arrayOfObjects.length; i < iLen; i++) {
            stringifiedObjects[i] = JSON.stringify(arrayOfObjects[i]);
        }
        return stringifiedObjects;
    }

    protected abstract postToQueue(topicName: string, stringifiedObjects: Array<string>): Promise<boolean>;
}