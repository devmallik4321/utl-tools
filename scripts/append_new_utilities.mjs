import fs from "fs";

const utilities = JSON.parse(fs.readFileSync("registry/utilities.json", "utf-8"));

const newTools = [
  {
    id: "talking-alarm-clock",
    name: "Talking Alarm Clock & Spoken Time",
    slug: "talking-alarm-clock",
    category: "fun",
    description: "Accurate digital clock with real-time speech synthesis time announcement, daily recurring alarms, and client-side notifications.",
    icon: "Volume2",
    technology: "Web Speech Synthesis API + Web Audio API + HTML5 Notification API",
    formula: "t = new Date(); SpeechSynthesisUtterance(t.toLocaleTimeString())",
    trustNotes: "Zero server connection required. Speech is synthesized locally on your operating system. Alarms and preferences remain in ephemeral memory.",
    keywords: ["talking alarm clock", "speak time online", "voice clock", "browser alarm clock", "speaking clock online"],
    primaryKeywords: ["talking alarm clock", "voice clock online", "speaking clock"],
    secondaryKeywords: ["online alarm clock with sound", "spoken time announcement", "browser alarm notification"],
    userProblem: "Users working across screens, cooking, or waking up who need an audible spoken time announcement and customizable alarms without installing bloated desktop apps.",
    searchIntent: "Searchers looking for an online clock that announces the time out loud and triggers alarms through browser audio.",
    resultInterpretation: "Displays live 12H/24H time with milliseconds precision and vocalizes hours and minutes using native OS speech synthesis voices.",
    practicalGuidance: "Grant browser notification permissions if you want visual popup alerts when working in other tabs. Keep the browser tab open for alarms to trigger.",
    limitations: "Background audio may be suspended by mobile OS power-savers if the screen is locked or tab is deeply backgrounded.",
    seo: {
      title: "Talking Alarm Clock — Voice Time Announcement & Alarms Online",
      description: "Free online talking alarm clock with spoken time voice announcements, 12/24 hour display, custom alarms, and zero server logging.",
      faqs: [
        {
          q: "How does the voice time announcement work?",
          a: "It uses the W3C Web Speech Synthesis API to vocalize the exact current hour and minute using your device's native high-quality text-to-speech voice engine."
        },
        {
          q: "Do alarms trigger if I switch tabs?",
          a: "Yes, as long as the browser window remains open. If you grant notification permissions, a desktop banner will also alert you."
        },
        {
          q: "Is my data private?",
          a: "100%. All alarms and timers run strictly in your browser's local memory with zero tracking."
        }
      ]
    }
  },
  {
    id: "diff-checker",
    name: "Diff Checker & Text Comparator",
    slug: "diff-checker",
    category: "developer",
    description: "Compare two text blocks or code snippets side-by-side with line-by-line character difference highlighting and statistics.",
    icon: "GitCompare",
    technology: "Client-Side Longest Common Subsequence (LCS) Diff Algorithm",
    formula: "LCS(A[1..m], B[1..n]) dynamic programming matrix",
    trustNotes: "Your proprietary code and sensitive text are processed entirely inside browser memory and never transmitted over the network.",
    keywords: ["diff checker", "text compare online", "code difference finder", "online diff tool", "file comparison"],
    primaryKeywords: ["diff checker online", "compare text online", "code diff tool"],
    secondaryKeywords: ["side by side text comparison", "git diff checker", "find differences in two text files"],
    userProblem: "Engineers, editors, and legal professionals who need to identify exact line additions, removals, and modifications between two versions of text.",
    searchIntent: "Users looking to paste two versions of text or code and instantly see highlighted differences with copyable diff patches.",
    resultInterpretation: "Provides color-coded additions (+ green), deletions (- red), and unchanged lines with total counts and unified or side-by-side view toggles.",
    practicalGuidance: "Toggle between Unified View for quick scanning and Side-by-Side View for wide screen code inspections.",
    limitations: "Optimized for texts up to 50,000 lines. Extremely large multi-gigabyte log files should use command-line diff utilities.",
    seo: {
      title: "Diff Checker — Compare Text & Code Differences Online Free",
      description: "Free online diff checker. Compare two text files or code snippets side-by-side with line-by-line difference highlighting and 100% privacy.",
      faqs: [
        {
          q: "Is my code sent to a server?",
          a: "No. The Longest Common Subsequence algorithm runs entirely in client JavaScript. Zero bytes leave your browser."
        },
        {
          q: "Can I copy the diff output?",
          a: "Yes, click 'Copy Diff' to copy standard patch-formatted unified diff text directly to your clipboard."
        }
      ]
    }
  },
  {
    id: "markdown-previewer",
    name: "Markdown to HTML & Live Previewer",
    slug: "markdown-previewer",
    category: "developer",
    description: "Write or paste GitHub Flavored Markdown and instantly preview the rendered document with 1-click HTML markup export.",
    icon: "FileText",
    technology: "W3C DOM Sanitization + Regex GFM Parser",
    formula: "GFM Lexical Parsing with XSS Escaping",
    trustNotes: "All markdown is sanitized and rendered locally without third-party CDN scripts or remote compilers.",
    keywords: ["markdown previewer", "markdown to html", "gfm editor online", "live markdown converter"],
    primaryKeywords: ["markdown to html converter", "online markdown previewer", "gfm editor"],
    secondaryKeywords: ["github markdown live preview", "convert markdown to html tags", "markdown table generator"],
    userProblem: "Technical writers, developers, and bloggers needing a fast, distraction-free environment to preview README files and convert markdown to HTML.",
    searchIntent: "Searchers who need to paste Markdown and get clean, sanitized HTML markup with instant visual verification.",
    resultInterpretation: "Provides real-time synchronized rendering supporting headings, code syntax, tables, task lists, and quotes.",
    practicalGuidance: "Switch between Live Preview to review typography and HTML Markup to copy raw HTML tags for your CMS or newsletter.",
    limitations: "Custom proprietary markdown flavor extensions (like Obsidian double bracket links) require standard markdown links.",
    seo: {
      title: "Markdown to HTML Converter & Live Previewer Online",
      description: "Convert GitHub Flavored Markdown to clean HTML with real-time live preview, table support, and instant clipboard export.",
      faqs: [
        {
          q: "Does this support GitHub Flavored Markdown (GFM)?",
          a: "Yes, including task list checkboxes, tables, code fences, blockquotes, and strikethrough."
        }
      ]
    }
  },
  {
    id: "csv-json-converter",
    name: "CSV to JSON & JSON to CSV Converter",
    slug: "csv-json-converter",
    category: "developer",
    description: "Bi-directional tabular data converter between CSV/TSV spreadsheets and structured JSON arrays with custom delimiter support.",
    icon: "ArrowLeftRight",
    technology: "Client-Side RFC 4180 CSV Parser + Native JSON Engine",
    formula: "RFC 4180 Tabular Tokenizer & Serializer",
    trustNotes: "Spreadsheets, customer records, and confidential datasets are converted entirely in local memory with zero server transmission.",
    keywords: ["csv to json", "json to csv", "convert csv to json online", "tsv to json", "spreadsheet to json"],
    primaryKeywords: ["csv to json converter", "json to csv online", "convert csv to json array"],
    secondaryKeywords: ["tsv to json parser", "export json to excel csv", "convert spreadsheet table to json"],
    userProblem: "Developers and data analysts who need to convert spreadsheet export files into JSON arrays for database seeding or API payloads.",
    searchIntent: "Users wanting to paste CSV rows and download or copy structured JSON arrays, or convert JSON back to CSV.",
    resultInterpretation: "Auto-detects column headers, infers numeric and boolean types, and handles custom delimiters (commas, tabs, semicolons, pipes).",
    practicalGuidance: "Ensure the first line contains unique column header names. Use the delimiter dropdown if parsing European semicolon CSVs.",
    limitations: "Deeply nested JSON objects are flattened during JSON-to-CSV serialization.",
    seo: {
      title: "CSV to JSON & JSON to CSV Converter Online Free",
      description: "Convert CSV spreadsheets to JSON arrays and JSON to CSV instantly in your browser with custom delimiters and 100% privacy.",
      faqs: [
        {
          q: "Are large CSV files supported?",
          a: "Yes, files up to several tens of thousands of rows parse smoothly inside browser memory."
        }
      ]
    }
  },
  {
    id: "unit-converter",
    name: "Unit Converter (Metric & Imperial)",
    slug: "unit-converter",
    category: "education",
    description: "Universal multi-category unit converter for length, mass/weight, temperature, speed, volume, and area with precise conversion ratios.",
    icon: "Ruler",
    technology: "BIPM International System of Units (SI) Mathematical Engine",
    formula: "v_target = (v_source * factor_source) / factor_target",
    trustNotes: "Deterministic mathematical conversion engine using standard BIPM / NIST conversion constants.",
    keywords: ["unit converter", "metric to imperial converter", "length converter", "kg to lbs", "temperature converter"],
    primaryKeywords: ["unit converter online", "metric to imperial converter", "measurement converter"],
    secondaryKeywords: ["convert meters to feet", "celsius to fahrenheit calculator", "kg to pounds converter"],
    userProblem: "Students, engineers, travelers, and home cooks needing accurate conversions between international Metric and US Imperial measurement systems.",
    searchIntent: "Searchers wanting to convert measurement values across units with instant live computation.",
    resultInterpretation: "Displays converted value with up to 5 decimal places precision alongside the exact unitary conversion ratio formula.",
    practicalGuidance: "Use the swap button (⇄) to invert source and target units instantly without re-typing numbers.",
    limitations: "Specialized non-linear logarithmic units (like decibels or Richter scales) are not covered in standard dimensional conversion.",
    seo: {
      title: "Unit Converter — Metric to Imperial Measurements Online",
      description: "Free online unit converter for Length, Weight, Temperature, Speed, Area, and Volume. Instant conversion with 100% precision.",
      faqs: [
        {
          q: "Are the conversion constants exact?",
          a: "Yes, they match official NIST and BIPM definitions (e.g. exactly 1 inch = 0.0254 meters; 1 lb = 0.45359237 kg)."
        }
      ]
    }
  },
  {
    id: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator & Dummy Text",
    slug: "lorem-ipsum-generator",
    category: "creative",
    description: "Generate standard Cicero dummy placeholder text in paragraphs, sentences, words, or bullet list items with optional HTML markup.",
    icon: "FileText",
    technology: "Cicero De Finibus Bonorum et Malorum Lexicon Engine",
    formula: "Pseudorandom word distribution with classical Latin lexicon",
    trustNotes: "Runs 100% offline in client browser memory.",
    keywords: ["lorem ipsum generator", "dummy text generator", "placeholder text online", "lipsum generator"],
    primaryKeywords: ["lorem ipsum generator", "dummy text generator", "placeholder text"],
    secondaryKeywords: ["lorem ipsum paragraph generator", "generate dummy words for mockup", "html placeholder text"],
    userProblem: "Designers, web developers, and typesetters needing natural-looking placeholder copy to evaluate typography and page layout balance.",
    searchIntent: "Users looking to generate dummy Latin placeholder text with specific paragraph or word counts.",
    resultInterpretation: "Provides natural sentence lengths with realistic punctuation and capitalization, ready for 1-click clipboard copying.",
    practicalGuidance: "Enable 'Wrap in HTML tags' if you are pasting directly into code editors or rich CMS environments.",
    limitations: "Generated text is intended strictly as dummy placeholder copy and carries no semantic English meaning.",
    seo: {
      title: "Lorem Ipsum Generator — Custom Placeholder Text Online",
      description: "Generate dummy Lorem Ipsum placeholder text by paragraphs, sentences, or words with HTML tag options and instant copy.",
      faqs: [
        {
          q: "Where does Lorem Ipsum come from?",
          a: "It originates from sections 1.10.32 and 1.10.33 of Cicero's 45 BC philosophical treatise 'De Finibus Bonorum et Malorum'."
        }
      ]
    }
  },
  {
    id: "case-converter",
    name: "Case Converter (camelCase, snake_case, kebab-case)",
    slug: "case-converter",
    category: "developer",
    description: "Transform text and code variable names across camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, and Title Case.",
    icon: "Type",
    technology: "Client-Side Tokenization & Casing State Machine",
    formula: "Word boundary regex tokenization: replace(/([a-z])([A-Z])/g, '$1 $2')",
    trustNotes: "Zero server communication. All transformations occur instantly in browser RAM.",
    keywords: ["case converter", "camelcase converter", "snake case converter", "kebab case generator", "text case changer"],
    primaryKeywords: ["case converter online", "camelcase to snake case", "kebab case converter"],
    secondaryKeywords: ["convert string to pascalcase", "constant case generator", "variable naming case changer"],
    userProblem: "Programmers converting database column names, API JSON keys, CSS class names, or constants between differing programming language casing standards.",
    searchIntent: "Searchers looking to paste a string and immediately see it converted across all major developer casing conventions.",
    resultInterpretation: "Displays synchronized cards for 9 standard conventions with 1-click copy buttons for every case format.",
    practicalGuidance: "Handles existing mixed delimiters (spaces, underscores, hyphens, and camel boundaries) seamlessly.",
    limitations: "Non-Latin character sets without uppercase/lowercase equivalents (like Chinese or Arabic) are preserved unchanged.",
    seo: {
      title: "Case Converter — camelCase, snake_case, kebab-case Online",
      description: "Instantly convert text to camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, and Title Case with 1-click copy.",
      faqs: [
        {
          q: "Which casing standard is best for JavaScript APIs?",
          a: "camelCase is the standard convention for JavaScript object keys, functions, and variables."
        }
      ]
    }
  },
  {
    id: "hash-generator",
    name: "Cryptographic Hash Generator (SHA-256, SHA-512, SHA-1)",
    slug: "hash-generator",
    category: "developer",
    description: "Compute secure cryptographic checksums using native W3C Web Crypto API with uppercase/lowercase formatting and bit-length auditing.",
    icon: "Hash",
    technology: "W3C Web Cryptography API (crypto.subtle.digest)",
    formula: "crypto.subtle.digest('SHA-256', UTF8_ArrayBuffer(text))",
    trustNotes: "Hashes are generated strictly on your CPU using hardware-accelerated Web Crypto. Sensitive API keys or passwords never touch a server.",
    keywords: ["sha256 generator", "hash generator", "sha512 online", "sha1 checksum", "cryptographic hash tool"],
    primaryKeywords: ["sha256 hash generator", "cryptographic hash generator", "sha512 checksum online"],
    secondaryKeywords: ["generate sha256 checksum", "online sha1 calculator", "crypto subtle hash generator"],
    userProblem: "Developers and security analysts who need to verify cryptographic message digests, data integrity, or hash signatures without installing CLI utilities.",
    searchIntent: "Users wanting to paste text or secrets and generate SHA-256, SHA-512, SHA-384, or SHA-1 hashes client-side.",
    resultInterpretation: "Displays exact hexadecimal string representations along with bit length (256-bit, 512-bit) and byte count.",
    practicalGuidance: "Use SHA-256 or SHA-512 for modern cryptographic integrity. SHA-1 is provided for legacy checksum verification.",
    limitations: "MD5 is obsolete and intentionally excluded from W3C Web Crypto for modern cryptographic security.",
    seo: {
      title: "Cryptographic Hash Generator — SHA-256 & SHA-512 Online",
      description: "Generate SHA-256, SHA-512, SHA-384, and SHA-1 cryptographic hashes securely in your browser using W3C Web Crypto API.",
      faqs: [
        {
          q: "Is Web Crypto SHA-256 secure?",
          a: "Yes. It uses your operating system's native hardware cryptographic implementation."
        }
      ]
    }
  },
  {
    id: "stopwatch-timer",
    name: "Online Stopwatch & Countdown Timer",
    slug: "stopwatch-timer",
    category: "fun",
    description: "High-precision millisecond stopwatch with lap recording and customizable countdown alarm with Web Audio beeper alerts.",
    icon: "Timer",
    technology: "HTML5 High Resolution Time API + Web Audio API Synthesis",
    formula: "t_elapsed = Date.now() - t_start",
    trustNotes: "Runs completely client-side in browser memory with zero network dependencies.",
    keywords: ["online stopwatch", "countdown timer online", "lap timer", "precision stopwatch", "online alarm timer"],
    primaryKeywords: ["online stopwatch with laps", "countdown timer online", "millisecond stopwatch"],
    secondaryKeywords: ["online timer with sound alarm", "study sprint countdown timer", "high precision stopwatch online"],
    userProblem: "Students, athletes, chefs, and remote workers who need an accurate stopwatch for lap timing or a countdown timer for focused work sprints.",
    searchIntent: "Searchers looking for a clean, distraction-free stopwatch and countdown alarm that runs in any web browser.",
    resultInterpretation: "Provides large high-contrast digits with milliseconds display, lap history records, and audio buzzer alarm upon completion.",
    practicalGuidance: "Use quick preset buttons (5 min, 15 min, 25 min Pomodoro) to launch countdowns with 1 click.",
    limitations: "Timers run while the browser tab is open. If your computer goes to sleep, the timer will pause until wake.",
    seo: {
      title: "Online Stopwatch & Countdown Timer with Milliseconds & Sound",
      description: "Free online stopwatch with lap recording and countdown alarm timer with audio alerts. Accurate to milliseconds and 100% free.",
      faqs: [
        {
          q: "Does the timer sound an alarm when time expires?",
          a: "Yes, it generates a clear synthesized audio beep using the Web Audio API."
        }
      ]
    }
  }
];

// Append tools that do not already exist
let addedCount = 0;
newTools.forEach((tool) => {
  const existingIdx = utilities.findIndex((u) => u.id === tool.id || u.slug === tool.slug);
  if (existingIdx === -1) {
    utilities.push(tool);
    addedCount++;
  } else {
    utilities[existingIdx] = tool; // Update with latest schema
  }
});

fs.writeFileSync("registry/utilities.json", JSON.stringify(utilities, null, 2), "utf-8");
console.log(`Updated registry/utilities.json: Total Utilities = ${utilities.length} (Added ${addedCount} new utilities)`);
