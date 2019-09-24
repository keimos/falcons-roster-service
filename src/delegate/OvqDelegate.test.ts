import * as chai from 'chai';
import chaiExclude from 'chai-exclude';
import { match, SinonSpy, spy, SinonStub, stub } from 'sinon';
import { OvqDelegate } from './OvqDelegate';
import { before } from 'mocha';
import { RestTemplate } from '../common/RestTemplate';
import { ComOrderEventTranslator } from '../translator/ComOrderEventTranslator';
import { SystemError } from '../error/SystemError';
import { ErrorCode } from '../utils/error-codes-enum';

const expect = chai.expect;
chai.use(chaiExclude);

describe('Class: OvqDelegate', () => {
    describe('Function: getOrderDetails', () => {
        describe('Given a customerOrderNumber, when the function is invoked, then', () => {
            let restTemplateStub: SinonStub
            let customerOrderNumber = "W123456321";
            let ovqDetails: String
            let ovqResponse = JSON.stringify({
                "data": {
                    "order": {
                        "OrderList": {
                            "Order": [{
                                "DocumentType": "0001"
                            }]
                        }
                    }
                }
            })

            before(async () => {
                restTemplateStub = stub(RestTemplate, 'postToExternalSource')
                restTemplateStub.resolves(ovqResponse);
                const ovqDetailService: OvqDelegate = new OvqDelegate
                ovqDetails = await ovqDetailService.getOrderDetails(customerOrderNumber)
            })

            after(() => {
                restTemplateStub.restore();
            });

            it('post request to OVQ', () => {
                expect(restTemplateStub.calledOnce).to.be.true;
                expect(restTemplateStub.getCall(0).args[1]).to.contain(customerOrderNumber)
            })
            it('should return object from ovq', () => {
                expect(JSON.stringify(ovqDetails)).to.be.eq(JSON.stringify({
                    "Order": [{
                        "DocumentType": "0001"
                    }]
                }))
            });
        })

        describe('Given a faulty customerOrderNumber, when the function is invoked, then', () => {
            let restTemplateStub: SinonStub
            let customerOrderNumber = "123456bad";
            let ovqDetails: String
            let ovqResponse = JSON.stringify({
                "data": {
                    "order": {
                        "OrderList": null
                    }
                }
            })
            const ovqDelegate: OvqDelegate = new OvqDelegate()
            let expectedError : SystemError;

            before(async () => {
                restTemplateStub = stub(RestTemplate, 'postToExternalSource')
                expectedError = new SystemError(ErrorCode.NOT_FOUND, 'Not Found Error', `Can not find customer order ${customerOrderNumber} in OVQ`);
                restTemplateStub.resolves(ovqResponse);
            })
            
            after(() => {
                restTemplateStub.restore();
            });
            
            it('should post request to OVQ', async () => {
                ovqDetails = await ovqDelegate.getOrderDetails(customerOrderNumber).catch((err) => {})
                expect(restTemplateStub.calledOnce).to.be.true;
                expect(restTemplateStub.getCall(0).args[1]).to.contain(customerOrderNumber)
            })
            it('should throw an error', async () => {
                ovqDetails = await ovqDelegate.getOrderDetails(customerOrderNumber)
                .catch((err) => {
                    expect(err.message).to.equal(expectedError.message);
                });
            }); 
        })
    })
})