import dotenv from "dotenv";
import { ensureSupabase } from "./supabase.js";
import { fetchVideoMetadata } from "../services/youtube.service.js";
import { getVideoForTopic, extractYouTubeId, getYouTubeThumbnail } from "./video-seeder.js";

dotenv.config();

async function run() {
  console.log("🔄 PeerLearn seed: starting...");

  const supabase = ensureSupabase();

  // Wipe existing data in dependency order
  console.log("🧹 Clearing existing data...");
  const tables = ["notifications", "flags", "ratings", "submissions", "users", "topics", "units", "subjects", "branches"];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.error(`Failed to clear table ${table}`, error);
      throw error;
    }
  }

  // Helper to insert and return rows
  const insertAndReturn = async (table, rows) => {
    const { data, error } = await supabase.from(table).insert(rows).select("*");
    if (error) {
      console.error(`Insert failed for ${table}`, error);
      throw error;
    }
    return data;
  };

  console.log("🌱 Seeding branches...");
  const [cse, ece] = await insertAndReturn("branches", [
    { code: "CSE", name: "Computer Science Engineering" },
    { code: "ECE", name: "Electronics & Communication Engineering" },
  ]);

  const subjectDefs = [];

  // CSE subjects by year
  const pushSubject = (branchId, year, code, name) => {
    subjectDefs.push({ branch_id: branchId, year, code, name });
  };

  // Year 1
  pushSubject(cse.id, 1, "CSE-MATH1", "Engineering Mathematics I");
  pushSubject(cse.id, 1, "CSE-C", "C Programming");

  // Year 2
  pushSubject(cse.id, 2, "CSE-DS", "Data Structures");
  pushSubject(cse.id, 2, "CSE-OOPJ", "OOP with Java");
  pushSubject(cse.id, 2, "CSE-CO", "Computer Organization");
  pushSubject(cse.id, 2, "CSE-DM", "Discrete Mathematics");

  // Year 3
  pushSubject(cse.id, 3, "CSE-OS", "Operating Systems");
  pushSubject(cse.id, 3, "CSE-DBMS", "DBMS");
  pushSubject(cse.id, 3, "CSE-CN", "Computer Networks");
  pushSubject(cse.id, 3, "CSE-SE", "Software Engineering");

  // Year 4
  pushSubject(cse.id, 4, "CSE-ML", "Machine Learning");
  pushSubject(cse.id, 4, "CSE-CC", "Cloud Computing");

  // ECE
  pushSubject(ece.id, 1, "ECE-BE", "Basic Electronics");
  pushSubject(ece.id, 2, "ECE-DE", "Digital Electronics");
  pushSubject(ece.id, 2, "ECE-SS", "Signals & Systems");
  pushSubject(ece.id, 3, "ECE-DC", "Digital Communication");
  pushSubject(ece.id, 3, "ECE-MP", "Microprocessors");
  pushSubject(ece.id, 4, "ECE-ES", "Embedded Systems");

  console.log("🌱 Seeding subjects...");
  const subjects = await insertAndReturn("subjects", subjectDefs);

  const subjectByCode = Object.fromEntries(subjects.map((s) => [s.code, s]));

  const units = [];
  const topics = [];

  const addUnitWithTopics = (subjectCode, number, unitName, topicNames) => {
    const subject = subjectByCode[subjectCode];
    if (!subject) {
      throw new Error(`Subject with code ${subjectCode} not found`);
    }
    const unitKey = `${subjectCode}-U${number}`;
    units.push({ _key: unitKey, subject_id: subject.id, number, name: unitName });
    topicNames.forEach((name) => {
      topics.push({ _unitKey: unitKey, name, is_important: false });
    });
  };

  const importantTopicNames = new Set([
    "AVL Trees",
    "Dijkstra's Algorithm",
    "CPU Scheduling Algorithms",
    "Page Replacement Algorithms",
    "Banker's Algorithm",
    "TCP vs UDP",
    "Joins",
    "BCNF",
    "Backpropagation",
    "K-Means Clustering",
    "Linear Regression",
  ]);

  // CSE Engineering Mathematics I
  addUnitWithTopics("CSE-MATH1", 1, "Matrices", [
    "Eigenvalues & Eigenvectors",
    "Cayley-Hamilton Theorem",
    "Types of Matrices",
  ]);
  addUnitWithTopics("CSE-MATH1", 2, "Differential Calculus", [
    "Limits & Continuity",
    "Differentiation Rules",
    "Maxima & Minima",
  ]);
  addUnitWithTopics("CSE-MATH1", 3, "Integral Calculus", [
    "Definite Integrals",
    "Beta & Gamma Functions",
    "Applications of Integration",
  ]);

  // C Programming
  addUnitWithTopics("CSE-C", 1, "Basics of C", [
    "Variables & Data Types",
    "Operators & Expressions",
  ]);
  addUnitWithTopics("CSE-C", 2, "Control Flow", [
    "If-Else",
    "Switch Case",
    "Loops",
  ]);
  addUnitWithTopics("CSE-C", 3, "Arrays & Strings", [
    "1D Arrays",
    "2D Arrays",
    "String Functions",
  ]);
  addUnitWithTopics("CSE-C", 4, "Functions", [
    "Function Definition",
    "Recursion",
    "Scope",
  ]);
  addUnitWithTopics("CSE-C", 5, "Pointers", [
    "Pointers Basics",
    "Pointer Arithmetic",
    "Dynamic Memory Allocation",
  ]);

  // Data Structures
  addUnitWithTopics("CSE-DS", 1, "Arrays & Linked Lists", [
    "Array Operations",
    "Singly Linked List",
    "Doubly Linked List",
  ]);
  addUnitWithTopics("CSE-DS", 2, "Stacks & Queues", [
    "Stack Implementation",
    "Queue",
    "Circular Queue",
    "Deque",
  ]);
  addUnitWithTopics("CSE-DS", 3, "Trees", [
    "Binary Tree",
    "BST",
    "AVL Trees",
    "Tree Traversals",
  ]);
  addUnitWithTopics("CSE-DS", 4, "Graphs", [
    "Graph Representation",
    "BFS",
    "DFS",
    "Dijkstra's Algorithm",
  ]);
  addUnitWithTopics("CSE-DS", 5, "Sorting & Searching", [
    "Bubble Sort",
    "Merge Sort",
    "Quick Sort",
    "Binary Search",
  ]);

  // OOP with Java
  addUnitWithTopics("CSE-OOPJ", 1, "Java Basics", [
    "JVM Architecture",
    "Data Types",
    "Operators",
  ]);
  addUnitWithTopics("CSE-OOPJ", 2, "Classes & Objects", [
    "Class & Object",
    "Constructors",
    "this keyword",
  ]);
  addUnitWithTopics("CSE-OOPJ", 3, "Inheritance", [
    "Single Inheritance",
    "Multilevel",
    "Method Overriding",
    "super keyword",
  ]);
  addUnitWithTopics("CSE-OOPJ", 4, "Exception Handling", [
    "Try-Catch",
    "Throws",
    "Custom Exceptions",
  ]);
  addUnitWithTopics("CSE-OOPJ", 5, "Collections", [
    "ArrayList",
    "HashMap",
    "Iterator",
  ]);

  // Computer Organization
  addUnitWithTopics("CSE-CO", 1, "Number Systems", [
    "Binary Arithmetic",
    "2's Complement",
    "IEEE 754",
  ]);
  addUnitWithTopics("CSE-CO", 2, "Boolean Algebra", [
    "Logic Gates",
    "K-Map",
    "Boolean Simplification",
  ]);
  addUnitWithTopics("CSE-CO", 3, "Combinational Circuits", [
    "Adders",
    "Multiplexers",
    "Decoders",
  ]);
  addUnitWithTopics("CSE-CO", 4, "Sequential Circuits", [
    "Flip Flops",
    "Registers",
    "Counters",
  ]);
  addUnitWithTopics("CSE-CO", 5, "Memory", [
    "RAM",
    "ROM",
    "Cache Memory",
  ]);

  // Discrete Mathematics
  addUnitWithTopics("CSE-DM", 1, "Set Theory", [
    "Sets",
    "Venn Diagrams",
    "Power Sets",
  ]);
  addUnitWithTopics("CSE-DM", 2, "Logic", [
    "Propositional Logic",
    "Predicates",
    "Inference",
  ]);
  addUnitWithTopics("CSE-DM", 3, "Relations & Functions", [
    "Relations",
    "Functions",
    "Equivalence Classes",
  ]);
  addUnitWithTopics("CSE-DM", 4, "Graph Theory", [
    "Graph Types",
    "Euler & Hamiltonian Paths",
  ]);
  addUnitWithTopics("CSE-DM", 5, "Combinatorics", [
    "Permutations",
    "Combinations",
    "Pigeonhole Principle",
  ]);

  // Operating Systems
  addUnitWithTopics("CSE-OS", 1, "Introduction", [
    "OS Types",
    "System Calls",
    "Kernel",
  ]);
  addUnitWithTopics("CSE-OS", 2, "Process Management", [
    "Process States",
    "PCB",
    "Context Switching",
  ]);
  addUnitWithTopics("CSE-OS", 3, "Memory Management", [
    "Paging",
    "Segmentation",
    "Virtual Memory",
    "Page Replacement Algorithms",
  ]);
  addUnitWithTopics("CSE-OS", 4, "File Systems", [
    "File Allocation Methods",
    "Directory Structures",
  ]);
  addUnitWithTopics("CSE-OS", 5, "Deadlocks", [
    "Deadlock Conditions",
    "Banker's Algorithm",
  ]);

  // DBMS
  addUnitWithTopics("CSE-DBMS", 1, "ER Model", [
    "Entity-Relationship Diagrams",
    "Cardinality",
  ]);
  addUnitWithTopics("CSE-DBMS", 2, "Relational Model", [
    "Relational Algebra",
    "Keys",
    "Integrity Constraints",
  ]);
  addUnitWithTopics("CSE-DBMS", 3, "SQL", [
    "DDL",
    "DML",
    "Joins",
    "Subqueries",
    "Aggregate Functions",
  ]);
  addUnitWithTopics("CSE-DBMS", 4, "Normalization", [
    "1NF",
    "2NF",
    "3NF",
    "BCNF",
  ]);
  addUnitWithTopics("CSE-DBMS", 5, "Transactions", [
    "ACID Properties",
    "Concurrency Control",
    "Locking",
  ]);

  // Computer Networks
  addUnitWithTopics("CSE-CN", 1, "OSI Model", [
    "OSI vs TCP/IP",
    "Layers & Protocols",
  ]);
  addUnitWithTopics("CSE-CN", 2, "Data Link Layer", [
    "Error Detection",
    "MAC Protocols",
    "Ethernet",
  ]);
  addUnitWithTopics("CSE-CN", 3, "Network Layer", [
    "IP Addressing",
    "Subnetting",
    "Routing Algorithms",
  ]);
  addUnitWithTopics("CSE-CN", 4, "Transport Layer", [
    "TCP vs UDP",
    "Flow Control",
    "Congestion Control",
  ]);
  addUnitWithTopics("CSE-CN", 5, "Application Layer", [
    "HTTP",
    "DNS",
    "SMTP",
    "FTP",
  ]);

  // Software Engineering
  addUnitWithTopics("CSE-SE", 1, "SDLC", [
    "Waterfall",
    "Agile",
    "Spiral Models",
  ]);
  addUnitWithTopics("CSE-SE", 2, "Requirements", [
    "SRS Document",
    "Use Case Diagrams",
  ]);
  addUnitWithTopics("CSE-SE", 3, "Design", [
    "Architectural Design",
    "Design Patterns",
  ]);
  addUnitWithTopics("CSE-SE", 4, "Testing", [
    "Black Box Testing",
    "White Box Testing",
    "Unit Testing",
  ]);
  addUnitWithTopics("CSE-SE", 5, "Maintenance", [
    "Software Metrics",
    "COCOMO Model",
  ]);

  // Machine Learning
  addUnitWithTopics("CSE-ML", 1, "Introduction", [
    "ML Types",
    "Data Preprocessing",
  ]);
  addUnitWithTopics("CSE-ML", 2, "Supervised Learning", [
    "Linear Regression",
    "Logistic Regression",
    "Decision Trees",
    "SVM",
  ]);
  addUnitWithTopics("CSE-ML", 3, "Unsupervised Learning", [
    "K-Means Clustering",
    "Hierarchical Clustering",
    "PCA",
  ]);
  addUnitWithTopics("CSE-ML", 4, "Neural Networks", [
    "Perceptron",
    "Backpropagation",
    "CNN Basics",
  ]);
  addUnitWithTopics("CSE-ML", 5, "Model Evaluation", [
    "Overfitting",
    "Cross Validation",
    "Confusion Matrix",
  ]);

  // Cloud Computing
  addUnitWithTopics("CSE-CC", 1, "Cloud Basics", [
    "Cloud Models",
    "Service Types",
  ]);
  addUnitWithTopics("CSE-CC", 2, "Virtualization", [
    "Hypervisors",
    "VM vs Containers",
  ]);
  addUnitWithTopics("CSE-CC", 3, "AWS/Azure Services", [
    "EC2",
    "S3",
    "Load Balancers",
  ]);
  addUnitWithTopics("CSE-CC", 4, "Docker & Containers", [
    "Docker Basics",
    "Kubernetes Intro",
  ]);
  addUnitWithTopics("CSE-CC", 5, "Security", [
    "Cloud Security",
    "IAM",
  ]);

  // ECE subjects
  addUnitWithTopics("ECE-BE", 1, "Semiconductor Devices", [
    "P-N Junction",
    "Diode Characteristics",
  ]);
  addUnitWithTopics("ECE-BE", 2, "Diode Circuits", [
    "Rectifiers",
    "Clippers",
    "Clampers",
  ]);
  addUnitWithTopics("ECE-BE", 3, "Transistors", [
    "BJT Biasing",
    "CE Configuration",
    "Transistor as Switch",
  ]);

  addUnitWithTopics("ECE-DE", 1, "Number Systems", [
    "Binary",
    "Octal",
    "Hex Conversions",
  ]);
  addUnitWithTopics("ECE-DE", 2, "Logic Gates", [
    "AND",
    "OR",
    "NOT",
    "NAND",
    "NOR",
    "XOR",
  ]);
  addUnitWithTopics("ECE-DE", 3, "Combinational Circuits", [
    "Adders",
    "Subtractors",
    "Multiplexers",
  ]);
  addUnitWithTopics("ECE-DE", 4, "Sequential Circuits", [
    "SR Flip Flop",
    "JK Flip Flop",
    "Counters",
    "Shift Registers",
  ]);

  addUnitWithTopics("ECE-SS", 1, "Signals", [
    "Types of Signals",
    "Signal Operations",
  ]);
  addUnitWithTopics("ECE-SS", 2, "Systems", [
    "LTI Systems",
    "Convolution",
  ]);
  addUnitWithTopics("ECE-SS", 3, "Fourier Analysis", [
    "Fourier Series",
    "Fourier Transform",
  ]);
  addUnitWithTopics("ECE-SS", 4, "Laplace Transform", [
    "Laplace Transform Properties",
    "Inverse Laplace",
  ]);
  addUnitWithTopics("ECE-SS", 5, "Z-Transform", [
    "Z-Transform",
    "Inverse Z-Transform",
  ]);

  addUnitWithTopics("ECE-DC", 1, "Sampling", [
    "Sampling Theorem",
    "Quantization",
  ]);
  addUnitWithTopics("ECE-DC", 2, "PCM", [
    "PCM",
    "DPCM",
    "Delta Modulation",
  ]);
  addUnitWithTopics("ECE-DC", 3, "Digital Modulation", [
    "ASK",
    "FSK",
    "PSK",
    "QPSK",
  ]);
  addUnitWithTopics("ECE-DC", 4, "Error Control", [
    "Hamming Code",
    "CRC",
    "Convolutional Codes",
  ]);
  addUnitWithTopics("ECE-DC", 5, "Multiplexing", [
    "TDM",
    "FDM",
    "CDMA",
  ]);

  addUnitWithTopics("ECE-MP", 1, "8085 Architecture", [
    "8085 Architecture",
    "Registers",
    "Flags",
  ]);
  addUnitWithTopics("ECE-MP", 2, "Instruction Set", [
    "Addressing Modes",
    "Data Transfer Instructions",
  ]);
  addUnitWithTopics("ECE-MP", 3, "Interfacing", [
    "Arithmetic & Logical Instructions",
    "Branching",
  ]);
  addUnitWithTopics("ECE-MP", 4, "Interfacing", [
    "Memory Interfacing",
    "I/O Interfacing",
  ]);
  addUnitWithTopics("ECE-MP", 5, "8051 Microcontroller", [
    "8051 Architecture",
    "Timers",
    "Interrupts",
  ]);

  addUnitWithTopics("ECE-ES", 1, "Introduction", [
    "Embedded System Characteristics",
    "Design Challenges",
  ]);
  addUnitWithTopics("ECE-ES", 2, "ARM Architecture", [
    "ARM Cortex Architecture",
    "Pipeline",
  ]);
  addUnitWithTopics("ECE-ES", 3, "RTOS", [
    "RTOS Concepts",
    "Task Scheduling",
  ]);
  addUnitWithTopics("ECE-ES", 4, "Communication Protocols", [
    "UART",
    "SPI",
    "I2C",
    "CAN",
  ]);
  addUnitWithTopics("ECE-ES", 5, "Applications", [
    "IoT Applications",
    "Sensor Interfacing",
  ]);

  console.log("🌱 Seeding units...");
  const unitsToInsert = units.map(({ _key, ...rest }) => rest);
  const insertedUnits = await insertAndReturn("units", unitsToInsert);
  const unitByKey = {};
  insertedUnits.forEach((u, idx) => {
    unitByKey[units[idx]._key] = u;
  });

  console.log("🌱 Seeding topics...");
  const topicsToInsert = topics.map((t) => ({
    unit_id: unitByKey[t._unitKey].id,
    name: t.name,
    is_important: importantTopicNames.has(t.name),
  }));
  const insertedTopics = await insertAndReturn("topics", topicsToInsert);

  const topicByName = Object.fromEntries(
    insertedTopics.map((t) => [t.name, t])
  );

  console.log("🌱 Seeding users...");
  const users = await insertAndReturn("users", [
    {
      name: "Aarav Mehta",
      email: "aarav.mehta@peerlearn.edu",
      role: "student",
      year: 1,
      branch_id: cse.id,
    },
    {
      name: "Isha Verma",
      email: "isha.verma@peerlearn.edu",
      role: "student",
      year: 2,
      branch_id: cse.id,
    },
    {
      name: "Rohan Sharma",
      email: "rohan.sharma@peerlearn.edu",
      role: "student",
      year: 3,
      branch_id: cse.id,
    },
    {
      name: "Neha Gupta",
      email: "neha.gupta@peerlearn.edu",
      role: "student",
      year: 4,
      branch_id: cse.id,
    },
    {
      name: "Aditya Rao",
      email: "aditya.rao@peerlearn.edu",
      role: "student",
      year: 2,
      branch_id: ece.id,
    },
    {
      name: "Kriti Nair",
      email: "kriti.nair@peerlearn.edu",
      role: "student",
      year: 3,
      branch_id: ece.id,
    },
    {
      name: "Vikram Singh",
      email: "vikram.singh@peerlearn.edu",
      role: "student",
      year: 1,
      branch_id: ece.id,
    },
    {
      name: "Dr. Anjali Kulkarni",
      email: "anjali.kulkarni@peerlearn.edu",
      role: "moderator",
      branch_id: cse.id,
    },
    {
      name: "Dr. Rajesh Iyer",
      email: "rajesh.iyer@peerlearn.edu",
      role: "moderator",
      branch_id: ece.id,
    },
    {
      name: "Moderator Demo",
      email: "moderator@peerlearn.edu",
      role: "moderator",
    },
    {
      name: "Admin User",
      email: "admin@peerlearn.edu",
      role: "admin",
    },
  ]);

  const studentUsers = users.filter((u) => u.role === "student");
  const moderators = users.filter((u) => u.role === "moderator");

  // Hash and update password for demo accounts
  const bcrypt = await import("bcrypt");
  const SALT_ROUNDS = 10;
  const { default: Bcrypt } = bcrypt;

  const demoAccounts = [
    { email: "aarav.mehta@peerlearn.edu", password: "student123456" },
    { email: "moderator@peerlearn.edu", password: "123456789" },
    { email: "admin@peerlearn.edu", password: "789456123" },
  ];

  for (const account of demoAccounts) {
    const password_hash = await Bcrypt.hash(account.password, SALT_ROUNDS);
    const { error } = await supabase
      .from("users")
      .update({ password_hash })
      .eq("email", account.email);
    if (error) {
      console.error(`Failed to set password for ${account.email}:`, error);
    } else {
      console.log(`✓ Set password for ${account.email}`);
    }
  }

  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  console.log("🌱 Seeding submissions...");
  const sampleVideoIds = [
    "dQw4w9WgXcQ",
    "9bZkp7q19f0",
    "e-ORhEE9VVg",
    "oHg5SJYRHA0",
    "M7lc1UVf-VE",
    "rL8X2mlNHPM",
    "f02mOEt11OQ",
    "zOjov-2OZ0E",
    "rfscVS0vtbw",
    "8PopR3x-VMY",
    "QXeEoD0pB3E",
    "sBzRwzY7G-k",
    "HcOc7P5BMi4",
    "JZWguaHcELs",
    "3u1fu6f8Hto",
    "1Lfp-7E4QJ4",
    "OEV8gMkCHXQ",
    "aircAruvnKk",
    "tPYj3fFJGjk",
    "GwIo3gDZCVQ",
  ];

  const importantTopicsList = [
    "AVL Trees",
    "Dijkstra's Algorithm",
    "CPU Scheduling Algorithms",
    "Page Replacement Algorithms",
    "Banker's Algorithm",
    "TCP vs UDP",
    "Joins",
    "BCNF",
    "Backpropagation",
    "K-Means Clustering",
    "Linear Regression",
  ].map((name) => topicByName[name]).filter(Boolean);

  const otherTopics = insertedTopics.filter(
    (t) => !importantTopicsList.find((imp) => imp.id === t.id)
  );

  const submissionPayloads = [];
  const statuses = [
    ...Array(Math.floor(insertedTopics.length * 0.4)).fill("approved"),
    ...Array(Math.floor(insertedTopics.length * 0.2)).fill("pending"),
    ...Array(Math.floor(insertedTopics.length * 0.15)).fill("rejected"),
    ...Array(Math.floor(insertedTopics.length * 0.15)).fill("under_review"),
    ...Array(Math.floor(insertedTopics.length * 0.1)).fill("flagged"),
  ];

  // Add videos for all topics
  console.log("🎥 Seeding videos for topics...");
  for (let i = 0; i < insertedTopics.length; i += 1) {
    const topic = insertedTopics[i];
    const contributor = pickRandom(studentUsers);
    const status = statuses[i % statuses.length];

    // Get video from our curated video seeder
    const videoData = getVideoForTopic(topic.name);
    const { youtube_url, youtube_title, youtube_duration, description: videoDescription } = videoData;
    const videoId = extractYouTubeId(youtube_url);
    const youtube_thumbnail = getYouTubeThumbnail(videoId);

    const base = {
      contributor_id: contributor.id,
      topic_id: topic.id,
      youtube_url,
      description: videoDescription,
      language: "English",
      youtube_title,
      youtube_thumbnail,
      youtube_duration,
      status,
    };

    if (status === "rejected") {
      base.rejection_reason =
        "Explanation needs clearer structure and must follow the official syllabus flow. Please tighten the introduction and restate key formulas.";
    }

    submissionPayloads.push(base);

    if ((i + 1) % 50 === 0) {
      console.log(`  ✓ Prepared ${i + 1}/${insertedTopics.length} videos`);
    }
  }

  console.log(`🎬 Inserting ${submissionPayloads.length} videos into database...`);
  const submissions = await insertAndReturn("submissions", submissionPayloads);
  console.log(`✅ Successfully inserted ${submissions.length} videos`);

  console.log("🌱 Seeding ratings for approved submissions...");
  const ratingRows = [];
  const approvedSubmissions = submissions.filter(
    (s) => s.status === "approved"
  );

  approvedSubmissions.forEach((submission) => {
    const raterPool = [...studentUsers];
    const ratingCount = 3 + Math.floor(Math.random() * 6); // 3-8 ratings
    for (let i = 0; i < ratingCount && raterPool.length > 0; i += 1) {
      const idx = Math.floor(Math.random() * raterPool.length);
      const [student] = raterPool.splice(idx, 1);
      const clarity = 3 + Math.floor(Math.random() * 3); // 3-5
      const usefulness = 3 + Math.floor(Math.random() * 3);
      ratingRows.push({
        student_id: student.id,
        submission_id: submission.id,
        clarity_score: clarity,
        usefulness_score: usefulness,
      });
    }
  });

  if (ratingRows.length > 0) {
    await insertAndReturn("ratings", ratingRows);
  }

  console.log("✅ PeerLearn seed completed successfully.");
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("❌ PeerLearn seed failed", err);
  process.exit(1);
});
