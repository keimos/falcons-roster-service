"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const CryptoJS = require("crypto-js");
class MongoService {
    constructor() {
        this.url = process.env.MONGO_URI;
        this.dbName = process.env.MONGO_DB;
        this.encrypted = process.env.MONGO_ENCRYPTED;
    }
    getConnection() {
        return new Promise((resolve, reject) => {
            const dbName = this.dbName;
            const plainTextUrl = this.decrypt(this.url);
            this.client = new MongoClient(plainTextUrl);
            this.client.connect(function (err, client) {
                assert.equal(null, err);
                console.log("Connected successfully to server");
                const db = client.db(dbName);
                resolve(db);
            });
        });
    }
    insertDocuments(db, collectionName, data, callback) {
        const collection = db.collection(collectionName);
        collection.insertMany(data, function (err, result) {
            console.log("Inserted documents into the collection");
            callback(result);
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
exports.MongoService = MongoService;