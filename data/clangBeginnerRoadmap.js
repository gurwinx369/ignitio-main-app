export const clangBeginnerRoadmapData = {
  id: "c-language-course",
  title: "C Language Full Course",
  description:
    "A complete, hand-written C programming course covering fundamentals, operators, control flow, loops, functions, recursion, pointers, and dynamic memory allocation, with a dedicated practice set after every chapter and two hands-on mini-projects.",
  concept: "C Programming Language",
  transcript:
    "This roadmap merges closely related back-to-back lessons from the original C language course transcript so that each level represents a coherent, substantial block of learning (roughly 5-8 minutes each) instead of many very short fragments. Every merge combines only 2-3 tightly related concepts that were taught consecutively in the source video, preserving the original teaching order, timestamps, and content.",
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
          videoId: "aZb0iu4uGwA",
          startSec: 2,
          endSec: 260,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D1_02",
          name: "Why C Still Matters: Popularity & History",
          title: "Why C Still Matters: Popularity & History",
          description:
            "Learn why C is called the 'mother of all programming languages', its ranking in TIOBE/StackOverflow surveys, and its origin story from A and B languages to C in 1972.",
          concept: "History & Popularity of C",
          transcript:
            "Covers C's consistent top-3 ranking in language popularity indexes (TIOBE, StackOverflow survey), and its historical lineage: Martin Richards' 'A' language (1960) → Ken Thompson's 'B'/BCPL (1969) → Dennis Ritchie's 'C' at AT&T Bell Labs (1972), originally built to develop the UNIX operating system.",
          videoId: "aZb0iu4uGwA",
          startSec: 260,
          endSec: 459,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D1_03",
          name: "What is Programming?",
          title: "What is Programming?",
          description:
            "A from-scratch explanation of what programming actually is, using the analogy of human languages to explain how we 'talk' to computers.",
          concept: "What is Programming",
          transcript:
            "Explains programming as a medium of communication with computers, just as humans use Hindi, English, or Spanish to talk to each other. Introduces the idea that computers only understand their own 'language' and that programming languages like C, C++, Python, Java bridge that gap — illustrated with an example of a computer multiplying large numbers instantly.",
          videoId: "aZb0iu4uGwA",
          startSec: 459,
          endSec: 684,
          durationInMinutes: 3,
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
          name: "Installing VS Code & Setting Up Your Workspace",
          title: "Installing VS Code & Setting Up Your Workspace",
          description:
            "Download and install Visual Studio Code, then open a project folder and install the extensions and themes needed for C development.",
          concept: "VS Code Installation & Workspace Setup",
          transcript:
            "Walks through downloading VS Code, accepting the license agreement, choosing installation options (including 'Add to PATH' and the 'Open with Code' context menu), and completing installation. Then demonstrates opening a folder via 'Open with Code', creating and deleting test files to see how the editor reflects folder contents, and installing the C/C++ extension pack along with optional color themes.",
          videoId: "aZb0iu4uGwA",
          startSec: 684,
          endSec: 979,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D2_02",
          name: "Writing Your First Code & What Is a Compiler?",
          title: "Writing Your First Code & What Is a Compiler?",
          description:
            "Type the classic Hello World program, discover why a CPU can't run it directly, and learn what compilation actually means.",
          concept: "First C Program & Compilation Concept",
          transcript:
            "Shows creating a new .c file and typing the boilerplate Hello World program (#include <stdio.h>, int main, printf, return), then explains that a CPU cannot directly understand this code — it must first be converted, motivating the concept of a compiler. Compilation is then defined as translating human-readable source code into low-level machine code (0s and 1s) that a CPU can execute directly, noting that machine code is architecture-specific.",
          videoId: "aZb0iu4uGwA",
          startSec: 979,
          endSec: 1240,
          durationInMinutes: 4,
        },
        {
          id: "C_LANG_D2_03",
          name: "Installing GCC, Fixing PATH Issues, Mac Setup & Running Your First Program",
          title:
            "Installing GCC, Fixing PATH Issues, Mac Setup & Running Your First Program",
          description:
            "Install the GCC compiler on Windows and Mac, resolve common setup errors, and finally compile and run the first-ever C program.",
          concept: "GCC Installation, Environment Setup & First Execution",
          transcript:
            "Walks through installing MinGW to get GCC on Windows and verifying it via the terminal. Covers fixing the common 'gcc is not recognized' error by adding the MinGW bin folder to Environment Variables, then switches to Mac, installing Xcode from the App Store to get GCC and setting up the same VS Code extensions. Finally shows opening the integrated terminal, compiling a file with `gcc filename.c`, and running the executable (`./a.exe`) — celebrating the first successful Hello World output.",
          videoId: "aZb0iu4uGwA",
          startSec: 1240,
          endSec: 1710,
          durationInMinutes: 8,
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
          name: "Anatomy of Hello World, Boilerplate Code & Meeting Dennis Ritchie",
          title:
            "Anatomy of Hello World, Boilerplate Code & Meeting Dennis Ritchie",
          description:
            "A line-by-line breakdown of the Hello World program, the concept of boilerplate code, a bookmarking trick, and trivia about Dennis Ritchie before Chapter 1 formally begins.",
          concept: "Program Structure & Chapter 1 Kickoff",
          transcript:
            "Dissects the Hello World program line by line: the #include <stdio.h> preprocessor directive, int main() as the entry point, curly braces marking the function body, and top-to-bottom execution — including trivia on 'Hello World' as a convention attributed to Brian Kernighan. Introduces 'boilerplate code' — the repetitive structural code every C program needs — plus a technique of using YouTube comments as progress bookmarks, and closes with trivia about Dennis Ritchie's 1968 PhD thesis before formally starting Chapter 1: Variables.",
          videoId: "aZb0iu4uGwA",
          startSec: 1710,
          endSec: 2233,
          durationInMinutes: 9,
        },
        {
          id: "C_LANG_D3_02",
          name: "VS Code Snippets, Code Runner, Variables & Naming Rules",
          title: "VS Code Snippets, Code Runner, Variables & Naming Rules",
          description:
            "Speed up coding with a custom boilerplate snippet and the Code Runner extension, then learn what a variable is and the rules for naming one meaningfully.",
          concept: "Productivity Setup, Variables & Naming Conventions",
          transcript:
            "Shows creating a custom VS Code user snippet so typing a short trigger auto-generates the full boilerplate code, and installing the Code Runner extension for one-click execution. Then explains a variable as a labeled container using a kitchen-containers analogy, demonstrating declaration (`int a;`), assignment (`a = 6;`), and printing with `%d`. Finally covers the strict rules for valid variable names (must start with a letter/underscore, no spaces or special symbols, case-sensitive) and the importance of meaningful names like 'firstNumber' over 'a1'.",
          videoId: "aZb0iu4uGwA",
          startSec: 2233,
          endSec: 2839,
          durationInMinutes: 10,
        },
        {
          id: "C_LANG_D3_03",
          name: "Constants, Data Types & the sizeof Operator",
          title: "Constants, Data Types & the sizeof Operator",
          description:
            "Learn the difference between variables and constants, explore int, float, and char data types, and use sizeof to check memory usage.",
          concept: "Data Types (int, float, char) & sizeof",
          transcript:
            "Defines a constant as an entity whose value cannot change. Introduces int, float, and char with correct declaration syntax (char values need single quotes). Then introduces the `sizeof` operator to check byte usage per data type (typically 4 bytes for int/float, 1 byte for char), and covers the three types of constants: integer, real, and character.",
          videoId: "aZb0iu4uGwA",
          startSec: 2839,
          endSec: 3202,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D3_04",
          name: "Keywords & The Art of Commenting Code",
          title: "Keywords & The Art of Commenting Code",
          description:
            "Learn about C's reserved keywords and how to write single-line and multi-line comments to document your code.",
          concept: "Keywords & Comments",
          transcript:
            "Explains that C reserves certain keywords (int, float, for, return) that cannot be used as variable names, using VS Code's syntax highlighting to identify them visually. Introduces comments as plain-language notes ignored by the compiler: single-line comments with `//` and multi-line comments with `/* */`, useful for author info, dates, or notes for collaborators.",
          videoId: "aZb0iu4uGwA",
          startSec: 3202,
          endSec: 3581,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D3_05",
          name: "Compiler Recap, User Input (scanf) & Escape Sequences",
          title: "Compiler Recap, User Input (scanf) & Escape Sequences",
          description:
            "Recap what a compiler does, learn to take user input with scanf, and master escape sequence characters like \\n and \\t.",
          concept: "scanf(), Format Specifiers & Escape Sequences",
          transcript:
            "Recaps that comments exist only for humans and reviews how the compiler checks for errors. Introduces library functions (like printf from stdio.h), then teaches `scanf()` for user input, explaining the `&` (address-of) operator and matching format specifiers (%d, %f, %c). Finishes with escape sequences — `\\n`, `\\t`, `\\\"`, `\\'`, `\\\\` — demonstrated live alongside VS Code's multi-cursor feature.",
          videoId: "aZb0iu4uGwA",
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
          name: "Problem 1: Area of a Rectangle (Hard-Coded)",
          title: "Problem 1: Area of a Rectangle (Hard-Coded)",
          description:
            "Apply Chapter 1 concepts by solving the first practice problem — calculating the area of a rectangle using hard-coded values.",
          concept: "Practice Problem — Area of a Rectangle",
          transcript:
            "Kicks off the Chapter 1 practice set by creating a dedicated practice folder, then solves Problem 1: writing a C program to calculate the area of a rectangle using hard-coded length and breadth values, applying variable declaration, arithmetic operators, and printf formatting.",
          videoId: "aZb0iu4uGwA",
          startSec: 4115,
          endSec: 4452,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D4_02",
          name: "Problem 1 with User Input & Problem 2: Area of a Circle",
          title: "Problem 1 with User Input & Problem 2: Area of a Circle",
          description:
            "Extend the rectangle program to take user input, then solve the area-of-a-circle problem and debug a common formatting mistake.",
          concept: "Practice — User Input & Debugging Float Division",
          transcript:
            "Modifies the rectangle area program to use `scanf()` for length and breadth instead of hard-coded values, verifying output with sample values. Then solves Problem 2, calculating the area of a circle using π × r², demonstrating a real debugging moment where `%d` instead of `%f` produces garbled output, fixed by using the correct floating-point format specifier.",
          videoId: "aZb0iu4uGwA",
          startSec: 4452,
          endSec: 4728,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D4_03",
          name: "Cylinder Volume, Celsius-to-Fahrenheit & Simple Interest",
          title: "Cylinder Volume, Celsius-to-Fahrenheit & Simple Interest",
          description:
            "Extend the circle program to a cylinder, convert Celsius to Fahrenheit while fixing an integer-division bug, and close the chapter with a simple interest problem.",
          concept: "Practice — Extended Formula Problems & Chapter Wrap-Up",
          transcript:
            "Extends the circle program to compute cylinder volume (π × r² × h). Then solves Celsius-to-Fahrenheit conversion (F = 9/5 × C + 32), revealing the classic C bug where `9/5` truncates to `1` due to integer division, fixed by rewriting as `9.0/5.0`. Finally solves the last Chapter 1 problem — simple interest via (P × R × T) / 100 — closing out the chapter before Chapter 2.",
          videoId: "aZb0iu4uGwA",
          startSec: 4728,
          endSec: 5125,
          durationInMinutes: 7,
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
          name: "Instruction Types, Variable Declarations & Format Specifiers",
          title: "Instruction Types, Variable Declarations & Format Specifiers",
          description:
            "Learn the three types of C instructions, the different ways to declare and initialize variables, and the meaning of format specifiers.",
          concept: "Type Declaration Instructions & Declaration Styles",
          transcript:
            "Opens Chapter 2 with a recipe analogy for instructions, introducing type declaration, arithmetic, and control instructions, and explains that a variable is simply the name of a reserved memory location. Shows multiple declaration styles (`int a;`, `int i = 10;`, `int j = i;`), introduces the term 'format specifier' for placeholders like `%d`, and demonstrates declaring several variables on one line plus VS Code's multi-cursor trick, before covering invalid redeclaration cases like re-typing an already-declared variable.",
          videoId: "aZb0iu4uGwA",
          startSec: 5156,
          endSec: 5569,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D5_02",
          name: "Arithmetic Operators, Modulus & Expression Validity",
          title: "Arithmetic Operators, Modulus & Expression Validity",
          description:
            "Learn the vocabulary of operator, operand, and result, the modulus operator for remainders, and which expressions are legal in C.",
          concept: "Arithmetic Operators & Legal Expressions",
          transcript:
            "Uses x + y = z to define operand, operator, and result, then writes a program summing two integers. Introduces the modulus operator (%) for finding remainders and checking divisibility. Covers which expressions are legal (only `z = b * c`, never `b * c = z`), notes modulus doesn't work on floats, and busts the common myth that `^` means exponentiation in C (it's actually bitwise XOR — true exponentiation needs `pow()` from math.h).",
          videoId: "aZb0iu4uGwA",
          startSec: 5569,
          endSec: 6009,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D5_03",
          name: "Type Conversion — Promotion & Demotion Rules",
          title: "Type Conversion — Promotion & Demotion Rules",
          description:
            "Discover C's implicit type conversion rules: how int-int operations stay integers while int-float operations upgrade to floats.",
          concept: "Type Conversion (Promotion & Demotion)",
          transcript:
            "Explains that an operation between two integers always yields an integer (so `9/2` is `4`, not `4.5`), while an operation involving at least one float always yields a float. Covers 'demotion' (a float like 3.5 assigned into an int truncates to 3) and 'promotion' (an int like 8 assigned into a float becomes 8.0), and solves a quiz: `int k = 3.0/9` evaluates to `0` because the result gets demoted.",
          videoId: "aZb0iu4uGwA",
          startSec: 6009,
          endSec: 6340,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D5_04",
          name: "Operator Precedence and Associativity",
          title: "Operator Precedence and Associativity",
          description:
            "Learn how C decides which operator runs first when parentheses aren't used, and why relying on BODMAS alone can trip you up.",
          concept: "Operator Precedence & Associativity",
          transcript:
            "Poses the ambiguous expression `3x - 8y` and explains that the answer is determined by operator precedence (`*`,`/`,`%` before `+`,`-`, before `=`) and associativity (left-to-right for equal-precedence operators). Strongly recommends always using parentheses for clarity, walking through live coding demos evaluating `a*b/c` and a fuller expression `3a - 8b/2c + 7a` step by step.",
          videoId: "aZb0iu4uGwA",
          startSec: 6340,
          endSec: 6833,
          durationInMinutes: 8,
        },
        {
          id: "C_LANG_D5_05",
          name: "Control Instructions & Type Casting",
          title: "Control Instructions & Type Casting",
          description:
            "Get an overview of the four control instruction types in C and learn how to explicitly convert one data type into another using type casting.",
          concept: "Control Instructions & Type Casting",
          transcript:
            "Introduces the four categories of control instructions: sequence (default top-to-bottom), decision (if-else), loop (for/while/do-while), and case (switch) control instructions, previewing each for later chapters. Wraps up Chapter 2 by teaching type casting syntax, e.g. converting `m = 32.2` into an integer via `(int)m`, truncating it to `32`.",
          videoId: "aZb0iu4uGwA",
          startSec: 6833,
          endSec: 7012,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D5_06",
          name: "Chapter 2 Practice Set",
          title: "Chapter 2 Practice Set",
          description:
            "Apply everything from Chapter 2 by solving five practice problems covering invalid statements, type conversion, divisibility checks, and operator precedence evaluation.",
          concept: "Chapter 2 Practice Set — Applied Problems",
          transcript:
            "Works through five practice problems: (1) spotting an invalid C statement (an illegal multi-character char constant); (2) evaluating `3.0/8 - 2` step by step to a float result of -1.625; (3) checking divisibility by 97 using modulus; (4) manually and programmatically evaluating a multi-operator expression using precedence/associativity rules; and (5) confirming `3.0 + 1` evaluates to a float, since a float-int operation always produces a float.",
          videoId: "aZb0iu4uGwA",
          startSec: 7012,
          endSec: 7558,
          durationInMinutes: 9,
        },
      ],
    },
    {
      id: "day6",
      title:
        "Day 6 — Conditional Instructions: If, Else, Operators and Switch-Case",
      color: "#f59e0b",
      levels: [
        {
          id: "C_LANG_D6_00",
          name: "Course Intro — The Coder Rukh Khan Story",
          title: "Course Intro — The Coder Rukh Khan Story",
          description:
            "The cinematic opening skit of the course that introduces the free C course offer and sets up the learning journey.",
          concept: "Course Introduction",
          transcript:
            "The video opens with a movie-style skit about Coder Rukh Khan, who is offered a free C language course by a telecaller. After a comedic mix-up about hidden charges, the character resolves to build his own complete, handwritten, AI-integrated C course covering 11 chapters, 100+ practice problems, and real projects.",
          videoId: "aZb0iu4uGwA",
          startSec: 0,
          endSec: 227,
          durationInMinutes: 4,
        },
        {
          id: "C_LANG_D6_01",
          name: "Why Decisions Are Needed, the if Statement & if-else",
          title: "Why Decisions Are Needed, the if Statement & if-else",
          description:
            "Understand why programs need to make decisions, then learn the syntax of if and if-else statements.",
          concept: "Decision Making, if Statement & if-else",
          transcript:
            "Chapter 3 opens with real-life decision-making examples (watching a video only if you feel like it; buying an umbrella only if it's raining and you have money), introducing if-else and switch statements as C's two decision tools. A variable age is checked with an if statement — the block executes only when the condition is true and is skipped otherwise, demonstrated with multiple lines inside the block and VS Code's Alt+Arrow line-moving trick. The else block is then added as the alternate path that runs only when the if condition is false, framed with plain-English 'if this, do this, otherwise do that' phrasing.",
          videoId: "aZb0iu4uGwA",
          startSec: 7558,
          endSec: 8000,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D6_02",
          name: "Relational Operators & Truthy/Falsy Values",
          title: "Relational Operators & Truthy/Falsy Values",
          description:
            "Learn equals-to, greater-than, less-than and their variants, plus why any non-zero value is treated as true in C.",
          concept: "Relational Operators & Non-Zero is True",
          transcript:
            "Covers relational operators used inside conditions: double equals for equality, greater-than, less-than, and their or-equal-to and not-equal-to variants, emphasizing that single equals is assignment while double equals checks equality — a common bug source. Then demonstrates that any non-zero value (int, float, or char) is treated as true in C while zero is treated as false, shown live with several if blocks using non-zero literals executing while a literal-zero block never does.",
          videoId: "aZb0iu4uGwA",
          startSec: 8000,
          endSec: 8506,
          durationInMinutes: 8,
        },
        {
          id: "C_LANG_D6_03",
          name: "Logical Operators — AND, OR, NOT",
          title: "Logical Operators — AND, OR, NOT",
          description:
            "Combine multiple conditions using logical AND, OR, and NOT operators and their truth tables.",
          concept: "Logical Operators",
          transcript:
            "Introduces AND, OR, and NOT with their truth tables — AND requires both conditions true, OR requires at least one, and NOT flips true to false and vice versa. A program demonstrates combining two integer conditions, showing how logical operators simplify nested if statements and reduce indentation.",
          videoId: "aZb0iu4uGwA",
          startSec: 8506,
          endSec: 8973,
          durationInMinutes: 8,
        },
        {
          id: "C_LANG_D6_04",
          name: "The else-if Ladder",
          title: "The else-if Ladder",
          description:
            "Chain multiple conditions together using else-if to check several possibilities in order.",
          concept: "else-if Ladder",
          transcript:
            "Introduces the else-if ladder using an age-based driving eligibility example with multiple thresholds. Conditions are checked top to bottom; only one matching block in the whole ladder executes, and once a condition is true, all remaining else-if/else blocks are skipped. The final else is optional and runs only if every prior condition fails.",
          videoId: "aZb0iu4uGwA",
          startSec: 8973,
          endSec: 9388,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D6_05",
          name: "The Ternary Operator & Switch-Case Statement",
          title: "The Ternary Operator & Switch-Case Statement",
          description:
            "Learn the shorthand ternary operator as an alternative to simple if-else, then use switch-case to choose between multiple alternatives.",
          concept: "Ternary Operator & Switch-Case",
          transcript:
            "The ternary operator is introduced as shorthand for simple if-else logic (condition ? true-expr : false-expr), demonstrated by comparing two numbers to print the greater one in a single line. Switch-case is then introduced for choosing among several alternatives based on a variable's value, matching user input against case labels, and demonstrating default fall-through behavior (execution continues into subsequent cases unless stopped) along with a default case for unmatched values.",
          videoId: "aZb0iu4uGwA",
          startSec: 9388,
          endSec: 9840,
          durationInMinutes: 8,
        },
        {
          id: "C_LANG_D6_06",
          name: "Using break in Switch-Case & Chapter Wrap-Up",
          title: "Using break in Switch-Case & Chapter Wrap-Up",
          description:
            "Learn how break stops fall-through in switch-case, then review key switch-case rules before closing the chapter.",
          concept: "break Statement & Switch-Case Rules Summary",
          transcript:
            "The break statement is introduced to stop switch-case fall-through — adding break after each case ensures only the matching case executes, with the difference in output shown side by side with and without break. The chapter closes by summarizing that cases can be written in any order, character values are allowed as case labels since they evaluate to integers, and switches can technically nest (though rarely done in practice), wrapping up Chapter 3 before its practice set.",
          videoId: "aZb0iu4uGwA",
          startSec: 9840,
          endSec: 10135,
          durationInMinutes: 5,
        },
      ],
    },
    {
      id: "day7",
      title: "Day 7 — Chapter 3 Practice Set",
      color: "#10b981",
      levels: [
        {
          id: "C_LANG_D7_01",
          name: "Practice: Assignment-vs-Comparison Trick & Pass/Fail Based on Marks",
          title:
            "Practice: Assignment-vs-Comparison Trick & Pass/Fail Based on Marks",
          description:
            "Solve a classic trick question about single vs double equals inside an if, then write a program checking subject marks and total percentage for pass/fail.",
          concept:
            "Practice — Assignment Inside if & Multi-Condition Pass/Fail",
          transcript:
            "The first problem shows how a single equals sign inside an if condition (an assignment, not a comparison) causes the if block to execute unexpectedly, since the assignment evaluates to a non-zero value. The second problem takes three subject marks, first checking whether any individual mark is below 33 using logical AND, then computing the average and checking whether the overall percentage is at least 40, printing pass/fail messages with reasons.",
          videoId: "aZb0iu4uGwA",
          startSec: 10135,
          endSec: 10487,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D7_02",
          name: "Practice: Income Tax Calculation Using else-if",
          title: "Practice: Income Tax Calculation Using else-if",
          description:
            "Calculate income tax across multiple slabs using an else-if ladder and floating-point formatting.",
          concept: "Practice — Income Tax Slabs",
          transcript:
            "Calculates income tax across hypothetical slabs (no tax below 2.5 lakh, 5% between 2.5-5 lakh, 20% between 5-10 lakh, 30% above 10 lakh) using an else-if ladder, fixing a data type mistake by switching the tax variable from integer to float, and controlling decimal precision in output using format specifiers like %.2f and %.3f.",
          videoId: "aZb0iu4uGwA",
          startSec: 10487,
          endSec: 11027,
          durationInMinutes: 9,
        },
        {
          id: "C_LANG_D7_03",
          name: "Practice: Leap Year Checker",
          title: "Practice: Leap Year Checker",
          description:
            "Determine whether a user-entered year is a leap year using the divisibility rule for 4, 100, and 400.",
          concept: "Practice — Leap Year Logic",
          transcript:
            "Reads a year from the user and checks whether it is a leap year using the rule: divisible by 4 and not by 100, or divisible by 400, combining relational and logical operators inside a single if condition, with the underlying rule explained via ChatGPT.",
          videoId: "aZb0iu4uGwA",
          startSec: 11027,
          endSec: 11287,
          durationInMinutes: 4,
        },
        {
          id: "C_LANG_D7_04",
          name: "Practice: Uppercase Check via ASCII & Greatest of Four Numbers",
          title:
            "Practice: Uppercase Check via ASCII & Greatest of Four Numbers",
          description:
            "Use ASCII values to check if a character is lowercase, then find the largest among four numbers using chained logical conditions, closing the chapter.",
          concept: "Practice — ASCII Comparison & Chained Logical Conditions",
          transcript:
            "Introduces ASCII values (printed with %d instead of %c) and uses the fact that lowercase letters fall between ASCII 97-122 to check whether an entered character is lowercase. The final problem finds the greatest among four integers by checking, for each variable, whether it is greater than all three others using logical AND across three comparisons, closing the Chapter 3 practice set before loops begin.",
          videoId: "aZb0iu4uGwA",
          startSec: 11287,
          endSec: 11856,
          durationInMinutes: 9,
        },
      ],
    },
    {
      id: "day8",
      title:
        "Day 8 — Chapter 4: Loops (While, Do-While, For, Break & Continue)",
      color: "#6366f1",
      levels: [
        {
          id: "C_LANG_D8_01",
          name: "Why We Need Loops & The While Loop Syntax",
          title: "Why We Need Loops & The While Loop Syntax",
          description:
            "Motivate loops with the escalating Happy Birthday printing challenge, then build a first while loop and trace exactly how it runs.",
          concept: "Introduction to Loops & The While Loop",
          transcript:
            "The escalating challenge of printing 'Happy Birthday' 5, 10, 100, and eventually a lakh times motivates the need for loops, naming while, do-while, and for as the three loop types. A while loop is built by hand — i starts at 0, runs while i < 4, printing the message and incrementing i — followed by a walkthrough of the mechanics: the block of code, iterations, and the condition being checked before every pass.",
          videoId: "aZb0iu4uGwA",
          startSec: 11890,
          endSec: 12270,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D8_02",
          name: "While Loop Example & Infinite Loops",
          title: "While Loop Example & Infinite Loops",
          description:
            "Print values 0-9 using a while loop with i++, then deliberately create infinite loops to see what happens when a condition never becomes false.",
          concept: "Printing the Loop Counter & Infinite Loops",
          transcript:
            "Prints i on every iteration while i < 10 using i++ shorthand, with a missing semicolon shown causing a subtle bug. Then demonstrates two infinite loops — one where the increment step is removed, another using an always-true condition (2 < 10) — both printing endlessly, reinforcing that a while loop runs for as long as its condition stays true, including forever if not careful.",
          videoId: "aZb0iu4uGwA",
          startSec: 12270,
          endSec: 12658,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D8_03",
          name: "Quiz: Numbers 10-20 & Increment/Decrement/Compound Operators",
          title: "Quiz: Numbers 10-20 & Increment/Decrement/Compound Operators",
          description:
            "Solve a quiz printing natural numbers 10-20 from a zero-based counter, then learn increment, decrement, and compound assignment operators.",
          concept: "Conditional Printing & Operator Shorthand",
          transcript:
            "Prints natural numbers 10 through 20 despite the loop counter starting at 0, wrapping the print statement in an if (i >= 10) inside a while (i <= 20) loop. Then demonstrates that i++ prints the current value before incrementing while ++i increments first, introduces the mirror-image decrement operator i--, and covers compound assignment operators like += (with -=, *=, /= mentioned for further exploration).",
          videoId: "aZb0iu4uGwA",
          startSec: 12658,
          endSec: 13200,
          durationInMinutes: 9,
        },
        {
          id: "C_LANG_D8_04",
          name: "The Do-While Loop",
          title: "The Do-While Loop",
          description:
            "Introduce the do-while loop, which checks its condition after running the body at least once, and compare it against the while loop.",
          concept: "The Do-While Loop",
          transcript:
            "Introduces do-while syntax and its defining trait: unlike while, which checks the condition first, a do-while loop executes its body at least once before checking. A live example prints i from 0 while i < 4, with a forgotten variable in a printf demonstrating a garbage value as a teaching moment.",
          videoId: "aZb0iu4uGwA",
          startSec: 13200,
          endSec: 13481,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D8_05",
          name: "Quiz: Do-While for First N Numbers & The For Loop Syntax",
          title: "Quiz: Do-While for First N Numbers & The For Loop Syntax",
          description:
            "Print the first n natural numbers with a do-while loop, then introduce the for loop's three-part structure.",
          concept: "Do-While Practice & For Loop Introduction",
          transcript:
            "Given input n, prints 1 through n using a do-while loop with a counter starting at 1. Then introduces the for loop's three pieces — initialization (runs once), test condition (checked every iteration), and update statement (runs after each iteration) — traced step by step with i=0, i<n, i++.",
          videoId: "aZb0iu4uGwA",
          startSec: 13481,
          endSec: 13903,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D8_06",
          name: "Quiz: For Loop for N Numbers & Decrementing For Loops",
          title: "Quiz: For Loop for N Numbers & Decrementing For Loops",
          description:
            "Rebuild the first-n-natural-numbers program with a for loop, then build a for loop that counts downward.",
          concept: "For Loop Practice & Decrementing Loops",
          transcript:
            "Starting i at 1 and looping while i <= n prints 1 through n inclusive. A broader point is made about instantly reading loop ranges (i=0, i<n covers 0 to n-1). Then a for loop counts down from 5 using i-- and truthiness checks, with a follow-up quiz printing natural numbers in reverse by starting the counter at n and decrementing to 1.",
          videoId: "aZb0iu4uGwA",
          startSec: 13903,
          endSec: 14312,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D8_07",
          name: "The Break and Continue Statements",
          title: "The Break and Continue Statements",
          description:
            "Learn how break immediately exits a loop while continue only skips the current iteration, and recap the difference before the chapter's practice set.",
          concept: "Break & Continue Statements",
          transcript:
            "Break is shown exiting a for loop immediately once i reaches 5, stopping the loop regardless of its original condition. Continue is then contrasted — it only skips the remainder of the current iteration rather than exiting entirely, shown by replacing break with continue so 5 is skipped but the loop continues. The chapter closes summarizing that break fully exits a loop while continue only skips one iteration.",
          videoId: "aZb0iu4uGwA",
          startSec: 14312,
          endSec: 14732,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D8_08",
          name: "Chapter Wrap-Up — Loop Control Summary",
          title: "Chapter Wrap-Up — Loop Control Summary",
          description:
            "A brief recap of break and continue's core behaviors before closing out the loops chapter and moving into its practice set.",
          concept: "Loop Control Instructions Summary",
          transcript:
            "The chapter closes by reinforcing that break completely exits a loop while continue only skips a particular iteration, wrapping up loop control instructions before the dedicated practice set.",
          videoId: "aZb0iu4uGwA",
          startSec: 14732,
          endSec: 14830,
          durationInMinutes: 2,
        },
      ],
    },
    {
      id: "day9",
      title: "Day 9 — Chapter 4 Practice Set",
      color: "#10b981",
      levels: [
        {
          id: "C_LANG_D9_01",
          name: "Practice: Multiplication Table (Forward, Reverse) & Loop MCQs",
          title:
            "Practice: Multiplication Table (Forward, Reverse) & Loop MCQs",
          description:
            "Print a multiplication table forward and in reverse order, then answer two quick MCQs on loop behavior.",
          concept: "Practice — Multiplication Table & Loop Theory",
          transcript:
            "Reads a number n and prints its multiplication table with a for loop, fixing an off-by-one range issue so it correctly prints n×1 through n×10. Reuses the program with a decrementing for loop to print 10×10 down to 10×1. Two rapid MCQs follow: confirming a do-while loop executes at least once, and confirming any task solvable with one loop type is solvable with the other two as well.",
          videoId: "aZb0iu4uGwA",
          startSec: 14830,
          endSec: 15182,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D9_02",
          name: "Practice: Sum of Natural Numbers (While, For, Do-While) & Sum of a Table",
          title:
            "Practice: Sum of Natural Numbers (While, For, Do-While) & Sum of a Table",
          description:
            "Compute the sum of the first 10 natural numbers using all three loop types, then adapt the accumulator pattern to sum a multiplication table.",
          concept: "Practice — Accumulator Pattern Across Loop Types",
          transcript:
            "A sum variable accumulates the first 10 natural numbers using a while loop (sum += i), producing 55. The same logic is rewritten as a do-while loop and again as a for loop, all producing the identical result. The pattern is then adapted to sum every entry in the multiplication table of 8 (sum += 8 * i), producing 440.",
          videoId: "aZb0iu4uGwA",
          startSec: 15182,
          endSec: 15579,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D9_03",
          name: "Practice: Factorial Using For Loop & While Loop",
          title: "Practice: Factorial Using For Loop & While Loop",
          description:
            "Explain what a factorial is and compute it with a for loop using a product accumulator, then rebuild it with a while loop.",
          concept: "Practice — Factorial Calculation",
          transcript:
            "Factorial is explained as the product of all whole numbers from 1 to n (with 0! defined as 1). A product variable initialized to 1 accumulates via a for loop, tested against several values (4, 5, 6, 0, 1) for correct results (24, 120, 720, 1, 1). The program is then rewritten as a while loop, debugging a stray semicolon before correctly computing factorial(5) = 120.",
          videoId: "aZb0iu4uGwA",
          startSec: 15579,
          endSec: 15902,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D9_04",
          name: "Practice: Prime Number Checker",
          title: "Practice: Prime Number Checker",
          description:
            "Build and progressively debug a program that checks whether a number is prime by testing divisibility from 2 up to that number.",
          concept: "Practice — Prime Number Detection",
          transcript:
            "A prime number is explained as divisible only by 1 and itself, checked by looping from 2 to n-1 and testing the modulus at each step. Several bugs are found and fixed live: inverted true/false logic, missing early-exit break, and 2 incorrectly flagged as not prime, plus special-casing 0 and 1 as not prime. The corrected program is verified against several values, with a note that checking only up to the square root of n is a more efficient approach covered later in DSA.",
          videoId: "aZb0iu4uGwA",
          startSec: 15902,
          endSec: 16304,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D9_05",
          name: "Practice: Prime Checker Rewritten Using While and Do-While Loops",
          title:
            "Practice: Prime Checker Rewritten Using While and Do-While Loops",
          description:
            "Convert the finished prime-checking program into a while loop version and then a do-while loop version, closing out the chapter's practice set.",
          concept: "Practice — Same Prime Logic, Different Loop Types",
          transcript:
            "The completed prime-checker's for loop is converted into a while loop by moving initialization outside and the increment inside the loop body, verified against several values. It's then converted again into a do-while loop by relocating the condition to the end with a terminating semicolon, producing identical results across all test cases, closing Chapter 4's practice set before the course's first project.",
          videoId: "aZb0iu4uGwA",
          startSec: 16304,
          endSec: 16432,
          durationInMinutes: 2,
        },
      ],
    },
    {
      id: "day10",
      title: "Day 10 — Project 1: Number Guessing Game",
      color: "#ec4899",
      levels: [
        {
          id: "C_LANG_D10_01",
          name: "Project Intro, Random Number Generation & Reading Guesses",
          title: "Project Intro, Random Number Generation & Reading Guesses",
          description:
            "Introduce the number guessing game, generate a random target number, and read the player's guesses inside a do-while loop.",
          concept: "Project Setup — Number Guessing Game",
          transcript:
            "The number guessing game is introduced: the program generates a random number and the player guesses it, receiving 'lower'/'higher' hints until correct, illustrated with a worked example (73 → 62 lower, 71 lower, 72 lower, 80 higher, 73 correct). A new project folder is set up, and ChatGPT is asked for random-number-generation code, explaining the `rand() % 100 + 1` pattern for a 1-100 range. A do-while loop is chosen (since the game must run at least once) to prompt and read the player's guess via scanf, looping until it matches the random number.",
          videoId: "aZb0iu4uGwA",
          startSec: 16432,
          endSec: 16824,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D10_02",
          name: "Higher/Lower Feedback & Finishing Touches",
          title: "Higher/Lower Feedback & Finishing Touches",
          description:
            "Add higher/lower feedback, fix an edge case, add a congratulations message, and clean up variable names before wrapping the game up.",
          concept: "Feedback Logic & Polishing the Game",
          transcript:
            "An if-else block compares the guess to the random number, printing 'Lower number please' or 'Higher number please', with numberOfGuesses incrementing each pass; time.h and srand are explained for seeding the random sequence with the current time. A bug where the final correct guess still printed 'Higher number please' is fixed, a 'Congrats!' message is added, variables are renamed for clarity (guessed → guess_number), and a final printf reports the total number of guesses.",
          videoId: "aZb0iu4uGwA",
          startSec: 16824,
          endSec: 17203,
          durationInMinutes: 6,
        },
      ],
    },
    {
      id: "day11",
      title: "Day 11 — Chapter 5: Functions",
      color: "#0ea5e9",
      levels: [
        {
          id: "C_LANG_D11_01",
          name: "Why We Need Functions & Function Prototypes",
          title: "Why We Need Functions & Function Prototypes",
          description:
            "Motivate functions with a repetitive sum problem, then learn what a function is and how a function prototype tells the compiler what's coming.",
          concept: "Introduction to Functions & Prototypes",
          transcript:
            "A simple sum program is repeated for new variable pairs, getting more repetitive and less readable each time, setting up the case for reusable code. A function is defined as a reusable block of code performing a particular task, and the function prototype is introduced as telling the compiler ahead of time about a function's name, return type, and parameters — compared to calling ahead to prepare for guests.",
          videoId: "aZb0iu4uGwA",
          startSec: 17203,
          endSec: 17549,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D11_02",
          name: "Writing the Function Definition & Tracing Execution",
          title: "Writing the Function Definition & Tracing Execution",
          description:
            "Write the actual sum function body, replace repeated inline code with function calls, and trace what happens step by step during a function call.",
          concept: "Function Definition, Calls & Execution Flow",
          transcript:
            "The sum function definition is written with curly braces, taking parameters x and y, and the earlier repeated inline code is replaced with simple calls like sum(a, b). A return statement (return x + y) makes the result usable. A detailed trace explains that execution starts in main, pauses at a function call while control jumps into the function with values copied into parameters, and resumes in main once the function returns its value.",
          videoId: "aZb0iu4uGwA",
          startSec: 17549,
          endSec: 17886,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D11_03",
          name: "Void Functions, Terminology Recap & Multi-Function Quiz",
          title: "Void Functions, Terminology Recap & Multi-Function Quiz",
          description:
            "Learn void functions that return nothing, recap the official terms for prototype/call/definition, then write three functions called in a specific order.",
          concept: "Void Functions & Function Terminology",
          transcript:
            "A void display function takes no arguments and returns nothing, printing a message when called — void is the return type used when a function isn't designed to give back a value. The three core terms are formally recapped: function prototype, function call, and function definition, noting a prototype's placement before or after main doesn't matter. A quiz then asks for three void functions (good morning, good afternoon, good night) called from main in that exact order.",
          videoId: "aZb0iu4uGwA",
          startSec: 17886,
          endSec: 18213,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D11_04",
          name: "Why Use Functions, Parameters vs. Arguments & Pass by Value",
          title: "Why Use Functions, Parameters vs. Arguments & Pass by Value",
          description:
            "Summarize the reasons to use functions and the difference between library and user-defined functions, clarify parameters vs. arguments, then discover why changing a parameter never changes the original variable.",
          concept: "Functions Rationale, Terminology & Pass by Value",
          transcript:
            "Recaps that library functions (like printf) come ready-made while user-defined functions are written by the programmer, and that functions help avoid repeated logic, track a growing program, and enable independent testing. Clarifies that variables in a function's definition are parameters while actual values at the call site are arguments. A 'change' function then demonstrates that modifying a parameter inside a function never alters the original variable in the caller, since C passes a copy of the value — this is 'call by value', reinforced with a photocopy/cash analogy.",
          videoId: "aZb0iu4uGwA",
          startSec: 18213,
          endSec: 18718,
          durationInMinutes: 8,
        },
        {
          id: "C_LANG_D11_05",
          name: "Quiz: Area of a Square with pow() & Intro to Recursion",
          title: "Quiz: Area of a Square with pow() & Intro to Recursion",
          description:
            "Use the pow() library function to calculate a square's area, then discover recursion by noticing factorial(n) always contains factorial(n-1).",
          concept: "Library Functions & Recursion Introduction",
          transcript:
            "The area-of-a-square quiz uses pow() from math.h, debugging a %d-vs-%f format specifier mismatch that initially printed 0. Recursion is then introduced as a function calling itself, illustrated by writing out factorial of 5, 4, and 3 side by side to reveal that factorial(n) always contains factorial(n-1), letting factorial(n) be rewritten as factorial(n-1) × n.",
          videoId: "aZb0iu4uGwA",
          startSec: 18718,
          endSec: 19045,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D11_06",
          name: "Writing the Recursive Factorial Function & Base Conditions",
          title: "Writing the Recursive Factorial Function & Base Conditions",
          description:
            "Implement and trace the recursive factorial function, then add a base condition to stop infinite recursion.",
          concept: "Recursive Factorial & Base Conditions",
          transcript:
            "The recursive function is written as return factorial(n-1) * n, traced through factorial(5) breaking down into 5×factorial(4), 4×factorial(3), and so on down through factorial(0). A base condition (if n equals 0 or 1, return 1) is added to stop the chain from decreasing into negative numbers indefinitely, with a closing note on the risks of missing base cases and recursion's trade-offs versus efficiency, previewing Fibonacci for the practice set.",
          videoId: "aZb0iu4uGwA",
          startSec: 19045,
          endSec: 19508,
          durationInMinutes: 8,
        },
      ],
    },
    {
      id: "day12",
      title: "Day 12 — Chapter 5 Practice Set",
      color: "#10b981",
      levels: [
        {
          id: "C_LANG_D12_01",
          name: "Practice: Average of Three Numbers, Celsius-Fahrenheit & Gravity Functions",
          title:
            "Practice: Average of Three Numbers, Celsius-Fahrenheit & Gravity Functions",
          description:
            "Write three simple formula-based functions: averaging three numbers, converting Celsius to Fahrenheit, and computing gravitational force.",
          concept: "Practice — Formula Functions",
          transcript:
            "A function averaging three integers as a float fixes an integer-division bug by dividing by 3.0. A Celsius-to-Fahrenheit function is implemented carefully to avoid integer-division truncation, formatted to two decimals. A gravitational force function (F = mg) takes a float mass and returns mass × 9.8, all building fluency with simple formula-based functions.",
          videoId: "aZb0iu4uGwA",
          startSec: 19508,
          endSec: 19878,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D12_02",
          name: "Practice: Nth Fibonacci Number Using Recursion",
          title: "Practice: Nth Fibonacci Number Using Recursion",
          description:
            "Explain the Fibonacci sequence, derive its recursive formula, and implement a function to calculate its nth element.",
          concept: "Practice — Recursive Fibonacci",
          transcript:
            "The Fibonacci sequence is explained as each element being the sum of the two preceding ones, starting with 0 and 1. The recursive formula fibonacci(n) = fibonacci(n-1) + fibonacci(n-2) is derived, with base cases for n=1 and n=2 both returning n-1. A misspelled function name causes a compiler error, fixed and tested against several values.",
          videoId: "aZb0iu4uGwA",
          startSec: 19878,
          endSec: 20247,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D12_03",
          name: "Practice: The Tricky a++ Question & Recursive Sum of N Numbers",
          title:
            "Practice: The Tricky a++ Question & Recursive Sum of N Numbers",
          description:
            "Predict the output of a printf using a, ++a, and a++ together and learn about undefined evaluation order, then derive a recursive sum function.",
          concept: "Practice — Evaluation Order & Recursive Sum",
          transcript:
            "Given printf with a, ++a, and a++ together (a starting at 4), the naive left-to-right reading suggests 4, 5, 5, but the program prints 6, 6, 4 — revealing that argument evaluation order in C is undefined behavior, with both interpretations defensible depending on the compiler. The recursive formula sum(n) = sum(n-1) + n is then derived (base case sum(1)=1), with the function deliberately named sum_natural to avoid ambiguity.",
          videoId: "aZb0iu4uGwA",
          startSec: 20247,
          endSec: 20624,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D12_04",
          name: "Practice: Printing a Star Triangle Pattern Using Functions",
          title: "Practice: Printing a Star Triangle Pattern Using Functions",
          description:
            "Derive the mathematical formula for a growing odd-numbered star pattern and implement it with a nested loop.",
          concept: "Practice — Nested Loop Star Pattern",
          transcript:
            "For a triangle pattern where each row has an increasing odd number of stars (1, 3, 5, ...), the pattern follows the formula 2i + 1 for row i (0-indexed). An outer loop runs once per row while an inner loop prints exactly 2i + 1 stars, followed by a newline. After fixing an off-by-one mistake, the program produces the correct star triangle, closing out the chapter's practice set.",
          videoId: "aZb0iu4uGwA",
          startSec: 20624,
          endSec: 20879,
          durationInMinutes: 4,
        },
      ],
    },
    {
      id: "day13",
      title: "Day 13 — Chapter 6: Pointers",
      color: "#8b5cf6",
      levels: [
        {
          id: "C_LANG_D13_01",
          name: "Chapter Intro, Project Setup & What a Pointer Is",
          title: "Chapter Intro, Project Setup & What a Pointer Is",
          description:
            "Set expectations for the pointers chapter, set up the project folder, and understand how a variable's value lives at a memory address that a pointer can store.",
          concept: "Introduction to Pointers & Memory Addresses",
          transcript:
            "Pointers are introduced as one of the most commonly misunderstood topics, even for programmers from easier languages like Python, framed as teaching a low-level understanding of how programming works against hardware. A new Chapter 6 folder is set up in VS Code with a brief aside on color themes. Declaring `int i = 72` is used to explain that this value lives at a specific address in RAM, and a special kind of variable called a pointer is introduced as one that stores an address rather than a value.",
          videoId: "aZb0iu4uGwA",
          startSec: 20879,
          endSec: 21111,
          durationInMinutes: 4,
        },
        {
          id: "C_LANG_D13_02",
          name: "The Address-Of Operator (&) & Declaring a Pointer Variable",
          title: "The Address-Of Operator (&) & Declaring a Pointer Variable",
          description:
            "Use the bucket analogy to understand pointers, retrieve a variable's address with &, then declare a pointer and confirm it matches that address.",
          concept: "Address-Of Operator & Pointer Declaration",
          transcript:
            "A pointer is compared to a bucket that holds water (an address) rather than being the water itself. The & (address-of) operator retrieves i's address directly via `%p` and `&i`, noting the address differs on every run. A pointer variable is then declared as `int* j = &i` ('j points to i'), and printing `%p` with either `&i` or `j` confirms both refer to the identical address, with a note on %u as an alternative unsigned-integer view.",
          videoId: "aZb0iu4uGwA",
          startSec: 21111,
          endSec: 21460,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D13_03",
          name: "The Value-At-Address Operator (*) & Pointer Types",
          title: "The Value-At-Address Operator (*) & Pointer Types",
          description:
            "Learn the dereference operator using a home-address analogy, then extend pointers beyond integers to characters and floats.",
          concept: "Dereference Operator & Pointer Types",
          transcript:
            "The * (value-at-address) operator answers 'given this address, what value lives there', compared to arriving at someone's door using their home address; `*j` retrieves the value 72, and `*&i` is shown to simply equal i itself. The pointer declaration syntax is then extended beyond integers to char pointers and float pointers, with the key rule that a pointer's declared type must always match the type of variable whose address it stores.",
          videoId: "aZb0iu4uGwA",
          startSec: 21460,
          endSec: 21842,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D13_04",
          name: "Misleading Pointer Names & Pointer to a Pointer",
          title: "Misleading Pointer Names & Pointer to a Pointer",
          description:
            "Learn not to trust a pointer's purpose based on its name, then take pointers a level further with a pointer-to-pointer.",
          concept: "Naming Caution & Pointer to Pointer",
          transcript:
            "A cautionary note warns against assuming a pointer's purpose from a descriptive name alone, since exam questions sometimes exploit misleading names. A pointer-to-pointer variable k is then declared with `int** k = &j`, storing the address of pointer j itself, with a trick for reading chained * and & symbols (a * immediately followed by & cancels out) and a note that single/double pointers are what's typically used in real programs.",
          videoId: "aZb0iu4uGwA",
          startSec: 21842,
          endSec: 22130,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D13_05",
          name: "Call by Value Recap & the Call by Reference Challenge",
          title: "Call by Value Recap & the Call by Reference Challenge",
          description:
            "Revisit call by value with the sum function, then attempt to make a function actually change the caller's variable using addresses.",
          concept: "Call by Value vs. Call by Reference",
          transcript:
            "Call by value is recapped using the sum function — passing sum(1, 6) copies values into a and b, with no access to the original variables. A playful challenge then asks whether sum can actually modify the caller's variable x — a copy-based attempt fails, so sum is rewritten to accept `int* a` and `int* b`, using *a and *b to read values and attempt a direct reassignment.",
          videoId: "aZb0iu4uGwA",
          startSec: 22130,
          endSec: 22432,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D13_06",
          name: "Call by Reference Succeeds & The Swap Function",
          title: "Call by Reference Succeeds & The Swap Function",
          description:
            "Confirm that passing addresses lets a function change the caller's variable, then use that idea to implement a working swap function.",
          concept: "Call by Reference & Implementing Swap",
          transcript:
            "The address-based version of sum genuinely changes x's value, confirming that call by reference (passing addresses) lets a function modify the caller's original data, unlike call by value. The classic swap problem is introduced via a plate-swapping analogy needing a temporary third plate, and a swap function using `temp = a; a = b; b = temp` first fails when passed by value, then succeeds once rewritten to accept pointers and dereference throughout — wrapping up the chapter's core pointer concepts.",
          videoId: "aZb0iu4uGwA",
          startSec: 22432,
          endSec: 22778,
          durationInMinutes: 6,
        },
      ],
    },
    {
      id: "day14",
      title: "Day 14 — Chapter 6 Practice Set (Pointers)",
      color: "#10b981",
      levels: [
        {
          id: "C_LANG_D14_01",
          name: "Practice: Addresses, Passing Addresses to Functions & Modifying via Pointer",
          title:
            "Practice: Addresses, Passing Addresses to Functions & Modifying via Pointer",
          description:
            "Print and use a variable's address, pass that address into a function to confirm consistency, then write a function that multiplies a variable by ten through a pointer.",
          concept:
            "Practice — Address-Of, Value-At-Address & Modifying via Pointer",
          transcript:
            "A variable's address is printed with `%p`/`&i`, then a pointer is declared and dereferenced with `*ptr` to retrieve the value. The address is passed into a function accepting an `int*` parameter, printing it again from inside the function to confirm the two addresses match exactly, since only the address value is copied, not the underlying memory location. A void function then multiplies the value at a given address by ten, confirmed by printing the caller's variable before and after the call.",
          videoId: "aZb0iu4uGwA",
          startSec: 22778,
          endSec: 23140,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D14_02",
          name: "Practice: Sum and Average of Two Numbers Returning Addresses",
          title: "Practice: Sum and Average of Two Numbers Returning Addresses",
          description:
            "Write functions to compute and print the sum and average of two numbers, then extend them to return pointers to their locally computed results.",
          concept: "Practice — Functions Returning Pointers",
          transcript:
            "Sum and average functions are written for two numbers, then extended to also print the memory addresses of the locally computed results, requiring the functions to return pointers (`int*`/`float*`) since a local variable's address becomes meaningless once the function returns. Both addresses print successfully, with a note that this exercise is mainly for pointer practice rather than practical use.",
          videoId: "aZb0iu4uGwA",
          startSec: 23140,
          endSec: 23513,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D14_03",
          name: "Practice: Pointer-to-Pointer Value & Call by Value vs. Call by Reference",
          title:
            "Practice: Pointer-to-Pointer Value & Call by Value vs. Call by Reference",
          description:
            "Print a value by chaining through a pointer-to-pointer, then redo the ×10 problem using plain call by value to confirm it fails, closing the chapter.",
          concept: "Practice — Pointer to Pointer & Call by Value Contrast",
          transcript:
            "A program retrieves a variable's value either directly through a single pointer or by dereferencing a double pointer twice. The earlier ×10 problem is then redone using a plain integer parameter instead of a pointer — running it shows the caller's original variable stays unchanged, directly contrasting with the pointer-based version and reinforcing that only passing an address lets a function modify the caller's actual data, wrapping up Chapter 6's practice set.",
          videoId: "aZb0iu4uGwA",
          startSec: 23513,
          endSec: 23798,
          durationInMinutes: 5,
        },
      ],
    },
    {
      id: "day15",
      title: "Day 15 — Chapter 7: Arrays",
      color: "#eab308",
      levels: [
        {
          id: "C_LANG_D15_01",
          name: "What Is an Array? Declaring, Assigning & Accessing Elements",
          title: "What Is an Array? Declaring, Assigning & Accessing Elements",
          description:
            "Understand why arrays exist by trying to store many students' marks with separate variables, then declare an array, assign values, and access elements.",
          concept: "Introduction to Arrays & Basic Access",
          transcript:
            'Chapter 7 opens by defining an array as a collection of similar elements, motivated by the problem of storing marks for many students — creating a separate variable for each one quickly becomes impossible (who would create 90 variables by hand?). Declaring `int marks[90];` reserves space for 90 integers, and elements are assigned and accessed just like normal variables: `marks[0] = 45;`, `marks[1] = 95;`, printed with `%d`. Clarifies that valid indices run from 0 to 89 — `marks[90]` reserves 90 elements but 90 itself is not a valid index. Introduces the idea of contiguous memory locations for array elements, then shows accessing elements via `scanf("%d", &marks[0])`, first typed out one by one for five students\' marks, and then rewritten using a `for` loop for both taking input and printing output.',
          videoId: "c-language-video",
          startSec: 23798,
          endSec: 24204,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D15_02",
          name: "Other Ways to Initialize Arrays, Memory Layout & Intro to Pointer Arithmetic",
          title:
            "Other Ways to Initialize Arrays, Memory Layout & Intro to Pointer Arithmetic",
          description:
            "Learn direct-initialization syntax for arrays, how array elements are laid out byte by byte in memory, and the basics of storing an address in a pointer.",
          concept:
            "Array Initialization Styles, Memory Layout & Pointer Basics",
          transcript:
            "Shows a faster way to build small arrays by direct initialization, e.g. `int cgpa[3] = {9, 8, 8};`, without needing to take input, and notes that the size can even be omitted entirely (`int cgpa[] = {...}`) since the compiler counts the elements automatically. Explains how array elements sit in memory as contiguous blocks — e.g. a 4-byte integer at one address is immediately followed by the next element's 4 bytes, and so on. Transitions into pointer arithmetic: declaring `int a = 5;`, printing its address with `%u`, storing that address in `int* ptr = &a;`, and observing that while the actual address changes on every run of the program, `ptr` and `&a` always match each other — reinforced with a hotel-room analogy (you'll get 'a' large room, just not necessarily the same one as last time).",
          videoId: "c-language-video",
          startSec: 24204,
          endSec: 24518,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D15_03",
          name: "Pointer Increment Behavior & Traversing Arrays with Pointers",
          title: "Pointer Increment Behavior & Traversing Arrays with Pointers",
          description:
            "Discover that ptr++ jumps forward by the pointed-to type's byte size (not always 1), confirm it with a char pointer, and start traversing an array using pointer arithmetic.",
          concept: "Pointer Increment & Array Traversal",
          transcript:
            "Writing `ptr++` changes the value of `ptr`, but not necessarily by 1 — the increment equals however many bytes the pointer's data type takes on that architecture. For an integer pointer on a 4-byte-int system, `ptr++` jumps forward by 4; rerunning the same logic with a character pointer instead confirms it jumps forward by only 1 byte, since `char` takes 1 byte. This generalizes to other pointer operations — adding or subtracting a number from a pointer, subtracting one pointer from another, and comparing two pointers. Using this, a pointer is pointed at the first element of the `marks` array, and printing the addresses of consecutive elements confirms they're exactly 4 bytes apart, setting up pointer-based array traversal.",
          videoId: "c-language-video",
          startSec: 24518,
          endSec: 24845,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D15_04",
          name: "Accessing Arrays via Pointers & Passing Arrays to Functions",
          title: "Accessing Arrays via Pointers & Passing Arrays to Functions",
          description:
            "Point directly at an array's first element, learn the array-name shortcut, print array values through a pointer, and pass an array to a function to see it modifies the original.",
          concept: "Array-Pointer Equivalence & Passing Arrays to Functions",
          transcript:
            "A new program declares `int* ptr = &marks[0];`, an integer pointer pointing to the array's first element. The compiler offers a shortcut: just using the array's bare name (`marks`) is equivalent to `&marks[0]` — the address of the first element — so `marks` and `&marks[0]` mean the same thing. A `for` loop then prints the array both by regular indexing and by dereferencing the pointer, showing that without incrementing, `*ptr` repeats the same first value every time — `ptr++` is needed each iteration to walk through each element in turn. Finally, passing an array to a function is shown to pass just the address of its first element; a quick audience challenge confirms that yes, a function receiving an array's name absolutely can modify the caller's original array, since this is call by reference.",
          videoId: "c-language-video",
          startSec: 24845,
          endSec: 25208,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D15_05",
          name: "Multi-Dimensional Arrays: Declaration, Access, Memory & Practice Quiz",
          title:
            "Multi-Dimensional Arrays: Declaration, Access, Memory & Practice Quiz",
          description:
            "Declare and access 2D arrays, understand how they're stored row-major in memory, then solve a quiz building a 2D array from user input with a display function.",
          concept: "2D Arrays — Declaration, Memory Layout & Input/Display",
          transcript:
            "Introduces multi-dimensional arrays with `int arr[3][2] = {...};`, accessing elements via `arr[row][col]`, and explains that in memory a 2D array is stored row-major — each row is 'unrolled' and placed one after another in contiguous blocks, just like a 1D array. A quick quiz asks for a 2D array built from user input with a display function to print its contents: nested `for` loops handle this, an outer loop for rows and an inner loop for columns, used first with `scanf` to read each `arr[i][j]` and then with `printf` to display each value labeled by its position. After testing with sample values, an alternate compact print format is shown — printing just the numbers with spaces and a newline after each row — producing a clean grid-style layout on screen.",
          videoId: "c-language-video",
          startSec: 25208,
          endSec: 25557,
          durationInMinutes: 6,
        },
      ],
    },
    {
      id: "day16",
      title: "Day 16 — Chapter 7 Practice Set (Arrays)",
      color: "#06b6d4",
      levels: [
        {
          id: "C_LANG_D16_01",
          name: "Practice: Pointer Arithmetic Verification & the s+3 Trick Question",
          title:
            "Practice: Pointer Arithmetic Verification & the s+3 Trick Question",
          description:
            "Verify with pointer arithmetic that ptr+2 points to an array's third element, then untangle a tricky true/false question about zero-based indexing.",
          concept: "Practice — Pointer Arithmetic & Indexing Trick",
          transcript:
            "Problem 1 builds an array of 10 numbers and uses pointer arithmetic to verify that `ptr + 2` points to the third element (where `ptr` points to the array's first element) — checked live by printing the address and value at `ptr + 3` as well, confirming it correctly lands on the fourth element. Problem 2 asks whether the statement 'if s3 is a 1D array of integers, then `*(s + 3)` refers to the third element' is true — the answer is false, since zero-based indexing means `s + 3` actually points to the fourth element, not the third, a classic off-by-one trap.",
          videoId: "c-language-video",
          startSec: 25557,
          endSec: 25787,
          durationInMinutes: 4,
        },
        {
          id: "C_LANG_D16_02",
          name: "Practice: Multiplication Table in an Array (Fixed Number & General Input)",
          title:
            "Practice: Multiplication Table in an Array (Fixed Number & General Input)",
          description:
            "Store the multiplication table of 5 inside an array of 10 integers, then generalize the same program to work for any number entered by the user.",
          concept: "Practice — Building & Generalizing an Array-Based Table",
          transcript:
            "Problem 3 creates an array of 10 integers and fills it with the multiplication table of 5 using a `for` loop (`arr[i] = 5 * (i + 1)`, since the loop index runs 0–9 but the table needs to start at ×1), then prints the results with a custom snippet built for reusable `printf` statements. Problem 4 repeats the same program but generalizes it for any number `n` provided by the user instead of a hard-coded 5, simply swapping the literal 5 for the input variable throughout — tested by printing the tables of 4 and 1, with a lighthearted aside about kids not memorizing their multiplication tables anymore.",
          videoId: "c-language-video",
          startSec: 25787,
          endSec: 26116,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D16_03",
          name: "Practice: Reversing an Array Using a Function",
          title: "Practice: Reversing an Array Using a Function",
          description:
            "Derive the swap-based algorithm for reversing an array in place, implement it as a function, and trace through exactly why the loop only needs to run halfway.",
          concept: "Practice — In-Place Array Reversal Algorithm",
          transcript:
            "Problem 5 writes a function that reverses an array passed to it. Starting from the familiar three-line swap technique (`temp = a; a = b; b = temp;`), the logic is extended to arrays: to reverse `{1,2,3,4,5,6}`, the first element swaps with the last, the second with the second-last, the third with the third-last, and so on — meaning index `i` swaps with index `n - i - 1`. Tracing this shows the loop only needs to run up to the array's midpoint (`i` from 0 to `n/2 - 1`), since running it all the way to `n` would swap everything back to its original order. The function is implemented with a `temp` variable and `arr[i] = arr[n-i-1]` style swaps inside a loop bounded by `n/2`, verified by printing the array before and after reversal — a common mistake (looping all the way to `n` instead of stopping at `n/2`) is called out explicitly.",
          videoId: "c-language-video",
          startSec: 26116,
          endSec: 26630,
          durationInMinutes: 9,
        },
        {
          id: "C_LANG_D16_04",
          name: "Practice: Counting Positive Integers & Building a 3x10 Table of Multiplication Tables",
          title:
            "Practice: Counting Positive Integers & Building a 3x10 Table of Multiplication Tables",
          description:
            "Write a function that counts how many positive integers are in an array, then build a 2D array holding the multiplication tables of three different numbers at once.",
          concept:
            "Practice — Positive-Count Function & 2D Multiplication Tables",
          transcript:
            "Problem 6 writes a `countPositives` function that loops through an array, incrementing a counter each time an element is greater than 0, and returns the total — tested on an array mixing positive and negative integers. Problem 7 builds a `3 × 10` two-dimensional array to hold the multiplication tables of 2, 7, and 9 all at once: a nested loop fills row `i` with the table of a chosen base number (`base[i] * (j + 1)`), and a second nested loop prints each row, producing all three multiplication tables from a single 2D array.",
          videoId: "c-language-video",
          startSec: 26630,
          endSec: 26951,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D16_05",
          name: "Practice: Custom Input for the 2D Table & Printing 3D Array Addresses",
          title:
            "Practice: Custom Input for the 2D Table & Printing 3D Array Addresses",
          description:
            "Adapt the 3x10 multiplication-table program to accept any three numbers from the user, then build a 3D array and print all of its element addresses in increasing order.",
          concept: "Practice — Custom Input & 3D Array Memory Addresses",
          transcript:
            "As a follow-up to Problem 7, the 3×10 multiplication-table program is adapted to accept three custom numbers from the user via `scanf` instead of hard-coded 2, 7, and 9, correctly producing the tables for whichever numbers are entered. Problem 9 then builds a three-dimensional array (`arr[3][3][4]`) and uses a triple-nested `for` loop to print the address of every single element using `%u`, confirming the addresses increase in fixed 4-byte steps across the entire structure — wrapping up Chapter 7's practice set before the course moves on to Chapter 8: Strings.",
          videoId: "c-language-video",
          startSec: 26951,
          endSec: 27151,
          durationInMinutes: 3,
        },
      ],
    },
    {
      id: "day17",
      title: "Day 17 — Chapter 8 (Strings)",
      color: "#8b5cf6",
      levels: [
        {
          id: "C_LANG_D17_01",
          name: "String Fundamentals — Null Character, Contiguous Memory & the %s Revelation",
          title:
            "String Fundamentals — Null Character, Contiguous Memory & the %s Revelation",
          description:
            "Understand what a string really is at the memory level — a 1D char array terminated by a null character stored in contiguous memory — then compare printing it character-by-character in a loop versus the much simpler %s format specifier.",
          concept: "String Basics — Null Termination & Printing",
          transcript:
            "Chapter 8 opens by defining a string as a one-dimensional character array terminated by a null character, used to mark where the string ends — demonstrated by manually building 'Harry' as H-A-R-R-Y followed by \\0. The contiguous memory layout of characters is explained through a hotel-room and train-seat analogy (consecutive addresses like 8221, 8221+1, 8221+2...), the same logic already seen with arrays. A string is first built with individual characters and printed using a for loop with %c, printing each element to reconstruct 'a', 'b', 'c'. The same string is then rebuilt directly using double quotes (char st[] = \"abc\"), revealing that double-quote syntax automatically appends the null character — proven by looping one extra index and seeing the null character appear at the end. Finally, the lesson shows that an entire string can be printed in a single line using %s instead of looping character-by-character with %c, since the string's name is already the address of its first element, which is called out as a major convenience C provides over manual iteration.",
          videoId: "c-language-video",
          startSec: 27151,
          endSec: 27607,
          durationInMinutes: 8,
        },
        {
          id: "C_LANG_D17_02",
          name: "Reading & Declaring Strings — scanf, gets, puts, fgets vs gets, and Pointer-Based Strings",
          title:
            "Reading & Declaring Strings — scanf, gets, puts, fgets vs gets, and Pointer-Based Strings",
          description:
            "Learn the different ways to take string input and output it — scanf's null-character auto-insertion and its inability to handle multi-word input, gets() and puts() as the fix, why gets() is considered unsafe, and declaring strings using character pointers instead of arrays.",
          concept: "String I/O Functions & Pointer-Based Declaration",
          transcript:
            'This lesson covers reading strings with scanf using %s and st (not &st, since an array name is already an address), noting that scanf automatically appends a null character when Enter is pressed, but only works for single-word strings since it cannot handle spaces or multi-word input. To solve this, gets() is introduced as a function that reads a full multi-word string including spaces, demonstrated by reading \'Harry is good\' into a buffer. puts() is then shown as the counterpart for printing, which additionally moves the cursor to the next line after output, unlike printf. A ChatGPT-style explanation follows on why gets() should be avoided — due to buffer overflow risks — and why fgets() is the recommended safer replacement, noting gets() was deprecated in the C11 standard. Finally, the lesson shows declaring a string using a character pointer (char *ptr = "Harry"), explaining that unlike array-declared strings which cannot be reinitialized once defined, a pointer-declared string can be reassigned to point at an entirely different string later (ptr = "Rohan"), making pointers the right choice when a string needs to change repeatedly throughout a program.',
          videoId: "c-language-video",
          startSec: 27607,
          endSec: 27933,
          durationInMinutes: 5,
        },
        {
          id: "C_LANG_D17_03",
          name: "Standard String Library Functions — strlen, strcpy, strcat & strcmp",
          title:
            "Standard String Library Functions — strlen, strcpy, strcat & strcmp",
          description:
            "Explore the core functions from string.h: strlen to count characters excluding the null terminator, strcpy to copy a source string into a target, strcat to concatenate two strings, and strcmp to compare strings using ASCII-value ordering.",
          concept: "string.h Library Functions",
          transcript:
            "This lesson works through the essential functions in the string.h header. strlen(st) is demonstrated on the string 'Harry', correctly returning 5 by counting all characters excluding the null character. strcpy(target, source) is then shown copying a source string into a target character array, with a live debug walkthrough fixing an initial mismatch caused by comparing the wrong variables. strcat(s1, s2) is demonstrated concatenating two strings together, with the caveat that the first string's buffer must have enough extra space to hold the combined result — shown by declaring both arrays with 56 characters and merging 'Harry' with ' Bhai' into 'Harry Bhai'. Finally, strcmp(s1, s2) is introduced as a function that returns 0 when two strings are equal, a negative value when the first string would come earlier in dictionary (ASCII) order, and a positive value when the second string would come earlier — demonstrated with 'far' vs 'aa jog' and reinforced by checking actual ASCII values, including edge cases like a leading pipe character.",
          videoId: "c-language-video",
          startSec: 27933,
          endSec: 28296,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D17_04",
          name: "Memory Tricks for strcmp & Transition to Chapter 8 Practice Set",
          title:
            "Memory Tricks for strcmp & Transition to Chapter 8 Practice Set",
          description:
            "Pick up a couple of quick mnemonic tricks for remembering strcmp's negative/positive return convention before moving into the Chapter 8 practice set with its first two questions.",
          concept: "strcmp Mnemonics & Practice Set Intro",
          transcript:
            "This short segment offers memory tricks for exam recall of strcmp's return convention — phrases like 'far joke is negative' and 'deep joke is negative' (D comes before J alphabetically, so strcmp(\"deep\",\"joke\") is negative) are suggested as easy ways to remember which comparison order yields a negative versus positive result. The lesson then transitions into the Chapter 8 practice set: Question 1 asks which function is used to take a multi-word string as input, answered as gets() since scanf cannot handle spaces; Question 2 asks for a program that takes a string as input from the user and prints it back using both %c and %s approaches, setting up the next hands-on segment.",
          videoId: "c-language-video",
          startSec: 28296,
          endSec: 28463,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D17_05",
          name: "Practice: String Input Techniques & Building a Custom strlen Function",
          title:
            "Practice: String Input Techniques & Building a Custom strlen Function",
          description:
            "Take a string as input using scanf and print it with both %s and a manual %c loop with hand-added null termination, debug the classic fflush(stdin) issue with single-character scanf reads, then build a custom strlen function from scratch using a while loop.",
          concept: "Practice — String I/O and Custom strlen Implementation",
          transcript:
            "Continuing Question 2, a 6-character char array is declared to hold 'Harry' plus its null terminator, read in with scanf and %s, and printed back with printf and %s, confirmed working correctly. The character-by-character alternative is then built using a for loop with %c up to index 4 followed by a manually appended null character at index 5 — but running it reveals that pressing Enter after each single-character scanf read causes the newline to be consumed as input, corrupting the read; this is fixed by adding fflush(stdin) after each scanf call, which clears the leftover newline and lets the full string be entered correctly. Question 3 then asks for a custom implementation of strlen: starting with a while loop that reads characters from the string until it hits the null character, incrementing a counter each iteration, with live debugging to fix an uninitialized index variable and an off-by-one bug caused by counting the null character itself (fixed with count = i - 1). The logic is finally wrapped into a reusable myStrlen(char *str) function and tested successfully against strings of varying lengths, including ones with spaces.",
          videoId: "c-language-video",
          startSec: 28463,
          endSec: 28844,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D17_06",
          name: "Practice: Slicing a String with Pointer Arithmetic & Implementing Custom strcpy",
          title:
            "Practice: Slicing a String with Pointer Arithmetic & Implementing Custom strcpy",
          description:
            "Write a function that slices a string in place between two positions using pointer manipulation, then implement a from-scratch version of strcpy that copies a source string into a target using the previously built myStrlen function.",
          concept: "Practice — String Slicing & Custom strcpy",
          transcript:
            "Question 4 asks for a slice function that changes the original string so it becomes the sliced substring between positions m and n (both treated as inclusive since the problem doesn't specify otherwise). The solution repoints two character pointers — one to the start position m and one just past the end position n — then sets the pointer at position n to a null character, effectively truncating the string there while the returned pointer starts from position m. This is tested by slicing indices 1 through 5, then adjusting the bounds to confirm edge cases work correctly, walking through exactly how the pointer arithmetic reshapes what the string 'contains' in memory. Question 5 then implements a custom strcpy: since both target and source are arrays, a for loop runs from 0 up to myStrlen(source), copying each character with target[i] = source[i], with debugging to fix naming and a missing null terminator at the end (target[i] = '\\0'). The final myStrcpy(target, source) is tested by copying 'Harry' into an empty target array and printing both source and target to confirm identical output.",
          videoId: "c-language-video",
          startSec: 28844,
          endSec: 29275,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D17_07",
          name: "Practice: String Encryption, Decryption, Character Counting & Contains Check",
          title:
            "Practice: String Encryption, Decryption, Character Counting & Contains Check",
          description:
            "Build a simple Caesar-cipher-style encryption by shifting ASCII values, write the matching decryption, then count how many times a given character appears in a string and check whether a character exists in it at all.",
          concept: "Practice — Encryption, Decryption & Character Search",
          transcript:
            "Question 6 builds a simple encryption scheme by looping through a string and incrementing each character's ASCII value by 1 (str[i] = str[i] + 1), turning 'Harry' into garbled output — demonstrated further by encrypting a full sentence into unreadable text as a lighthearted secret-message example. Question 7 writes the matching decryption by subtracting 1 from each character's ASCII value instead, correctly restoring the original sentence, reinforcing that this shift-based scheme is a very basic cipher. Question 8 counts how many times a given character appears in a string using an if check inside a loop (if str[i] == target character, increment count), tested by counting occurrences of 'z' and 'r' in different strings. Question 9, the final problem in the Chapter 8 practice set, checks whether a character exists in a string at all: an if statement sets a 'contains' flag to true and breaks out of the loop as soon as a match is found, printing 'Yes it contains' or 'Does not contain' accordingly, wrapping up the chapter's practice set.",
          videoId: "c-language-video",
          startSec: 29275,
          endSec: 29611,
          durationInMinutes: 6,
        },
      ],
    },
    {
      id: "day18",
      title: "Day 18 — Chapter 9 (Structures)",
      color: "#f59e0b",
      levels: [
        {
          id: "C_LANG_D18_01",
          name: "Structures Introduction & First Program — Quick Quiz Setup",
          title: "Structures Introduction & First Program — Quick Quiz Setup",
          description:
            "Understand why structures exist to hold dissimilar data types under one name (unlike arrays), write the first struct employee program including the strcpy-for-strings gotcha, then start the Quick Quiz building three employee records from user input.",
          concept: "Structures — Introduction & First Program",
          transcript:
            "Chapter 9 opens by contrasting arrays and strings (which only hold similar data types) with structures, which can hold dissimilar data types together under one name — motivated by wanting a single 'employee' variable containing a code, salary, and name simultaneously. The first program declares struct employee outside main with int code, float salary, and char name fields, following the syntax of struct keyword, name, and semicolon-terminated closing brace. Assigning a string directly with e1.name = \"Harry\" throws an error since character arrays can't be assigned this way once declared, so strcpy(e1.name, \"Harry\") is used instead (requiring string.h). All three fields are printed with %d, %f, %s to confirm the struct correctly holds an integer, float, and character array together. The Quick Quiz then asks for a program storing three employees' details from user-defined (input) data using the declared structure — begun by taking e1.code via scanf with the same %d and &e1.code syntax already familiar from primitives.",
          videoId: "c-language-video",
          startSec: 29611,
          endSec: 30006,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D18_02",
          name: "Quick Quiz Completion, Why Use Structures, and Array of Structures",
          title:
            "Quick Quiz Completion, Why Use Structures, and Array of Structures",
          description:
            "Finish the three-employee Quick Quiz (including the classic fflush/newline formatting fix), understand why structures matter for organizing and managing large numbers of related attributes, then see how an array of structures is declared.",
          concept: "Why Structures & Array of Structures",
          transcript:
            "The Quick Quiz is completed by taking salary (%f) and name (%s) input for e1, then duplicating the block for e2 and e3 using a second file and VS Code's 'change all occurrences' feature to safely rename variables without corrupting the original code — with a caution to beginners against rushing multi-cursor edits during exams. Missing backslash-n formatting is fixed for clean output, and the program is tested with three full sets of employee values. The lesson then explains why structures matter: they keep data organized and make data management easy, especially as the number of attributes per record grows — with 15, 20, or more attributes, maintaining separate variables (employee_code, employee_salary, employee_name, etc.) becomes impractical, whereas a struct groups them under one name. This naturally leads into arrays of structures: just as arrays of integers, floats, and characters exist, structures can be collected into arrays too, with the syntax demonstrated via a new struct.c file declaring struct employee again as a foundation for the next examples.",
          videoId: "c-language-video",
          startSec: 30006,
          endSec: 30365,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D18_03",
          name: "Struct Initialization Shortcuts & Memory Layout of Structures",
          title:
            "Struct Initialization Shortcuts & Memory Layout of Structures",
          description:
            "Learn the brace-initialization shortcut for structs (similar to array/string initialization), then see how structure members are laid out in contiguous memory addresses, growing by each field's byte size.",
          concept: "Struct Initialization & Contiguous Memory Layout",
          transcript:
            "This lesson shows an alternative way to initialize a structure in one line — struct employee harry = {100, 71.2, \"Harry\"} — setting code, salary, and name simultaneously, verified by printing all three fields via harry.code, harry.salary, and harry.name (with VS Code's autocomplete confirming the compiler recognizes harry as a struct offering code/name/salary suggestions after the dot). The lesson then explains that structures, like arrays, are stored in contiguous memory locations: for a struct employee instance with a 4-byte integer, a 4-byte float, and a character array, the memory layout is walked through with example addresses (e.g. starting at 7881, each 4-byte field pushing the next field's address forward by 4), reinforcing that all struct members sit back-to-back in memory.",
          videoId: "c-language-video",
          startSec: 30365,
          endSec: 30572,
          durationInMinutes: 3,
        },
        {
          id: "C_LANG_D18_04",
          name: "Pointer to Structures, Arrow Operator, Passing Structs to Functions & typedef",
          title:
            "Pointer to Structures, Arrow Operator, Passing Structs to Functions & typedef",
          description:
            "Create a pointer to a structure and dereference it with (*ptr).field, learn the arrow operator (ptr->field) as its shorthand, see the prototype for passing a struct to a function, and get introduced to the typedef keyword for creating type aliases — including aliasing struct employee itself.",
          concept: "Pointer to Structures, Arrow Operator & typedef",
          transcript:
            "A pointer to structure is created with struct employee *ptr = &e1, storing e1's address; accessing a member requires dereferencing first — (*ptr).code — with the star required inside the parentheses, demonstrated by setting and printing e1.code as 56 through the pointer. The arrow operator is then introduced as shorthand for exactly the same operation: ptr->code instead of (*ptr).code, producing identical output with far less typing — described as something the language's creators added specifically because typing star-parens-dot repeatedly is tedious. A function prototype for passing a struct to a function (void show(struct employee e)) is given as a quiz exercise to complete. Finally, the typedef keyword is introduced as a way to create alias names for data types — demonstrated first trivially with typedef int Harry (so 'Harry' becomes usable exactly like int), then applied meaningfully to typedef struct employee EP, letting 'EP e1' replace the more verbose 'struct employee e1' everywhere in the code, including for pointer declarations like EP *ptr1.",
          videoId: "c-language-video",
          startSec: 30572,
          endSec: 30927,
          durationInMinutes: 6,
        },
        {
          id: "C_LANG_D18_05",
          name: "Practice: 2D Vector Structure & a Function to Sum Two Vectors",
          title:
            "Practice: 2D Vector Structure & a Function to Sum Two Vectors",
          description:
            "Wrap up the structures concept, then build a struct vector with i and j components, and write a sumVector function that takes two vectors and returns their component-wise sum — debugged live including a parenthesization and component-swap mistake.",
          concept: "Practice — Vector Structure & Sum Function",
          transcript:
            "The structures concept wraps up before moving into the Chapter 9 practice set. Problem 1 asks for a 2D vector represented with a structure: struct vector with int i and int j components, instantiated as v1 = {1, 1} and printed with %d i + %d j format using v.i and v.j — extendable to 3D by adding a k component. Problem 2 asks for a sumVector function returning struct vector, taking two struct vector parameters v1 and v2, and returning a new vector v3 built from v1.i + v2.i and v1.j + v2.j. Live debugging catches two mistakes — printing v1's fields instead of v3's, and accidentally adding i to j instead of i to i — both fixed by carefully matching components, and the function is also shown rewritten more compactly using typedef struct vector V to shorten every 'struct vector' occurrence to just 'V'.",
          videoId: "c-language-video",
          startSec: 30927,
          endSec: 31378,
          durationInMinutes: 8,
        },
        {
          id: "C_LANG_D18_06",
          name: "Practice: Array vs Structure Judgment Call & Arrow Operator Demo Program",
          title:
            "Practice: Array vs Structure Judgment Call & Arrow Operator Demo Program",
          description:
            "Answer why an array (not a structure) is the right tool for storing 20 similar integers, then build a full demonstration program showing the arrow operator in action with an employee struct holding salary and score fields.",
          concept: "Practice — Array vs Struct Reasoning & Arrow Operator Demo",
          transcript:
            "Problem 3 asks what to use for storing 20 integers in memory — array or structure — answered as array, since structures exist for dissimilar data types, not for grouping many values of the same type; the point is reinforced with an analogy about not using a sledgehammer to kill a mosquito. Problem 4 asks for a program illustrating the arrow operator: a struct employee is declared with int salary and float score fields, aliased via typedef as EMP, and an employee e1 plus a pointer struct employee *ptr1 = &e1 are created. The lesson re-derives the arrow operator from first principles — dereferencing with (*ptr1).salary versus the equivalent shorthand ptr1->salary — then prints both salary and score fields using either syntax, confirming both produce identical output (e.g. salary 56, score 45.3), reinforcing that ptr->field and (*ptr).field are fully interchangeable.",
          videoId: "c-language-video",
          startSec: 31378,
          endSec: 31769,
          durationInMinutes: 7,
        },
        {
          id: "C_LANG_D18_07",
          name: "Practice: Complex Number Structure & an Array of Complex Numbers with Display",
          title:
            "Practice: Complex Number Structure & an Array of Complex Numbers with Display",
          description:
            "Build a structure representing a complex number with real and imaginary parts, then create an array of complex numbers populated from user input and shown live via a display step as values are entered — with a note that the typedef version was already demonstrated.",
          concept:
            "Practice — Complex Number Structure & Array with Live Display",
          transcript:
            "Problem 5 builds a struct representing a complex number with float real and float imaginary parts, aliased with typedef as C, instantiated and printed in the form 'real + imaginary i' (e.g. '1 + 2i'), with a brief aside on what a complex number is for anyone unfamiliar. Problem 6 extends this into an array of complex numbers, taking real and imaginary parts as input from the user for each array element via scanf and displaying them with a display step inside the input loop so each complex number appears as soon as it's entered, looping from index 0 up to a fixed count. Problem 7, which asks for the same structure built using the typedef keyword, is noted as already demonstrated earlier in the chapter.",
          videoId: "c-language-video",
          startSec: 31769,
          endSec: 31996,
          durationInMinutes: 4,
        },
        {
          id: "C_LANG_D18_08",
          name: "Practice: Bank Account Structure & the Date-Comparison Function Challenge",
          title:
            "Practice: Bank Account Structure & the Date-Comparison Function Challenge",
          description:
            "Design a structure to represent a customer's bank account with justified field choices, then tackle the chapter's toughest problem — a date structure and a compare function that correctly determines whether one date is in the future, in the past, or equal to another, including a typedef refactor.",
          concept: "Practice — Bank Account Modeling & Date Comparison Logic",
          transcript:
            "Problem 8 designs a struct bank_account with an integer account number, a 34-character name field, an 11-character IFSC code field (including room for the null terminator), and a float balance — explained as a basic-level model where field choices depend on what information is actually needed, not a single fixed 'correct' answer. Problem 9, flagged as notably harder than it looks, builds a struct date with integer month, day, and year fields, then writes a compare(struct date d1, struct date d2) function returning 1 if d1 is in the future, 0 if the dates are equal, and -1 if d1 is in the past. The logic is built step by step with live debugging: first checking full equality across year, month, and day (returning 0), then comparing years (returning 1 if d1's year is greater), falling through to compare months when years are equal, and finally days when months are also equal — with each level using if/else-if chains and careful attention to which date's field is compared against which. The function is tested against equal dates, future dates, and past dates to confirm correct -1/0/1 results, and Problem 9's follow-up (rewriting the date struct with typedef as DT) is completed by aliasing struct date to DT throughout, after which the chapter closes with excitement about moving on to the next chapter.",
          videoId: "c-language-video",
          startSec: 31996,
          endSec: 32519,
          durationInMinutes: 9,
        },
      ],
    },
    {
      id: "day19",
      title: "Day 19 — File Handling (File I/O) in C",
      color: "#f59e0b",
      levels: [
        {
          id: "C_D19_01",
          name: "What is a File? RAM vs Disk Storage",
          title: "What is a File? RAM vs Disk Storage",
          description:
            "Understand what a file is, why RAM is volatile and unsuitable for permanent storage, and how compiled programs move from disk to RAM during execution.",
          concept: "Files vs Volatile Memory",
          transcript:
            "This lesson introduces files as data stored permanently on a disk, in contrast to Random Access Memory, which is fast but volatile. It explains that when a C program runs, it is compiled into an executable, loaded temporarily into RAM, executed, and then cleared from RAM — which is why files are used to persist large amounts of data.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 32519,
          endSec: 32645,
          durationInMinutes: 2,
        },
        {
          id: "C_D19_02",
          name: "The File Pointer & Opening a File with fopen",
          title: "The File Pointer & Opening a File with fopen",
          description:
            "Learn what a file pointer is and how fopen is used to create a connection between a C program and a file on disk.",
          concept: "File Pointer and fopen",
          transcript:
            "This lesson explains that a file pointer is a structure that must be created before working with a file, and introduces the pseudocode pattern for opening a file: specifying the filename with its extension and the mode in which it should be opened using fopen.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 32645,
          endSec: 32754,
          durationInMinutes: 2,
        },
        {
          id: "C_D19_03",
          name: "File Opening Modes: r, rb, w, wb, a",
          title: "File Opening Modes: r, rb, w, wb, a",
          description:
            "Learn the different modes C offers for opening a file: read, read-binary, write, write-binary, and append.",
          concept: "File Opening Modes",
          transcript:
            "This lesson covers the multiple modes C offers for opening a file: 'r' for reading text files, 'rb' for reading binary files, 'w' for writing, 'wb' for writing in binary, and 'a' for appending, noting that append mode creates the file if it does not already exist.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 32754,
          endSec: 32835,
          durationInMinutes: 1,
        },
        {
          id: "C_D19_04",
          name: "Reading Integers with fscanf & Verifying a File Exists",
          title: "Reading Integers with fscanf & Verifying a File Exists",
          description:
            "Write a first program that opens a file, reads an integer with fscanf, and observe how the file pointer advances on repeated reads; then check whether a file exists using a NULL pointer check.",
          concept: "fscanf and NULL Pointer Check",
          transcript:
            "This lesson demonstrates opening a file in read mode, declaring an integer, and using fscanf with the file pointer to read a value into it, printing the result. It shows that reading again with fscanf advances the file pointer to the next value each time. It then covers a quick quiz on modifying the program to check whether fopen returned NULL, which indicates the file does not exist, using an if-else block to print an appropriate message.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 32835,
          endSec: 32975,
          durationInMinutes: 2,
        },
        {
          id: "C_D19_05",
          name: "Closing Files with fclose",
          title: "Closing Files with fclose",
          description:
            "Understand why closing a file with fclose is good practice and what happens to system resources when a file is left open.",
          concept: "fclose and Resource Management",
          transcript:
            "This lesson explains, using a refrigerator analogy, why it is good practice to close a file once you are done working with it. It covers the fclose syntax and explains that for long-running programs, failing to close a file keeps it locked by the program, which can prevent other processes from deleting or modifying it. Calling fclose tells the operating system the resource is free.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 32975,
          endSec: 33095,
          durationInMinutes: 2,
        },
        {
          id: "C_D19_06",
          name: "Writing to Files with fprintf (Write Mode)",
          title: "Writing to Files with fprintf (Write Mode)",
          description:
            "Learn to write data into a file using fprintf in write mode, and see that write mode erases existing file content before writing.",
          concept: "fprintf and Write Mode",
          transcript:
            "This lesson shows how to open a file in write mode and use fprintf, which mirrors fscanf's syntax but writes instead of reads. It demonstrates that opening a file in write mode clears all existing content in the file before the new data is written, which is an important behavior to remember.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 33095,
          endSec: 33193,
          durationInMinutes: 2,
        },
        {
          id: "C_D19_07",
          name: "Append Mode vs Write Mode",
          title: "Append Mode vs Write Mode",
          description:
            "Learn how append mode solves the problem of write mode erasing a file, by adding new content to the end of the file instead.",
          concept: "Append Mode",
          transcript:
            "This lesson introduces append mode as the solution to write mode's file-erasing behavior. Opening a file in append mode adds new data to the end of the existing file content instead of overwriting it, which is demonstrated by running the program multiple times and watching new values accumulate at the end of the file.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 33193,
          endSec: 33226,
          durationInMinutes: 1,
        },
        {
          id: "C_D19_08",
          name: "Reading & Writing Single Characters: fgetc and fputc",
          title: "Reading & Writing Single Characters: fgetc and fputc",
          description:
            "Learn how to read and write a single character to or from a file using fgetc and fputc.",
          concept: "fgetc and fputc",
          transcript:
            "This lesson covers fgetc for reading a single character from a file and fputc for writing a single character to a file. It demonstrates reading the first character of a file, then switches to write mode to write a character, showing that write mode overwrites the file while append mode adds the character to the end.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 33226,
          endSec: 33321,
          durationInMinutes: 2,
        },
        {
          id: "C_D19_09",
          name: "Reading a File Character by Character Until EOF",
          title: "Reading a File Character by Character Until EOF",
          description:
            "Use a while loop with fgetc to read an entire file character by character, breaking the loop when EOF is reached.",
          concept: "EOF Detection and Character-by-Character Reading",
          transcript:
            "This lesson explains that fgetc returns the constant EOF once all characters from a file have been read, and shows how to use this to detect the end of a file. It builds a program that runs an infinite while loop, reads one character at a time with fgetc, prints each character, and breaks out of the loop as soon as the character read equals EOF.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 33321,
          endSec: 33451,
          durationInMinutes: 2,
        },
        {
          id: "C_D19_10",
          name: "Practice: Reading Three Integers from a File",
          title: "Practice: Reading Three Integers from a File",
          description:
            "Write a program that reads three integers stored in a text file using fscanf and prints them out.",
          concept: "Practice — Reading Multiple Integers",
          transcript:
            "This practice problem asks for a program that reads three integers from a file. The lesson creates a text file containing three numbers, opens it in read mode, uses fscanf with three format specifiers in a single call to read all three integers at once, and prints them back out with fprintf-style formatting.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 33489,
          endSec: 33616,
          durationInMinutes: 2,
        },
        {
          id: "C_D19_11",
          name: "Practice: Generating a Multiplication Table File",
          title: "Practice: Generating a Multiplication Table File",
          description:
            "Write a program that generates a well-formatted multiplication table for a given number and writes it into a text file.",
          concept: "Practice — Writing a Multiplication Table",
          transcript:
            "This practice problem asks for a program that writes a multiplication table into a text file in a readable, well-formatted way. The lesson opens a file in write mode, runs a for loop from 0 to 9, and uses fprintf to write each multiplication result followed by a newline character into the file.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 33616,
          endSec: 33754,
          durationInMinutes: 2,
        },
        {
          id: "C_D19_12",
          name: "Practice: Copying File Contents Character by Character",
          title: "Practice: Copying File Contents Character by Character",
          description:
            "Write a program that reads a text file character by character and writes its content twice into a separate file.",
          concept: "Practice — Copying Files Character by Character",
          transcript:
            "This practice problem builds on the earlier character-by-character reading program. It reuses the fgetc-based reading loop but adds a second file pointer opened in append mode, writing each character read from the source file into the destination file twice, as required by the problem statement.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 33754,
          endSec: 33906,
          durationInMinutes: 3,
        },
        {
          id: "C_D19_13",
          name: "Practice: Writing Employee Name and Salary to a File",
          title: "Practice: Writing Employee Name and Salary to a File",
          description:
            "Take the name and salary of two employees as input from the user and write them to a text file in a specified comma-separated format.",
          concept: "Practice — Formatted Employee Data Output",
          transcript:
            "This practice problem takes a name and salary for two employees as input from the user using scanf, storing names in character arrays and salaries in integers. It then opens a file in write mode and uses fprintf with a specific format string to write each employee's name and salary as comma-separated values, each on its own line.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 33906,
          endSec: 34174,
          durationInMinutes: 4,
        },
        {
          id: "C_D19_14",
          name: "Practice: Doubling an Integer Value Stored in a File",
          title: "Practice: Doubling an Integer Value Stored in a File",
          description:
            "Write a program that reads an integer from a file, doubles its value, and writes the doubled value back into the file.",
          concept: "Practice — Modifying a Stored Value",
          transcript:
            "This practice problem asks for a program that reads an integer stored in a file, doubles it, and writes the result back. The lesson opens the file in read mode with fscanf to retrieve the number, closes the file, reopens it in write mode, and uses fprintf to write back twice the original value.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 34174,
          endSec: 34251,
          durationInMinutes: 1,
        },
      ],
    },
    {
      id: "day20",
      title: "Day 20 — Project 2: Snake, Water, Gun Game",
      color: "#ef4444",
      levels: [
        {
          id: "C_D20_01",
          name: "Project: Snake Water Gun — Game Rules & Setup",
          title: "Project: Snake Water Gun — Game Rules & Setup",
          description:
            "Understand the rules of Snake-Water-Gun and set up the project folder and player/computer variables.",
          concept: "Project Setup and Game Rules",
          transcript:
            "This lesson explains the rules of Snake-Water-Gun: snake drinks water so snake beats water, gun shoots snake so gun beats snake, and water sinks gun so water beats gun. It sets up a new project folder and declares integer variables representing the player's and computer's choices, using 0 for snake, 1 for water, and 2 for gun.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 34251,
          endSec: 34400,
          durationInMinutes: 2,
        },
        {
          id: "C_D20_02",
          name: "Project: Generating the Computer's Random Choice",
          title: "Project: Generating the Computer's Random Choice",
          description:
            "Take the player's choice as input and generate a random choice for the computer using rand, fixing the range so it correctly falls between 0 and 2.",
          concept: "Random Number Generation for Game Logic",
          transcript:
            "This lesson takes the player's choice as input using scanf, then generates the computer's choice using rand seeded with srand and time. It walks through an initial mistake where the random number only produced 0 or 1, and corrects it by using modulo 3 instead of modulo 2 so the generated number correctly falls between 0 and 2.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 34400,
          endSec: 34526,
          durationInMinutes: 2,
        },
        {
          id: "C_D20_03",
          name: "Project: Implementing Win/Lose/Draw Logic",
          title: "Project: Implementing Win/Lose/Draw Logic",
          description:
            "Write the if-else chain that compares the player's and computer's choices to determine a win, loss, or draw for every possible combination.",
          concept: "Conditional Logic for Game Outcomes",
          transcript:
            "This lesson builds a full if-else-if chain covering all nine combinations of player and computer choices, determining whether the result is a draw, a win, or a loss based on the Snake-Water-Gun rules. It tests the finished program with several rounds of input to confirm each outcome matches the expected rule, completing the mini project.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 34526,
          endSec: 34766,
          durationInMinutes: 4,
        },
      ],
    },
    {
      id: "day21",
      title: "Day 21 — Dynamic Memory Allocation in C",
      color: "#8b5cf6",
      levels: [
        {
          id: "C_D21_01",
          name: "Why C Needs Dynamic Memory Allocation",
          title: "Why C Needs Dynamic Memory Allocation",
          description:
            "Understand why fixed-size arrays are a limitation in C and why dynamic memory allocation is needed to size an array based on a value known only at runtime.",
          concept: "The Need for Dynamic Memory Allocation",
          transcript:
            "This lesson explains that C, as a low-level language, allows direct control over memory management. It demonstrates a common problem: trying to declare an array whose size is a variable read from user input, which C does not allow directly, motivating the need for dynamic memory allocation through four functions: malloc, calloc, free, and realloc.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 34766,
          endSec: 34903,
          durationInMinutes: 2,
        },
        {
          id: "C_D21_02",
          name: "malloc() — Allocating Memory Dynamically",
          title: "malloc() — Allocating Memory Dynamically",
          description:
            "Learn how malloc allocates a block of memory based on a number of bytes and returns a pointer to it, including the role of the sizeof operator and type casting.",
          concept: "malloc and sizeof",
          transcript:
            "This lesson introduces malloc, which stands for memory allocation, and takes a number of bytes as input, returning a pointer to newly allocated memory. It explains the sizeof operator, which reports how many bytes a data type occupies on the current architecture, and shows how to multiply this by the number of elements needed. It also covers why the result of malloc must be type-cast to match the pointer type, and includes the stdlib.h header required to use it.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 34903,
          endSec: 35061,
          durationInMinutes: 3,
        },
        {
          id: "C_D21_03",
          name: "Practice: Dynamic Array of Floats with malloc",
          title: "Practice: Dynamic Array of Floats with malloc",
          description:
            "Write a program that creates a dynamic array of five floats using malloc, fills it with values, and prints them with controlled precision.",
          concept: "Practice — malloc with Floats",
          transcript:
            "This quick quiz asks for a dynamically allocated array of five floats using malloc. The lesson adapts the earlier integer example to use a float pointer and sizeof(float), assigns five decimal values into the array, and prints them using a format specifier with controlled decimal precision.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 35061,
          endSec: 35185,
          durationInMinutes: 2,
        },
        {
          id: "C_D21_04",
          name: "calloc() — Contiguous Allocation with Zero Initialization",
          title: "calloc() — Contiguous Allocation with Zero Initialization",
          description:
            "Learn how calloc differs from malloc in syntax and behavior, including that it takes two arguments and initializes memory to zero by default.",
          concept: "calloc vs malloc",
          transcript:
            "This lesson introduces calloc, short for contiguous allocation, and compares it to malloc. It explains that calloc takes two separate arguments — the number of elements and the size of each element — rather than one combined byte count, and that memory allocated with calloc is initialized to zero by default, unlike malloc, which leaves garbage values. It closes with a quick quiz recreating a dynamic integer array of a given size using calloc.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 35185,
          endSec: 35350,
          durationInMinutes: 3,
        },
        {
          id: "C_D21_05",
          name: "free() — Releasing Allocated Memory",
          title: "free() — Releasing Allocated Memory",
          description:
            "Understand why freeing dynamically allocated memory matters in memory-constrained environments and see how free is used and what happens when memory is freed too early.",
          concept: "free and Memory Management",
          transcript:
            "This lesson explains that free releases memory that was allocated with malloc or calloc, and is especially important in low-memory environments where efficient programs must release memory as soon as it is no longer needed. It demonstrates the free syntax and shows what happens if a pointer's memory is freed before its value is printed, resulting in garbage output.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 35350,
          endSec: 35472,
          durationInMinutes: 2,
        },
        {
          id: "C_D21_06",
          name: "realloc() — Resizing Allocated Memory",
          title: "realloc() — Resizing Allocated Memory",
          description:
            "Learn how realloc changes the size of a previously allocated block of memory, allowing an array to grow or shrink after it has already been created.",
          concept: "realloc for Resizing Memory",
          transcript:
            "This lesson introduces realloc, which takes an existing pointer and a new size, and returns a pointer to memory resized to hold that new amount. It demonstrates taking a pointer originally allocated to store five integers and reallocating it to store ten integers instead, wrapping up the four core dynamic memory allocation functions.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 35472,
          endSec: 35570,
          durationInMinutes: 2,
        },
        {
          id: "C_D21_07",
          name: "Practice: Dynamic Array of Six Integers with malloc & calloc",
          title: "Practice: Dynamic Array of Six Integers with malloc & calloc",
          description:
            "Create a dynamic array capable of storing six integers using malloc, take six values from the user, then solve the same problem again using calloc.",
          concept: "Practice — malloc and calloc for Fixed-Size Arrays",
          transcript:
            "This practice problem asks for a dynamically created array of size six capable of storing six integers, first solved using malloc with hardcoded values, then extended so the six integers are entered by the user with a for loop and fscanf-style input, and printed back out. The same problem is then re-solved using calloc, changing only the allocation call while keeping the rest of the logic the same.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 35609,
          endSec: 35795,
          durationInMinutes: 3,
        },
        {
          id: "C_D21_08",
          name: "Practice: Resizing an Array from 5 to 10 Integers with realloc",
          title:
            "Practice: Resizing an Array from 5 to 10 Integers with realloc",
          description:
            "Create a dynamic array for five integers, then use realloc to resize it so it can hold ten integers instead.",
          concept: "Practice — realloc for Growing an Array",
          transcript:
            "This practice problem builds a dynamic array sized for five integers, prints its values, then calls realloc with the same pointer and a new size to grow the array so it can hold ten integers, demonstrating that the array now stores and prints all ten values correctly after reallocation.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 35795,
          endSec: 35877,
          durationInMinutes: 1,
        },
        {
          id: "C_D21_09",
          name: "Practice: Multiplication Table Array with realloc & calloc",
          title: "Practice: Multiplication Table Array with realloc & calloc",
          description:
            "Create a dynamic array holding the multiplication table of seven up to 10 terms, then use realloc to extend it to 15 terms, and repeat the exercise using calloc instead of malloc.",
          concept:
            "Practice — Combining Multiplication Tables with realloc/calloc",
          transcript:
            "This practice problem creates a dynamic array storing the multiplication table of seven for the first 10 multiples, using a loop where each element is set to seven times its index plus one. It then uses realloc to extend the array so it holds 15 multiples instead of 10, verifying the values extend correctly up to 105. The same solution is then rebuilt using calloc in place of malloc to reinforce the difference in initial allocation.",
          videoId: "REPLACE_WITH_VIDEO_ID",
          startSec: 35877,
          endSec: 36097,
          durationInMinutes: 4,
        },
      ],
    },
  ],
};
