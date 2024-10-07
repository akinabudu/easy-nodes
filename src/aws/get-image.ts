'use server'
import { DescribeImagesCommand } from "@aws-sdk/client-ec2";
import { client } from "../lib/aws-client";

const AmiDetails = async () => {
  const command = new DescribeImagesCommand({ Owners: ["self"] });

    try {
      const data = await client.send(command);
      if (data.Images) {
        return data.Images;
      }
    } catch (err) {
      console.log(err);
      return err;
    }
};

export default AmiDetails;
