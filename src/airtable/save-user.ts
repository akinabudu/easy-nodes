import { airtable, config } from "../lib/config";
import type { MyContext, SessionData } from "../lib/types";

export async function SaveUser(ctx: MyContext, data: SessionData) {
  // ctx.reply("Please wait...");
  // await ctx.reply(`Your referral ID is: ${referralId}`);

  try {
    if (data.tgId) {
      const records = await airtable(config.airtableUserTableName!).create([
        {
          fields: {
            tgId: `${data.tgId!}`,
            tgUsername: `${data.tgUsername!}`,
            firstName: `${data.firstName!}`,
            lastName: `${data.lastName!}`,
            email: `${data.email!}`,
            polygonAddress: `${data.polygonAddress!}`,
            solanaAddress: `${data.solanaAddress!}`,
            polygonPrivateKey: `${data.polygonPrivateKey!}`,
            solanaPrivateKey: `${data.solanaPrivateKey!}`,
           
          },
        },
      ])
      // .then(async(res: any)=>{
      //   console.log("records: ",await res)
      // })
    }
    // ctx.reply("Successful");
    console.log("Order Details saved successfully");
  } catch (error) {
    console.log("Error saving order details");
    console.log(error);
    // ctx.reply("Error saving member details");
  }
}
