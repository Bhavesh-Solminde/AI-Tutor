# External Fragmentation in Segmentation

## What is Segmentation?

Segmentation is a memory management technique where a process is divided into **logical segments** — each segment represents a meaningful unit of the program such as:

- **Code segment** — executable instructions
- **Stack segment** — function call stack
- **Data segment** — global/static variables
- **Heap segment** — dynamically allocated memory

Each segment can be of **variable size** and is stored at any available location in physical memory. The OS maintains a **Segment Table** for each process, storing the **base address** and **limit (size)** of every segment.

---

## What is External Fragmentation?

**External fragmentation** occurs when there is enough **total free memory** to satisfy a request, but that free memory is **scattered in small, non-contiguous chunks** — no single contiguous block is large enough.

### Simple Analogy
> Imagine a parking lot with 10 empty spots, but they are scattered across different rows. A bus needs 10 consecutive spots — even though 10 spots exist, the bus cannot park because no 10 spots are adjacent.

---

## Why Segmentation Causes External Fragmentation

Because segments are of **variable sizes** and are loaded/unloaded over time, the physical memory develops "holes" (free gaps) between allocated segments.

### Step-by-Step Example

```
Initial Memory State (Total = 1000 KB):
┌──────────────────────────────────┐
│  OS Kernel  (100 KB)             │  0 - 100
│  Segment A  (200 KB)             │  100 - 300
│  FREE HOLE  (50 KB)              │  300 - 350
│  Segment B  (300 KB)             │  350 - 650
│  FREE HOLE  (100 KB)             │  650 - 750
│  Segment C  (150 KB)             │  750 - 900
│  FREE HOLE  (100 KB)             │  900 - 1000
└──────────────────────────────────┘

Total Free = 50 + 100 + 100 = 250 KB
```

Now suppose a new process needs a segment of **200 KB**:
- Total free = 250 KB ✅ (enough total memory)
- Largest contiguous free block = 100 KB ❌ (not enough in one piece)
- **Result: Allocation FAILS → External Fragmentation!**

---

## Comparing with Internal Fragmentation

| Feature | External Fragmentation | Internal Fragmentation |
|---|---|---|
| **Where it occurs** | Between allocated blocks | Inside an allocated block |
| **Cause** | Variable-size allocation | Fixed-size partitioning |
| **Wasted memory** | Outside allocated regions | Inside allocated regions |
| **Associated with** | Segmentation, dynamic allocation | Paging (fixed page sizes) |
| **Visibility** | Hard to track | Easy to measure |

> **Key insight:** Paging eliminates external fragmentation by using fixed-size pages/frames, but introduces **internal fragmentation**. Segmentation eliminates internal fragmentation but suffers from **external fragmentation**.

---

## Solutions to External Fragmentation in Segmentation

### 1. Compaction (Defragmentation)
Shuffle all segments in memory so all free holes are merged into one large contiguous block.

```
Before Compaction:          After Compaction:
┌─────────────┐             ┌─────────────┐
│ Segment A   │             │ Segment A   │
│ FREE (50KB) │             │ Segment B   │
│ Segment B   │    ──►      │ Segment C   │
│ FREE (100KB)│             │ FREE (250KB)│  ← All holes merged!
│ Segment C   │             │             │
│ FREE (100KB)│             │             │
└─────────────┘             └─────────────┘
```

**Drawbacks of Compaction:**
- Very **expensive** — requires moving large amounts of data
- Processes must be **stopped** during compaction (or use dynamic relocation)
- Requires **dynamic relocation** hardware support (base register must be updated)
- Time complexity is **O(n)** for n bytes moved

### 2. First-Fit / Best-Fit / Worst-Fit Allocation Strategies
Careful placement of segments can reduce (but not eliminate) fragmentation.

| Strategy | Description | Fragmentation Impact |
|---|---|---|
| **First-Fit** | Use the first hole that's big enough | Fast, moderate fragmentation |
| **Best-Fit** | Use the smallest hole that fits | Least waste per allocation, but creates many tiny holes |
| **Worst-Fit** | Use the largest hole | Leaves larger remaining holes |

> **Best-Fit often performs worst** long-term — it fills memory with tiny unusable holes.

### 3. Segmentation with Paging (Hybrid Approach)
Combine both techniques:
- Divide logical space into **segments** (for logical grouping)
- Each segment is further divided into **fixed-size pages**
- Pages are mapped to physical frames (non-contiguous)

This **eliminates external fragmentation** while preserving the logical structure of segmentation.

---

## Segment Table and Address Translation

The **Segment Table** has one entry per segment:

```
Segment Table:
┌─────────┬──────────────┬──────────┐
│ Seg No. │ Base Address │  Limit   │
├─────────┼──────────────┼──────────┤
│    0    │    4000      │   600    │  (Code)
│    1    │    2000      │   300    │  (Stack)
│    2    │    5200      │   400    │  (Data)
└─────────┴──────────────┴──────────┘
```

**Address Translation:**
- Logical address = `(segment number, offset)`
- Physical address = `Base[segment_number] + offset`
- If `offset ≥ Limit` → **Segmentation Fault** (protection violation)

### Example:
- Logical address: segment 2, offset 100
- Physical address: 5200 + 100 = **5300**

---

## External Fragmentation — Key Exam Points

1. **Definition:** Sufficient total free memory exists, but no single contiguous block is large enough.

2. **Root cause in segmentation:** Variable-size segments leave variable-size holes when freed.

3. **Compaction** is the standard solution but is expensive due to data movement overhead.

4. **50% rule (empirical):** On average, for every N allocated blocks, ~0.5N blocks are lost to external fragmentation (about 1/3 of memory wasted).

5. **Segmentation vs Paging:**
   - Segmentation → **External** fragmentation, **no internal** fragmentation
   - Paging → **No external** fragmentation, **internal** fragmentation possible

6. **Best solution in practice:** Segmentation + Paging hybrid, used by x86 architecture (though modern 64-bit OS mostly use flat memory model with pure paging).

---

## Previous Year Exam Questions

**Q1.** What is external fragmentation? How does it arise in a segmented memory system?

**Q2.** Given the following memory layout, determine if a segment of 180 KB can be allocated:
- Hole 1: 70 KB at address 200
- Hole 2: 50 KB at address 500
- Hole 3: 90 KB at address 800
> Answer: Total free = 210 KB > 180 KB, but largest contiguous = 90 KB < 180 KB → **Cannot allocate. External fragmentation.**

**Q3.** Compare internal and external fragmentation with examples.

**Q4.** Explain compaction. Why is it considered expensive?

**Q5.** How does segmentation with paging solve the external fragmentation problem?

---

*Notes prepared for: OS Unit 5 — Memory Management (Segmentation topic)*
