import type Airtable from "airtable";
import { airtable, config } from "../lib/config";
import type { MyContext, SessionData } from "../lib/types";
import type { AirtableBase } from "airtable/lib/airtable_base";

export async function SaveOrderDetails( data: SessionData) {


  try {
    if (data.instance) {
      const records = await airtable(config.airtableOrderTableName).create([
        {
          fields: {
            tgId: `${data.tgId!}`,
            paymentStatus: `${data.instance?.paymentStatus!}`,
            instanceId: `${data.instance?.instanceId!}`,
            instanceIp: `${data.instance?.instanceIp!}`,
            instanceStatus: `${data.instance?.instanceStatus!}`,
            instanceName: `${data.instance?.instanceName!}`,
            instanceDuration: `${data.instance?.instanceDuration!}`,
            instanceType: `${data.instance?.instanceType!}`,
            instanceTotalCost: `${data.instance?.instanceTotalCost!}`,
            orderId: `${data.instance?.orderId!}`,
            orderDescription: `${data.instance?.orderDescription!}`,
            instanceUsername: `${data.instance?.instanceUsername!}`,
            instancePassword: `${data.instance?.instancePassword!}`,
            instanceDateInitiated: `${data.instance?.instanceDateInitiated!}`,
            instanceDateExpiry: `${data.instance?.instanceDateExpiry!}`,
            polygonAddress: `${data?.polygonAddress!}`,
            solanaAddress: `${data?.solanaAddress!}`,
            baseAddress: `${data?.baseAddress!}`,
          },
        },
      ]).then(async(res)=>{
        // console.log("records: ",await res)
        console.log("Order Details saved successfully");
      })
    }
  } catch (error) {
    console.log("Error saving order details");
    console.log(error);
  }
}
