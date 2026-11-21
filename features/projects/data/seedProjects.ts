/**
 * Initial Starter Projects Seed Data
 * Designed following Lister Stage 1-2 Progression & Faded Scaffolding
 */

export const INITIAL_PROJECTS = [
  {
    slug: "guess-the-number-python",
    title: "Guess the Number Game",
    track: "python",
    language: "python3",
    tier: 2, // Guided Milestones
    difficulty: "beginner",
    description:
      "Build an interactive guessing game where the computer picks a secret number from 1 to 100, gives 'Too high' or 'Too low' clues, and counts your attempts.",
    estimatedMinutes: 25,
    xpReward: 0,
    prerequisiteRoadmapSlug: "python-beginner",
    tags: ["python", "loops", "conditionals", "random", "cli"],
    starterFiles: [
      {
        path: "main.py",
        isEntrypoint: true,
        isReadOnly: false,
        content: `# Guess the Number Game
import random

def play_game():
    print("Welcome to Guess the Number!")
    
    # Milestone 1: Pick a random secret number between 1 and 100
    secret_number = random.randint(1, 100)
    print("Secret target number chosen!")
    
    # TODO (Milestone 1): Prompt user for a guess, convert to int, and print it:
    # guess = int(input("Enter guess: "))
    # print(f"You guessed: {guess}")
    

if __name__ == "__main__":
    play_game()
`,
      },
    ],
    milestones: [
      {
        milestoneId: 1,
        title: "Generate Random Target & Take User Guess",
        brief:
          "Import Python's random library, pick a number between 1 and 100, and convert user input into an integer.",
        instructions: [
          "Import Python's built-in `random` module.",
          "Use `secret_number = random.randint(1, 100)` to pick the target.",
          "Prompt the user with `guess = int(input('Enter guess: '))`.",
          "Print the guess back: `print(f'You guessed: {guess}')`.",
        ],
        starterSnippet: `import random\nsecret_number = random.randint(1, 100)\nguess = int(input("Enter guess: "))\nprint(f"You guessed: {guess}")`,
        testCases: [
          {
            name: "Input & Conversion Logic",
            description: "Verifies user input is requested and converted to an integer",
            input: "42\n",
            requiredCodePattern: "input\\s*\\(",
            expectedOutput: "42",
            failureHint: "Use `guess = int(input('Enter guess: '))` and print your guess!",
            isHidden: false,
          },
        ],
        hints: [
          {
            level: 1,
            content: "Remember that input() returns a string! Use int(input(...)) to convert it to an integer.",
            xpCost: 0,
          },
          {
            level: 2,
            content: "Prompt the user like this: guess = int(input('Enter guess: '))",
            xpCost: 0,
          },
          {
            level: 3,
            content: "guess = int(input('Enter guess: '))\nprint(f'You guessed: {guess}')",
            xpCost: 0,
          },
        ],
        reflectionPrompt: "Why do we have to convert input() into an int in Python before comparing it?",
      },
      {
        milestoneId: 2,
        title: "Higher / Lower Clue Logic",
        brief:
          "Write conditional checks (if/elif/else) to tell the player if their guess is 'Too high!', 'Too low!', or 'Correct!'.",
        instructions: [
          "If `guess < secret_number`, print 'Too low!'.",
          "If `guess > secret_number`, print 'Too high!'.",
          "If `guess == secret_number`, print 'Correct!'.",
        ],
        starterSnippet: `if guess < secret_number:\n    print("Too low!")\nelif guess > secret_number:\n    print("Too high!")\nelse:\n    print("Correct!")`,
        testCases: [
          {
            name: "Comparison Logic (If/Elif/Else)",
            description: "Checks that conditional branches print feedback based on guess comparison",
            input: "1\n",
            requiredCodePattern: "if\\s+.*(guess|secret)",
            expectedOutput: "Too",
            failureHint: "Add conditional checks using `if guess < secret_number:` to print clues!",
            isHidden: false,
          },
        ],
        hints: [
          {
            level: 1,
            content: "Use an 'if / elif / else' structure to check the 3 possible outcomes.",
            xpCost: 0,
          },
          {
            level: 2,
            content: "Compare: if guess < secret_number: print('Too low!')",
            xpCost: 0,
          },
        ],
        reflectionPrompt: "What would happen if you used three separate 'if' statements instead of 'elif'?",
      },
      {
        milestoneId: 3,
        title: "Loop Until Won & Track Guess Count",
        brief:
          "Wrap your guessing logic in a `while` loop so the game continues until the player guesses correctly, and display total attempts.",
        instructions: [
          "Initialize `attempts = 0` before the loop.",
          "Use `while guess != secret_number:` or `while True:` and `break` when matched.",
          "Increment `attempts += 1` on every guess.",
          "Print the victory message with total attempts when guessed correctly.",
        ],
        starterSnippet: `attempts = 0\nwhile True:\n    guess = int(input())\n    attempts += 1\n    if guess == secret_number:\n        print(f"Correct in {attempts} tries!")\n        break`,
        testCases: [
          {
            name: "Game Loop Completion",
            description: "Ensures game finishes upon matching guess",
            input: "25\n50\n",
            requiredCodePattern: "while\\s+",
            expectedOutput: "Correct",
            failureHint: "Wrap your guessing logic in a `while` loop that continues until the secret number is matched!",
            isHidden: false,
          },
        ],
        hints: [
          {
            level: 1,
            content: "A `while True:` loop runs forever until you hit a `break` statement.",
            xpCost: 0,
          },
          {
            level: 2,
            content: "Inside the win condition: print('Correct!') followed by break.",
            xpCost: 0,
          },
        ],
        reflectionPrompt: "Why is a `while` loop better than a `for` loop for this game?",
      },
    ],
  },
  {
    slug: "interactive-cli-quiz-python",
    title: "Interactive Knowledge Quiz",
    track: "python",
    language: "python3",
    tier: 2,
    difficulty: "beginner",
    description:
      "Create a dynamic multi-question quiz program using Python lists and dictionaries that scores user responses and presents a final rank.",
    estimatedMinutes: 30,
    xpReward: 0,
    prerequisiteRoadmapSlug: "python-beginner",
    tags: ["python", "dictionaries", "lists", "functions"],
    starterFiles: [
      {
        path: "main.py",
        isEntrypoint: true,
        isReadOnly: false,
        content: `# Interactive CLI Quiz App
questions = [
    {
        "prompt": "What is the keyword to define a function in Python?",
        "options": ["A) func", "B) def", "C) function"],
        "answer": "B"
    }
]

def run_quiz():
    score = 0
    print("Welcome to the Ignitio Python Quiz!")
    # Complete milestones here...

if __name__ == "__main__":
    run_quiz()
`,
      },
    ],
    milestones: [
      {
        milestoneId: 1,
        title: "Iterate Questions & Prompt Answers",
        brief: "Loop over the questions list, display options, and read user choice.",
        instructions: [
          "Loop over each question dictionary using a for loop.",
          "Display question prompt and options.",
          "Capture user input in uppercase.",
        ],
        hints: [
          {
            level: 1,
            content: "Use for q in questions: print(q['prompt'])",
            xpCost: 0,
          },
        ],
        reflectionPrompt: "How does storing questions in dictionaries make it easier to add new questions?",
      },
      {
        milestoneId: 2,
        title: "Tally Score & Display Final Summary",
        brief: "Check the answer against question['answer'] and print a congratulatory summary.",
        instructions: [
          "Compare user answer to question['answer'].",
          "Increment score if correct.",
          "Print final percentage at end.",
        ],
        hints: [
          {
            level: 1,
            content: "if user_ans.strip().upper() == q['answer']: score += 1",
            xpCost: 0,
          },
        ],
        reflectionPrompt: "Why is it important to use .strip().upper() when validating user text input?",
      },
    ],
  },
];
