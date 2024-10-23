
import { mySesssion } from "../../bot";

export async function setSession(tgId: number): Promise<void> {
  try {
    
      // If no running instances, set default values
      mySesssion[tgId] = {
        tgId: tgId.toString(),
        tgUsername: "",
        email: "",
        instance: {
          instanceDomain: "",
          instanceId: "",
          instanceIp: "",
          instanceStatus: "inactive",
          instanceName: "",
          instanceDuration: 1,
          instanceType: "t4g.xlarge",
          paymentStatus: "unpaid",
          instanceTotalCost: 0,
          orderId: "",
          orderDescription: "",
          instanceDateInitiated: new Date().toISOString(),
          instanceDateExpiry: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
          instanceUsername: "",
          instancePassword: "",
          isInstanceMainnet: false,
          instanceEthRpcUrl: "",
        },
      
    }
  } catch (error) {
    console.error("Error setting session from database:", error);
    throw error;
  }
}
