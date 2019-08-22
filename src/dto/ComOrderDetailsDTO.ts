export class ComOrderDetailsDTO {
    public lastUpdatedTS: string;
    public customerOrderNumber: string;
    public orderedDate: string;
    public shipTo: LocationDTO;
    public lineItems: Array<LineItemDTO>;
    public email: string;
    public po: string;
}

export class LocationDTO {
    public nameLineOne: string;
    public nameLineTwo: string;
    public addressLineOne: string;
    public addressLineTwo: string;
    public crossStreet: string;
    public city: string;
    public state: string;
    public zip: string;
    public phoneNumber: string;
    public timezone: string;
    public type: string;
}

export class LineItemDTO {
    public id: number;
    public lineItemId: string;
    public sku: number;
    public skuDescription: string;
    public omsID: string;
    public quantity: number;
    public expectedDeliveryDate: string;
    public comStatus: string;
    public levelOfService: string;
    public scac: string;
    public trackingNumber: string;
    public trackingType: string;
}

export class CarrierDTO {
    public name: string;
    public code: string;
    public type: string;
    public trackerUrl: string;
}