// import { fail } from 'assert';
// import * as chai from 'chai';
// import { KafkaClient, Producer } from 'kafka-node';
// import { before } from 'mocha';
// import * as randomstring from 'randomstring';
// import { match, SinonSpy, SinonStub, spy, stub } from 'sinon';
// import { KafkaFactory } from './KafkaFactory';
// import { KafkaService } from './KafkaService';

// import { EventEmitter } from 'events';

// const expect = chai.expect;

// describe('Class: KafkaFactory', () => {

//     let kafkaFactory: KafkaFactory;
//     let createKafkaClientStub: SinonStub;

//     describe('function: createClient()', () => {
//         describe('Given a host, when createClient() is called successfully, then it', () => {
//             before(() => {
//                 kafkaFactory = new KafkaFactory();
//                 createKafkaClientStub = stub(kafkaFactory, 'createKafkaClient');
//                 const readyFakeKafkaClient = new FakeKafkaClient('ready');
//                 createKafkaClientStub.returns(readyFakeKafkaClient);

//                 stub(readyFakeKafkaClient, 'on');

//             });
//             it('should return a live kafkaClient', () => {
//                 // TODO
//             });
//         });
//         describe('Given a host, when createClient() is called and fails, then it', () => {
//             it('should return an error');
//         });
//     });

//     describe('function: createProducer()', () => {
//         describe('Given a kafkaClient, when createProducer() is called, then it', () => {
//             it('should return a producer');
//         });
//     });
// });

// class FakeKafkaClient extends KafkaClient {

//     constructor(private eventName: string) {
//         super({});
//     }

//     // private eventCallbacks: any = {};

//     public on(eventName: 'brokersChanged' | 'close' | 'connect' | 'ready' | 'reconnect' | 'zkReconnect', cb: () => any): this {

//         // callback();
//         // // this.eventCallbacks[eventName] =  callback;
//         const event: EventEmitter = new EventEmitter();
//         event.emit(this.eventName);
//         return this;
//     }

//     // public emit(eventName: string) {
//     //     this.eventCallbacks[eventName]();
//     // }

// }
