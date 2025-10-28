import { Request, Response } from "express";
import Offer from "../models/offer";
import UserProfile from "../models/user_profile";
import TraderStats from "../models/trader_stats";

export const getAllOffersWithSeller = async (req: Request, res: Response) => {
  try {
    // ✅ Fetch active offers
    const offers = await Offer.find({ status: "active" }).sort({ createdAt: -1 });

    if (!offers.length) {
      return res.json({ success: true, offers: [] });
    }

    // ✅ Combine offers with seller profile + trader stats
    const offersWithSeller = await Promise.all(
      offers.map(async (offer) => {
        const [sellerProfile, traderStats] = await Promise.all([
          UserProfile.findOne({ userId: offer.userId }).select(
            "username bio profilePicture walletAddress"
          ),
          TraderStats.findOne({ userId: offer.userId }),
        ]);

        return {
          adsId: offer.adsId,
          title: offer.title,
          description: offer.description,
          assetType: offer.assetType,
          pricePerUnit: offer.pricePerUnit,
          availableAmount: offer.availableAmount,
          minLimit: offer.minLimit,
          maxLimit: offer.maxLimit,
          paymentMethods: offer.paymentMethods,
          status: offer.status,
          createdAt: offer.createdAt,

          // ✅ Combine user + trader info
          seller: sellerProfile
            ? {
                username: sellerProfile.username,
                bio: sellerProfile.bio,
                profilePicture: sellerProfile.profilePicture,
                walletAddress: sellerProfile.walletAddress,
                traderStats: traderStats
                  ? {
                      totalOrders: traderStats.totalOrders,
                      successfulOrders: traderStats.successfulOrders,
                      cancelledOrders: traderStats.cancelledOrders,
                      positivityRate: traderStats.positivityRate,
                      averageReleaseTime: traderStats.averageReleaseTime,
                      averagePaymentTime: traderStats.averagePaymentTime,
                      bankDetails: traderStats.bankDetails,
                      updatedAt: traderStats.updatedAt,
                    }
                  : null,
              }
            : null,
        };
      })
    );

    return res.json({ success: true, offers: offersWithSeller });
  } catch (error) {
    console.error("❌ Error fetching offers:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching offers",
    });
  }
};
