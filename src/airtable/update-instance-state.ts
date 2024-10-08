import { airtable, config } from "../lib/config";


export async function UpdateInstanceState(orderId: string) {
  try {
    const records = await airtable(config.airtableOrderTableName).select({
      filterByFormula: `{orderId} = '${orderId}'`
    }).all();

    if (records.length > 0) {
      const record = records[0];
      await airtable(config.airtableOrderTableName).update([
        {
          id: record.id,
          fields: {
            instanceStatus: "inactive"
          }
        }
      ]);
      console.log(`Instance ${orderId} status updated to inactive`);
      return true;
    } else {
      console.log(`No record found for instance ${orderId}`);
      return false;
    }
  } catch (error) {
    console.error("Error updating instance state:", error);
    return false;
  }
}
