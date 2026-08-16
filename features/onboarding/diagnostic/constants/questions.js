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
    type: "SHORT_TEXT",
    title: "Prompt Reliability",
    description: "Write at least one full sentence explaining your reasoning. Why does prompt B behave more reliably in production?",
    code: `// Prompt A
Extract the user's name and age from the text.

// Prompt B
Extract the user's name and age from the text.
Output MUST be valid JSON matching this schema:
{
  "name": "string",
  "age": "number"
}`,
    skippable: true,
  },
  {
    id: "q2b",
    type: "SHORT_TEXT",
    title: "Context Engineering",
    description:
      "You put your most important instruction in paragraph 5 of a 10-paragraph prompt. What's the fix, in 5 words or less?",
    skippable: true,
  },
  {
    id: "q3",
    type: "SHORT_TEXT",
    title: "Python Output",
    description: "What does this print? Enter the exact output.",
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
    type: "SHORT_TEXT",
    title: "LangChain / LCEL",
    description:
      "What goes in the blank to get a clean string back instead of a raw model object?",
    code: `chain = prompt | model | ______
  result = chain.invoke({"topic": "space"})`,
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
    type: "SHORT_TEXT",
    title: "FastAPI Concurrency",
    description:
      "What's missing that would make this fail as soon as a second person calls it while the first request is still processing?",
    code: `@app.post("/query")
  def query(question: str):
      answer = run_rag(question)
      return answer`,
   skippable: true,
  },
  {
    id: "q7b",
    type: "SHORT_TEXT",
    title: "Pydantic Reason",
    description:
      "What's the one-line reason to return a Pydantic model instead of a raw dict from your endpoint?",
    skippable: true,
  },
  {
    id: "q8",
    type: "SHORT_TEXT",
    title: "Chain vs Agent",
    description:
      'In one sentence, what is the actual difference between a "chain" and an "agent"?',
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
