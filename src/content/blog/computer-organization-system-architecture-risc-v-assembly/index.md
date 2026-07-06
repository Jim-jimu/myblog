---
title: "Computer Organization: RISC-V Assembly"
description: "Course notes on RISC-V registers, arithmetic, immediates, memory addressing, loads, stores, branches, calls, stack usage, and memory allocation."
publishDate: "2026-07-06"
tags: ["course-notes","computer-architecture","risc-v"]
pinned: false
giscus: false
---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: Floating Point](../computer-organization-system-architecture-floating-point/) · [Next: Formats and Logic](../computer-organization-system-architecture-formats-logic/)

架构图

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426222305.webp" alt="Pasted image 20260426222305" width="389" loading="lazy" />

## Register

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426222708.webp" alt="Pasted image 20260426222708" width="393" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426222723.webp" alt="Pasted image 20260426222723" width="381" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426222805.webp" alt="Pasted image 20260426222805" width="393" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426222825.webp" alt="Pasted image 20260426222825" width="389" loading="lazy" />

## Addition and Subtraction

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426223012.webp" alt="Pasted image 20260426223012" width="338" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426223024.webp" alt="Pasted image 20260426223024" width="333" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426223037.webp" alt="Pasted image 20260426223037" width="332" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426223050.webp" alt="Pasted image 20260426223050" width="357" loading="lazy" />

## Immediates 立即数

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426225144.webp" alt="Pasted image 20260426225144" width="319" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426225158.webp" alt="Pasted image 20260426225158" width="322" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426225213.webp" alt="Pasted image 20260426225213" width="314" loading="lazy" />

## Memory Addresses are in Bytes

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426232646.webp" alt="Pasted image 20260426232646" width="343" loading="lazy" />

<mark>教学上默认地址都为32位</mark>

现代计算机（包括绝大多数 RISC-V、x86、ARM 架构）的内存地址绝大多数都是以“字节”（Byte）为单位的。这在计算机体系结构中被称为**按字节编址（Byte-Addressable）**。
简单来说，内存就像一排连续的信箱，**每个信箱里固定只能装 8 个比特位（1 个字节）的数据**。每一个信箱都有一个独一无二的编号，这个编号就是“内存地址”。
- 地址 `0x00000000` 指向第 0 个字节。
- 地址 `0x00000001` 指向第 1 个字节。
- 地址 `0x00000002` 指向第 2 个字节。

假设你要存**第一个** 32 位整数，计算机会给它分配一个起始地址（通常叫作“字地址”，这里是**地址 0**）。这个整数会被切成 4 块，对号入座：
- 数据最右边的 `0-7` bits （最低有效字节），存进门牌号为 **0** 的格子。
- 数据的 `8-15` bits，存进门牌号为 **1** 的格子。
- 数据的 `16-23` bits，存进门牌号为 **2** 的格子。
- 数据最左边的 `24-31` bits （最高有效字节），存进门牌号为 **3** 的格子。

存完这第一个整数后，0、1、2、3 这四个格子就被占满了。如果你接着要存**第二个** 32 位整数，它就会顺延存到上一排的 **4、5、6、7** 这四个格子里（它的起始地址就是 4）。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426232934.webp" alt="Pasted image 20260426232934" width="350" loading="lazy" />

## Load and Store

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426233107.webp" alt="Pasted image 20260426233107" width="385" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426235155.webp" alt="Pasted image 20260426235155" width="387" loading="lazy" />

:::note[汇编指令里做任何关于地址的加减法，单位统统都是字节]
无论是`lw x10, 12(x15)`还是`lb x10, 12(x15)`，**偏移量（offset）永远都是以字节（bytes）为单位的**。无论是对于 `lw` 还是 `lb`，这里的 `12` 都代表 **12 bytes**
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426235950.webp" alt="Pasted image 20260426235950" width="437" loading="lazy" />

:::note[符号扩展]
这是整页 PPT 最关键的部分，也就是底下那个带有黄色箭头的图解。
**问题背景：** 内存里读出来的数据只有 1 个字节（8 bits），但是目标寄存器 `x10` 的容量是 32 位。这 8 个比特被塞进 32 位寄存器的最右边（最低 8 位）后，**左边空出来的 24 位填什么？**

**RISC-V 的解决方案（符号扩展）：**

- 图中右侧框起来的 `xzzz zzzz` 就是从内存加载进来的 1 个字节。
- 最左边的那个 `x`（第 7 位，从 0 开始数）被称为**符号位**（Sign bit）。如果是 0 代表正数，1 代表负数。
- `lb` 指令会自动进行**符号扩展**：它会把这个符号位 `x` 复制，用来填满左边空出来的所有 24 个位置（图中绿色的长箭头 `...is copied to "sign-extend"`）。
- **为什么这么做？** 这样可以保证一个有符号整数在从 8 位扩展到 32 位时，其**数值大小和正负号保持不变**。比如，一个 8 位的 `-1` (1111 1111) 扩展成 32 位后依然是 `-1` (1111...1111 1111)。

**符号扩展的场景**
- 场景一：从内存读取“小数据”到寄存器（Load 指令）
- 场景二：处理指令中的“立即数”（Immediate Values）
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427000147.webp" alt="Pasted image 20260427000147" width="397" loading="lazy" />

解析：
首先x11寄存器存储的是16进制数0x000003f5（一个16进制位=4个2进制位，需要4bit=1word=0.5byte）这里使用sign-extend
接下去将x11存到x5+0这个地址，再load byte，因为是小端序，只load一个byte，offset = 1 byte也就是这个16进制数的后3,4位，0x03，经过sign-extend之后为0x00000003

## Decision Making

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002222.webp" alt="Pasted image 20260427002222" width="334" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002241.webp" alt="Pasted image 20260427002241" width="372" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002301.webp" alt="Pasted image 20260427002301" width="368" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002329.webp" alt="Pasted image 20260427002329" width="383" loading="lazy" />

**比大小**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002422.webp" alt="Pasted image 20260427002422" width="382" loading="lazy" />

**Loops**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002457.webp" alt="Pasted image 20260427002457" width="384" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002508.webp" alt="Pasted image 20260427002508" width="393" loading="lazy" />

## Logical Instructions

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429102233.webp" alt="Pasted image 20260429102233" width="394" loading="lazy" />

-  **操作字（Word）内的特定位段 (fields of bits)：** 传统的 RISC-V 架构中一个字通常是 32 位。逻辑指令允许你精准地提取或修改这 32 位中的某几位，而不会干扰其他位。
- _例子：_ 一个 32 位的字可以容纳 4 个 8 位的字符数据。你可以利用逻辑指令单独“抠出”其中的某一个字符。
- **数据的打包与解包 (Operations to pack / unpack bits into words)：** 在底层开发（如配置硬件寄存器或处理网络协议头）时，为了最大化利用存储空间，经常需要把多个状态标志或小数据片段“打包”塞进同一个 32 位寄存器中，或者在需要读取时将它们“解包”出来。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429102448.webp" alt="Pasted image 20260429102448" width="301" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429102504.webp" alt="Pasted image 20260429102504" width="309" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429102641.webp" alt="Pasted image 20260429102641" width="301" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429103237.webp" alt="Pasted image 20260429103237" width="294" loading="lazy" />

**逻辑右移 (srl)** 是不管原来的数字是正是负，高位一律无脑补 `0`。而这张讲的**算术右移 (sra, srai)** 之所以补符号位，是为了在移位后保持数字原有的正负号不变
**在 RISC-V 中只有逻辑左移（`sll`, `slli`），而没有专门的“算术左移”指令**

## Machine Program

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429103846.webp" alt="Pasted image 20260429103846" width="449" loading="lazy" />

.s是汇编语言，.o是机器码

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429103921.webp" alt="Pasted image 20260429103921" width="440" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429104001.webp" alt="Pasted image 20260429104001" width="431" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429104511.webp" alt="Pasted image 20260429104511" width="426" loading="lazy" />

## Function Calls

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429104806.webp" alt="Pasted image 20260429104806" width="426" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429104923.webp" alt="Pasted image 20260429104923" width="427" loading="lazy" />

:::note[ra]
`ra`（Return Address，物理编号为 `x1`）存储的确实是一条汇编指令的内存地址，但它专门用来存储**函数调用结束后，应该返回去执行的“下一条”指令的地址。**

打个比方：假设你的主程序执行到了第 100 行，在这里调用了一个函数 `foo()`。CPU 此时会跳到 `foo()` 所在的位置去执行代码。但是等 `foo()` 执行完，CPU 怎么知道该跳回哪里继续往下走呢？ 所以在跳走之前，系统会把第 101 行指令的地址存进 `ra` 寄存器里。等 `foo()` 运行完毕，只需执行一句 `ret`（本质上就是跳回 `ra` 存的地址），程序就能完美地回到原来的执行流中。
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429105625.webp" alt="Pasted image 20260429105625" width="466" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429105707.webp" alt="Pasted image 20260429105707" width="464" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429105720.webp" alt="Pasted image 20260429105720" width="470" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429110726.webp" alt="Pasted image 20260429110726" width="470" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429110740.webp" alt="Pasted image 20260429110740" width="481" loading="lazy" />

:::note[rs、rd是什么意思]
在 RISC-V（以及绝大多数汇编语言）的官方手册中，这些字母是代表寄存器角色的缩写：
- **`rd` (Register Destination - 目标寄存器)：** 指令执行完毕后，**存放最终结果**的地方。
- **`rs` (Register Source - 源寄存器)：** 为指令执行**提供输入数据**的地方。如果一条指令需要两个输入，通常会分别写成 `rs1` 和 `rs2`。
:::

jal jal,jalr,j,jr,ret五个指令对比

## Stack

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429112636.webp" alt="Pasted image 20260429112636" width="477" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429112648.webp" alt="Pasted image 20260429112648" width="485" loading="lazy" />

stack frame 栈帧

:::note[栈向下生长]
看幻灯片最后一句：“Convention is grow stack down from high to low addresses”。在 RISC-V（以及现今大多数计算机架构）的约定中，**栈是从高地址向低地址生长的**。 你可以想象栈底在内存的高处，你想往栈里压入（Push）新数据，指针就必须“往下”走。所以开辟空间必须是**减去**一个值（向下移动指针）。
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429112829.webp" alt="Pasted image 20260429112829" width="486" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429112849.webp" alt="Pasted image 20260429112849" width="489" loading="lazy" />

在这一段汇编中，先存了s0,s1的值，是不是因为主程序之前可能在s0,s1存了数据，但是函数需要用s0,s1，先把s0,s1保存起来，函数调用完再恢复

:::note[s系列寄存器与Callee-saved]
`s0`, `s1` 等属于 **保存寄存器 (Saved Registers)**，也被称为 **“被调用者保存” (Callee-saved) 寄存器**。 系统对这类寄存器有一条死规矩：**“谁弄脏，谁打扫”**。
- **对于主程序（调用者 Caller）：** 它可以放心地把极其重要的数据放在 `s` 寄存器里，它有权利假设“无论我调用了多少个子函数，等它们执行完回来时，`s` 寄存器里的值一定和调用前一模一样”。
- **对于当前函数（被调用者 Callee，比如这里的 `Leaf`）：** 如果它想用 `s0` 和 `s1` 来做运算（比如图中的 `f = g + h`），它就必须承担起保护主程序数据的责任。
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429113012.webp" alt="Pasted image 20260429113012" width="487" loading="lazy" />

## Nested Calls and Register Conventions

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429113913.webp" alt="Pasted image 20260429113913" width="505" loading="lazy" />

问题：外层函数的ra会被内层函数overwritten，因此需要用stack保存ra

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429114043.webp" alt="Pasted image 20260429114043" width="512" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429114414.webp" alt="Pasted image 20260429114414" width="517" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429114532.webp" alt="Pasted image 20260429114532" width="515" loading="lazy" />

:::note[caller-saved VS callee-saved]
前者是，A（caller）在调用B（callee）之前，先保存一些寄存器中的数据，因为B可能会覆写

后者是，A（caller）调用B（callee），B在执行函数的时候，会将一些寄存器中的数据保存到stack中，然后在B return前恢复到寄存器。
:::

## Memory Allocation

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429115704.webp" alt="Pasted image 20260429115704" width="520" loading="lazy" />

**静态变量 (Static variables)：** 包括全局变量，以及用 `static` 关键字修饰的局部变量。它们的寿命贯穿整个程序的运行周期，无论函数进进出出多少次，它们的值都会被一直保留。因为要一直存活，**静态变量不存储在栈中**，而是存在内存中另一块专属的区域（通常叫数据段 Data Segment）。

:::note[核心概念：栈帧 / 活动记录 (Procedure Frame / Activation Record / stack frame)]


当一个函数被调用时，它在栈上开辟出来的那一整块**专属的内存区域**，就叫做**过程帧 (Procedure frame)** 或者 **活动记录 (Activation record)**。

结合我们前几张 PPT 学过的内容，一个完整的“栈帧”里面通常包含了两大块内容：

1. **保存的寄存器 (Saved registers)：** 比如 `ra` (返回地址) 和被弄脏的 `s0-s11` (Callee-saved 寄存器)。
2. **局部变量 (Local variables)：** 刚才提到的，寄存器装不下的数组、结构体，或者过多的普通变量。
:::

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429115942.webp" alt="Pasted image 20260429115942" width="531" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429120236.webp" alt="Pasted image 20260429120236" width="531" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429120651.webp" alt="Pasted image 20260429120651" width="342" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429120708.webp" alt="Pasted image 20260429120708" width="343" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429120729.webp" alt="Pasted image 20260429120729" width="427" loading="lazy" />

memory allocation

# RISC-V Instruction Representation

架构图与定位

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429121021.webp" alt="Pasted image 20260429121021" width="457" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141335.webp" alt="Pasted image 20260429141335" width="456" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141347.webp" alt="Pasted image 20260429141347" width="453" loading="lazy" />

为了降低硬件设计的复杂度，指令被统一成与数据长度一致的 32 位数字，并且这 32 位数字仅通过 6 种标准化的结构模板来解析。

---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: Floating Point](../computer-organization-system-architecture-floating-point/) · [Next: Formats and Logic](../computer-organization-system-architecture-formats-logic/)
