# COMOrderDetailService

HDTrackingInfo.TrackingType  =? lastmile



{
  order(id: "W15600137") {
    OrderList {
      Order {
        DocumentType
        Extn {
          HDSplOrdList {
            HDSplOrd {
              SplOrdExpectedArrivalDate
            }
          }
          ExtnPONumber
          ExtnHostOrderReference
        }
        PersonInfoBillTo {
          EMailID
        }
        PersonInfoShipTo {
          AddressLine1
          City
          ZipCode
          State
        }
        OrderDate
        OrderLines {
          OrderLine {
            OrderStatuses {
              OrderStatus {
                StatusDate
                StatusDescription
              }
            }
            OrderedQty
            Extn {
              ExtnOMSID
              ExtnSKUCode
            }
            ShipNode
            Item {
              ItemDesc
              UnitCost
            }
            Extn {
              HDTrackingInfoList {
                HDTrackingInfo {
                  TrackingNumber
                  SCAC
                  LevelOfService
                  TrackingType
                }
              }
            }
          }
        }
      }
    }
  }
}
