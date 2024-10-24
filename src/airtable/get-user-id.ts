import { airtable, config } from "../lib/config";

export async function getUserbyId(tgId: string) {
    try {
      const records = await airtable(config.airtableUserTableName)
        .select({
          filterByFormula: `{tgId} = '${tgId}'`,
        })
        .all();
  
      if (records.length > 0) {
        
          return records[0].get("tgId");
      }
    } catch (error) {
      console.log(error);
    }
  }