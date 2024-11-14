// /api/vote/route.ts

import { NextResponse } from "next/server";
import { dynamoDb } from "../../../lib/dynamo";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req: Request) {
  try {
    const { pollId, option, name } = await req.json();

    // Step 1: Increment the vote count for the selected option
    const updateCommand = new UpdateCommand({
      TableName: "quick_poll",
      Key: { pollId },
      UpdateExpression: "ADD #options.#option :inc, #names :nameSet",
      ExpressionAttributeNames: {
        "#options": "options",
        "#option": option,
        "#names": "names",
      },
      ExpressionAttributeValues: {
        ":inc": 1,
        ":nameSet": new Set([name]),
      },
      ReturnValues: "UPDATED_NEW",
    });

    await dynamoDb.send(updateCommand);

    // Step 2: Retrieve the updated poll item
    const getCommand = new GetCommand({
      TableName: "quick_poll",
      Key: { pollId },
    });

    const getResponse = await dynamoDb.send(getCommand);

    if (!getResponse.Item) {
      return NextResponse.json(
        { error: "Poll not found after updating." },
        { status: 404 }
      );
    }

    const responseItem = {
      ...getResponse.Item,
      names: getResponse.Item.names ? Array.from(getResponse.Item.names) : [],
    };

    // Step 3: Send the updated poll data back to the client
    return NextResponse.json(responseItem, { status: 200 });
  } catch (error) {
    console.error("Error updating vote:", error);
    return NextResponse.json(
      { error: "Could not update the vote count." },
      { status: 500 }
    );
  }
}
