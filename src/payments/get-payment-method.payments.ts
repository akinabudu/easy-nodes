import { getWalletAddress } from "../airtable/get-wallet-address";
import type { MyContext } from "../lib/types";
import { monitorPayment } from "./monitorpayments";


export default async function getPaymentMethod(ctx:MyContext,network:string,amount:number,orderId:string,extend:boolean){
    const address = await getWalletAddress(ctx.from!.id!.toString(),network)
    await ctx.reply(`Please send <code>${amount} USDC</code> to this <code>${network.toUpperCase()}</code> address: <code>${address}</code>`,{
        parse_mode:"HTML"
    });
    if(address){
        monitorPayment(ctx, network, address, amount.toString(), orderId, extend);
    }
  }