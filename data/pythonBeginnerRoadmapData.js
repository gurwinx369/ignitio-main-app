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
            "This lesson introduces the course as a beginner-to-advanced Python path aimed at AI, ML, and data science careers, complete with notes, projects, and assignments. The instructor explains that no prior experience is required, invites students to introduce themselves so teaching can be tailored to their background, and points them to the full playlist for easy tracking of progress.",
          videoId: "VIDEO_ID_HERE",
          startSec: 0,
          endSec: 191,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D1_02",
          name: "What Is Programming",
          title: "What Is Programming",
          description:
            "Learn the core definition of programming as a way to instruct computers using structured language.",
          concept: "What Is Programming",
          transcript:
            "This lesson defines programming as the practice of giving instructions to a computer, comparing it to using a translator to communicate in a foreign language. Since computers only understand binary (zeros and ones representing electrical current), programming languages like Python act as a human-friendly abstraction layer that gets converted into machine-level instructions.",
          videoId: "VIDEO_ID_HERE",
          startSec: 191,
          endSec: 349,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D1_03",
          name: "Interpreters, Compilers, and Why Python",
          title: "Interpreters, Compilers, and Why Python",
          description:
            "See how interpreters translate Python into machine code, and why Python is the preferred first language.",
          concept: "Interpreters, Compilers, and Why Python",
          transcript:
            "This lesson explains that interpreters and compilers act as translators, converting human-readable Python code into instructions a machine can execute. It then covers why Python is widely chosen: simple syntax, a large support community, a rich library ecosystem, and broad use across AI, machine learning, and web development.",
          videoId: "VIDEO_ID_HERE",
          startSec: 349,
          endSec: 500,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D1_04",
          name: "Installing Visual Studio Code",
          title: "Installing Visual Studio Code",
          description:
            "Download and set up Visual Studio Code as the recommended editor for writing Python.",
          concept: "Installing Visual Studio Code",
          transcript:
            "This lesson recommends Visual Studio Code as the ideal editor for learning Python and walks through downloading it from the official site for either Windows or macOS. The instructor demonstrates extracting the downloaded files and confirms VS Code is a safe, widely-used, consistent tool across operating systems.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1201,
          endSec: 1367,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D1_05",
          name: "Running Code and Experimenting with Print",
          title: "Running Code and Experimenting with Print",
          description:
            "Run your first program using the built-in run button and practice customizing print statements.",
          concept: "Running Code and Experimenting with Print",
          transcript:
            "This lesson demonstrates running the 'Hello World' program using the editor's run button, with the output appearing in the integrated terminal. The instructor then experiments with printing different strings to show that whatever text is placed inside the quotes is displayed exactly as written, reinforcing how the print function works.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1367,
          endSec: 1508,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D1_06",
          name: "Assignment and Course Wrap-Up",
          title: "Assignment and Course Wrap-Up",
          description:
            "Take on the practice assignment of printing a name ten times and review the session's key takeaways.",
          concept: "Assignment and Course Wrap-Up",
          transcript:
            "This lesson sets a practice assignment: write a program that prints a name ten times without simply repeating the print statement manually, encouraging independent problem-solving. The instructor recaps the session's journey from understanding programming to installing tools and running the first script, and encourages students to share their progress on platforms like LinkedIn before the next chapter.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1837,
          endSec: 2138,
          durationInMinutes: 5,
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
            "This lesson reviews the previous assignment of printing a name ten times without using a loop, encouraging students to solve it manually rather than relying on outside help. The instructor uses the asterisk symbol to repeat the print statement and introduces the '\\n' escape sequence to place each name on its own new line, completing the assignment correctly.",
          videoId: "VIDEO_ID_HERE",
          startSec: 0,
          endSec: 287,
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
            "This lesson explains that the Python interpreter acts as a translator, converting human-written code into machine-understandable instructions line by line via the Python Virtual Machine. It highlights that execution is sequential and stops immediately when a syntax error is encountered, and shows how Python's descriptive error messages help developers quickly spot issues like unterminated strings.",
          videoId: "VIDEO_ID_HERE",
          startSec: 287,
          endSec: 522,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D2_03",
          name: "Variables and Memory Basics",
          title: "Variables and Memory Basics",
          description:
            "Learn what a variable is and how it differs from a constant.",
          concept: "Variables and Memory",
          transcript:
            "This lesson introduces variables as named references that store a value in memory, comparing the idea to variables in mathematics. It explains why variables are needed to store data like names or ages during program execution, and contrasts them with constants, which cannot be updated once set.",
          videoId: "VIDEO_ID_HERE",
          startSec: 522,
          endSec: 701,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D2_04",
          name: "Automatic Typing and Memory Inspection",
          title: "Automatic Typing and Memory Inspection",
          description:
            "See how Python assigns data types automatically and how to inspect a variable's memory location.",
          concept: "Automatic Typing and the id() Function",
          transcript:
            "This lesson shows that Python automatically assigns a data type to a variable without needing manual declaration, and introduces the id() function for inspecting where a variable's value is stored in memory. Practical examples create variables such as names and ages, reinforcing that variables act as references to objects in memory.",
          videoId: "VIDEO_ID_HERE",
          startSec: 701,
          endSec: 944,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D2_05",
          name: "Reassigning Variables and Type Errors",
          title: "Reassigning Variables and Type Errors",
          description:
            "Practice reassigning variable values and learn why mixing strings and integers causes an error.",
          concept: "Reassignment and Type Errors",
          transcript:
            "This lesson demonstrates reassigning values to variables using the assignment operator and printing updated results. It then triggers an error by trying to concatenate a string with an integer, using the resulting error message to explain why Python won't directly combine these two data types and how to correctly print variables alongside text.",
          videoId: "VIDEO_ID_HERE",
          startSec: 944,
          endSec: 1226,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D2_06",
          name: "Variable Naming Rules and Reserved Keywords",
          title: "Variable Naming Rules and Reserved Keywords",
          description:
            "Learn the technical rules for naming variables and which reserved words to avoid.",
          concept: "Naming Conventions and Reserved Keywords",
          transcript:
            "This lesson covers the rules for valid variable names — allowed characters, numbers, and underscores, with names never starting with a number or using special characters — and shows the errors triggered when these rules are broken. It also introduces reserved keywords like 'for', 'if', and 'while', which cannot be used as variable names, noting that Python will usually flag the conflict.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1226,
          endSec: 1490,
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
            "This lesson introduces the input() method, which lets a program prompt the user for information and store it in a variable rather than hardcoding values. It explains that input() always returns a string, then walks through writing, saving, and running a script that asks for a name and prints a personalized greeting, with an assignment to try capturing age next.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1490,
          endSec: 1852,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D2_08",
          name: "Expressions and Statements",
          title: "Expressions and Statements",
          description:
            "Understand the difference between expressions, which compute values, and statements, which are complete instructions.",
          concept: "Expressions and Statements",
          transcript:
            "This lesson defines an expression as a combination of operators and operands that produces a value, while a statement is a complete instruction the interpreter can execute. It clarifies that most lines of code are statements, notes that multiple statements can technically share a line with semicolons, and frames the interpreter as an engine that runs a series of statements to form a program.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1852,
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
            "This lesson introduces comments, written with a hash symbol, as a way to document code and explain logic for team collaboration without affecting execution. It then covers indentation, explaining that unlike many languages, Python treats whitespace as syntactically meaningful — it defines code blocks, and inconsistent indentation causes errors.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2004,
          endSec: 2312,
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
            "This lesson recaps the chapter using a Python fundamentals cheat sheet, covering the print function, variable creation, memory storage, the input method, and expressions and statements. It notes that data types will be explored in an upcoming lesson and reinforces the sequential nature of Python code execution.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2312,
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
            "This lesson sets up a new practice file and assigns a challenge to calculate the area of a circle from a user-entered diameter, using comments within the file to note the requirements. The instructor asks students to attempt it independently, requests an 'Understood' comment to gauge clarity, mentions that certification details are coming in future chapters, and closes with encouragement to keep learning.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2414,
          endSec: 2593,
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
          name: "Introduction to Data Types",
          title: "Introduction to Data Types",
          description:
            "Get an overview of Python's built-in data types: integers, floats, strings, and booleans.",
          concept: "Introduction to Data Types",
          transcript:
            "This lesson opens the chapter on data types and operators, framing them as core concepts that apply across all programming languages, not just Python. It introduces built-in types — integers for whole numbers, floats for decimals, strings for text, and booleans for true/false values — noting that Python automatically identifies these types for the developer.",
          videoId: "VIDEO_ID_HERE",
          startSec: 0,
          endSec: 236,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D3_02",
          name: "The type() Function and Circle Area Recap",
          title: "The type() Function and Circle Area Recap",
          description:
            "Use type() to check a variable's data type, then begin solving the circle-area assignment.",
          concept: "The type() Function",
          transcript:
            "This lesson introduces the type() function for programmatically checking a variable's data type, then transitions into solving the earlier circle-area assignment based on a user-entered diameter, explaining the math formula and the double-asterisk exponentiation syntax used to square a number.",
          videoId: "VIDEO_ID_HERE",
          startSec: 236,
          endSec: 411,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D3_03",
          name: "Circle Area Script and Type Errors",
          title: "Circle Area Script and Type Errors",
          description:
            "Run into a type error when performing arithmetic on string input from the user.",
          concept: "Type Errors on User Input",
          transcript:
            "This lesson continues refining the circle-area script and encounters a type error because input() returns a string, and arithmetic can't be performed directly on it. The instructor uses this mistake to introduce the concept of type casting as the fix.",
          videoId: "VIDEO_ID_HERE",
          startSec: 411,
          endSec: 591,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D3_04",
          name: "Fixing Errors with Type Casting",
          title: "Fixing Errors with Type Casting",
          description:
            "Resolve the type error by wrapping user input in int() to complete the calculation.",
          concept: "Type Casting with int()",
          transcript:
            "This lesson resolves the earlier type error by wrapping the input() call in int() to convert the string into a number, after which the circle-area script runs successfully and displays the correct result.",
          videoId: "VIDEO_ID_HERE",
          startSec: 591,
          endSec: 726,
          durationInMinutes: 2,
        },
        {
          id: "PYTHON_BEGINNER_D3_05",
          name: "Exploring Data Types with type()",
          title: "Exploring Data Types with type()",
          description:
            "Declare variables of different types and confirm their classes using type().",
          concept: "Verifying Data Types",
          transcript:
            "This lesson sets up a new chapter-two project folder and creates a data_types.py file declaring variables of different types — strings, integers, and floats. The instructor uses the type() function inside print statements to confirm Python correctly identifies each variable's class, such as 'str' and 'float'.",
          videoId: "VIDEO_ID_HERE",
          startSec: 726,
          endSec: 963,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D3_06",
          name: "Type Casting User Input",
          title: "Type Casting User Input",
          description:
            "Take age as input, display its type, and convert it from a string to a number.",
          concept: "Casting Input Values",
          transcript:
            "This lesson builds a program that takes user input for age and displays both the value and its data type, reinforcing that input() always returns a string. It shows how to use int() to convert that string into a number so arithmetic operations can be performed on it correctly.",
          videoId: "VIDEO_ID_HERE",
          startSec: 963,
          endSec: 1173,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D3_07",
          name: "Python Keywords and Naming Restrictions",
          title: "Python Keywords and Naming Restrictions",
          description:
            "Learn which reserved words can't be used as variable names and how to check the full keyword list.",
          concept: "Reserved Keywords",
          transcript:
            "This lesson explains that Python keywords such as 'for', 'if', 'else', and 'while' are reserved and cannot be used as variable names, showing the help('keywords') command for viewing the full list. It reassures students they don't need to memorize every keyword, since attempting to use one — like naming a variable 'for' — triggers a clear error in the editor.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1173,
          endSec: 1412,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D3_08",
          name: "Understanding Syntax Rules",
          title: "Understanding Syntax Rules",
          description:
            "Define syntax as the rule set governing how Python code must be structured.",
          concept: "Python Syntax Rules",
          transcript:
            "This lesson defines syntax as the fundamental set of rules governing how a Python program must be written and structured, explaining that understanding these rules is essential for writing error-free code and using the language's features effectively.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1412,
          endSec: 1666,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D3_09",
          name: "Sum of Two Numbers Exercise",
          title: "Sum of Two Numbers Exercise",
          description:
            "Take two user inputs and add them together, applying type conversion to make it work.",
          concept: "Adding User Inputs",
          transcript:
            "This lesson presents a coding challenge to take two numeric inputs from the user and add them together, prompting students to realize that a direct addition fails because both inputs are strings. Applying int() conversion to each value fixes the issue and produces the correct sum.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1666,
          endSec: 1871,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D3_10",
          name: "Implicit Type Conversion",
          title: "Implicit Type Conversion",
          description:
            "See how Python automatically promotes smaller data types to larger ones during arithmetic.",
          concept: "Implicit Type Conversion",
          transcript:
            "This lesson introduces type conversion and explains implicit conversion, where Python automatically promotes a smaller data type to a larger one to avoid losing precision — for example, adding an integer and a float automatically produces a float result, with no manual intervention required.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1871,
          endSec: 2021,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D3_11",
          name: "Explicit Type Conversion in Practice",
          title: "Explicit Type Conversion in Practice",
          description:
            "Manually convert data types using int() and float(), and verify the results.",
          concept: "Explicit Type Conversion",
          transcript:
            "This lesson covers explicit type conversion, where the programmer manually forces a value's type using functions like int() or float(). It demonstrates a practical exercise that takes user input, converts it to a float, and prints both the original and converted values alongside their types to confirm the change.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2021,
          endSec: 2301,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D3_12",
          name: "Practicing Explicit Conversion",
          title: "Practicing Explicit Conversion",
          description:
            "Walk through a complete input-to-float conversion script and confirm the type change.",
          concept: "Explicit Conversion Walkthrough",
          transcript:
            "This lesson walks through the code for the explicit-conversion practice assignment, collecting user input and converting it to a float while keeping the original string value separate. Running the code and checking both variables with type() confirms the conversion worked correctly.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2301,
          endSec: 2471,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D3_13",
          name: "Introduction to Python Operators",
          title: "Introduction to Python Operators",
          description:
            "Get an overview of arithmetic, comparison, logical, and assignment operators.",
          concept: "Introduction to Operators",
          transcript:
            "This lesson introduces the major categories of Python operators — arithmetic, comparison, logical, and assignment — noting that comparison operators always return True or False, a key idea for later conditional logic. It also defines operators as the action performers and operands as the values they act on, setting up a new operators.py file for practice.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2471,
          endSec: 2806,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D3_14",
          name: "Arithmetic Operators",
          title: "Arithmetic Operators",
          description:
            "Practice addition, subtraction, multiplication, division, modulus, and exponentiation.",
          concept: "Arithmetic Operators",
          transcript:
            "This lesson demonstrates the core arithmetic operators in Python — addition, subtraction, multiplication, and division — along with the modulus operator for finding a remainder and the exponentiation operator, written as a double asterisk, for raising a number to a power.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2806,
          endSec: 2948,
          durationInMinutes: 2,
        },
        {
          id: "PYTHON_BEGINNER_D3_15",
          name: "Comparison Operators",
          title: "Comparison Operators",
          description:
            "Test equality, inequality, and relative comparisons that return True or False.",
          concept: "Comparison Operators",
          transcript:
            "This lesson covers comparison operators such as equality, inequality, greater-than, and less-than, showing through variable examples how Python evaluates these conditions and always returns a Boolean result.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2948,
          endSec: 3162,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D3_16",
          name: "Logical Operators",
          title: "Logical Operators",
          description:
            "Learn how 'and', 'or', and 'not' combine or reverse boolean conditions.",
          concept: "Logical Operators",
          transcript:
            "This lesson explains logical operators: 'and' returns true only when both conditions are true, 'or' returns true when at least one condition is true, and 'not' reverses a boolean value entirely. Code examples with mixed true/false values reinforce how each operator behaves.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3162,
          endSec: 3516,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D3_17",
          name: "Assignment Operators and Chapter Recap",
          title: "Assignment Operators and Chapter Recap",
          description:
            "Learn shorthand assignment operators and review the chapter's key topics.",
          concept: "Assignment Operators",
          transcript:
            "This lesson introduces shorthand assignment operators like +=, -=, *=, and /=, which update a variable based on its current value more efficiently than writing out the full arithmetic expression. The chapter then wraps up with a recap of data types, keywords, type conversion, and operators.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3516,
          endSec: 3683,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D3_18",
          name: "Final Assignments and Session Wrap-Up",
          title: "Final Assignments and Session Wrap-Up",
          description:
            "Take on the temperature converter and bill split calculator assignments to close the chapter.",
          concept: "Final Practice Assignments",
          transcript:
            "This lesson assigns two final practice tasks: building a temperature converter that outputs Fahrenheit and Kelvin from a Celsius input using explicit type conversion, and a bill split calculator that divides a total bill among a number of friends. Students are encouraged to attempt both independently before solutions are covered in the next lecture, ahead of the upcoming chapter on strings.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3683,
          endSec: 3851,
          durationInMinutes: 3,
        },
      ],
    },
    {
      id: "day4",
      title: "Day 4 — Conditional Statements, Lists, and Tuples",
      color: "#ef4444",
      levels: [
        {
          id: "PYTHON_BEGINNER_D4_01",
          name: "What Are Conditional Statements",
          title: "What Are Conditional Statements",
          description:
            "Understand conditions and if statements through real-life decision-making analogies.",
          concept: "Conditional Statements Introduction",
          transcript:
            "This lesson opens the chapter on conditional statements, lists, and tuples, drawing parallels between programming logic and real-life decisions like traffic rules or grading systems. It defines a condition as something that evaluates to true or false, and introduces the if statement as code that runs only when a condition is met.",
          videoId: "VIDEO_ID_HERE",
          startSec: 0,
          endSec: 207,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D4_02",
          name: "Writing Your First If Statement",
          title: "Writing Your First If Statement",
          description:
            "Build a grading example in VS Code and see why indentation matters under an if block.",
          concept: "Writing an If Statement",
          transcript:
            "This lesson sets up a grading example in VS Code, printing a result when a score condition is true. It stresses that Python's indentation rules are not just cosmetic — they define which code belongs to the conditional block.",
          videoId: "VIDEO_ID_HERE",
          startSec: 207,
          endSec: 380,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D4_03",
          name: "elif for Multiple Conditions",
          title: "elif for Multiple Conditions",
          description:
            "Chain multiple conditions with elif and see how Python stops at the first true match.",
          concept: "The elif Statement",
          transcript:
            "This lesson introduces elif for checking several conditions in sequence, explaining that the interpreter stops evaluating as soon as it finds a true condition. This efficiently handles multi-tier scenarios like grading systems without checking every remaining condition.",
          videoId: "VIDEO_ID_HERE",
          startSec: 380,
          endSec: 671,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D4_04",
          name: "The else Statement and Choosing a Structure",
          title: "The else Statement and Choosing a Structure",
          description:
            "Add a fallback else branch and learn when to use if-else versus a full elif chain.",
          concept: "The else Statement",
          transcript:
            "This lesson introduces else as the fallback that runs when every prior if and elif condition is false, demonstrated with a voting-eligibility example based on age. It also discusses when a simple if-else is enough versus when a longer elif chain is needed.",
          videoId: "VIDEO_ID_HERE",
          startSec: 671,
          endSec: 886,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D4_05",
          name: "Finishing the Positive, Negative, or Zero Program",
          title: "Finishing the Positive, Negative, or Zero Program",
          description:
            "Complete the practice program that classifies a number using if-elif-else logic.",
          concept: "Number Classification Practice",
          transcript:
            "This lesson completes a practice program that classifies a user-entered number as positive, negative, or zero using if-elif-else, reinforcing that input() returns a string and must be cast to an integer before comparison. The finished code is tested against positive, negative, and zero values.",
          videoId: "VIDEO_ID_HERE",
          startSec: 886,
          endSec: 1110,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D4_06",
          name: "Introducing Python Lists",
          title: "Introducing Python Lists",
          description:
            "Learn how lists store multiple values of different types in a single variable.",
          concept: "Introduction to Lists",
          transcript:
            "This lesson introduces lists as a mutable Python data structure that can hold multiple values, even of different types, inside square brackets — unlike a plain variable, which holds only one value. Examples include mixed lists of names, ages, and food items.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1110,
          endSec: 1324,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D4_07",
          name: "List Indexing, Length, and Mutability",
          title: "List Indexing, Length, and Mutability",
          description:
            "Access list elements by index, measure list size with len(), and see how lists can be modified.",
          concept: "List Indexing and Mutability",
          transcript:
            "This lesson covers accessing list elements by zero-based index, using len() to count elements, and the fact that lists are mutable — their values can be changed after creation. It also introduces max() and min() for finding extreme values in a list.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1324,
          endSec: 1673,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D4_08",
          name: "Modifying Lists vs. Immutable Strings",
          title: "Modifying Lists vs. Immutable Strings",
          description:
            "Update a list by index and compare that flexibility against a string's immutability.",
          concept: "List Mutability vs. String Immutability",
          transcript:
            "This lesson updates an element in a marks list by index to show lists are mutable, then contrasts this by attempting to change a single character in a string, which raises a TypeError. The comparison reinforces why lists allow in-place updates while strings do not.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1673,
          endSec: 1900,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D4_09",
          name: "List Slicing and Built-In Functions",
          title: "List Slicing and Built-In Functions",
          description:
            "Extract sublists with slicing and preview list methods like append, insert, remove, and pop.",
          concept: "List Slicing and Method Overview",
          transcript:
            "This lesson introduces list slicing with square-bracket index ranges, noting the ending index is exclusive, and demonstrates max() and min() on a list of marks. It then previews the core list methods to come: append for adding, insert for placement, remove for deleting a value, and pop for removing by index.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1900,
          endSec: 2141,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D4_10",
          name: "Modifying Lists with append(), sort(), pop(), remove(), insert()",
          title:
            "Modifying Lists with append(), sort(), pop(), remove(), insert()",
          description:
            "Live-code the core list-modification methods and see how each changes the list in place.",
          concept: "List Modification Methods",
          transcript:
            "This lesson live-codes append() to add an element, sort() to reorder a list ascending, pop() and remove() to delete by index or by value, and insert() to place an element at a specific index — all confirming that these operations modify the original list because lists are mutable.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2141,
          endSec: 2296,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D4_11",
          name: "Practice: Favorite Foods List from User Input",
          title: "Practice: Favorite Foods List from User Input",
          description:
            "Collect three foods from the user and build the list two different ways.",
          concept: "Building a List from User Input",
          transcript:
            "This lesson practices collecting three favorite foods from the user and storing them in a list, showing two valid approaches — direct list initialization versus starting with an empty list and using append() — before printing the final list and its length.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2296,
          endSec: 2522,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D4_12",
          name: "Introducing Tuples",
          title: "Introducing Tuples",
          description:
            "Meet tuples as list-like structures with parentheses instead of square brackets.",
          concept: "Introduction to Tuples",
          transcript:
            "This lesson introduces tuples as a data structure similar to lists but created with parentheses instead of square brackets. It sets up the key theme for the topic: unlike the flexible, mutable nature of lists, tuples behave differently once created.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2522,
          endSec: 2798,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D4_13",
          name: "Tuple Immutability",
          title: "Tuple Immutability",
          description:
            "Understand why tuples can't be changed after creation and how that protects data integrity.",
          concept: "Tuple Immutability",
          transcript:
            "This lesson explains that tuples are immutable — once created, their contents cannot be changed — which acts as a safeguard for data that shouldn't be altered. It demonstrates creating tuples with mixed data types like strings, integers, and floats.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2798,
          endSec: 3060,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D4_14",
          name: "Tuple Rules: Reassignment Errors and Single-Element Tuples",
          title: "Tuple Rules: Reassignment Errors and Single-Element Tuples",
          description:
            "See the TypeError from reassigning a tuple element and the trailing-comma rule for single-item tuples.",
          concept: "Tuple Creation Rules",
          transcript:
            "This lesson confirms tuple immutability by attempting to reassign an element by index, which raises a TypeError, while noting that square brackets are still used to access tuple elements. It also covers a common pitfall: a single-element tuple needs a trailing comma, or Python treats it as a plain value instead.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3060,
          endSec: 3233,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D4_15",
          name: "Tuple Methods and Chapter Wrap-Up",
          title: "Tuple Methods and Chapter Wrap-Up",
          description:
            "Learn index() and count(), then review the key differences between lists and tuples.",
          concept: "Tuple Methods and Chapter Recap",
          transcript:
            "This lesson covers the index() method for locating an element's position and count() for counting occurrences within a tuple, along with using len() to get a tuple's size. The chapter closes with a summary of the core distinction between lists and tuples: mutability and bracket syntax.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3233,
          endSec: 3505,
          durationInMinutes: 5,
        },
      ],
    },
    {
      id: "day5",
      title: "Day 5 — Dictionaries and Sets",
      color: "#06b6d4",
      levels: [
        {
          id: "PYTHON_BEGINNER_D5_01",
          name: "What Is a Dictionary",
          title: "What Is a Dictionary",
          description:
            "Learn how dictionaries store data as unique key-value pairs.",
          concept: "Introduction to Dictionaries",
          transcript:
            "This lesson defines dictionaries as a built-in Python type for storing data as key-value pairs, where each key must be unique, unlike lists or tuples. It draws an analogy to a physical dictionary, where each word (key) appears only once.",
          videoId: "VIDEO_ID_HERE",
          startSec: 0,
          endSec: 265,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D5_02",
          name: "Creating a Dictionary and Accessing Values",
          title: "Creating a Dictionary and Accessing Values",
          description:
            "Build a dictionary with curly braces and retrieve values using their keys.",
          concept: "Dictionary Creation and Access",
          transcript:
            "This lesson creates a dictionary using curly braces and explains that, unlike lists, dictionaries don't support numeric indexing — values are retrieved only by their key, such as student['name']. It also notes dictionaries are unordered and mutable.",
          videoId: "VIDEO_ID_HERE",
          startSec: 265,
          endSec: 480,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D5_03",
          name: "Building a Student Dictionary in VS Code",
          title: "Building a Student Dictionary in VS Code",
          description:
            "Set up a Chapter 5 project and build a dictionary of student details.",
          concept: "Practical Dictionary Setup",
          transcript:
            "This lesson sets up a new Chapter 5 folder and a dict_basics.py file, building a student dictionary with fields like name, city, age, and roll number. The type() function confirms the variable is a dict object.",
          videoId: "VIDEO_ID_HERE",
          startSec: 480,
          endSec: 740,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D5_04",
          name: "Duplicate Keys and Value Overriding",
          title: "Duplicate Keys and Value Overriding",
          description:
            "See what happens when the same key is defined twice in a dictionary.",
          concept: "Duplicate Key Behavior",
          transcript:
            "This lesson tests what happens when a dictionary key is defined more than once, showing that Python doesn't raise an error but instead keeps only the value from the last occurrence of that key, overriding any earlier definitions.",
          videoId: "VIDEO_ID_HERE",
          startSec: 740,
          endSec: 960,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D5_05",
          name: "Printing Dictionaries and Accessing Values by Key",
          title: "Printing Dictionaries and Accessing Values by Key",
          description:
            "Print a full dictionary and pull individual values using their keys.",
          concept: "Printing and Key-Based Access",
          transcript:
            "This lesson shows that printing a dictionary displays all its key-value pairs at once, and reinforces accessing individual values with the dictionary name and key in square brackets, comparing each key to a lock that opens only its matching value.",
          videoId: "VIDEO_ID_HERE",
          startSec: 960,
          endSec: 1126,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D5_06",
          name: "Updating and Adding Key-Value Pairs",
          title: "Updating and Adding Key-Value Pairs",
          description:
            "Overwrite an existing key's value and add brand-new keys to a dictionary.",
          concept: "Updating and Adding Entries",
          transcript:
            "This lesson updates an existing dictionary entry by reassigning a new value to its key — such as changing a student's city — and shows that assigning a value to a key that doesn't yet exist automatically creates a new key-value pair.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1126,
          endSec: 1352,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D5_07",
          name: "Removing Items and Exploring Dictionary Methods",
          title: "Removing Items and Exploring Dictionary Methods",
          description:
            "Use .pop(), .keys(), .values(), .items(), .get(), and .update() to manage dictionary data.",
          concept: "Dictionary Methods",
          transcript:
            "This lesson covers .pop() for removing a specific key-value pair, .keys() and .values() for inspecting a dictionary's contents, and .items() for retrieving key-value pairs together. It also touches on .get() for safe retrieval and .update() for merging dictionaries, while cautioning that .clear() wipes everything.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1352,
          endSec: 1610,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D5_08",
          name: "Practice: Building a Marks Dictionary",
          title: "Practice: Building a Marks Dictionary",
          description:
            "Create a dictionary of subject scores and print the final result.",
          concept: "Marks Dictionary Practice",
          transcript:
            "This lesson practices building a 'marks' dictionary by adding subjects like Mathematics, Chemistry, and Computer Science one at a time, confirming the variable's type along the way, then prints the completed dictionary to verify all entries were added successfully.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1610,
          endSec: 1865,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D5_09",
          name: "Introducing Sets: Unordered and Unique",
          title: "Introducing Sets: Unordered and Unique",
          description:
            "Learn how sets automatically remove duplicates and don't support indexing.",
          concept: "Introduction to Sets",
          transcript:
            "This lesson introduces sets as an unordered collection of unique items with no index-based access. Sets use curly braces like dictionaries but store only single, distinct values, automatically discarding any duplicates.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1865,
          endSec: 2088,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D5_10",
          name: "Creating Sets and Checking for Duplicates",
          title: "Creating Sets and Checking for Duplicates",
          description:
            "Build a set of food items and confirm that duplicate entries are dropped.",
          concept: "Set Creation and Duplicate Handling",
          transcript:
            "This lesson creates a set of food items and confirms that adding the same item twice results in only one copy in the set, demonstrating that sets automatically reject duplicates. It also notes that an empty set must be created with set(), since empty curly braces make a dictionary instead.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2088,
          endSec: 2276,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D5_11",
          name: "Set Properties and Methods: .add() and .remove()",
          title: "Set Properties and Methods: .add() and .remove()",
          description:
            "Modify a set by adding and removing elements while keeping values unique.",
          concept: "Modifying Sets",
          transcript:
            "This lesson covers set properties — unordered, mutable, and unable to contain mutable elements like lists — and demonstrates .add() and .remove() to modify a set's contents while confirming its unique-value property is preserved.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2276,
          endSec: 2463,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D5_12",
          name: "More Set Operations and Converting a List to a Set",
          title: "More Set Operations and Converting a List to a Set",
          description:
            "Explore .clear() and .pop(), then convert a list to a set to remove duplicates.",
          concept: "Set Conversion and Cleanup Methods",
          transcript:
            "This lesson mentions .clear() and .pop() for managing set elements and briefly notes union and intersection as set-theory concepts. It then demonstrates converting a list into a set using the set() constructor to automatically strip out duplicate values, such as counting unique programming languages in a list.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2463,
          endSec: 2732,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D5_13",
          name: "Counting Unique Items and Chapter Wrap-Up",
          title: "Counting Unique Items and Chapter Wrap-Up",
          description:
            "Use len() to count unique set items, then review dictionaries versus sets.",
          concept: "Chapter Recap: Dictionaries vs. Sets",
          transcript:
            "This lesson uses len() on a converted set to count unique items, wrapping up the chapter with a summary of the core difference between the two structures: dictionaries store unique keys mapped to values, while sets store unique, unordered individual values. The chapter closes with a mini-task and encouragement to keep practicing.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2732,
          endSec: 2884,
          durationInMinutes: 3,
        },
      ],
    },
    {
      id: "day6",
      title: "Day 6 — Loops: while, for, and Control Statements",
      color: "#8b5cf6",
      levels: [
        {
          id: "PYTHON_BEGINNER_D6_01",
          name: "Why We Need Loops",
          title: "Why We Need Loops",
          description:
            "Understand why repeating tasks manually doesn't scale and how loops solve that.",
          concept: "Introduction to Loops",
          transcript:
            "This lesson introduces loops using real-world repetition examples, showing that manually copying a print statement to repeat a task becomes impossible at scale. It previews the two core loop types in Python — while and for — before diving into either one.",
          videoId: "VIDEO_ID_HERE",
          startSec: 0,
          endSec: 231,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_02",
          name: "While Loop Syntax and Logic",
          title: "While Loop Syntax and Logic",
          description:
            "Learn the parts of a while loop: initialization, condition, and incrementing.",
          concept: "While Loop Syntax",
          transcript:
            "This lesson breaks down the while loop into its core parts — initializing a variable, checking a condition, and incrementing that variable inside the loop to avoid running forever. It also covers Python's colon-and-indentation syntax for the loop body, in place of curly braces.",
          videoId: "VIDEO_ID_HERE",
          startSec: 231,
          endSec: 535,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D6_03",
          name: "Dry Running a While Loop",
          title: "Dry Running a While Loop",
          description:
            "Trace a while loop step by step to see exactly why and when it stops.",
          concept: "Dry Running Loop Logic",
          transcript:
            "This lesson dry-runs a while loop by hand, tracing a variable's value through each iteration until the condition fails and the loop exits. This manual tracing technique is presented as a key tool for beginners to truly understand loop behavior.",
          videoId: "VIDEO_ID_HERE",
          startSec: 535,
          endSec: 831,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D6_04",
          name: "Setting Up the 1-to-10 Counting Exercise",
          title: "Setting Up the 1-to-10 Counting Exercise",
          description:
            "Begin a coding exercise to print numbers one through ten with a while loop.",
          concept: "Counting Exercise Setup",
          transcript:
            "This lesson starts a coding exercise to print numbers one through ten using a while loop, noting that wrapping the loop condition in parentheses is optional in Python, unlike some other languages.",
          videoId: "VIDEO_ID_HERE",
          startSec: 831,
          endSec: 938,
          durationInMinutes: 2,
        },
        {
          id: "PYTHON_BEGINNER_D6_05",
          name: "Practice: Counting Up and Down",
          title: "Practice: Counting Up and Down",
          description:
            "Print numbers 1 to 10 and then 10 down to 1 using increment and decrement logic.",
          concept: "Incrementing and Decrementing",
          transcript:
            "This lesson completes printing numbers 1 through 10 using the increment operator, then reverses the task by counting down from 10 to 1 using decrement logic, dry-running the reverse loop to confirm the execution flow.",
          videoId: "VIDEO_ID_HERE",
          startSec: 938,
          endSec: 1220,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D6_06",
          name: "Practice: Printing Even Numbers 1 to 50",
          title: "Practice: Printing Even Numbers 1 to 50",
          description:
            "Combine a while loop with an if condition and the modulus operator to filter even numbers.",
          concept: "Filtering with Modulus Inside a Loop",
          transcript:
            "This lesson prints even numbers between 1 and 50 by nesting an if condition inside a while loop, using the modulus operator to check whether a number is divisible by 2. A full dry run confirms the loop correctly skips odd values.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1220,
          endSec: 1631,
          durationInMinutes: 7,
        },
        {
          id: "PYTHON_BEGINNER_D6_07",
          name: "Setting Up the Sum-of-N-Numbers Problem",
          title: "Setting Up the Sum-of-N-Numbers Problem",
          description:
            "Plan a program that sums numbers from n down to 1 using user input.",
          concept: "Planning the Sum Program",
          transcript:
            "This lesson sets up a program to sum the first n natural numbers, taking n as user input and converting it to an integer, then establishing a sum variable that will accumulate values as the loop counts down from n to 1.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1631,
          endSec: 1821,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D6_08",
          name: "Dry Running and Coding the Sum Program",
          title: "Dry Running and Coding the Sum Program",
          description:
            "Trace the sum and counter variables by hand, then translate the logic into working code.",
          concept: "Dry Run to Code Translation",
          transcript:
            "This lesson traces the sum and n variables through each loop iteration by hand until n reaches zero and the loop ends, then translates that dry-run logic into actual Python code and tests it with an input of 5 to confirm the output matches.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1821,
          endSec: 2153,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D6_09",
          name: "Star Pattern Using a While Loop",
          title: "Star Pattern Using a While Loop",
          description:
            "Print an increasing star pattern using string multiplication inside a loop.",
          concept: "Star Pattern with String Multiplication",
          transcript:
            "This lesson builds a classic beginner exercise: printing a star pattern that grows with each loop iteration, using Python's string multiplication to repeat the star symbol based on the current counter value.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2153,
          endSec: 2409,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_10",
          name: "Building the Multiplication Table",
          title: "Building the Multiplication Table",
          description:
            "Take a number from the user and set up a loop variable to generate its multiplication table.",
          concept: "Multiplication Table Setup",
          transcript:
            "This lesson collects a number from the user, converting it from string to integer, then sets up a separate loop variable to act as the multiplier while the user's number stays fixed — using a formatted string to display each line like '3 * 1 = 3'.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2409,
          endSec: 2678,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_11",
          name: "Dry Running the Multiplication Table",
          title: "Dry Running the Multiplication Table",
          description:
            "Trace how the fixed number and the incrementing multiplier work together to build the full table.",
          concept: "Multiplication Table Dry Run",
          transcript:
            "This lesson dry-runs the multiplication table loop to show how the fixed user number and the incrementing multiplier variable interact until the multiplier passes 10, successfully producing the full table for the user's input.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2678,
          endSec: 2945,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_12",
          name: "Introducing the For Loop",
          title: "Introducing the For Loop",
          description:
            "Learn the for-loop syntax for iterating directly over a list.",
          concept: "For Loop Introduction",
          transcript:
            "This lesson introduces the for loop as the tool of choice for iterating over collections like lists, tuples, and strings, contrasting it with manual indexing. It demonstrates the 'for item in list' structure that automatically walks through each element.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2945,
          endSec: 3121,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D6_13",
          name: "For Loop with Lists and Tuples",
          title: "For Loop with Lists and Tuples",
          description:
            "Print every item in a list and a tuple using the same for-loop syntax.",
          concept: "Iterating Lists and Tuples",
          transcript:
            "This lesson prints every element of a list using a for loop, noting the loop variable's name is flexible as long as it isn't a reserved keyword. It then shows the identical syntax working just as well on a tuple of college names.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3121,
          endSec: 3271,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D6_14",
          name: "The range() Function Basics",
          title: "The range() Function Basics",
          description:
            "Generate number sequences for loops using range()'s start, stop, and step parameters.",
          concept: "Introduction to range()",
          transcript:
            "This lesson introduces the range() function for generating number sequences to loop over, explaining its start, stop, and step parameters — where stop is required but start defaults to zero and step defaults to one — and confirms that the stop value is exclusive.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3271,
          endSec: 3452,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D6_15",
          name: "Using range() with Step Values",
          title: "Using range() with Step Values",
          description:
            "Adjust the step parameter to print even numbers and other custom sequences.",
          concept: "range() Step Parameter",
          transcript:
            "This lesson uses range()'s step parameter to print even numbers, dry-running how each next value is calculated by adding the step to the current index. It also shows adjusting the stop value to correctly include a target endpoint and tests a larger step value to confirm the skipping behavior.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3452,
          endSec: 3715,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_16",
          name: "Iteration, Iterators, and the break Statement",
          title: "Iteration, Iterators, and the break Statement",
          description:
            "Define iteration and iterators, then use break to exit a loop early.",
          concept: "Iteration Terms and break",
          transcript:
            "This lesson defines iteration as visiting each item in a collection and the iterator as the variable representing the current item, demonstrated with a list of countries. It then introduces the break statement, which immediately stops a loop once a specific condition is met.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3715,
          endSec: 4064,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D6_17",
          name: "The continue and pass Statements",
          title: "The continue and pass Statements",
          description:
            "Skip an iteration with continue and use pass as a syntactic placeholder.",
          concept: "continue and pass",
          transcript:
            "This lesson introduces continue, which skips the rest of the current iteration and moves to the next one — demonstrated by skipping the value three in a loop from one to six. It then covers pass as a null placeholder used to keep an otherwise empty block syntactically valid.",
          videoId: "VIDEO_ID_HERE",
          startSec: 4064,
          endSec: 4315,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D6_18",
          name: "Building a Countdown Timer with time.sleep()",
          title: "Building a Countdown Timer with time.sleep()",
          description:
            "Build a countdown project using a negative-step range and the time module for delays.",
          concept: "Countdown Timer Mini-Project",
          transcript:
            "This lesson builds a countdown timer that takes a starting number from the user and counts down using a negative-step range, importing the time module to add a one-second pause between prints with time.sleep(). After fixing a bug where the wrong variable was being printed, the timer runs correctly and ends with a closing message.",
          videoId: "VIDEO_ID_HERE",
          startSec: 4315,
          endSec: 4592,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D6_19",
          name: "Chapter Recap and Closing Remarks",
          title: "Chapter Recap and Closing Remarks",
          description:
            "Review while loops, for loops, range(), and control statements before moving on.",
          concept: "Loops Chapter Recap",
          transcript:
            "This lesson closes the chapter with a recap of while loops for conditional repetition, for loops for iterating sequences, the range() function for generating numbers, and the break, continue, and pass control statements, encouraging continued practice before the next chapter.",
          videoId: "VIDEO_ID_HERE",
          startSec: 4592,
          endSec: 4682,
          durationInMinutes: 2,
        },
      ],
    },
    {
      id: "day7",
      title: "Day 7 — Functions",
      color: "#ec4899",
      levels: [
        {
          id: "PYTHON_BEGINNER_D7_01",
          name: "Why Functions Matter",
          title: "Why Functions Matter",
          description:
            "Understand why repeating the same logic throughout a program is bad practice.",
          concept: "The Problem with Repeated Code",
          transcript:
            "This lesson opens the functions chapter by showing how repeating the same logic — like summing two numbers — throughout a program creates redundant, hard-to-maintain code. It frames functions as the professional solution for keeping large projects clean and organized.",
          videoId: "VIDEO_ID_HERE",
          startSec: 0,
          endSec: 291,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D7_02",
          name: "Defining a Function with def",
          title: "Defining a Function with def",
          description:
            "Learn the def keyword, naming rules, and required indentation for a function body.",
          concept: "Function Definition Syntax",
          transcript:
            "This lesson introduces the def keyword for defining a function, covering naming rules, the parentheses that will later hold parameters, and the colon-plus-indentation structure that marks the function's body — demonstrated by building a sample sum function.",
          videoId: "VIDEO_ID_HERE",
          startSec: 291,
          endSec: 474,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D7_03",
          name: "Calling a Function and Execution Flow",
          title: "Calling a Function and Execution Flow",
          description:
            "Call a function by name and trace how the interpreter jumps to and from its logic.",
          concept: "Function Calling",
          transcript:
            "This lesson shows how calling a function by its name and parentheses replaces repeated manual code, and traces how the interpreter recognizes the function definition first, then jumps to execute its internal logic each time it's called.",
          videoId: "VIDEO_ID_HERE",
          startSec: 474,
          endSec: 672,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D7_04",
          name: "Practice: The welcome_message Function",
          title: "Practice: The welcome_message Function",
          description:
            "Define a function that prints a message and confirm it only runs when called.",
          concept: "Definition vs. Invocation Practice",
          transcript:
            "This lesson works through a practice exercise defining a welcome_message function, demonstrating that defining a function alone produces no output — it must be explicitly called. The function is then invoked three times to print its message three times.",
          videoId: "VIDEO_ID_HERE",
          startSec: 672,
          endSec: 954,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D7_05",
          name: "Professional Standards and the inspire Function",
          title: "Professional Standards and the inspire Function",
          description:
            "See why avoiding repeated code matters professionally, using an inspire function example.",
          concept: "Professional Coding Standards",
          transcript:
            "This lesson discusses why repeated code is viewed poorly in professional and interview settings, then builds an inspire function that prints a motivational quote and name — reinforcing that a function must be explicitly called to run its logic.",
          videoId: "VIDEO_ID_HERE",
          startSec: 954,
          endSec: 1212,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D7_06",
          name: "Defining Functions Before Calling Them",
          title: "Defining Functions Before Calling Them",
          description:
            "Trigger and fix a 'not defined' error caused by calling a function before it exists.",
          concept: "Function Definition Order",
          transcript:
            "This lesson deliberately calls a function before it's defined to trigger a 'not defined' error, then fixes it by moving the definition above the call — reinforcing that Python reads and executes code sequentially from top to bottom.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1212,
          endSec: 1458,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D7_07",
          name: "Parameters and Arguments",
          title: "Parameters and Arguments",
          description:
            "Make functions dynamic by passing data in through parameters and arguments.",
          concept: "Parameters vs. Arguments",
          transcript:
            "This lesson introduces parameters as placeholders in a function's definition and arguments as the actual values passed when calling it, distinguishing static functions from flexible, data-driven ones — demonstrated by building an average function with parameters A and B.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1458,
          endSec: 1690,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D7_08",
          name: "Running the Average Function with Different Inputs",
          title: "Running the Average Function with Different Inputs",
          description:
            "Call the same average function repeatedly with different argument sets.",
          concept: "Reusing Functions with Different Arguments",
          transcript:
            "This lesson runs the average function with multiple different argument pairs, showing how the same logic can be reused for different inputs rather than writing separate code for each calculation.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1690,
          endSec: 1883,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D7_09",
          name: "Default Parameter Values",
          title: "Default Parameter Values",
          description:
            "Set default values for parameters so a function still works when arguments are omitted.",
          concept: "Default Parameters",
          transcript:
            "This lesson introduces default parameter values, which let a function run using predefined inputs when the caller passes nothing. It demonstrates assigning defaults like a=10 and b=20, and shows that provided arguments override those defaults when supplied.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1883,
          endSec: 2233,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D7_10",
          name: "The return Statement",
          title: "The return Statement",
          description:
            "Send a value back from a function using return instead of printing it directly.",
          concept: "Returning Values",
          transcript:
            "This lesson introduces the return statement, which sends a result back to the caller instead of printing it directly, allowing that value to be stored in a variable for later use — demonstrated by storing the result of a multiplication function.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2233,
          endSec: 2429,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D7_11",
          name: "Building the Vowel-and-Consonant Counter",
          title: "Building the Vowel-and-Consonant Counter",
          description:
            "Write a function that loops through a string to count vowels and consonants separately.",
          concept: "Multi-Step Function Logic",
          transcript:
            "This lesson builds a more complex function that counts vowels and consonants in a string, using a for loop, a predefined set of vowels, and the isalpha() check to distinguish letters, incrementing separate counters as it goes.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2429,
          endSec: 2794,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D7_12",
          name: "Returning Multiple Values and Keyword Arguments",
          title: "Returning Multiple Values and Keyword Arguments",
          description:
            "Return two values from one function call and pass arguments by keyword instead of position.",
          concept: "Multiple Returns and Keyword Arguments",
          transcript:
            "This lesson shows that a function can return multiple values at once — such as vowel and consonant counts — stored into separate variables. It then introduces keyword arguments, which let a caller specify parameter names directly so argument order no longer matters.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2794,
          endSec: 3051,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D7_13",
          name: "Variable Scope: Local vs. Global",
          title: "Variable Scope: Local vs. Global",
          description:
            "Understand the difference between local and global variables, and Python's default None return.",
          concept: "Local vs. Global Scope",
          transcript:
            "This lesson distinguishes local variables, which are restricted to the function they're defined in, from global variables, which are accessible throughout the program, demonstrating the error triggered by accessing a local variable outside its scope. It also explains that a function returns None by default if no return statement is present.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3051,
          endSec: 3243,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D7_14",
          name: "Chapter Recap and What's Next",
          title: "Chapter Recap and What's Next",
          description:
            "Review functions, arguments, parameters, defaults, and scope before the next project-based lesson.",
          concept: "Functions Chapter Recap",
          transcript:
            "This lesson closes the chapter with a recap of function definitions, arguments, parameters, default values, and variable scope, previewing an upcoming project-based session that will bring these concepts together.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3243,
          endSec: 3434,
          durationInMinutes: 3,
        },
      ],
    },
    {
      id: "day8",
      title: "Day 8 — File Handling",
      color: "#14b8a6",
      levels: [
        {
          id: "PYTHON_BEGINNER_D8_01",
          name: "File Types and open() Modes",
          title: "File Types and open() Modes",
          description:
            "Distinguish text from binary files and learn the open() function's core modes.",
          concept: "File Types and open() Modes",
          transcript:
            "This lesson introduces file handling, distinguishing human-readable text files (.log, .csv) from binary files (.png, .mp4, .pdf), and covers Python's built-in open() function with its read ('r'), write ('w'), append ('a'), and create ('x') modes.",
          videoId: "VIDEO_ID_HERE",
          startSec: 0,
          endSec: 410,
          durationInMinutes: 7,
        },
        {
          id: "PYTHON_BEGINNER_D8_02",
          name: "Reading a File with read()",
          title: "Reading a File with read()",
          description:
            "Open a text file, read its full contents into a variable, and print the result.",
          concept: "Reading Files with read()",
          transcript:
            "This lesson sets up a file_basics.py project and a sample must.txt file, showing that open() defaults to read mode, and uses file.read() to load the file's contents into a variable that can then be printed to the console.",
          videoId: "VIDEO_ID_HERE",
          startSec: 410,
          endSec: 642,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D8_03",
          name: "Practice: Searching for a Word in a File",
          title: "Practice: Searching for a Word in a File",
          description:
            "Read a file's contents and check whether it contains a target word, case-insensitively.",
          concept: "Case-Insensitive File Search",
          transcript:
            "This lesson practices searching a certificate.txt file for the word 'live', converting the file's content to lowercase before comparison to ensure the search isn't broken by mismatched capitalization, then using an if condition to report whether the word was found.",
          videoId: "VIDEO_ID_HERE",
          startSec: 642,
          endSec: 960,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D8_04",
          name: "FileNotFoundError and Write Mode",
          title: "FileNotFoundError and Write Mode",
          description:
            "Trigger a FileNotFoundError, then see how write mode automatically creates missing files.",
          concept: "FileNotFoundError and 'w' Mode",
          transcript:
            "This lesson triggers a FileNotFoundError by opening a non-existent file in read mode, a common interview topic, then contrasts this with write mode ('w'), which automatically creates the file if it doesn't already exist.",
          videoId: "VIDEO_ID_HERE",
          startSec: 960,
          endSec: 1285,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D8_05",
          name: "Write Mode vs. Append Mode",
          title: "Write Mode vs. Append Mode",
          description:
            "See that write mode overwrites file content while append mode adds to it.",
          concept: "'w' vs 'a' Modes",
          transcript:
            "This lesson demonstrates that write mode ('w') overwrites a file's existing content each time the script runs, while append mode ('a') adds new content without erasing what's already there — including using '\\n' to format multiple appended lines cleanly.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1285,
          endSec: 1612,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D8_06",
          name: "The 'x' Mode and Closing Files",
          title: "The 'x' Mode and Closing Files",
          description:
            "Use exclusive-create mode safely and understand why files must always be closed.",
          concept: "'x' Mode and File Closing",
          transcript:
            "This lesson covers the 'x' mode, which creates a new file but raises a FileExistsError if one already exists, making it a safe way to avoid accidental overwrites. It also stresses closing files after use to prevent memory issues and security risks.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1612,
          endSec: 1880,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D8_07",
          name: "The with Statement",
          title: "The with Statement",
          description:
            "Manage file resources automatically using the with keyword instead of manual open/close.",
          concept: "The with Keyword",
          transcript:
            "This lesson introduces the with statement as a safer alternative to manually opening and closing files, since it automatically closes the file even if an error occurs. It demonstrates opening a file with an alias (as f) and calling f.read() within that block.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1880,
          endSec: 2186,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D8_08",
          name: "Reading Line by Line with readline()",
          title: "Reading Line by Line with readline()",
          description:
            "Read a file one line at a time and understand how the file pointer advances.",
          concept: "readline() and the File Pointer",
          transcript:
            "This lesson introduces readline() for reading a file one line at a time, explaining that the file pointer moves forward with each call and that once the end of the file is reached, further reads return empty results.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2186,
          endSec: 2422,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D8_09",
          name: "readlines() and Practice Exercises",
          title: "readlines() and Practice Exercises",
          description:
            "Read all lines into a list with readlines() and use it to count lines in a file.",
          concept: "readlines() and Line Counting",
          transcript:
            "This lesson introduces readlines(), which returns a file's contents as a list of line strings, summarizing it alongside read() and readline(). Practice exercises follow: retrieving just the first line, and counting a file's total lines by combining readlines() with len().",
          videoId: "VIDEO_ID_HERE",
          startSec: 2422,
          endSec: 2812,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D8_10",
          name: "File Management with os and shutil",
          title: "File Management with os and shutil",
          description:
            "Rename and delete files using the os module, and preview shutil for copying.",
          concept: "os and shutil Modules",
          transcript:
            "This lesson introduces the shutil module for copying file contents and the os module for managing file paths and names, demonstrating how to rename a file with os.rename() and delete one with os.remove(), while stressing the need to verify a file exists first.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2812,
          endSec: 3132,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D8_11",
          name: "Handling Errors with try/except",
          title: "Handling Errors with try/except",
          description:
            "Wrap file operations in try/except blocks to handle missing files gracefully.",
          concept: "try/except for File Errors",
          transcript:
            "This lesson wraps file operations in try and except blocks to catch errors like FileNotFoundError without crashing the program, demonstrating how this kind of graceful error handling is essential for building robust, professional-grade code, and closes out the chapter.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3132,
          endSec: 3441,
          durationInMinutes: 5,
        },
      ],
    },
    {
      id: "day9",
      title: "Day 9 — Object-Oriented Programming",
      color: "#a855f7",
      levels: [
        {
          id: "PYTHON_BEGINNER_D9_01",
          name: "What Is Object-Oriented Programming",
          title: "What Is Object-Oriented Programming",
          description:
            "Understand OOP as a way of structuring code around real-world entities instead of a single sequence.",
          concept: "Introduction to OOP",
          transcript:
            "This lesson introduces Object-Oriented Programming as a style that structures code around real-world concepts using objects, classes, attributes, and behaviors, contrasting it with writing everything in one long sequential script.",
          videoId: "VIDEO_ID_HERE",
          startSec: 0,
          endSec: 235,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D9_02",
          name: "Classes and Objects as Blueprints",
          title: "Classes and Objects as Blueprints",
          description:
            "See how a class acts as a template and an object as a specific instance of it.",
          concept: "Classes as Templates",
          transcript:
            "This lesson explains a class as a blueprint — like a general 'Vehicle' class — while individual items such as a specific car or bike are objects created from that template. Examples like Animal and Student classes reinforce how abstract categories become concrete instances.",
          videoId: "VIDEO_ID_HERE",
          startSec: 235,
          endSec: 522,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D9_03",
          name: "Class Syntax and Attributes",
          title: "Class Syntax and Attributes",
          description:
            "Learn the class keyword, define attributes, and create an object with dot-notation access.",
          concept: "Class Syntax and Attributes",
          transcript:
            "This lesson covers the practical syntax for defining a class with the class keyword, describing attributes as variables that store an object's data, such as a student's name or roll number. It shows creating an object with ClassName() and accessing attributes via dot notation.",
          videoId: "VIDEO_ID_HERE",
          startSec: 522,
          endSec: 787,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D9_04",
          name: "Building the Vehicle Class",
          title: "Building the Vehicle Class",
          description:
            "Write a Vehicle class with color, fuel type, and mileage attributes, then instantiate it.",
          concept: "Practical Class Construction",
          transcript:
            "This lesson builds a Vehicle class from scratch with attributes like color, fuel type, and mileage, then creates an object from it — turning the theoretical idea of classes and objects into working, tangible code.",
          videoId: "VIDEO_ID_HERE",
          startSec: 787,
          endSec: 966,
          durationInMinutes: 3,
        },
        {
          id: "PYTHON_BEGINNER_D9_05",
          name: "Accessing Attributes Across Multiple Objects",
          title: "Accessing Attributes Across Multiple Objects",
          description:
            "Create several objects from one class and access each one's attributes independently.",
          concept: "Multiple Objects, Shared Class",
          transcript:
            "This lesson creates three Vehicle objects — car, bike, and airplane — and accesses each one's attributes with dot notation, showing that every object initially inherits the default values defined in the class.",
          videoId: "VIDEO_ID_HERE",
          startSec: 966,
          endSec: 1235,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D9_06",
          name: "Practice: Car and Laptop Classes",
          title: "Practice: Car and Laptop Classes",
          description:
            "Build simple classes with one or more attributes and instantiate objects with different values.",
          concept: "Class Practice Exercises",
          transcript:
            "This lesson practices building a Car class with a brand attribute and a Laptop class with multiple attributes like brand, RAM, and price, showing how to instantiate several objects and assign different values to some attributes while others keep the class default.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1235,
          endSec: 1611,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D9_07",
          name: "Instance Attributes vs. Class Defaults",
          title: "Instance Attributes vs. Class Defaults",
          description:
            "Understand how setting a value directly on an object overrides the class's default.",
          concept: "Instance Attributes Override Defaults",
          transcript:
            "This lesson explains that assigning a value directly to an object — like changing a car's color to pink — takes precedence over the class-level default, distinguishing instance attributes (unique per object) from class attributes (shared by all instances).",
          videoId: "VIDEO_ID_HERE",
          startSec: 1611,
          endSec: 1895,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D9_08",
          name: "The __init__ Constructor",
          title: "The __init__ Constructor",
          description:
            "Learn how __init__ runs automatically whenever a new object is created.",
          concept: "The __init__ Constructor",
          transcript:
            "This lesson introduces the __init__ constructor, a special method that runs automatically every time an object is created from a class, always requiring 'self' as its first parameter to reference the specific instance being built.",
          videoId: "VIDEO_ID_HERE",
          startSec: 1895,
          endSec: 2168,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D9_09",
          name: "Understanding self and Object Identity",
          title: "Understanding self and Object Identity",
          description:
            "See how self refers to the current object and how each instance gets its own memory location.",
          concept: "self and Memory Identity",
          transcript:
            "This lesson shows that printing 'self' yields the same memory location as printing the object itself, confirming self is a live reference to the current instance. It also demonstrates that separate objects, like Student1 and Student2, each get distinct memory addresses.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2168,
          endSec: 2466,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D9_10",
          name: "Passing Data into the Constructor",
          title: "Passing Data into the Constructor",
          description:
            "Extend __init__ to accept parameters and assign them to self attributes.",
          concept: "Constructor Parameters",
          transcript:
            "This lesson extends the __init__ method to accept extra parameters beyond self, then assigns those passed values to object attributes using self.attribute = value — the standard way to store instance-specific data like a student's name and course.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2466,
          endSec: 2822,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D9_11",
          name: "Defining Methods Inside a Class",
          title: "Defining Methods Inside a Class",
          description:
            "Distinguish methods (functions inside a class) from attributes (data inside a class).",
          concept: "Methods vs. Attributes",
          transcript:
            "This lesson defines methods as functions that live inside a class and let objects perform actions, distinct from attributes, which store data. A student example introduces a custom method that uses the object's own attribute data.",
          videoId: "VIDEO_ID_HERE",
          startSec: 2822,
          endSec: 3137,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D9_12",
          name: "Building the average() Method",
          title: "Building the average() Method",
          description:
            "Create a Student class that stores marks as a list and computes their average.",
          concept: "The average() Method",
          transcript:
            "This lesson builds a Student class whose constructor takes a name and a list of marks, then implements an average() method that loops through the marks to sum them and divide by their count — including fixing an initial bug from an uninitialized sum variable.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3137,
          endSec: 3475,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D9_13",
          name: "Static Methods and the Four Pillars of OOP",
          title: "Static Methods and the Four Pillars of OOP",
          description:
            "Learn @staticmethod and get a preview of encapsulation, abstraction, polymorphism, and inheritance.",
          concept: "Static Methods and OOP Pillars Overview",
          transcript:
            "This lesson introduces static methods, defined with the @staticmethod decorator, as utility functions that don't need the self parameter. It then previews the four foundational pillars of OOP — encapsulation, abstraction, polymorphism, and inheritance — as key interview topics.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3475,
          endSec: 3745,
          durationInMinutes: 4,
        },
        {
          id: "PYTHON_BEGINNER_D9_14",
          name: "Abstraction and Encapsulation",
          title: "Abstraction and Encapsulation",
          description:
            "Define abstraction as hiding complexity and encapsulation as bundling data and methods together.",
          concept: "Abstraction and Encapsulation",
          transcript:
            "This lesson defines abstraction as showing only essential details while hiding internal complexity, using app interfaces and car controls as examples. It then covers encapsulation as wrapping data and methods into a single class unit to keep code organized and protected.",
          videoId: "VIDEO_ID_HERE",
          startSec: 3745,
          endSec: 4061,
          durationInMinutes: 5,
        },
        {
          id: "PYTHON_BEGINNER_D9_15",
          name: "Inheritance and Polymorphism",
          title: "Inheritance and Polymorphism",
          description:
            "See how child classes reuse a parent's functionality and how the same method name can behave differently.",
          concept: "Inheritance and Polymorphism",
          transcript:
            "This lesson explains inheritance as a child class acquiring a parent class's properties and methods — demonstrated with a Vehicle parent and car, bike, and truck subclasses — then introduces polymorphism, where the same method name (like 'sound' or 'area') produces different behavior depending on the calling object.",
          videoId: "VIDEO_ID_HERE",
          startSec: 4061,
          endSec: 4398,
          durationInMinutes: 6,
        },
        {
          id: "PYTHON_BEGINNER_D9_16",
          name: "Course Recap and Career Advice",
          title: "Course Recap and Career Advice",
          description:
            "Review the four pillars of OOP and get guidance on moving from theory to real-world practice.",
          concept: "OOP Recap and Next Steps",
          transcript:
            "This lesson closes the chapter with a recap of classes, objects, attributes, methods, constructors, and the four pillars of OOP, then shifts to career advice — encouraging students to build portfolios, pursue internships, and contribute to open-source projects to gain practical experience.",
          videoId: "VIDEO_ID_HERE",
          startSec: 4398,
          endSec: 4631,
          durationInMinutes: 4,
        },
      ],
    },
  ],
};
