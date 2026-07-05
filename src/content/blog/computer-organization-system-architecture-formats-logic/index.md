---
title: "Computer Organization: Formats and Logic"
description: "Course notes on RISC-V instruction formats, switches, transistors, accumulators, registers, flip-flops, and related logic concepts."
publishDate: "2026-07-06"
tags: ["course-notes","computer-architecture","risc-v"]
pinned: false
giscus: false
---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: RISC-V Assembly](../computer-organization-system-architecture-risc-v-assembly/) · [Next: Datapath Control](../computer-organization-system-architecture-datapath-control/)

## R-Format Layout

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141649.webp" alt="Pasted image 20260429141649" width="456" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141711.webp" alt="Pasted image 20260429141711" width="446" loading="lazy" />

- opcode：它决定了这条指令属于哪种基本格式（比如是 R型、I型还是 S型）。
- funct3 (3 位功能码)：在 `opcode` 划定的大范围下，进一步细分操作类型。比如，同样是 R 型算术指令，`funct3` 就可以用来区分这到底是加减法相关的指令，还是移位指令，或者是异或（XOR）这样的逻辑指令。
- funct7 (7 位功能码)：这是最精细的区分。当两个指令的 `opcode` 和 `funct3` 都完全一样时，就需要靠 `funct7` 来做最后的“拍板”。**加法 (`add`) 和 减法 (`sub`)**。对于硬件来说，加法和减法高度相似，它们的 `opcode` 相同，`funct3` 也相同。它们唯一的区别就在于 `funct7` 中有一个二进制位不同

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141836.webp" alt="Pasted image 20260429141836" width="443" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141851.webp" alt="Pasted image 20260429141851" width="438" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141910.webp" alt="Pasted image 20260429141910" width="438" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141922.webp" alt="Pasted image 20260429141922" width="446" loading="lazy" />

## I-Format Layout

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429143036.webp" alt="Pasted image 20260429143036" width="453" loading="lazy" />

> **Note: 为什么不能使用R型来算addi？**
> 在 R 型指令的 32 位结构中，留给寄存器编号（如 `rs2`）的空间只有 5 个比特 (bit)，太小了可能装不下立即数。
> 解决方法：包含立即数的指令（如 `addi`）**最多只需要 2 个寄存器**。既然不需要 `rs2`，架构师就可以把原来属于 `rs2` 的 5 位空间，连同旁边 `funct7` 的 7 位空间一起腾出来，合并成一个**连续的 12 位空间**。这样就可以存放更大的常数（可以表示 -2048 到 +2047 的范围）了！

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429143249.webp" alt="Pasted image 20260429143249" width="459" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429143315.webp" alt="Pasted image 20260429143315" width="455" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429143327.webp" alt="Pasted image 20260429143327" width="449" loading="lazy" />

**Load Instructions are also I-Type**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144037.webp" alt="Pasted image 20260429144037" width="445" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144059.webp" alt="Pasted image 20260429144059" width="439" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144117.webp" alt="Pasted image 20260429144117" width="445" loading="lazy" />

## S-Format Layout

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144244.webp" alt="Pasted image 20260429144244" width="449" loading="lazy" />

> **Note: Store 指令不需要写回寄存器**
> - 与I型不同的是，sw有rs2
> - **没有 `rd`：** 绝大多数指令计算完都要把结果写回目标寄存器（`rd`），但 Store 指令是把数据**写进内存**。因此，对于 S 型指令来说，目标寄存器字段 **`rd` 是完全多余的**！
> - 这就意味着，原本属于 `rd` 的 5 个比特位（第 7 到 11 位）空出来了，用来放立即数

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144702.webp" alt="Pasted image 20260429144702" width="472" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144715.webp" alt="Pasted image 20260429144715" width="485" loading="lazy" />

## B-Format Layout

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430084838.webp" alt="Pasted image 20260430084838" width="482" loading="lazy" />

既然代码是连续存的，而且分支指令通常跳得不远，那么我们在指令里面，就**不需要**存一个完整的 32 位绝对内存地址（比如 `0x80001234`）。我们只需要存一个**偏移量 (Offset)** 就可以了（比如告诉 CPU：“以当前的 PC 地址为基准，往前跳 16 个字节”）。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085154.webp" alt="Pasted image 20260430085154" width="491" loading="lazy" />

`目标地址 = 当前 PC 寄存器的值 + 偏移量 (Offset)`。
在计算分支跳转时，我们**不使用**单字节作为单位

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085246.webp" alt="Pasted image 20260430085246" width="469" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085312.webp" alt="Pasted image 20260430085312" width="461" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085743.webp" alt="Pasted image 20260430085743" width="467" loading="lazy" />

为了保证底层架构的一致性，RISC-V 官方做了一个硬性规定：**无论你当前的处理器到底支不支持 16 位的压缩指令，所有分支跳转指令的偏移量，一律以 2 字节（半字）为基本单位进行缩放！**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085814.webp" alt="Pasted image 20260430085814" width="460" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085830.webp" alt="Pasted image 20260430085830" width="462" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085943.webp" alt="Pasted image 20260430085943" width="466" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430090944.webp" alt="Pasted image 20260430090944" width="488" loading="lazy" />

- **上半部分 (Instruction encodings, `inst[31:0]`)：** 这是指令存放在内存中的原始样子。你可以看到 I、S、B 型指令中，立即数（`imm`）是被无情拆散、塞在各个角落的。
- **下半部分 (32-bit immediates produced, `imm[31:0]`)：** 这是 CPU 内部的**立即数生成器 (Immediate Generator)** 电路的工作结果。它把上面那些散落的碎片抓出来，重新拼成一个标准的 32 位数字，准备送给 ALU（算术逻辑单元）去计算。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430090218.webp" alt="Pasted image 20260430090218" width="457" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430090240.webp" alt="Pasted image 20260430090240" width="491" loading="lazy" />

## Long Immediates (U-Format)

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430091608.webp" alt="Pasted image 20260430091608" width="497" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430091640.webp" alt="Pasted image 20260430091640" width="496" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430091924.webp" alt="Pasted image 20260430091924" width="497" loading="lazy" />

> **Note: 如何在一个寄存器中生成一个完整的 32 位大常数（长立即数）？****
>  第一步：使用 `lui` 搞定高 20 位
>
> - **指令含义：** `lui` 全称是 **Load Upper Immediate**（加载高位立即数）。它属于一种新的指令格式：**U 型指令 (U-Format)**。这种格式把除了 `opcode` 和目标寄存器 `rd` 之外的所有空间，都留给了一个巨大的 **20 位立即数**。 
> - **它的动作：** 当你执行 `lui` 时，CPU 会把这 20 位的数字，直接填进目标寄存器的**高 20 位**（即第 12 到 31 位），同时把剩下的**低 12 位全部清零 (clears the lower 12 bits)**。
> 
> 
>  2. 第二步：使用 `addi` 搞定低 12 位
> 
> - 高 20 位已经就位，低 12 位现在全是 0。我们只需要把剩下的 12 位数字“加”进去就可以了。
>     
> - 这时，我们熟悉的 `addi` (I 型指令，正好支持 12 位立即数) 闪亮登场。 

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430092329.webp" alt="Pasted image 20260430092329" width="531" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430092407.webp" alt="Pasted image 20260430092407" width="521" loading="lazy" />

## J-Format

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430092613.webp" alt="Pasted image 20260430092613" width="524" loading="lazy" />

J 型指令为了跳得更远，把能挪用的空间全挪用了，腾出了足足 **20 位**的空间来存放立即数。 和上一页讲过的 B 型指令一样，为了“白嫖”一个比特位，J 型指令的偏移量也是**以 2 字节为单位**的

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430092749.webp" alt="Pasted image 20260430092749" width="520" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430092828.webp" alt="Pasted image 20260430092828" width="519" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430093002.webp" alt="Pasted image 20260430093002" width="518" loading="lazy" />

# Compiling, Assembling, Linking, and Loading

架构图位置

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430093458.webp" alt="Pasted image 20260430093458" width="522" loading="lazy" />

# Synchronous Digital Systems

## Swithes 开关

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430100521.webp" alt="Pasted image 20260430100521" width="448" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430100653.webp" alt="Pasted image 20260430100653" width="449" loading="lazy" />

## Transistors 晶体管

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430100929.webp" alt="Pasted image 20260430100929" width="452" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430101013.webp" alt="Pasted image 20260430101013" width="452" loading="lazy" />

晶体管说明

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430101225.webp" alt="Pasted image 20260430101225" width="452" loading="lazy" />

上图实现了CMOS非门

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430101639.webp" alt="Pasted image 20260430101639" width="450" loading="lazy" />

## Accumulator

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430102722.webp" alt="Pasted image 20260430102722" width="445" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430104043.webp" alt="Pasted image 20260430104043" width="441" loading="lazy" />

1. 电路根本不会等你输入下一个数，它在一微秒内可能已经自己绕着圈子加了几万次，导致输出信号剧烈波动、产生乱码
2. 无法清零

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430104154.webp" alt="Pasted image 20260430104154" width="467" loading="lazy" />

## Register Details Flip-flops

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430104251.webp" alt="Pasted image 20260430104251" width="483" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430104339.webp" alt="Pasted image 20260430104339" width="479" loading="lazy" />

> **Note: **D 触发器的核心工作逻辑****
> 一个标准的 D 触发器有三个最关键的引脚：
> - **D (Data，数据输入)：** 等待被记住的新数据（比如加法器刚算出来的结果）。
> - **Q (Output，数据输出)：** 当前已经被记住的老数据。
> - **CLK (Clock，时钟信号)：** 控制节奏的“快门”开关，是一个不断在 0 和 1 之间跳动的方波信号。
它的运行规则可以用两句话概括：
**1. 上升沿瞬间：按下快门（采样并存储）** 当时钟信号 CLK 从 `0` 瞬间跳变到 `1` 的那一刻（这就是**上升沿**），D 触发器的“快门”咔嚓一下打开。它会立刻抓取此时 D 端口上的数据，并把它送到 Q 端口输出。此时，新数据被成功“存储”了下来。
**2. 其他所有时间：保持不变（无视外界干扰）** 在时钟信号保持为 `1`、下降沿（`1` 变 `0`）、以及保持为 `0` 的**所有期间**，D 触发器的大门是死死关闭的。无论输入端 D 的数据怎么剧烈波动、跳变，输出端 Q 都会**死死保持**着刚才上升沿时抓取到的那个值。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430104718.webp" alt="Pasted image 20260430104718" width="467" loading="lazy" />

**Accumulator （Revisited）**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430104815.webp" alt="Pasted image 20260430104815" width="466" loading="lazy" />

---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: RISC-V Assembly](../computer-organization-system-architecture-risc-v-assembly/) · [Next: Datapath Control](../computer-organization-system-architecture-datapath-control/)
