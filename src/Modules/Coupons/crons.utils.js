import { scheduleJob } from "node-schedule";
import { CouponModel } from "../../../DB/Models/index.js";
import { DateTime } from "luxon";

export const cronJobOne = () => {
  scheduleJob("0 59 23 * * *", async () => {
    console.log("cron job one");
    const enabledCoupons = await CouponModel.find({ isEnabled: true });
    // 2024-08-30T00:00:00.000Z

    if (enabledCoupons.length > 0) {
      enabledCoupons.forEach(async (coupon) => {
        if (DateTime.now() > DateTime.fromJSDate(coupon.till)) {
          coupon.isEnabled = false;
          await coupon.save();
        }
      });
    }
  });
};

// for date
// luxon
// momonet out of support
// Date
