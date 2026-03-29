require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const sampleQuestions = [
  {
    title: 'Explain Event Delegation in JavaScript',
    description: 'What is event delegation and why is it useful?',
    type: 'theoretical',
    difficulty: 'medium',
    answerMarkdown: 'Event delegation allows you to avoid adding event listeners to specific nodes; instead, the event listener is added to one parent. That event listener analyzes bubbled events to find a match on child elements. \n\n**Benefits:**\n- Saves memory\n- Less code to manage\n- Works well with dynamically added elements',
    skills: ['javascript', 'frontend'],
    companies: ['amazon', 'google', 'meta'],
    domains: ['frontend']
  },
  {
    title: 'How does Garbage Collection work in Java?',
    description: 'Describe the garbage collection process in Java and name a few garbage collectors.',
    type: 'theoretical',
    difficulty: 'medium',
    answerMarkdown: 'Garbage collection in Java is the process of automatically freeing memory by deleting objects that are no longer reachable by any active thread. \n- Uses mostly Generational Collection (Young, Old, Permanent/Metaspace).\n- Popular GC types: Serial GC, Parallel GC, G1 GC, ZGC.',
    skills: ['java'],
    companies: ['amazon', 'microsoft'],
    domains: ['backend']
  },
  {
    title: 'Difference between malloc and calloc in C',
    description: 'Explain the difference between malloc and calloc with examples.',
    type: 'theoretical',
    difficulty: 'easy',
    answerMarkdown: '`malloc()` allocates a single block of requested memory but does not initialize it (contains garbage values).\n`calloc()` allocates multiple blocks of memory and initializes all allocated bytes to zero.\n\n```c\nint *ptr1 = (int*) malloc(5 * sizeof(int));\nint *ptr2 = (int*) calloc(5, sizeof(int));\n```',
    skills: ['c', 'c++'],
    companies: ['nvidia', 'microsoft'],
    domains: ['systems', 'backend']
  },
  {
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
    type: 'coding',
    difficulty: 'easy',
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n  \n}',
      java: 'class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    \n  }\n}',
      python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass'
    },
    solutionCode: {
      javascript: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
      java: 'class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for(let i=0; i<nums.length; i++) {\n      int x = target - nums[i];\n      if(map.containsKey(x)) return new int[]{map.get(x), i};\n      map.put(nums[i], i);\n    }\n    return new int[]{};\n  }\n}'
    },
    testCases: [
      { input: 'nums=[2,7,11,15], target=9', expectedOutput: '[0,1]', isHidden: false },
      { input: 'nums=[3,2,4], target=6', expectedOutput: '[1,2]', isHidden: false },
    ],
    skills: ['data-structures', 'javascript', 'java', 'python'],
    companies: ['amazon', 'google', 'microsoft', 'meta'],
    domains: ['backend', 'frontend']
  },
  {
    title: 'Explain React Hooks and their rules',
    description: 'What are React Hooks and what rules must be followed when using them?',
    type: 'theoretical',
    difficulty: 'medium',
    answerMarkdown: 'Hooks are functions that let you "hook into" React state and lifecycle features from function components. Key rules:\n1. Only call Hooks at the top level.\n2. Only call Hooks from React function components or custom Hooks.',
    skills: ['javascript', 'react'],
    companies: ['meta', 'airbnb', 'netflix'],
    domains: ['frontend']
  },
  {
    title: 'Fibonacci Number (Dynamic Programming)',
    description: 'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.',
    type: 'coding',
    difficulty: 'easy',
    starterCode: {
      javascript: 'function fib(n) {\n  \n}',
      python: 'def fib(n):\n    pass'
    },
    solutionCode: {
      javascript: 'function fib(n) {\n  if (n <= 1) return n;\n  let last = 1, lastlast = 0;\n  for (let i = 2; i <= n; i++) {\n    let current = last + lastlast;\n    lastlast = last;\n    last = current;\n  }\n  return last;\n}'
    },
    testCases: [
      { input: 'n=2', expectedOutput: '1' },
      { input: 'n=4', expectedOutput: '3' }
    ],
    skills: ['algorithms', 'javascript', 'python'],
    companies: ['google', 'microsoft', 'apple'],
    domains: ['backend']
  },
  {
    title: 'What is a SQL Injection and how to prevent it?',
    description: 'Explain the vulnerability and mitigation strategies.',
    type: 'theoretical',
    difficulty: 'hard',
    answerMarkdown: 'SQL injection is a web security vulnerability that allows an attacker to interfere with the queries that an application makes to its database. \n\n**Prevention:**\n- Use prepared statements (parameterized queries).\n- Use an ORM/Query Builder.\n- Input validation/sanitization.',
    skills: ['sql', 'security'],
    companies: ['jpmorgan', 'goldman-sachs'],
    domains: ['backend', 'security']
  }
];

async function seed() {
  try {
    require('dotenv').config(); // Should pick up backend/.env if run from backend dir
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Question.deleteMany();
    console.log('Cleared existing questions');

    await Question.insertMany(sampleQuestions);
    console.log('Inserted sample questions');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
