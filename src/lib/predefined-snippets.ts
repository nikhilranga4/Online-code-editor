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
,

  cpp: `// Welcome to C++!
// This is a comment - the computer ignores this line

#include <iostream>

int main() {
    // Let's print a message:
    std::cout << "Hello, World!" << std::endl;
    
    // We can also define variables:
    std::string name = "Coder";
    std::cout << "Hello, " << name << "!" << std::endl;
    
    // Let's try a simple function:
    std::string greeting = greet("Awesome Coder");
    std::cout << greeting << std::endl;
    
    return 0;
}

// This is a function in C++
std::string greet(std::string person) {
    return "Hello, " + person + "!";
}
`,

  c: `// Welcome to C!
// This is a comment - the computer ignores this line

#include <stdio.h>
#include <string.h>

// Function declaration
char* greet(const char* person);

int main() {
    // Let's print a message:
    printf("Hello, World!\n");
    
    // We can also define variables:
    const char* name = "Coder";
    printf("Hello, %s!\n", name);
    
    // Let's try a simple function:
    char* greeting = greet("Awesome Coder");
    printf("%s\n", greeting);
    
    return 0;
}

// This is a function in C
char* greet(const char* person) {
    static char greeting[100];
    sprintf(greeting, "Hello, %s!", person);
    return greeting;
}
`,

  go: `// Welcome to Go!
// This is a comment - the computer ignores this line

package main

import "fmt"

// This is a function in Go
func greet(person string) string {
    return "Hello, " + person + "!"
}

func main() {
    // Let's print a message:
    fmt.Println("Hello, World!")
    
    // We can also define variables:
    name := "Coder"
    fmt.Println("Hello, " + name + "!")
    
    // Let's try a simple function:
    greeting := greet("Awesome Coder")
    fmt.Println(greeting)
}
`,

  ruby: `# Welcome to Ruby!
# This is a comment - the computer ignores this line

# Let's print a message:
puts "Hello, World!"

# We can also define variables:
name = "Coder"
puts "Hello, #{name}!"

# Let's try a simple function:
def greet(person)
  "Hello, #{person}!"
end

# Now we'll call our function
greeting = greet("Awesome Coder")
puts greeting

# Try editing this code and running it!
`,

  rust: `// Welcome to Rust!
// This is a comment - the computer ignores this line

// This is a function in Rust
fn greet(person: &str) -> String {
    format!("Hello, {}!", person)
}

fn main() {
    // Let's print a message:
    println!("Hello, World!");
    
    // We can also define variables:
    let name = "Coder";
    println!("Hello, {}!", name);
    
    // Let's try a simple function:
    let greeting = greet("Awesome Coder");
    println!("{}", greeting);
}
`,

  php: `<?php
// Welcome to PHP!
// This is a comment - the computer ignores this line

// Let's print a message:
echo "Hello, World!\n";

// We can also define variables:
$name = "Coder";
echo "Hello, $name!\n";

// Let's try a simple function:
function greet($person) {
    return "Hello, $person!";
}

// Now we'll call our function
$greeting = greet("Awesome Coder");
echo $greeting . "\n";

// Try editing this code and running it!
?>
`
};