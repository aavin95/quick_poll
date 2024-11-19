// src/lib/dynamo.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_CLOUD_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_CLOUD_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_CLOUD_ACCESS_KEY || "",
  },
});

const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export { dynamoDb };
