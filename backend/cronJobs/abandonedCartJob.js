const cron = require("node-cron");
const Cart = require("../models/Cart");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const Log = require("../models/Log");

const abandonedCartJob = () => {
  // Run every hour
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Running abandoned cart check job...");

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      // Find carts that:
      // 1. Have items
      // 2. Haven't had an email sent yet
      // 3. Were last updated over 5 minutes ago
      const abandonedCarts = await Cart.find({
        "items.0": { $exists: true }, // Has at least one item
        abandonedEmailSent: false,
        updatedAt: { $lt: fiveMinutesAgo },
      }).populate("user", "name email");

      if (abandonedCarts.length === 0) {
        console.log("No new abandoned carts found.");
        return;
      }

      console.log(
        `Found ${abandonedCarts.length} abandoned carts. Processing...`,
      );

      for (const cart of abandonedCarts) {
        if (!cart.user) continue; // Skip if user no longer exists

        // 1. Send Email
        const message = `Hi ${cart.user.name},\n\nYou left some items in your cart! Don't miss out on these products. Come back to QuickCart to complete your purchase.\n\nThank you for shopping with us!`;

        try {
          await sendEmail({
            email: cart.user.email,
            subject: "You left items in your cart!",
            message,
          });

          // 2. Create In-App Notification
          await Notification.create({
            user: cart.user._id,
            type: "abandoned_cart",
            title: "Items left in your cart",
            message:
              "You have items waiting in your cart. Complete your purchase before they sell out!",
            isRead: false,
          });

          // 3. Update Cart
          cart.abandonedEmailSent = true;
          await cart.save();

          // 4. Log System Activity
          await Log.create({
            action: "Abandoned Cart Notification",
            description: `Sent abandoned cart email and notification to ${cart.user.name} (${cart.user.email})`,
            user: cart.user._id,
            method: "CRON",
            endpoint: "abandonedCartJob",
            status: "success",
          });

          console.log(
            `Successfully processed abandoned cart for user ${cart.user.email}`,
          );
        } catch (err) {
          console.error(
            `Error processing abandoned cart for user ${cart.user.email}: `,
            err.message,
          );
        }
      }
    } catch (error) {
      console.error("Error in abandoned cart cron job: ", error.message);
    }
  });
};

module.exports = abandonedCartJob;
