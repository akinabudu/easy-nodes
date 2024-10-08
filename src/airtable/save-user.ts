import { airtable, config } from "../lib/config";
import type { MyContext, SessionData } from "../lib/types";

export async function SaveUser(ctx: MyContext, data: SessionData) {

  try {
    if (data.tgId) {
      const records = await airtable(config.airtableUserTableName!).create([
        {
          fields: {
            tgId: `${data.tgId!}`,
            tgUsername: `${data.tgUsername!}`,
            email: `${data.email!}`,
            polygonAddress: `${data.polygonAddress!}`,
            solanaAddress: `${data.solanaAddress!}`,
            polygonPrivateKey: `${data.polygonPrivateKey!}`,
            solanaPrivateKey: `${data.solanaPrivateKey!}`,
            baseAddress: `${data.baseAddress!}`,
            basePrivateKey: `${data.basePrivateKey!}`,
           
          },
        },
      ])

    }
    console.log("Order Details saved successfully");
  } catch (error) {
    console.log("Error saving order details");
    console.log(error);
  }
}
