export class ComOrderDetailsDTO {
    public lastUpdatedTS: string;
    public customerOrderNumber: string;
    public orderedDate: string;
    public shipTo: LocationDTO;
    public customerInfo: CustomerInfoDTO;
    public lineItems: Array<LineItemDTO>;
}

export class CustomerInfoDTO {
    public firstName: string;
    public middleName: string;
    public lastName: string;
    public phoneNumber: string;
    public mobileNumber: string;
    public email: string;
}

export class LocationDTO {
    public addressLineOne: string;
    public addressLineTwo: string;
    public crossStreet: string;
    public city: string;
    public state: string;
    public zip: string;
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
    public levelOfServiceDesc: string;
    public po: string;
    public tracking: Array<TrackingDetailDTO>;
}

export class CarrierDTO {
    public name: string;
    public code: string;
    public type: string;
    public trackerUrl: string;
}

export class TrackingDetailDTO {
    public scac: string;
    public trackingNumber: string;
    public trackingType: string;
    public levelOfService: string;
}