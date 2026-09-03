export const QUESTIONS = [
  {
    id: "q1",
    type: "SINGLE_CHOICE",
    title: "Where are you starting from?",
    options: [
      {
        value: "never_touched_llm",
        label: "I've never used an LLM tool.",
      },
      {
        value: "casual_chatgpt_user",
        label:
          "I use ChatGPT or Claude casually, but haven't built with an API.",
      },
      {
        value: "called_api_before",
        label: "I've called an LLM API in code before.",
      },
      {
        value: "shipped_rag_or_agent",
        label: "I've shipped a RAG or agent project.",
      },
    ],
    skippable: false,
  },
  {
    id: "casual_api_usage",
    type: "SINGLE_CHOICE",
    title: "API Experience",
    description: "Have you ever called an LLM API (like OpenAI's API) directly from code, or just used ChatGPT in the browser?",
    options: [
      { value: "chat_only", label: "I've only used chat interfaces." },
      { value: "called_llm_api", label: "I've called an LLM API from code." },
    ],
    skippable: false,
  },
  {
    id: "technologies_used",
    type: "MULTI_SELECT",
    title: "Technologies Used",
    description: "Which of these have you worked with before? Select all that apply.",
    options: [
      { value: "langchain", label: "LangChain or LlamaIndex" },
      { value: "embeddings", label: "Embeddings / Vector DBs" },
      { value: "rag", label: "RAG (Retrieval-Augmented Generation)" },
      { value: "api_framework", label: "FastAPI / Flask / Express" },
      { value: "structured_outputs", label: "Structured Outputs / Function Calling" },
      { value: "agents", label: "LLM Agents" },
    ],
    skippable: false,
  },
  {
    id: "project_type",
    type: "SINGLE_CHOICE",
    title: "Project Type",
    description: "Which of these best describes what you shipped?",
    options: [
      { value: "rag", label: "A RAG (Retrieval-Augmented Generation) application." },
      { value: "agent", label: "An autonomous LLM Agent." },
      { value: "both", label: "Both RAG and Agent components." },
    ],
    skippable: false,
  },
  {
    id: "q2",
    type: "SINGLE_CHOICE",
    title: "Prompt Reliability",
    description: "Why does Prompt B behave more reliably in production?",
    code: `// Prompt A
Extract the user's name and age from the text.

// Prompt B
Extract the user's name and age from the text.
Output MUST be valid JSON matching this schema:
{
  "name": "string",
  "age": "number"
}`,
    options: [
      {
        value: "a",
        label: "It gives the model more tokens to work with.",
      },
      {
        value: "b",
        label: "It explicitly constrains the output to a defined JSON structure.",
      },
      {
        value: "c",
        label: "It removes the need to validate the model's output.",
      },
      {
        value: "d",
        label: "Making a prompt longer always makes it more reliable.",
      },
    ],
    skippable: true,
  },
  {
    id: "q2b",
    type: "SINGLE_CHOICE",
    title: "Context Engineering",
    description: "Where should an important instruction generally be placed in a long prompt?",
    options: [
      {
        value: "a",
        label: "Near the beginning, with reinforcement near the end when needed.",
      },
      {
        value: "b",
        label: "Only in the middle of the prompt.",
      },
      {
        value: "c",
        label: "Only at the very end of the prompt.",
      },
      {
        value: "d",
        label: "Its position does not matter.",
      },
    ],
    skippable: true,
  },
  {
    id: "q3",
    type: "SINGLE_CHOICE",
    title: "Python Output",
    description: "What does this code print?",
    code: `def process(items):
      result = []
      for item in items:
          if item.get("status") == "done":
              result.append(item["name"])
      return result

  data = [
      {"name": "A", "status": "done"},
      {"name": "B", "status": "pending"},
  ]

  print(process(data))`,
    options: [
      {
        value: "a",
        label: "['A']",
      },
      {
        value: "b",
        label: "['B']",
      },
      {
        value: "c",
        label: "['A', 'B']",
      },
      {
        value: "d",
        label: "[]",
      },
    ],
    skippable: true,
  },
  {
    id: "q3b",
    type: "SINGLE_CHOICE",
    title: "API Key Safety",
    description:
      "Where should you NEVER put an API key?",
    options: [
      {
        value: "a",
        label: "In a local .env file excluded from Git",
      },
      {
        value: "b",
        label: "Hardcoded in a committed .py file",
      },
      {
        value: "c",
        label:
          "Loaded from an environment variable at runtime",
      },
    ],
    skippable: true,
  },
  {
    id: "q4",
    type: "SINGLE_CHOICE",
    title: "LangChain / LCEL",
    description: "What should replace the blank to return a clean string from the model?",
    code: `chain = prompt | model | ______
  result = chain.invoke({"topic": "space"})`,
    options: [
      {
        value: "a",
        label: "StrOutputParser()",
      },
      {
        value: "b",
        label: "JsonOutputParser()",
      },
      {
        value: "c",
        label: "RunnablePassthrough()",
      },
      {
        value: "d",
        label: "ChatPromptTemplate()",
      },
    ],
    skippable: true,
  },
  {
    id: "q5",
    type: "SINGLE_CHOICE",
    title: "Embedding Similarity",
    description:
      "Which pair of phrases will have embeddings closer together in vector space?",
    options: [
      {
        value: "A",
        label:
          '"I want to return this product" / "How do I get a refund?"',
      },
      {
        value: "B",
        label:
          '"I want to return this product" / "I love this product"',
      },
    ],
    skippable: true,
  },
  {
    id: "q6",
    type: "ORDERING",
    title: "RAG Pipeline",
    description: "Order these steps to form a standard Retrieval-Augmented Generation pipeline (1 = first step).",
    items: [
      { id: "generate_answer", label: "Generate Answer" },
      { id: "chunk", label: "Chunk Document" },
      { id: "retrieve", label: "Retrieve Relevant Chunks" },
      { id: "load_document", label: "Load Document" },
      { id: "embed", label: "Embed Chunks" },
    ],
    skippable: true,
  },
  {
    id: "q7",
    type: "SINGLE_CHOICE",
    title: "FastAPI Concurrency",
    description: "If run_rag() is a blocking operation and this route is async, what should you do to avoid blocking FastAPI's event loop?",
    code: `@app.post("/query")
  async def query(question: str):
      answer = run_rag(question)
      return answer`,
    options: [
      {
        value: "a",
        label: "Run the blocking operation in a thread pool or worker.",
      },
      {
        value: "b",
        label: "Add more parameters to the endpoint.",
      },
      {
        value: "c",
        label: "Return a Pydantic model instead.",
      },
      {
        value: "d",
        label: "Make the prompt longer so the request takes more time.",
      },
    ],
    skippable: true,
  },
  {
    id: "q7b",
    type: "SINGLE_CHOICE",
    title: "Pydantic Reason",
    description: "Why return a Pydantic model instead of a raw dict from an API endpoint?",
    options: [
      {
        value: "a",
        label: "It provides validation and a clear response schema.",
      },
      {
        value: "b",
        label: "It makes every API request run asynchronously.",
      },
      {
        value: "c",
        label: "It removes the need for error handling.",
      },
      {
        value: "d",
        label: "It automatically makes the API faster.",
      },
    ],
    skippable: true,
  },
  {
    id: "q8",
    type: "SINGLE_CHOICE",
    title: "Chain vs Agent",
    description: "What is the key difference between a chain and an agent?",
    options: [
      {
        value: "a",
        label: "A chain follows a predefined sequence, while an agent can dynamically choose actions or tools.",
      },
      {
        value: "b",
        label: "A chain can only use Python, while an agent can only use JavaScript.",
      },
      {
        value: "c",
        label: "A chain always uses an API, while an agent never uses one.",
      },
      {
        value: "d",
        label: "There is no meaningful difference between them.",
      },
    ],
    skippable: true,
  },
  {
    id: "q9",
    type: "SINGLE_CHOICE",
    title: "Time Availability",
    description:
      "How much focused time can you give this on a normal day?",
    options: [
      { value: "20_30", label: "20–30 minutes" },
      { value: "45_60", label: "45–60 minutes" },
      { value: "90_plus", label: "90+ minutes" },
    ],
    skippable: false,
  },
  {
    id: "q10",
    type: "SINGLE_CHOICE",
    title: "Primary Goal",
    description: "What's pulling you toward this right now?",
    options: [
      {
        value: "internship_1_3_months",
        label: "Land an internship in the next 1–3 months",
      },
      {
        value: "build_product",
        label: "Build a real product or startup idea",
      },
      {
        value: "curiosity_general",
        label: "Curiosity or catching up on AI generally",
      },
    ],
    skippable: false,
  },
];
