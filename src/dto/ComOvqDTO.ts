
export class OvqOrderListDTO {
    public Order: Array<OvqOrderDTO>;
}

export class OvqOrderDTO {
    public OvqOrderExtn: OvqOrderExtnDTO;
    public OrderDate: string;
    public OrderLines: OvqOrderLinesDTO;
    public DocumentType: string;
    public OvqPersonInfoBillTo: OvqPersonInfoBillToDTO;
    public OvqPersonInfoShipTo: OvqPersonInfoShipToDTO; 
}

export class OvqOrderLinesDTO {
    public OrderLine: Array<OvqOrderLineDTO>;
}

export class OvqOrderLineDTO {
    public Extn: OvqOrderLineExtnDTO;
    public ShipNode: string;
    public Item: OvqItemDTO;
    public OrderedQty: string;
    public OrderStatuses: Array<OrderStatus>;
}

export class OrderStatus {
    public StatusDate: string;
    public StatusDescription: string;
}

export class OvqOrderLineExtnDTO {
    public ExtnOMSID: string;
    public ExtnSKUCode: string;
    public HDOnlineProductList: OvqHDOnlineProductListDTO;
    public HDTrackingInfoList: OvqHDTrackingInfoListDTO;
    public HDSplOrdList: Array<HDSplOrd>
}

export class  HDSplOrd {
    public SplOrdExpectedArrivalDate: string;
}

export class OvqHDTrackingInfoListDTO {
    public HDTrackingInfo: Array<OvqHDTrackingInfoDTO>;
    
}

export class OvqHDTrackingInfoDTO {
    public TrackingNumber: string;
    public SCAC: string;
    public LevelOfService: string;
    public TrackingType: string;

}

export class OvqHDOnlineProductListDTO {
    public HDOnlineProduct: Array<OvqHDOnlineProductDTO>;

}
export class OvqHDOnlineProductDTO {
    public CatalogOMSID: string;
}

export class OvqItemDTO {
    public ItemDesc: string;
    public UnitCost: string;

}
export class OvqOrderExtnDTO{
    public ExtnPONumber: string;
    public ExtnHostOrderReference: string;
}

export class OvqPersonInfoBillToDTO {
    public EMailID: string;
}

export class OvqPersonInfoShipToDTO {
    public AddressLine1: string;
    public City: string;
    public ZipCode: string;
    public State: string;
}