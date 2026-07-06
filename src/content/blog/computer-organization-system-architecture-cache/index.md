---
title: "Computer Organization: Cache"
description: "Course notes on memory hierarchy, cache mapping, direct-mapped caches, cache reads and writes, miss types, associativity, replacement, LRU, and AMAT."
publishDate: "2026-07-06"
tags: ["course-notes","computer-architecture"]
pinned: false
giscus: false
---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: Datapath Control](../computer-organization-system-architecture-datapath-control/) · [Next: Virtual Memory](../computer-organization-system-architecture-virtual-memory/)

## Memory Hierarchy

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510145519.webp" alt="Pasted image 20260510145519" width="481" loading="lazy" />

Caches always contain a copy of the lower levels
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510151024.webp" alt="Pasted image 20260510151024" width="474" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510151427.webp" alt="Pasted image 20260510151427" width="472" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510152541.webp" alt="Pasted image 20260510152541" width="471" loading="lazy" />
 （缓存如何设计）
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510152609.webp" alt="Pasted image 20260510152609" width="460" loading="lazy" />

### **Direct-Mapped Cache**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510155752.webp" alt="Pasted image 20260510155752" width="459" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510155802.webp" alt="Pasted image 20260510155802" width="447" loading="lazy" />
 一般来说我们把缓存的宽度画成和memory一样
 上图是 1byte wide，因为**1 Byte (8 bits)** 是 CPU 能够通过内存地址直接去读取或写入的最小数据块。
 这里cache运用了取余数的思想，比如说memory address为0、4、8...会进入cache的0
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510155948.webp" alt="Pasted image 20260510155948" width="442" loading="lazy" />
- 但是我们需要更大width的缓存，如上图是2 bytes wide,我们可以把内存也切成一个个 2 Bytes 的块
- 还是利用取模，内存地址的二进制位的倒数第2，3位代表了在cache的位置（cache index），倒数第一位表示cache中的列
- Cache Index（缓存索引）就像是 Cache 内部的“房间号”或“槽位号（Slot），上图中是0、1、2、3
- 举个例子，memory address=6=0b0110,得到cache index=11, offset=0
- 当然我们需要tag，正因为这是一个“多对一”的映射关系（比如地址 0、8、10、18 都会被硬性分配到 Cache Index 0），所以当 CPU 去 Cache Index 0 找数据时，它怎么知道现在里面装的是地址 0 的数据，还是地址 8 的数据呢？
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510160945.webp" alt="Pasted image 20260510160945" width="470" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510161022.webp" alt="Pasted image 20260510161022" width="474" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510161134.webp" alt="Pasted image 20260510161134" width="472" loading="lazy" />

一行是一个cache block，并且他们共享tag值

:::note[Example: 例1 （作业5T1）]
某 RISCV 处理器使用 32 位地址，L1 数据缓存配置为：容量 = 32 KiB，块大小 = 128 字节，直接映射
（1）计算缓存行数、索引位数、块内偏移位数、标记位数。
（2）将地址 0x2004A 分解为标记、索引和偏移。
（3）若缓存初始为空，访问地址 0x20000、0x20080、0x20100、0x20080 分别命中/缺失？

:::tip[解答]
（1）直接计算TIO，offset有 $128B=2^7 B$ 需要7位，计算行数：$32KiB / 128B = 256 Rows$ 需要8个二进制位，Tag位数 $32-7-8=17$ 位，因此 Rows=256，index位数8，offset位数7，Tag位数17
（2）转化为2进制：$0x2004A=0b 0010 0000 0000 0100 1010$所以$offset=0b1001010,index=0,tag=0b100$
（3）先看0x20000，offset=0, index=0, tag=0x4 ,冷启动，cache miss ;
接下去0x20080, offset=0, index=0x1, tag=0x4,  冷启动，cache miss;
接下去0x20100, offset=0, index=0x2, tag=0x4,  冷启动，cache miss;
接下去0x20180, offset=0, index=0x1, tag=0x4,  tag匹配，cache hit;
:::
:::

## Direct-Mapped Cache Example
Directed Cache

## Memory Access With Cache

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516165250.webp" alt="Pasted image 20260516165250" width="477" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516165303.webp" alt="Pasted image 20260516165303" width="477" loading="lazy" />

## Cache Terminology

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516172437.webp" alt="Pasted image 20260516172437" width="483" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516172448.webp" alt="Pasted image 20260516172448" width="488" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516172531.webp" alt="Pasted image 20260516172531" width="488" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516172545.webp" alt="Pasted image 20260516172545" width="473" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516172619.webp" alt="Pasted image 20260516172619" width="512" loading="lazy" />
 Valid Bit不占据32位TIO中的一位！

## Read Cache
read Cache的顺序：IVTO：index , Valid, Tag , Offset
当tag不匹配的时候，进行block replacement

## Cache Write

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516211917.webp" alt="Pasted image 20260516211917" width="529" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516212233.webp" alt="Pasted image 20260516212233" width="518" loading="lazy" />

Write-through和write-back现在都有在不同的地方应用

:::note[Example: 例1 （作业5 T3）]
考虑一个 RISCV 处理器，总线传输一个缓存块需要 50 周期。L1 命中时间 2 周期。程序统计：
- 读操作占 50%，写操作占 50%
- 读缺失率 = 4%，写缺失率 = 2%
- 写命中时，写直达需额外 50 周期写回总线；写回仅标记脏位，替换时 30% 的块是脏的
**问题：**
(1) 分别计算写直达与写回策略下的平均内存访问时间（AMAT）。
(2) 写回比写直达节省多少百分比的平均访问时间
:::

（1）
写直达：AMAT=0.5 x (2 + 50 x 0.04) + 0.5 x (2 + 50 x 0.02 + 50) = 0.5 x 4 + 0.5 x 53 = 28.5
写回： AMAT=0.5x(2 + 50 x 0.04 + 50 x 0.04 x 0.3 ) + 0.5 x (2 + 50 x 0.02 + 50 x 0.02 x 0.3) = 3.95

## Block Size Tradeoff

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516212539.webp" alt="Pasted image 20260516212539" width="510" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516212737.webp" alt="Pasted image 20260516212737" width="503" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516212847.webp" alt="Pasted image 20260516212847" width="505" loading="lazy" />

## Types of Cache Misses

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516213213.webp" alt="Pasted image 20260516213213" width="497" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516213230.webp" alt="Pasted image 20260516213230" width="505" loading="lazy" />

“Tag 不匹配”是硬件检测到缓存未命中的**表象**，但导致这个表象的原因并不只有 Conflict

## Fully Associative Cache

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516215643.webp" alt="Pasted image 20260516215643" width="500" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516215701.webp" alt="Pasted image 20260516215701" width="506" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516215715.webp" alt="Pasted image 20260516215715" width="503" loading="lazy" />

难点主要是硬件实现很难

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516215739.webp" alt="Pasted image 20260516215739" width="508" loading="lazy" />

在 Fully Associative Cache（全相联缓存）中，**绝对不存在 Conflict Miss（冲突缺失）**。
并且Capacity Miss主要出现在 Fully Associative Cache

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516220237.webp" alt="Pasted image 20260516220237" width="505" loading="lazy" />

一开始考虑一个全相联、无限大的缓存，遇到的miss就是compulsory
接下去将这个cache变成全相联、有限大的缓存，遇到的miss除去之前的compulsory miss，就是capacity miss
最后将这个cache变成有限相联、有限大的缓存，遇到的miss除去之前的就是conflict miss

## Set-Associative Caches

每个组包含很多blocks，同一个组内是全相联结构

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516231743.webp" alt="Pasted image 20260516231743" width="497" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000511.webp" alt="Pasted image 20260517000511" width="497" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000529.webp" alt="Pasted image 20260517000529" width="486" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000548.webp" alt="Pasted image 20260517000548" width="488" loading="lazy" />

:::tip[缓存行]
虽然上图把一个set画在同一行里，但是一般缓存行等价于缓存块
:::

:::note[Example: 例1（作业5T2）]
某 RISC-V 处理器 L1 数据缓存：容量 = 64 KiB， 块大小 = 64 字节，2 路组相联
**问题：**
(1) 求组数、每组块数、标记位数。
(2) 若每个缓存行需要 1 位有效位、1 位脏位，求标记存储总位数（只计标记、有效、脏）。
(3) 若改为 4 路组相联（容量不变），标记总位数如何变化？
:::tip[解答]
（1）因为是2路组相连，每组块数就是2；那么一组2个clock，大小为 $2 \times 64B=128B$，组数为 $64KiB / 128B = 512$ 组。计算tag：$32 - \log_2 {512} - log_2 {64} = 32-9-6=17$
（2）行数 x 每行总位数 ： $1024 \times (17 + 1 + 1) / 8 = 2432B$
（3）每组块数改为4，每组的大小为 $4 \times 64B=256B$，组数为 $64KiB / 256B = 256$ 组，因此index需要的位数就是 $\log_2{256} = 8$，计算tag：$32-8-log_2{64}=18$，由于行数（块数）不变，总位数 $1024 \times (18 + 1 + 1)=20480$ 位，增加了1024位
:::
:::

:::note[解题方法]
- 针对这种组相联的问题，首先offset位数是 block size（以B为单位）的 log2，因为计算机memory address是以字节为单位的，例如block size=64B，那么里面的编号肯定是0x0,0x1...0x3f，每个编号里面存一个字节的数据，因此offset需要定位，就需要表示0-63，因此取对数计算
- 其次，计算index位数，也就是组数的 $\log_2$，因为同一组里是全相联查询，所以index的作用是定位到给出的memory address是在哪一个组。组数的计算方法就是直接$\frac{Cache size}{block size \times blocks per set}$
- 最后tag的位数$=32-offset-index$
:::

## Block Replacement Policy & LRU

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000638.webp" alt="Pasted image 20260517000638" width="498" loading="lazy" />

问题是：组相联的cache，当某一组已经放满了，又来了一个数据，应该替换掉哪一个呢

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000810.webp" alt="Pasted image 20260517000810" width="501" loading="lazy" />

多路了LRU实现其实很困难，硬件难以知道那个才是最旧的数据，但是如果是2-way组相联，就很简单：
打一个lru label，代表最旧的数据，即要被替换的数据

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000833.webp" alt="Pasted image 20260517000833" width="514" loading="lazy" />

## Average Memory Access Time（AMAT）

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516233158.webp" alt="Pasted image 20260516233158" width="502" loading="lazy" />

为啥不把Hit Time拆分成Hit rate x hit time ?
因为无论是否hit都需要支付hit time

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001016.webp" alt="Pasted image 20260517001016" width="496" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001028.webp" alt="Pasted image 20260517001028" width="498" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001038.webp" alt="Pasted image 20260517001038" width="423" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001051.webp" alt="Pasted image 20260517001051" width="433" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001110.webp" alt="Pasted image 20260517001110" width="440" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001120.webp" alt="Pasted image 20260517001120" width="451" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001134.webp" alt="Pasted image 20260517001134" width="462" loading="lazy" />

:::note[Example: 例1 （作业5 T5）]
RISC‑V 处理器有 L1 和 L2 缓存：L1：命中时间 2 周期，缺失率 8%；L2：命中时间 12 周期，局部命中率 50%（即 L1 缺失中有一半在 L2 命中，另一半需访问主存）；主存访问时间 200 周期
**问题：**
(1) 计算全局 AMAT。
(2) 若将 L2 局部命中率提升至 85%，AMAT 降低多少？
:::tip[解答]
（1）直接套用上图公式
$$
\begin{aligned}
AMAT &= L1 Hit + L1missrate \times L1misspenalty \\
&= L1 Hit + L1missrate \times (L2Hit + L2missrate \times L2misspenalty) \\
&= 2 + 0.08 \times (12 + 0.5 \times 200) \\
&= 10.96 \quad cycles
\end{aligned}
$$
（2）把上面公式的0.5改成0.15
:::
:::

# OS & Virtual Memory

 Hierarchy（放过很多次了）

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260522201528.webp" alt="Pasted image 20260522201528" width="495" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260522201602.webp" alt="Pasted image 20260522201602" width="502" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110321.webp" alt="Pasted image 20260523110321" width="511" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110439.webp" alt="Pasted image 20260523110439" width="510" loading="lazy" />

---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: Datapath Control](../computer-organization-system-architecture-datapath-control/) · [Next: Virtual Memory](../computer-organization-system-architecture-virtual-memory/)
