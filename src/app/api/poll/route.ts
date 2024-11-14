import { NextResponse } from "next/server";
import { dynamoDb } from "../../../lib/dynamo";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const { question, options, advancedPreferences } = await req.json();

  // Validate inputs
  console.log(options);
  console.log(question);
  console.log(advancedPreferences);

  switch (true) {
    case !question:
      return NextResponse.json(
        { error: "Question is required and cannot be empty." },
        { status: 400 }
      );
    case typeof question !== "string":
      return NextResponse.json(
        { error: "Question must be a string." },
        { status: 400 }
      );
    case !options: // Check if options is defined
      return NextResponse.json(
        { error: "Options are required and cannot be empty." },
        { status: 400 }
      );
    case typeof options !== "object": // Ensure it's an object (Map)
      return NextResponse.json(
        { error: "Options must be an object." },
        { status: 400 }
      );
    case !advancedPreferences:
      return NextResponse.json(
        { error: "Advanced preferences are required." },
        { status: 400 }
      );
    case typeof advancedPreferences !== "object":
      return NextResponse.json(
        { error: "Advanced preferences must be an object." },
        { status: 400 }
      );
    case Object.keys(options).length === 0 && !advancedPreferences.freeResponse: // Check if it has keys
      return NextResponse.json(
        {
          error:
            "Options must contain at least one entry unless free response is enabled.",
        },
        { status: 400 }
      );
  }

  // Create a map for options with initial votes set to 0
  console.log(options);

  const pollId = uuidv4();
  const params = {
    TableName: "quick_poll",
    Item: {
      pollId,
      question,
      options: Object.fromEntries(Object.entries(options)), // Convert to entries before converting to object
      createdAt: new Date().toISOString(),
      advancedPreferences: advancedPreferences,
    },
  };

  try {
    await dynamoDb.send(new PutCommand(params));
    return NextResponse.json(
      { message: "Poll created successfully", pollId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: "Could not create poll, please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pollId = searchParams.get("pollId");

  const params = {
    TableName: "quick_poll",
    Key: { pollId },
  };

  try {
    const result = await dynamoDb.send(new GetCommand(params));
    if (result.Item) {
      // Ensure options is a Map when retrieved
      const responseItem = {
        ...result.Item,
        names: result.Item.names ? Array.from(result.Item.names) : [],
      };
      return NextResponse.json(responseItem, { status: 200 });
    } else {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }
  } catch {
    return NextResponse.json(
      { error: "Could not retrieve poll" },
      { status: 500 }
    );
  }
}
