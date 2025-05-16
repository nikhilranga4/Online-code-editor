import { ProgrammingLanguage } from "@/components/language-selector";

export const predefinedSnippets: Record<ProgrammingLanguage, string> = {
  javascript: `// Welcome to JavaScript!
// This is a comment - the computer ignores this line

// Let's print a message:
console.log("Hello, World!");

// We can also define variables:
let name = "Coder";
console.log("Hello, " + name + "!");

// Let's try a simple function:
function greet(person) {
  return "Hello, " + person + "!";
}

// Now we'll call our function
let greeting = greet("Awesome Coder");
console.log(greeting);

// Try editing this code and running it!
`,

  python: `# Welcome to Python!
# This is a comment - the computer ignores this line

# Let's print a message:
print("Hello, World!")

# We can also define variables:
name = "Coder"
print("Hello, " + name + "!")

# Let's try a simple function:
def greet(person):
    return "Hello, " + person + "!"

# Now we'll call our function
greeting = greet("Awesome Coder")
print(greeting)

# Try editing this code and running it!
`,

  java: `// Welcome to Java!
// This is a comment - the computer ignores this line

// Java programs need a class and a main method
public class Main {
    public static void main(String[] args) {
        // Let's print a message:
        System.out.println("Hello, World!");
        
        // We can also define variables:
        String name = "Coder";
        System.out.println("Hello, " + name + "!");
        
        // Let's try a simple function:
        String greeting = greet("Awesome Coder");
        System.out.println(greeting);
    }
    
    // This is a method (function) in Java
    public static String greet(String person) {
        return "Hello, " + person + "!";
    }
}

// Try editing this code and running it!
`,

  html: `<!DOCTYPE html>
<html>
<head>
  <title>My First Web Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f0f0f0;
    }
    
    h1 {
      color: #2c3e50;
      text-align: center;
    }
    
    p {
      color: #34495e;
      line-height: 1.6;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello, World!</h1>
    <p>This is my first web page. I'm learning HTML and CSS!</p>
    <p>Here's what I'll learn:</p>
    <ul>
      <li>HTML - for structure</li>
      <li>CSS - for styling</li>
      <li>JavaScript - for interactivity</li>
    </ul>
  </div>
</body>
</html>
`
};