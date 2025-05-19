import { ProgrammingLanguage } from "@/components/language-selector";

export const predefinedSnippets: Record<ProgrammingLanguage, string> = {

  python: `# Welcome to Python!
# This is a comment - the computer ignores this line

#Taking input From the user
Test = input("Enter your string:")
print(Test)

# Let's print a message:
print("Hello, World!")

# Try editing this code and running it!
`,
};