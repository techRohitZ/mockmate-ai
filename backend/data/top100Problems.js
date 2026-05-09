// Top 100 LeetCode-style coding problems for practice
const BASE_PROBLEMS = [
  {
    id: 'top_1',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    statement:
      'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to the target. You may assume each input has exactly one solution, and the same element cannot be used twice. You can return the answer in any order.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1]',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2]',
      },
    ],
    starterCode: `function twoSum(nums, target) {
  // TODO: Find indices of two numbers that add up to target
  // Use a hash map for O(n) time complexity
  return [];
}`,
    tags: ['Array', 'Hash Map'],
    timeLimitMinutes: 20,
  },
  {
    id: 'top_2',
    title: 'Reverse String',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      'Write a function that reverses a string. The input string is given as an array of characters. You must do this in-place with O(1) extra memory.',
    constraints: ['1 <= s.length <= 10^5', 's[i] is a printable ascii character'],
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: 'Reverse the array in-place',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: 'Reverse the array in-place',
      },
    ],
    starterCode: `function reverseString(s) {
  // TODO: Reverse the array in-place with O(1) space
  // Use two pointers approach
}`,
    tags: ['String', 'Two Pointers'],
    timeLimitMinutes: 15,
  },
  {
    id: 'top_3',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Strings',
    statement: 'Given a string s, find the length of the longest substring without repeating characters.',
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces',
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: "The answer is 'abc', with the length of 3",
      },
      { input: 's = "bbbbb"', output: '1', explanation: "The answer is 'b', with the length of 1" },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: "The answer is 'wke', with the length of 3",
      },
    ],
    starterCode: `function lengthOfLongestSubstring(s) {
  // TODO: Find longest substring without repeating characters
  // Use sliding window with hash map
  return 0;
}`,
    tags: ['String', 'Sliding Window', 'Hash Map'],
    timeLimitMinutes: 25,
  },
  {
    id: 'top_4',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    topic: 'Arrays',
    statement:
      'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000'],
    examples: [
      {
        input: 'nums1 = [1,3], nums2 = [2]',
        output: '2.00000',
        explanation: 'merged array = [1,2,3] and median is 2',
      },
      {
        input: 'nums1 = [1,2], nums2 = [3,4]',
        output: '2.50000',
        explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5',
      },
    ],
    starterCode: `function findMedianSortedArrays(nums1, nums2) {
  // TODO: Find median with O(log(m+n)) complexity
  // Use binary search approach
  return 0;
}`,
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    timeLimitMinutes: 40,
  },
  {
    id: 'top_5',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    topic: 'Trees',
    statement:
      'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
    constraints: [
      'The number of nodes in the tree is in the range [0, 2000]',
      '-1000 <= Node.val <= 1000',
    ],
    examples: [
      {
        input: 'root = [3,9,20,null,null,15,7]',
        output: '[[3],[9,20],[15,7]]',
        explanation: 'Level 0: [3], Level 1: [9,20], Level 2: [15,7]',
      },
      { input: 'root = [1]', output: '[[1]]', explanation: 'Single node tree' },
    ],
    starterCode: `function levelOrder(root) {
  // TODO: Return level-order traversal of tree
  // Use BFS with a queue
  return [];
}`,
    tags: ['Tree', 'BFS', 'Queue'],
    timeLimitMinutes: 25,
  },
  {
    id: 'top_6',
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    topic: 'Linked Lists',
    statement:
      'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500'],
    examples: [
      {
        input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        output: '[1,1,2,1,3,4,4,5,6]',
        explanation: 'All three lists merged into one sorted list',
      },
    ],
    starterCode: `function mergeKLists(lists) {
  // TODO: Merge k sorted lists efficiently
  // Consider divide and conquer or priority queue approach
  return null;
}`,
    tags: ['Linked List', 'Divide and Conquer', 'Heap'],
    timeLimitMinutes: 35,
  },
  {
    id: 'top_7',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stacks',
    statement:
      'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if: (1) Open brackets must be closed by the same type of brackets, (2) Open brackets must be closed in the correct order.',
    constraints: ["1 <= s.length <= 10^4", "s[i] = '(', ')', '{', '}', '[' or ']'"],
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Valid parentheses' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All brackets properly matched' },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Open bracket closed with wrong type',
      },
    ],
    starterCode: `function isValid(s) {
  // TODO: Check if parentheses are valid
  // Use a stack to match opening and closing brackets
  return true;
}`,
    tags: ['Stack', 'String'],
    timeLimitMinutes: 20,
  },
  {
    id: 'top_8',
    title: 'Symmetric Tree',
    difficulty: 'Easy',
    topic: 'Trees',
    statement:
      'Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).',
    constraints: [
      'The number of nodes in the tree is in the range [1, 1000]',
      '-100 <= Node.val <= 100',
    ],
    examples: [
      {
        input: 'root = [1,2,2,3,4,4,3]',
        output: 'true',
        explanation: 'Tree is symmetric',
      },
      {
        input: 'root = [1,2,2,null,3,null,3]',
        output: 'false',
        explanation: 'Tree is not symmetric',
      },
    ],
    starterCode: `function isSymmetric(root) {
  // TODO: Check if binary tree is symmetric
  // Use recursive approach with mirror checking
  return true;
}`,
    tags: ['Tree', 'DFS', 'BFS'],
    timeLimitMinutes: 25,
  },
  {
    id: 'top_9',
    title: 'House Robber',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. You cannot rob two adjacent houses. Return the maximum amount of money you can rob.',
    constraints: [
      '1 <= nums.length <= 100',
      '0 <= nums[i] <= 400',
      'You must not rob two adjacent houses',
    ],
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 and 3. Total = 1 + 3 = 4' },
      { input: 'nums = [2,7,9,3,1]', output: '9', explanation: 'Rob house 2 and 4. Total = 7 + 3 = 10' },
    ],
    starterCode: `function rob(nums) {
  // TODO: Find maximum money to rob without adjacent houses
  // Use dynamic programming approach
  return 0;
}`,
    tags: ['Dynamic Programming', 'Array'],
    timeLimitMinutes: 30,
  },
  {
    id: 'top_10',
    title: 'Word Ladder',
    difficulty: 'Hard',
    topic: 'Graphs',
    statement:
      'Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists. You must change exactly one letter in each step, and each transformed word must exist in the word list.',
    constraints: [
      '1 <= beginWord.length <= 10',
      'endWord.length == beginWord.length',
      '1 <= wordList.length <= 5000',
    ],
    examples: [
      {
        input:
          'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
        output: '5',
        explanation: '"hit" -> "hot" -> "dot" -> "dog" -> "cog"',
      },
    ],
    starterCode: `function ladderLength(beginWord, endWord, wordList) {
  // TODO: Find shortest transformation sequence
  // Use BFS to find shortest path
  return 0;
}`,
    tags: ['Graph', 'BFS', 'String'],
    timeLimitMinutes: 40,
  },
];

const GENERATED_TITLES = [
  'Best Time to Buy and Sell Stock',
  'Contains Duplicate',
  'Product of Array Except Self',
  'Maximum Subarray',
  'Binary Search',
  'Search in Rotated Sorted Array',
  'Climbing Stairs',
  'Coin Change',
  'Longest Increasing Subsequence',
  'Jump Game',
  'Number of Islands',
  'Clone Graph',
  'Course Schedule',
  'Pacific Atlantic Water Flow',
  'Kth Largest Element',
  'Top K Frequent Elements',
  'Group Anagrams',
  'Longest Palindromic Substring',
  'Minimum Window Substring',
  'Permutation in String',
  'Subarray Sum Equals K',
  'Merge Intervals',
  'Insert Interval',
  'Meeting Rooms II',
  'Spiral Matrix',
  'Set Matrix Zeroes',
  'Rotate Image',
  'Unique Paths',
  'Decode Ways',
  'Word Break',
  'Combination Sum',
  'Subsets',
  'Permutations',
  'N-Queens',
  'Generate Parentheses',
  'Daily Temperatures',
  'Min Stack',
  'Evaluate Reverse Polish Notation',
  'Sliding Window Maximum',
  'Trapping Rain Water',
  'Merge Two Sorted Lists',
  'Reverse Linked List',
  'Reorder List',
  'Detect Cycle in Linked List',
  'LRU Cache',
  'Copy List with Random Pointer',
  'Same Tree',
  'Maximum Depth of Binary Tree',
  'Validate Binary Search Tree',
  'Lowest Common Ancestor of BST',
  'Diameter of Binary Tree',
  'Balanced Binary Tree',
  'Serialize and Deserialize Binary Tree',
  'Construct Binary Tree from Traversals',
  'Path Sum',
  'Word Search',
  'Find Minimum in Rotated Sorted Array',
  'Median Finder',
  'Task Scheduler',
  'Design Twitter',
  'Network Delay Time',
  'Cheapest Flights Within K Stops',
  'Accounts Merge',
  'Redundant Connection',
  'Min Cost to Connect Points',
  'Find the Duplicate Number',
  'Longest Consecutive Sequence',
  '3Sum',
  'Container With Most Water',
  'Valid Sudoku',
  'Alien Dictionary',
  'Reconstruct Itinerary',
  'Gas Station',
  'Candy',
  'Partition Equal Subset Sum',
  'House Robber II',
  'Target Sum',
  'Longest Common Subsequence',
  'Edit Distance',
  'Distinct Subsequences',
  'Interleaving String',
  'Regular Expression Matching',
  'Palindromic Substrings',
  'Longest Repeating Character Replacement',
  'Find All Anagrams in a String',
  'K Closest Points to Origin',
  'Interval List Intersections',
  'Minimum Path Sum',
  'Dungeon Game',
  'Maximum Product Subarray',
];

const TOPIC_ROTATION = [
  'Arrays',
  'Strings',
  'Hash Maps',
  'Two Pointers',
  'Sliding Window',
  'Stacks',
  'Queues',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Linked Lists',
];

const difficultyForIndex = (idx) => {
  if (idx % 7 === 0) return 'Hard';
  if (idx % 2 === 0) return 'Medium';
  return 'Easy';
};

const generateProblem = (index) => {
  const idNumber = index + 11;
  const title = GENERATED_TITLES[index] || `Curated Practice ${idNumber}`;
  const topic = TOPIC_ROTATION[index % TOPIC_ROTATION.length];
  const difficulty = difficultyForIndex(index);

  return {
    id: `top_${idNumber}`,
    title,
    difficulty,
    topic,
    statement:
      `Solve ${title} with a clean and efficient approach. Explain your reasoning, choose appropriate data structures, and handle edge cases. Return the expected output exactly as defined in the examples. Focus on correctness first, then optimize time and space complexity.`,
    constraints: [
      '1 <= n <= 10^5',
      'Input values are within standard integer range',
      'Your solution should be efficient for large inputs',
    ],
    examples: [
      {
        input: 'input = sample_case_1',
        output: 'expected_output_1',
        explanation: 'Apply the core logic and compute the required result.',
      },
      {
        input: 'input = sample_case_2',
        output: 'expected_output_2',
        explanation: 'Validate edge cases and maintain correctness.',
      },
    ],
    starterCode: `function solve(input) {\n  // TODO: implement ${title}\n  return null;\n}`,
    tags: [topic, difficulty === 'Hard' ? 'Advanced' : 'Interview'],
    timeLimitMinutes: difficulty === 'Hard' ? 40 : difficulty === 'Medium' ? 30 : 20,
  };
};

const generatedProblems = Array.from({ length: 90 }, (_, idx) => generateProblem(idx));

export const TOP_100_PROBLEMS = [...BASE_PROBLEMS, ...generatedProblems];
