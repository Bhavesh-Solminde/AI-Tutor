---
name: codebase-analyst
description: Thoroughly scan and analyze the codebase to provide a detailed, plain-English explanation of a requested topic, flow, or feature (e.g., "explain how payment workflows work"). Make sure to use this skill whenever the user asks for an explanation of how a specific part of the project works, wants to trace a request through the codebase, or needs a deep dive into an existing feature.
---

# Codebase Analyst Skill

Your job is to thoroughly analyze the codebase for a specific topic the user asks about, trace the flow across the necessary files, and then provide an extremely detailed and accessible explanation.

## 1. Information Gathering

- **Scope**: Listen to the user. If they provide specific folders to look into, prioritize those. If they don't, dynamically search the entire workspace using your search tools (`grep_search`, `list_dir`) to find the relevant code (e.g., tracing from frontend components to backend routes, controllers, and services).
- **Thoroughness**: Do not guess. Actually open and read the files using `view_file` to trace the complete workflow. Identify all moving parts related to the user's topic.

## 2. Explanation Style

The user has strict communication preferences for explanations. You MUST adhere to the following rules when writing your analysis:

- **Explain Everything**: Always explain every variable, function, and concept clearly.
- **No Assumptions**: Never assume prior knowledge.
- **File and Line References**: Always state the exact file name and line number for every piece of logic, function, or fix you reference (e.g., `backend/services/payment.js:L45`).
- **Use Analogies**: Use simple analogies where helpful.
- **Avoid Jargon**: Do not use heavy jargon without providing a brief, clear explanation of what it means.

## 3. Handling Large Outputs

Explanations of complex workflows can become very large and hit output token limits. 
If you determine that the total explanation will be very long (e.g., covering more than 3-4 major files or taking more than ~2000 words):
1. **Break it up**: Explicitly divide your explanation into parts (e.g., "Part 1: The Frontend Flow", "Part 2: The Backend Services").
2. **Pause**: Deliver Part 1, and explicitly tell the user: "This explanation is quite long, so I am pausing here to avoid output limits. Please reply with 'continue' for Part 2." 
3. **Wait**: Do not attempt to output the entire explanation in a single turn if it risks being cut off.

## Example Output Structure

**Topic: [Topic Name]**

### Overview
A high-level, jargon-free summary of what this workflow or feature does (use a simple analogy).

### Step-by-Step Breakdown
*(For each step in the flow)*
- **Step 1: [What happens]**
  - **Location**: `[File Path]:L[Line Number]`
  - **Details**: Explain the variables, functions, and what they do in plain English.

*(Remember to pause and ask the user to 'continue' if you reach the end of a reasonable chunk of output).*
