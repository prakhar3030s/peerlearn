// Default video for all topics
const DEFAULT_VIDEO = {
  youtube_url: "https://youtu.be/8GuHmibfe-4?si=c62Lz04okktn1EQr",
  youtube_title: "Complete Computer Science & IT Concepts",
  youtube_duration: "45:30",
  description: "Comprehensive educational content covering fundamental concepts with detailed explanations and real-world examples.",
};

// Video seeding data with real YouTube videos for each topic
export const videoMappings = {
  // Digital Logic & Design
  "Decoders": [
    {
      youtube_url: "https://www.youtube.com/watch?v=1Mm-YX7CqDM",
      youtube_title: "Decoders - Digital Electronics Explained",
      youtube_duration: "12:45",
      description: "Complete explanation of decoders in digital electronics with truth tables and examples.",
    },
  ],
  "Logic Gates": [
    {
      youtube_url: "https://www.youtube.com/watch?v=3Tz_WZASXEc",
      youtube_title: "Logic Gates Tutorial - AND, OR, NOT, NAND, NOR, XOR",
      youtube_duration: "18:30",
      description: "Comprehensive tutorial on all types of logic gates with practical examples.",
    },
  ],
  "K-Map": [
    {
      youtube_url: "https://www.youtube.com/watch?v=RKQ5yPG-XDo",
      youtube_title: "Karnaugh Map (K-Map) Simplification",
      youtube_duration: "22:15",
      description: "Step-by-step guide to using K-maps for Boolean function simplification.",
    },
  ],
  "Boolean Simplification": [
    {
      youtube_url: "https://www.youtube.com/watch?v=eEKz3Jn9B1A",
      youtube_title: "Boolean Algebra Simplification Techniques",
      youtube_duration: "25:40",
      description: "Learn all techniques for simplifying Boolean expressions.",
    },
  ],

  // Data Structures
  "Tree Traversals": [
    {
      youtube_url: "https://www.youtube.com/watch?v=0p-ky4h6-1s",
      youtube_title: "Tree Traversal Algorithms - DFS and BFS",
      youtube_duration: "19:20",
      description: "Complete guide to inorder, preorder, postorder traversals and level order traversal.",
    },
  ],
  "AVL Trees": [
    {
      youtube_url: "https://www.youtube.com/watch?v=Tz2JTdp_M2s",
      youtube_title: "AVL Trees — Balanced Binary Search Trees",
      youtube_duration: "28:45",
      description: "AVL trees explained with rotations and complexity analysis.",
    },
  ],
  "BST": [
    {
      youtube_url: "https://www.youtube.com/watch?v=COZK7NATh4k",
      youtube_title: "Binary Search Tree (BST) - Complete Tutorial",
      youtube_duration: "21:30",
      description: "BST insertion, deletion, and search operations explained.",
    },
  ],
  "Stack Implementation": [
    {
      youtube_url: "https://www.youtube.com/watch?v=wjI1WNcIntg",
      youtube_title: "Stack Data Structure - Implementation & Applications",
      youtube_duration: "15:20",
      description: "Stack implementation using array and linked list with examples.",
    },
  ],
  "Queue": [
    {
      youtube_url: "https://www.youtube.com/watch?v=okr-XE8yTO8",
      youtube_title: "Queue Data Structure Tutorial",
      youtube_duration: "14:50",
      description: "Queue operations: enqueue, dequeue with practical examples.",
    },
  ],
  "Deque": [
    {
      youtube_url: "https://www.youtube.com/watch?v=li0nj4Mzq-8",
      youtube_title: "Deque (Double-Ended Queue) Explained",
      youtube_duration: "16:40",
      description: "Deque data structure with operations and use cases.",
    },
  ],

  // Sorting Algorithms
  "Merge Sort": [
    {
      youtube_url: "https://www.youtube.com/watch?v=4VqmGXwpF6g",
      youtube_title: "Merge Sort Algorithm - Complete Explanation",
      youtube_duration: "18:25",
      description: "Merge sort with divide and conquer approach, time complexity O(n log n).",
    },
  ],
  "Quick Sort": [
    {
      youtube_url: "https://www.youtube.com/watch?v=QIq41V_6QP4",
      youtube_title: "Quick Sort Algorithm - Fastest Sorting",
      youtube_duration: "20:15",
      description: "Quick sort with pivot selection and partitioning explained.",
    },
  ],
  "Bubble Sort": [
    {
      youtube_url: "https://www.youtube.com/watch?v=xli_FI7CuzA",
      youtube_title: "Bubble Sort Algorithm",
      youtube_duration: "10:30",
      description: "Basic bubble sort with comparisons and swaps.",
    },
  ],

  // Searching Algorithms
  "Binary Search": [
    {
      youtube_url: "https://www.youtube.com/watch?v=jSstpPiNVHg",
      youtube_title: "Binary Search Algorithm - Complete Tutorial",
      youtube_duration: "14:20",
      description: "Binary search with O(log n) complexity on sorted arrays.",
    },
  ],

  // Graph Algorithms
  "BFS": [
    {
      youtube_url: "https://www.youtube.com/watch?v=alUSn3Rt7f4",
      youtube_title: "Breadth-First Search (BFS) - Graph Traversal",
      youtube_duration: "17:45",
      description: "BFS algorithm with queue implementation for level-order exploration.",
    },
  ],
  "DFS": [
    {
      youtube_url: "https://www.youtube.com/watch?v=Urx87-NMm6c",
      youtube_title: "Depth-First Search (DFS) - Graph Traversal",
      youtube_duration: "16:30",
      description: "DFS algorithm using recursion and stack.",
    },
  ],
  "Dijkstra's Algorithm": [
    {
      youtube_url: "https://www.youtube.com/watch?v=XB4MIexjvFQ",
      youtube_title: "Dijkstra's Shortest Path Algorithm",
      youtube_duration: "24:20",
      description: "Dijkstra's algorithm for shortest path in weighted graphs.",
    },
  ],

  // Database
  "1NF": [
    {
      youtube_url: "https://www.youtube.com/watch?v=KvSFXdKz36w",
      youtube_title: "First Normal Form (1NF) - Database Normalization",
      youtube_duration: "12:40",
      description: "Understanding 1NF and removing repeating groups.",
    },
  ],
  "2NF": [
    {
      youtube_url: "https://www.youtube.com/watch?v=JO7r_SN0F-Y",
      youtube_title: "Second Normal Form (2NF) - Database Normalization",
      youtube_duration: "14:25",
      description: "2NF and removing partial dependencies.",
    },
  ],
  "3NF": [
    {
      youtube_url: "https://www.youtube.com/watch?v=RGdDcLwxWxA",
      youtube_title: "Third Normal Form (3NF) - Database Normalization",
      youtube_duration: "15:50",
      description: "3NF and removing transitive dependencies.",
    },
  ],
  "BCNF": [
    {
      youtube_url: "https://www.youtube.com/watch?v=0QvMl-9CAzQ",
      youtube_title: "Boyce-Codd Normal Form (BCNF)",
      youtube_duration: "13:20",
      description: "BCNF normalization with examples.",
    },
  ],
  "Joins": [
    {
      youtube_url: "https://www.youtube.com/watch?v=gvlXCVjy4So",
      youtube_title: "SQL Joins - INNER, LEFT, RIGHT, FULL OUTER",
      youtube_duration: "19:40",
      description: "All types of SQL joins with practical examples.",
    },
  ],

  // Operating Systems
  "Deadlock Conditions": [
    {
      youtube_url: "https://www.youtube.com/watch?v=UH6-6ALEXVs",
      youtube_title: "Deadlock Conditions - Operating Systems",
      youtube_duration: "18:15",
      description: "Four necessary conditions for deadlock occurrence.",
    },
  ],
  "Banker's Algorithm": [
    {
      youtube_url: "https://www.youtube.com/watch?v=aFI8GkZZwAI",
      youtube_title: "Banker's Algorithm - Deadlock Avoidance",
      youtube_duration: "22:30",
      description: "Banker's algorithm for safe state detection.",
    },
  ],
  "Segmentation": [
    {
      youtube_url: "https://www.youtube.com/watch?v=KDnGbOjBgao",
      youtube_title: "Memory Segmentation - Operating Systems",
      youtube_duration: "16:45",
      description: "Memory segmentation and segment tables.",
    },
  ],
  "Paging": [
    {
      youtube_url: "https://www.youtube.com/watch?v=xacSNX6NOVM",
      youtube_title: "Virtual Memory - Paging Explained",
      youtube_duration: "20:30",
      description: "Paging, page tables, and TLB.",
    },
  ],

  // Networking
  "TCP vs UDP": [
    {
      youtube_url: "https://www.youtube.com/watch?v=uwoD5YwJ6bE",
      youtube_title: "TCP vs UDP - Network Protocols Explained",
      youtube_duration: "15:20",
      description: "Differences between TCP and UDP protocols.",
    },
  ],
  "Subnetting": [
    {
      youtube_url: "https://www.youtube.com/watch?v=ZxAwQB8TZsM",
      youtube_title: "IP Subnetting - Complete Guide",
      youtube_duration: "25:45",
      description: "CIDR notation, subnet masks, and subnetting calculations.",
    },
  ],
  "IP Addressing": [
    {
      youtube_url: "https://www.youtube.com/watch?v=ddM0AcreVqE",
      youtube_title: "IP Addressing - IPv4 and IPv6",
      youtube_duration: "18:50",
      description: "IP addressing schemes and classes.",
    },
  ],
  "DNS": [
    {
      youtube_url: "https://www.youtube.com/watch?v=L6fKvnFJdBY",
      youtube_title: "DNS (Domain Name System) Explained",
      youtube_duration: "14:30",
      description: "How DNS works and DNS resolution process.",
    },
  ],

  // Programming Basics
  "Variables & Data Types": [
    {
      youtube_url: "https://www.youtube.com/watch?v=zKQmzZpxB0c",
      youtube_title: "Variables and Data Types in Programming",
      youtube_duration: "12:30",
      description: "Understanding variables, constants, and different data types.",
    },
  ],
  "Operators & Expressions": [
    {
      youtube_url: "https://www.youtube.com/watch?v=0aaFxTHDVQI",
      youtube_title: "Operators and Expressions - Complete Tutorial",
      youtube_duration: "16:45",
      description: "Arithmetic, logical, bitwise, and assignment operators.",
    },
  ],
  "Recursion": [
    {
      youtube_url: "https://www.youtube.com/watch?v=kHXnVycFbWc",
      youtube_title: "Recursion - Understanding with Examples",
      youtube_duration: "21:50",
      description: "Recursion concept, base case, and recursive functions.",
    },
  ],
  "Function Definition": [
    {
      youtube_url: "https://www.youtube.com/watch?v=lRchjiMXrqg",
      youtube_title: "Functions - Declaration, Definition, and Calls",
      youtube_duration: "14:20",
      description: "Function basics, parameters, return values.",
    },
  ],

  // Mathematics
  "Differentiation Rules": [
    {
      youtube_url: "https://www.youtube.com/watch?v=rAof9Ld5sOI",
      youtube_title: "Differentiation Rules - Calculus",
      youtube_duration: "20:15",
      description: "Power rule, product rule, quotient rule, chain rule.",
    },
  ],
  "Maxima & Minima": [
    {
      youtube_url: "https://www.youtube.com/watch?v=fEJp8UFIVPY",
      youtube_title: "Maxima and Minima - Calculus Optimization",
      youtube_duration: "18:40",
      description: "Finding critical points and optimization problems.",
    },
  ],
  "Definite Integrals": [
    {
      youtube_url: "https://www.youtube.com/watch?v=BJj9y2KfX8U",
      youtube_title: "Definite Integrals - Integration Techniques",
      youtube_duration: "22:30",
      description: "Definite integral evaluation and applications.",
    },
  ],

  // Machine Learning
  "Logistic Regression": [
    {
      youtube_url: "https://www.youtube.com/watch?v=EGFAKmKC4zs",
      youtube_title: "Logistic Regression - Machine Learning",
      youtube_duration: "25:40",
      description: "Logistic regression for binary classification.",
    },
  ],
  "Linear Regression": [
    {
      youtube_url: "https://www.youtube.com/watch?v=E8kQrW2CMqo",
      youtube_title: "Linear Regression - Complete Tutorial",
      youtube_duration: "24:30",
      description: "Linear regression theory and implementation.",
    },
  ],
  "SVM": [
    {
      youtube_url: "https://www.youtube.com/watch?v=_PwhiWxHK8o",
      youtube_title: "Support Vector Machine (SVM) Explained",
      youtube_duration: "28:15",
      description: "SVM algorithm, kernel trick, and classification.",
    },
  ],
  "K-Means Clustering": [
    {
      youtube_url: "https://www.youtube.com/watch?v=4b5d3muVn88",
      youtube_title: "K-Means Clustering Algorithm",
      youtube_duration: "19:50",
      description: "K-means algorithm, centroid selection, and convergence.",
    },
  ],

  // Cloud Computing
  "EC2": [
    {
      youtube_url: "https://www.youtube.com/watch?v=Qvj3xLFtjZw",
      youtube_title: "AWS EC2 Tutorial - Elastic Compute Cloud",
      youtube_duration: "23:45",
      description: "EC2 instances, AMI, security groups, and elastic IPs.",
    },
  ],
  "S3": [
    {
      youtube_url: "https://www.youtube.com/watch?v=r_1DYMKGg_s",
      youtube_title: "AWS S3 - Simple Storage Service",
      youtube_duration: "20:30",
      description: "S3 buckets, versioning, lifecycle policies.",
    },
  ],

  // Java OOP
  "Class & Object": [
    {
      youtube_url: "https://www.youtube.com/watch?v=qYGw6sTrxkg",
      youtube_title: "Object-Oriented Programming - Classes and Objects",
      youtube_duration: "18:20",
      description: "Classes, objects, attributes, and methods.",
    },
  ],
  "Constructors": [
    {
      youtube_url: "https://www.youtube.com/watch?v=gy-AybYLs0g",
      youtube_title: "Constructors in Java - Complete Tutorial",
      youtube_duration: "14:15",
      description: "Constructor types, overloading, and initialization.",
    },
  ],
  "Inheritance": [
    {
      youtube_url: "https://www.youtube.com/watch?v=0xt3KD_448c",
      youtube_title: "Inheritance in OOP - Complete Guide",
      youtube_duration: "19:30",
      description: "Single inheritance, super keyword, method overriding.",
    },
  ],
  "Method Overriding": [
    {
      youtube_url: "https://www.youtube.com/watch?v=YY8p8kD8lkI",
      youtube_title: "Method Overriding and Overloading",
      youtube_duration: "16:45",
      description: "Compile-time and runtime polymorphism.",
    },
  ],

  // Microprocessor
  "8085 Architecture": [
    {
      youtube_url: "https://www.youtube.com/watch?v=B0_F-T4jl6A",
      youtube_title: "8085 Microprocessor Architecture",
      youtube_duration: "25:20",
      description: "8085 architecture, registers, and addressing modes.",
    },
  ],
};

// Add default video as option for ALL topics
Object.keys(videoMappings).forEach((topicName) => {
  videoMappings[topicName].push(DEFAULT_VIDEO);
});

// Function to get video for a topic
export function getVideoForTopic(topicName) {
  const videos = videoMappings[topicName];
  if (!videos || videos.length === 0) {
    // Return the default video for unmapped topics
    return DEFAULT_VIDEO;
  }
  // Return random video from available videos for this topic
  // Also include the default video as a fallback option
  const allVideos = [...videos, DEFAULT_VIDEO];
  return allVideos[Math.floor(Math.random() * allVideos.length)];
}

// Function to extract YouTube video ID
export function extractYouTubeId(url) {
  // Handle both youtube.com and youtu.be formats, with or without query parameters
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
}

// Function to get thumbnail URL
export function getYouTubeThumbnail(videoId) {
  if (!videoId) {
    // Fallback thumbnail if video ID extraction fails
    return "https://img.youtube.com/vi/8GuHmibfe-4/hqdefault.jpg";
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
