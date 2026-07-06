---
title: "Computer Organization: Virtual Memory"
description: "Course notes on operating-system functions, virtual memory, physical memory, paging, page faults, hierarchical page tables, TLBs, and VM performance."
publishDate: "2026-07-06"
tags: ["course-notes","computer-architecture"]
pinned: false
giscus: false
---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: Cache](../computer-organization-system-architecture-cache/) · [Next: I/O and Parallelism](../computer-organization-system-architecture-parallelism/)

## OS Functions

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110508.webp" alt="Pasted image 20260523110508" width="512" loading="lazy" />

:::note[线程(Process) VS 进程（Threads）]
- **进程 (Process):** 在操作系统眼里，运行起来的应用程序统称为“进程”。进程最大的特点是**内存隔离 (separate memory)**。OS 会为每个进程分配独立的虚拟内存空间，一个进程崩溃通常不会直接带走另一个进程。
- **线程 (Thread):** 线程是进程内部的执行单元，它们**共享内存 (shared memory)**。
- 这俩都能在 CPU 上（通过系统调度）实现**伪并发 (pseudo simultaneously)** 运行。
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110532.webp" alt="Pasted image 20260523110532" width="511" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110836.webp" alt="Pasted image 20260523110836" width="519" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110907.webp" alt="Pasted image 20260523110907" width="515" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110924.webp" alt="Pasted image 20260523110924" width="508" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523111028.webp" alt="Pasted image 20260523111028" width="499" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523111205.webp" alt="Pasted image 20260523111205" width="504" loading="lazy" />

当时间片（Time Slice）耗尽，硬件定时器就会“响”。这个“响声”是一个硬件中断（interrupt）
这个中断会强制 CPU 暂停当前的用户程序，将状态切换为管态（Supervisor Mode），并自动跳转回操作系统内核的 Trap Handler 中。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523111607.webp" alt="Pasted image 20260523111607" width="501" loading="lazy" />

## Virtual Memory

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523115427.webp" alt="Pasted image 20260523115427" width="506" loading="lazy" />

## Physical Memory and Storage

- **DRAM（动态随机存取存储器）：** 它的基本存储单元是由**1 个电容和 1 个晶体管**组成的。电容就像一个小水桶，里面有电荷代表 `1`，没电荷代表 `0`。但是电容天生会漏电（水桶漏水），如果不去管它，数据很快就会丢失。因此，系统必须每隔几毫秒就对 DRAM 进行一次读取和重写（补水），这个动作叫做“刷新”（Refresh）。因为它需要不断地动态刷新来维持数据，所以叫“动态”。
- **SRAM（静态随机存取存储器）：** 它的基本存储单元通常是由 **6 个晶体管**组成的“触发器”电路。只要不断电，这个电路就能像跷跷板一样死死卡在 `1` 或 `0` 的状态，绝对不会漏电。因为它**不需要定时刷新**就能稳定保存数据，所以叫“静态”。

| **特性**   | **SRAM (静态 RAM)**                | **DRAM (动态 RAM)**              |
| -------- | -------------------------------- | ------------------------------ |
| **存储结构** | 触发器（多晶体管，通常 6 个）                 | 电容 + 晶体管（1T1C）                 |
| **数据维持** | **不需要刷新**                        | **必须持续不断地刷新**                  |
| **读写速度** | **极快**（延迟极低，能跟上 CPU 的速度）         | **较慢**（充电/放电及刷新机制导致延迟）         |
| **存储密度** | 低（一个单元占地面积大，总容量小）                | **极高**（结构极其简单，可以密集排布）          |
| **制造成本** | **极其昂贵**（按 MB 计算）                | **非常便宜**（按 GB 计算）              |
| **功耗表现** | 待机功耗极低                           | 功耗相对较高（因为需要频繁执行刷新动作）           |
| **常见用途** | **CPU 内部缓存**（L1 / L2 / L3 Cache） | **计算机主存**（你买的 DDR4 / DDR5 内存条） |

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523113804.webp" alt="Pasted image 20260523113804" width="537" loading="lazy" />

storage主要就是指disk，SSD（固态硬盘），HDD（机械硬盘）
SSD 是一种完整的存储设备，而 Flash Memory（特别是 NAND Flash）是 SSD 内部用来真正存放数据的载体。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523114801.webp" alt="Pasted image 20260523114801" width="529" loading="lazy" />

## Memory Manager
问题的引入：

:::note[核心痛点]
1、 安全隔离
裸机（Bare Metal）状态下，CPU（Processor）发出的所有读取（Load）和写入（Store）指令，带的都是**真实的物理地址（Real physical addresses）**。
- **核心痛点——毫无隐私与安全可言：** 如图所示，CPU 和内存之间没有任何安检措施。这意味着，任何一个运行的程序，都可以随心所欲地生成一个物理地址，去访问内存的**任何角落**。
    - 它可以去读写其他程序的内存。
    - 更致命的是，它可以去改写**操作系统的核心数据结构（OS data structures）**。如果一个普通程序（哪怕是因为写错了一个指针）覆盖了操作系统的代码，整台机器瞬间就会崩溃死机。

- **引出解决思路：** 必须在 CPU 和真实物理内存（DRAM）之间设立一个“海关”或**翻译机制（Translation mechanism）**。所有程序发出的地址都必须经过操作系统的审查，确认“你有权限访问这块地盘”后，才能真正放行。

2、高效共享The Multiprogramming Challenge
操作系统通过极快的“上下文切换（Context Switch）”在不同进程之间轮转 CPU 控制权。在切换时，只需要保存和恢复那几十个寄存器（Registers）的数据就行了，速度极快。
CPU 核心可以分时复用，寄存器可以快速保存。**但是物理内存只有一个（There is only one!）** 操作系统想要给这 100 多个进程每个都制造一种“幻觉”——让每个进程都觉得自己拥有一个完整的、独占的 CPU（通过上下文切换实现）和一个完整的、独占的内存空间。

并且由于不同的电脑内存大小不一样，有些软件会超出内存，虚拟内存会让进程认为自己有一个超大的内存空间


:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523115312.webp" alt="Pasted image 20260523115312" width="528" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523115330.webp" alt="Pasted image 20260523115330" width="538" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523115348.webp" alt="Pasted image 20260523115348" width="536" loading="lazy" />

## Paged Memory

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523130416.webp" alt="Pasted image 20260523130416" width="534" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523130625.webp" alt="Pasted image 20260523130625" width="548" loading="lazy" />

操作系统把虚拟内存和真实的物理内存（DRAM）都切分成固定大小的“块”，这个块就叫做**页（Page）**。通常一页的大小是 4KB。
翻译的时候，我们不再精确到每一个字节，而是**以“页”为单位进行粗粒度翻译**。
分页翻译的本质，就是“替换页号，保留偏移量”

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523131045.webp" alt="Pasted image 20260523131045" width="541" loading="lazy" />

这一页ppt计算了一个进程的page table有足足4MB，cache根本装不下，只能把这个巨大的“翻译字典（页表）”存放到普通的物理内存（DRAM）中。这就会带来访问DRAM需要两次。DRAM 的速度比 CPU 慢上百倍。现在所有内存操作都要磨洋工做两次，**这直接导致整个计算机的运行速度被拦腰斩断（降低 50% 以上）**。这是绝对无法接受的。

如何挽救性能？ (How could we minimize the penalty?)
为了不让虚拟内存机制拖垮整台电脑，PPT 底部提出了两种利用“缓存（Cache）”思想的拯救方案：
- **方案一：利用空间局部性 (Exploit spatial locality)** 当系统去 DRAM 查页表时，不要只拿当前需要的那一条记录（Word），而是干脆把那一整块（Block）相邻的翻译记录都顺手搬进 CPU 内部的高级缓存中。因为程序运行时，往往倾向于连续访问相邻的内存。
- **方案二：专门为页表建一个 VIP 缓存 (Use a cache for frequently used page table entries...)** 既然 4 MiB 的完整字典塞不进 CPU，那我们就把**最频繁查询的那几条/几十条翻译记录**，单独提取出来，存放在 CPU 内部一块极小、极快的专属缓存中。

## Page Faults

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523130827.webp" alt="Pasted image 20260523130827" width="564" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523131259.webp" alt="Pasted image 20260523131259" width="551" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523131643.webp" alt="Pasted image 20260523131643" width="545" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523131959.webp" alt="Pasted image 20260523131959" width="551" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523132017.webp" alt="Pasted image 20260523132017" width="565" loading="lazy" />

DISK只能接受write-back，因为write-through很慢

## Hierarchical Page Tables

:::note[Page Table页表是一个类似字典的结构]
Virtual Memory中的offset(后12位)在翻译过程中会透传，表示在某一页中的相对位置（offset）。那么将VM Address翻译成真实的Physical Memory Address就是需要查询Page table，因此页表的作用就是将 VM Address 映射为Physical Memory Address
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529162903.webp" alt="Pasted image 20260529162903" width="531" loading="lazy" />

问题的引入：单级的Page table，一个就需要4MB，如果有很多进程，会很占用内存！

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529163440.webp" alt="Pasted image 20260529163440" width="510" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529163540.webp" alt="Pasted image 20260529163540" width="502" loading="lazy" />

:::note[PTE]
上面说了页表类似一个字典，这个字典是利用一块连续地址的内存实现，那么它的键实际上就是利用VPN在memory中找到的一个地址，然后这个memory中存储的就是一个Page Table Entry(PTE)，“值”。它是32位的，结构如上图，如果说它是一个叶子PTE节点，那么它里面存储PPN就可以直接找到真实的物理地址(PPN[1] + PPN[0] + offset拼接起来)；如果不是叶子PTE节点，那么它的PPN指向下一级页表的基地址，具体来说，是 PPN[0] 拼接 PPN[1] 拼接12位0
:::

:::tip[寻址过程]
首先根据SPTBR查询一级页表 (L1) 在物理内存中的基地址Address1，然后访问memory address：$Address1 + (VPN[1] \times 4)$得到32位的L1 PTE，因为PTE中包含了PPN[1],PPN[0]等等，去除12位的状态位，得到$(PPN[0]+PPN[1])<<12$就是对应L2 Page Table在memory中的基地址：$Address2$。然后再访问$Address2 + (VPN[0] \times 4)$得到32位的L2 PTE，再根据其$(PPN[1] + PPN[0] + offset)$得到真实物理地址。
- 上述过程中，PTE的R，W，X位都为0标记其不是一个叶子节点。如果V=0会报Page Fault
- 上述过程中，$VPN[0],[1]$需要乘4是因为每一个PTE（页表的值）是32位的，而memory中一个address存储的是8位1字节，因此需要乘4
- 上述过程中$PPN[0] + PPN[1]$代表拼接
- 并且通过上述过程，我们还发现L2 Page Table的基地址的后12位都是0，事实上所有的Page Table的基地址都是
:::

## Translation Lookaside Buffers（TLB）

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529174608.webp" alt="Pasted image 20260529174608" width="534" loading="lazy" />

问题：之前提到过，如果用1级页表，那么每次翻译虚拟内存需要2次访问内存；如果用2级页表，每次翻译虚拟内存需要2次访问内存，以此类推。所以我们需要一个buffer（为什么不叫cache是因为它出现的时间比cache早）

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529174739.webp" alt="Pasted image 20260529174739" width="525" loading="lazy" />

TLB 就是把多级页表寻址的最终结果（叶子 PPN + 权限位）**和**初始输入（VPN）直接绑定在一起的缓存。
也就是说，无论用的是几个级别的Page Table，直接拿原始的VPN去查，hit了查到的就是最终叶子节点的PPN.
上图中是一个全相联的TLB结构，直接拿VPN当作tag（索引），去TLB里找PPN，因为是全相联，会判断TLB中所有的tag有没有一个是等于VPN的

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529174804.webp" alt="Pasted image 20260529174804" width="516" loading="lazy" />

:::note[TLB Reach （TLB 覆盖范围）]
这是这页 PPT 最关键的一个概念，直接决定了底层软件的性能上限。
- **定义：** TLB 能同时映射的虚拟内存最大总和。
- **公式：** **TLB Reach=TLB 条目数×页面大小 (Page Size)**
- **举个例子：** 如果 TLB 有 64 项，页面大小是 4KB，那么 TLB Reach=64×4KB=256KB。
- **现实中的性能灾难（TLB 颠簸）：** 如果你的程序在跑一个极其吃内存的算法（比如遍历一个 50MB 的大数组），而你的 TLB Reach 只有 256KB。这意味着 CPU 会在非常短的时间内跨越海量的页面。TLB 会疯狂发生 Miss，CPU 会把大量时间浪费在查内存页表上，导致性能暴跌。
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529174920.webp" alt="Pasted image 20260529174920" width="507" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529174856.webp" alt="Pasted image 20260529174856" width="509" loading="lazy" />

（上图VPN被分为tag和index是因为这里使用的是组相联 or direct-map）

## TLBs in Datapath

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529195920.webp" alt="Pasted image 20260529195920" width="492" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529195932.webp" alt="Pasted image 20260529195932" width="521" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529195951.webp" alt="Pasted image 20260529195951" width="505" loading="lazy" />

## VM Performance

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529195443.webp" alt="Pasted image 20260529195443" width="484" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529200105.webp" alt="Pasted image 20260529200105" width="477" loading="lazy" />

:::note[Page Hit/Miss]
这里Page hit指的是数据在内存中
Page Miss指的是该页不在内存中，触发Page fault，操作系统接管，去磁盘中读数据

Page hit / miss：关心的是“页面本身是否在主存里”
TLB hit / miss：关心的是“页表项是否在 TLB 里”
所以Page hit可能是TLB hit也可能是TLB miss
:::

:::note[Demand Paging]
按需加载页，也就是上述说的Paged Memory的全部
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529201658.webp" alt="Pasted image 20260529201658" width="472" loading="lazy" />

其实这里还是这样算比较好，no paging：
$$
1 + 5\% \times (10 + 40\% \times 200)
$$
加上虚拟内存的Page miss之后，区别是：L2 miss之后会访问memory（DRAM），因此需要使用TLB翻译VM，然后看看数据页是否在内存中，若在内存中Page hit，否则就要去磁盘Page miss：
$$
\begin{aligned}
&L1_{hit} + L1_{miss-rate} \times L1_{miss-penalty} \\
= &L1_{hit} + L1_{miss-rate} \times (L2_{hit} + L2_{miss-rate} \times L2_{miss-penalty}) \\
= &L1_{hit} + L1_{miss-rate} \times (L2_{hit} + L2_{miss-rate} \times (PageHit + PageMiss \times MissPenalty))) \\
=& 1 + 0.05 \times(10 + 0.4 \times (200 + 0.01 \times 20M))\\
=& 4005.5 \quad Cycle
\end{aligned}
$$

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529201707.webp" alt="Pasted image 20260529201707" width="501" loading="lazy" />

$HR_{Mem}$就是Hit Rate of Main Memory（主存命中率）
# I/O

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529213051.webp" alt="Pasted image 20260529213051" width="509" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530163301.webp" alt="Pasted image 20260530163301" width="493" loading="lazy" />

:::note[Memory Mapped IO]
**Memory-Mapped I/O (MMIO)**，即**内存映射 I/O**，是计算机中 CPU 与外部设备（如网卡、显卡、硬盘控制器等）进行通信和数据交换的一种架构设计和技术。

它的核心思想非常直接：**将外设的内部寄存器或设备内部的存储器，映射到 CPU 的主内存（RAM）物理地址空间中。**

这样一来，在 CPU 看来，与外部设备打交道就如同读写普通的内存条一样。

它是如何工作的？

1. **统一地址空间：** 计算机的物理地址空间不仅包含真实的内存条（RAM），还预留了一部分地址分配给各个外部设备。
2. **相同的指令集：** 当 CPU 想要向设备发送控制命令或读取数据时，它不需要使用特殊的 I/O 指令。它只需向被分配给该设备的特定“内存地址”发送常规的读写指令（如汇编语言中的 `LOAD` 或 `STORE`）。
3. **总线路由：** 计算机的主板芯片组或内存控制器会监听这些地址。如果 CPU 访问的地址属于物理 RAM，数据就会存入内存条；如果访问的地址属于某个外设的映射区域，硬件总线（如 PCIe 总线）就会将这次读写操作直接路由到对应的外设寄存器中。
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530163555.webp" alt="Pasted image 20260530163555" width="499" loading="lazy" />

---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: Cache](../computer-organization-system-architecture-cache/) · [Next: I/O and Parallelism](../computer-organization-system-architecture-parallelism/)
