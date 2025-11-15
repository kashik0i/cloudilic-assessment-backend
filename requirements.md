Cloudilic – Full‑Stack Developer Assessment
Task:
Build a web app using React Flow where users can create and connect workflow blocks to
process a PDF and interact with an AI assistant.
Workflow Nodes:
The left sidebar should contain three draggable nodes:
1. Input Node
   ○ Allows users to enter questions or prompts.
   ○ Should support multi-line text input.
2. RAG Node (Retrieve‑Augment‑Generate)
   ○ Allows uploading a PDF document.
   ○ Extracts and indexes the content for retrieval‑augmented generation (RAG).
   ○ Uses semantic search to retrieve relevant sections of the document when a
   query is made.
   ○ Passes the retrieved context along with the user’s query to the AI model (e.g.,
   OpenAI API).
3. Output Node
   ○ Displays AI responses based on the combined query and context.
   ○ Should support formatted responses (text, possibly future markdown).
   Functionality:
   ● Enable drag‑and‑drop to add these nodes to the canvas.
   ● Allow connecting nodes (e.g., input → RAG → output) to define the workflow.
   ● Add a Run button to execute the flow:
   ○ Extract content from the uploaded PDF.
   ○ Retrieve relevant sections for the user’s question using RAG.
   ○ Send the query and context to the OpenAI API.
   ○ Display the AI’s answer in the Output Node.
   Tools to use:
   ● Node.js + TypeScript for backend.
   ● React + React Flow for frontend.
   ● OpenAI API (key passed via .env).
   ● Helpful libraries (e.g., pdf-parse, vector DB for semantic search).
   Bonus for:
   ● Short‑term memory or simple retrieval implementation.
   ● Smart prompt design or multi‑step orchestration.
   Delivery:
   ● Submit via public GitHub repo.
   ● Include a README with setup/run instructions.
   ● Deploy the app (e.g., Vercel) and provide the live URL.
   ● Deadline: within 3 days of receiving the task.