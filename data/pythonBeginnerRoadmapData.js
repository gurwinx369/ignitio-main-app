export const pythonBeginnerRoadmapData = {
  id: "python-beginner",
  title: "Python for Beginners — From Basics to Industry-Ready Skills",
  description:
    "A comprehensive Python course covering fundamentals, tooling, and hands-on projects to prepare students for internships and jobs in AI, ML, and software development.",
  concept: "Python for Beginners",
  transcript:
    "This beginner-focused course teaches Python from scratch, covering what programming is, why Python is the language of choice for AI/ML and web development, how to set up a development environment, and how to write and run your first programs. It emphasizes hands-on practice, projects, and community accountability to build resume-ready, industry-relevant skills.",
  days: [
    {
      id: "day1",
      title: "Day 1 — Course Introduction & Programming Foundations",
      color: "#3b82f6",
      levels: [
        {
          id: "PYTHON_BEGINNER_D1_01",
          name: "Course Introduction and Learning Path",
          title: "Course Introduction and Learning Path",
          description:
            "Understand what the course covers, who it's for, and how it's structured to build job-ready Python skills.",
          concept: "Course Introduction and Learning Path",
          transcript:
            "This lesson introduces the course as a beginner-to-advanced Python path aimed at AI, ML, and data science careers, complete with notes, projects, and assignments. The instructor explains that no prior experience is required, shares her background, invites students to introduce themselves so teaching can be tailored to their level, and points them to the full playlist before moving into the actual subject matter.",
          videoId: "s5MJpRBQLgo",
          startSec: 0,
          endSec: 120,
          durationInMinutes: 2,
        },
        {
          id: "PYTHON_BEGINNER_D1_02",
          name: "What Is Programming",
          title: "What Is Programming",
          description:
            "Learn the core definition of programming as a way to instruct computers, using a language-translator analogy.",
          concept: "What Is Programming",
          transcript:
            "This lesson defines programming as the practice of giving instructions to a computer, using the analogy of needing a translator to talk to someone who doesn't speak your language. Since computers only understand binary (current on = 1, off = 0), programming languages like Python, C++, and Java act as a human-friendly layer, with an interpreter or compiler doing the translating underneath.",
          videoId: "s5MJpRBQLgo",
          startSec: 320,
          endSec: 630,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D1_03",
          name: "Why Learn Python and Key Features",
          title: "Why Learn Python and Key Features",
          description:
            "See why Python is the recommended first language, and get a tour of its main features and use cases.",
          concept: "Why Learn Python and Key Features",
          transcript:
            "This lesson covers why Python is worth learning first: its use across AI/ML, web development (Django and other frameworks), automation, game development, and data analytics. It then walks through Python's defining features — simple syntax, huge community support, a rich library ecosystem, cross-platform support, and its creation by Guido van Rossum — before recapping the theory covered so far.",
          videoId: "s5MJpRBQLgo",
          startSec: 630,
          endSec: 830,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D1_04",
          name: "Installing Python",
          title: "Installing Python",
          description:
            "Download and install Python from the official source, step by step, on any operating system.",
          concept: "Installing Python",
          transcript:
            "This lesson walks through downloading Python from python.org, picking the correct installer for Windows, Mac, or Linux, choosing an install location, and completing the install. The instructor keeps every setting at default and confirms the successful install message before moving to the next tool.",
          videoId: "s5MJpRBQLgo",
          startSec: 830,
          endSec: 1171,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D1_05",
          name: "Installing VS Code and the Python Extension",
          title: "Installing VS Code and the Python Extension",
          description:
            "Set up a proper code editor by installing VS Code and the Python extension that powers autocomplete and syntax highlighting.",
          concept: "Installing VS Code and the Python Extension",
          transcript:
            "This lesson compares code editor options (VS Code, Sublime Text, and others) and explains why VS Code is the standard choice for Python. It covers downloading and installing VS Code for the student's operating system, opening it for the first time, and installing the official Python extension from the Extensions panel.",
          videoId: "s5MJpRBQLgo",
          startSec: 1171,
          endSec: 1436,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D1_06",
          name: "Writing and Running Your First Program",
          title: "Writing and Running Your First Program",
          description:
            "Create a project folder, save a .py file, write your first print() statement, and run it to see the output.",
          concept: "Writing and Running Your First Program",
          transcript:
            "This lesson creates a folder structure and a new file saved with a .py extension, which triggers VS Code's Python syntax highlighting and autocomplete. The instructor writes print(\"Hello World\"), explains what the print function does, runs it using the editor's run button, and shows the output appearing in the integrated terminal — then experiments with printing different text to reinforce how the function works.",
          videoId: "s5MJpRBQLgo",
          startSec: 1436,
          endSec: 1808,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D1_07",
          name: "Assignment and Course Wrap-Up",
          title: "Assignment and Course Wrap-Up",
          description:
            "Take on the practice assignment of printing a name ten times without repeating the line manually, and review the day's key takeaways.",
          concept: "Assignment and Course Wrap-Up",
          transcript:
            "This lesson sets the day's assignment — write a Python program that prints a name ten times without just copy-pasting the print line ten times — and encourages students to solve it independently before the next chapter. The instructor recaps the full session (what programming is, why Python, installing the tools, writing the first program) and invites students to share their progress on social media before signing off.",
          videoId: "s5MJpRBQLgo",
          startSec: 1808,
          endSec: 2160,
          durationInMinutes: 6,
        },
      ],
    },
    {
      id: "day2",
      title:
        "Day 2 — Python Fundamentals: Variables, Syntax, and Interpreter Basics",
      color: "#10b981",
      levels: [
        {
          id: "PYTHON_BEGINNER_D2_01",
          name: "Solving the Print-Name Assignment",
          title: "Solving the Print-Name Assignment",
          description:
            "Print a name ten times without a loop, using the asterisk symbol and the newline escape sequence.",
          concept: "Print-Name Assignment and Escape Sequences",
          transcript:
            "This lesson reviews the previous assignment — printing a name ten times without a loop — and works through it live. After a first attempt using simple multiplication, the instructor introduces the '\\n' newline escape sequence so each repeated name lands on its own line, and confirms the corrected output by running the code.",
          videoId: "k8XeZg1oDyY",
          startSec: 0,
          endSec: 285,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D2_02",
          name: "How the Python Interpreter Executes Code",
          title: "How the Python Interpreter Executes Code",
          description:
            "Understand how the interpreter translates and runs Python code line by line.",
          concept: "Python Interpreter Execution",
          transcript:
            "This lesson revisits the interpreter-as-translator analogy and explains that Python code executes sequentially, line by line, via the Python Virtual Machine, with no need to manually compile. A new file demonstrates this by running three print statements in order, then an intentional syntax error is introduced to show how Python's error messages (like 'unterminated string literal') point directly to the problem and halt execution until it's fixed.",
          videoId: "k8XeZg1oDyY",
          startSec: 285,
          endSec: 620,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D2_03",
          name: "Variables and Memory Basics",
          title: "Variables and Memory Basics",
          description:
            "Learn what a variable is and how it differs from a constant.",
          concept: "Variables and Memory",
          transcript:
            "This lesson introduces variables as named references that store a value in memory, using the same idea from school math (like using x and y for a rectangle's dimensions) as a bridge. It explains why data — such as a person's name or age — needs somewhere to live during a program's execution, and contrasts variables (values that can change) with constants (values that cannot).",
          videoId: "k8XeZg1oDyY",
          startSec: 620,
          endSec: 877,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D2_04",
          name: "Automatic Typing and Memory Inspection",
          title: "Automatic Typing and Memory Inspection",
          description:
            "See how Python assigns data types automatically and how to inspect a variable's memory location.",
          concept: "Automatic Typing and the id() Function",
          transcript:
            "This lesson shows that Python automatically determines a variable's data type without any manual declaration, unlike many other languages. It introduces the id() function for inspecting a variable's memory location, then creates variables for name, age, and favorite subject, and demonstrates reassigning one variable's value from another to show how values can change.",
          videoId: "k8XeZg1oDyY",
          startSec: 877,
          endSec: 1085,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D2_05",
          name: "Reassigning Variables and Type Errors",
          title: "Reassigning Variables and Type Errors",
          description:
            "Practice reassigning variable values and learn why mixing strings and integers causes an error.",
          concept: "Reassignment and Type Errors",
          transcript:
            "This lesson triggers a real error by trying to concatenate a string and an integer with the plus operator, using the resulting message to explain why Python won't silently combine incompatible types. It walks through the fix — printing the string and the number as separate arguments — and closes by restating the formal definition of a variable as a label created via the assignment operator.",
          videoId: "k8XeZg1oDyY",
          startSec: 1085,
          endSec: 1292,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D2_06",
          name: "Variable Naming Rules and Reserved Keywords",
          title: "Variable Naming Rules and Reserved Keywords",
          description:
            "Learn the technical rules for naming variables and which reserved words to avoid.",
          concept: "Naming Conventions and Reserved Keywords",
          transcript:
            "This lesson covers the rules for valid variable names — allowed characters, digits, and underscores, with names never starting with a digit or containing special characters — and demonstrates the errors Python raises when these rules are broken. It also introduces reserved keywords like 'for', 'if', and 'while', explaining that Python will flag it if one is used as a variable name.",
          videoId: "k8XeZg1oDyY",
          startSec: 1292,
          endSec: 1522,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D2_07",
          name: "Capturing User Input with input()",
          title: "Capturing User Input with input()",
          description:
            "Use the input() method to collect data from the user and store it in a variable.",
          concept: "The input() Method",
          transcript:
            "This lesson introduces the input() method, which lets a program ask the user for information instead of hardcoding it, and notes that input() always returns a string. A new file walks through prompting for a name, storing it in a variable, and printing a personalized message, ending with an independent assignment to try capturing age the same way.",
          videoId: "k8XeZg1oDyY",
          startSec: 1522,
          endSec: 1820,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D2_08",
          name: "Expressions and Statements",
          title: "Expressions and Statements",
          description:
            "Understand the difference between expressions, which compute values, and statements, which are complete instructions.",
          concept: "Expressions and Statements",
          transcript:
            "This lesson defines an expression as a combination of operators and operands that produces a value (like x + 3), distinguishing it from a statement, which is a complete instruction the interpreter can execute. It notes that a program is really just a series of statements, and that a semicolon can be used to fit more than one statement on a single line.",
          videoId: "k8XeZg1oDyY",
          startSec: 1820,
          endSec: 2004,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D2_09",
          name: "Comments and Indentation Rules",
          title: "Comments and Indentation Rules",
          description:
            "Learn how to write comments and why indentation is a strict, functional requirement in Python.",
          concept: "Comments and Indentation",
          transcript:
            "This lesson introduces comments — anything after a hash mark, which Python ignores entirely — as a way to document code and explain intent to collaborators. It then covers indentation, showing through a live error that Python treats whitespace as functionally meaningful, unlike languages where indentation is purely cosmetic; inconsistent spacing breaks the code.",
          videoId: "k8XeZg1oDyY",
          startSec: 2004,
          endSec: 2283,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D2_10",
          name: "Chapter Review and Cheat Sheet Recap",
          title: "Chapter Review and Cheat Sheet Recap",
          description:
            "Review the chapter's key concepts using a Python fundamentals cheat sheet.",
          concept: "Chapter Review",
          transcript:
            "This lesson recaps the full chapter using a concept/example/output cheat sheet, walking back through print statements, variable creation, memory storage, the input method, and expressions and statements. It notes that data types and type conversion are coming in a future lesson, reinforcing that Python executes everything in strict sequence.",
          videoId: "k8XeZg1oDyY",
          startSec: 2283,
          endSec: 2414,
          durationInMinutes: 2,
        },
        {
          id: "PYTHON_BEGINNER_D2_11",
          name: "Assignment: Circle Area Calculator and Wrap-Up",
          title: "Assignment: Circle Area Calculator and Wrap-Up",
          description:
            "Take on the diameter-input assignment and close out the session.",
          concept: "Assignment and Session Wrap-Up",
          transcript:
            "This lesson sets up a new file for the day's assignment — take a circle's diameter as input and calculate its area — and asks students to work through it independently before the next chapter. The instructor closes the session with an encouraging note to keep learning and keep at it.",
          videoId: "k8XeZg1oDyY",
          startSec: 2414,
          endSec: 2600,
          durationInMinutes: 3,
        },
      ],
    },
    {
      id: "day3",
      title: "Day 3 — Data Types, Type Conversion, and Operators",
      color: "#f59e0b",
      levels: [
        {
          id: "PYTHON_BEGINNER_D3_01",
          name: "Understanding Data Types",
          title: "Understanding Data Types",
          description:
            "Learn what data types are and why every programming language has them, then walk through Python's core built-in types.",
          concept: "Data Types Overview",
          transcript:
            "This lesson defines data types as a universal programming concept, not unique to Python, and walks through the core built-in types with concrete examples: integers for whole numbers, floats for decimals, strings for text, and booleans for true/false. It notes that Python automatically infers a value's type without requiring explicit declaration, and previews the type() function as the way to confirm a variable's type.",
          videoId: "5lDKZio6njw",
          startSec: 34,
          endSec: 238,
          durationInMinutes: 3.4,
        },
        {
          id: "PYTHON_BEGINNER_D3_02",
          name: "Circle Area Assignment: Applying Type Casting",
          title: "Circle Area Assignment: Applying Type Casting",
          description:
            "Solve the diameter-to-area assignment end to end, hit a real TypeError from string input, and fix it with int().",
          concept: "Type Casting to Fix Real Errors",
          transcript:
            "This lesson solves the earlier circle-area assignment from scratch: taking diameter as input, deriving radius, and computing area with the exponentiation operator. Running the code throws a TypeError because input() returns a string and division can't be performed on it directly. The instructor explains the error message, wraps the input in int() to fix it, and reruns the program to confirm the correct area and radius print out.",
          videoId: "5lDKZio6njw",
          startSec: 238,
          endSec: 657,
          durationInMinutes: 7,
        },
        {
          id: "PYTHON_BEGINNER_D3_03",
          name: "Verifying Data Types with type()",
          title: "Verifying Data Types with type()",
          description:
            "Declare variables of different types, confirm their classes with type(), then apply the same check to user input.",
          concept: "The type() Function in Practice",
          transcript:
            "This lesson creates a new data_types.py file with string, integer, and float variables (food, age, area) and uses type() to confirm Python correctly classifies each one as str, int, or float. It then works through a practice exercise taking age as user input and printing both the value and its type, reinforcing that input() always returns a string regardless of what the user types.",
          videoId: "5lDKZio6njw",
          startSec: 657,
          endSec: 1137,
          durationInMinutes: 8,
        },
        {
          id: "PYTHON_BEGINNER_D3_04",
          name: "Python Keywords & Syntax Rules",
          title: "Python Keywords & Syntax Rules",
          description:
            "Learn which reserved words can't be used as variable names, see the resulting error firsthand, and get a working definition of syntax.",
          concept: "Reserved Keywords and Syntax",
          transcript:
            "This lesson explains that Python keywords such as for, if, else, and while are reserved for special purposes and can't be used as variable names, showing help('keywords') for the full list. It demonstrates the syntax error that appears when a keyword is used as a variable name, walks through what that error means, and defines syntax as the rule set governing how Python code must be structured and written.",
          videoId: "5lDKZio6njw",
          startSec: 1137,
          endSec: 1594,
          durationInMinutes: 7.6,
        },
        {
          id: "PYTHON_BEGINNER_D3_05",
          name: "Sum of Two Numbers: Debugging with int()",
          title: "Sum of Two Numbers: Debugging with int()",
          description:
            "Take two numeric inputs, predict and hit the same string-vs-int error, and fix it to get a correct sum.",
          concept: "Applying Type Casting to Two Inputs",
          transcript:
            "This lesson builds a program that takes two numbers as input and adds them, first predicting and then confirming that the addition fails because both inputs are strings. Wrapping each input in int() resolves the error and produces the correct sum, with a follow-up practice prompt to modify the program to compute the average instead.",
          videoId: "5lDKZio6njw",
          startSec: 1594,
          endSec: 1867,
          durationInMinutes: 4.6,
        },
        {
          id: "PYTHON_BEGINNER_D3_06",
          name: "Type Conversion: Implicit vs. Explicit",
          title: "Type Conversion: Implicit vs. Explicit",
          description:
            "Compare Python's automatic type promotion against manually forcing a value's type, with working examples of each.",
          concept: "Implicit and Explicit Conversion",
          transcript:
            "This lesson introduces the two kinds of type conversion. Implicit conversion happens automatically — adding an int and a float promotes the result to a float with no developer action needed, demonstrated in an implicit.py file. Explicit conversion is manual, using functions like int() or float() to force a value into a different type, demonstrated in an explicit.py file, with a practice prompt to take a number as input and convert it to a float.",
          videoId: "5lDKZio6njw",
          startSec: 1867,
          endSec: 2321,
          durationInMinutes: 7.6,
        },
        {
          id: "PYTHON_BEGINNER_D3_07",
          name: "Explicit Conversion Walkthrough (Practice Solved)",
          title: "Explicit Conversion Walkthrough (Practice Solved)",
          description:
            "Walk through the full solution for the number-to-float conversion exercise, printing both the original and converted values with their types.",
          concept: "Explicit Conversion Practice",
          transcript:
            "This lesson solves the explicit-conversion practice question in full: taking a number as input, converting it to a float in a separate variable, and printing both the original value and the converted value alongside their data types using type(). Running the code confirms the original is a string and the converted value is correctly a float.",
          videoId: "5lDKZio6njw",
          startSec: 2321,
          endSec: 2567,
          durationInMinutes: 4.1,
        },
        {
          id: "PYTHON_BEGINNER_D3_08",
          name: "Operators in Python: Arithmetic & Comparison",
          title: "Operators in Python: Arithmetic & Comparison",
          description:
            "Learn operator/operand terminology, then run through arithmetic and comparison operators with live code.",
          concept: "Arithmetic and Comparison Operators",
          transcript:
            "This lesson defines operators as action-performers and operands as the values they act on, then builds an operators.py file to demonstrate arithmetic operators — addition, subtraction, multiplication, division, modulus, and exponentiation. It continues into comparison operators (equal to, not equal to, greater than, less than, and their or-equal-to variants), running each and confirming they always return True or False.",
          videoId: "5lDKZio6njw",
          startSec: 2567,
          endSec: 2980,
          durationInMinutes: 6.9,
        },
        {
          id: "PYTHON_BEGINNER_D3_09",
          name: "Logical Operators: AND, OR, NOT",
          title: "Logical Operators: AND, OR, NOT",
          description:
            "See how and, or, and not combine or reverse boolean conditions, verified against live code output.",
          concept: "Logical Operators",
          transcript:
            "This lesson explains logical operators using mixed true/false comparison results: 'and' returns True only when both sides are true, while 'or' returns True if at least one side is true. It then covers 'not', which reverses a boolean value entirely, running each case in code and printing labeled results to confirm the behavior matches the explanation.",
          videoId: "5lDKZio6njw",
          startSec: 2980,
          endSec: 3474,
          durationInMinutes: 8.2,
        },
        {
          id: "PYTHON_BEGINNER_D3_10",
          name: "Assignment Operators, Recap & Practice Tasks",
          title: "Assignment Operators, Recap & Practice Tasks",
          description:
            "Learn shorthand assignment operators, recap the chapter, and get the full set of Chapter 2 practice assignments.",
          concept: "Assignment Operators and Chapter Wrap-Up",
          transcript:
            "This lesson introduces shorthand assignment operators (+=, -=, *=, /=) as compact alternatives to writing out the full expression, then recaps the chapter's topics: data types, keywords, type conversion, and operators. It closes with the full Chapter 2 assignment — explaining four data types with examples, distinguishing conversion types, and two coding tasks: a Celsius-to-Fahrenheit/Kelvin temperature converter and a bill-split calculator, both using explicit type conversion and arithmetic operators.",
          videoId: "5lDKZio6njw",
          startSec: 3474,
          endSec: 3758,
          durationInMinutes: 4.7,
        },
      ],
    },
    {
      id: "day4",
      title: "Day 4 — Strings",
      color: "#f97316",
      levels: [
        {
          id: "PYTHON_BEGINNER_D4_01",
          name: "Chapter Introduction & Finishing the Temperature Converter",
          title: "Chapter Introduction & Finishing the Temperature Converter",
          description:
            "Get motivated for the strings chapter, then complete the Smart Temperature Converter assignment from the last session.",
          concept: "Chapter Introduction and Assignment Recap",
          transcript:
            "This lesson opens by framing strings as a fundamental concept in every programming language and worth paying close attention to, before finishing the earlier Smart Temperature Converter assignment: taking Celsius as input, converting it to a float, applying the Fahrenheit conversion formula with arithmetic operators, and printing the result. It closes with a quick note that the bill-split calculator assignment follows the same pattern.",
          videoId: "VIDEO_ID_HERE",
          startSec: 0,
          endSec: 374,
          durationInMinutes: 6.2,
        },
        {
          id: "PYTHON_BEGINNER_D4_02",
          name: "What Is a String, Immutability & Quote Types",
          title: "What Is a String, Immutability & Quote Types",
          description:
            "Define strings as sequences of characters, learn the three valid ways to declare them, and see why double quotes are the default choice.",
          concept: "String Basics and Quote Types",
          transcript:
            "This lesson defines a string as a Python data type storing a sequence of characters, letters, numbers, and symbols, enclosed in single, double, or triple quotes. It introduces immutability — a string's content can't be changed once created — and runs code confirming all three quoting styles produce valid, working strings, with double quotes used as the course default for convenience.",
          videoId: "VIDEO_ID_HERE",
          startSec: 374,
          endSec: 648,
          durationInMinutes: 4.6,
        },
        {
          id: "PYTHON_BEGINNER_D4_03",
          name: "Concatenation, Length & Introduction to Indexing",
          title: "Concatenation, Length & Introduction to Indexing",
          description:
            "Join strings with the plus operator, measure length with len(), and learn that every character has a position starting from zero.",
          concept: "Concatenation, Length, and Indexing Basics",
          transcript:
            "This lesson covers string concatenation with the plus operator (including adding spaces between joined words) and the len() function for counting characters. It then introduces indexing — every character in a string has a numerical position starting from zero — and sets up a practice task to find a username's length and character positions.",
          videoId: "VIDEO_ID_HERE",
          startSec: 648,
          endSec: 1084,
          durationInMinutes: 7.3,
        },
        {
          id: "PYTHON_BEGINNER_D4_04",
          name: "Indexing in Practice: Access & Immutability",
          title: "Indexing in Practice: Access & Immutability",
          description:
            "Retrieve characters by index from a sample name, confirm the length matches, and trigger the error that proves strings can't be edited in place.",
          concept: "Indexing Practice and Immutability",
          transcript:
            "This lesson practices retrieving characters by index from a variable holding the name 'Divya', confirming its length is five and that indexing starts at zero. It demonstrates string immutability by triggering a TypeError when attempting to reassign a character directly, then explains why Python offers three quoting styles — so a string can contain a quote character of the other type without breaking.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1084,
          endSec: 1419,
          durationInMinutes: 5.6,
        },
        {
          id: "PYTHON_BEGINNER_D4_05",
          name: "Introduction to Slicing",
          title: "Introduction to Slicing",
          description:
            "Extract substrings with start and end indices, learn that the end index is excluded, and see the syntax error that comes from a missing colon.",
          concept: "String Slicing Basics",
          transcript:
            "This lesson introduces slicing for extracting parts of a string, illustrated by splitting 'Gulab Jamun' into its two halves. It establishes the core rule that a slice's end index is excluded, walks through creating a slicing.py file, and shows the TypeError that results from forgetting the required colon in slice syntax.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1419,
          endSec: 1785,
          durationInMinutes: 6.1,
        },
        {
          id: "PYTHON_BEGINNER_D4_06",
          name: "Slicing Halves, Default Indices & Negative Indexing",
          title: "Slicing Halves, Default Indices & Negative Indexing",
          description:
            "See how omitting the start or end index defaults to zero or the full string length, then learn to count backward with negative indices.",
          concept: "Slicing Defaults and Negative Indexing",
          transcript:
            "This lesson slices a string into its first and second halves, confirming that an omitted start index defaults to zero and an omitted end index defaults to the string's full length. It then introduces negative indexing, where positions are counted backward from -1 at the end of the string, and sets up a practice problem on a food name's middle and last characters.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1785,
          endSec: 2161,
          durationInMinutes: 6.3,
        },
        {
          id: "PYTHON_BEGINNER_D4_07",
          name: "Solving the Middle & Last Characters Problem",
          title: "Solving the Middle & Last Characters Problem",
          description:
            "Use floor division to find a string's middle index and negative indexing to grab its last characters.",
          concept: "Applying Floor Division to Slicing",
          transcript:
            "This lesson solves the middle-and-last-characters practice problem: using floor division (//) to calculate the middle index without a leftover decimal, slicing around it to get the middle three characters, and using negative indexing (-2:) to grab the last two characters. Viewers are encouraged to dry-run the index numbers on paper before checking the output.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2161,
          endSec: 2456,
          durationInMinutes: 4.9,
        },
        {
          id: "PYTHON_BEGINNER_D4_08",
          name: "Core String Methods: upper, lower, title, find, replace, count",
          title:
            "Core String Methods: upper, lower, title, find, replace, count",
          description:
            "Transform and search strings using Python's built-in string methods.",
          concept: "Core String Methods",
          transcript:
            "This lesson covers key string methods: .upper() and .lower() for changing case, .title() and .capitalize() for capitalizing words, .find() for locating the index of a substring's first occurrence, .replace() for swapping out characters or words, and .count() for counting how often a character appears in a string.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2456,
          endSec: 2775,
          durationInMinutes: 5.3,
        },
        {
          id: "PYTHON_BEGINNER_D4_09",
          name: "Practice Task, F-Strings, Escape Sequences & Chapter Wrap-Up",
          title: "Practice Task, F-Strings, Escape Sequences & Chapter Wrap-Up",
          description:
            "Solve a case-conversion practice task, embed variables with f-strings, format output with escape sequences, and close out the chapter.",
          concept: "F-Strings, Escape Sequences, and Chapter Recap",
          transcript:
            "This lesson works through a practice task converting a sentence to lower case, upper case, and replacing spaces with underscores, then introduces f-strings for embedding variables directly inside a string using curly braces. It covers escape sequences like \\n for new lines and \\t for tabs, introduces an Emoji Converter mini-project built on .replace(), and covers string repetition (*) and membership operators (in / not in) as extra operations. It closes with the Chapter 3 assignment and a recap of immutability, indexing, slicing, methods, f-strings, and escape sequences.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2775,
          endSec: 3183,
          durationInMinutes: 6.8,
        },
      ],
    },
    {
      id: "day5",
      title: "Day 5 — Conditional Statements, Lists, and Tuples",
      color: "#ef4444",
      levels: [
        {
          id: "PYTHON_BEGINNER_D5_01",
          name: "Conditional Statements: Concept, if, and elif",
          title: "Conditional Statements: Concept, if, and elif",
          description:
            "Understand what a condition is, see real-life if/else logic (traffic signals, grading, voting age), then write and test a working if/elif grading program in VS Code.",
          concept: "Conditional Statements — if / elif",
          transcript:
            "A condition is a statement that evaluates to true or false, illustrated through real-life decision rules like traffic signals and grade cutoffs. The lesson defines the if statement as code that runs only when its condition is true, then builds a live grading example in VS Code, showing that Python's indentation (not braces) defines which lines belong to the conditional block. It then introduces elif for checking several conditions in sequence, and confirms — by changing the input value and rerunning — that the interpreter stops at the first true condition and skips the rest.",
          videoId: "IJzmIEHmDsc",
          startSec: 73,
          endSec: 636,
          durationInMinutes: 9,
        },
        {
          id: "PYTHON_BEGINNER_D5_02",
          name: "else Statement and Practice: Positive, Negative, or Zero",
          title: "else Statement and Practice: Positive, Negative, or Zero",
          description:
            "Add a fallback else branch, learn when a simple if-else is enough versus a full elif chain, then build a complete program that classifies a user's number.",
          concept: "The else Statement and Number Classification",
          transcript:
            "This segment introduces else as the fallback that runs when every prior if/elif condition is false, demonstrated with a voting-eligibility example based on age, and discusses when a plain if-else suffices versus when a longer elif chain is needed. It then solves a practice program that reads a number from the user, casts the input() string to an integer, and prints 'positive', 'negative', or 'zero' using if-elif-else — tested against a positive, a negative, and a zero value to confirm all three branches work.",
          videoId: "IJzmIEHmDsc",
          startSec: 636,
          endSec: 1073,
          durationInMinutes: 7,
        },
        {
          id: "PYTHON_BEGINNER_D5_03",
          name: "Introduction to Lists: Creation, Indexing, and Length",
          title: "Introduction to Lists: Creation, Indexing, and Length",
          description:
            "Learn how lists store multiple values (even of different types) in one variable, and how to access elements by index and measure size with len().",
          concept: "List Creation, Indexing, and len()",
          transcript:
            "Lists are introduced as a mutable, built-in data type that can hold multiple values — including mixed data types like strings and integers — inside square brackets, unlike a plain variable which holds only one value. Example lists are built for foods, marks, and student records. The lesson then covers accessing list elements by zero-based index and using len() to count the number of elements in a list, verified by adding an extra item and confirming the length updates.",
          videoId: "IJzmIEHmDsc",
          startSec: 1115,
          endSec: 1610,
          durationInMinutes: 8,
        },
        {
          id: "PYTHON_BEGINNER_D5_04",
          name: "Modifying Lists, List vs. String Immutability, and Slicing",
          title: "Modifying Lists, List vs. String Immutability, and Slicing",
          description:
            "Update list elements in place, see why the same edit fails on a string, then extract sublists with slicing and find extremes with max()/min().",
          concept: "List Mutability, Slicing, max()/min()",
          transcript:
            "This segment updates a list element by index to demonstrate that lists are mutable, then attempts the same kind of edit on a single character in a string, which raises a TypeError — confirming that strings are immutable while lists are not. It then covers list slicing with square-bracket index ranges (noting the ending index is excluded), and demonstrates max() and min() to find the largest and smallest values in a list.",
          videoId: "IJzmIEHmDsc",
          startSec: 1610,
          endSec: 2069,
          durationInMinutes: 8,
        },
        {
          id: "PYTHON_BEGINNER_D5_05",
          name: "List Methods: append(), sort(), pop(), remove(), insert()",
          title: "List Methods: append(), sort(), pop(), remove(), insert()",
          description:
            "Live-code the core list-modification methods and see how each one changes the list in place, permanently.",
          concept: "List Modification Methods",
          transcript:
            "This segment live-codes append() to add an element to the end of a list, sort() to reorder a list in ascending order, pop() and remove() to delete an element by index or by value, and insert() to place an element at a specific index. Each operation is shown to modify the original list directly and persist for all later operations, reinforcing that lists are mutable.",
          videoId: "IJzmIEHmDsc",
          startSec: 2069,
          endSec: 2447,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D5_06",
          name: "Practice: Favorite Foods List from User Input",
          title: "Practice: Favorite Foods List from User Input",
          description:
            "Collect three foods from the user and build the list two different valid ways.",
          concept: "Building a List from User Input",
          transcript:
            "This practice program collects three favorite foods from the user and stores them in a list, demonstrating two valid approaches — initializing the list directly with all three values, versus starting with an empty list and using append() for each input — before printing the final list and its length with len().",
          videoId: "IJzmIEHmDsc",
          startSec: 2447,
          endSec: 2698,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D5_07",
          name: "Introduction to Tuples and Immutability",
          title: "Introduction to Tuples and Immutability",
          description:
            "Meet tuples as list-like structures built with parentheses, and confirm by testing that they can't be changed after creation.",
          concept: "Tuple Creation and Immutability",
          transcript:
            "Tuples are introduced as a built-in data type similar to lists — able to store multiple, mixed-type values — but created with parentheses instead of square brackets. The key distinction is immutability: once a tuple is created, its contents cannot be changed. This is verified directly by attempting to reassign an element by index, which raises a TypeError ('tuple does not support item assignment'), and by accessing tuple elements with standard square-bracket indexing.",
          videoId: "IJzmIEHmDsc",
          startSec: 2698,
          endSec: 3060,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D5_08",
          name: "Empty and Single-Element Tuples, and Tuple Methods",
          title: "Empty and Single-Element Tuples, and Tuple Methods",
          description:
            "Learn the trailing-comma rule for single-item tuples, and use index() and count() to query tuple contents.",
          concept: "Empty/Single-Element Tuples, index(), count()",
          transcript:
            "This segment shows how to create an empty tuple with just parentheses, and covers a common pitfall: a tuple with a single value needs a trailing comma, or Python treats it as a plain int instead of a tuple (confirmed with type()). It then covers the index() method for locating an element's position and count() for counting how many times a value occurs within a tuple.",
          videoId: "IJzmIEHmDsc",
          startSec: 3060,
          endSec: 3400,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D5_09",
          name: "Practice and Recap: Lists vs. Tuples",
          title: "Practice and Recap: Lists vs. Tuples",
          description:
            "A quick tuple practice exercise using len(), followed by a summary of the core differences between lists and tuples.",
          concept: "Tuple Practice and List/Tuple Comparison",
          transcript:
            "A short practice exercise uses len() on a tuple to print its total number of elements. The chapter closes with a summary of the core distinction between lists and tuples: lists are mutable and built with square brackets, tuples are immutable and built with parentheses — plus a set of follow-up practice prompts (a movie-list program, a tuple of highest/lowest values, a grade-checking program).",
          videoId: "IJzmIEHmDsc",
          startSec: 3400,
          endSec: 3496,
          durationInMinutes: 2,
        },
      ],
    },
    {
      id: "day6",
      title: "Day 6 — Dictionaries and Sets",
      color: "#06b6d4",
      levels: [
        {
          id: "PYTHON_BEGINNER_D6_01",
          name: "Dictionary Fundamentals: Definition, Key-Value Pairs & Core Properties",
          title:
            "Dictionary Fundamentals: Definition, Key-Value Pairs & Core Properties",
          description:
            "Full theory pass on dictionaries before any code is written: what a dictionary is, why keys must be unique, how it differs from lists/tuples, and its unordered/mutable nature.",
          concept: "Introduction to Dictionaries",
          transcript:
            "This lesson defines a dictionary as a built-in Python type that stores data as key-value pairs inside curly braces, contrasts it with lists and tuples, and works through a sample student dictionary to show that each key is unique and maps to one value. It explains that index-based access does not work on dictionaries, and that dictionaries are unordered and mutable — unlike immutable strings.",
          videoId: "WN0E2hjtcFg",
          startSec: 65,
          endSec: 477,
          durationInMinutes: 7,
        },
        {
          id: "PYTHON_BEGINNER_D6_02",
          name: "Building a Student Dictionary in VS Code",
          title: "Building a Student Dictionary in VS Code",
          description:
            "Sets up a Chapter 5/6 project in VS Code and builds a student dictionary field by field, confirming its type.",
          concept: "Practical Dictionary Setup",
          transcript:
            "This lesson creates a new project folder and a dict_basics.py file, then builds a student dictionary live, adding name, city, age, and roll number as key-value pairs one at a time. The type() function is used to confirm the resulting variable is a dict object, reinforcing the key-value storage format visually in the editor.",
          videoId: "WN0E2hjtcFg",
          startSec: 477,
          endSec: 742,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_03",
          name: "Duplicate Keys and Value Overriding Behavior",
          title: "Duplicate Keys and Value Overriding Behavior",
          description:
            "Tests what happens when the same key is defined more than once, and confirms the rule by looking it up.",
          concept: "Duplicate Key Behavior",
          transcript:
            "This lesson deliberately creates a duplicate key in the dictionary to see how Python responds, finds that no error is raised, and verifies via a quick lookup that only the last occurrence of a repeated key is kept — every earlier value for that key is silently overwritten.",
          videoId: "WN0E2hjtcFg",
          startSec: 742,
          endSec: 960,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_04",
          name: "Printing Dictionaries and Accessing Values by Key",
          title: "Printing Dictionaries and Accessing Values by Key",
          description:
            "Prints the whole dictionary at once, then pulls individual values out using their keys.",
          concept: "Printing and Key-Based Access",
          transcript:
            "This lesson shows that printing a dictionary outputs every key-value pair at once, then demonstrates accessing a single value with the dictionary name followed by a key in square brackets — using a key-and-lock analogy to reinforce that each key opens only its matching value.",
          videoId: "WN0E2hjtcFg",
          startSec: 960,
          endSec: 1131,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D6_05",
          name: "Updating Values and Adding New Key-Value Pairs",
          title: "Updating Values and Adding New Key-Value Pairs",
          description:
            "Overwrites an existing key's value and shows that assigning to a new key adds it to the dictionary.",
          concept: "Updating and Adding Entries",
          transcript:
            "This lesson updates an existing entry by reassigning a new value to the 'city' key, then adds a brand-new key ('favorite subject') to show that assigning a value to a key that doesn't yet exist creates it, while assigning to an existing key just updates it in place.",
          videoId: "WN0E2hjtcFg",
          startSec: 1131,
          endSec: 1356,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_06",
          name: "Removing Items and Dictionary Methods",
          title: "Removing Items and Dictionary Methods",
          description:
            "Covers .pop(), .keys(), .values(), .items(), .get(), and .update() for managing dictionary data.",
          concept: "Dictionary Methods",
          transcript:
            "This lesson uses .pop() to remove a specific key-value pair, then walks through .keys() and .values() for inspecting a dictionary's contents and .items() for retrieving key-value pairs together as tuples. It also covers .get() for safe value retrieval and .update() for merging in another dictionary, with a caution that .clear() wipes all data.",
          videoId: "WN0E2hjtcFg",
          startSec: 1388,
          endSec: 1638,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_07",
          name: "Practice: Building a Marks Dictionary",
          title: "Practice: Building a Marks Dictionary",
          description:
            "Builds a 'marks' dictionary by adding subject scores one at a time and prints the finished result.",
          concept: "Marks Dictionary Practice",
          transcript:
            "This lesson works through a practice problem: creating a 'marks' dictionary, confirming its type, and adding subjects (Mathematics, Chemistry, Computer Science) with scores one key at a time, then printing the completed dictionary to verify every entry was added correctly.",
          videoId: "WN0E2hjtcFg",
          startSec: 1638,
          endSec: 1877,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_08",
          name: "Introducing Sets: Unordered and Unique Collections",
          title: "Introducing Sets: Unordered and Unique Collections",
          description:
            "Introduces sets as an unordered, index-free collection that automatically drops duplicate values.",
          concept: "Introduction to Sets",
          transcript:
            "This lesson introduces sets as a collection of unordered, unique items written with curly braces like dictionaries, but storing single values rather than key-value pairs. It explains that sets automatically discard duplicates the moment they're added, which is presented as the defining feature of the type.",
          videoId: "WN0E2hjtcFg",
          startSec: 1877,
          endSec: 1997,
          durationInMinutes: 2,
        },
        {
          id: "PYTHON_BEGINNER_D6_09",
          name: "Creating Sets, Duplicate Handling, and Empty Sets",
          title: "Creating Sets, Duplicate Handling, and Empty Sets",
          description:
            "Builds a food set live, confirms duplicates are dropped, and shows how to correctly create an empty set.",
          concept: "Set Creation and Duplicate Handling",
          transcript:
            "This lesson builds a 'food' set in VS Code and confirms its type, then deliberately adds a repeated item to prove that sets silently reject duplicates. It also clarifies that an empty set must be created with set() rather than empty curly braces, since {} produces a dictionary instead, and verifies this with type() checks on both an empty and non-empty set.",
          videoId: "WN0E2hjtcFg",
          startSec: 1997,
          endSec: 2235,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_10",
          name: "Set Properties and Methods: .add() and .remove()",
          title: "Set Properties and Methods: .add() and .remove()",
          description:
            "Covers core set properties and modifies a set's contents with .add() and .remove().",
          concept: "Modifying Sets",
          transcript:
            "This lesson lists set properties — unordered, mutable, and unable to hold mutable elements like lists — then demonstrates .add() to insert a new item and .remove() to delete an existing one, confirming with prints that the set's unique-value rule holds throughout.",
          videoId: "WN0E2hjtcFg",
          startSec: 2235,
          endSec: 2373,
          durationInMinutes: 2,
        },
        {
          id: "PYTHON_BEGINNER_D6_11",
          name: "Set Operations and Converting a List to a Set",
          title: "Set Operations and Converting a List to a Set",
          description:
            "Mentions .clear(), .pop(), union/intersection, then converts a list into a set to strip duplicates.",
          concept: "Set Conversion and Cleanup Methods",
          transcript:
            "This lesson briefly notes .clear() and .pop() as additional set methods and flags union/intersection as set-theory concepts to revisit later. It then works a practice problem: taking a list of programming languages containing duplicates and converting it into a set using the set() constructor, confirming with type() that the list became a set.",
          videoId: "WN0E2hjtcFg",
          startSec: 2373,
          endSec: 2642,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_12",
          name: "Counting Unique Items and Chapter Wrap-Up",
          title: "Counting Unique Items and Chapter Wrap-Up",
          description:
            "Uses len() to count unique set items and recaps the core difference between dictionaries and sets.",
          concept: "Chapter Recap: Dictionaries vs. Sets",
          transcript:
            "This lesson applies len() to the converted set to count how many unique languages remain after duplicates were dropped, then closes the chapter with a direct recap: dictionaries store unique keys mapped to values, while sets store unique, unordered individual values — both useful for organizing and deduplicating data.",
          videoId: "WN0E2hjtcFg",
          startSec: 2642,
          endSec: 2755,
          durationInMinutes: 2,
        },
      ],
    },
    {
      id: "day7",
      title: "Day 7 — Loops: while, for, and Control Statements",
      color: "#8b5cf6",
      levels: [
        {
          id: "PYTHON_BEGINNER_D7_01",
          name: "Why We Need Loops",
          title: "Why We Need Loops",
          description:
            "Uses real-world repetition (looping a song, replaying a video) to motivate loops, then shows why manually copy-pasting a print statement breaks down at scale.",
          concept: "Introduction to Loops",
          transcript:
            "This lesson opens with everyday examples of looping — repeating a favorite song, looping a video — to frame what a loop does before any code is shown. It then poses a concrete problem: printing a name 5, then 100, then 100,000 times, showing that manual copy-pasting becomes impossible and unreadable at scale, and previews that Python has two loop types, while and for, to solve this.",
          videoId: "eIWhfEhek60",
          startSec: 0,
          endSec: 274,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D7_02",
          name: "While Loop Syntax and Logic",
          title: "While Loop Syntax and Logic",
          description:
            "Builds a counter variable, writes a while condition around it, and explains the colon-and-indentation syntax along with the infinite-loop risk of forgetting to increment.",
          concept: "While Loop Syntax",
          transcript:
            "This lesson builds a while loop from scratch: a variable num starting at 1, a while num <= 100 condition, a print statement, and num = num + 1 inside the loop body. It flags that forgetting the increment creates an infinite loop, explains the while keyword, condition, colon, and indentation (4 spaces or a tab) that define the loop body in Python, and runs the code live to confirm it prints the name 100 times before exiting.",
          videoId: "eIWhfEhek60",
          startSec: 274,
          endSec: 508,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D7_03",
          name: "Dry Running a While Loop",
          title: "Dry Running a While Loop",
          description:
            "Switches the loop bound to 5 and traces every iteration by hand, then states the formal definition of a loop.",
          concept: "Dry Running Loop Logic",
          transcript:
            "This lesson changes the loop bound to 5 and traces the condition and increment step by step — 1, 2, 3, 4, 5 each checked against the condition and printed, then 6 failing the check and exiting the loop — to build the habit of dry-running code by hand. It closes with the formal definition that loops repeat a block of code multiple times, useful for printing messages repeatedly, iterating over lists, and generating patterns, with a brief encouraging note that this feels hard at first for everyone.",
          videoId: "eIWhfEhek60",
          startSec: 508,
          endSec: 767,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D7_04",
          name: "Practice: Counting from 1 to 10",
          title: "Practice: Counting from 1 to 10",
          description:
            "Writes, dry-runs, and executes a while loop that prints numbers 1 through 10.",
          concept: "Counting Exercise",
          transcript:
            "This lesson works the first practice question end to end: initializing i to 1, writing while i <= 10, using the i += 1 shorthand for incrementing, dry-running the sequence, then running the code to confirm 1 through 10 print correctly. It also notes that wrapping the condition in parentheses is optional in Python, unlike some other languages.",
          videoId: "eIWhfEhek60",
          startSec: 767,
          endSec: 967,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D7_05",
          name: "Practice: Counting Down from 10 to 1",
          title: "Practice: Counting Down from 10 to 1",
          description:
            "Reverses the previous exercise using a decrementing variable and a greater-than-or-equal condition.",
          concept: "Decrementing a Loop Variable",
          transcript:
            "This lesson reverses the counting exercise: a variable j starts at 10, the condition checks j >= 1, and j -= 1 runs each iteration. After dry-running and confirming the output counts down from 10 to 1, it adds an extra print statement inside the loop to show the variable's value changing on each pass, reinforcing how the loop state updates in real time.",
          videoId: "eIWhfEhek60",
          startSec: 967,
          endSec: 1186,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D7_06",
          name: "Practice: Printing Even Numbers 1 to 50",
          title: "Practice: Printing Even Numbers 1 to 50",
          description:
            "Defines even numbers, introduces the modulus operator, and combines an if condition inside a while loop to filter for them.",
          concept: "Filtering with Modulus Inside a Loop",
          transcript:
            "This lesson defines even numbers as integers exactly divisible by 2, then introduces the modulus operator as the tool for checking a remainder. It builds the solution by nesting an if num % 2 == 0 condition inside a while loop counting from 1 to 50, dry-runs several iterations to show odd numbers being skipped and even ones printed, and runs the finished code to confirm all even numbers from 2 to 50 appear correctly.",
          videoId: "eIWhfEhek60",
          startSec: 1186,
          endSec: 1630,
          durationInMinutes: 7,
        },
        {
          id: "PYTHON_BEGINNER_D7_07",
          name: "Setting Up the Sum-of-N-Numbers Problem",
          title: "Setting Up the Sum-of-N-Numbers Problem",
          description:
            "Takes a number n from the user and plans out how a running sum will accumulate as the loop counts down.",
          concept: "Planning the Sum Program",
          transcript:
            "This lesson sets up a program to sum the first n natural numbers, reading n via input(), converting it to an integer since input is captured as a string, and framing the plan: a sum variable will accumulate values while n counts down to 1.",
          videoId: "eIWhfEhek60",
          startSec: 1630,
          endSec: 1790,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D7_08",
          name: "Dry Running and Coding the Sum Program",
          title: "Dry Running and Coding the Sum Program",
          description:
            "Traces sum and n by hand through every iteration, then converts that trace directly into working code and verifies it.",
          concept: "Dry Run to Code Translation",
          transcript:
            "This lesson hand-traces sum = sum + n and n = n - 1 through every iteration starting from n=5, tracking sum growing from 0 to 15 as n falls to 0, then writes the equivalent while n >= 1 loop in code. Running the program with an input of 5 confirms the output matches the hand-traced result exactly.",
          videoId: "eIWhfEhek60",
          startSec: 1790,
          endSec: 2006,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D7_09",
          name: "Star Pattern Using a While Loop",
          title: "Star Pattern Using a While Loop",
          description:
            "Prints a growing row of stars using Python's string-multiplication trick inside a while loop.",
          concept: "Star Pattern with String Multiplication",
          transcript:
            "This lesson builds a while n <= 4 loop that prints '*' * n on each pass, dry-running it to show the star count growing from 1 to 4 stars across iterations, then runs the code to confirm the pattern renders correctly. It briefly notes that print itself is a function, a concept saved for the next chapter.",
          videoId: "eIWhfEhek60",
          startSec: 2006,
          endSec: 2164,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D7_10",
          name: "Building the Multiplication Table",
          title: "Building the Multiplication Table",
          description:
            "Takes a number from the user and sets up a second loop variable as the multiplier, using a formatted string to display each line.",
          concept: "Multiplication Table Setup",
          transcript:
            "This lesson takes a number from the user and converts it to an integer, then explains why a separate loop variable (the multiplier) is needed while the user's number stays fixed. It introduces an f-string to format each output line like '3 * 1 = 3', running the code with an input of 3 to confirm the table prints correctly before consolidating the logic into a clean final version.",
          videoId: "eIWhfEhek60",
          startSec: 2164,
          endSec: 2528,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D7_11",
          name: "Dry Running the Multiplication Table",
          title: "Dry Running the Multiplication Table",
          description:
            "Traces how the fixed number and the incrementing multiplier interact until the multiplier passes 10, completing the table.",
          concept: "Multiplication Table Dry Run",
          transcript:
            "This lesson dry-runs the finished multiplication table loop with n fixed at 3 and i incrementing from 1, tracing n * i on each pass until i exceeds 10, then runs the code to confirm the full table for the user's input prints successfully from start to finish.",
          videoId: "eIWhfEhek60",
          startSec: 2528,
          endSec: 2757,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D7_12",
          name: "The For Loop: Iterating Lists and Tuples",
          title: "The For Loop: Iterating Lists and Tuples",
          description:
            "Introduces the for-loop syntax and shows it working identically on both a list and a tuple.",
          concept: "For Loop Introduction",
          transcript:
            "This lesson introduces the for loop as the natural tool for walking through lists, tuples, and strings, contrasting it with manual indexing. It demonstrates 'for item in food_list: print(item)' printing every element of a list, then shows the exact same syntax working on a tuple of colleges the instructor has visited, confirming that for-loop syntax is identical across both collection types.",
          videoId: "eIWhfEhek60",
          startSec: 2757,
          endSec: 2945,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D7_13",
          name: "The range() Function Basics",
          title: "The range() Function Basics",
          description:
            "Explains range()'s start, stop, and step parameters and runs a first simple example.",
          concept: "Introduction to range()",
          transcript:
            "This lesson introduces range() as a function that generates a sequence of numbers, often paired with for loops. It explains that stop is required while start defaults to 0 and step defaults to 1, and that the stop value is excluded from the sequence, then runs a first example printing 1 through 7 using range(1, 8).",
          videoId: "eIWhfEhek60",
          startSec: 2945,
          endSec: 3090,
          durationInMinutes: 2,
        },
        {
          id: "PYTHON_BEGINNER_D7_14",
          name: "Using range() with Step Values",
          title: "Using range() with Step Values",
          description:
            "Adjusts the step parameter to print even numbers, dry-runs the exclusive stop boundary, and applies the concept to a practice question.",
          concept: "range() Step Parameter",
          transcript:
            "This lesson sets range()'s step to 2 to print even numbers, dry-running how each next value is calculated by adding the step to the current index and discovering that the last target value gets excluded unless the stop bound is pushed one higher. After confirming the fix and testing a larger step of 10, it applies the same technique to a practice question — printing all even numbers between 1 and 20 using range() — and runs it to confirm the output.",
          videoId: "eIWhfEhek60",
          startSec: 3090,
          endSec: 3414,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D7_15",
          name: "Iteration, Iterators, and the break Statement",
          title: "Iteration, Iterators, and the break Statement",
          description:
            "Defines iteration and iterators using the earlier list/tuple examples, then introduces break with a dry-run.",
          concept: "Iteration Terms and break",
          transcript:
            "This lesson defines iteration as visiting each item in a collection and the iterator as the loop variable representing the current item, referencing the earlier list and tuple examples. It then introduces the break statement — which stops a loop immediately once a condition is met — building a for num in range(1, 10) loop that breaks when num equals 5, and dry-running it to confirm the output stops at 4.",
          videoId: "eIWhfEhek60",
          startSec: 3414,
          endSec: 3594,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D7_16",
          name: "The continue and pass Statements",
          title: "The continue and pass Statements",
          description:
            "Skips a single iteration with continue, then uses pass as a placeholder to keep an empty block valid.",
          concept: "continue and pass",
          transcript:
            "This lesson introduces continue, which skips the rest of the current iteration and moves to the next — demonstrated with a for num in range(1, 6) loop that skips printing when num equals 3, dry-run and confirmed by running the code. It then covers pass, showing that an empty for-loop body raises an error in Python and that pass is used as a null placeholder to keep such a block syntactically valid, closing with a quick check on what range(5) evaluates to by default.",
          videoId: "eIWhfEhek60",
          startSec: 3594,
          endSec: 3862,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D7_17",
          name: "Countdown Timer: Planning and Setup",
          title: "Countdown Timer: Planning and Setup",
          description:
            "Plans a countdown mini-project using a negative-step range and begins writing the loop and the time.sleep() delay.",
          concept: "Countdown Timer Mini-Project (Setup)",
          transcript:
            "This lesson plans a countdown timer that takes a starting number from the user and counts down to zero using range() with a negative step, then begins writing the code. It explains the need for a one-second pause between prints, introduces the backslash-n newline character for formatting, and imports Python's time module to access time.sleep() for the delay.",
          videoId: "eIWhfEhek60",
          startSec: 3862,
          endSec: 4163,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D7_18",
          name: "Countdown Timer: Debugging and Completion",
          title: "Countdown Timer: Debugging and Completion",
          description:
            "Runs the countdown timer, finds and fixes a variable bug, and confirms the finished project works correctly.",
          concept: "Countdown Timer Mini-Project (Debugging)",
          transcript:
            "This lesson adds a closing 'Happy New Year' print statement and runs the countdown timer, discovering a bug where the fixed starting number was being printed on every line instead of the loop variable. After identifying and fixing the mistake, the corrected code is re-run to confirm the countdown decreases properly with a one-second gap between each number before printing the final message.",
          videoId: "eIWhfEhek60",
          startSec: 4163,
          endSec: 4554,
          durationInMinutes: 7,
        },
        {
          id: "PYTHON_BEGINNER_D7_19",
          name: "Chapter Recap: while, for, range, and Control Statements",
          title: "Chapter Recap: while, for, range, and Control Statements",
          description:
            "Closes the chapter with a fast recap of while loops, for loops, range(), and break/continue/pass.",
          concept: "Loops Chapter Recap",
          transcript:
            "This lesson closes the chapter with a rapid recap: while loops repeat as long as a condition is true, for loops iterate over sequences like lists, range() generates number sequences to loop over, break exits a loop immediately, continue skips a single iteration, and pass acts as an empty placeholder — encouraging continued practice with the chapter's exercises before moving on.",
          videoId: "eIWhfEhek60",
          startSec: 4554,
          endSec: 4610,
          durationInMinutes: 1,
        },
      ],
    },
    {
      id: "day8",
      title: "Day 8 — Functions",
      color: "#ec4899",
      levels: [
        {
          id: "PYTHON_BEGINNER_D8_01",
          name: "Why Functions Matter & Defining Your First Function",
          title: "Why Functions Matter & Defining Your First Function",
          description:
            "See why repeating the same logic (like a sum calculation) throughout a program is bad practice, then learn the full def syntax — naming, parentheses, colon, indentation — and trace exactly how the interpreter jumps to a function's code when it's called.",
          concept: "Function Definition & Calling Basics",
          transcript:
            "This lesson starts by showing how repeating identical code (a two-number sum, then an average) across a large project creates duplication and hurts readability. It then builds the fix step by step: the def keyword, function naming rules, the parentheses that will later hold parameters, the colon-plus-indentation body structure, and how to call a function by name. The lesson closes by tracing exactly how the Python interpreter skips the function definition on first read, then jumps into it each time it's called — reinforced with an electrician-call analogy and a live run showing the same output print three times.",
          videoId: "EplHEeWhocs",
          startSec: 30,
          endSec: 672,
          durationInMinutes: 11,
        },
        {
          id: "PYTHON_BEGINNER_D8_02",
          name: "Practice, Why Functions Are Used & Definition Order",
          title: "Practice, Why Functions Are Used & Definition Order",
          description:
            "Work through two full practice functions (welcome_message, inspire) to confirm that defining a function produces no output until it's called, then cover the two core interview-ready reasons functions exist, and what happens if you call one before it's defined.",
          concept: "Practice + Rationale + Call Order",
          transcript:
            "This lesson works through two complete practice problems: a welcome_message function that must print three times, and an inspire function combining a motivational quote with a name — both used to prove that a function definition alone produces zero output until explicitly called. It then states the two standard interview answers for why functions are used (more readable code, avoiding redundancy), recaps def/call syntax with quick one-line practice examples, and finishes by deliberately calling an undefined function to trigger and explain a 'not defined' error, fixing it by defining the function above its call.",
          videoId: "EplHEeWhocs",
          startSec: 672,
          endSec: 1500,
          durationInMinutes: 14,
        },
        {
          id: "PYTHON_BEGINNER_D8_03",
          name: "Parameters, Arguments & Default Values",
          title: "Parameters, Arguments & Default Values",
          description:
            "Build an average function that accepts different numbers each time it's called, understand the difference between parameters and arguments, trigger a missing-argument error, and fix it with default parameter values.",
          concept: "Parameters, Arguments & Defaults",
          transcript:
            "This lesson builds a data-driven average(a, b) function step by step, distinguishing parameters (the placeholders in the definition) from arguments (the actual values passed at call time). It runs the same function with four different argument pairs to show reuse, then calls it with no arguments at all to trigger a 'missing required arguments' error — motivating default parameter values as the fix. A show_age(name, age) practice function using an f-string reinforces the concept, including how a default value gets silently overridden whenever a caller supplies their own argument.",
          videoId: "EplHEeWhocs",
          startSec: 1500,
          endSec: 2201,
          durationInMinutes: 12,
        },
        {
          id: "PYTHON_BEGINNER_D8_04",
          name: "Return Statement & Returning Multiple Values",
          title: "Return Statement & Returning Multiple Values",
          description:
            "Learn how return sends a value back to the caller instead of printing it, then build a multi-step function that loops through a string and returns both a vowel count and a consonant count at once.",
          concept: "Return Values & Multi-Value Returns",
          transcript:
            "This lesson introduces the return statement by contrasting it with print: a function that returns a value produces no visible output until that value is stored in a variable, demonstrated with a multiply(a, b) function and a square(num) practice problem. It then builds a more advanced function that loops character-by-character through a string, uses isalpha() to filter letters, checks each one against a defined vowel set, and increments separate vowel/consonant counters — then returns both counts at once, unpacked into two variables when the function is called and verified against a real name.",
          videoId: "EplHEeWhocs",
          startSec: 2201,
          endSec: 2870,
          durationInMinutes: 11,
        },
        {
          id: "PYTHON_BEGINNER_D8_05",
          name: "Keyword Arguments, Variable Scope & Chapter Recap",
          title: "Keyword Arguments, Variable Scope & Chapter Recap",
          description:
            "Pass arguments by parameter name so their order stops mattering, understand why a variable created inside a function can't be accessed outside it, learn Python's default None return, and recap the full chapter.",
          concept: "Keyword Arguments, Scope & Recap",
          transcript:
            "This lesson shows how keyword arguments let a caller specify parameter names directly, so argument order no longer matters when calling a function. It then demonstrates local vs. global scope by trying to access a function-internal variable from outside and triggering a 'not defined' error, explains that a function with no return statement implicitly returns None, and closes with a full recap of everything covered in the chapter: def syntax, calling, parameters, arguments, defaults, return values, and scope.",
          videoId: "EplHEeWhocs",
          startSec: 2900,
          endSec: 3327,
          durationInMinutes: 7,
        },
      ],
    },
    {
      id: "day9",
      title: "Day 9 — File Handling",
      color: "#14b8a6",
      levels: [
        {
          id: "PYTHON_BEGINNER_D9_01",
          name: "File Types and open() Modes",
          title: "File Types and open() Modes",
          description:
            "Distinguish text from binary files and get an overview of the open() function's core modes.",
          concept: "File Types and open() Modes",
          transcript:
            "This lesson introduces file handling, distinguishing human-readable text files (.log, .csv) from binary files (.png, .mp4, .pdf), and previews Python's built-in open() function along with its read ('r'), write ('w'), append ('a'), and create ('x') modes.",
          videoId: "KB8-3u0iZhU",
          startSec: 0,
          endSec: 175,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D9_02",
          name: "Reading a File with read()",
          title: "Reading a File with read()",
          description:
            "Set up a project, create a sample text file, and read its full contents into a variable with read().",
          concept: "Reading Files with read()",
          transcript:
            "This lesson sets up a file_basics.py project and a sample must.txt file, shows that open() defaults to read mode when no mode is given, and uses file.read() to load the file's contents into a variable that is then printed and re-tested after editing the file.",
          videoId: "KB8-3u0iZhU",
          startSec: 175,
          endSec: 610,
          durationInMinutes: 7,
        },
        {
          id: "PYTHON_BEGINNER_D9_03",
          name: "Practice: Searching for a Word in a File",
          title: "Practice: Searching for a Word in a File",
          description:
            "Read a file's contents and check whether it contains a target word, case-insensitively.",
          concept: "Case-Insensitive File Search",
          transcript:
            "This lesson works through a full practice problem: creating a certificate.txt file, opening and reading it, converting its content to lowercase so capitalization differences don't break the search, then using an if/else condition to report whether the word 'live' was found.",
          videoId: "KB8-3u0iZhU",
          startSec: 610,
          endSec: 1003,
          durationInMinutes: 7,
        },
        {
          id: "PYTHON_BEGINNER_D9_04",
          name: "FileNotFoundError and Write Mode",
          title: "FileNotFoundError and Write Mode",
          description:
            "Trigger a FileNotFoundError, then see how write mode automatically creates missing files.",
          concept: "FileNotFoundError and 'w' Mode",
          transcript:
            "This lesson triggers a FileNotFoundError by opening a non-existent file in read mode — a common interview question — then contrasts this with write mode ('w'), which silently creates the file if it doesn't already exist, and shows writing text into it with the write function.",
          videoId: "KB8-3u0iZhU",
          startSec: 1003,
          endSec: 1250,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D9_05",
          name: "Write Mode vs. Append Mode",
          title: "Write Mode vs. Append Mode",
          description:
            "See that write mode overwrites file content while append mode adds to it, and recap all three modes.",
          concept: "'w' vs 'a' Modes",
          transcript:
            "This lesson demonstrates that write mode ('w') overwrites a file's existing content every time the script runs, while append mode ('a') adds new content without erasing what's already there — using '\\n' to format multiple appended lines — before recapping read, write, and append modes together.",
          videoId: "KB8-3u0iZhU",
          startSec: 1250,
          endSec: 1424,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D9_06",
          name: "The 'x' Mode and Closing Files",
          title: "The 'x' Mode and Closing Files",
          description:
            "Use exclusive-create mode safely and understand why files must always be closed.",
          concept: "'x' Mode and File Closing",
          transcript:
            "This lesson covers the 'x' mode, which creates a new file but raises a FileExistsError if one already exists, making it a safe way to avoid accidental overwrites, then stresses why every opened file must be closed afterward to avoid wasted memory and unwanted access.",
          videoId: "KB8-3u0iZhU",
          startSec: 1519,
          endSec: 1691,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D9_07",
          name: "The with Statement",
          title: "The with Statement",
          description:
            "Manage file resources automatically using the with keyword instead of manual open/close.",
          concept: "The with Keyword",
          transcript:
            "This lesson introduces the with statement as a safer alternative to manually opening and closing files, since it automatically closes the file even if an error occurs, demonstrating opening a file with an alias (as f) and calling f.read() within that block.",
          videoId: "KB8-3u0iZhU",
          startSec: 1691,
          endSec: 1876,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D9_08",
          name: "Reading Line by Line with readline()",
          title: "Reading Line by Line with readline()",
          description:
            "Read a file one line at a time and understand how the file pointer advances and empties out.",
          concept: "readline() and the File Pointer",
          transcript:
            "This lesson introduces readline() for reading a file one line at a time, calling it repeatedly to pull successive lines, then explains that the file pointer moves forward with each call and that once the end of the file is reached, further reads — including a fresh read() call — return empty results.",
          videoId: "KB8-3u0iZhU",
          startSec: 1876,
          endSec: 2227,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D9_09",
          name: "readlines() and Practice: First Line Only",
          title: "readlines() and Practice: First Line Only",
          description:
            "Read all lines into a list with readlines(), then practice pulling out just the first line of a file.",
          concept: "readlines() and readline() Practice",
          transcript:
            "This lesson introduces readlines(), which returns a file's contents as a list of line strings, then applies readline() in a short practice problem to read and print only the first line of a bio.txt file.",
          videoId: "KB8-3u0iZhU",
          startSec: 2227,
          endSec: 2497,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D9_10",
          name: "Practice: Counting Lines in a File",
          title: "Practice: Counting Lines in a File",
          description:
            "Combine readlines() with len() to count how many lines a file contains.",
          concept: "readlines() and Line Counting",
          transcript:
            "This lesson solves a practice problem that asks how many lines are in a file: it reads the file with readlines() to get a list of line strings, then takes len() of that list, printing the raw output of readlines() alongside the count to show how the list maps to each line.",
          videoId: "KB8-3u0iZhU",
          startSec: 2544,
          endSec: 2807,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D9_11",
          name: "File Management with os and shutil",
          title: "File Management with os and shutil",
          description:
            "Rename and delete files using the os module, and see shutil for copying file contents.",
          concept: "os and shutil Modules",
          transcript:
            "This lesson introduces the shutil module for copying file contents and the os module for managing files, demonstrating os.rename() to rename a file and os.remove() to delete one (after catching a mistaken call to a nonexistent os.delete()), while stressing the need to verify a file exists before operating on it.",
          videoId: "KB8-3u0iZhU",
          startSec: 2807,
          endSec: 3070,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D9_12",
          name: "Handling Errors with try/except",
          title: "Handling Errors with try/except",
          description:
            "Wrap file operations in try/except blocks to handle missing files gracefully instead of crashing.",
          concept: "try/except for File Errors",
          transcript:
            "This lesson closes out the chapter by wrapping file operations in try and except blocks so that errors like FileNotFoundError are caught and handled with a custom message instead of crashing the program, demonstrated by intentionally opening a file that doesn't exist and comparing the behavior with and without the try/except block.",
          videoId: "KB8-3u0iZhU",
          startSec: 3132,
          endSec: 3268,
          durationInMinutes: 2,
        },
      ],
    },
    {
      id: "day10",
      title: "Day 10 — Object-Oriented Programming",
      color: "#a855f7",
      levels: [
        {
          id: "PYTHON_BEGINNER_D10_01",
          name: "What Is Object-Oriented Programming",
          title: "What Is Object-Oriented Programming",
          description:
            "Understand OOP as a programming style that structures code around real-world entities instead of a single sequence.",
          concept: "Introduction to OOP",
          transcript:
            "This lesson defines Object-Oriented Programming as one of two core programming styles (the other being functional programming), explaining that OOP structures a program using real-world concepts like objects, classes, attributes, and behaviors — making code organized, reusable, and easier to maintain — instead of writing everything as one long sequential script.",
          videoId: "NsCpRy68l1c",
          startSec: 132,
          endSec: 299,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D10_02",
          name: "Classes and Objects as Blueprints",
          title: "Classes and Objects as Blueprints",
          description:
            "See how a class acts as a template, an object as a specific instance of it, and learn the basic class/object syntax.",
          concept: "Classes as Templates",
          transcript:
            "This lesson explains a class as a blueprint — like a general 'Vehicle' class that a car, bike, or airplane can be an object of — reinforced with an Animal/Student example, then covers the practical syntax: the class keyword, defining attributes as variables that store an object's data, and creating an object with ClassName().",
          videoId: "NsCpRy68l1c",
          startSec: 336,
          endSec: 580,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D10_03",
          name: "Object Creation and Accessing Attributes",
          title: "Object Creation and Accessing Attributes",
          description:
            "Learn the exact syntax for creating an object and accessing its attributes with dot notation.",
          concept: "Object Syntax and Dot Notation",
          transcript:
            "This lesson finishes the syntax walkthrough, showing that an object is created with object_name = ClassName() and that its attributes are accessed afterward using object_name.attribute dot notation, using a Student class example before moving from theory into code.",
          videoId: "NsCpRy68l1c",
          startSec: 580,
          endSec: 684,
          durationInMinutes: 2,
        },
        {
          id: "PYTHON_BEGINNER_D10_04",
          name: "Building the Vehicle Class",
          title: "Building the Vehicle Class",
          description:
            "Write a Vehicle class with color, fuel type, and mileage attributes, then instantiate car, bike, and airplane objects.",
          concept: "Practical Class Construction",
          transcript:
            "This lesson builds a Vehicle class from scratch with attributes like color, fuel type, and mileage, then creates three objects — car, bike, and airplane — from it, turning the theoretical idea of classes and objects into working, tangible code.",
          videoId: "NsCpRy68l1c",
          startSec: 718,
          endSec: 974,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D10_05",
          name: "Accessing Attributes and Default Values",
          title: "Accessing Attributes and Default Values",
          description:
            "Print each object's attributes and see that every object initially inherits the class's default values.",
          concept: "Default Class-Level Values",
          transcript:
            "This lesson accesses the car, bike, and airplane objects' attributes with dot notation and prints them, showing that every object initially shares the same default values defined at the class level, and raises the question of how to give each object its own distinct values.",
          videoId: "NsCpRy68l1c",
          startSec: 974,
          endSec: 1112,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D10_06",
          name: "Practice: Car and Laptop Classes",
          title: "Practice: Car and Laptop Classes",
          description:
            "Build a Car class with one attribute and a Laptop class with several, then create multiple objects with different values.",
          concept: "Class Practice Exercises",
          transcript:
            "This lesson works through two practice problems: creating a Car class with a brand attribute and accessing it, then building a Laptop class with default brand, RAM, and price attributes and instantiating two laptop objects — overriding some attribute values per object while leaving others at the class default.",
          videoId: "NsCpRy68l1c",
          startSec: 1237,
          endSec: 1643,
          durationInMinutes: 7,
        },
        {
          id: "PYTHON_BEGINNER_D10_07",
          name: "Instance Attributes vs. Class Attributes",
          title: "Instance Attributes vs. Class Attributes",
          description:
            "Understand how setting a value directly on an object overrides the class's shared default, and why some data belongs at the class level.",
          concept: "Instance vs. Class-Level Attributes",
          transcript:
            "This lesson explains that assigning a value directly to an object takes precedence over the class-level default, distinguishing instance attributes (unique per object, set via object.attribute = value) from class attributes (shared defaults accessible by every object, useful for data like a shared college name across student objects).",
          videoId: "NsCpRy68l1c",
          startSec: 1643,
          endSec: 1859,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D10_08",
          name: "Introducing the __init__ Constructor",
          title: "Introducing the __init__ Constructor",
          description:
            "Learn that __init__ runs automatically whenever a new object is created, and see it proven with print statements.",
          concept: "The __init__ Constructor",
          transcript:
            "This lesson introduces the __init__ constructor, a special method that always takes 'self' as its first parameter and runs automatically every time an object is created from a class, demonstrated by placing a print statement inside __init__ and showing it fires for each new student object.",
          videoId: "NsCpRy68l1c",
          startSec: 1859,
          endSec: 2065,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D10_09",
          name: "Understanding self and Object Identity",
          title: "Understanding self and Object Identity",
          description:
            "See how self refers to the current object and how each instance gets its own distinct memory location.",
          concept: "self and Memory Identity",
          transcript:
            "This lesson shows that printing 'self' inside __init__ yields the exact same memory location as printing the object itself, confirming self is a live reference to whichever object triggered the constructor, and that separate objects like Student1 and Student2 each get distinct memory addresses when created.",
          videoId: "NsCpRy68l1c",
          startSec: 2065,
          endSec: 2397,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D10_10",
          name: "Passing Data into the Constructor",
          title: "Passing Data into the Constructor",
          description:
            "Extend __init__ to accept extra parameters and assign them to self attributes, fixing the errors along the way.",
          concept: "Constructor Parameters",
          transcript:
            "This lesson extends __init__ to accept parameters beyond self (like name and course), triggers and explains the resulting errors from missing parameters or missing assignments, then fixes them by assigning the passed-in values to object attributes with self.attribute = value.",
          videoId: "NsCpRy68l1c",
          startSec: 2431,
          endSec: 2718,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D10_11",
          name: "Defining Methods Inside a Class",
          title: "Defining Methods Inside a Class",
          description:
            "Access constructor-assigned data on two student objects, then learn how methods differ from attributes.",
          concept: "Methods vs. Attributes",
          transcript:
            "This lesson accesses and prints the name and course attributes for two separately constructed student objects to confirm the constructor worked correctly, then defines methods as functions written inside a class that let objects perform actions, distinct from attributes, which just store data.",
          videoId: "NsCpRy68l1c",
          startSec: 2718,
          endSec: 2988,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D10_12",
          name: "Practice: Building the average() Method",
          title: "Practice: Building the average() Method",
          description:
            "Create a Student class that stores a list of marks and computes their average, including debugging the code.",
          concept: "The average() Method",
          transcript:
            "This lesson builds a Student class whose constructor takes a name and a list of marks, then implements an average() method that loops through the marks to sum them and divide by their count — including fixing a real bug from an uninitialized sum variable and calling the method correctly to get the final average.",
          videoId: "NsCpRy68l1c",
          startSec: 3027,
          endSec: 3492,
          durationInMinutes: 8,
        },
        {
          id: "PYTHON_BEGINNER_D10_13",
          name: "Static Methods and the Four Pillars of OOP",
          title: "Static Methods and the Four Pillars of OOP",
          description:
            "Learn the @staticmethod decorator, then get a preview of encapsulation, abstraction, polymorphism, and inheritance.",
          concept: "Static Methods and OOP Pillars Overview",
          transcript:
            "This lesson introduces static methods, marked with the @staticmethod decorator, as functions that don't need the self parameter and are used for utility-level functionality, then previews the four foundational pillars of OOP — encapsulation, abstraction, polymorphism, and inheritance — as key interview topics.",
          videoId: "NsCpRy68l1c",
          startSec: 3551,
          endSec: 3682,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D10_14",
          name: "Abstraction and Encapsulation",
          title: "Abstraction and Encapsulation",
          description:
            "Define abstraction as hiding complexity and encapsulation as bundling data and methods into a single class unit.",
          concept: "Abstraction and Encapsulation",
          transcript:
            "This lesson defines abstraction as showing only essential details while hiding internal complexity, using app interfaces and car controls as examples, then covers encapsulation as wrapping data (attributes) and methods into a single class unit, protecting data through the structure of the class itself.",
          videoId: "NsCpRy68l1c",
          startSec: 3682,
          endSec: 3934,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D10_15",
          name: "Inheritance",
          title: "Inheritance",
          description:
            "See how a child class automatically gets a parent class's properties and methods, avoiding code repetition.",
          concept: "Inheritance",
          transcript:
            "This lesson explains inheritance as a child class acquiring the properties and methods of a parent class, demonstrated with a Vehicle parent class defining a start() method and car, bike, and truck subclasses that each inherit start() automatically while adding their own unique method, avoiding repeated code.",
          videoId: "NsCpRy68l1c",
          startSec: 3934,
          endSec: 4127,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D10_16",
          name: "Polymorphism",
          title: "Polymorphism",
          description:
            "See how the same method name can produce different behavior depending on which object calls it.",
          concept: "Polymorphism",
          transcript:
            "This lesson introduces polymorphism as the same method name producing different behavior depending on the calling object, demonstrated with a shared 'sound' method that barks, meows, or moos across Dog, Cat, and Cow classes, and a shared 'area' method that computes differently across Circle and Square classes.",
          videoId: "NsCpRy68l1c",
          startSec: 4127,
          endSec: 4364,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D10_17",
          name: "Course Recap and Career Advice",
          title: "Course Recap and Career Advice",
          description:
            "Review classes, objects, attributes, methods, constructors, and the four pillars of OOP, then get guidance on moving from theory to practice.",
          concept: "OOP Recap and Next Steps",
          transcript:
            "This lesson recaps classes, objects, attributes, methods, constructors, static methods, and the four pillars of OOP, then shifts to career advice — encouraging students to build a portfolio, pursue beginner Python-developer internships, and contribute to open-source Python communities to gain practical, real-world experience.",
          videoId: "NsCpRy68l1c",
          startSec: 4364,
          endSec: 4576,
          durationInMinutes: 4,
        },
      ],
    },
  ],
};
