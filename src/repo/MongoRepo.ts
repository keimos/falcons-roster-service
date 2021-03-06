
import { Collection, Cursor, Db } from "mongodb";

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

import * as CryptoJS from 'crypto-js';

export class MongoRepo {
  // Connection URL
  public url = process.env.MONGO_URI;

  // Database Name
  public dbName = process.env.MONGO_DB;

  public encrypted = process.env.MONGO_ENCRYPTED;

  public client: any;

  private dataBase: Db;

  constructor() {
    this.getConnection().then((db: Db) => {
      this.dataBase = db;
    });
  }

  public static instance: any;

  public static getInstance() {
    if (MongoRepo.instance) {
      return MongoRepo.instance;
    } else {
      MongoRepo.instance = new MongoRepo();
      return MongoRepo.instance;
    }
  }

  private getConnection() {
    // Use connect method to connect to the server
    return new Promise<any>((resolve, reject) => {
      const dbName = this.dbName;

      const plainTextUrl = this.decrypt(this.url);
      if (!plainTextUrl) {
        resolve(null);
        return;
      }
      this.client = new MongoClient(plainTextUrl);
      this.client.connect(function (err: any, client: any) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);
        resolve(db);
      });
    });
  }

  public async insertDocuments(collectionName: string, data: Array<any>, callback: any) {
    if (!this.dataBase) {
      this.dataBase = await this.getConnection();
    }
    // Get the documents collection
    const collection: Collection = this.dataBase.collection(collectionName);
    // Insert some documents
    collection.insertMany(data, function (err: Error, result: any) {
      console.log("Inserted documents into the collection");
      callback(result);
    });
  }

  public async readDocuments(table: string, query: any, sort: any, fields: any = null): Promise<any> {
    if (!this.dataBase) {
      this.dataBase = await this.getConnection();
    }

    return new Promise<any>((resolve, reject) => {
      const collection: Collection = this.dataBase.collection(table);
      collection.findOne(query, { sort: sort, fields: fields }, async function(err, result) {
        if (err) throw err;
        resolve(result);
      });
    });
  }

  public closeConnection() {
    this.client.close();
  }

  private decrypt(text: string) {
    if (this.encrypted && this.encrypted === "true") {
      const bytes = CryptoJS.AES.decrypt(text, 'myKey');
      const plaintext = bytes.toString(CryptoJS.enc.Utf8);
      // console.log('token: ' + plaintext);
      return plaintext;
    } else {
      return text;
    }
  }

}