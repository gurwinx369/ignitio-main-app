export const clangBeginnerRoadmapData = {
  id: "c-language-course-video-1",
  title: "C Language Full Course — Video 1",
  description:
    "A beginner-friendly complete C programming course covering setup, first program execution, and Chapter 1 fundamentals (variables, data types, constants, keywords, comments, and input), including guided practice problems.",
  concept: "C Programming Language — Fundamentals",
  transcript:
    "This is the first video of a complete C language course. It opens with a cinematic Bollywood-style skit introducing the instructor and the running joke of the course, then moves into installing tools (VS Code, GCC/MinGW on Windows, Xcode on Mac), writing and compiling the first C program, and then thoroughly explains Chapter 1 concepts — variables, data types, constants, keywords, comments, and user input — before working through hands-on practice problems.",
  days: [
    {
      id: "day1",
      title: "Day 1 — Introduction, Motivation & History of C",
      color: "#f97316",
      levels: [
        {
          id: "C_LANG_D1_01",
          name: "Cinematic Intro: Coder Rukh Khan",
          title: "Cinematic Intro: Coder Rukh Khan",
          description:
            "A movie-style skit introducing the course through the story of 'Coder Rukh Khan' and a fake free-course scam call, building curiosity before the real course begins.",
          concept: "Course Introduction Skit",
          transcript:
            "A dramatized Bollywood-style opening featuring 'Coder Rukh Khan', the coding-obsessed grandson of an actor, who gets scammed by a fake telecaller offering a 'free' C language course that secretly charges his credit card. This sets up the comedic hook for the instructor's real, actually-free C course.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 2,
          endSec: 159,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D1_02",
          name: "The Twist & The Challenge Accepted",
          title: "The Twist & The Challenge Accepted",
          description:
            "The skit resolves with the instructor deciding to build a complete, free, hand-written C course as a challenge.",
          concept: "Course Motivation",
          transcript:
            "Following the scam reveal, the storyline transitions into the instructor accepting the 'challenge' of teaching C language properly and for free, setting up the real course content that follows.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 159,
          endSec: 260,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D1_03",
          name: "Why C Still Matters: Popularity & History",
          title: "Why C Still Matters: Popularity & History",
          description:
            "Learn why C is called the 'mother of all programming languages', its ranking in TIOBE/StackOverflow surveys, and its origin story from A and B languages to C in 1972.",
          concept: "History & Popularity of C",
          transcript:
            "Covers C's consistent top-3 ranking in language popularity indexes (TIOBE, StackOverflow survey), and its historical lineage: Martin Richards' 'A' language (1960) → Ken Thompson's 'B'/BCPL (1969) → Dennis Ritchie's 'C' at AT&T Bell Labs (1972), originally built to develop the UNIX operating system.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 260,
          endSec: 408,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D1_04",
          name: "Course Handbook & Using AI to Learn Faster",
          title: "Course Handbook & Using AI to Learn Faster",
          description:
            "Introduction to the accompanying handwritten handbook and the instructor's philosophy of using ChatGPT/AI as a learning tool throughout the course.",
          concept: "Learning Resources & AI-Assisted Learning",
          transcript:
            "The instructor shows the 'Ultimate C Handbook' resource and explains why using AI tools like ChatGPT alongside traditional learning is a smart, modern approach rather than something to avoid.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 408,
          endSec: 459,
          durationInMinutes: 1,
        },
        {
          id: "C_LANG_D1_05",
          name: "What is Programming?",
          title: "What is Programming?",
          description:
            "A from-scratch explanation of what programming actually is, using the analogy of human languages to explain how we 'talk' to computers.",
          concept: "What is Programming",
          transcript:
            "Explains programming as a medium of communication with computers, just as humans use Hindi, English, or Spanish to talk to each other. Introduces the idea that computers only understand their own 'language' and that programming languages like C, C++, Python, Java bridge that gap — illustrated with an example of a computer multiplying large numbers instantly.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 459,
          endSec: 542,
          durationInMinutes: 1,
        },
        {
          id: "C_LANG_D1_06",
          name: "Why Learn C? Real-World Use Cases",
          title: "Why Learn C? Real-World Use Cases",
          description:
            "Explore practical reasons to learn C: speed, driver programs, embedded systems, and game development.",
          concept: "Why Use C",
          transcript:
            "Explains four major real-world use cases of C: (1) its raw speed, (2) writing device driver programs, (3) embedded systems like microwaves and cameras where low latency matters, and (4) game development where response latency is critical.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 542,
          endSec: 684,
          durationInMinutes: 2,
        },
      ],
    },
    {
      id: "day2",
      title: "Day 2 — Installation Setup & Your First C Program",
      color: "#3b82f6",
      levels: [
        {
          id: "C_LANG_D2_01",
          name: "Downloading & Installing VS Code",
          title: "Downloading & Installing VS Code",
          description:
            "Step-by-step installation of Visual Studio Code as the code editor for the course, including the license agreement and setup options.",
          concept: "VS Code Installation",
          transcript:
            "Walks through downloading VS Code from its official site, accepting the license agreement, choosing installation checkboxes (including 'Add to PATH' and 'Open with Code' context menu options), and completing installation.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 684,
          endSec: 796,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D2_02",
          name: "Setting Up Your Workspace: Folders & Extensions",
          title: "Setting Up Your Workspace: Folders & Extensions",
          description:
            "Learn how to open a project folder in VS Code and install essential C/C++ extensions and color themes.",
          concept: "VS Code Workspace Setup",
          transcript:
            "Demonstrates opening a folder in VS Code via 'Open with Code', creating and deleting test files to understand how the editor reflects folder contents, and installing the C/C++ extension pack along with optional color themes for a better coding experience.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 796,
          endSec: 979,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D2_03",
          name: "Writing Your First 'Hello World' Code",
          title: "Writing Your First 'Hello World' Code",
          description:
            "Create the first .c file and type the classic Hello World program, then learn why it can't run without a compiler.",
          concept: "First C Program & The Need for a Compiler",
          transcript:
            "Shows creating a new file with a .c extension and typing the boilerplate Hello World program (#include <stdio.h>, int main, printf, return). Explains that a CPU cannot directly understand this code — it needs to be converted first, motivating the concept of a compiler.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 979,
          endSec: 1122,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D2_04",
          name: "What is a Compiler?",
          title: "What is a Compiler?",
          description:
            "Understand what compilation means — translating human-readable C code into machine code the CPU can execute.",
          concept: "Compilation Process",
          transcript:
            "Defines compilation as the process of translating high-level source code (like C) into low-level machine code (0s and 1s) that a CPU can execute directly, and notes that machine code is architecture-specific (different for Windows vs Mac, etc.).",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 1122,
          endSec: 1240,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D2_05",
          name: "Installing the GCC Compiler (Windows/MinGW)",
          title: "Installing the GCC Compiler (Windows/MinGW)",
          description:
            "Install the GCC compiler via MinGW on Windows and understand what GCC actually does.",
          concept: "GCC Compiler Installation",
          transcript:
            "Walks through downloading and installing MinGW to get the GCC compiler on Windows, explains GCC as the software that converts .c files into machine code, and uses an analogy (asking the compiler to 'translate' code) to make the concept intuitive. Also verifies installation by running `gcc` in the terminal.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 1240,
          endSec: 1444,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D2_06",
          name: "Fixing PATH Issues & Mac Setup (Xcode)",
          title: "Fixing PATH Issues & Mac Setup (Xcode)",
          description:
            "Learn how to fix 'gcc not recognized' errors on Windows via environment variables, and set up the compiler on Mac using Xcode.",
          concept: "Environment Variables & Mac Compiler Setup",
          transcript:
            "Explains how to fix a common Windows error ('gcc is not recognized') by adding the MinGW bin folder path to the system's Environment Variables. Then switches to Mac, showing how to install Xcode from the App Store to get GCC, and setting up VS Code with the same C/C++ extensions on Mac.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 1444,
          endSec: 1608,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D2_07",
          name: "Compiling & Running Your First Program",
          title: "Compiling & Running Your First Program",
          description:
            "Use the VS Code terminal to compile a C file with GCC and execute the resulting output for the first time.",
          concept: "Compiling and Executing C Code",
          transcript:
            "Shows how to open the integrated terminal (via drag or Ctrl+backtick), compile a file using `gcc filename.c`, and run the generated executable (`./a.exe`). The Hello World output finally appears on screen — celebrating writing and running the first-ever C program.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 1608,
          endSec: 1710,
          durationInMinutes: 2,
        },
      ],
    },
    {
      id: "day3",
      title: "Day 3 — Chapter 1: Variables, Data Types & Fundamentals",
      color: "#10b981",
      levels: [
        {
          id: "C_LANG_D3_01",
          name: "Anatomy of the Hello World Program",
          title: "Anatomy of the Hello World Program",
          description:
            "Break down every part of the Hello World program — the #include directive, main function, curly braces, and return statement.",
          concept: "Program Structure in C",
          transcript:
            "Explains why C is still used in real companies (with examples from Taiwan and San Francisco), the history of 'Hello World' as a convention (attributed to Brian Kernighan while developing BCPL), and then dissects the Hello World program line by line: the #include <stdio.h> preprocessor directive, int main() as the program's entry point, curly braces marking the function body, and how execution runs top to bottom.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 1710,
          endSec: 1944,
          durationInMinutes: 4,
        },
        {
          id: "C_LANG_D3_02",
          name: "Boilerplate Code, Bookmarking & Meeting Dennis Ritchie",
          title: "Boilerplate Code, Bookmarking & Meeting Dennis Ritchie",
          description:
            "Understand the concept of 'boilerplate code', a trick for bookmarking progress via comments, and a fun history lesson on Dennis Ritchie before Chapter 1 begins.",
          concept: "Boilerplate Code & Chapter 1 Kickoff",
          transcript:
            "Introduces 'boilerplate code' — the repetitive structural code every C program needs (includes, main, return) — and a clever technique of using YouTube comments as bookmarks to track progress. Concludes with an interesting trivia segment about Dennis Ritchie's 1968 PhD thesis (which he never formally received due to not submitting a hard copy) before formally starting Chapter 1: Variables.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 1944,
          endSec: 2233,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D3_03",
          name: "VS Code Productivity: Custom Snippets & Code Runner",
          title: "VS Code Productivity: Custom Snippets & Code Runner",
          description:
            "Speed up coding by creating a reusable custom snippet for the boilerplate and installing the Code Runner extension for one-click execution.",
          concept: "VS Code Snippets & Code Runner Extension",
          transcript:
            "Shows how to create a custom user snippet in VS Code (via user snippets JSON) so typing a short trigger like 'c boiler' auto-generates the full boilerplate code with the cursor positioned correctly. Also installs the Code Runner extension, enabling programs to run with a single button click instead of manually typing GCC commands each time.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 2233,
          endSec: 2409,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D3_04",
          name: "Understanding Variables: The Container Analogy",
          title: "Understanding Variables: The Container Analogy",
          description:
            "Learn what a variable is using a relatable 'kitchen container' analogy, then declare, initialize, and print your first variable.",
          concept: "Variables — Declaration & Initialization",
          transcript:
            "Explains a variable as a labeled container that stores a value, using a kitchen-containers analogy (a red box holds sugar, a blue box holds lentils). Demonstrates declaring an integer variable (`int a;`), assigning it a value (`a = 6;`), and printing it using `printf` with the `%d` format specifier.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 2409,
          endSec: 2588,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D3_05",
          name: "Variable Naming Rules & Writing Meaningful Code",
          title: "Variable Naming Rules & Writing Meaningful Code",
          description:
            "Learn the strict rules for naming variables in C and why choosing descriptive variable names improves code readability.",
          concept: "Variable Naming Conventions",
          transcript:
            "Covers the rules for valid variable names in C: must start with a letter or underscore, cannot contain spaces or special symbols (except underscore), cannot be a number, and are case-sensitive (so 'a' and 'A' are different variables). Emphasizes choosing meaningful variable names (e.g., 'firstNumber' instead of 'a1') to improve code readability for yourself and other programmers.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 2588,
          endSec: 2839,
          durationInMinutes: 4,
        },
        {
          id: "C_LANG_D3_06",
          name: "Constants, Data Types & the sizeof Operator",
          title: "Constants, Data Types & the sizeof Operator",
          description:
            "Learn the difference between variables and constants, explore int, float, and char data types, and use sizeof to check memory usage.",
          concept: "Data Types (int, float, char) & sizeof",
          transcript:
            "Defines a constant as an entity whose value cannot change (unlike a variable). Introduces the three basic data types — int, float, and char — with correct declaration syntax (noting that char values must use single quotes, not double quotes). Then introduces the `sizeof` operator to check how many bytes each data type occupies on the current architecture (typically 4 bytes for int/float, 1 byte for char), and covers the three types of constants: integer, real, and character constants.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 2839,
          endSec: 3202,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D3_07",
          name: "Keywords & The Art of Commenting Code",
          title: "Keywords & The Art of Commenting Code",
          description:
            "Learn about C's reserved keywords and how to write single-line and multi-line comments to document your code.",
          concept: "Keywords & Comments",
          transcript:
            "Explains that C reserves certain keywords (like int, float, for, return) that cannot be used as variable names, and shows how VS Code's syntax highlighting helps visually identify them. Introduces comments as a way to leave plain-language notes in code that are ignored by the compiler: single-line comments using `//` and multi-line comments using `/* */`, useful for adding author info, dates, or notes for future collaborators.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 3202,
          endSec: 3581,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D3_08",
          name: "Compiler Recap, User Input (scanf) & Escape Sequences",
          title: "Compiler Recap, User Input (scanf) & Escape Sequences",
          description:
            "Recap what a compiler does, learn to take user input with scanf, and master escape sequence characters like \\n and \\t.",
          concept: "scanf(), Format Specifiers & Escape Sequences",
          transcript:
            "Recaps that comments only exist for humans (compiled-out in the final executable) and reviews how the compiler checks code for errors. Introduces library functions (like printf coming from stdio.h) and then teaches `scanf()` for taking user input, explaining the `&` (address-of) operator and matching format specifiers (%d for int, %f for float, %c for char). Finishes with escape sequence characters — `\\n` (new line), `\\t` (tab), `\\\"` (escaped double quote), `\\'` (escaped single quote), and `\\\\` (literal backslash) — demonstrated with live examples and VS Code's multi-cursor feature.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 3581,
          endSec: 4115,
          durationInMinutes: 9,
        },
      ],
    },
    {
      id: "day4",
      title: "Day 4 — Chapter 1 Practice Set: Hands-On Problems",
      color: "#8b5cf6",
      levels: [
        {
          id: "C_LANG_D4_01",
          name: "Practice Set Kickoff & Problem 1: Area of a Rectangle",
          title: "Practice Set Kickoff & Problem 1: Area of a Rectangle",
          description:
            "Apply Chapter 1 concepts by solving the first practice problem — calculating the area of a rectangle using hard-coded values.",
          concept: "Practice Problem — Area of a Rectangle",
          transcript:
            "Kicks off the Chapter 1 practice set by creating a dedicated practice folder, then tackles Problem 1: writing a C program to calculate the area of a rectangle using hard-coded length and breadth values, applying variable declaration, arithmetic operators, and printf formatting learned earlier.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 4115,
          endSec: 4452,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D4_02",
          name: "Problem 1 (Continued): Taking Input from the User",
          title: "Problem 1 (Continued): Taking Input from the User",
          description:
            "Extend the rectangle area program to take length and breadth as user input using scanf.",
          concept: "Practice Problem — User Input Version",
          transcript:
            "Modifies the rectangle area program to use `scanf()` for taking length and breadth as input from the user instead of hard-coding them, then verifies the output is correct by testing with sample values.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 4452,
          endSec: 4589,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D4_03",
          name: "Problem 2: Area of a Circle (Debugging Float Division)",
          title: "Problem 2: Area of a Circle (Debugging Float Division)",
          description:
            "Solve the area-of-a-circle problem and debug a common float-vs-int formatting mistake.",
          concept: "Practice Problem — Area of a Circle & Debugging",
          transcript:
            "Solves Problem 2: calculating the area of a circle using the formula π × r². Demonstrates a real debugging moment where using `%d` instead of `%f` produces an incorrect, garbled output, then fixes it by using the correct floating-point format specifier — reinforcing the importance of matching format specifiers to data types.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 4589,
          endSec: 4728,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D4_04",
          name: "Extending Problem 2: Volume of a Cylinder",
          title: "Extending Problem 2: Volume of a Cylinder",
          description:
            "Modify the circle-area program to calculate the volume of a cylinder given its radius and height.",
          concept: "Practice Problem — Volume of a Cylinder",
          transcript:
            "Extends the previous circle program to compute the volume of a cylinder using the formula π × r² × h, introducing a new height variable and reusing the existing radius logic.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 4728,
          endSec: 4837,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D4_05",
          name: "Problem 3: Celsius to Fahrenheit (Integer Division Bug)",
          title: "Problem 3: Celsius to Fahrenheit (Integer Division Bug)",
          description:
            "Convert Celsius to Fahrenheit and encounter a classic C bug caused by integer division truncation.",
          concept: "Practice Problem — Integer vs Float Division",
          transcript:
            "Solves Problem 3: converting Celsius to Fahrenheit using the formula F = (9/5 × C) + 32. Reveals a subtle and very common C bug — writing `9/5` evaluates to `1` due to integer division truncation, giving a wrong result — and fixes it by rewriting the fraction as `9.0/5.0` to force floating-point division.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 4837,
          endSec: 5009,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D4_06",
          name: "Problem 4: Simple Interest & Chapter Wrap-Up",
          title: "Problem 4: Simple Interest & Chapter Wrap-Up",
          description:
            "Solve the final practice problem — calculating simple interest — and wrap up Chapter 1.",
          concept: "Practice Problem — Simple Interest",
          transcript:
            "Solves the final Chapter 1 practice problem: calculating simple interest using the formula (P × R × T) / 100, where P is principal, R is rate, and T is time. Verifies the output and closes out the Chapter 1 practice set before transitioning toward Chapter 2.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 5009,
          endSec: 5125,
          durationInMinutes: 2,
        },
      ],
    },
    {
      id: "day5",
      title: "Day 5 — Chapter 2: Instructions & Operators",
      color: "#0ea5e9",
      levels: [
        {
          id: "C_LANG_D5_01",
          name: "Types of Instructions & Variables as Memory Locations",
          title: "Types of Instructions & Variables as Memory Locations",
          description:
            "Kick off Chapter 2 by learning the three types of C instructions and understanding that a variable is simply the name of a reserved memory location.",
          concept: "Type Declaration Instructions & Variables",
          transcript:
            "Chapter 2 opens with a recipe analogy — a C program is just a set of instructions executed in order, like a recipe for tea. Introduces the three high-level types of instructions in C: type declaration instructions, arithmetic instructions, and control instructions. Explains that a type declaration instruction tells the compiler to reserve a memory location, and that a variable is simply the name of that memory location which stores a constant value (int, float, or char).",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 5156,
          endSec: 5272,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D5_02",
          name: "Variable Declaration Variations & Format Specifiers",
          title: "Variable Declaration Variations & Format Specifiers",
          description:
            "Explore different ways to declare and initialize variables, and understand what format specifiers like %d actually represent.",
          concept: "Declaration Styles & Format Specifiers",
          transcript:
            "Shows multiple valid variable declaration styles — declaring only (`int a;`), declaring with initialization in one step (`int i = 10;`), and initializing one variable using another (`int j = i;`). Introduces the term 'format specifier' for placeholders like `%d` used inside printf, and previews `%f` for float and `%c` for char.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 5272,
          endSec: 5368,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D5_03",
          name: "Multiple Declarations, Multi-Cursor Trick & Invalid Statements",
          title:
            "Multiple Declarations, Multi-Cursor Trick & Invalid Statements",
          description:
            "Declare several variables on a single line, speed up coding with VS Code's multi-cursor feature, and learn which declarations are actually invalid in C.",
          concept: "Multiple Variable Declaration & Invalid Redeclaration",
          transcript:
            "Demonstrates declaring multiple variables in a single line (`int a=2, b=3, c=4, d=5;`) and using VS Code's multi-cursor shortcut (Alt+Shift+Down / Alt+Click) to quickly duplicate and edit similar lines. Shows using previously defined variables in new calculations (`j1 = a + j - i`). Then covers invalid cases: redeclaring an already-declared variable with a different type (e.g., `float b` after `int b` already exists, or `float a = 1.1` after `int a` already exists) — and shows the valid chained assignment `a = b = c = d = 30`.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 5368,
          endSec: 5569,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D5_04",
          name: "Arithmetic Operators: Operator, Operand & Result",
          title: "Arithmetic Operators: Operator, Operand & Result",
          description:
            "Learn the core vocabulary of arithmetic operations in C — operator, operand, and result — through a simple math analogy.",
          concept: "Arithmetic Operators Basics",
          transcript:
            "Uses the equation x + y = z to define key terms: x and y are operands, + and = are operators, and z is the result. Confirms operands can be int or float. Writes a small program summing two integers (a + b) and printing the result using printf, reinforcing the operator/operand/result vocabulary with real code.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 5569,
          endSec: 5694,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D5_05",
          name: "The Modulus Operator & Divisibility Trick",
          title: "The Modulus Operator & Divisibility Trick",
          description:
            "Understand the modulus (%) operator for finding remainders and use it to check whether one number is divisible by another.",
          concept: "Modulus Operator",
          transcript:
            "Introduces the modulus operator (%), which returns the remainder when one number is divided by another (e.g., 4 % 3 = 1). Demonstrates changing the numerator to see how the remainder changes, and highlights one of the most common practical use cases: checking whether a number is divisible by another by testing if `num % divisor == 0`.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 5694,
          endSec: 5819,
          durationInMinutes: 2,
        },
        {
          id: "C_LANG_D5_06",
          name: "Legal vs Illegal Expressions & The Exponent Myth",
          title: "Legal vs Illegal Expressions & The Exponent Myth",
          description:
            "Learn which arithmetic expressions are valid in C, why modulus doesn't work on floats, and why there's no built-in exponent operator.",
          concept: "Expression Validity & Exponentiation Misconceptions",
          transcript:
            "Explains that operands can be int or float for arithmetic operators, but an expression like `b * c = z` is illegal (only `z = b * c` is valid) since `=` is an assignment operator. Notes that modulus cannot be applied to floats, and that C never assumes an implied operator — you must always write `a * b`, never just `ab`. Busts a very common interview misconception: the `^` symbol is NOT an exponent operator in C (it's actually bitwise XOR), and true exponentiation requires the `pow()` function from math.h, which will be covered later.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 5819,
          endSec: 6009,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D5_07",
          name: "Type Conversion — Promotion & Demotion Rules",
          title: "Type Conversion — Promotion & Demotion Rules",
          description:
            "Discover C's implicit type conversion rules: how int-int operations stay integers while int-float operations upgrade to floats.",
          concept: "Type Conversion (Promotion & Demotion)",
          transcript:
            "Explains C's implicit type conversion rules: an operation between two integers always yields an integer (so `9/2` evaluates to `4`, not `4.5`), while an operation involving at least one float always yields a float (`9.0/2` gives `4.5`). Demonstrates this live with a program that surprises beginners when 9/2 doesn't equal 4.5. Covers 'demotion' (assigning a float like 3.5 into an int variable truncates it to 3) and 'promotion' (assigning an int like 8 into a float variable becomes 8.0), then solves a quick quiz: `int k = 3.0/9` evaluates to `0` because the division result gets demoted to fit the integer type.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 6009,
          endSec: 6340,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D5_08",
          name: "Operator Precedence and Associativity",
          title: "Operator Precedence and Associativity",
          description:
            "Learn how C decides which operator runs first when parentheses aren't used, and why relying on BODMAS alone can trip you up.",
          concept: "Operator Precedence & Associativity",
          transcript:
            "Poses the ambiguous expression `3x - 8y` and explains that simple BODMAS-style math rules don't fully apply in C — the actual answer is determined by operator precedence and associativity. Covers precedence order (`*`, `/`, `%` evaluated before `+`, `-`, which are evaluated before `=`), strongly recommends always using parentheses for clarity, and explains associativity (left-to-right for `*`, `/`, `%`, `+`, `-`) to resolve ties between operators of equal precedence. Walks through live coding demos evaluating expressions like `a*b/c` and the fuller expression `3a - 8b/2c + 7a`, arriving at a final evaluated result step by step.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 6340,
          endSec: 6833,
          durationInMinutes: 8,
        },
        {
          id: "C_LANG_D5_09",
          name: "Control Instructions & Type Casting",
          title: "Control Instructions & Type Casting",
          description:
            "Get an overview of the four control instruction types in C and learn how to explicitly convert one data type into another using type casting.",
          concept: "Control Instructions & Type Casting",
          transcript:
            "Introduces the four categories of control instructions that determine a program's flow: sequence control instructions (default top-to-bottom execution), decision control instructions (if-else), loop control instructions (for, while, do-while), and case control instructions (switch) — with brief previews of each, to be covered in depth in later chapters. Wraps up Chapter 2 by teaching type casting syntax, e.g. converting a float `m = 32.2` into an integer using `(int)m`, which truncates it to `32`, demonstrating how any variable's data type can be explicitly converted using this bracket syntax.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 6833,
          endSec: 7012,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D5_10",
          name: "Chapter 2 Practice Set",
          title: "Chapter 2 Practice Set",
          description:
            "Apply everything from Chapter 2 by solving five practice problems covering invalid statements, type conversion, divisibility checks, and operator precedence evaluation.",
          concept: "Chapter 2 Practice Set — Applied Problems",
          transcript:
            "Works through five practice problems reinforcing Chapter 2 concepts: (1) identifying which of several given C statements is invalid (spotting an illegal multi-character char constant); (2) determining what data type the expression `3.0/8 - 2` returns, evaluating it step by step to get a float result of -1.625; (3) writing a program to check whether a number is divisible by 97 using the modulus operator; (4) manually and programmatically evaluating a multi-operator expression step by step using precedence and associativity rules; and (5) determining that `3.0 + 1` evaluates to a floating-point number, since a float-int operation always produces a float result.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 7012,
          endSec: 7558,
          durationInMinutes: 9,
        },
      ],
    },
  ],
};
