import type { MyContext } from "../../lib/types";
import axios from "axios";
import { config } from "../../lib/config";


const NowPayments = async (
  ctx: MyContext,
  amount: number,
  currency: string,
  orderId: string
) => {
  const response = await axios.post(
    `${config.nowpaymentsUrl}/payment`,
    {
      price_amount: amount,
      price_currency: "usd",
      pay_currency: currency,
      order_id: orderId,
      order_description: "Description of the order",
    },
    {
      headers: {
        "x-api-key": `${config.nowpaymentsApiKey}`,
      },
    }
  );

  const paymentData = response.data;
  await ctx.reply(
    `Please pay ${paymentData.pay_amount} ${paymentData.pay_currency} to this address: <code>${paymentData.pay_address}</code>`,
    { parse_mode: "HTML" }
  );
  return paymentData.payment_id;
};



export default NowPayments;
