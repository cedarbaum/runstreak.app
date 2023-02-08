import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

import { DateTime, Duration } from "luxon";
import crypto from "crypto";

export class DynamoDbRequestThrottler {
  readonly client: DynamoDBClient;

  constructor(
    accessKeyId: string,
    secretAccessKey: string,
    region: string,
    readonly table: string,
    readonly requestLimit: number
  ) {
    this.client = new DynamoDBClient({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
    });
  }

  private async createNewEntry(encryptedId: string) {
    const now = DateTime.now();
    await this.client.send(
      new PutItemCommand({
        TableName: this.table,
        Item: {
          encrypted_account_id: { S: encryptedId },
          request_count: { N: "1" },
          ttl: {
            N: now
              .plus(Duration.fromObject({ days: 1 }))
              .toSeconds()
              .toString(),
          },
        },
      })
    );
  }

  async canMakeRequest(id: string): Promise<boolean> {
    const now = DateTime.now();
    const encryptedId = crypto.createHash("sha256").update(id).digest("hex");

    const { Item } = await this.client.send(
      new GetItemCommand({
        TableName: this.table,
        Key: {
          encrypted_account_id: { S: encryptedId },
        },
      })
    );

    if (!Item) {
      await this.createNewEntry(encryptedId);
      return true;
    }

    const request_count = parseInt(Item?.request_count.N || "0");
    const ttl = parseInt(Item?.ttl.N || "0");

    if (ttl < now.toSeconds()) {
      await this.createNewEntry(encryptedId);
      return true;
    }

    if (request_count >= this.requestLimit) {
      return false;
    }

    await this.client.send(
      new UpdateItemCommand({
        TableName: this.table,
        Key: {
          encrypted_account_id: { S: encryptedId },
        },
        UpdateExpression: "add request_count :inc",
        ExpressionAttributeValues: {
          ":inc": { N: "1" },
        },
        ReturnValues: "UPDATED_NEW",
      })
    );

    return true;
  }
}
