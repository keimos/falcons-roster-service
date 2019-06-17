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
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const CryptoJS = require("crypto-js");
class MongoRepo {
    constructor() {
        this.url = process.env.MONGO_URI;
        this.dbName = process.env.MONGO_DB;
        this.encrypted = process.env.MONGO_ENCRYPTED;
        this.getConnection().then((db) => {
            this.dataBase = db;
        });
    }
    static getInstance() {
        if (MongoRepo.instance) {
            return MongoRepo.instance;
        }
        else {
            MongoRepo.instance = new MongoRepo();
            return MongoRepo.instance;
        }
    }
    getConnection() {
        return new Promise((resolve, reject) => {
            const dbName = this.dbName;
            const plainTextUrl = this.decrypt(this.url);
            if (!plainTextUrl) {
                resolve(null);
                return;
            }
            this.client = new MongoClient(plainTextUrl);
            this.client.connect(function (err, client) {
                assert.equal(null, err);
                console.log("Connected successfully to server");
                const db = client.db(dbName);
                resolve(db);
            });
        });
    }
    insertDocuments(collectionName, data, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.dataBase) {
                this.dataBase = yield this.getConnection();
            }
            const collection = this.dataBase.collection(collectionName);
            collection.insertMany(data, function (err, result) {
                console.log("Inserted documents into the collection");
                callback(result);
            });
        });
    }
    readDocuments(collectionName, customerOrderNumber, carrierTrackingNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.dataBase) {
                this.dataBase = yield this.getConnection();
            }
            return new Promise((resolve, reject) => {
                const collection = this.dataBase.collection(collectionName);
                let query;
                if (customerOrderNumber && carrierTrackingNumber) {
                    query = { $and: [{ "externalSystemIds.customerOrderNumber": customerOrderNumber }, { "externalSystemIds.carrierTrackingNumber": carrierTrackingNumber }] };
                }
                else if (customerOrderNumber) {
                    query = { "externalSystemIds.customerOrderNumber": customerOrderNumber };
                }
                else if (carrierTrackingNumber) {
                    query = { "externalSystemIds.carrierTrackingNumber": carrierTrackingNumber };
                }
                const cursor = collection.find(query);
                cursor.toArray(function (err, result) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err)
                            reject(err);
                        console.log(`results: ${result.length}`);
                        yield cursor.close();
                        resolve(result);
                    });
                });
            });
        });
    }
    getEvents(query, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.dataBase) {
                this.dataBase = yield this.getConnection();
            }
            return new Promise((resolve, reject) => {
                const collection = this.dataBase.collection("trackingEvents");
                const cursor = collection.find(query, { sort: sort });
                const myInstance = this;
                cursor.toArray(function (err, results) {
                    return __awaiter(this, void 0, void 0, function* () {
                        resolve(results);
                    });
                });
            });
        });
    }
    closeConnection() {
        this.client.close();
    }
    decrypt(text) {
        if (this.encrypted && this.encrypted === "true") {
            const bytes = CryptoJS.AES.decrypt(text, 'myKey');
            const plaintext = bytes.toString(CryptoJS.enc.Utf8);
            return plaintext;
        }
        else {
            return text;
        }
    }
}
exports.MongoRepo = MongoRepo;