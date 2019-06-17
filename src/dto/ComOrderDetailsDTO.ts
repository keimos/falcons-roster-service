export class ComOrderDetailsDTO {
    public customerOrderNumber: string;
    public orderedDate: Date;
    public shipTo: LocationDTO;
    public lineItems: Array<LineItemDTO>;
    public scac: string;
    public trackingNumber: string;
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
}

export class CarrierDTO {
    public name: string;
    public code: string;
    public type: string;
    public trackerUrl: string;
}