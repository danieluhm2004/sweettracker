"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SweetTracker = void 0;
const got_1 = __importDefault(require("got"));
var SweetTrackerStatus;
(function (SweetTrackerStatus) {
    SweetTrackerStatus["PREPARING"] = "preparing";
    SweetTrackerStatus["COLLECTED"] = "collected";
    SweetTrackerStatus["SHIPPING"] = "shipping";
    SweetTrackerStatus["BRANCH_ARRVIED"] = "BRANCH_ARRVIED";
    SweetTrackerStatus["DEPART"] = "depart";
    SweetTrackerStatus["ARRVIED"] = "arrived";
    SweetTrackerStatus["UNKNOWN"] = "unknown";
})(SweetTrackerStatus || (SweetTrackerStatus = {}));
class SweetTracker {
    /**
     * Create a new Sweet Tracker client object.
     *
     * @param apikey Sweet Tracker API key.
     */
    constructor(apikey) {
        this.apikey = apikey;
        this.got = got_1.default.extend({
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
    async getCompanies() {
        const companies = await this.got
            .get('companylist')
            .json();
        return companies.Company.map(({ Code, Name }) => ({
            id: Code,
            name: Name,
        }));
    }
    /**
     * It is recommended that the delivery service company for the invoice.
     */
    async getRecommendedCompany(invoice) {
        const searchParams = { t_invoice: invoice };
        const companies = await this.got
            .get('recommend', { searchParams })
            .json();
        return companies.Recommend.map(({ Code, Name }) => ({
            id: Code,
            name: Name,
        }));
    }
    /**
     * Get shipping status.
     */
    async getTracking(companyId, invoice) {
        const searchParams = { t_code: companyId, t_invoice: invoice };
        const res = await this.got
            .get('trackingInfo', { searchParams })
            .json();
        const tracking = {
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
    static getTrackingStatus(level) {
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
    static getPhoneNumber(detail) {
        const phoneNumber = [];
        if (detail.telno) {
            phoneNumber.push(detail.telno);
        }
        if (detail.telno2) {
            phoneNumber.push(detail.telno2);
        }
        return phoneNumber;
    }
    static checkEmpty(text) {
        return text || undefined;
    }
}
exports.SweetTracker = SweetTracker;
