# Operating Systems — Complete Syllabus
**Course Code:** CS-301  
**Credits:** 4  
**Semester:** 5th Semester B.Tech (Computer Science & Engineering)

---

## Unit 1: Introduction to Operating Systems

### 1.1 What is an Operating System?
- Definition and goals of an OS
- OS as a resource manager and extended machine
- Types of Operating Systems: Batch, Time-Sharing, Distributed, Real-Time, Embedded
- OS services and system calls
- User mode vs Kernel mode (Dual-mode operation)
- System calls: types and examples (fork, exec, wait, open, read, write, close)

### 1.2 OS Structure
- Monolithic kernel
- Microkernel
- Layered architecture
- Virtual machines (VMware, JVM concept)
- Exokernel

### 1.3 Process vs Program
- Definition of a process
- Process states: New, Ready, Running, Waiting, Terminated
- Process Control Block (PCB): PID, state, registers, memory limits, open files
- Context switch and its overhead
- Process creation and termination (fork(), exec(), exit(), wait())

---

## Unit 2: Process Scheduling

### 2.1 CPU Scheduling Basics
- CPU–I/O burst cycle
- CPU scheduler and dispatcher
- Preemptive vs Non-preemptive scheduling
- Scheduling criteria: CPU utilization, throughput, turnaround time, waiting time, response time

### 2.2 Scheduling Algorithms
- **First-Come First-Served (FCFS):** Convoy effect, average waiting time
- **Shortest Job First (SJF):** Optimal for average waiting time, non-preemptive and preemptive (SRTF)
- **Round Robin (RR):** Time quantum selection, context switch trade-off
- **Priority Scheduling:** Starvation problem and aging
- **Multilevel Queue Scheduling:** Fixed queue assignment
- **Multilevel Feedback Queue (MLFQ):** Dynamic queue movement, real-world use

### 2.3 Thread Scheduling
- User-level vs Kernel-level threads
- Many-to-one, one-to-one, many-to-many models
- Contention scope: Process Contention Scope (PCS) vs System Contention Scope (SCS)

---

## Unit 3: Process Synchronization

### 3.1 The Critical Section Problem
- Race conditions
- Requirements: Mutual exclusion, progress, bounded waiting
- Peterson's solution (2-process)
- Hardware synchronization: test-and-set, compare-and-swap

### 3.2 Semaphores
- Binary semaphore vs Counting semaphore
- wait() (P) and signal() (V) operations
- Solving critical section with semaphores
- Spinlock vs blocking semaphore
- Deadlock and starvation using semaphores

### 3.3 Classical Synchronization Problems
- **Producer-Consumer Problem** (Bounded Buffer)
- **Readers-Writers Problem** (First and Second variants)
- **Dining Philosophers Problem**

### 3.4 Monitors
- Monitor construct and condition variables
- wait() and signal() in monitors
- Hoare vs Mesa semantics
- Java synchronized blocks (monitors in practice)

---

## Unit 4: Deadlocks

### 4.1 Deadlock Characterization
- Four necessary conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait
- Resource Allocation Graph (RAG): vertices, edges, cycles
- Single instance vs multiple instance resources

### 4.2 Deadlock Handling Strategies
- **Deadlock Prevention:** Deny one of the four conditions
- **Deadlock Avoidance:** Safe state, Banker's Algorithm
  - Safety Algorithm
  - Resource-Request Algorithm
- **Deadlock Detection:** Wait-for graph, detection algorithm for multiple instances
- **Deadlock Recovery:** Process termination, resource preemption

---

## Unit 5: Memory Management

### 5.1 Background
- Logical vs Physical address space
- Address binding: compile time, load time, execution time
- Memory Management Unit (MMU) and dynamic relocation
- Swapping: standard swapping, swapping with paging

### 5.2 Contiguous Memory Allocation
- Fixed partitioning vs Variable partitioning
- External fragmentation and internal fragmentation
- First-fit, Best-fit, Worst-fit allocation strategies
- Compaction

### 5.3 Paging
- Basic paging mechanism and page table
- Page number + offset calculation
- Translation Lookaside Buffer (TLB): effective access time, hit ratio
- Multi-level page tables (2-level, inverted page table)
- Shared pages

### 5.4 Segmentation
- Segmentation with paging
- Segment table: base and limit registers
- External fragmentation in segmentation

---

## Unit 6: Virtual Memory

### 6.1 Demand Paging
- Basic concept: lazy loading
- Page fault: steps to handle a page fault
- Pure demand paging vs pre-paging
- Effective Access Time (EAT) with page faults

### 6.2 Page Replacement Algorithms
- **FIFO:** Bélády's anomaly
- **Optimal (OPT):** Theoretical upper bound
- **Least Recently Used (LRU):** Stack algorithm, counter implementation, stack implementation
- **LRU Approximation:** Reference bit, Second-chance (Clock) algorithm, Enhanced second-chance
- **Counting-based:** LFU, MFU

### 6.3 Frame Allocation
- Fixed allocation vs Priority allocation
- Local vs Global replacement policy
- Thrashing: cause, detection via working-set model
- Working set model and page fault frequency

### 6.4 Memory-Mapped Files
- Concept and advantages
- Shared memory via memory-mapped files

---

## Unit 7: File System Interface

### 7.1 File Concepts
- File attributes: name, identifier, type, location, size, protection, timestamps
- File operations: create, read, write, seek, delete, truncate
- File types: regular files, directories, special files
- Access methods: Sequential, Direct (Random), Indexed

### 7.2 Directory Structure
- Single-level directory
- Two-level directory
- Tree-structured directories
- Acyclic-graph directories (hard links, soft links)
- General graph directory and cycles

### 7.3 File System Mounting
- Mount point
- Remote file systems (NFS concept)
- Virtual File System (VFS) layer

### 7.4 File Sharing and Protection
- Multiple users and owner/group/other model
- Access control list (ACL)
- UNIX chmod permission bits

---

## Unit 8: File System Implementation

### 8.1 File System Structure
- Layered structure: I/O control, basic file system, file-organization module, logical file system
- On-disk structures: boot control block, volume control block, directory structure, FCB (inode)
- In-memory structures: mount table, directory cache, system-wide open-file table, per-process open-file table

### 8.2 Allocation Methods
- **Contiguous Allocation:** Direct access, external fragmentation, file growth problem
- **Linked Allocation:** FAT (File Allocation Table), no external fragmentation, no direct access
- **Indexed Allocation:** Index block, direct/single/double/triple indirect blocks (inode structure)

### 8.3 Free-Space Management
- Bit vector (bitmap)
- Linked list of free blocks
- Grouping and counting methods

### 8.4 Reliability and Performance
- Consistency checking (fsck)
- Log-structured (journaling) file system
- Buffer cache and unified buffer cache
- Read-ahead and write-behind

---

## Unit 9: I/O Systems

### 9.1 I/O Hardware
- I/O devices: block devices, character devices
- Device controllers and device registers
- Polling vs Interrupts vs DMA (Direct Memory Access)
- Memory-mapped I/O

### 9.2 I/O Software
- I/O software layers: interrupt handlers, device drivers, device-independent OS layer, user-space I/O
- Goals: device independence, uniform naming, error handling, synchronous vs asynchronous I/O

### 9.3 Disk Scheduling
- Disk structure: platters, tracks, sectors, cylinders
- **FCFS Disk Scheduling**
- **SSTF (Shortest Seek Time First)**
- **SCAN (Elevator Algorithm)**
- **C-SCAN (Circular SCAN)**
- **LOOK and C-LOOK**
- Selection of disk scheduling algorithm

### 9.4 RAID
- RAID levels: 0, 1, 5, 6, 10
- Striping, mirroring, parity
- Reliability vs performance trade-offs

---

## Unit 10: Security and Protection

### 10.1 Protection
- Goals of protection
- Domain of protection and access matrix
- Access control list (ACL) vs Capability list
- Revocation of access rights

### 10.2 Security
- Security problem and threats: viruses, worms, Trojans, denial-of-service
- Authentication: passwords, biometrics, two-factor
- Encryption: symmetric vs asymmetric
- System and network threats
- Cryptography as a security tool

---

## Reference Books

1. **Abraham Silberschatz, Peter B. Galvin, Greg Gagne** — *Operating System Concepts* (10th Ed.) — "Dinosaur Book"
2. **Andrew S. Tanenbaum** — *Modern Operating Systems* (4th Ed.)
3. **William Stallings** — *Operating Systems: Internals and Design Principles* (9th Ed.)

---

## Previous Year Exam Topics (High Frequency)

| Topic | Frequency |
|---|---|
| CPU Scheduling (FCFS, SJF, RR, Priority) — numerical | ★★★★★ |
| Banker's Algorithm — safety + resource-request | ★★★★★ |
| Page Replacement (FIFO, LRU, OPT) — numerical | ★★★★★ |
| Semaphores and Critical Section | ★★★★☆ |
| Memory Allocation — paging, segmentation numericals | ★★★★☆ |
| Deadlock — RAG, four conditions | ★★★★☆ |
| Disk Scheduling — SCAN, C-SCAN numericals | ★★★☆☆ |
| File Allocation Methods | ★★★☆☆ |
| Virtual Memory — demand paging, thrashing | ★★★☆☆ |
| Monitors and Classical Problems | ★★★☆☆ |

---

*This syllabus covers 10 units suitable for a 4-credit OS course. Paste this into NeuralNest to generate a study roadmap with 30+ topic nodes.*
