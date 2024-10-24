import { InlineKeyboard } from "grammy";

export const instanceType = new InlineKeyboard()
  .text("16GB/RAM | RHEL | ARM64 | 1TB/SSD | 4vCPU- USD 8/day", "t4g.xlarge")
  .row()
  .text(
    "32GB/RAM | RHEL | ARM64 | 1TB/SSD | 8vCPU - USD 13/day",
    "t4g.2xlarge"
  )
  .row();
