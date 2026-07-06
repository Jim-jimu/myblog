---
title: "Computer Organization: I/O and Parallelism"
description: "Course notes on polling, interrupts, DMA, Flynn taxonomy, SIMD, multicore, threads, OpenMP, synchronization, cache coherence, false sharing, and memory consistency."
publishDate: "2026-07-06"
tags: ["course-notes","computer-architecture"]
pinned: false
giscus: false
---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: Virtual Memory](../computer-organization-system-architecture-virtual-memory/)

## I/O Polling

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530164343.webp" alt="Pasted image 20260530164343" width="490" loading="lazy" />

轮询机制

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530164332.webp" alt="Pasted image 20260530164332" width="503" loading="lazy" />

以及这里的andi是按位与，就是判断末位是否为1，为0就一直循环

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530164728.webp" alt="Pasted image 20260530164728" width="498" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530164739.webp" alt="Pasted image 20260530164739" width="482" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530164747.webp" alt="Pasted image 20260530164747" width="505" loading="lazy" />

polling一个disk会占用非常多的cpu时钟周期，所以我们对于从disk读取数据不应采用polling
轮询的效率不高

## I/O Interrupts

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530165305.webp" alt="Pasted image 20260530165305" width="496" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530165255.webp" alt="Pasted image 20260530165255" width="507" loading="lazy" />

:::note[低速率IO VS 高速率IO]
>刚才我们在代码中看到，轮询会让 CPU 陷入死循环（`Waitloop`），一直干等外设。这对于极其宝贵的 CPU 资源来说是巨大的浪费。因此，这页 PPT 根据**外设的数据传输速率（Data Rate）**，给出了三种不同的 I/O 处理策略：轮询（Polling）、中断（Interrupts）和直接内存访问（DMA）。
 >1. 针对低速设备 (Low data rate)

>- **代表设备：** 鼠标、键盘。
>- **PPT 策略：Use interrupts（使用中断）。**
>- **原理解释：** 人类敲击键盘或移动鼠标的速度，在动辄以 GHz 计时的 CPU 看来是极其缓慢的。如>果我们用轮询去检查键盘，CPU 可能会空转几亿次才等来一次按键。
>因此，更好的做法是**中断（Interrupt）**：CPU 平时该干嘛干嘛（比如渲染游戏画面、播放音乐）。当键盘被按下时，键盘硬件会向 CPU 发送一个电信号（中断信号），就像“拍了一下 CPU 的肩膀”。CPU 收到信号后，暂停手头的工作，花极短的时间把按键数据读进来，然后立刻恢复原先的工作。
>- **PPT 小字解读 ("Overhead of interrupts ends up being low")：**
    >虽然 CPU 每次处理中断都需要保存和恢复现场（这叫 Overhead，开销），但因为低速设备触>发中断的频率非常低，所以把时间拉长来看，这种开销几乎可以忽略不计。

 >2. 针对高速设备 (High data rate)
>- **代表设备：** 千兆网卡、固态硬盘。
>- **PPT 策略：Start with interrups... Switch to DMA（先用中断，数据来了切换到 DMA）。**
>- **原理解释：**
  >  高速设备的数据量极大。假设你在下载一部几十 GB 的电影，如果网卡每收到一个字节的数据都去“拍一次 CPU 的肩膀”（触发中断），CPU 就会被密集的“枪林弹雨”般的中断信号彻底淹没（这被称为**中断风暴**），导致系统卡死，什么活也干不了。

>因此，现代计算机采取了**两步走**的策略：
>1. **第一步（Start with interrupts）：** 当网卡没有数据时，CPU 不去管它（"If there is no data, >you don't do anything!"）。直到网卡收到第一批数据包，它发**一个中断**告诉 CPU：“老大，有大批数据要进来了！”
>2. **第二步（Switch to DMA）：** CPU 收到通知后，为了避免被后续源源不断的数据打断，它会唤醒主板上的一个小助手——**DMA 控制器（Direct Memory Access）**。
>CPU 会给 DMA 下达指令：“小弟，网卡那边有 1GB 的数据，你负责把它们直接搬运到内存地址 `0xXXXX`去，搬完再叫我。”
>交代完后，CPU 就可以转头去干别的重活了。**DMA 硬件会接管总线，直接在“网卡”和“内存”之间倒腾数据，全程不需要 CPU 参与。**
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530170044.webp" alt="Pasted image 20260530170044" width="491" loading="lazy" />

在 PIO 模式下，外部设备和主内存（Main Memory）之间是不能直接讲话的。**每一个字节的数据搬运，都必须由 CPU 亲自执行 `lw` (Load Word) 和 `sw` (Store Word) 指令来完成。** CPU 先把数据从外设读到自己的寄存器里，然后再写到内存里。

缺点：
- 浪费 CPU 算力 (CPU has to execute all transfers...)
- 严重的速度不匹配 (Device speeds don't align...)
- 极高的能耗代价 (Energy cost of using beefy general-purpose CPU...)
## Direct Memory Access (DMA)

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530170926.webp" alt="Pasted image 20260530170926" width="463" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530170939.webp" alt="Pasted image 20260530170939" width="466" loading="lazy" />

可以说DMA就是CPU雇的一个打工人，在上述过程中，CPU只会接受到两次Interrupt：开始传输、结束。在数据传输过程中，CPU可以做别的事情

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530171257.webp" alt="Pasted image 20260530171257" width="342" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530171308.webp" alt="Pasted image 20260530171308" width="323" loading="lazy" />

# Parallelism

## Flynn Taxonomy（弗林分类法）

**软件的设计方式与硬件的物理架构是完全独立的两个维度**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530203734.webp" alt="Pasted image 20260530203734" width="543" loading="lazy" />

硬件维度的并行：取决于物理上CPU有几个核心
软件维度的并行：取决于代码的写法

**弗林分类法（Flynn's Taxonomy）**。

它根据指令流（Instruction Stream）**和**数据流（Data Stream）的数量，将计算机架构分为四类：
- **SISD** (单指令单数据 - 对应上图的 Pentium 4)
- **SIMD** (单指令多数据 - 比如 CPU 里的向量指令集 AVX，或者 GPU 的核心原理)
- **MISD** (多指令单数据)
- **MIMD** (多指令多数据 - 对应上图的 Core i7 等现代多核 CPU)

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530204501.webp" alt="Pasted image 20260530204501" width="525" loading="lazy" />

## SIMD Architecture

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530205831.webp" alt="Pasted image 20260530205831" width="513" loading="lazy" />

当你的程序中有大量相同类型的数据，且需要对它们做**一模一样的操作**时，就存在数据级并行。(Data-Level Parallelism)

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530205854.webp" alt="Pasted image 20260530205854" width="501" loading="lazy" />

硬件将 4 个 32 位的数字（X0 到 X3）像装箱子一样“打包”装进这一个超长寄存器里

XMM register是一个大宽度寄存器

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530211132.webp" alt="Pasted image 20260530211132" width="502" loading="lazy" />

:::note[SSE]
**SSE** 的全称是 **Streaming SIMD Extensions**（流式单指令多数据扩展）。
SSE 其实就是 Intel 在 1999 年伴随 Pentium III 处理器推出的一套具体的 SIMD 指令集标准和硬件实现。
- SSE 引入了全新的数据类型和指令，允许 CPU 将 **4 个单精度浮点数（32-bit float）** 打包塞进一个 128-bit 的 XMM 寄存器中，并用一条指令（如 `ADDPS`，Add Packed Single-precision）同时完成 4 个浮点数的加减乘除。

:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530211420.webp" alt="Pasted image 20260530211420" width="527" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530211434.webp" alt="Pasted image 20260530211434" width="524" loading="lazy" />

:::note[Intrinsics （内联函数 / 内置函数）]
问题：既然我们知道了 CPU 里有 SSE 这些极其强大的 SIMD 硬件指令，作为程序员，我们该如何在代码里调用它们？
>- **通俗解释:** 过去，如果你想压榨 CPU 的极限性能，用到 SSE 指令，你必须在 C 代码里手写晦涩的**内联汇编 (Inline Assembly)**。手写汇编不仅容易出错，还会破坏 C 编译器的优化过程（因为编译器看不懂你手写的汇编，无法帮你有效分配寄存器）。
>- **Intrinsics 的诞生:** Intel 和编译器厂商（如 GCC, Clang, MSVC）约定好了一套“暗号”。**Intrinsics 表面上看起来就像普通的 C/C++ 函数调用，但编译器在编译时，会把它们 100% 完美地翻译成对应的、特定的底层汇编指令。**
- **优势 (One-to-one correspondence):** 也就是 PPT 里强调的“一一对应”。你调用一个 intrinsic 函数，底层的机器码就必然生成那条特定的 SSE 指令。它让你既能享受写 C 语言的便利（编译器帮你管寄存器），又能拥有写汇编级别的绝对硬件控制力。

:::

## Multicore
为什么需要多核心？
为了提升perfrormance，但是提升时钟频率已经到头了

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601182727.webp" alt="Pasted image 20260601182727" width="420" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601182745.webp" alt="Pasted image 20260601182745" width="413" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601183611.webp" alt="Pasted image 20260601183611" width="409" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601183625.webp" alt="Pasted image 20260601183625" width="427" loading="lazy" />

## Thread
Thread：顺序执行的一系列指令流

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601183835.webp" alt="Pasted image 20260601183835" width="461" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601184350.webp" alt="Pasted image 20260601184350" width="449" loading="lazy" />

:::note[separate registers]
线程有独立的寄存器是指：寄存器还是那32个固定的，只是线程切换的时候，需要保存当时的寄存器状态，加载某个线程的寄存器状态。在操作系统中，这被称为**上下文切换**
:::

<mark>硬件线程</mark>：它是 CPU 中**真正能够拉取并执行指令的物理实体**。它包含了真实的硅片电路，如运算器、物理寄存器堆等。
- **数量限制**：数量是非常有限且固定的。比如我们常说一台电脑是“8核16线程”（支持同步多线程/超线程技术），这就意味着这台机器在物理层面上，最多只能同时提供 16 个硬件线程。
- **类比**：它们就像是共享办公室里**真实存在的“办公桌”**，只有坐在办公桌前才能干活。

<mark>软件线程</mark>：它是操作系统（或应用程序）创建的一系列指令

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601190553.webp" alt="Pasted image 20260601190553" width="496" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601190604.webp" alt="Pasted image 20260601190604" width="488" loading="lazy" />

## Multithreading
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601192236.webp" alt="Pasted image 20260601192236" width="489" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601192301.webp" alt="Pasted image 20260601192301" width="486" loading="lazy" />
 Physical CPU就是传统我们理解的物理硬件CPU核心
 Logical CPU：硬件线程，一个cpu核心能有超过一个硬件线程，所以说Logical CPU > Physical CPU

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601193739.webp" alt="Pasted image 20260601193739" width="494" loading="lazy" />

logical threads就是上述的一个核心有多个硬件线程，因为它本质上是“填补物理核心的空闲时间”（比如等内存时切换线程），所以它不能让性能翻倍

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601193757.webp" alt="Pasted image 20260601193757" width="494" loading="lazy" />

## OpenMP
一个C语言的扩展，用于处理

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601201335.webp" alt="Pasted image 20260601201335" width="510" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601201351.webp" alt="Pasted image 20260601201351" width="503" loading="lazy" />
 可以看到右侧的 `thread 0, i = 0` 之后紧跟着是 `thread 1, i = 3`。这正是多线程并发执行的经典现象。因为 4 个线程在物理核心上是独立且同时（或交替）运行的，它们谁先跑到 `printf` 这一行，谁就把字打在屏幕上。这种不可预测性提醒我们：**在多线程里，绝对不能依赖代码的物理顺序来假设执行顺序。**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601201449.webp" alt="Pasted image 20260601201449" width="500" loading="lazy" />

## Example： Computing $\pi$

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602001511.webp" alt="Pasted image 20260602001511" width="497" loading="lazy" />

:::note[数据竞争]
- 每个线程都需要访问共享变量 `sum`
- 如果线程 A 和线程 B 同时执行到了这一行，它们可能会**同时读取**到旧的 `sum` 值（比如都是 0.0）。接着，它们各自在自己的独立寄存器里做加法，然后先后写回内存。结果就是，后写回的值会**直接覆盖**掉前一个值，导致其中一个线程的计算成果凭空丢失了。最终算出来的 π 值绝对是错误的。
:::

为了避免上述的“更新丢失”，我们必须保证同一时刻只能有一个线程去修改 `sum`。如果程序员采用最原始的加锁机制（比如互斥锁 Mutex 或临界区 Critical Section）把 `sum += ...` 这行代码包起来：
- 虽然答案算对了，但多线程每次循环到这里时，**都必须排队，一个接一个地执行累加**。
- 这就导致原本应该并行的代码，在这里变成了**串行（顺序）执行**，彻底抵消了多线程带来的性能优势。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602002334.webp" alt="Pasted image 20260602002334" width="518" loading="lazy" />

修改后的代码如上图

:::note[并行区域与私有变量]

>- `#pragma omp parallel`：注意，这里**没有**加 `for`。这表示启动一个并行区域，里面的代码会被 4 个线程**各自完整地执行一遍**。
>- `int id = omp_get_thread_num();`：因为这行代码在并行区域内，所以 `id` 是一个**局部变量**。每个线程都会拥有自己独立的一个 `id` 副本（0, 1, 2 或 3）。
:::

`pi += sum[id]`这行代码会导致数据竞争，导致“更新丢失”，很多线程的 `sum[id]` 根本没被真正加进 `pi` 里，所以最终算出来的 π 值（3.1384...）比正确值小。

:::note[`#pragma omp parallel`与`#pragma omp parallel for`]
- 前者用来划定一个并行区域（Parallel Region）并唤醒一组线程，每个线程都会执行一遍{}区间的代码
- 后者这个指令**必须紧挨着一个 `for` 循环**。它会自动把这个 `for` 循环的总迭代次数切碎，平均（或按照设定策略）分配给各个线程
:::

## Synchronization

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602003611.webp" alt="Pasted image 20260602003611" width="460" loading="lazy" />

仅仅在C语言的层面上无法使用Lock解决数据竞争问题，比如下面这个例子：

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602003701.webp" alt="Pasted image 20260602003701" width="457" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602003724.webp" alt="Pasted image 20260602003724" width="447" loading="lazy" />

（上图的代码y坐标表示时间，从上到下依次发生）
两个threads同时发现锁空闲，想要set lock，此时lock会被两个thread set

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602004225.webp" alt="Pasted image 20260602004225" width="478" loading="lazy" />

## Hardware Synchronization

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602005015.webp" alt="Pasted image 20260602005015" width="512" loading="lazy" />

:::note[原子操作]
- 原子操作意味着“不可被打断的最小单位”。它要么完全执行，要么完全不执行，不存在“执行了一半”的中间态。
- CPU 硬件提供了一种特殊的**单条指令 (Single instruction)**，它能够把“读取内存”和“写入内存”合并成一个动作。
- 在这条特殊的指令执行期间，硬件级别的内存控制器会锁住这块共享内存，**绝对不允许 (No other access permitted)** 其他任何线程或物理核心插足。这就从物理电路上杜绝了更新丢失的问题。
- 常见的两种硬件实现方案：原子交换、链接读与条件写
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602005550.webp" alt="Pasted image 20260602005550" width="580" loading="lazy" />

上述的amoadd指令的3个细分步骤，其实是一个原子指令，它拥有绝对的不可分割性

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602010433.webp" alt="Pasted image 20260602010433" width="574" loading="lazy" />

`li t0, 1`加载立即数：将1加载到register t0

:::note[amoswap]
>**参数拆解**：
>- `(a0)`: 目标内存地址。`a0` 寄存器里存着那把共享锁在内存中的真实物理地址。
>- `t0`: 我们要写进去的新值。也就是上一句准备好的 `1`。
>- `t1`: 用来接收被替换出来的旧值的目标寄存器。
:::

在不可打断的一个 CPU 时钟周期内，硬件强行把 `t0` 里的 `1` 塞进内存的锁里，**同时**把内存里原本的值拔出来，放进了 `t1` 里。

这段代码的精妙之处在于它“先斩后奏”。它不管三七二十一，直接用原子操作把锁设为 `1`。判断自己是否抢锁成功的关键，全在那个被替换出来的旧值 **`t1`** 身上：
- **情况 A（抢锁成功）**：如果被换出来的 `t1` 里面的值是 `0`。说明在这一瞬间之前，锁是空闲的。你成功把 `0`换成了 `1`。恭喜，你拿到了锁！
- **情况 B（抢锁失败）**：如果被换出来的 `t1` 里面的值是 `1`。说明早有别的线程把锁占了。虽然你也霸道地往内存里写了个 `1`（把别人的 `1` 覆盖成了 `1`，状态没变），但通过检查换出来的旧值，你发现自己来晚了，获取锁失败。

上述critical action表述的就是对共享变量的读写

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602012042.webp" alt="Pasted image 20260602012042" width="490" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602012058.webp" alt="Pasted image 20260602012058" width="476" loading="lazy" />

使用OpenMP创建lock来规避数据竞争，当然也有更简洁的语法：

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602012138.webp" alt="Pasted image 20260602012138" width="489" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602012200.webp" alt="Pasted image 20260602012200" width="491" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602012925.webp" alt="Pasted image 20260602012925" width="478" loading="lazy" />

- 这个函数返回的并不是一个绝对的标准时间戳（比如 1970年1月1日至今的秒数），而是从过去某个“任意参考点”开始计算的秒数（类似于电脑开机到现在的时间）。
- 用于测量墙钟时间

## Shared Memory and Caches

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602013227.webp" alt="Pasted image 20260602013227" width="508" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602013321.webp" alt="Pasted image 20260602013321" width="502" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602013334.webp" alt="Pasted image 20260602013334" width="503" loading="lazy" />

SMP 架构选择让所有的处理器/核心**共享同一个统一的物理内存地址空间**。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602013703.webp" alt="Pasted image 20260602013703" width="504" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602013714.webp" alt="Pasted image 20260602013714" width="498" loading="lazy" />

上面的两张图引入了缓存一致性问题，cpu1,cpu2都需要用到address为1000的值（此处为20），因此他们从memory中获取，在cache中copy了一份。然后cpu0修改了address为1000的值为40，那么现在cpu1,cpu2里cache的值就是错的了

# Cache Coherency
为啥把这个当一级标题，因为重要！

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602014734.webp" alt="Pasted image 20260602014734" width="480" loading="lazy" />

Big Idea：
- **读操作随便分享 (If only reading...)**：如果大家都只是读取数据（比如 P1 和 P2 都读地址 1000 的值 20），那绝对安全。多个核心可以同时拥有同一个地址的副本。
- **写操作必须广而告之 (If a processor writes...)**：一旦某个核心（比如 P0）想要**修改**这个数据，它绝不能偷偷摸摸在自己的 Cache 里改。它必须通过底层的互连网络（总线）**通知**其他所有人：“喂！我要改地址 1000 的数据了！”

:::note[总线嗅探与写失效]
- **嗅探 (Snoop)**：在英文里是“偷听、窥探”的意思。在计算机里，所有的核心 Cache 都像长了耳朵一样，实时“监听”着公共数据总线上的动静。
- **检查标签 (Checking for tags)**：当 P0 在总线上大喊“我要修改地址 1000”时（这被称为一次 Write transaction），P1 和 P2 的 Cache 听到了，就会立刻翻看自己的小本本（Tag 标签）：我有存地址 1000 的数据吗？
- **作废/失效 (Invalidate)**：如果 P1 和 P2 发现自己确实存了地址 1000 的副本，它们**不会**去总线上要最新的数据，而是采取最简单暴力的做法——**直接把自己手里的旧数据打上一个“作废（Invalid）”的标记，当垃圾扔掉**
:::

## Snoop缓存

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619220904.webp" alt="Pasted image 20260619220904" width="535" loading="lazy" />

- 架构师的工作: 共享内存 → 保持缓存值一致(coherent)

- 想法: 当任何处理器缓存缺失(miss)或写入(write)时，通过互连网络通知其他处理器
	如果只是读，那么许多处理器都可以有副本(copies)
	如果处理器写入，则使任何其他副本无效(invalid)

- 写入来自一个处理器的事务，其他缓存“snoopy”公共互连检查它们持有的标签
	使在其他缓存中具有相同地址且修改过的任何副本无效

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619220953.webp" alt="Pasted image 20260619220953" width="532" loading="lazy" />

- **Snoopy缓存标签是双端口的 (Dual-ported)”** 这是这张PPT在硬件实现上强调的重点。为了让监听机制高效运作，缓存的标签和状态记录组（Tags and State）必须配备两个访问端口。

这两个端口的分工如下：
- **左侧端口（面向 Processor）：** 这是常规的缓存工作端口。处理器（Processor）通过这里发送地址（A）、读写控制信号（R/W）和数据（D），进行日常的指令和数据存取。
- **右侧端口（面向共享总线）：** PPT中标记为 `Snoopy read port attached to Memory Bus`。这是一个专门用于监听的只读端口。它连接到共享内存总线上，实时接收其他处理器发出的地址（A）和读写信号（R/W）。
- **上方输出（作为总线主控）：** PPT中标记为 `Used to drive Memory Bus when Cache is Bus Master`。当当前的处理器遇到缓存未命中（Cache Miss），或者需要将修改后的数据写回主存时，这个缓存控制器就会接管总线（成为 Bus Master），向外发送地址和读写请求。此时，其他处理器的“右侧端口”就会监听到这个请求。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619221354.webp" alt="Pasted image 20260619221354" width="524" loading="lazy" />

readmiss这里的意思：
- **Read miss (读缺失)**：CPU 需要读取某个数据，但在自己的缓存（Cache）里没找到。
- **Dirty copy (脏副本)**：在多核系统中，另一个 CPU 的缓存里有这个数据，并且**它被修改过了**。这意味着，那个 CPU 缓存里的数据是全系统**最新**的，而此时主存（内存）里的数据是没来得及更新的**旧数据**。
- **Write back (回写)**：把缓存里最新修改过的数据，同步写回到主存里。

## MSI

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619221637.webp" alt="Pasted image 20260619221637" width="497" loading="lazy" />

- **工作机制：** 当一个 CPU 要读数据时，数据被加载并标记为 **S (共享)**。如果要写数据，必须先通知所有其他拥有该数据的 CPU，让它们把状态变成 **I (无效)**，然后自己才能把状态变成 **M (修改)** 并写入。
- **致命痛点（为什么需要演进）：** 假设 CPU A 读取了一个数据（状态为 S），并且**只有 CPU A** 读取了它。紧接着，CPU A 想要修改这个数据。在 MSI 协议下，即使只有 A 拥有这份数据，它从 S 变成 M 的过程中，也必须向总线发一次广播（Invalidate 信号）。这种**无意义的广播严重浪费了总线带宽**。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619222933.webp" alt="Pasted image 20260619222933" width="479" loading="lazy" />

## MESI

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619223033.webp" alt="Pasted image 20260619223033" width="479" loading="lazy" />

为了解决 MSI 中“单机读写还要发广播”的痛点，引入了 **E (Exclusive, 独占)** 状态。
- **工作机制：** 当 CPU A 读取一个数据，如果系统发现**只有 CPU A** 读取了，就会把它标记为 **E (独占)**，而不是 S。
- **解决的痛点：** 此时如果 CPU A 想要修改这个数据，因为它是 E 状态，CPU A 知道绝对没有别人在用它，所以它可以**悄悄地**把状态从 E 变成 M，直接写入，**不需要在总线上发任何广播**。这极大地减少了串行程序在多核环境下的总线压力。

## MOESI缓存一致性协议：
对缓存的内存访问是：
Modified (in cache) 修改
Owned (in cache) 拥有
Exclusive (in cache) 独占
Shared (in cache) 共享
Invalid (not in cache) 作废

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619221523.webp" alt="Pasted image 20260619221523" width="491" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602015253.webp" alt="Pasted image 20260602015253" width="514" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602015305.webp" alt="Pasted image 20260602015305" width="513" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602020335.webp" alt="Pasted image 20260602020335" width="257" loading="lazy" />

兼容性矩阵：
我们可以把这个矩阵看作是多核 Cache 之间的“关系图谱”。假设我们探讨的是同一个内存地址（比如地址 `1000`），行代表当前核心（Core A）的状态，列代表其他任意核心（Core B）的状态。勾叉代表是否能够同时出现。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602020046.webp" alt="Pasted image 20260602020046" width="514" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619224723.webp" alt="Pasted image 20260619224723" width="507" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619225055.webp" alt="Pasted image 20260619225055" width="512" loading="lazy" />

## 伪共享
**伪共享 (False Sharing)**：缓存一致性协议追踪和作废数据的最小单位，不是单个变量，而是一整个“缓存块 (Cache Block / Cache Line)”。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602020920.webp" alt="Pasted image 20260602020920" width="519" loading="lazy" />

如上图，明明cpu0和cpu1用的是不同的地址，但是他们在一个缓存块内，其中一个cpu改了，另一个cpu就会任务自己cache中的那个缓存块作废了，因此需要经常访问内存并且总线通信

- **P0 写入 X**：P0 修改了变量 X。根据我们上一节学的缓存一致性协议，P0 必须在总线上大喊：“我改数据了，你们手里的**这个 32 字节的块**全部作废！”
- **P1 躺枪**：P1 的 Cache 收到了作废信号。虽然 P1 根本不关心 X，它只关心 Y，但因为 Y 跟 X 坐在同一条“32字节的船”上，**P1 手里包含 Y 的整个缓存块被无情地标记为 Invalid（作废）**。
- **P1 写入 Y**：轮到 P1 要修改 Y 了。它一查 Cache，发现数据作废了（Cache Miss）！P1 被迫去总线上重新请求最新的块。拿到块后，P1 修改了 Y，并大喊：“我改数据了，你们的块作废！”
- **P0 躺枪**：P0 手里包含 X 的块又被作废了。
- 当 P0 再次想要修改 X 时，它又得去总线上要数据，然后再把 P1 踢下线……

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602021303.webp" alt="Pasted image 20260602021303" width="560" loading="lazy" />

避免方法：减少缓存块大小

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602021330.webp" alt="Pasted image 20260602021330" loading="lazy" />通信失效 (Communication misses)：真共享和伪共享都是

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630003551.webp" alt="Pasted image 20260630003551" width="500" loading="lazy" />

这里如果sun[0],sum[1]在同一个cache block/line里，就会产生伪共享
因此要让相邻两个线程操作的sum数组元素要在不同的block，选yellow：Constant for size of blocks in doubles - 块大小所包含的 double 数量

## 目录缓存

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260629223540.webp" alt="Pasted image 20260629223540" width="489" loading="lazy" />

这一页说的是当处理器核心数目迅速增加之后，由于任何cpu cache miss 时，必须探测每一个其他缓存
当处理器核心数量增加（比如从 4 核增加到 64 核），这种“大喊大叫”的机制会遇到两个致命瓶颈：
- **总线通信带宽 (Bus Bandwidth)：** 总线是一条公共通道。如果 64 个核都在频繁地广播请求，这条公共通道很快就会拥堵不堪。
- **标签带宽 (Tag Bandwidth)：** 这是经常被忽略的一点。其他核心接收到广播后，必须去查询自己的 Cache Tag（标签阵列）来判断自己是否拥有该数据。如果每秒收到海量的监听请求，Cache Tag 就会被这些查询操作占满，导致该核心自己正常的读写操作被阻塞。

Idea：统计表明，当你向全网广播“谁有数据 X？”时，绝大多数核心的回答都是“我没有”。这意味着耗费了巨量带宽和 Tag 阵列资源的广播，99% 都是无效操作。**既然大多数情况都找不到，那么“按需精确点对点通信”而不是“无脑全量广播”才是解决之道。**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260629231206.webp" alt="Pasted image 20260629231206" width="503" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260629231327.webp" alt="Pasted image 20260629231327" width="333" loading="lazy" />

- 内存行中这个状态字段会记录比如：当前到底有哪几个 CPU 核心把这块数据读进了自己的 Cache 里，以及它们是只读状态（Shared）还是已修改状态（Modified）
- Cache miss的流程变为：step1. 找内存中负责该地址的 Directory 控制器; step2: Directory 查了一下自己的表格，看看哪些核心有这个数据; step3 : 不广播，只招特定的几个核心，使用点对点通信
- 网络事务 （点对点通信）： 在大规模众核处理器（如 64 核、128 核服务器 CPU）中，核心之间是通过类似互联网的 Mesh 网络（网格网络）连接的。查找目录、索要数据，都变成了网络中带有源地址和目的地址的数据包（Packets）。这就彻底摆脱了传统共享总线的物理限制。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260629231750.webp" alt="Pasted image 20260629231750" width="501" loading="lazy" />

**所以，必须创造一个 Pending（瞬态）来充当“过渡锁”。**
当 CPU A 发出请求的那一刻，它立刻给自己挂上 `Pending` 状态。这个状态的作用是：
1. **防自己：** 告诉自己的处理器核心：“数据在路上了，你先暂停（Stall），别读老数据。”
2. **防别人（处理并发）：** 如果这段时间有别的网络包（比如别人的失效请求）找上门来，CPU A 看到自己是 `Pending`，就知道遇到了“并发撞车”。它不会盲目回复，而是会根据协议规则，把别人的请求缓存起来，或者让对方稍后重试（NACK）。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260629232256.webp" alt="Pasted image 20260629232256" width="519" loading="lazy" />

“dir是一组节点”意思就是，dir里面是一组cpu核心编号
TR、TW两个瞬态分别是Transient Read -> Write（从R(dir)到W(id)之间的状态），和Transient Write -> Read/Write（从W(id)到R(dir)之间的状态），触发场景如下
- **TR(dir) - 等待作废确认 (Transient Read -> Write):**
- **场景：** 数据本来是好几个节点在共享读取 `R(dir)`，突然节点 A 说：“我要独占这块数据并修改它！”
- **动作：** 主目录为了保证一致性，必须向原来在读取的那些节点（`dir` 集合）发送“作废（Invalidate）”请求。
- **状态含义：** 在所有的作废确认回复（ACK）收齐之前，主目录进入 `TR(dir)` 状态。意思是：**“我正在等这帮老读者把手里的书撕掉，等他们全回复我了，我再把独占权交给 A。”**

- **TW(id) - 等待数据写回 (Transient Write -> Read/Write):**
- **场景：** 数据本来被节点 B 独占修改了 `W(B)`。这时节点 C 跑来跟主目录说：“我想读这块数据。”
- **动作：** 主目录自己手里的数据是过期的，它必须给节点 B 发消息：“B，赶紧把你改好的最新数据交出来（写回/Writeback）！”
- **状态含义：** 在节点 B 把最新数据传回来之前，主目录进入 `TW(id)` 状态。意思是：**“我正在等那个独占了数据的家伙把最新版本还给我，拿到手之后我才能转发给 C。”**

总结与对比snoop缓存和目录缓存

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260629233640.webp" alt="Pasted image 20260629233640" width="540" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260629234816.webp" alt="Pasted image 20260629234816" width="524" loading="lazy" />

- 一个例子展示了read miss中，目录缓存是怎么工作的。
- 注意这里到达DRAM之后，发现时R状态，那么memory中的数据是新鲜可用的，就直接拿memory中的数据就行了，不需要向其他 CPU 索要数据。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260629235211.webp" alt="Pasted image 20260629235211" width="505" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630000431.webp" alt="Pasted image 20260630000431" width="507" loading="lazy" />

类似于cache line的结构，但是**Memory Line 是“物理上松耦合（甚至分离）”的：** 虽然我们在画图时，会把 Directory 信息画在 Memory 旁边，好像它们是一个整体结构。但在真实的硬件主板上，负责存储目录信息的 SRAM 控制器，和负责存储真实数据的普通 DRAM 内存条，往往是分离的（或者存在内存的不同区域）。它们只是通过相同的“内存物理地址”在逻辑上被关联起来。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630001434.webp" alt="Pasted image 20260630001434" width="507" loading="lazy" />

这里的序列化，本质就是“排队法则”**。 因为在没有总线的分布式网络里，消息是满天飞且不按先后顺序到达的。为了保证大家看到的最终结果是一致的，无论在 Cache 端还是 Directory 端，都必须利用**“瞬态 (Pending states)”充当交通信号灯，强行把那些因为网络原因超车、乱序到达的请求按在原地等待，迫使整个系统一步一个脚印地“按顺序（序列化）”处理事务。

强调瞬态的重要性

> 通常 L1 Cache Line、L2 Cache Line 以及 Memory Line 的大小都是完全一致的（目前业界绝对的主流标准是 64 字节）

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630001837.webp" alt="Pasted image 20260630001837" width="556" loading="lazy" />

- 这里就是算出来缓存总共只有2M行之后，只在内存里用2M个memory line的状态位和共享向量来维护活跃行。
- - **引入 Tag：** 因为现在账本只有 200 万行了，没法跟 256GB 内存的物理地址一一对应了。所以每个账本条目必须加贴一个 **8 字节的 Tag（标签）**，写明“我这行记录的是内存里哪个地址的状态”。
- **新的单行开销：** 现在的目录项变成了 `8字节(Tag) + 16字节(位向量) = 24字节`。单行开销变大了（$24 / 64 = 37.5\%$）。
- 最后ppt算错了，应该是：$2097152 \times 24 = 50,331,648$ 字节，等于 $49152$ KB，也就是 $48$ MB

## 内存一致性模型(Memory Consistency Model)

## 加速和缩放的类型(Types of Speedups and Scaling)

A. 问题的限制 (Problem Constrained) -> **强扩展 (Strong Scaling) / Amdahl 定律**
- **核心思想：** **总工作量（问题规模）是固定不变的。**
- **目标：** 疯狂加机器，只为了把这个**固定的任务**完成得越快越好（缩短执行时间）。
- 增加处理器数量和内存大小

$$
S_{PC} = \frac{Time(1\text{ processor})}{Time(p\text{ processors})}
$$

B. 时间的限制 (Time Constrained) -> **弱扩展 (Weak Scaling) / Gustafson 定律**
- **核心思想：** **我们能容忍的等待时间是固定不变的。**
- **目标：** 随着机器的增加，我们不强求把旧问题算得更快，而是**把问题规模同比例放大**，在相同的时间内做更多、更复杂的事情。
- 目标是增加问题规模
- 增加了处理器数量和内存大小
$$
S_{TC} = \frac{Work(p\text{ processors})}{Work(1\text{ processor})}
$$

## 生产者与消费者

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630011013.webp" alt="Pasted image 20260630011013" width="427" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630011028.webp" alt="Pasted image 20260630011028" width="459" loading="lazy" />

在现代高性能硬件上，这段代码是错误的（或者说是不安全的）
- **寄存器 (Registers) - 存“值”的地方：**
- `xflag`: 寄存器，存储 `flag` 的**值**（0 或 1）。
- `xdata`: 寄存器，存储 `data` 的**值**（你需要传输的具体数据）。
- **指针/地址 (Pointers) - 存“内存位置”的地方：**
- `xflagp`: 寄存器，存储 `flag` 变量在内存中的**地址**。
- `xdatap`: 寄存器，存储 `data` 变量在内存中的**地址**。
 **生产者 (Producer)**
1. `sw xdata, (xdatap)`: 把我们要传的数据存入共享内存的 `data` 位置。
2. `li xflag, 1`: 把 `1` 这个数字存进 `xflag` 寄存器。
3. `sw xflag, (xflagp)`: 把 `1` 写入共享内存的 `flag` 位置。
- **逻辑：** 我先写数据，写完后再把 Flag 置为 1，告诉消费者“数据准备好了”。

 **消费者 (Consumer)**
1. `spin: lw xflag, (xflagp)`: 从共享内存的 `flag` 地址读出值，存入 `xflag` 寄存器。
2. `beqz xflag, spin`: 检查 `xflag` 是否为 0。如果是 0，说明生产者还没写完，跳转回 `spin` 处继续读。如果不是 0（即读到了 1），继续往下执行。
3. `lw xdata, (xdatap)`: 既然 Flag 变 1 了，说明数据好了，从内存读取 `data`。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630150151.webp" alt="Pasted image 20260630150151" width="559" loading="lazy" />

|**核心维度**|**Cache Coherence (缓存一致性)**|**Memory Consistency (内存一致性模型)**|
|---|---|---|
|**作用范围**|**单个**内存位置（局部）|**多个**不同内存位置（全局）|
|**解决的痛点**|所有的处理器对**同一个**数据的修改顺序达成共识。|所有的处理器对**所有**数据的读写操作顺序达成共识。|
|**底层实现/代表**|Snoopy (总线监听), Directory (目录协议)|SC (顺序一致性), TSO, 弱一致性 (Relaxed)|

## 顺序一致性 **(Sequential Consistency, 简称 SC)**。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630150849.webp" alt="Pasted image 20260630150849" width="594" loading="lazy" />

Lamport 的原话非常严谨，我们可以把它翻译并拆解为两条必须同时满足的铁律：
- **铁律一（全局串行化）：** _"the result of any execution is the same as if the operations of all the processors were executed in some sequential order"_ 不管这些处理器在物理上是怎么并行的，它们最终的执行结果，必须看起来像是**所有操作都被排成了一个全局的单步队列**，大家排队一个接一个地执行。
- **铁律二（局部不乱序）：** _"and the operations of each individual processor appear in the order specified by its program"_ 在这个全局队列中，如果我们只挑出某一个特定处理器（比如 P1）的操作来看，**P1 操作的先后顺序，必须和程序员在代码里写的一模一样**。绝对不允许硬件擅自把 P1 的第二行代码提到第一行代码前面去执行。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630151324.webp" alt="Pasted image 20260630151324" width="562" loading="lazy" />

大多数真正的机器都不是SC

## 存储缓冲区优化与TSO

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630151749.webp" alt="Pasted image 20260630151749" width="593" loading="lazy" />

Store Buffer 是一把双刃剑。它通过“异址重排”极大地提升了 CPU 性能，但也彻底粉碎了顺序一致性（SC）的美好幻想。正是因为它的存在，程序员才被迫发明了“内存屏障（Memory Fence）”去强行清空这个 Buffer，以保证多线程同步的正确性。

> TSO（完全存储排序）模型的核心特征，就在 PPT 最上面那句话：**允许按处理器对存储区进行本地缓冲 (Store Buffer)。**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630152631.webp" alt="Pasted image 20260630152631" width="612" loading="lazy" />

- 上图属于写后读 (Store-Load) 乱序。 这个命名规则是以“程序员写代码的顺序（Program Order）”为基准的，而不是以硬件偷偷改变后的实际执行顺序为准。上图是先sw再lw，所以是写后读
- TSO只允许写后读

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630154436.webp" alt="Pasted image 20260630154436" width="635" loading="lazy" />

- 强模型就是类似于SC，一致性强，对程序员极其友好。你写的代码是什么顺序，它就是什么顺序。；
- 弱模型就是顺序一致性弱，硬件段各种重排乱序，芯片可以设计得更简单、功耗更低、极限性能更高。代价是软件端写代码很难

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630155149.webp" alt="Pasted image 20260630155149" width="551" loading="lazy" />

---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: Virtual Memory](../computer-organization-system-architecture-virtual-memory/)
