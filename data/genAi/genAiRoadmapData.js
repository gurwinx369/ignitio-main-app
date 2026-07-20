// Gen AI Internship Roadmap — static data file
// Shape matches RoadmapTemplate schema exactly.
// Terminology mapping (per product spec):
//   roadmap "week" → DB "day"    (12 weeks = 12 days)
//   roadmap "day"  → DB "level"  (7 days per week = 7 levels per day)
//
// videoId: fill in YouTube IDs before going live.
// startSec / endSec: set per-segment timestamps once videos are added.

export const genAiRoadmapData = {
  id: "gen-ai-internship",
  title: "Gen AI Internship Roadmap",
  description:
    "12-week, 4-phase roadmap that takes you from zero to internship-ready in Generative AI engineering. Covers prompt engineering, Python, RAG, FastAPI, structured outputs, LangGraph agents, and evaluation.",
  concept: "Generative AI Engineering",
  transcript:
    "This roadmap is built on a single first principle: every week's work must directly connect to something a GenAI intern ships on day one. Phase 0 builds prompt and context intuition with zero code. Phase 1 teaches the minimum Python needed to read and modify LLM library code. Phase 2 assembles the full RAG + FastAPI stack layer by layer. Phase 3 adds agents, eval, and the portfolio that gets you hired.",

  days: [
    // ─── Week 1 — Prompt Engineering Basics ───────────────────────────────
    {
      id: "genai-w1",
      title: "Week 1 — Prompt Engineering: No Code, Pure Results",
      color: "#6366f1",
      levels: [
        {
          id: "GENAI_W1_L1",
          name: "Day 1 — Observing LLM Behaviour",
          title: "Day 1 — Observing LLM Behaviour",
          description:
            "Ask the same question 5 different ways. Notice how the answer changes. Understand tokens, context window, and temperature.",
          concept: "Tokens, Context Window, Temperature",
          transcript:
            "Open Claude or ChatGPT. Run the same prompt five different ways and study why the outputs differ. Read what a token is, how the context window limits total information, and what temperature does to output randomness. These three concepts are the atomic units of everything that follows.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W1_L2",
          name: "Day 2 — Zero-Shot vs Few-Shot",
          title: "Day 2 — Zero-Shot vs Few-Shot",
          description:
            "Classify customer reviews without examples, then with 3 examples. Compare accuracy and understand why examples help.",
          concept: "Zero-Shot, Few-Shot Prompting",
          transcript:
            "Ask Claude to classify ten customer reviews as positive or negative — first with no examples (zero-shot), then with three labelled examples (few-shot). Document the accuracy difference. This demonstrates the core insight: examples are the cheapest form of model steering available to you.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W1_L3",
          name: "Day 3 — Role Prompting + System Prompts",
          title: "Day 3 — Role Prompting + System Prompts",
          description:
            "Write a system prompt that turns Claude into a strict code reviewer. Test on 5 snippets and refine for consistency.",
          concept: "Role Prompting, System Prompts",
          transcript:
            "A system prompt is the persistent persona you assign an LLM before any user turn. Write one that makes Claude behave as a strict, no-praise code reviewer. Test it on five code snippets and iterate until outputs are deterministic in tone and structure. You are learning the diff between a system prompt and a user message.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W1_L4",
          name: "Day 4 — Chain-of-Thought + XML Tags",
          title: "Day 4 — Chain-of-Thought + XML Tags",
          description:
            "Compare answers with and without 'think step by step'. Use XML tags to structure complex prompts.",
          concept: "Chain-of-Thought, XML Structuring",
          transcript:
            "Ask Claude to solve five reasoning problems with 'think step by step' and five without. Observe reasoning quality. Then wrap your problem in XML tags so the LLM can clearly separate instructions from content. XML tags are the cheapest structure signal you can give a model.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W1_L5",
          name: "Day 5 — Output Format Control",
          title: "Day 5 — Output Format Control",
          description:
            "Request JSON, markdown tables, and numbered lists. Understand how format instructions change reliability.",
          concept: "Output Format Control, Structured Outputs Seed",
          transcript:
            "Prompt the LLM to return the same information as JSON, as a markdown table, and as a numbered list. Notice that format reliability varies dramatically by how specific your instruction is. This is the seed of structured outputs — the concept you will codify in code in Week 9.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W1_L6",
          name: "Day 6 — Reflection Prompting",
          title: "Day 6 — Reflection Prompting",
          description:
            "After Claude answers, prompt it to review its own reasoning for errors. Compare before and after quality.",
          concept: "Reflection Prompting, Self-Correction",
          transcript:
            "After Claude gives an answer, follow up with: 'Review your reasoning for errors and give a refined version.' Compare the two outputs. Reflection prompting is how production AI systems self-correct before returning answers to users. You are practising the pattern that drives AI quality loops.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W1_L7",
          name: "Day 7 — Build Your Prompt Library",
          title: "Day 7 — Build Your Prompt Library",
          description:
            "Create 10 reusable prompts (summarizer, code explainer, email drafter, bug finder, quiz maker) with system messages and few-shot examples.",
          concept: "Prompt Library, Reusable Prompt Patterns",
          transcript:
            "Build a personal library of ten prompts. Each must have a system message, at least two few-shot examples, and a documented use case. Include: summarizer, code explainer, email drafter, bug finder, quiz maker, flashcard generator, concept simplifier, journal reflector, meeting note extractor, and critique assistant. Save in a .txt file. This is your first reusable AI asset.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
      ],
    },

    // ─── Week 2 — Context Engineering ─────────────────────────────────────
    {
      id: "genai-w2",
      title: "Week 2 — Context Engineering: Designing Information Flow",
      color: "#8b5cf6",
      levels: [
        {
          id: "GENAI_W2_L1",
          name: "Day 8 — The Context Window Mental Model",
          title: "Day 8 — The Context Window Mental Model",
          description:
            "Understand Karpathy's definition of context engineering and the 4 context failure modes: poisoning, distraction, confusion, clash.",
          concept: "Context Engineering, Failure Modes",
          transcript:
            "Context engineering is the art of filling the context window with exactly the right information. Read Andrej Karpathy's definition. Study the four failure modes: poisoning (bad data contaminates reasoning), distraction (irrelevant data dilutes focus), confusion (contradictory data breaks logic), clash (conflicting instructions fight each other). Every RAG bug you fix in Week 7 will trace to one of these.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W2_L2",
          name: "Day 9 — Context Overflow Experiment",
          title: "Day 9 — Context Overflow Experiment",
          description:
            "Paste a 5-page document vs. 2 relevant paragraphs. See quality difference. Understand why RAG exists.",
          concept: "Context Overflow, RAG Motivation",
          transcript:
            "Paste a five-page document into Claude and ask a specific question. Then paste only the two most relevant paragraphs and ask the same question. The quality gap is stark. This is the exact problem RAG solves — instead of dumping a library into the context, you retrieve only the relevant pages.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W2_L3",
          name: "Day 10 — Lost in the Middle Effect",
          title: "Day 10 — Lost in the Middle Effect",
          description:
            "Hide the answer in paragraph 5 of 10, then move it to paragraph 1. Observe accuracy change. Understand why chunking strategy matters.",
          concept: "Lost in the Middle, Chunking Strategy",
          transcript:
            "Paste ten paragraphs with the answer buried in paragraph five. Ask Claude to find it. Then move the answer to paragraph one and repeat. The accuracy difference reveals the lost-in-the-middle phenomenon: LLMs are significantly more reliable on information placed at the start or end of the context. This is why your RAG chunk ordering matters.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W2_L4",
          name: "Day 11 — Static vs Dynamic Context",
          title: "Day 11 — Static vs Dynamic Context",
          description:
            "Design a prompt with a fixed role (static) and dynamically injected user data. Understand the two-layer context architecture.",
          concept: "Static Context, Dynamic Context",
          transcript:
            "System prompts are static: the same instructions appear on every call. User-retrieved information is dynamic: it changes per query. Design a prompt that combines both. Give the LLM a fixed expert persona in the system prompt, then inject dynamic user-specific data in the human turn. This two-layer architecture is how every production AI assistant is built.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W2_L5",
          name: "Day 12 — Context Ordering Matters",
          title: "Day 12 — Context Ordering Matters",
          description:
            "Put the most important instruction at the start and end of your context. Test hiding format instruction in the middle vs. the end.",
          concept: "Context Ordering, Instruction Placement",
          transcript:
            "Put the most important instruction at the START and END of your context, never in the middle. Test this: hide the output format instruction in paragraph five of a ten-paragraph prompt, then move it to the final line. See what changes. The practical rule is: anchors go first, format goes last, filler goes in the middle.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W2_L6",
          name: "Day 13 — Conversation History as Context",
          title: "Day 13 — Conversation History as Context",
          description:
            "Simulate 5 turns of conversation. See what happens when you add or remove earlier messages. Understand memory management.",
          concept: "Conversation History, Memory Management",
          transcript:
            "Manually simulate five turns of a conversation. Add a turn, remove an earlier turn, and observe how the LLM's responses change. This is what memory management means in agents. Every agent framework you use in Week 10 is doing this bookkeeping for you automatically — but you need to understand what it is managing.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W2_L7",
          name: "Day 14 — Context Architecture Design Exercise",
          title: "Day 14 — Context Architecture Design Exercise",
          description:
            "Design the context architecture for a customer support bot: what goes in the system prompt, what gets retrieved, what history is kept.",
          concept: "Context Architecture Design",
          transcript:
            "On paper or in notes, design the full context architecture for a customer support bot. Answer three questions: What goes in the system prompt (static)? What gets retrieved per user query (dynamic)? What conversation history is preserved across turns (rolling memory)? No code. This architecture thinking is what senior engineers and CTOs pay for. You will build this in Month 2.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
      ],
    },

    // ─── Week 3 — Python for AI ────────────────────────────────────────────
    {
      id: "genai-w3",
      title: "Week 3 — Python Vocabulary for AI Work",
      color: "#f59e0b",
      levels: [
        {
          id: "GENAI_W3_L1",
          name: "Day 15 — Variables, Strings, f-strings",
          title: "Day 15 — Variables, Strings, f-strings",
          description:
            "Variables, strings, integers, booleans, None. f-strings for building prompts programmatically.",
          concept: "Python Basics, f-strings",
          transcript:
            "Learn variables, strings, integers, booleans, and None. Master f-strings immediately — you will use them every single day to inject dynamic data into prompts. Practice building five different prompt strings using f-strings with variable substitution.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W3_L2",
          name: "Day 16 — Lists and Dicts",
          title: "Day 16 — Lists and Dicts",
          description:
            "Lists and dicts are how LLM conversation history is stored. Practice adding, updating, and looping over them.",
          concept: "Python Lists, Dicts, LLM Message Format",
          transcript:
            "LLM conversation history is stored as a list of dicts: [{role: 'user', content: '...'}, {role: 'assistant', content: '...'}]. Practice creating, modifying, and iterating over lists and dicts until this shape feels natural. Every LangChain chain you write passes this structure around.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W3_L3",
          name: "Day 17 — Functions",
          title: "Day 17 — Functions",
          description:
            "def, return, parameters, default values. You will wrap every LLM call in a function.",
          concept: "Python Functions, Encapsulation",
          transcript:
            "Learn to write functions with def, return values, positional parameters, and keyword parameters with defaults. Every LLM call you make in production is wrapped in a function. Practice writing five LLM-call-shaped functions: one that formats a prompt, one that parses a JSON response, one that retries on failure, one that logs, and one that combines them all.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W3_L4",
          name: "Day 18 — If/Else + For Loops",
          title: "Day 18 — If/Else + For Loops",
          description:
            "Control flow for iterating over lists of documents or messages. The core pattern you will use in every pipeline.",
          concept: "Control Flow, Iteration",
          transcript:
            "Learn if/else and for loops. In AI pipelines these appear everywhere: looping over a list of documents to embed them, checking if a retrieved chunk is above a similarity threshold, routing a message to a different handler based on intent. Practise writing a loop that processes a list of messages and filters by a condition.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W3_L5",
          name: "Day 19-20 — pip + Virtual Environment",
          title: "Day 19-20 — pip + Virtual Environment",
          description:
            "Install pip, create a virtual environment, and understand why isolation matters for AI projects.",
          concept: "pip, Virtual Environments, Dependency Isolation",
          transcript:
            "Install pip and learn to create a virtual environment with python -m venv. Understand why isolation is critical: AI projects depend on specific versions of libraries that conflict with each other. Activate your environment, install the openai package, and verify the install. Every project you run in this roadmap lives in its own virtual environment.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W3_L6",
          name: "Day 21 — Raw API Call to OpenAI",
          title: "Day 21 — Raw API Call to OpenAI",
          description:
            "Write a Python file that calls the ChatGPT API using requests. Print and parse the JSON response.",
          concept: "HTTP Requests, JSON Parsing, OpenAI API",
          transcript:
            "Write a Python script that calls the OpenAI API using the requests library directly. No SDK, no wrapper. Print the raw response and then parse the JSON to extract the completion text. Understanding the raw HTTP layer makes every SDK abstraction transparent. Build three scripts: a prompt formatter, a message history builder, and a raw API call.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W3_L7",
          name: "Day 21 — Build: Three Foundation Scripts",
          title: "Day 21 — Build: Three Foundation Scripts",
          description:
            "Polish and push your prompt formatter, message history builder, and raw API call scripts to GitHub.",
          concept: "Python Project Build",
          transcript:
            "Combine everything from Days 15-21 into three clean scripts. The prompt formatter uses f-strings to build a templated prompt from variables. The message history builder creates and manages the [{role, content}] list. The raw API caller sends a request to OpenAI and parses the result. Document each with a comment block. These are your first portfolio files.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
      ],
    },

    // ─── Week 4 — Files, JSON, .env, Error Handling ────────────────────────
    {
      id: "genai-w4",
      title: "Week 4 — Files, JSON, .env, Error Handling",
      color: "#ef4444",
      levels: [
        {
          id: "GENAI_W4_L1",
          name: "Day 22 — Reading and Writing Files",
          title: "Day 22 — Reading and Writing Files",
          description:
            "Read .txt files with open(). You will load documents this way to feed into LLMs.",
          concept: "File I/O, open()",
          transcript:
            "Learn to read and write text files using Python's open() function. You will load documents this way every time you build a RAG pipeline over a local file. Practice reading a text file, processing each line, and writing results to a new file. This is the I/O primitive that connects your filesystem to your LLM.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W4_L2",
          name: "Day 23 — JSON: loads and dumps",
          title: "Day 23 — JSON: loads and dumps",
          description:
            "json.loads() and json.dumps(). Every API returns JSON. Every structured LLM output is JSON.",
          concept: "JSON Parsing, Serialisation",
          transcript:
            "Learn json.loads() to parse a JSON string into a Python dict, and json.dumps() to convert a dict back to JSON. Every LLM API response arrives as JSON. Every structured output your LLM returns — answer, sources, confidence — is JSON. Practise parsing an API response and extracting fields from nested structures.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W4_L3",
          name: "Day 24 — .env Files + python-dotenv",
          title: "Day 24 — .env Files + python-dotenv",
          description:
            "Never hardcode API keys. Set up a .env with your OpenAI key and load it in Python.",
          concept: ".env Files, Secrets Management",
          transcript:
            "Create a .env file, add your OpenAI API key, add .env to .gitignore, and load it using python-dotenv. Never hardcode API keys in source code. In production, secrets come from environment variables, not files — but dotenv is the local development pattern. This is day one security hygiene.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W4_L4",
          name: "Day 25 — try/except Error Handling",
          title: "Day 25 — try/except Error Handling",
          description:
            "LLM APIs fail, hit rate limits, and return malformed JSON. Wrap every call with try/except.",
          concept: "Error Handling, Retry Logic",
          transcript:
            "LLM APIs fail with rate limits, network timeouts, and malformed JSON. Wrap every call in try/except. Learn to catch specific exception types, log the error, and either retry or return a meaningful failure message. Practise writing a function that retries an API call up to three times with exponential backoff.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W4_L5",
          name: "Day 26 — Git Basics",
          title: "Day 26 — Git Basics",
          description:
            "git init, add, commit, push. Version control is non-negotiable for portfolio work.",
          concept: "Git, Version Control",
          transcript:
            "Learn git init, git add, git commit, and git push. Create a .gitignore that excludes .env, __pycache__, and virtual environment folders. Commit your Week 3 scripts. Version control is not optional — every interviewer will look at your commit history as a signal of professionalism.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W4_L6",
          name: "Day 27-28 — GitHub Setup",
          title: "Day 27-28 — GitHub Setup",
          description:
            "Create a GitHub repo, write a README, and push your Week 3 + 4 scripts.",
          concept: "GitHub, Portfolio Setup",
          transcript:
            "Create a public GitHub repository. Write a README that explains what the project does, how to run it, and what you learned. Push all scripts from Weeks 3 and 4. A good README is the first thing a recruiter sees — invest 30 minutes in it. This is your first portfolio entry.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W4_L7",
          name: "Day 28 — Build: Document Summariser Script",
          title: "Day 28 — Build: Document Summariser Script",
          description:
            "Read a .txt document, send it to the OpenAI API, and save the summary to a new file. Push to GitHub.",
          concept: "End-to-End Script Build",
          transcript:
            "Build and push a complete script that reads a text document from disk, sends it to the OpenAI API with a summarisation prompt, and writes the result to a new file. Use .env for the API key, wrap the call in try/except, and commit with a clean README. This is your first complete AI tool.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
      ],
    },

    // ─── Week 5 — LangChain First Contact ─────────────────────────────────
    {
      id: "genai-w5",
      title: "Week 5 — LangChain First Contact",
      color: "#10b981",
      levels: [
        {
          id: "GENAI_W5_L1",
          name: "Day 29 — What LangChain Is",
          title: "Day 29 — What LangChain Is",
          description:
            "LangChain wires LLMs to data and tools. Run a hello world chain.",
          concept: "LangChain Introduction",
          transcript:
            "LangChain is a library that wires LLMs to data sources and tools. It provides the plumbing so you don't reinvent it. Install langchain and langchain-openai. Run a hello world chain that takes a prompt, passes it to a model, and returns a response. Understand that LangChain's core job is composability — chaining steps together.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W5_L2",
          name: "Day 30 — PromptTemplate",
          title: "Day 30 — PromptTemplate",
          description:
            "Build a reusable prompt that takes variables. Connect your Week 2 prompt library to Python templates.",
          concept: "PromptTemplate, Variable Injection",
          transcript:
            "PromptTemplate turns your Week 2 prompt library into reusable Python objects. Define a template with input variables, call it with different inputs, and observe how it generates the final prompt string. Connect three prompts from your library to PromptTemplate objects.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W5_L3",
          name: "Day 31 — ChatPromptTemplate",
          title: "Day 31 — ChatPromptTemplate",
          description:
            "Build chat-format prompts with system + human message templates.",
          concept: "ChatPromptTemplate, Message Roles",
          transcript:
            "ChatPromptTemplate lets you define system and human messages separately with variables in both. Use it to build a templated version of your Day 3 code reviewer system prompt. Invoke it with five different code snippets. This is the production-grade way to build multi-turn AI interactions.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W5_L4",
          name: "Day 32 — LCEL Pipe Operator",
          title: "Day 32 — LCEL Pipe Operator",
          description:
            "prompt | model | parser — chain 3 steps in one line. Understand the composability of LCEL.",
          concept: "LCEL, LangChain Expression Language",
          transcript:
            "LCEL's pipe operator connects components: prompt | model | parser. Each component receives the output of the previous one. The left-to-right composition is readable and debuggable. Build a chain that: formats a prompt, sends it to the model, and parses the output to a string. Add a fourth step that logs the result.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W5_L5",
          name: "Day 33 — Summariser and Classifier Chains",
          title: "Day 33 — Summariser and Classifier Chains",
          description:
            "Build a summariser chain and a sentiment classifier chain using LCEL.",
          concept: "Chain Building, Use Cases",
          transcript:
            "Build two chains using LCEL. The first summarises a text input. The second classifies it as positive, negative, or neutral. Both should use ChatPromptTemplate + model + StrOutputParser. Run each against five inputs. These two chains cover the majority of production text-processing use cases.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W5_L6",
          name: "Day 34 — Conversation Memory",
          title: "Day 34 — Conversation Memory",
          description:
            "Add conversation history to your chatbot so it remembers earlier messages across turns.",
          concept: "Conversation Memory, Stateful Chains",
          transcript:
            "Add memory to your LangChain chatbot so it tracks the last five messages. This connects directly to Day 13's conversation history exercise — LangChain is automating the list management you did manually. Understand what ConversationBufferWindowMemory does and why the window size matters for token budget.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W5_L7",
          name: "Day 35 — Build: Multi-Turn Chatbot",
          title: "Day 35 — Build: Multi-Turn Chatbot",
          description:
            "Build a multi-turn chatbot using LangChain that remembers your last 5 messages. Push to GitHub.",
          concept: "Chatbot Build, Memory Integration",
          transcript:
            "Ship a complete multi-turn chatbot that uses ChatPromptTemplate, a model, StrOutputParser, and ConversationBufferWindowMemory. It should run in the terminal, accept user input in a loop, and maintain conversation history across turns. Write a README explaining how it connects to your Phase 0 context engineering work. Push to GitHub.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 90,
        },
      ],
    },

    // ─── Week 6 — Embeddings + Vector Databases ───────────────────────────
    {
      id: "genai-w6",
      title: "Week 6 — Embeddings + Vector Databases",
      color: "#3b82f6",
      levels: [
        {
          id: "GENAI_W6_L1",
          name: "Day 36 — What Is an Embedding",
          title: "Day 36 — What Is an Embedding",
          description:
            "Text converted to numbers that capture meaning. Similar text = similar numbers = close together in vector space.",
          concept: "Embeddings, Semantic Meaning",
          transcript:
            "An embedding is a list of numbers that represents the meaning of a piece of text. Similar meaning produces similar numbers, which means similar embeddings sit close together in high-dimensional space. This is how search-by-meaning works. Generate embeddings for five sentence pairs and compute their cosine similarity to observe the closeness.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W6_L2",
          name: "Day 37 — Chunking",
          title: "Day 37 — Chunking",
          description:
            "Why you split documents, what chunk_size and chunk_overlap do. Experiment with different sizes.",
          concept: "Text Chunking, chunk_size, chunk_overlap",
          transcript:
            "You cannot embed an entire book — models have token limits. You split it into chunks first. chunk_size controls how many characters per chunk. chunk_overlap creates overlap between adjacent chunks so context is not lost at boundaries. Experiment with chunk_size=200, 500, and 1000 on one document. Note how retrieved results change.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W6_L3",
          name: "Day 38 — Chunk Quality Experiments",
          title: "Day 38 — Chunk Quality Experiments",
          description:
            "Run a question against chunks of different sizes. Find where answers break. This is your first eval mindset.",
          concept: "Chunk Quality, Retrieval Evaluation",
          transcript:
            "Take one document and one specific question. Embed the document at chunk_size=200 and retrieve the top-3 chunks. Repeat at chunk_size=1000. Compare which chunk set contains the actual answer. The chunk size that reliably retrieves the relevant section is your baseline. This is your first eval run.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W6_L4",
          name: "Day 39 — FAISS Setup",
          title: "Day 39 — FAISS Setup",
          description:
            "Embed 20 text chunks, store them in FAISS, and run similarity_search().",
          concept: "FAISS, Vector Store, similarity_search",
          transcript:
            "FAISS is Facebook AI's fast similarity search library. Install it, embed 20 text chunks using an OpenAI embedding model, store them in a FAISS index, and run similarity_search() with a query. Print which chunks were retrieved and understand why they matched — the embedding of the query is close in vector space to the embeddings of the retrieved chunks.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W6_L5",
          name: "Day 40 — ChromaDB",
          title: "Day 40 — ChromaDB",
          description:
            "ChromaDB as a persistent vector store. Understand top-k retrieval.",
          concept: "ChromaDB, Persistent Vector Store",
          transcript:
            "ChromaDB is a local, persistent vector database. Unlike FAISS which lives in memory, ChromaDB saves to disk between runs. Install it, create a collection, embed your chunks, and run queries. Understand top-k: you always retrieve the k most similar chunks, not a single answer. Your code decides what k is.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W6_L6",
          name: "Day 41 — Connect to Phase 0",
          title: "Day 41 — Connect to Phase 0",
          description:
            "The retrieved chunks ARE the dynamic context you designed on paper in Day 14. Make the mental connection explicit.",
          concept: "RAG = Context Engineering in Code",
          transcript:
            "Stop. Open your Day 14 context architecture design. Read what you wrote about 'what gets retrieved per query.' You are now building that exact system in code. The chunks you retrieve from FAISS or Chroma are the dynamic context that gets injected into the LLM's prompt. RAG is context engineering implemented in software.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W6_L7",
          name: "Day 42 — Build: FAQ Semantic Search",
          title: "Day 42 — Build: FAQ Semantic Search",
          description:
            "Embed 30 FAQ items into FAISS. Query with 5 questions. Print which chunks were retrieved and why they matched.",
          concept: "Build: Semantic FAQ Search",
          transcript:
            "Embed 30 FAQ items into a FAISS index. Write five natural-language queries that are NOT exact matches to any FAQ. Run similarity_search() and print the top-3 retrieved FAQs for each query. Annotate which ones are semantically correct and which are wrong. This is your first retrieval quality assessment.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 90,
        },
      ],
    },

    // ─── Week 7 — RAG Pipeline End-to-End ────────────────────────────────
    {
      id: "genai-w7",
      title: "Week 7 — RAG Pipeline End-to-End",
      color: "#ec4899",
      levels: [
        {
          id: "GENAI_W7_L1",
          name: "Day 43 — Document Loaders",
          title: "Day 43 — Document Loaders",
          description:
            "PyPDFLoader and TextLoader. Load a real PDF you care about.",
          concept: "Document Loaders, PDF Ingestion",
          transcript:
            "LangChain document loaders handle the messy work of extracting text from PDFs, Word files, web pages, and more. Install pypdf and use PyPDFLoader to load a real PDF. Print the first page's content. Then try TextLoader on a text file. The output is a list of Document objects with page_content and metadata.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W7_L2",
          name: "Day 44-45 — Build the Full Pipeline",
          title: "Day 44-45 — Build the Full Pipeline",
          description:
            "Load → split → embed → store → retrieve. The context engineering system from Day 14, now in code.",
          concept: "RAG Pipeline Construction",
          transcript:
            "Build the complete five-step pipeline: load the document, split into chunks, embed each chunk, store in a vector database, and retrieve top-k relevant chunks for a query. Each step is one or two lines with LangChain. The pipeline is the concrete implementation of the context architecture you designed on Day 14.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 90,
        },
        {
          id: "GENAI_W7_L3",
          name: "Day 46 — Stuff Retrieved Chunks into a Prompt",
          title: "Day 46 — Stuff Retrieved Chunks into a Prompt",
          description:
            "Inject retrieved chunks into a prompt and generate an answer. Return source document names.",
          concept: "Retrieval Augmented Generation, Source Attribution",
          transcript:
            "Take your retrieved chunks and format them into a prompt: 'Based on the following context, answer the question. Context: {chunks}. Question: {question}.' Send to the LLM. Return both the answer and the source document names. Source attribution is non-optional in production RAG — users need to verify claims.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W7_L4",
          name: "Day 47 — Generate Answer with Sources",
          title: "Day 47 — Generate Answer with Sources",
          description:
            "Return a formatted answer with source document names alongside it.",
          concept: "Answer Generation, Source Attribution",
          transcript:
            "Extend your pipeline so the final output includes the answer and the list of source documents that contributed to it. Format this as a clean dict: {answer: str, sources: list[str]}. Print it. This exact shape will become your Pydantic response model in Week 9.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W7_L5",
          name: "Day 48 — Chunk Quality: 200 vs 1000",
          title: "Day 48 — Chunk Quality: 200 vs 1000",
          description:
            "Compare chunk_size=200 vs chunk_size=1000. Find where answers break. Eval mindset.",
          concept: "Chunk Size Evaluation",
          transcript:
            "Run your RAG pipeline on the same PDF with chunk_size=200 and chunk_size=1000. Ask ten real questions. Note which chunk size gives better answers for which question types. Short factual questions often work better with smaller chunks. Conceptual questions often work better with larger chunks. Document your findings.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W7_L6",
          name: "Day 49 — Ask 10 Real Questions",
          title: "Day 49 — Ask 10 Real Questions",
          description:
            "Ask your RAG app 10 real questions. Note where it fails. This is your first manual eval.",
          concept: "Manual RAG Evaluation",
          transcript:
            "Ask your RAG app ten real questions about the PDF. For each, note: did it retrieve the right chunk? Did it answer correctly? Where did it fail? Write this down. Categorise failures as retrieval failures (wrong chunk retrieved) vs generation failures (right chunk but wrong answer). You will fix these systematically in Week 11 with RAGAS.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W7_L7",
          name: "Day 49 — Build: RAG App over PDF",
          title: "Day 49 — Build: RAG App over PDF",
          description:
            "Ship a complete RAG app over a PDF you care about. Push to GitHub with README.",
          concept: "Build: Complete RAG Pipeline",
          transcript:
            "Ship a clean, documented RAG application over a PDF you care about. It must load, chunk, embed, store, retrieve, and generate answers with sources. Include a README with architecture diagram, setup instructions, and your ten evaluation questions with pass/fail notes. Push to GitHub. This is your first real AI project.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 90,
        },
      ],
    },

    // ─── Week 8 — FastAPI ─────────────────────────────────────────────────
    {
      id: "genai-w8",
      title: "Week 8 — FastAPI: Wrap RAG as an API",
      color: "#14b8a6",
      levels: [
        {
          id: "GENAI_W8_L1",
          name: "Day 50 — FastAPI Hello World",
          title: "Day 50 — FastAPI Hello World",
          description:
            "@app.get() and @app.post(). Run with uvicorn. Visit /docs — show this in every interview.",
          concept: "FastAPI, Uvicorn, Swagger UI",
          transcript:
            "Install FastAPI and uvicorn. Write a hello world GET endpoint. Run uvicorn app:app --reload. Open /docs in the browser. The automatic Swagger UI documentation is one of FastAPI's most impressive interview demo points — show it in every single interview. It demonstrates that your API is self-documenting and ready for integration.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W8_L2",
          name: "Day 51 — Pydantic Request Models",
          title: "Day 51 — Pydantic Request Models",
          description:
            "Pydantic models for request validation. Structured inputs applied to your API layer.",
          concept: "Pydantic, Request Validation",
          transcript:
            "Define a Pydantic BaseModel for your POST request body. FastAPI uses it to automatically validate incoming JSON, reject malformed requests with clear error messages, and generate documentation. This connects back to Day 5's output format control — you are now enforcing format on both inputs and outputs.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W8_L3",
          name: "Day 52 — Pydantic Response Models",
          title: "Day 52 — Pydantic Response Models",
          description:
            "Define the shape of your API response with a Pydantic model.",
          concept: "Pydantic Response Models, API Contracts",
          transcript:
            "Define a response model for your endpoint: class QueryResponse(BaseModel): answer: str; sources: list[str]; confidence_note: str. FastAPI will validate and serialize it automatically. A typed response model is a contract between your API and any client that calls it. Break the contract and the client breaks immediately — which is better than silent data corruption.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W8_L4",
          name: "Day 53 — async def + await",
          title: "Day 53 — async def + await",
          description:
            "Why LLM calls need async. One concept, 30 minutes, done.",
          concept: "Async/Await, Concurrency",
          transcript:
            "Define your endpoint as async def. Use await when calling the LLM. An async endpoint can handle multiple requests concurrently without blocking. A synchronous endpoint handles one at a time — the second request waits while the first is waiting for the LLM to respond. This is the single most important FastAPI concept for production AI APIs.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W8_L5",
          name: "Day 54-55 — Wrap RAG as a POST Endpoint",
          title: "Day 54-55 — Wrap RAG as a POST Endpoint",
          description:
            "POST /query → runs your RAG pipeline → returns answer + sources as JSON.",
          concept: "RAG API Integration",
          transcript:
            "Wrap your Week 7 RAG pipeline in a FastAPI POST /query endpoint. Accept a QueryRequest body with a question field. Run the RAG pipeline. Return a QueryResponse with answer, sources, and confidence_note. Test it via the /docs Swagger UI. You now have a deployable AI API.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 90,
        },
        {
          id: "GENAI_W8_L6",
          name: "Day 56 — Add CORS",
          title: "Day 56 — Add CORS",
          description:
            "Add CORS middleware so any frontend can call your API.",
          concept: "CORS, API Production Readiness",
          transcript:
            "Add CORS middleware to your FastAPI app using CORSMiddleware. Set allow_origins to your frontend URL or [*] for development. Without CORS, browsers block cross-origin requests to your API. With it, any frontend application can call your AI API. Test it from a simple HTML page with a fetch() call.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W8_L7",
          name: "Day 56 — Build: Deployable AI API",
          title: "Day 56 — Build: Deployable AI API",
          description:
            "POST /query returns answer + sources as JSON. Test it. Push to GitHub.",
          concept: "Build: Production-Ready RAG API",
          transcript:
            "Ship a clean FastAPI app with async POST /query endpoint, Pydantic request/response models, CORS enabled, and error handling. Test it via Swagger UI and via a curl command. Write a README with the curl command so anyone can run it. Push to GitHub. This is a real, usable AI API — a hiring manager can run it in five minutes.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
      ],
    },

    // ─── Week 9 — Structured Outputs + Pydantic ───────────────────────────
    {
      id: "genai-w9",
      title: "Week 9 — Structured Outputs + Pydantic",
      color: "#f97316",
      levels: [
        {
          id: "GENAI_W9_L1",
          name: "Day 57 — Why Structured Outputs",
          title: "Day 57 — Why Structured Outputs",
          description:
            "LLMs return strings. Strings break downstream code. Pydantic enforces a schema on the output.",
          concept: "Structured Outputs, Type Safety",
          transcript:
            "LLMs return unstructured strings. If your code expects an answer field and the LLM formats it differently, your code breaks silently. Structured outputs enforce a schema so the LLM is forced to return data in a predictable shape. You practised this manually in Day 5 — now you will automate it in code.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W9_L2",
          name: "Day 58 — instructor Library",
          title: "Day 58 — instructor Library",
          description:
            "instructor + Pydantic: define a class with fields, pass it to the LLM, get back a validated object.",
          concept: "instructor, Pydantic Extraction",
          transcript:
            "The instructor library patches OpenAI and Anthropic clients to return Pydantic model instances instead of strings. Define a class with the fields you want, pass it to the patched client, and get back a validated Python object. This is your Phase 0 output format control, fully automated and type-safe.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W9_L3",
          name: "Day 59 — Pydantic Output Schema",
          title: "Day 59 — Pydantic Output Schema",
          description:
            "Define the extraction schema: answer, sources, confidence_note. Validate the LLM response.",
          concept: "Pydantic Schema Definition",
          transcript:
            "Define your RAG response as a Pydantic model: class RAGResponse(BaseModel): answer: str; sources: list[str]; confidence_note: str. Pass this to instructor. The LLM is now constrained to fill in these exact fields. If it cannot, instructor raises a ValidationError instead of returning garbage.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W9_L4",
          name: "Day 60-61 — Apply to Your RAG",
          title: "Day 60-61 — Apply to Your RAG",
          description:
            "Instead of returning a raw string, return a Pydantic model: answer, sources, confidence_note.",
          concept: "Structured RAG Output Integration",
          transcript:
            "Replace the raw string return in your Week 7 RAG app with the RAGResponse Pydantic model. Your pipeline now returns a validated Python object with named fields. Feed this directly into your FastAPI response model. Your entire stack is now type-safe from LLM output to HTTP response.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 90,
        },
        {
          id: "GENAI_W9_L5",
          name: "Day 62 — Review Weeks 6-9",
          title: "Day 62 — Review Weeks 6-9",
          description:
            "You now have a complete RAG + FastAPI + structured output system. Review the architecture.",
          concept: "Architecture Review",
          transcript:
            "Draw the architecture of what you have built: document loader → chunker → embedder → vector store → retriever → prompt formatter → LLM → Pydantic structured output → FastAPI endpoint → JSON response. Every box is a distinct component you can explain, test, and improve independently. This is what you walk through in the interview.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W9_L6",
          name: "Day 63 — Document on GitHub",
          title: "Day 63 — Document on GitHub",
          description:
            "Update README with architecture, components, and setup. Add an architecture diagram.",
          concept: "Technical Documentation",
          transcript:
            "Update your GitHub README to include: the architecture diagram (even as ASCII art), a list of components and what each does, setup instructions with exact commands, and example input/output. A well-documented project signals engineering maturity. The README is read by recruiters before a single line of code.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W9_L7",
          name: "Day 63 — Build: Structured RAG API",
          title: "Day 63 — Build: Structured RAG API",
          description:
            "RAG API that returns answer, source_docs, and confidence_note as a validated Pydantic response. Push and document.",
          concept: "Build: Final RAG + Structured Output Stack",
          transcript:
            "Ship the final RAG API: FastAPI endpoint, Pydantic request and response models, RAGResponse with answer/sources/confidence_note, instructor for structured LLM output, CORS, async, error handling, and complete GitHub documentation. This is a production-grade AI API. Every component in it maps to a concept from Phase 0.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 90,
        },
      ],
    },

    // ─── Week 10 — LangGraph: First Agent ────────────────────────────────
    {
      id: "genai-w10",
      title: "Week 10 — LangGraph: Your First Agent",
      color: "#7c3aed",
      levels: [
        {
          id: "GENAI_W10_L1",
          name: "Day 64 — What Is an Agent",
          title: "Day 64 — What Is an Agent",
          description:
            "An agent is an LLM that decides what tool to use next based on current state. Not a chain — a loop.",
          concept: "Agent vs Chain, Loop vs Fixed Path",
          transcript:
            "A chain runs fixed steps in a fixed order every time. An agent decides at runtime what to do next based on the current state. The LLM looks at its current context, available tools, and prior outputs, then chooses the next action. It loops until it decides it has a final answer. This is fundamentally different from a chain.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W10_L2",
          name: "Day 65 — LangGraph State + Nodes",
          title: "Day 65 — LangGraph State + Nodes",
          description:
            "TypedDict state, functions as nodes. Build the simplest possible graph.",
          concept: "LangGraph State, Nodes",
          transcript:
            "LangGraph represents an agent as a graph. State is a TypedDict that all nodes read and write. Nodes are Python functions that take state and return a partial state update. Build the simplest possible graph: one node that receives a message, calls the LLM, and returns the response. Compile and run it.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W10_L3",
          name: "Day 66 — Edges + Conditional Routing",
          title: "Day 66 — Edges + Conditional Routing",
          description:
            "Conditional edges as decisions. This is how an agent decides whether to call a tool or return an answer.",
          concept: "LangGraph Edges, Conditional Routing",
          transcript:
            "Edges connect nodes. Conditional edges let the graph route to different nodes based on state. Add a conditional edge that routes to a 'call tool' node if the LLM decided to use a tool, or to 'END' if it has a final answer. This routing logic is what makes an agent dynamic instead of linear.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W10_L4",
          name: "Day 67 — @tool Decorator",
          title: "Day 67 — @tool Decorator",
          description:
            "Define tools the agent can call using the @tool decorator.",
          concept: "@tool Decorator, Tool Definition",
          transcript:
            "The @tool decorator turns a Python function into a tool the agent can call. The function's docstring tells the LLM what the tool does and when to use it. Define a web search tool and a calculator tool. Bind them to your LLM using bind_tools(). The LLM will now include tool call decisions in its outputs.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W10_L5",
          name: "Day 68 — Tool Execution Node",
          title: "Day 68 — Tool Execution Node",
          description:
            "Build a node that executes the tool the LLM selected. Watch the agent decide which tool to use.",
          concept: "Tool Execution, Agent Loop",
          transcript:
            "Add a tool execution node that reads the LLM's tool call from state, executes the selected tool, and writes the result back to state. The loop continues: state goes back to the LLM, which reads the tool result and decides whether to call another tool or produce a final answer. Watch the agent reason step by step.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W10_L6",
          name: "Day 69-70 — Agent State as Context",
          title: "Day 69-70 — Agent State as Context",
          description:
            "The agent's state IS its context. Every tool output gets injected back. Connect to Day 14.",
          concept: "Agent State = Context Engineering",
          transcript:
            "Open your Day 14 context architecture design. The agent's state is exactly what you designed: a structured object that accumulates the conversation history, tool results, and intermediate reasoning at every step. Each tool call injects new dynamic context. The agent is a stateful context engine. LangGraph makes this explicit in code.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W10_L7",
          name: "Day 70 — Build: GDP Reasoning Agent",
          title: "Day 70 — Build: GDP Reasoning Agent",
          description:
            "An agent with search + calculator tools that answers 'what is 15% of the GDP of India in 2024?' in 3 reasoning steps.",
          concept: "Build: Multi-Tool Agent",
          transcript:
            "Build a LangGraph agent with two tools: web search and calculator. Ask it: 'What is 15% of the GDP of India in 2024?' Observe it: (1) decide to search for India GDP 2024, (2) retrieve the number, (3) decide to calculate 15% of that number, (4) return the final answer. Print the full reasoning trace. Push to GitHub.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 90,
        },
      ],
    },

    // ─── Week 11 — LangSmith + RAGAS ─────────────────────────────────────
    {
      id: "genai-w11",
      title: "Week 11 — LangSmith + RAGAS: The Unusual Edge",
      color: "#0ea5e9",
      levels: [
        {
          id: "GENAI_W11_L1",
          name: "Day 71 — LangSmith Setup",
          title: "Day 71 — LangSmith Setup",
          description:
            "Set 2 environment variables. Every LangChain call now creates a trace. Visit the dashboard.",
          concept: "LangSmith, AI Observability",
          transcript:
            "Set LANGCHAIN_TRACING_V2=true and LANGCHAIN_API_KEY in your .env. Run your RAG app. Open app.smith.langchain.com. Every chain call, every retrieval, every LLM call now appears as a traced run you can inspect. This is AI observability. Most intern candidates have never touched it.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 30,
        },
        {
          id: "GENAI_W11_L2",
          name: "Day 72 — Reading a Trace",
          title: "Day 72 — Reading a Trace",
          description:
            "See every prompt sent, every chunk retrieved, token count, latency. Find where your RAG is retrieving the wrong document.",
          concept: "Trace Inspection, Debugging RAG",
          transcript:
            "Open a trace in LangSmith. Read every step: the exact prompt sent to the LLM (with retrieved chunks injected), the retrieved document names, token counts, and latency per step. Find a question where the wrong chunk was retrieved. This is debugging at a level most engineers never reach — you can see exactly what the model saw.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W11_L3",
          name: "Day 73 — Debug Retrieval in LangSmith",
          title: "Day 73 — Debug Retrieval in LangSmith",
          description:
            "Use traces to find a retrieval failure. Fix it by adjusting chunk size, top-k, or the prompt.",
          concept: "Retrieval Debugging, Iterative Improvement",
          transcript:
            "Find a question in your RAG test set that returns the wrong answer. Open its trace. Look at the retrieved chunks. Is the correct chunk being retrieved? If not, the failure is in retrieval — adjust chunk size or top-k. If the correct chunk is retrieved but the answer is wrong, the failure is in generation — adjust the prompt. Fix it and re-run.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W11_L4",
          name: "Day 74 — RAGAS Setup",
          title: "Day 74 — RAGAS Setup",
          description:
            "pip install ragas. Build a test set of 10 question-answer pairs from your Week 7 RAG.",
          concept: "RAGAS, RAG Evaluation Framework",
          transcript:
            "RAGAS is an open-source framework for evaluating RAG pipelines. Install it. Build a test set of ten question-answer pairs from your Week 7 RAG app — questions you know the correct answers to. Format them as a dataset RAGAS can consume. This is your evaluation harness.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W11_L5",
          name: "Day 75 — Run Faithfulness and Answer Relevance",
          title: "Day 75 — Run Faithfulness and Answer Relevance",
          description:
            "Run faithfulness and answer_relevance scores. Write down the numbers.",
          concept: "RAGAS Metrics, Faithfulness, Answer Relevance",
          transcript:
            "Run RAGAS with two metrics: faithfulness (does the answer stick to the retrieved context?) and answer_relevance (does the answer actually address the question?). Write down both scores for your baseline system. A score below 0.7 is a red flag. Above 0.85 is strong. You will now have a number you can quote in interviews.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W11_L6",
          name: "Day 76 — Improve One Thing",
          title: "Day 76 — Improve One Thing",
          description:
            "Improve one thing: chunk size, prompt wording, or top-k. Re-run RAGAS. Show the score went up.",
          concept: "Iterative Improvement, Regression Testing",
          transcript:
            "Choose one variable to change: chunk size, the retrieval prompt, or the top-k value. Make the change. Re-run RAGAS. If the score went up, document what you changed and why. If it went down, revert and try something else. This is regression testing for AI — the same discipline as regression testing in software, applied to model outputs.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W11_L7",
          name: "Day 77 — Before + After Eval Report",
          title: "Day 77 — Before + After Eval Report",
          description:
            "Screenshot both RAGAS runs. Document what you improved and why. This is the interview differentiator.",
          concept: "Eval Report, Interview Differentiator",
          transcript:
            "Screenshot both RAGAS runs — before and after your improvement. Write a one-page eval report: baseline scores, what you changed, new scores, interpretation. This document is the interview differentiator almost nobody else has. When the interviewer asks 'how do you measure the quality of your RAG app?', you open this report and show the numbers.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
      ],
    },

    // ─── Week 12 — Portfolio + Interview Prep ─────────────────────────────
    {
      id: "genai-w12",
      title: "Week 12 — Portfolio + Interview Prep",
      color: "#22c55e",
      levels: [
        {
          id: "GENAI_W12_L1",
          name: "Day 78 — Polish Your GitHub README",
          title: "Day 78 — Polish Your GitHub README",
          description:
            "Clean README with architecture diagram, LangSmith screenshot, RAGAS scores.",
          concept: "Portfolio Polish, README Quality",
          transcript:
            "Your README is the first thing a recruiter opens. It must include: a one-line project description, an architecture diagram (Mermaid or ASCII), a screenshot of a LangSmith trace, your RAGAS before/after scores, setup instructions with exact commands, and example input/output. Spend two hours on this — it converts more interviews than any other single activity.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 120,
        },
        {
          id: "GENAI_W12_L2",
          name: "Day 79 — Record a 2-Minute Demo",
          title: "Day 79 — Record a 2-Minute Demo",
          description:
            "Record a 2-minute Loom video demoing your RAG app. Add the link to your README.",
          concept: "Demo Recording, Communication",
          transcript:
            "Record a two-minute Loom video: run a query in your RAG app, show the answer, open LangSmith and show the trace, quote your RAGAS score. Add the Loom link to your README. A video link that actually works when clicked signals attention to detail. Most candidates either don't have one or link to a broken recording.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W12_L3",
          name: "Day 80 — LangSmith + RAGAS in README",
          title: "Day 80 — LangSmith + RAGAS in README",
          description:
            "Add LangSmith screenshot and RAGAS score table to README. Make the eval work visible.",
          concept: "Eval Documentation, Show Your Work",
          transcript:
            "Add two sections to your README: (1) a LangSmith trace screenshot with a caption explaining what it shows, (2) a RAGAS score table with before/after values. The principle is 'show your work' — the same reason a RAGAS score in your demo builds trust. Arbitrary personalization feels earned only when you show the evaluation that justified it.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 45,
        },
        {
          id: "GENAI_W12_L4",
          name: "Day 81 — Prepare 10 Interview Answers",
          title: "Day 81 — Prepare 10 Interview Answers",
          description:
            "What is RAG? Why not fine-tune? What is faithfulness? What causes hallucinations? Explain your architecture.",
          concept: "Interview Preparation, Technical Communication",
          transcript:
            "Write your answers to these ten questions: What is RAG and how does it work? Why would you use RAG instead of fine-tuning? What is faithfulness in RAGAS? What causes hallucinations in LLMs? Walk me through your project architecture. What does your RAGAS score mean? How would you reduce API costs? What is a context window? What does async def give you? What is a vector embedding?",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 90,
        },
        {
          id: "GENAI_W12_L5",
          name: "Day 82 — Practice Architecture Explanation",
          title: "Day 82 — Practice Architecture Explanation",
          description:
            "Practise explaining your project architecture out loud. Time it. Keep it under 3 minutes.",
          concept: "Technical Communication, Architecture Narration",
          transcript:
            "Explain your project architecture out loud, alone, timed. Start at the document loader and walk to the HTTP response. Name every component, explain its role, and state one design decision you made. Keep it under three minutes. Record yourself if you can. The ability to explain a system clearly and concisely is as valuable as building it.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W12_L6",
          name: "Day 83 — Practice the 90-Second Demo",
          title: "Day 83 — Practice the 90-Second Demo",
          description:
            "Open project → run query → show LangSmith trace → quote RAGAS score → explain one improvement. Do it 5 times.",
          concept: "Demo Fluency, Interview Performance",
          transcript:
            "Practice the 90-second demo five times: (1) open your project and run a query, (2) show the answer, (3) open LangSmith and point to the trace, (4) quote your RAGAS score, (5) explain one thing you improved based on the eval. Time yourself. If it takes more than 90 seconds, cut one step. The demo must be fluid enough to run under pressure.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
        {
          id: "GENAI_W12_L7",
          name: "Day 84 — Final Run: 5 Times Until Natural",
          title: "Day 84 — Final Run: 5 Times Until Natural",
          description:
            "Do the full demo 5 more times. You should be able to do it on any machine in any order without hesitation.",
          concept: "Mastery Through Repetition",
          transcript:
            "Do the full 90-second demo five more times. Vary the query each time. Practice opening LangSmith cold. Quote the RAGAS score without looking at your notes. Explain your one improvement without reading from the report. When you can do this fluently on any machine without hesitation, you are ready. Nobody else in the room will be able to do this.",
          videoId: "dQw4w9WgXcQ",
          startSec: 0,
          endSec: 0,
          durationInMinutes: 60,
        },
      ],
    },
  ],
};
