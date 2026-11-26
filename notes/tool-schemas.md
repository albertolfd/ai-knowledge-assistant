# Tool schemas

Every custom tool is described to the model with a name, a description and an input schema. The input schema uses JSON Schema to define which arguments the tool accepts, their types, and which ones are required.

A simple schema for a notes search tool has one required property, `question`, of type string, with a description such as "The question to search for in the notes". The model fills in the arguments as a JSON object that should match this schema.

Descriptions matter at every level. The tool description tells the model when to use the tool, and each property description tells it what to put in that argument. A property called `filename` with the description "File name including the .md extension, e.g. docker-networking.md" produces far more consistent input than one without a description.

Use the schema to narrow the possibilities. An `enum` for values from a fixed set, explicit types and clearly marked required fields all reduce the room for mistakes. Keep schemas small: tools with many optional parameters are harder for the model to use correctly.

The model's output is not guaranteed to match the schema, so the application should validate tool input before executing anything, especially for tools with side effects. A validation library such as Zod can both validate the input and provide TypeScript types for it.

Tool names should be short, descriptive and consistent, such as `query_notes`, `search_web` and `save_note`. When an application offers many tools, overlapping names and descriptions confuse the model, so each tool should have a clearly distinct purpose.

Tool schemas count toward the context on every request. A large catalogue of tools has a real cost in tokens, which is one reason to expose only the tools a given task needs.
