
import { InlineKeyboard } from "grammy";


  export const instanceType = new InlineKeyboard()
  .text("0.5GB/RAM | Amazon Linux ARM64 | 10GB/SSD | 2vCPU - USD 1.4/week","t4g.nano")
  .row()
  .text("2GB/RAM | Amazon Linux ARM64 | 20GB/SSD | 2vCPU - USD 5.67/week" ,"t4g.small")
  .row()
  .text("8GB/RAM | Amazon Linux ARM64 | 30GB/SSD | 1vCPU- USD 14.7/week","r6g.medium")
  .row()
  .text("16GB/RAM | Amazon Linux ARM64 | 50GB/SSD | 1vCPU - USD 28.7/week","x2gd.medium")
  .row()
