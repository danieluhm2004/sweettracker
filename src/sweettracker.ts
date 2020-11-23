import got from 'got';

enum SweetTrackerStatus {
  PREPARING = 'preparing',
  COLLECTED = 'collected',
  SHIPPING = 'shipping',
  BRANCH_ARRVIED = 'BRANCH_ARRVIED',
  DEPART = 'depart',
  ARRVIED = 'arrived',
  UNKNOWN = 'unknown',
}

export interface SweetTrackerCompany {
  id: string /** @property {string} id - Unique ID */;
  name: string /** @property {string} name - Company Name */;
}

export interface SweetTrackerTracking {
  status: SweetTrackerStatus /** @property {SweetTrackerStatus} status - Current Status */;
  sender?: string /** @property {string} sender - Sender */;
  recipent?: string /** @property {string} recipent - Recipient */;
  receiver: SweetTrackerTrackingReceiver /** @property {SweetTrackerTrackingReceiver} receiver - Receiver */;
  estimate?: string /** @property {string} id - Estimated arrival time */;
  item: SweetTrackerTrackingItem /** @property {SweetTrackerTrackingItem} item - Property information */;
  details: SweetTrackerTrackingDetail[] /** @property {SweetTrackerTrackingDetail[]} details - Shipping details */;
}

export interface SweetTrackerTrackingItem {
  name?: string /** @property {string} name - Name */;
  image?: string /** @property {string} image - Image */;
}

export interface SweetTrackerTrackingReceiver {
  realname?: string /** @property {string} realname - Real name */;
  address?: string /** @property {string} realname - Address */;
}

export interface SweetTrackerTrackingDetail {
  timestamp: Date /** @property {Date} timestamp - time */;
  kind: string /** @property {string} kind - Delivery status type */;
  where: string /** @property {string} where - location */;
  phoneNumber: string[] /** @property {string[]} phoneNumber - phone number */;
  status: SweetTrackerStatus /** @property {SweetTrackerStatus} status - status */;
  courier: SweetTrackerTrackingDetailCourier /** @property {SweetTrackerTrackingDetailCourier} courier - Deliveryman information */;
}

export interface SweetTrackerTrackingDetailCourier {
  realname?: string /** @property {string} realname - Delivery person real name */;
  profile?: string /** @property {string} profile - Profile image */;
}

interface SweetTrackerCompaniesResponse {
  Company: SweetTrackerCompanyResponse[];
}

interface SweetTrackerRecommendedCompanyResponse {
  Recommend: SweetTrackerCompanyResponse[];
}

interface SweetTrackerCompanyResponse {
  Code: string;
  Name: string;
}

interface SweetTrackerTrackingResponse {
  result: 'Y' | 'N';
  senderName?: string;
  receiverName?: string;
  itemName?: string;
  invoiceNo?: string;
  receiverAddr?: string;
  orderNumber: null;
  adUrl: null;
  estimate?: string;
  level: number;
  complete?: boolean;
  recipient?: string;
  itemImage?: string;
  trackingDetails: SweetTrackerTrackingDetailResponse[];
  productInfo: null;
  zipCode: null;
  firstDetail?: SweetTrackerTrackingDetailResponse;
  completeYN: 'Y' | 'N';
  lastDetail?: SweetTrackerTrackingDetailResponse;
  lastStateDetail?: SweetTrackerTrackingDetailResponse;
}

interface SweetTrackerTrackingDetailResponse {
  time: number;
  timeString: string;
  code: null;
  where: string;
  kind: string;
  telno: string;
  telno2: string;
  remark: null;
  level: number;
  manName: string;
  manPic: string;
}

export class SweetTracker {
  private got;

  /**
   * Create a new Sweet Tracker client object.
   *
   * @param apikey Sweet Tracker API key.
   */
  public constructor(private apikey: string) {
    this.got = got.extend({
      prefixUrl: 'http://info.sweettracker.co.kr/api/v1',
      retry: 0,
      hooks: {
        beforeRequest: [
          (options) => {
            options.url.searchParams.append('t_key', apikey);
          },
        ],
      },
    });
  }

  /**
   * Get a list of couriers that can be tracked.
   */
  public async getCompanies(): Promise<SweetTrackerCompany[]> {
    const companies = await this.got
      .get('companylist')
      .json<SweetTrackerCompaniesResponse>();

    return companies.Company.map(({ Code, Name }) => ({
      id: Code,
      name: Name,
    }));
  }

  /**
   * It is recommended that the delivery service company for the invoice.
   */
  public async getRecommendedCompany(
    invoice: string
  ): Promise<SweetTrackerCompany[]> {
    const searchParams = { t_invoice: invoice };
    const companies = await this.got
      .get('recommend', { searchParams })
      .json<SweetTrackerRecommendedCompanyResponse>();

    return companies.Recommend.map(({ Code, Name }) => ({
      id: Code,
      name: Name,
    }));
  }

  /**
   * Get shipping status.
   */
  public async getTracking(
    companyId: string,
    invoice: string
  ): Promise<SweetTrackerTracking> {
    const searchParams = { t_code: companyId, t_invoice: invoice };
    const res = await this.got
      .get('trackingInfo', { searchParams })
      .json<SweetTrackerTrackingResponse>();

    const tracking: SweetTrackerTracking = {
      status: SweetTracker.getTrackingStatus(res.level),
      sender: SweetTracker.checkEmpty(res.senderName),
      recipent: SweetTracker.checkEmpty(res.recipient),
      receiver: {
        realname: SweetTracker.checkEmpty(res.receiverName),
        address: SweetTracker.checkEmpty(res.receiverAddr),
      },
      estimate: SweetTracker.checkEmpty(res.estimate),
      item: {
        name: SweetTracker.checkEmpty(res.itemName),
        image: SweetTracker.checkEmpty(res.itemImage),
      },
      details: res.trackingDetails.map((detail) => ({
        timestamp: new Date(detail.time),
        kind: detail.kind,
        where: detail.where,
        status: SweetTracker.getTrackingStatus(detail.level),
        phoneNumber: SweetTracker.getPhoneNumber(detail),
        courier: {
          realname: SweetTracker.checkEmpty(detail.manName),
          profile: SweetTracker.checkEmpty(detail.manPic),
        },
      })),
    };

    return tracking;
  }

  private static getTrackingStatus(level: number): SweetTrackerStatus {
    switch (level) {
      case 0:
        return SweetTrackerStatus.PREPARING;
      case 1:
        return SweetTrackerStatus.COLLECTED;
      case 2:
        return SweetTrackerStatus.SHIPPING;
      case 3:
        return SweetTrackerStatus.BRANCH_ARRVIED;
      case 4:
        return SweetTrackerStatus.DEPART;
      case 5:
        return SweetTrackerStatus.ARRVIED;
      default:
        return SweetTrackerStatus.UNKNOWN;
    }
  }

  private static getPhoneNumber(
    detail: SweetTrackerTrackingDetailResponse
  ): string[] {
    const phoneNumber = [];
    if (detail.telno) {
      phoneNumber.push(detail.telno);
    }

    if (detail.telno2) {
      phoneNumber.push(detail.telno2);
    }

    return phoneNumber;
  }

  private static checkEmpty(text?: string) {
    return text || undefined;
  }
}
