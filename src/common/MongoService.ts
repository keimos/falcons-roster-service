const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

import * as CryptoJS from 'crypto-js';

export class MongoService {
  // Connection URL
  public url = process.env.MONGO_URI;

  // Database Name
  public dbName = process.env.MONGO_DB;

  public encrypted = process.env.MONGO_ENCRYPTED;

  public client: any;

  public getConnection() {
    // Use connect method to connect to the server
    return new Promise<any>((resolve, reject) => {
      const dbName = this.dbName;

      const plainTextUrl = this.decrypt(this.url);
      this.client = new MongoClient(plainTextUrl);
      this.client.connect(function (err: any, client: any) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);
        resolve(db);
      });
    });
  }

  public insertDocuments(db: any, collectionName: string, data: Array<any>, callback: any) {
    // Get the documents collection
    const collection = db.collection(collectionName);
    // Insert some documents
    collection.insertMany(data, function (err: any, result: any) {
      console.log("Inserted documents into the collection");
      callback(result);
    });
    // db.close();
  }

  public closeConnection() {
    this.client.close();
  }

  private decrypt(text: string) {
    if (this.encrypted && this.encrypted === "true"){
      const bytes = CryptoJS.AES.decrypt(text, 'myKey');
      const plaintext = bytes.toString(CryptoJS.enc.Utf8);
      // console.log('token: ' + plaintext);
      return plaintext;
    } else {
      return text;
    }
  }

}

