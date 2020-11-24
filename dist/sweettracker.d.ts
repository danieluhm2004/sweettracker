declare enum SweetTrackerStatus {
    PREPARING = "preparing",
    COLLECTED = "collected",
    SHIPPING = "shipping",
    BRANCH_ARRVIED = "BRANCH_ARRVIED",
    DEPART = "depart",
    ARRVIED = "arrived",
    UNKNOWN = "unknown"
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
export declare class SweetTracker {
    private apikey;
    private got;
    /**
     * Create a new Sweet Tracker client object.
     *
     * @param apikey Sweet Tracker API key.
     */
    constructor(apikey: string);
    /**
     * Get a list of couriers that can be tracked.
     */
    getCompanies(): Promise<SweetTrackerCompany[]>;
    /**
     * It is recommended that the delivery service company for the invoice.
     */
    getRecommendedCompany(invoice: string): Promise<SweetTrackerCompany[]>;
    /**
     * Get shipping status.
     */
    getTracking(companyId: string, invoice: string): Promise<SweetTrackerTracking>;
    private static getTrackingStatus;
    private static getPhoneNumber;
    private static checkEmpty;
}
export {};
