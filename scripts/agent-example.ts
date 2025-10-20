import 'dotenv/config'
import { Agent, fileSearchTool, run } from "@openai/agents";

const devAgent = new Agent({
    name: "SDK Dev",
    systemPrompt: `
Read the per-symbol SDK files before coding. For every nontrivial SDK call,
include a citation like [SDK:Class.method]. If a required option is unclear:
FIND -> QUOTE -> DECIDE. Prefer examples from the index over guessing.
`,
    tools: [
        fileSearchTool([process.env.SDK_VECTOR_STORE_ID!])
    ],
});

const result = await run(devAgent, [
    { role: "user", content: "how to get user token from our client" }
]);

console.log(result.finalOutput);