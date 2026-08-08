---
title: "Computer Organization: Datapath Control"
description: "Course notes on pipelining, finite state machines, combinational logic, datapath construction, control, loads, stores, branches, JALR, U-types, and CSRs."
publishDate: "2026-07-06"
tags: ["course-notes","computer-architecture","risc-v"]
pinned: false
giscus: false
---

[Course index](../) · [Previous: Formats and Logic](../formats-logic/) · [Next: Cache](../cache/)

## Pipelining for Performance

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430105725.webp" alt="Pasted image 20260430105725" width="472" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430110016.webp" alt="Pasted image 20260430110016" width="465" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430110250.webp" alt="Pasted image 20260430110250" width="463" loading="lazy" />

对比上一页，左侧的电路图发生了一个极其关键的变化：在加法器 (`+`) 和移位器 (`Shifter`) 之间，**被强行插入了一个新的寄存器 `reg2`**。
- **原来的状态：** 数据必须在 1 个时钟周期内，一口气跑完“加法器 + 移位器”全程，导致时钟节拍必须打得很慢。
- **现在的状态：** 这条漫长的路被 `reg2` 拦腰截断，分成了**两个独立的流水线阶段 (Stages)**：
- **Stage 1：** 从 `reg1` 到 `reg2`（只包含加法器）。
- **Stage 2：** 从 `reg2` 到 `reg3`（只包含移位器）。

 **核心优势一：时钟频率飙升 (Higher clock frequency)**
看右侧时序图 (Timing) 的第一行 `CLK`。你会发现，现在的时钟波形比上一页**密集得多（周期变短了，频率变高了）**。
- **为什么能变快？** 因为现在时钟周期不再受制于“加法+移位”的总延迟。它现在只需要等待两个阶段中**较慢的那一个**算完即可（比如假设加法器比移位器慢，那么时钟周期只要略大于加法器的延迟就行了）。
- 这就好比原本要求工人一天内造完一整辆车；现在把流水线拆分，A 工人只负责造底盘，B 工人只负责装外壳，交接节奏（时钟频率）自然可以大幅加快。

*核心优势二：吞吐量大爆发 (More outputs per second)**

这是流水线技术真正的威力所在，也是右侧时序图最想展示的**并发 (Concurrency)** 过程：
让我们追踪一下数据 `(i)` 和紧随其后的数据 `(i+1)` 的轨迹：
- **第 1 个时钟周期：** 数据 `(i)` 进入加法器进行计算，算完的结果 `Si` 停在 `reg2` 门口等待。
- **第 2 个时钟周期（高光时刻！）：** * 数据 `(i)` 的加法结果被 `reg2` 抓取，进入**移位器**继续处理。
- **与此同时**，加法器并没有闲着！新的数据 `(i+1)` 进入了**加法器**开始计算。
- **结果：** 此时此刻，加法器和移位器在**同时工作**，分别处理两条不同的数据。
在此之后，每一个时钟周期（虽然周期变短了），`reg3` 都会稳定地吐出一个最终结果（`Ri`, `Ri+1`, `Ri+2`...）。整体产出数据的速度（吞吐量）几乎翻倍！

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430110513.webp" alt="Pasted image 20260430110513" width="471" loading="lazy" />

## Finite State Machines

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430110605.webp" alt="Pasted image 20260430110605" width="479" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430110810.webp" alt="Pasted image 20260430110810" width="471" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430111142.webp" alt="Pasted image 20260430111142" width="471" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430111322.webp" alt="Pasted image 20260430111322" width="464" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430111551.webp" alt="Pasted image 20260430111551" width="468" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430111612.webp" alt="Pasted image 20260430111612" width="478" loading="lazy" />

## Combinational Logic

# Single-Cycle CPU

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430112421.webp" alt="Pasted image 20260430112421" width="464" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430112919.webp" alt="Pasted image 20260430112919" width="502" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430113339.webp" alt="Pasted image 20260430113339" width="495" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430114942.webp" alt="Pasted image 20260430114942" width="494" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430114954.webp" alt="Pasted image 20260430114954" width="490" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430115007.webp" alt="Pasted image 20260430115007" width="520" loading="lazy" />

这个register file读写方式是，当write enable=1时才能写，在RW输入寄存器编号，busW中输入存储的数值。RA、RB中输入读取的寄存器编号，busA和busB输出RA、RB中的数值
并且可以发现，可以同时写1个，读2个

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430130636.webp" alt="Pasted image 20260430130636" width="516" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430130649.webp" alt="Pasted image 20260430130649" width="498" loading="lazy" />

## R-Type Add Datapath

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430130724.webp" alt="Pasted image 20260430130724" width="509" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430130740.webp" alt="Pasted image 20260430130740" width="508" loading="lazy" />

**sub**

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430130823.webp" alt="Pasted image 20260430130823" width="515" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430130836.webp" alt="Pasted image 20260430130836" width="503" loading="lazy" />

## Datapath With Immediates

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430131547.webp" alt="Pasted image 20260430131547" width="513" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430131608.webp" alt="Pasted image 20260430131608" width="505" loading="lazy" />

## Supporting Loads

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430132414.webp" alt="Pasted image 20260430132414" width="506" loading="lazy" />

- ALU 算出的物理地址直接顺着导线连到了 **DMEM (数据内存)** 的 `addr` 端口。
- 控制大脑发出 **`MemRW = Read`**（读使能信号）。
- DMEM 收到地址和读命令后，从它浩瀚的存储阵列中找到对应的数据，并把它吐到 `DataR` 线上。

## store

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430133104.webp" alt="Pasted image 20260430133104" width="522" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430133143.webp" alt="Pasted image 20260430133143" width="512" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430133219.webp" alt="Pasted image 20260430133219" width="501" loading="lazy" />

上图为立即数生成器设计
## Branches

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430133637.webp" alt="Pasted image 20260430133637" width="500" loading="lazy" />

不同之处是PC不一定➕4，可能是加一个offset（立即数）

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430134242.webp" alt="Pasted image 20260430134242" width="499" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430134302.webp" alt="Pasted image 20260430134302" width="464" loading="lazy" />

## Adding JALR to Datapath

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430134922.webp" alt="Pasted image 20260430134922" width="460" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430134934.webp" alt="Pasted image 20260430134934" width="461" loading="lazy" />

jal也是类似：

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430135033.webp" alt="Pasted image 20260430135033" width="457" loading="lazy" />

## Adding U-Types

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430135223.webp" alt="Pasted image 20260430135223" width="445" loading="lazy" />

让 ALU 执行一个叫 **`Pass B` (直接透传 B 端口数据)** 的特殊操作
立即数生成器需要在数字末尾补12个0

最终：

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430135645.webp" alt="Pasted image 20260430135645" width="454" loading="lazy" />

## Control and Status Registers

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430140137.webp" alt="Pasted image 20260430140137" width="450" loading="lazy" />

我们之前拼命折腾的 `x0-x31` 被称为**通用寄存器 (GPR)**，它们是给程序员和 ALU 算数用的。而 **CSR 是一套完全独立的寄存器系统**，它们不在那个拥有 32 个坑位的寄存器堆里

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430140228.webp" alt="Pasted image 20260430140228" width="463" loading="lazy" />

上图的表格展示了 RISC-V 如何利用这几条基础的 CSR 指令，通过不同的参数组合，来实现对“仪表盘”（CSR 寄存器）的**只读、只写或读写**操作

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430141639.webp" alt="Pasted image 20260430141639" width="452" loading="lazy" />

CSR Instruction也是使用cpu的data path执行

## Datapath Control

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430142013.webp" alt="Pasted image 20260430142013" width="459" loading="lazy" />

=* 代表无关项

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430142349.webp" alt="Pasted image 20260430142349" width="455" loading="lazy" />

Timing：

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430142410.webp" alt="Pasted image 20260430142410" width="452" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430142526.webp" alt="Pasted image 20260430142526" width="450" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430143043.webp" alt="Pasted image 20260430143043" width="450" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430143054.webp" alt="Pasted image 20260430143054" width="447" loading="lazy" />

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260430143108.webp" alt="Pasted image 20260430143108" width="441" loading="lazy" />

# Cache
问题引入：CPU比DRAM快很多怎么办

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260510144052.webp" alt="Pasted image 20260510144052" width="484" loading="lazy" />

---

[Course index](../) · [Previous: Formats and Logic](../formats-logic/) · [Next: Cache](../cache/)
