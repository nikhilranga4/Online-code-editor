import { User } from '@/types/user';

// API URL for backend services
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Learning path types and interfaces
export interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  starterCode: string;
  solutionCode: string;
  testCases: TestCase[];
  hints: string[];
  concepts: string[];
  timeEstimate: number; // in minutes
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  challenges: CodeChallenge[];
  prerequisites: string[];
  estimatedHours: number;
  concepts: string[];
  badgeUrl?: string;
}

export interface UserProgress {
  userId: string;
  completedChallenges: string[]; // Challenge IDs
  currentPathId?: string;
  currentChallengeId?: string;
  strengths: string[]; // Concepts the user is strong in
  weaknesses: string[]; // Concepts the user needs to work on
  recommendedPaths: string[]; // Path IDs
  lastActivity: Date;
  streakDays: number;
  totalPoints: number;
}

export interface CodeFeedback {
  score: number; // 0-100
  suggestions: string[];
  conceptsApplied: string[];
  conceptsMissing: string[];
  timeComplexity: string;
  spaceComplexity: string;
  readabilityScore: number; // 0-100
  bestPractices: {
    followed: string[];
    missed: string[];
  };
}

/**
 * AI Code Companion - Provides personalized learning paths, code challenges,
 * and feedback for users learning to code
 */
class AICodeCompanion {
  private user: User | null = null;
  private userProgress: UserProgress | null = null;
  private anonymousId: string = '';

  /**
   * Initialize the AI Code Companion with user data
   * Works for both authenticated and anonymous users
   */
  constructor(user: User | null) {
    this.user = user;
    
    // For anonymous users, create or retrieve an anonymous ID
    if (!user) {
      this.anonymousId = localStorage.getItem('anonymous-user-id') || this.generateAnonymousId();
      localStorage.setItem('anonymous-user-id', this.anonymousId);
      this.loadAnonymousProgress();
    } else {
      this.loadUserProgress();
    }
  }
  
  /**
   * Generate a random ID for anonymous users
   */
  private generateAnonymousId(): string {
    return 'anon-' + Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Load progress data for anonymous users from localStorage
   */
  private loadAnonymousProgress(): void {
    try {
      const savedProgress = localStorage.getItem(`anon-progress-${this.anonymousId}`);
      
      if (savedProgress) {
        this.userProgress = JSON.parse(savedProgress);
      } else {
        // Create new progress for anonymous user
        this.userProgress = {
          userId: this.anonymousId,
          completedChallenges: [],
          strengths: [],
          weaknesses: [],
          recommendedPaths: [],
          lastActivity: new Date(),
          streakDays: 0,
          totalPoints: 0
        };
        this.saveAnonymousProgress();
      }
    } catch (error) {
      console.error('Failed to load anonymous user progress:', error);
      // Create default progress
      this.userProgress = {
        userId: this.anonymousId,
        completedChallenges: [],
        strengths: [],
        weaknesses: [],
        recommendedPaths: [],
        lastActivity: new Date(),
        streakDays: 0,
        totalPoints: 0
      };
    }
  }
  
  /**
   * Save progress data for anonymous users to localStorage
   */
  private saveAnonymousProgress(): void {
    if (!this.userProgress) return;
    
    try {
      localStorage.setItem(
        `anon-progress-${this.anonymousId}`, 
        JSON.stringify(this.userProgress)
      );
    } catch (error) {
      console.error('Failed to save anonymous user progress:', error);
    }
  }

  /**
   * Load user progress data from the server
   */
  private async loadUserProgress(): Promise<void> {
    if (!this.user) return;

    try {
      const response = await fetch(`${API_URL}/api/learning/progress/${this.user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('online-compiler-token')}`
        }
      });

      if (response.ok) {
        this.userProgress = await response.json();
      } else {
        // Create new progress if none exists
        this.userProgress = {
          userId: this.user.id,
          completedChallenges: [],
          strengths: [],
          weaknesses: [],
          recommendedPaths: [],
          lastActivity: new Date(),
          streakDays: 0,
          totalPoints: 0
        };
        await this.saveUserProgress();
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  }

  /**
   * Save user progress to the server or localStorage
   */
  private async saveUserProgress(): Promise<void> {
    if (!this.userProgress) return;

    // For authenticated users, save to server
    if (this.user) {
      try {
        await fetch(`${API_URL}/api/learning/progress/${this.user.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('online-compiler-token')}`
          },
          body: JSON.stringify(this.userProgress)
        });
      } catch (error) {
        console.error('Failed to save user progress to server:', error);
      }
    } else {
      // For anonymous users, save to localStorage
      this.saveAnonymousProgress();
    }
  }

  /**
   * Get recommended learning paths based on user's skill level and interests
   */
  async getLearningPaths(): Promise<LearningPath[]> {
    try {
      const params = new URLSearchParams();
      
      if (this.userProgress) {
        params.append('strengths', this.userProgress.strengths.join(','));
        params.append('weaknesses', this.userProgress.weaknesses.join(','));
        params.append('completed', this.userProgress.completedChallenges.join(','));
      }

      // Prepare headers based on authentication status
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Only add authorization header if user is authenticated
      if (this.user) {
        const token = localStorage.getItem('online-compiler-token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      console.log('Fetching learning paths from:', `${API_URL}/api/learning/paths?${params.toString()}`);
      
      try {
        const response = await fetch(`${API_URL}/api/learning/paths?${params.toString()}`, { headers });

        if (response.ok) {
          const data = await response.json();
          console.log('Received learning paths:', data);
          return data;
        }
      } catch (fetchError) {
        console.warn('API fetch failed, using local fallback data:', fetchError);
      }
      
      // Return local fallback data if API fails
      console.log('Using local fallback learning paths');
      return this.getLocalLearningPaths();
    } catch (error) {
      console.error('Failed to get learning paths:', error);
      // Return local fallback data if any error occurs
      return this.getLocalLearningPaths();
    }
  }
  
  /**
   * Get local fallback learning paths when API is unavailable
   */
  private getLocalLearningPaths(): LearningPath[] {
    return [
      {
        id: 'python-basics',
        title: 'Python Fundamentals',
        description: 'Learn Python programming fundamentals with hands-on exercises and challenges.',
        language: 'python',
        level: 'beginner',
        prerequisites: [],
        estimatedHours: 20,
        concepts: ['variables', 'data types', 'functions', 'conditionals', 'loops', 'lists', 'dictionaries', 'file handling', 'error handling', 'modules'],
        challenges: [
          {
            id: 'py-hello-world',
            title: '1. Hello World',
            description: 'Write your first Python program to print a message to the console.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Write a program that prints "Hello, Python!" to the console\n\n',
            solutionCode: 'print("Hello, Python!")',
            testCases: [],
            hints: ['Use the print() function', 'Strings must be enclosed in quotes'],
            concepts: ['print', 'strings'],
            timeEstimate: 3
          },
          {
            id: 'py-variables',
            title: '2. Variables and Input',
            description: 'Learn how to use variables and get user input in Python.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a program that asks for the user\'s name and then greets them\n# Example: If the user enters "Alice", it should print "Hello, Alice!"\n\n',
            solutionCode: 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")',
            testCases: [],
            hints: ['Use input() to get user input', 'Use variables to store the input', 'Use f-strings for formatted output'],
            concepts: ['variables', 'input', 'f-strings'],
            timeEstimate: 5
          },
          {
            id: 'py-numbers',
            title: '3. Working with Numbers',
            description: 'Learn how to perform basic arithmetic operations in Python.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a program that calculates the area of a rectangle\n# Ask the user for the width and height, then print the area\n\n',
            solutionCode: 'width = float(input("Enter the width: "))\nheight = float(input("Enter the height: "))\narea = width * height\nprint(f"The area of the rectangle is {area} square units")',
            testCases: [],
            hints: ['Convert input to float using float()', 'Calculate area by multiplying width and height', 'Use f-strings to display the result'],
            concepts: ['arithmetic', 'type conversion', 'variables'],
            timeEstimate: 7
          },
          {
            id: 'py-conditionals',
            title: '4. Conditional Statements',
            description: 'Learn how to use if-else statements to make decisions in your code.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a program that checks if a number is positive, negative, or zero\n# Ask the user for a number and print the result\n\n',
            solutionCode: 'number = float(input("Enter a number: "))\n\nif number > 0:\n    print("The number is positive")\nelif number < 0:\n    print("The number is negative")\nelse:\n    print("The number is zero")',
            testCases: [],
            hints: ['Use if, elif, and else for different conditions', 'Compare the number with 0', 'Make sure to convert the input to a number'],
            concepts: ['conditionals', 'comparison operators'],
            timeEstimate: 8
          },
          {
            id: 'py-loops-1',
            title: '5. For Loops',
            description: 'Learn how to use for loops to repeat actions in Python.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a program that prints the multiplication table for a number\n# Ask the user for a number, then print its multiplication table from 1 to 10\n\n',
            solutionCode: 'number = int(input("Enter a number: "))\n\nfor i in range(1, 11):\n    result = number * i\n    print(f"{number} x {i} = {result}")',
            testCases: [],
            hints: ['Use range(1, 11) to iterate from 1 to 10', 'Calculate the product inside the loop', 'Use f-strings to format the output'],
            concepts: ['loops', 'range', 'multiplication'],
            timeEstimate: 8
          },
          {
            id: 'py-loops-2',
            title: '6. While Loops',
            description: 'Learn how to use while loops for conditional repetition.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a countdown program\n# Ask the user for a starting number, then count down to 0\n\n',
            solutionCode: 'count = int(input("Enter a starting number: "))\n\nwhile count >= 0:\n    print(count)\n    count -= 1\n\nprint("Blast off!")',
            testCases: [],
            hints: ['Use a while loop that continues as long as count >= 0', 'Decrement the counter in each iteration with count -= 1', 'Print a message after the loop ends'],
            concepts: ['while loops', 'decrement operators'],
            timeEstimate: 7
          },
          {
            id: 'py-lists-1',
            title: '7. Lists Basics',
            description: 'Learn how to create and manipulate lists in Python.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a program that builds a shopping list\n# Ask the user to enter 5 items, add them to a list, and then print the list\n\n',
            solutionCode: 'shopping_list = []\n\nfor i in range(5):\n    item = input(f"Enter item {i+1}: ")\n    shopping_list.append(item)\n\nprint("Your shopping list:")\nfor item in shopping_list:\n    print(f"- {item}")',
            testCases: [],
            hints: ['Create an empty list with shopping_list = []', 'Use append() to add items to the list', 'Use a loop to ask for each item', 'Use another loop to print each item'],
            concepts: ['lists', 'append', 'loops'],
            timeEstimate: 10
          },
          {
            id: 'py-lists-2',
            title: '8. List Operations',
            description: 'Learn how to perform various operations on lists.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a program that finds the maximum, minimum, and average of a list of numbers\n# Use this list: [12, 45, 78, 34, 56, 23, 89, 10]\n\n',
            solutionCode: 'numbers = [12, 45, 78, 34, 56, 23, 89, 10]\n\nmaximum = max(numbers)\nminimum = min(numbers)\naverage = sum(numbers) / len(numbers)\n\nprint(f"Maximum: {maximum}")\nprint(f"Minimum: {minimum}")\nprint(f"Average: {average:.2f}")',
            testCases: [],
            hints: ['Use max() to find the maximum value', 'Use min() to find the minimum value', 'Use sum() and len() to calculate the average', 'Format the average to 2 decimal places with :.2f'],
            concepts: ['lists', 'built-in functions', 'formatting'],
            timeEstimate: 8
          },
          {
            id: 'py-functions-1',
            title: '9. Basic Functions',
            description: 'Learn how to define and call functions in Python.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a function called greet that takes a name as a parameter and prints a greeting\n# Then call the function with different names\n\n',
            solutionCode: 'def greet(name):\n    print(f"Hello, {name}! Welcome to Python programming.")\n\ngreet("Alice")\ngreet("Bob")\ngreet("Charlie")',
            testCases: [],
            hints: ['Define a function using the def keyword', 'Add a parameter in the parentheses', 'Use f-strings to include the parameter in the output', 'Call the function with different arguments'],
            concepts: ['functions', 'parameters', 'function calls'],
            timeEstimate: 7
          },
          {
            id: 'py-functions-2',
            title: '10. Functions with Return Values',
            description: 'Learn how to create functions that return values.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a function called calculate_area that calculates the area of a rectangle\n# The function should take width and height as parameters and return the area\n# Test the function with different values\n\n',
            solutionCode: 'def calculate_area(width, height):\n    area = width * height\n    return area\n\n# Test the function\nprint(f"Area of rectangle with width 5 and height 10: {calculate_area(5, 10)}")\nprint(f"Area of rectangle with width 3 and height 4: {calculate_area(3, 4)}")\nprint(f"Area of square with side 6: {calculate_area(6, 6)}")',
            testCases: [],
            hints: ['Define a function with two parameters', 'Calculate the area inside the function', 'Use the return keyword to return the result', 'Call the function and use the returned value in print statements'],
            concepts: ['functions', 'return values', 'parameters'],
            timeEstimate: 8
          },
          {
            id: 'py-dictionaries',
            title: '11. Dictionaries',
            description: 'Learn how to use dictionaries to store key-value pairs in Python.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a program that stores information about a person in a dictionary\n# Include name, age, city, and favorite programming language\n# Then print each piece of information\n\n',
            solutionCode: 'person = {\n    "name": "John Doe",\n    "age": 25,\n    "city": "San Francisco",\n    "language": "Python"\n}\n\nprint(f"Name: {person[\"name\"]}\nAge: {person[\"age\"]}\nCity: {person[\"city\"]}\nFavorite Language: {person[\"language\"]}")',
            testCases: [],
            hints: ['Create a dictionary using curly braces {}', 'Use key-value pairs separated by colons', 'Access values using square brackets and the key', 'Use f-strings to format the output'],
            concepts: ['dictionaries', 'key-value pairs'],
            timeEstimate: 8
          },
          {
            id: 'py-string-methods',
            title: '12. String Methods',
            description: 'Learn how to manipulate strings using built-in string methods.',
            difficulty: 'beginner',
            language: 'python',
            starterCode: '# Create a program that manipulates a string in various ways\n# Ask the user for a sentence, then:\n# 1. Print the sentence in uppercase\n# 2. Print the sentence in lowercase\n# 3. Print the number of characters in the sentence\n# 4. Print the sentence with all "a" characters replaced with "*"\n\n',
            solutionCode: 'sentence = input("Enter a sentence: ")\n\nprint(f"Uppercase: {sentence.upper()}")\nprint(f"Lowercase: {sentence.lower()}")\nprint(f"Length: {len(sentence)} characters")\nprint(f"Replaced: {sentence.replace("a", "*")}")',
            testCases: [],
            hints: ['Use upper() to convert to uppercase', 'Use lower() to convert to lowercase', 'Use len() to get the length', 'Use replace() to replace characters'],
            concepts: ['string methods', 'string manipulation'],
            timeEstimate: 7
          },
          {
            id: 'py-error-handling',
            title: '13. Error Handling',
            description: 'Learn how to handle exceptions and errors in Python.',
            difficulty: 'intermediate',
            language: 'python',
            starterCode: '# Create a program that safely converts user input to a number\n# If the user enters something that\'s not a number, handle the error\n# and ask them to try again\n\n',
            solutionCode: 'while True:\n    try:\n        number = float(input("Enter a number: "))\n        print(f"You entered: {number}")\n        break  # Exit the loop if successful\n    except ValueError:\n        print("That\'s not a valid number. Please try again.")',
            testCases: [],
            hints: ['Use a try-except block to catch errors', 'Put the code that might cause an error in the try block', 'Handle the ValueError exception', 'Use a while loop to keep asking until valid input is received'],
            concepts: ['error handling', 'exceptions', 'try-except'],
            timeEstimate: 10
          },
          {
            id: 'py-file-read',
            title: '14. Reading Files',
            description: 'Learn how to read data from files in Python.',
            difficulty: 'intermediate',
            language: 'python',
            starterCode: '# Create a program that reads and displays the contents of a file\n# For this exercise, let\'s create a sample file content in a string variable\n# and then write code to process it as if it were read from a file\n\nfile_content = """Line 1: Python is awesome\nLine 2: File handling is important\nLine 3: This is a sample file\nLine 4: Learning is fun\nLine 5: Practice makes perfect"""\n\n# Now write code to process this content as if you read it from a file\n# Count the number of lines and print each line with its line number\n\n',
            solutionCode: 'file_content = """Line 1: Python is awesome\nLine 2: File handling is important\nLine 3: This is a sample file\nLine 4: Learning is fun\nLine 5: Practice makes perfect"""\n\n# Split the content into lines\nlines = file_content.split("\n")\n\n# Count the number of lines\nline_count = len(lines)\nprint(f"The file contains {line_count} lines.\n")\n\n# Print each line with its line number\nfor i, line in enumerate(lines, 1):\n    print(f"Line {i}: {line}")',
            testCases: [],
            hints: ['Use split("\n") to divide the content into lines', 'Use len() to count the number of lines', 'Use enumerate() to get both the index and value in a loop', 'Pass 1 as the second argument to enumerate() to start counting from 1'],
            concepts: ['file handling', 'string methods', 'enumerate'],
            timeEstimate: 10
          },
          {
            id: 'py-list-comprehension',
            title: '15. List Comprehensions',
            description: 'Learn how to use list comprehensions for concise list creation.',
            difficulty: 'intermediate',
            language: 'python',
            starterCode: '# Create a program that uses list comprehensions to:\n# 1. Create a list of squares of numbers from 1 to 10\n# 2. Create a list of even numbers from 1 to 20\n# 3. Create a list of strings that are longer than 5 characters from a given list\n\nwords = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape"]\n\n',
            solutionCode: '# List of squares from 1 to 10\nsquares = [x**2 for x in range(1, 11)]\nprint(f"Squares: {squares}")\n\n# List of even numbers from 1 to 20\neven_numbers = [x for x in range(1, 21) if x % 2 == 0]\nprint(f"Even numbers: {even_numbers}")\n\n# List of words longer than 5 characters\nwords = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape"]\nlong_words = [word for word in words if len(word) > 5]\nprint(f"Long words: {long_words}")',
            testCases: [],
            hints: ['Use [expression for item in iterable] syntax', 'Add conditions with [expression for item in iterable if condition]', 'Use x**2 for squares', 'Use x % 2 == 0 to check for even numbers', 'Use len(word) > 5 to check word length'],
            concepts: ['list comprehensions', 'conditionals', 'iteration'],
            timeEstimate: 12
          },
          {
            id: 'py-functions-advanced',
            title: '16. Advanced Functions',
            description: 'Learn about default parameters, keyword arguments, and *args/**kwargs.',
            difficulty: 'intermediate',
            language: 'python',
            starterCode: '# Create a function called print_info that can accept any number of arguments\n# The function should have parameters for name and age with default values\n# It should also accept additional keyword arguments\n# Print all the information in a formatted way\n\n',
            solutionCode: 'def print_info(name="Unknown", age=0, *args, **kwargs):\n    print(f"Name: {name}")\n    print(f"Age: {age}")\n    \n    if args:\n        print("Additional information:")\n        for arg in args:\n            print(f"- {arg}")\n    \n    if kwargs:\n        print("Key details:")\n        for key, value in kwargs.items():\n            print(f"- {key}: {value}")\n\n# Test the function with different arguments\nprint_info()  # Using defaults\nprint("---")\nprint_info("Alice", 30)  # Positional arguments\nprint("---")\nprint_info("Bob", 25, "Developer", "Python Expert")  # With additional args\nprint("---")\nprint_info("Charlie", 35, job="Data Scientist", city="New York")  # With kwargs',
            testCases: [],
            hints: ['Use default parameter values with name="Unknown", age=0', 'Use *args to collect additional positional arguments', 'Use **kwargs to collect additional keyword arguments', 'Iterate through args and kwargs.items() to display all values'],
            concepts: ['default parameters', 'args', 'kwargs', 'function parameters'],
            timeEstimate: 15
          },
          {
            id: 'py-classes',
            title: '17. Classes and Objects',
            description: 'Learn how to create and use classes in Python.',
            difficulty: 'intermediate',
            language: 'python',
            starterCode: '# Create a class called Rectangle with:\n# - Attributes for width and height\n# - Methods to calculate area and perimeter\n# - A method to display information about the rectangle\n# Then create some rectangle objects and test the methods\n\n',
            solutionCode: 'class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    \n    def calculate_area(self):\n        return self.width * self.height\n    \n    def calculate_perimeter(self):\n        return 2 * (self.width + self.height)\n    \n    def display_info(self):\n        print(f"Rectangle: {self.width} x {self.height}")\n        print(f"Area: {self.calculate_area()}")\n        print(f"Perimeter: {self.calculate_perimeter()}")\n\n# Create rectangle objects\nrect1 = Rectangle(5, 10)\nrect2 = Rectangle(3, 4)\n\n# Test methods\nrect1.display_info()\nprint("---")\nrect2.display_info()',
            testCases: [],
            hints: ['Define a class with the class keyword', 'Use __init__ for the constructor', 'Use self to refer to the instance', 'Create methods that operate on the instance attributes', 'Create objects with ClassName(arguments)'],
            concepts: ['classes', 'objects', 'methods', 'attributes'],
            timeEstimate: 15
          },
          {
            id: 'py-modules',
            title: '18. Modules and Imports',
            description: 'Learn how to use built-in modules in Python.',
            difficulty: 'intermediate',
            language: 'python',
            starterCode: '# Create a program that uses various built-in modules:\n# - math: Calculate square root and pi\n# - random: Generate random numbers\n# - datetime: Display current date and time\n# - sys: Show Python version\n\n',
            solutionCode: 'import math\nimport random\nimport datetime\nimport sys\n\n# Using math module\nprint(f"Square root of 16: {math.sqrt(16)}")\nprint(f"Value of pi: {math.pi}")\n\n# Using random module\nprint(f"Random number between 1 and 10: {random.randint(1, 10)}")\nprint(f"Random choice from list: {random.choice(["apple", "banana", "cherry"])}")\n\n# Using datetime module\nnow = datetime.datetime.now()\nprint(f"Current date and time: {now.strftime("%Y-%m-%d %H:%M:%S")}")\n\n# Using sys module\nprint(f"Python version: {sys.version}")',
            testCases: [],
            hints: ['Use import statements at the top of the file', 'Access module functions with module_name.function_name()', 'Use math.sqrt() for square root', 'Use random.randint() for random integers', 'Use datetime.datetime.now() for current time', 'Use sys.version for Python version'],
            concepts: ['modules', 'imports', 'built-in functions'],
            timeEstimate: 10
          },
          {
            id: 'py-data-analysis',
            title: '19. Simple Data Analysis',
            description: 'Learn how to perform basic data analysis in Python.',
            difficulty: 'intermediate',
            language: 'python',
            starterCode: '# Create a program that analyzes a dataset of student scores\n# Calculate the average, highest, and lowest scores\n# Count how many students scored above 90\n# Display a simple text-based histogram of score ranges\n\nscores = [85, 92, 78, 95, 88, 76, 90, 93, 65, 98, 79, 88, 82, 91, 94, 77, 84, 88, 90, 95]\n\n',
            solutionCode: 'scores = [85, 92, 78, 95, 88, 76, 90, 93, 65, 98, 79, 88, 82, 91, 94, 77, 84, 88, 90, 95]\n\n# Basic statistics\naverage_score = sum(scores) / len(scores)\nhighest_score = max(scores)\nlowest_score = min(scores)\n\nprint(f"Student Score Analysis")\nprint(f"---------------------")\nprint(f"Number of students: {len(scores)}")\nprint(f"Average score: {average_score:.2f}")\nprint(f"Highest score: {highest_score}")\nprint(f"Lowest score: {lowest_score}")\n\n# Count scores above 90\nabove_90 = len([score for score in scores if score >= 90])\nprint(f"Students scoring 90 or above: {above_90} ({(above_90/len(scores)*100):.1f}%)")\n\n# Create a simple histogram\nprint("\nScore Distribution:")\nranges = [(0, 59), (60, 69), (70, 79), (80, 89), (90, 100)]\nfor start, end in ranges:\n    count = len([score for score in scores if start <= score <= end])\n    stars = "*" * count\n    print(f"{start}-{end}: {stars} ({count})")',
            testCases: [],
            hints: ['Use sum() and len() for average', 'Use max() and min() for highest and lowest', 'Use list comprehension with a condition to count scores above 90', 'Create ranges for the histogram', 'Use string multiplication to create the histogram bars'],
            concepts: ['data analysis', 'statistics', 'list operations', 'visualization'],
            timeEstimate: 15
          },
        ],
        badgeUrl: 'https://img.icons8.com/color/96/000000/python.png'
      }
    ];
  }

  /**
   * Get a specific learning path by ID
   */
  async getLearningPath(pathId: string): Promise<LearningPath | null> {
    try {
      // Prepare headers based on authentication status
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Only add authorization header if user is authenticated
      if (this.user) {
        const token = localStorage.getItem('online-compiler-token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      console.log('Fetching learning path:', `${API_URL}/api/learning/paths/${pathId}`);
      
      const response = await fetch(`${API_URL}/api/learning/paths/${pathId}`, { headers });

      if (response.ok) {
        const data = await response.json();
        console.log('Received learning path:', data);
        return data;
      }
      
      console.error('Failed to get learning path, status:', response.status);
      return null;
    } catch (error) {
      console.error(`Failed to get learning path ${pathId}:`, error);
      return null;
    }
  }

  /**
   * Get a specific code challenge by ID
   */
  async getCodeChallenge(challengeId: string): Promise<CodeChallenge | null> {
    try {
      // Prepare headers based on authentication status
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Only add authorization header if user is authenticated
      if (this.user) {
        const token = localStorage.getItem('online-compiler-token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      console.log('Fetching code challenge:', `${API_URL}/api/learning/challenges/${challengeId}`);
      
      try {
        const response = await fetch(`${API_URL}/api/learning/challenges/${challengeId}`, { headers });

        if (response.ok) {
          const data = await response.json();
          console.log('Received code challenge:', data);
          return data;
        }
      } catch (fetchError) {
        console.warn('API fetch failed, using local fallback data:', fetchError);
      }
      
      // Return local fallback data if API fails
      console.log('Using local fallback challenge data');
      return this.getLocalCodeChallenge(challengeId);
    } catch (error) {
      console.error(`Failed to get challenge ${challengeId}:`, error);
      // Return local fallback data if any error occurs
      return this.getLocalCodeChallenge(challengeId);
    }
  }
  
  /**
   * Get a local fallback code challenge by ID
   */
  private getLocalCodeChallenge(challengeId: string): CodeChallenge | null {
    // Get all learning paths
    const paths = this.getLocalLearningPaths();
    
    // Search for the challenge in all paths
    for (const path of paths) {
      for (const challenge of path.challenges) {
        if (challenge.id === challengeId) {
          return challenge;
        }
      }
    }
    
    return null;
  }

  /**
   * Submit a solution for a code challenge and get AI feedback
   */
  async submitChallengeSolution(challengeId: string, code: string): Promise<CodeFeedback> {
    try {
      console.log('Submitting solution for challenge:', challengeId);
      console.log('Code length:', code.length, 'characters');
      
      // Prepare headers based on authentication status
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Only add authorization header if token exists
      const token = localStorage.getItem('online-compiler-token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using authentication token');
      } else {
        console.log('No authentication token found, submitting as anonymous user');
      }
      
      const url = `${API_URL}/api/learning/challenges/${challengeId}/submit`;
      console.log('Submitting to URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code })
      });

      if (response.ok) {
        const feedback = await response.json();
        
        // Update user progress if the user is logged in
        if (this.user && this.userProgress) {
          // Add to completed challenges if score is above 70
          if (feedback.score >= 70 && !this.userProgress.completedChallenges.includes(challengeId)) {
            this.userProgress.completedChallenges.push(challengeId);
            this.userProgress.totalPoints += Math.floor(feedback.score);
            this.userProgress.lastActivity = new Date();
            
            // Update strengths and weaknesses based on feedback
            feedback.conceptsApplied.forEach((concept: string) => {
              if (!this.userProgress!.strengths.includes(concept)) {
                this.userProgress!.strengths.push(concept);
              }
            });
            
            feedback.conceptsMissing.forEach((concept: string) => {
              if (!this.userProgress!.weaknesses.includes(concept)) {
                this.userProgress!.weaknesses.push(concept);
              }
            });
            
            await this.saveUserProgress();
          }
        }
        
        return feedback;
      }
      
      return {
        score: 0,
        suggestions: ['Failed to submit solution. Please try again.'],
        conceptsApplied: [],
        conceptsMissing: [],
        timeComplexity: 'Unknown',
        spaceComplexity: 'Unknown',
        readabilityScore: 0,
        bestPractices: {
          followed: [],
          missed: []
        }
      };
    } catch (error) {
      console.error('Failed to submit challenge solution:', error);
      return {
        score: 0,
        suggestions: ['An error occurred while submitting your solution.'],
        conceptsApplied: [],
        conceptsMissing: [],
        timeComplexity: 'Unknown',
        spaceComplexity: 'Unknown',
        readabilityScore: 0,
        bestPractices: {
          followed: [],
          missed: []
        }
      };
    }
  }

  /**
   * Get a hint for the current challenge
   */
  async getHint(challengeId: string, hintIndex: number): Promise<string | null> {
    try {
      const challenge = await this.getCodeChallenge(challengeId);
      if (challenge && challenge.hints.length > hintIndex) {
        return challenge.hints[hintIndex];
      }
      return null;
    } catch (error) {
      console.error('Failed to get hint:', error);
      return null;
    }
  }

  /**
   * Get personalized code suggestions based on the current code
   */
  async getCodeSuggestions(code: string, language: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_URL}/api/learning/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('online-compiler-token')}`
        },
        body: JSON.stringify({ code, language })
      });

      if (response.ok) {
        const { suggestions } = await response.json();
        return suggestions;
      }
      return [];
    } catch (error) {
      console.error('Failed to get code suggestions:', error);
      return [];
    }
  }

  /**
   * Get user progress data for both authenticated and anonymous users
   */
  getUserProgress(): UserProgress | null {
    return this.userProgress;
  }
  
  /**
   * Update user progress with completed challenge
   */
  async updateProgress(challengeId: string, completed: boolean = true): Promise<void> {
    if (!this.userProgress) return;
    
    // Update the progress
    if (completed && !this.userProgress.completedChallenges.includes(challengeId)) {
      this.userProgress.completedChallenges.push(challengeId);
      this.userProgress.totalPoints += 10; // Award points for completion
      this.userProgress.lastActivity = new Date();
    }
    
    // Save progress (handles both authenticated and anonymous users)
    await this.saveUserProgress();
  }

  /**
   * Update the current user
   */
  setUser(user: User | null): void {
    this.user = user;
    if (user) {
      this.loadUserProgress();
    } else {
      this.userProgress = null;
    }
  }
}

// Export a singleton instance
let instance: AICodeCompanion | null = null;

export function getAICodeCompanion(user: User | null): AICodeCompanion {
  if (!instance) {
    instance = new AICodeCompanion(user);
  } else if (instance.getUserProgress()?.userId !== user?.id) {
    instance.setUser(user);
  }
  return instance;
}
