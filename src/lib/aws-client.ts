import { EC2Client } from "@aws-sdk/client-ec2";

const config={
  region: String(process.env.AWS_REGION),
    credentials: {
      accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
      secretAccessKey:String(process.env.AWS_SECRET_ACCESS_KEY),
    }}

export const client = new EC2Client(config);

export const securityGroup = String(process.env.AWS_SECURITY_GROUP)
export const keyPair = String(process.env.AWS_KEY_PAIR)


