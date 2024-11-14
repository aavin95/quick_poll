// /api/undoVote/route.ts

import { NextResponse } from "next/server";
import { dynamoDb } from "../../../lib/dynamo";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req: Request) {
  try {
    const { pollId, option } = await req.json();

    console.log("pollId", pollId);
    console.log("option", option);

    // Step 1: Decrement the vote count for the selected option
    const updateCommand = new UpdateCommand({
      TableName: "quick_poll",
      Key: { pollId },
      UpdateExpression: "ADD #options.#option :dec",
      ExpressionAttributeNames: {
        "#options": "options",
        "#option": option,
      },
      ExpressionAttributeValues: {
        ":dec": -1,
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

    // Step 3: Send the updated poll data back to the client
    return NextResponse.json(getResponse.Item, { status: 200 });
  } catch (error) {
    console.error("Error updating vote:", error);
    return NextResponse.json(
      { error: "Could not update the vote count." },
      { status: 500 }
    );
  }
}
