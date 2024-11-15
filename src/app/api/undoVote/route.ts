// /api/undoVote/route.ts

import { NextResponse } from "next/server";
import { dynamoDb } from "../../../lib/dynamo";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req: Request) {
  try {
    const { pollId, option, name } = await req.json();

    // Step 1: Decrement the vote count and remove the name
    const decrementCommand = new UpdateCommand({
      TableName: "quick_poll",
      Key: { pollId },
      UpdateExpression: "ADD #options.#option :dec DELETE #names :nameSet",
      ConditionExpression: "#options.#option > :zero",
      ExpressionAttributeNames: {
        "#options": "options",
        "#option": option,
        "#names": "names",
      },
      ExpressionAttributeValues: {
        ":dec": -1,
        ":nameSet": new Set([name]),
        ":zero": 0,
      },
      ReturnValues: "UPDATED_NEW",
    });

    try {
      await dynamoDb.send(decrementCommand);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        return NextResponse.json(
          { error: "Vote count cannot go below 0" },
          { status: 400 }
        );
      }
      throw error;
    }

    // Step 2: Check conditions for deletion and remove field if conditions are met
    const deleteConditionCommand = new UpdateCommand({
      TableName: "quick_poll",
      Key: { pollId },
      UpdateExpression: "REMOVE #options.#option",
      ConditionExpression:
        "attribute_exists(#options.#option) AND #options.#option = :zero AND #prefs.#freeResp = :true",
      ExpressionAttributeNames: {
        "#options": "options",
        "#option": option,
        "#prefs": "advancedPreferences",
        "#freeResp": "freeResponse",
      },
      ExpressionAttributeValues: {
        ":zero": 0,
        ":true": true,
      },
      ReturnValues: "UPDATED_NEW",
    });

    try {
      await dynamoDb.send(deleteConditionCommand);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        console.log(
          "Conditions not met for field deletion; vote updated only."
        );
      } else {
        throw error; // Re-throw other errors
      }
    }

    // Step 3: Retrieve the updated poll item
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

    // Step 4: Send the updated poll data back to the client
    return NextResponse.json(responseItem, { status: 200 });
  } catch (error) {
    console.error("Error updating vote:", error);
    return NextResponse.json(
      { error: "Could not update the vote count." },
      { status: 500 }
    );
  }
}
