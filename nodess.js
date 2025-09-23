const TelegramBot = require('node-telegram-bot-api');
const Fuse = require('fuse.js');

// Bot token
const token = '8301401068:AAETk5oFOitCZYEmVtnEQTDMoutYl6SLgUs';
const bot = new TelegramBot(token, { polling: true });

// ---------------------------------------------------
// Define intent → function mapping with synonyms
// ---------------------------------------------------
const intents = {
    "variables": ["variable", "declare variable", "java variable example"],
    "datatypes": ["data type", "primitive types", "int float double"],
    "operators": ["operator", "arithmetic", "comparison", "logical", "relational"],
    "inputoutput": ["scanner", "input", "output", "read user"],
    "conditional": ["if else", "condition", "decision", "branching"],
    "loops": ["for loop", "while loop", "do while loop", "repeat", "loop", "iteration"],
    "arrays": ["array", "2d array", "matrix", "list"],
    "methods": ["method", "function", "procedure"],
    "classobject": ["class", "object", "constructor", "oop"],
    "factorial": ["factorial", "calculate factorial"],
    "evenodd": ["even odd", "check number", "odd or even", "parity"]
};

// ---------------------------------------------------
// Helper – NLP intent matcher using Fuse.js
// ---------------------------------------------------
function getIntent(userMessage) {
    const userMessageLower = userMessage.toLowerCase();
    
    let bestMatch = null;
    let highestScore = 0;
    
    // First try direct keyword matching
    for (const [intent, examples] of Object.entries(intents)) {
        for (const example of examples) {
            if (userMessageLower.includes(example.toLowerCase()) || 
                example.toLowerCase().includes(userMessageLower)) {
                const score = 90; // High score for direct matches
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = intent;
                }
            }
        }
    }
    
    // If no direct match, try fuzzy matching
    if (highestScore < 80) {
        for (const [intent, examples] of Object.entries(intents)) {
            const fuse = new Fuse(examples, {
                threshold: 0.6, // More lenient threshold
                includeScore: true,
                keys: [{ name: 'item', weight: 1 }] // Search the items directly
            });
            
            // Convert examples to objects for Fuse.js
            const searchData = examples.map(example => ({ item: example }));
            const fuseWithData = new Fuse(searchData, {
                threshold: 0.6,
                includeScore: true,
                keys: ['item']
            });
            
            const results = fuseWithData.search(userMessageLower);
            
            if (results.length > 0) {
                // Convert Fuse.js score (0 = perfect match, 1 = no match) to percentage
                const score = (1 - results[0].score) * 100;
                
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = intent;
                }
            }
        }
    }
    
    console.log(`Query: "${userMessage}" -> Intent: ${bestMatch}, Score: ${highestScore}`);
    
    if (highestScore > 40) { // Lower confidence threshold
        return bestMatch;
    }
    return null;
}

// ---------------------------------------------------
// Command Handlers with OUTPUTS
// ---------------------------------------------------
function sendFormattedMessage(chatId, title, javaCode, output) {
    const message = `*${title}*\n\n\`\`\`java\n${javaCode}\n\`\`\`\n✅ Output:\n\`\`\`\n${output}\n\`\`\``;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `👋 Welcome to *Java Tutor Bot* 🎓\nI can teach you Java with code + outputs!\n\nTry asking in plain English: \`show me a loop example\`\n`;
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Variables command
bot.onText(/\/variables/, (msg) => {
    const chatId = msg.chat.id;
    const javaCode = `int age = 20;
String name = "Java";
boolean isFun = true;

System.out.println(age);
System.out.println(name);
System.out.println(isFun);`;
    const output = `20
Java
true`;
    sendFormattedMessage(chatId, 'Java Variables Example:', javaCode, output);
});

// Data types command
bot.onText(/\/datatypes/, (msg) => {
    const chatId = msg.chat.id;
    const javaCode = `int a = 10;
double b = 3.14;
char c = 'A';
boolean flag = true;

System.out.println(a);
System.out.println(b);
System.out.println(c);
System.out.println(flag);`;
    const output = `10
3.14
A
true`;
    sendFormattedMessage(chatId, 'Data Types Example:', javaCode, output);
});

// Operators command
bot.onText(/\/operators/, (msg) => {
    const chatId = msg.chat.id;
    const javaCode = `int a = 5, b = 2;
System.out.println(a + b); 
System.out.println(a > b); 
System.out.println(a == b);`;
    const output = `7
true
false`;
    sendFormattedMessage(chatId, 'Operators Example:', javaCode, output);
});

// Input/Output command
bot.onText(/\/inputoutput/, (msg) => {
    const chatId = msg.chat.id;
    const javaCode = `import java.util.Scanner;
Scanner sc = new Scanner(System.in);
System.out.print("Enter name: ");
String name = sc.nextLine();
System.out.println("Welcome " + name);`;
    const output = `Enter name: John
Welcome John`;
    sendFormattedMessage(chatId, 'Input/Output Example:', javaCode, output);
});

// Conditional command
bot.onText(/\/conditional/, (msg) => {
    const chatId = msg.chat.id;
    const javaCode = `int num = 7;
if (num % 2 == 0) {
    System.out.println("Even");
} else {
    System.out.println("Odd");
}`;
    const output = "Odd";
    sendFormattedMessage(chatId, 'Conditional Example:', javaCode, output);
});

// Loops command
bot.onText(/\/loops/, (msg) => {
    const chatId = msg.chat.id;
    
    // For Loop
    const forLoop = `for (int i = 0; i < 3; i++) {
    System.out.println(i);
}`;
    const forOutput = `0
1
2`;
    
    // While Loop
    const whileLoop = `int i = 0;
while (i < 3) {
    System.out.println(i);
    i++;
}`;
    const whileOutput = `0
1
2`;
    
    // Do-While Loop
    const doWhileLoop = `int i = 0;
do {
    System.out.println(i);
    i++;
} while (i < 3);`;
    const doWhileOutput = `0
1
2`;
    
    sendFormattedMessage(chatId, 'For Loop Example:', forLoop, forOutput);
    sendFormattedMessage(chatId, 'While Loop Example:', whileLoop, whileOutput);
    sendFormattedMessage(chatId, 'Do-While Loop Example:', doWhileLoop, doWhileOutput);
});

// Arrays command
bot.onText(/\/arrays/, (msg) => {
    const chatId = msg.chat.id;
    const javaCode = `int[] nums = {1, 2, 3};
for (int n : nums) {
    System.out.println(n);
}`;
    const output = `1
2
3`;
    sendFormattedMessage(chatId, 'Array Example:', javaCode, output);
});

// Methods command
bot.onText(/\/methods/, (msg) => {
    const chatId = msg.chat.id;
    const javaCode = `public static void greet(String name) {
    System.out.println("Hello " + name);
}

greet("Java");`;
    const output = "Hello Java";
    sendFormattedMessage(chatId, 'Method Example:', javaCode, output);
});

// Class/Object command
bot.onText(/\/classobject/, (msg) => {
    const chatId = msg.chat.id;
    const javaCode = `class Car {
    String model;
    Car(String m) { model = m; }
    void display() { System.out.println("Model: " + model); }
}

Car c = new Car("Tesla");
c.display();`;
    const output = "Model: Tesla";
    sendFormattedMessage(chatId, 'Class/Object Example:', javaCode, output);
});

// Factorial command
bot.onText(/\/factorial/, (msg) => {
    const chatId = msg.chat.id;
    const javaCode = `int n = 5, fact = 1;
for (int i = 1; i <= n; i++) {
    fact *= i;
}
System.out.println("Factorial: " + fact);`;
    const output = "Factorial: 120";
    sendFormattedMessage(chatId, 'Factorial Example:', javaCode, output);
});

// Even/Odd command
bot.onText(/\/evenodd/, (msg) => {
    const chatId = msg.chat.id;
    const javaCode = `int num = 4;
if (num % 2 == 0) {
    System.out.println("Even");
} else {
    System.out.println("Odd");
}`;
    const output = "Even";
    sendFormattedMessage(chatId, 'EvenOdd Example:', javaCode, output);
});

// ---------------------------------------------------
// NLP Text Handler
// ---------------------------------------------------
bot.on('message', (msg) => {
    // Skip if it's a command
    if (msg.text && msg.text.startsWith('/')) {
        return;
    }
    
    const chatId = msg.chat.id;
    const userMsg = msg.text;
    
    if (!userMsg) return;
    
    const intent = getIntent(userMsg);
    
    const intentHandlers = {
        "variables": () => {
            const javaCode = `int age = 20;
String name = "Java";
boolean isFun = true;

System.out.println(age);
System.out.println(name);
System.out.println(isFun);`;
            const output = `20
Java
true`;
            sendFormattedMessage(chatId, 'Java Variables Example:', javaCode, output);
        },
        "datatypes": () => {
            const javaCode = `int a = 10;
double b = 3.14;
char c = 'A';
boolean flag = true;

System.out.println(a);
System.out.println(b);
System.out.println(c);
System.out.println(flag);`;
            const output = `10
3.14
A
true`;
            sendFormattedMessage(chatId, 'Data Types Example:', javaCode, output);
        },
        "operators": () => {
            const javaCode = `int a = 5, b = 2;
System.out.println(a + b); 
System.out.println(a > b); 
System.out.println(a == b);`;
            const output = `7
true
false`;
            sendFormattedMessage(chatId, 'Operators Example:', javaCode, output);
        },
        "inputoutput": () => {
            const javaCode = `import java.util.Scanner;
Scanner sc = new Scanner(System.in);
System.out.print("Enter name: ");
String name = sc.nextLine();
System.out.println("Welcome " + name);`;
            const output = `Enter name: John
Welcome John`;
            sendFormattedMessage(chatId, 'Input/Output Example:', javaCode, output);
        },
        "conditional": () => {
            const javaCode = `int num = 7;
if (num % 2 == 0) {
    System.out.println("Even");
} else {
    System.out.println("Odd");
}`;
            const output = "Odd";
            sendFormattedMessage(chatId, 'Conditional Example:', javaCode, output);
        },
        "loops": () => {
            const forLoop = `for (int i = 0; i < 3; i++) {
    System.out.println(i);
}`;
            const forOutput = `0
1
2`;
            
            const whileLoop = `int i = 0;
while (i < 3) {
    System.out.println(i);
    i++;
}`;
            const whileOutput = `0
1
2`;
            
            const doWhileLoop = `int i = 0;
do {
    System.out.println(i);
    i++;
} while (i < 3);`;
            const doWhileOutput = `0
1
2`;
            
            sendFormattedMessage(chatId, 'For Loop Example:', forLoop, forOutput);
            sendFormattedMessage(chatId, 'While Loop Example:', whileLoop, whileOutput);
            sendFormattedMessage(chatId, 'Do-While Loop Example:', doWhileLoop, doWhileOutput);
        },
        "arrays": () => {
            const javaCode = `int[] nums = {1, 2, 3};
for (int n : nums) {
    System.out.println(n);
}`;
            const output = `1
2
3`;
            sendFormattedMessage(chatId, 'Array Example:', javaCode, output);
        },
        "methods": () => {
            const javaCode = `public static void greet(String name) {
    System.out.println("Hello " + name);
}

greet("Java");`;
            const output = "Hello Java";
            sendFormattedMessage(chatId, 'Method Example:', javaCode, output);
        },
        "classobject": () => {
            const javaCode = `class Car {
    String model;
    Car(String m) { model = m; }
    void display() { System.out.println("Model: " + model); }
}

Car c = new Car("Tesla");
c.display();`;
            const output = "Model: Tesla";
            sendFormattedMessage(chatId, 'Class/Object Example:', javaCode, output);
        },
        "factorial": () => {
            const javaCode = `int n = 5, fact = 1;
for (int i = 1; i <= n; i++) {
    fact *= i;
}
System.out.println("Factorial: " + fact);`;
            const output = "Factorial: 120";
            sendFormattedMessage(chatId, 'Factorial Example:', javaCode, output);
        },
        "evenodd": () => {
            const javaCode = `int num = 4;
if (num % 2 == 0) {
    System.out.println("Even");
} else {
    System.out.println("Odd");
}`;
            const output = "Even";
            sendFormattedMessage(chatId, 'Even/Odd Example:', javaCode, output);
        }
    };
    
    if (intent && intentHandlers[intent]) {
        intentHandlers[intent]();
    } else {
        bot.sendMessage(chatId, "🤖 Sorry, I didn't understand. Try asking about loops, arrays, or factorials.");
    }
});

// Error handling
bot.on('polling_error', (error) => {
    console.log('Polling error:', error.code, error.message);
});

bot.on('error', (error) => {
    console.log('Bot error:', error);
});

// Test bot connection
bot.getMe().then((botInfo) => {
    console.log('✅ Java Tutor Bot is running!');
    console.log(`Bot name: ${botInfo.first_name}`);
    console.log(`Bot username: @${botInfo.username}`);
}).catch((error) => {
    console.log('❌ Bot connection failed:', error.message);
    process.exit(1);
});