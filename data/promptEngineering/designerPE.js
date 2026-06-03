export const promptEngineeringDesignerRoadmapData = {
  id: "prompt-engineering-designer",
  title: "Prompt Engineering for Designers",
  description:
    "Learn how to use AI prompts for visual direction, creative briefs, image generation, editing workflows, and design iteration.",
  concept: "Prompt Engineering for Designers",
  transcript:
    "This designer-focused roadmap teaches practical prompt engineering for visual creation and creative workflows. It covers foundational prompt structure, image-generation components, lighting, lens choices, style direction, negative prompts, seed control, meta-prompting, and advanced AI-agent workflows for design critique and iteration.",
  days: [
    {
      id: "day1",
      title: "Day 1 — Foundations",
      color: "#ec4899",
      levels: [
        {
          id: "PE_DESIGNER_D1_01",
          name: "What Is Prompting?",
          title: "What Is Prompting?",
          description:
            "Understand prompting as the act of giving clear instructions to a generative AI tool.",
          concept: "What Is Prompting?",
          transcript:
            "This lesson defines prompting as giving specific instructions to an AI system so it can generate useful information, images, or creative outputs. Designers learn that prompting is not magic; it is communication, direction, and constraint-setting. This foundation matters before moving into frameworks or image-specific techniques.",
          videoId: "p09yRj47kNM",
          startSec: 0,
          endSec: 73,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D1_02",
          name: "World Building Mental Model",
          title: "World Building Mental Model",
          description:
            "Learn why AI fills missing details with generic defaults unless you provide enough visual context.",
          concept: "World Building Mental Model",
          transcript:
            "This lesson explains the world-building mental model: AI fills gaps using patterns from training data, just like humans fill story gaps using memories of books, films, and images. If designers give too few puzzle pieces, the AI defaults to average visual ideas. Strong prompts deliberately close the gaps with subject, mood, references, setting, and constraints.",
          videoId: "VnEoS2eQXsw",
          startSec: 113,
          endSec: 264,
          durationInMinutes: 3,
        },
        {
          id: "PE_DESIGNER_D1_03",
          name: "TCREI Framework",
          title: "TCREI Framework",
          description:
            "Use Task, Context, References, Evaluate, and Iterate as the backbone of every prompt.",
          concept: "TCREI Framework",
          transcript:
            "This lesson introduces the TCREI framework: Task, Context, References, Evaluate, and Iterate. For designers, this means defining the visual task, giving project context, adding references or examples, judging the output against the brief, and refining the prompt. The framework also supports personas and output formats such as lists, tables, image prompts, or structured briefs.",
          videoId: "p09yRj47kNM",
          startSec: 73,
          endSec: 122,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D1_04",
          name: "Context Component",
          title: "Context Component",
          description:
            "Understand how audience, platform, brand, and constraints shape AI outputs.",
          concept: "Context Component",
          transcript:
            "This lesson focuses on the context part of prompting. Designers learn that details like audience age, platform, brand tone, product category, campaign goal, color constraints, and past preferences narrow the model’s output toward the intended result. Context prevents the model from guessing randomly.",
          videoId: "p09yRj47kNM",
          startSec: 122,
          endSec: 140,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D1_05",
          name: "References Component",
          title: "References Component",
          description:
            "Use examples, past work, moodboards, and named references to guide the model.",
          concept: "References Component",
          transcript:
            "This lesson explains why references often work better than abstract descriptions. AI can incorporate examples such as past designs, moodboards, competitor visuals, color palettes, art styles, and previous campaign assets. Designers should use references to make the output more specific and closer to the intended visual language.",
          videoId: "p09yRj47kNM",
          startSec: 140,
          endSec: 158,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D1_06",
          name: "Intention Before Writing",
          title: "Intention Before Writing",
          description:
            "Define the purpose and audience emotion before writing an image prompt.",
          concept: "Intention Before Writing",
          transcript:
            "This lesson teaches designers to ask what the image is for and what the audience should feel before writing a prompt. A prompt for a product ad, landing-page hero, social post, portfolio shot, or moodboard should not use the same instructions. The biggest reason visual prompts fail is often unclear intention, not lack of technical vocabulary.",
          videoId: "6RAStep_3OI",
          startSec: 225,
          endSec: 270,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D1_07",
          name: "Subject Description",
          title: "Subject Description",
          description:
            "Choose precise subject details: appearance, posture, emotion, and visual role.",
          concept: "Subject Description",
          transcript:
            "This lesson explains subject description for image generation. Designers learn to specify appearance, emotional quality, posture, age, material, product state, character type, or visual role. Concise and specific subject details beat long vague adjective lists because they reduce ambiguity and help the AI compose the image coherently.",
          videoId: "6RAStep_3OI",
          startSec: 270,
          endSec: 314,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D1_08",
          name: "Action",
          title: "Action",
          description:
            "Make the subject active so the visual has cohesion and narrative.",
          concept: "Action",
          transcript:
            "This lesson covers action in visual prompts. The subject should not merely exist; it should interact with the scene, product, environment, or viewer. Action helps AI understand relationships between elements and creates a stronger composition, whether the subject is walking, holding, looking, presenting, floating, or being illuminated.",
          videoId: "6RAStep_3OI",
          startSec: 314,
          endSec: 357,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D1_09",
          name: "Iterate / ABI",
          title: "Iterate / ABI",
          description:
            "Treat prompting as circular: start simple, evaluate, then layer details.",
          concept: "Iterate / ABI",
          transcript:
            "This lesson explains that prompting is circular, not linear. Designers should start with a simple version, inspect the output, then add persona, references, constraints, lighting, composition, or format changes. The first result is rarely final; iteration is the core workflow.",
          videoId: "p09yRj47kNM",
          startSec: 165,
          endSec: 243,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D1_10",
          name: "Four Iteration Methods",
          title: "Four Iteration Methods",
          description:
            "Improve prompts by revisiting TCREI, simplifying language, reframing the task, and adding constraints.",
          concept: "Four Iteration Methods",
          transcript:
            "This lesson gives four ways to improve a weak prompt. Designers can revisit TCREI to add context or references, shorten dense sentences, reframe the goal through an analogous task, or introduce constraints to narrow the creative space. These methods make the next prompt sharper instead of randomly trying again.",
          videoId: "p09yRj47kNM",
          startSec: 243,
          endSec: 300,
          durationInMinutes: 1,
        },
      ],
    },

    {
      id: "day2",
      title: "Day 2 — System & Workflow",
      color: "#10b981",
      levels: [
        {
          id: "PE_DESIGNER_D2_01",
          name: "The 6-Component Image Formula",
          title: "The 6-Component Image Formula",
          description:
            "Use Subject, Action, Environment, Art Style, Lighting, and Details as the image-prompt backbone.",
          concept: "The 6-Component Image Formula",
          transcript:
            "This lesson introduces the six-component image formula: subject, action, environment, art style, lighting, and details. Designers learn how a vague prompt like 'woman in cafe' becomes a professional visual direction when each component is specified. This is the core structure for reliable image prompting.",
          videoId: "nnlgMpyq-j0",
          startSec: 63,
          endSec: 174,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_02",
          name: "Lighting",
          title: "Lighting",
          description:
            "Understand lighting as one of the highest-impact components in visual prompting.",
          concept: "Lighting",
          transcript:
            "This lesson explains why lighting controls mood, atmosphere, texture, warmth, and focus. Golden hour, campfire glow, backlit scenes, harsh light, window light, and soft focus can produce completely different images from the same subject. Designers should treat lighting as a design decision, not decoration.",
          videoId: "6RAStep_3OI",
          startSec: 340,
          endSec: 437,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_03",
          name: "Lighting Specificity",
          title: "Lighting Specificity",
          description:
            "Name the light type, direction, and quality instead of writing generic lighting words.",
          concept: "Lighting Specificity",
          transcript:
            "This lesson shows the difference between vague lighting like 'nice lighting' and specific lighting like 'dramatic window lighting creating a rim light effect.' Naming the light source, direction, intensity, and mood changes the image at a fundamental level. Designers should never leave lighting vague when quality matters.",
          videoId: "nnlgMpyq-j0",
          startSec: 226,
          endSec: 290,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_04",
          name: "Lens Selection",
          title: "Lens Selection",
          description:
            "Use lens choice to control realism, perspective, compression, and emotional distance.",
          concept: "Lens Selection",
          transcript:
            "This lesson explains that AI-generated images still feel as if they were seen through a lens. An 85mm lens can flatter portraits, a wide angle can capture environments, a fisheye can distort space, and a cinematic lens can change emotional tone. Lens selection helps designers move from generic images to intentional visual direction.",
          videoId: "6RAStep_3OI",
          startSec: 404,
          endSec: 459,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D2_05",
          name: "Camera Angle",
          title: "Camera Angle",
          description:
            "Use low angle, eye level, or bird’s-eye view to control emotional tone.",
          concept: "Camera Angle",
          transcript:
            "This lesson covers camera angle as emotional direction. A low angle makes a subject dominant or heroic, eye level feels natural and relatable, and a bird’s-eye view creates overview or distance. Designers should choose angle based on the viewer relationship they want to create.",
          videoId: "6RAStep_3OI",
          startSec: 459,
          endSec: 492,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D2_06",
          name: "Style",
          title: "Style",
          description:
            "Specify styles like cinematic, hyperrealistic, digital, comic, animation, or oil painting.",
          concept: "Style",
          transcript:
            "This lesson teaches style control for AI image generation. Designers can specify cinematic, animated, comic, hyperrealistic, digital, oil painting, or other styles, but must consider copyright and platform limits for artist references. Style should support the design purpose rather than overwhelm the subject.",
          videoId: "6RAStep_3OI",
          startSec: 485,
          endSec: 567,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_07",
          name: "Portrait Photography Prompting",
          title: "Portrait Photography Prompting",
          description:
            "Create editorial portrait prompts with facial expression, posture, lens, and lighting details.",
          concept: "Portrait Photography Prompting",
          transcript:
            "This lesson shows portrait photography prompting using a confident business executive example. Designers learn why facial expression, posture, authentic features, direct eye contact, an 85mm portrait lens, and dramatic window lighting can make a portrait feel editorial instead of like a snapshot.",
          videoId: "nnlgMpyq-j0",
          startSec: 189,
          endSec: 270,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_08",
          name: "Product Photography Prompting",
          title: "Product Photography Prompting",
          description:
            "Prompt product images with sharp detail, controlled lighting, and feature-focused composition.",
          concept: "Product Photography Prompting",
          transcript:
            "This lesson explains product photography prompting. Product visuals require sharp details, material accuracy, controlled studio lighting, and compositions that emphasize the key feature. Designers learn that product prompts need different emphasis than portrait prompts because clarity and selling details matter.",
          videoId: "nnlgMpyq-j0",
          startSec: 259,
          endSec: 350,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_09",
          name: "Architectural Visualization Prompting",
          title: "Architectural Visualization Prompting",
          description:
            "Describe structure, environment, time of day, and atmosphere for architectural realism.",
          concept: "Architectural Visualization Prompting",
          transcript:
            "This lesson covers architectural visualization prompting. Designers learn to describe not just the building, but its relationship with the environment, time of day, light, atmosphere, and surrounding space. Golden hour and environmental context can make AI architecture feel more believable and professional.",
          videoId: "nnlgMpyq-j0",
          startSec: 322,
          endSec: 406,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_10",
          name: "Street & Lifestyle Photography Prompting",
          title: "Street & Lifestyle Photography Prompting",
          description:
            "Use authenticity cues to avoid staged stock-photo outputs.",
          concept: "Street & Lifestyle Photography Prompting",
          transcript:
            "This lesson teaches street and lifestyle photography prompting. Phrases like 'candid moment with genuine expression' help prevent staged, artificial, stock-photo-looking images. Designers also learn to use atmospheric conditions like mist, golden hour, or overcast light to support emotion without overwhelming the subject.",
          videoId: "nnlgMpyq-j0",
          startSec: 513,
          endSec: 627,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_11",
          name: "Lexica as Prompt Research",
          title: "Lexica as Prompt Research",
          description:
            "Use prompt galleries to study exact prompts, style terms, and aesthetic patterns.",
          concept: "Lexica as Prompt Research",
          transcript:
            "This lesson shows how prompt research can improve image generation. Designers can browse AI-generated images, inspect their exact prompts, identify lighting/style/texture terms, and reuse patterns in their own tools. This turns visual inspiration into practical prompt vocabulary.",
          videoId: "6RAStep_3OI",
          startSec: 651,
          endSec: 761,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_12",
          name: "Aspect Ratio and Resolution",
          title: "Aspect Ratio and Resolution",
          description:
            "Match aspect ratio and quality settings to the final output before generating.",
          concept: "Aspect Ratio and Resolution",
          transcript:
            "This lesson explains aspect ratio and resolution. Designers learn that wrong ratio choices create cropping problems, blurry blow-ups, or unusable layouts. Prompting should match final use cases such as poster, story, reel, landing hero, square post, or product thumbnail before generation begins.",
          videoId: "6RAStep_3OI",
          startSec: 544,
          endSec: 624,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_13",
          name: "Negative Prompts",
          title: "Negative Prompts",
          description:
            "Tell the AI what to exclude using negative prompts or --no terms.",
          concept: "Negative Prompts",
          transcript:
            "This lesson teaches negative prompting. Instead of only saying what should appear, designers can tell AI what should not appear, such as blurry details, extra fingers, cold mood, logos, watermarks, or unwanted objects. Negative prompts are often faster than rewriting the positive prompt.",
          videoId: "6RAStep_3OI",
          startSec: 867,
          endSec: 938,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D2_14",
          name: "Prompt Weight / CFG Scale",
          title: "Prompt Weight / CFG Scale",
          description:
            "Control how strictly the AI follows your prompt versus exploring variation.",
          concept: "Prompt Weight / CFG Scale",
          transcript:
            "This lesson explains prompt weight, CFG scale, prompt strength, or prompt adherence. If the value is too high, outputs may become rigid and literal; if too low, key details are ignored. Designers should start slightly below three-quarters of the maximum and adjust based on whether results are too safe or too wild.",
          videoId: "6RAStep_3OI",
          startSec: 929,
          endSec: 973,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D2_15",
          name: "Seed Numbers",
          title: "Seed Numbers",
          description:
            "Use seed numbers to reproduce images and create controlled micro-variations.",
          concept: "Seed Numbers",
          transcript:
            "This lesson covers seed numbers. AI attaches a number series to generated images based on the prompt and settings. Reusing the same seed and prompt can reproduce the same image, while changing the seed slightly creates controlled variations. This is useful when refining a visual direction without starting over.",
          videoId: "6RAStep_3OI",
          startSec: 973,
          endSec: 1029,
          durationInMinutes: 1,
        },
      ],
    },

    {
      id: "day3",
      title: "Day 3 — Advanced Techniques",
      color: "#f59e0b",
      levels: [
        {
          id: "PE_DESIGNER_D3_01",
          name: "Prompt Chaining",
          title: "Prompt Chaining",
          description:
            "Guide AI through a sequence where each output becomes the next input.",
          concept: "Prompt Chaining",
          transcript:
            "This lesson teaches prompt chaining for complex creative work. Instead of asking one giant prompt to produce everything, designers can move step by step: brief, moodboard directions, image prompt variations, critique, refinement, and final production copy. Chaining gives more control and reduces mediocre all-in-one outputs.",
          videoId: "p09yRj47kNM",
          startSec: 751,
          endSec: 838,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D3_02",
          name: "Example Giving / Few-Shot Prompting",
          title: "Example Giving / Few-Shot Prompting",
          description:
            "Use examples as the strongest puzzle pieces for guiding creative output.",
          concept: "Example Giving / Few-Shot Prompting",
          transcript:
            "This lesson explains example giving and few-shot prompting. Examples are often the best way to teach AI what to do because they work like natural-language if-else logic. Designers can show examples of layouts, prompts, image styles, captions, or rejected outputs to make AI follow the intended pattern.",
          videoId: "VnEoS2eQXsw",
          startSec: 284,
          endSec: 368,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D3_03",
          name: "Chain-of-Thought Prompting",
          title: "Chain-of-Thought Prompting",
          description:
            "Ask AI to reason step by step before producing complex creative decisions.",
          concept: "Chain-of-Thought Prompting",
          transcript:
            "This lesson introduces chain-of-thought prompting for creative planning and critique. Designers can ask AI to reason through composition, audience fit, style consistency, or campaign direction before generating the final answer. This helps surface mistakes before they appear in the final output.",
          videoId: "p09yRj47kNM",
          startSec: 845,
          endSec: 868,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D3_04",
          name: "Tree-of-Thought Prompting",
          title: "Tree-of-Thought Prompting",
          description:
            "Explore multiple creative reasoning paths before selecting the strongest direction.",
          concept: "Tree-of-Thought Prompting",
          transcript:
            "This lesson teaches tree-of-thought prompting. Instead of one reasoning path, AI explores multiple branches and evaluates which direction is strongest. Designers can use this for abstract concepts, campaign ideas, branding directions, or visual systems where several approaches need to be compared.",
          videoId: "p09yRj47kNM",
          startSec: 868,
          endSec: 955,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D3_05",
          name: "Meta-Prompting",
          title: "Meta-Prompting",
          description:
            "Use a text AI to write optimized prompts for image generators and design tools.",
          concept: "Meta-Prompting",
          transcript:
            "This lesson introduces meta-prompting: asking one AI model to write a better prompt for another tool. Designers can tell AI the target tool, purpose, initial prompt, lens, aspect ratio, and desired variations, then let it generate stronger Midjourney, Stable Diffusion, DALL-E, or Nano Banana prompts.",
          videoId: "6RAStep_3OI",
          startSec: 715,
          endSec: 817,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D3_06",
          name: "Meta-Prompting for Designers",
          title: "Meta-Prompting for Designers",
          description:
            "Describe the design world in natural language and ask AI to optimize the image prompt.",
          concept: "Meta-Prompting for Designers",
          transcript:
            "This lesson applies meta-prompting specifically to design. Designers can describe the project world, intended mood, reference page, brand system, or composition in plain language, then ask GPT to turn that into optimized image-generator prompts. AI can also break down reference pages component by component before prompting a build.",
          videoId: "VnEoS2eQXsw",
          startSec: 524,
          endSec: 645,
          durationInMinutes: 3,
        },
        {
          id: "PE_DESIGNER_D3_07",
          name: "Meta-Prompting as a Framework",
          title: "Meta-Prompting as a Framework",
          description:
            "When you do not know the right prompt, ask AI to design the prompt for you.",
          concept: "Meta-Prompting as a Framework",
          transcript:
            "This lesson frames meta-prompting as a reusable system. When designers do not know what to ask, they can describe the project, tool, goal, constraints, and references, then ask AI to create the prompt. The meta layer becomes more powerful when combined with deep context and visual references.",
          videoId: "p09yRj47kNM",
          startSec: 954,
          endSec: 997,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D3_08",
          name: "Deep Research Prompting",
          title: "Deep Research Prompting",
          description:
            "Use structured research prompts to extract summaries, contrarian insights, and actionable evidence.",
          concept: "Deep Research Prompting",
          transcript:
            "This lesson teaches deep research prompting. Designers can ask for a summary, unusual or under-discussed insights, and actionable evidence from sources. This prevents generic research soup and supports stronger creative briefs, competitive audits, trend analysis, and campaign strategy.",
          videoId: "VnEoS2eQXsw",
          startSec: 347,
          endSec: 557,
          durationInMinutes: 4,
        },
        {
          id: "PE_DESIGNER_D3_09",
          name: "Confidence Score Prompting",
          title: "Confidence Score Prompting",
          description:
            "Ask AI to attach confidence scores so weak claims get manually verified.",
          concept: "Confidence Score Prompting",
          transcript:
            "This lesson explains confidence score prompting. Designers working with research, claims, market positioning, or client-facing strategy should ask AI to score its confidence. Anything below a strong threshold should be verified manually, preventing confident but false statements from entering design presentations.",
          videoId: "VnEoS2eQXsw",
          startSec: 863,
          endSec: 926,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D3_10",
          name: "Personas",
          title: "Personas",
          description:
            "Change output quality by assigning AI a specific expert, teacher, critic, or creative director role.",
          concept: "Personas",
          transcript:
            "This lesson covers persona prompting. Designers can ask AI to act as a creative director, brand strategist, UX researcher, art director, critic, or teacher. Persona assignment quickly changes the register, depth, and evaluation criteria of the output.",
          videoId: "VnEoS2eQXsw",
          startSec: 636,
          endSec: 760,
          durationInMinutes: 3,
        },
        {
          id: "PE_DESIGNER_D3_11",
          name: "Gap Finder",
          title: "Gap Finder",
          description:
            "Use AI to identify blind spots in your design reasoning or project brief.",
          concept: "Gap Finder",
          transcript:
            "This lesson teaches the gap finder workflow. Designers can periodically ask AI what is missing in their brief, reasoning, composition, user understanding, or strategy. This creates a non-judgmental review ritual that helps uncover weak assumptions before presenting work.",
          videoId: "VnEoS2eQXsw",
          startSec: 760,
          endSec: 885,
          durationInMinutes: 3,
        },
        {
          id: "PE_DESIGNER_D3_12",
          name: "Erasing AI Stains",
          title: "Erasing AI Stains",
          description:
            "Remove obvious AI phrasing and create a more human, specific design voice.",
          concept: "Erasing AI Stains",
          transcript:
            "This lesson focuses on removing AI-style patterns. Designers learn to avoid generic constructions like 'X is not just about Y, it is about Z' and replace them with direct, concrete language. Mixing references and using your own pre-AI writing or brand copy helps create more distinct outputs.",
          videoId: "VnEoS2eQXsw",
          startSec: 953,
          endSec: 1084,
          durationInMinutes: 3,
        },
        {
          id: "PE_DESIGNER_D3_13",
          name: "AI Agents Overview",
          title: "AI Agents Overview",
          description:
            "Understand AI agents as structured helpers for ongoing creative tasks and feedback.",
          concept: "AI Agents Overview",
          transcript:
            "This lesson introduces AI agents as expert helpers designed to work in an ongoing structured session. For designers, agents can support critique, campaign simulation, brand feedback, client role-play, or creative QA. The key is giving the agent a clear role, context, rules, and task.",
          videoId: "p09yRj47kNM",
          startSec: 965,
          endSec: 991,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D3_14",
          name: "Agent Sim",
          title: "Agent Sim",
          description:
            "Use simulation agents for role-play, training, client scenarios, and feedback sessions.",
          concept: "Agent Sim",
          transcript:
            "This lesson explains simulation agents. Designers can simulate client reviews, stakeholder objections, user interviews, creative critique sessions, or portfolio interviews. A strong simulation agent needs persona, task, context, stop phrase, and a post-session summary.",
          videoId: "p09yRj47kNM",
          startSec: 991,
          endSec: 1076,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D3_15",
          name: "Agent X",
          title: "Agent X",
          description:
            "Use expert feedback agents as personalized consultants for design critique.",
          concept: "Agent X",
          transcript:
            "This lesson teaches expert feedback agents. A designer can provide a brief, moodboard, copy, wireframe, or brand direction and ask the agent to critique it like a consultant. The agent should use references and return an improvement summary rather than generic praise.",
          videoId: "p09yRj47kNM",
          startSec: 1076,
          endSec: 1144,
          durationInMinutes: 2,
        },
        {
          id: "PE_DESIGNER_D3_16",
          name: "Universal AI Agent Blueprint",
          title: "Universal AI Agent Blueprint",
          description:
            "Build any useful agent with persona, context, interaction rules, stop phrase, and summary.",
          concept: "Universal AI Agent Blueprint",
          transcript:
            "This lesson gives the universal AI agent blueprint. Every agent should have a persona, detailed context, clear interaction rules, a stop phrase, and an end-of-session feedback or summary step. Designers can reuse this structure for critique agents, research agents, brand-review agents, and client-simulation agents.",
          videoId: "p09yRj47kNM",
          startSec: 1144,
          endSec: 1190,
          durationInMinutes: 1,
        },
        {
          id: "PE_DESIGNER_D3_17",
          name: "Emotional and Threat Prompting",
          title: "Emotional and Threat Prompting",
          description:
            "Use emotional framing carefully to make AI slow down, focus, and improve output reliability.",
          concept: "Emotional and Threat Prompting",
          transcript:
            "This lesson explains emotional prompting and high-stakes framing. AI systems are trained on human writing where emotion and cognition are linked, so phrases like 'take a deep breath' or high-precision instructions can improve performance. Designers should use this deliberately for complex tasks, not as a replacement for clear context and strong references.",
          videoId: "VnEoS2eQXsw",
          startSec: 1173,
          endSec: 1264,
          durationInMinutes: 2,
        },
      ],
    },
  ],
};