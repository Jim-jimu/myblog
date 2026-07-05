---
title: "Computer Organization and System Architecture Notes"
description: "Course notes covering number representation, floating point, RISC-V, cache, virtual memory, parallelism, and related computer architecture topics."
publishDate: "2026-07-06"
tags: ["course-notes", "computer-architecture", "risc-v"]
pinned: true
giscus: false
---


## Number Representation

|**进制**|**英文名称**|**常见代码前缀**|**示例**|**说明**|
|---|---|---|---|---|
|**二进制**|**Binary**|`0b` 或 `0B`|`0b1010`|仅包含数字 0 和 1。|
|**八进制**|**Octal**|`0o` 或 `0O`<br><br>  <br><br>_(C/C++等语言中常以数字 `0` 开头)_|`0o17`<br><br>  <br><br>`017`|包含数字 0 到 7。|
|**十进制**|**Decimal**|无前缀（默认）|`10`|我们日常使用的数字系统，包含 0 到 9。|
|**十六进制**|**Hexadecimal** (常简称为 **Hex**)|`0x` 或 `0X`|`0x1A`<br><br>  <br><br>`0xFF`|包含 0 到 9，以及字母 A 到 F（大小写均可，代表 10 到 15）。|
例子：
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424204312.webp" alt="Pasted image 20260424204312" width="539" loading="lazy" />

几种重要的编码方式：unsigned, sign and Magnitude, 1's complements, 2's complement, Bias Encoding

**Unsigned 与 Overflow**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424212206.webp" alt="Pasted image 20260424212206" width="434" loading="lazy" />

**Sign and Magnitude (原码)** 
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424212247.webp" alt="Pasted image 20260424212247" width="421" loading="lazy" />
有两个0，最高位表示符号，但是随着binary odometer递增，所表示的数有时候增加有时候减少
以 8 位为例：
- +5 的原码：`0000 0101`
- -5 的原码：`1000 0101`

**One's Complement（反码）**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424212716.webp" alt="Pasted image 20260424212716" width="419" loading="lazy" />
有两个0，最高位表示符号，是将sign and magnitude的负数中除了符号位取反，解决了原码 incrementing binary odometer的问题（从左到右，一个数的反码加1，这个数也加1）

**2's Complement（补码）**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424213029.webp" alt="Pasted image 20260424213029" width="406" loading="lazy" />
将反码的负数部分整体向左平移一位得到，解决了2个0的问题
补码的两种计算方法：
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424213438.webp" alt="Pasted image 20260424213438" width="406" loading="lazy" />

**Bias Encoding**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424213537.webp" alt="Pasted image 20260424213537" width="400" loading="lazy" />
这里Bias是相对于Unsigned的，比如unsigned中01111表示+15，在bias=-15的情况下，01111表示0

## Floating Point
小数点不需要fixed，而是floating
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424234057.webp" alt="Pasted image 20260424234057" width="398" loading="lazy" />
符号位+指数+尾数
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424234141.webp" alt="Pasted image 20260424234141" width="397" loading="lazy" />
**Underflow（下溢）** 是指计算结果的绝对值**太小，无限接近于 0**，以至于超出了当前浮点数格式所能表示的最小非零值的范围。
underflow可能会导致数字清零

### **IEEE 754**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424234722.webp" alt="Pasted image 20260424234722" width="391" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424234816.webp" alt="Pasted image 20260424234816" width="394" loading="lazy" />
IEEE754指数为什么使用Bias Notation
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424234847.webp" alt="Pasted image 20260424234847" width="387" loading="lazy" />
根据bias encoding，一般bias取值为$-(2^{N-1} -1 )$ 在这里就是$-127$ ，也就是说指数会存储真实数字加上127，最后计算的时候就要减去127
注意：Exponent为0和11111111时为特殊情况，后面介绍
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424235632.webp" alt="Pasted image 20260424235632" width="377" loading="lazy" />

### Special Numbers
**表示0与无穷大**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425002032.webp" alt="Pasted image 20260425002032" width="370" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425002151.webp" alt="Pasted image 20260425002151" width="373" loading="lazy" />

**NaN**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425003245.webp" alt="Pasted image 20260425003245" width="366" loading="lazy" />
**Denorms 非规格化**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425003303.webp" alt="Pasted image 20260425003303" width="364" loading="lazy" />
由上面的$2^{-126} >> 2^{-149}$ 我们发现0到最小数之间有一个很大的gap，而罪魁祸首是我们省略了尾数的先导“1”，因此，在exponent=0且$significand \not = 0$的时候我们取消这个先导1，尾数变为$(0.significand)_2$   

IEEE 754 强行规定：所有非规格化数的真实指数固定为 1−Bias（此处bias为正数）。对于单精度来说，就是 1−127=−126

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425003317.webp" alt="Pasted image 20260425003317" width="368" loading="lazy" />
此时非规格化的最小正数为$2^{-23} \times 2^{-126} = 2^{-149}$,次小数为$2 \times 2^{-149}$,接下去是$3\times 2^{-149}$ ,以此类推
到尾数全为1的时候，接下去再往下数指数位+1，就是$(1+1 \times 2^{-23}) \times 2^{-126},(1+2 \times 2^{-23}) \times 2^{-126}...$ 
到尾数全为1的时候，接下去再往下数指数位+1(此时exponent变为0b10 : 
$$(1+1 \times 2^{-23}) \times 2^{-125},(1+2 \times 2^{-23}) \times 2^{-125}...$$
我们发现stride从 $2^{-149}$ 变成了 $2^{-148}$ 
也就是说，每次exponent加1，stride就会翻倍。

浮点数在数轴上的分布特征：**越靠近 0，浮点数分布得越密集（stride 越小）；数字的绝对值越大，浮点数分布得越稀疏（stride 越大）。** 这种步长在计算机科学中被称为 **ULP (Unit in the Last Place)**

总结
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425003653.webp" alt="Pasted image 20260425003653" width="366" loading="lazy" />
（神奇之处在于这个表格从上到下是除了sign外的31位二进制递增的，所表示的数也在递增）

例1: （1）IEEE754单精度如何表示1？ （2）什么时候IEEE754单精度能表示的相邻的两个数间隔为1？


### Rounding and Addition

**浮点数并不满足加法结合律**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425130811.webp" alt="Pasted image 20260425130811" width="368" loading="lazy" />

**Precision and Accuracy**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425114545.webp" alt="Pasted image 20260425114545" width="379" loading="lazy" />

**Rounding舍入**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425114608.webp" alt="Pasted image 20260425114608" width="375" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425114630.webp" alt="Pasted image 20260425114630" width="382" loading="lazy" />
规则：round to even，举例：
Value	Binary		    Rounded	Action		Rounded Value
2 3/32	10.000112	10.002			             (<1/2—down)	2
2 3/16	10.001102	10.012			             (>1/2—up)	2 ¼
2 7/8	10.111002	11.002			             (  1/2—up)	3
2 5/8	10.101002	10.102			             (  1/2—down)	2 1/2


**FP Addition**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425114703.webp" alt="Pasted image 20260425114703" width="376" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425131545.webp" alt="Pasted image 20260425131545" width="368" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425131527.webp" alt="Pasted image 20260425131527" width="369" loading="lazy" />

## RISC-V
架构图
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426222305.webp" alt="Pasted image 20260426222305" width="389" loading="lazy" />

### Register
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426222708.webp" alt="Pasted image 20260426222708" width="393" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426222723.webp" alt="Pasted image 20260426222723" width="381" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426222805.webp" alt="Pasted image 20260426222805" width="393" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426222825.webp" alt="Pasted image 20260426222825" width="389" loading="lazy" />

### Addition and Subtraction
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426223012.webp" alt="Pasted image 20260426223012" width="338" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426223024.webp" alt="Pasted image 20260426223024" width="333" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426223037.webp" alt="Pasted image 20260426223037" width="332" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426223050.webp" alt="Pasted image 20260426223050" width="357" loading="lazy" />

### Immediates 立即数
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426225144.webp" alt="Pasted image 20260426225144" width="319" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426225158.webp" alt="Pasted image 20260426225158" width="322" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426225213.webp" alt="Pasted image 20260426225213" width="314" loading="lazy" />

### Memory Addresses are in Bytes
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

### Load and Store
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426233107.webp" alt="Pasted image 20260426233107" width="385" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426235155.webp" alt="Pasted image 20260426235155" width="387" loading="lazy" />

> **Note: 汇编指令里做任何关于地址的加减法，单位统统都是字节**
> 无论是`lw x10, 12(x15)`还是`lb x10, 12(x15)`，**偏移量（offset）永远都是以字节（bytes）为单位的**。无论是对于 `lw` 还是 `lb`，这里的 `12` 都代表 **12 bytes**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260426235950.webp" alt="Pasted image 20260426235950" width="437" loading="lazy" />

> **Note: 符号扩展**
> 这是整页 PPT 最关键的部分，也就是底下那个带有黄色箭头的图解。
**问题背景：** 内存里读出来的数据只有 1 个字节（8 bits），但是目标寄存器 `x10` 的容量是 32 位。这 8 个比特被塞进 32 位寄存器的最右边（最低 8 位）后，**左边空出来的 24 位填什么？**
>
**RISC-V 的解决方案（符号扩展）：**
>
> - 图中右侧框起来的 `xzzz zzzz` 就是从内存加载进来的 1 个字节。
> - 最左边的那个 `x`（第 7 位，从 0 开始数）被称为**符号位**（Sign bit）。如果是 0 代表正数，1 代表负数。
> - `lb` 指令会自动进行**符号扩展**：它会把这个符号位 `x` 复制，用来填满左边空出来的所有 24 个位置（图中绿色的长箭头 `...is copied to "sign-extend"`）。 
> - **为什么这么做？** 这样可以保证一个有符号整数在从 8 位扩展到 32 位时，其**数值大小和正负号保持不变**。比如，一个 8 位的 `-1` (1111 1111) 扩展成 32 位后依然是 `-1` (1111...1111 1111)。
> 
> **符号扩展的场景**
> - 场景一：从内存读取“小数据”到寄存器（Load 指令）
> - 场景二：处理指令中的“立即数”（Immediate Values）

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427000147.webp" alt="Pasted image 20260427000147" width="397" loading="lazy" />
解析：
首先x11寄存器存储的是16进制数0x000003f5（一个16进制位=4个2进制位，需要4bit=1word=0.5byte）这里使用sign-extend 
接下去将x11存到x5+0这个地址，再load byte，因为是小端序，只load一个byte，offset = 1 byte也就是这个16进制数的后3,4位，0x03，经过sign-extend之后为0x00000003


### Decision Making
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002222.webp" alt="Pasted image 20260427002222" width="334" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002241.webp" alt="Pasted image 20260427002241" width="372" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002301.webp" alt="Pasted image 20260427002301" width="368" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002329.webp" alt="Pasted image 20260427002329" width="383" loading="lazy" />
**比大小**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002422.webp" alt="Pasted image 20260427002422" width="382" loading="lazy" />
**Loops**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002457.webp" alt="Pasted image 20260427002457" width="384" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260427002508.webp" alt="Pasted image 20260427002508" width="393" loading="lazy" />

### Logical Instructions
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429102233.webp" alt="Pasted image 20260429102233" width="394" loading="lazy" />
-  **操作字（Word）内的特定位段 (fields of bits)：** 传统的 RISC-V 架构中一个字通常是 32 位。逻辑指令允许你精准地提取或修改这 32 位中的某几位，而不会干扰其他位。
    - _例子：_ 一个 32 位的字可以容纳 4 个 8 位的字符数据。你可以利用逻辑指令单独“抠出”其中的某一个字符。    
- **数据的打包与解包 (Operations to pack / unpack bits into words)：** 在底层开发（如配置硬件寄存器或处理网络协议头）时，为了最大化利用存储空间，经常需要把多个状态标志或小数据片段“打包”塞进同一个 32 位寄存器中，或者在需要读取时将它们“解包”出来。
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429102448.webp" alt="Pasted image 20260429102448" width="301" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429102504.webp" alt="Pasted image 20260429102504" width="309" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429102641.webp" alt="Pasted image 20260429102641" width="301" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429103237.webp" alt="Pasted image 20260429103237" width="294" loading="lazy" />
**逻辑右移 (srl)** 是不管原来的数字是正是负，高位一律无脑补 `0`。而这张讲的**算术右移 (sra, srai)** 之所以补符号位，是为了在移位后保持数字原有的正负号不变
**在 RISC-V 中只有逻辑左移（`sll`, `slli`），而没有专门的“算术左移”指令**

### Machine Program
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429103846.webp" alt="Pasted image 20260429103846" width="449" loading="lazy" />
.s是汇编语言，.o是机器码
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429103921.webp" alt="Pasted image 20260429103921" width="440" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429104001.webp" alt="Pasted image 20260429104001" width="431" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429104511.webp" alt="Pasted image 20260429104511" width="426" loading="lazy" />
### Function Calls
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429104806.webp" alt="Pasted image 20260429104806" width="426" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429104923.webp" alt="Pasted image 20260429104923" width="427" loading="lazy" />

> **Note: ra**
> `ra`（Return Address，物理编号为 `x1`）存储的确实是一条汇编指令的内存地址，但它专门用来存储**函数调用结束后，应该返回去执行的“下一条”指令的地址。**
> 
打个比方：假设你的主程序执行到了第 100 行，在这里调用了一个函数 `foo()`。CPU 此时会跳到 `foo()` 所在的位置去执行代码。但是等 `foo()` 执行完，CPU 怎么知道该跳回哪里继续往下走呢？ 所以在跳走之前，系统会把第 101 行指令的地址存进 `ra` 寄存器里。等 `foo()` 运行完毕，只需执行一句 `ret`（本质上就是跳回 `ra` 存的地址），程序就能完美地回到原来的执行流中。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429105625.webp" alt="Pasted image 20260429105625" width="466" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429105707.webp" alt="Pasted image 20260429105707" width="464" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429105720.webp" alt="Pasted image 20260429105720" width="470" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429110726.webp" alt="Pasted image 20260429110726" width="470" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429110740.webp" alt="Pasted image 20260429110740" width="481" loading="lazy" />

> **Note: rs、rd是什么意思**
> 在 RISC-V（以及绝大多数汇编语言）的官方手册中，这些字母是代表寄存器角色的缩写：
> - **`rd` (Register Destination - 目标寄存器)：** 指令执行完毕后，**存放最终结果**的地方。
> - **`rs` (Register Source - 源寄存器)：** 为指令执行**提供输入数据**的地方。如果一条指令需要两个输入，通常会分别写成 `rs1` 和 `rs2`。

jal jal,jalr,j,jr,ret五个指令对比

### Stack
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429112636.webp" alt="Pasted image 20260429112636" width="477" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429112648.webp" alt="Pasted image 20260429112648" width="485" loading="lazy" />
stack frame 栈帧

> **Note: 栈向下生长**
> 看幻灯片最后一句：“Convention is grow stack down from high to low addresses”。在 RISC-V（以及现今大多数计算机架构）的约定中，**栈是从高地址向低地址生长的**。 你可以想象栈底在内存的高处，你想往栈里压入（Push）新数据，指针就必须“往下”走。所以开辟空间必须是**减去**一个值（向下移动指针）。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429112829.webp" alt="Pasted image 20260429112829" width="486" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429112849.webp" alt="Pasted image 20260429112849" width="489" loading="lazy" />
在这一段汇编中，先存了s0,s1的值，是不是因为主程序之前可能在s0,s1存了数据，但是函数需要用s0,s1，先把s0,s1保存起来，函数调用完再恢复


> **Note: s系列寄存器与Callee-saved**
> `s0`, `s1` 等属于 **保存寄存器 (Saved Registers)**，也被称为 **“被调用者保存” (Callee-saved) 寄存器**。 系统对这类寄存器有一条死规矩：**“谁弄脏，谁打扫”**。
> - **对于主程序（调用者 Caller）：** 它可以放心地把极其重要的数据放在 `s` 寄存器里，它有权利假设“无论我调用了多少个子函数，等它们执行完回来时，`s` 寄存器里的值一定和调用前一模一样”。
> - **对于当前函数（被调用者 Callee，比如这里的 `Leaf`）：** 如果它想用 `s0` 和 `s1` 来做运算（比如图中的 `f = g + h`），它就必须承担起保护主程序数据的责任。


<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429113012.webp" alt="Pasted image 20260429113012" width="487" loading="lazy" />

### Nested Calls and Register Conventions

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429113913.webp" alt="Pasted image 20260429113913" width="505" loading="lazy" />
问题：外层函数的ra会被内层函数overwritten，因此需要用stack保存ra
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429114043.webp" alt="Pasted image 20260429114043" width="512" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429114414.webp" alt="Pasted image 20260429114414" width="517" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429114532.webp" alt="Pasted image 20260429114532" width="515" loading="lazy" />

> **Note: caller-saved VS callee-saved**
> 前者是，A（caller）在调用B（callee）之前，先保存一些寄存器中的数据，因为B可能会覆写
> 
> 后者是，A（caller）调用B（callee），B在执行函数的时候，会将一些寄存器中的数据保存到stack中，然后在B return前恢复到寄存器。

### Memory Allocation
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429115704.webp" alt="Pasted image 20260429115704" width="520" loading="lazy" />
**静态变量 (Static variables)：** 包括全局变量，以及用 `static` 关键字修饰的局部变量。它们的寿命贯穿整个程序的运行周期，无论函数进进出出多少次，它们的值都会被一直保留。因为要一直存活，**静态变量不存储在栈中**，而是存在内存中另一块专属的区域（通常叫数据段 Data Segment）。


> **Note: 核心概念：栈帧 / 活动记录 (Procedure Frame / Activation Record / stack frame)**
>  
> 
>当一个函数被调用时，它在栈上开辟出来的那一整块**专属的内存区域**，就叫做**过程帧 (Procedure frame)** 或者 **活动记录 (Activation record)**。
>
结合我们前几张 PPT 学过的内容，一个完整的“栈帧”里面通常包含了两大块内容：
>
> 1. **保存的寄存器 (Saved registers)：** 比如 `ra` (返回地址) 和被弄脏的 `s0-s11` (Callee-saved 寄存器)。
> 2. **局部变量 (Local variables)：** 刚才提到的，寄存器装不下的数组、结构体，或者过多的普通变量。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429115942.webp" alt="Pasted image 20260429115942" width="531" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429120236.webp" alt="Pasted image 20260429120236" width="531" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429120651.webp" alt="Pasted image 20260429120651" width="342" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429120708.webp" alt="Pasted image 20260429120708" width="343" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429120729.webp" alt="Pasted image 20260429120729" width="427" loading="lazy" />
memory allocation

# RISC-V Instruction Representation

架构图与定位
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429121021.webp" alt="Pasted image 20260429121021" width="457" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141335.webp" alt="Pasted image 20260429141335" width="456" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141347.webp" alt="Pasted image 20260429141347" width="453" loading="lazy" />
为了降低硬件设计的复杂度，指令被统一成与数据长度一致的 32 位数字，并且这 32 位数字仅通过 6 种标准化的结构模板来解析。

### R-Format Layout
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141649.webp" alt="Pasted image 20260429141649" width="456" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141711.webp" alt="Pasted image 20260429141711" width="446" loading="lazy" />
- opcode：它决定了这条指令属于哪种基本格式（比如是 R型、I型还是 S型）。
- funct3 (3 位功能码)：在 `opcode` 划定的大范围下，进一步细分操作类型。比如，同样是 R 型算术指令，`funct3` 就可以用来区分这到底是加减法相关的指令，还是移位指令，或者是异或（XOR）这样的逻辑指令。
- funct7 (7 位功能码)：这是最精细的区分。当两个指令的 `opcode` 和 `funct3` 都完全一样时，就需要靠 `funct7` 来做最后的“拍板”。**加法 (`add`) 和 减法 (`sub`)**。对于硬件来说，加法和减法高度相似，它们的 `opcode` 相同，`funct3` 也相同。它们唯一的区别就在于 `funct7` 中有一个二进制位不同
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141836.webp" alt="Pasted image 20260429141836" width="443" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141851.webp" alt="Pasted image 20260429141851" width="438" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141910.webp" alt="Pasted image 20260429141910" width="438" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429141922.webp" alt="Pasted image 20260429141922" width="446" loading="lazy" />

### I-Format Layout

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429143036.webp" alt="Pasted image 20260429143036" width="453" loading="lazy" />

> **Note: 为什么不能使用R型来算addi？**
> 在 R 型指令的 32 位结构中，留给寄存器编号（如 `rs2`）的空间只有 5 个比特 (bit)，太小了可能装不下立即数。
> 解决方法：包含立即数的指令（如 `addi`）**最多只需要 2 个寄存器**。既然不需要 `rs2`，架构师就可以把原来属于 `rs2` 的 5 位空间，连同旁边 `funct7` 的 7 位空间一起腾出来，合并成一个**连续的 12 位空间**。这样就可以存放更大的常数（可以表示 -2048 到 +2047 的范围）了！

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429143249.webp" alt="Pasted image 20260429143249" width="459" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429143315.webp" alt="Pasted image 20260429143315" width="455" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429143327.webp" alt="Pasted image 20260429143327" width="449" loading="lazy" />
**Load Instructions are also I-Type**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144037.webp" alt="Pasted image 20260429144037" width="445" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144059.webp" alt="Pasted image 20260429144059" width="439" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144117.webp" alt="Pasted image 20260429144117" width="445" loading="lazy" />
### S-Format Layout
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144244.webp" alt="Pasted image 20260429144244" width="449" loading="lazy" />

> **Note: Store 指令不需要写回寄存器**
> - 与I型不同的是，sw有rs2
> - **没有 `rd`：** 绝大多数指令计算完都要把结果写回目标寄存器（`rd`），但 Store 指令是把数据**写进内存**。因此，对于 S 型指令来说，目标寄存器字段 **`rd` 是完全多余的**！
> - 这就意味着，原本属于 `rd` 的 5 个比特位（第 7 到 11 位）空出来了，用来放立即数

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144702.webp" alt="Pasted image 20260429144702" width="472" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260429144715.webp" alt="Pasted image 20260429144715" width="485" loading="lazy" />

### B-Format Layout
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430084838.webp" alt="Pasted image 20260430084838" width="482" loading="lazy" />
既然代码是连续存的，而且分支指令通常跳得不远，那么我们在指令里面，就**不需要**存一个完整的 32 位绝对内存地址（比如 `0x80001234`）。我们只需要存一个**偏移量 (Offset)** 就可以了（比如告诉 CPU：“以当前的 PC 地址为基准，往前跳 16 个字节”）。
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085154.webp" alt="Pasted image 20260430085154" width="491" loading="lazy" />
`目标地址 = 当前 PC 寄存器的值 + 偏移量 (Offset)`。
在计算分支跳转时，我们**不使用**单字节作为单位
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085246.webp" alt="Pasted image 20260430085246" width="469" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085312.webp" alt="Pasted image 20260430085312" width="461" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085743.webp" alt="Pasted image 20260430085743" width="467" loading="lazy" />
为了保证底层架构的一致性，RISC-V 官方做了一个硬性规定：**无论你当前的处理器到底支不支持 16 位的压缩指令，所有分支跳转指令的偏移量，一律以 2 字节（半字）为基本单位进行缩放！**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085814.webp" alt="Pasted image 20260430085814" width="460" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085830.webp" alt="Pasted image 20260430085830" width="462" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430085943.webp" alt="Pasted image 20260430085943" width="466" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430090944.webp" alt="Pasted image 20260430090944" width="488" loading="lazy" />
- **上半部分 (Instruction encodings, `inst[31:0]`)：** 这是指令存放在内存中的原始样子。你可以看到 I、S、B 型指令中，立即数（`imm`）是被无情拆散、塞在各个角落的。
- **下半部分 (32-bit immediates produced, `imm[31:0]`)：** 这是 CPU 内部的**立即数生成器 (Immediate Generator)** 电路的工作结果。它把上面那些散落的碎片抓出来，重新拼成一个标准的 32 位数字，准备送给 ALU（算术逻辑单元）去计算。
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430090218.webp" alt="Pasted image 20260430090218" width="457" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430090240.webp" alt="Pasted image 20260430090240" width="491" loading="lazy" />

### Long Immediates (U-Format)
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430091608.webp" alt="Pasted image 20260430091608" width="497" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430091640.webp" alt="Pasted image 20260430091640" width="496" loading="lazy" />
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
### J-Format
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430092613.webp" alt="Pasted image 20260430092613" width="524" loading="lazy" />
J 型指令为了跳得更远，把能挪用的空间全挪用了，腾出了足足 **20 位**的空间来存放立即数。 和上一页讲过的 B 型指令一样，为了“白嫖”一个比特位，J 型指令的偏移量也是**以 2 字节为单位**的
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430092749.webp" alt="Pasted image 20260430092749" width="520" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430092828.webp" alt="Pasted image 20260430092828" width="519" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430093002.webp" alt="Pasted image 20260430093002" width="518" loading="lazy" />

# Compiling, Assembling, Linking, and Loading

架构图位置
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430093458.webp" alt="Pasted image 20260430093458" width="522" loading="lazy" />
# Synchronous Digital Systems

### Swithes 开关
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430100521.webp" alt="Pasted image 20260430100521" width="448" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430100653.webp" alt="Pasted image 20260430100653" width="449" loading="lazy" />

### Transistors 晶体管
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430100929.webp" alt="Pasted image 20260430100929" width="452" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430101013.webp" alt="Pasted image 20260430101013" width="452" loading="lazy" />
晶体管说明
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430101225.webp" alt="Pasted image 20260430101225" width="452" loading="lazy" />
上图实现了CMOS非门
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430101639.webp" alt="Pasted image 20260430101639" width="450" loading="lazy" />
### Accumulator
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430102722.webp" alt="Pasted image 20260430102722" width="445" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430104043.webp" alt="Pasted image 20260430104043" width="441" loading="lazy" />
1. 电路根本不会等你输入下一个数，它在一微秒内可能已经自己绕着圈子加了几万次，导致输出信号剧烈波动、产生乱码
2. 无法清零
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430104154.webp" alt="Pasted image 20260430104154" width="467" loading="lazy" />

### Register Details Flip-flops
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

### Pipelining for Performance
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430105725.webp" alt="Pasted image 20260430105725" width="472" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430110016.webp" alt="Pasted image 20260430110016" width="465" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430110250.webp" alt="Pasted image 20260430110250" width="463" loading="lazy" />
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

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430110513.webp" alt="Pasted image 20260430110513" width="471" loading="lazy" />
### Finite State Machines
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430110605.webp" alt="Pasted image 20260430110605" width="479" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430110810.webp" alt="Pasted image 20260430110810" width="471" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430111142.webp" alt="Pasted image 20260430111142" width="471" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430111322.webp" alt="Pasted image 20260430111322" width="464" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430111551.webp" alt="Pasted image 20260430111551" width="468" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430111612.webp" alt="Pasted image 20260430111612" width="478" loading="lazy" />
### Combinational Logic

# Single-Cycle CPU

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430112421.webp" alt="Pasted image 20260430112421" width="464" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430112919.webp" alt="Pasted image 20260430112919" width="502" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430113339.webp" alt="Pasted image 20260430113339" width="495" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430114942.webp" alt="Pasted image 20260430114942" width="494" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430114954.webp" alt="Pasted image 20260430114954" width="490" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430115007.webp" alt="Pasted image 20260430115007" width="520" loading="lazy" />
这个register file读写方式是，当write enable=1时才能写，在RW输入寄存器编号，busW中输入存储的数值。RA、RB中输入读取的寄存器编号，busA和busB输出RA、RB中的数值
并且可以发现，可以同时写1个，读2个
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430130636.webp" alt="Pasted image 20260430130636" width="516" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430130649.webp" alt="Pasted image 20260430130649" width="498" loading="lazy" />

### R-Type Add Datapath
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430130724.webp" alt="Pasted image 20260430130724" width="509" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430130740.webp" alt="Pasted image 20260430130740" width="508" loading="lazy" />
**sub**
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430130823.webp" alt="Pasted image 20260430130823" width="515" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430130836.webp" alt="Pasted image 20260430130836" width="503" loading="lazy" />
### Datapath With Immediates
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430131547.webp" alt="Pasted image 20260430131547" width="513" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430131608.webp" alt="Pasted image 20260430131608" width="505" loading="lazy" />

### Supporting Loads


<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430132414.webp" alt="Pasted image 20260430132414" width="506" loading="lazy" />
- ALU 算出的物理地址直接顺着导线连到了 **DMEM (数据内存)** 的 `addr` 端口。
- 控制大脑发出 **`MemRW = Read`**（读使能信号）。
- DMEM 收到地址和读命令后，从它浩瀚的存储阵列中找到对应的数据，并把它吐到 `DataR` 线上。

### store
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430133104.webp" alt="Pasted image 20260430133104" width="522" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430133143.webp" alt="Pasted image 20260430133143" width="512" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430133219.webp" alt="Pasted image 20260430133219" width="501" loading="lazy" />
上图为立即数生成器设计
### Branches
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430133637.webp" alt="Pasted image 20260430133637" width="500" loading="lazy" />
不同之处是PC不一定➕4，可能是加一个offset（立即数）
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430134242.webp" alt="Pasted image 20260430134242" width="499" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430134302.webp" alt="Pasted image 20260430134302" width="464" loading="lazy" />
### Adding JALR to Datapath
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430134922.webp" alt="Pasted image 20260430134922" width="460" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430134934.webp" alt="Pasted image 20260430134934" width="461" loading="lazy" />
jal也是类似：
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430135033.webp" alt="Pasted image 20260430135033" width="457" loading="lazy" />

### Adding U-Types
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430135223.webp" alt="Pasted image 20260430135223" width="445" loading="lazy" />
让 ALU 执行一个叫 **`Pass B` (直接透传 B 端口数据)** 的特殊操作
立即数生成器需要在数字末尾补12个0

最终：
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430135645.webp" alt="Pasted image 20260430135645" width="454" loading="lazy" />
### Control and Status Registers

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430140137.webp" alt="Pasted image 20260430140137" width="450" loading="lazy" />

我们之前拼命折腾的 `x0-x31` 被称为**通用寄存器 (GPR)**，它们是给程序员和 ALU 算数用的。而 **CSR 是一套完全独立的寄存器系统**，它们不在那个拥有 32 个坑位的寄存器堆里
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430140228.webp" alt="Pasted image 20260430140228" width="463" loading="lazy" />
上图的表格展示了 RISC-V 如何利用这几条基础的 CSR 指令，通过不同的参数组合，来实现对“仪表盘”（CSR 寄存器）的**只读、只写或读写**操作
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430141639.webp" alt="Pasted image 20260430141639" width="452" loading="lazy" />
CSR Instruction也是使用cpu的data path执行

### Datapath Control

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430142013.webp" alt="Pasted image 20260430142013" width="459" loading="lazy" />
=* 代表无关项
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430142349.webp" alt="Pasted image 20260430142349" width="455" loading="lazy" />
Timing：
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430142410.webp" alt="Pasted image 20260430142410" width="452" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430142526.webp" alt="Pasted image 20260430142526" width="450" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430143043.webp" alt="Pasted image 20260430143043" width="450" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430143054.webp" alt="Pasted image 20260430143054" width="447" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260430143108.webp" alt="Pasted image 20260430143108" width="441" loading="lazy" />

# Cache
问题引入：CPU比DRAM快很多怎么办
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260510144052.webp" alt="Pasted image 20260510144052" width="484" loading="lazy" />
### Memory Hierachy
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



> **Example: 例1 （作业5T1）**
> 某 RISCV 处理器使用 32 位地址，L1 数据缓存配置为：容量 = 32 KiB，块大小 = 128 字节，直接映射
> （1）计算缓存行数、索引位数、块内偏移位数、标记位数。
> （2）将地址 0x2004A 分解为标记、索引和偏移。
> （3）若缓存初始为空，访问地址 0x20000、0x20080、0x20100、0x20080 分别命中/缺失？
> 
> > **Tip: 解答**
> > （1）直接计算TIO，offset有 $128B=2^7 B$ 需要7位，计算行数：$32KiB / 128B = 256 Rows$ 需要8个二进制位，Tag位数 $32-7-8=17$ 位，因此 Rows=256，index位数8，offset位数7，Tag位数17
> > （2）转化为2进制：$0x2004A=0b 0010 0000 0000 0100 1010$所以$offset=0b1001010,index=0,tag=0b100$
> > （3）先看0x20000，offset=0, index=0, tag=0x4 ,冷启动，cache miss ;
> >接下去0x20080, offset=0, index=0x1, tag=0x4,  冷启动，cache miss;
> >接下去0x20100, offset=0, index=0x2, tag=0x4,  冷启动，cache miss;
> >接下去0x20180, offset=0, index=0x1, tag=0x4,  tag匹配，cache hit;

### Direct-Mapped Cache Example
Directed Cache

### Memory Access With Cache
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516165250.webp" alt="Pasted image 20260516165250" width="477" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516165303.webp" alt="Pasted image 20260516165303" width="477" loading="lazy" />
### Cache Terminology
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516172437.webp" alt="Pasted image 20260516172437" width="483" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516172448.webp" alt="Pasted image 20260516172448" width="488" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516172531.webp" alt="Pasted image 20260516172531" width="488" loading="lazy" />
 <img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516172545.webp" alt="Pasted image 20260516172545" width="473" loading="lazy" />
 <img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516172619.webp" alt="Pasted image 20260516172619" width="512" loading="lazy" />
 Valid Bit不占据32位TIO中的一位！

### Read Cache
read Cache的顺序：IVTO：index , Valid, Tag , Offset
当tag不匹配的时候，进行block replacement

### Cache Write

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516211917.webp" alt="Pasted image 20260516211917" width="529" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516212233.webp" alt="Pasted image 20260516212233" width="518" loading="lazy" />
Write-through和write-back现在都有在不同的地方应用


> **Example: 例1 （作业5 T3）**
> 考虑一个 RISCV 处理器，总线传输一个缓存块需要 50 周期。L1 命中时间 2 周期。程序统计：
> - 读操作占 50%，写操作占 50%
> - 读缺失率 = 4%，写缺失率 = 2%
> - 写命中时，写直达需额外 50 周期写回总线；写回仅标记脏位，替换时 30% 的块是脏的
> **问题：**  
> (1) 分别计算写直达与写回策略下的平均内存访问时间（AMAT）。  
> (2) 写回比写直达节省多少百分比的平均访问时间

（1）
写直达：AMAT=0.5 x (2 + 50 x 0.04) + 0.5 x (2 + 50 x 0.02 + 50) = 0.5 x 4 + 0.5 x 53 = 28.5
写回： AMAT=0.5x(2 + 50 x 0.04 + 50 x 0.04 x 0.3 ) + 0.5 x (2 + 50 x 0.02 + 50 x 0.02 x 0.3) = 3.95

### Block Size Tradeoff
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516212539.webp" alt="Pasted image 20260516212539" width="510" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516212737.webp" alt="Pasted image 20260516212737" width="503" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516212847.webp" alt="Pasted image 20260516212847" width="505" loading="lazy" />

### Types of Cache Misses
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516213213.webp" alt="Pasted image 20260516213213" width="497" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516213230.webp" alt="Pasted image 20260516213230" width="505" loading="lazy" />
“Tag 不匹配”是硬件检测到缓存未命中的**表象**，但导致这个表象的原因并不只有 Conflict

### Fully Associative Cache
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

### Set-Associative Caches

每个组包含很多blocks，同一个组内是全相联结构
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516231743.webp" alt="Pasted image 20260516231743" width="497" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000511.webp" alt="Pasted image 20260517000511" width="497" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000529.webp" alt="Pasted image 20260517000529" width="486" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000548.webp" alt="Pasted image 20260517000548" width="488" loading="lazy" />

> **Tip: 缓存行**
> 虽然上图把一个set画在同一行里，但是一般缓存行等价于缓存块


> **Example: 例1（作业5T2）**
> 某 RISC-V 处理器 L1 数据缓存：容量 = 64 KiB， 块大小 = 64 字节，2 路组相联
**问题：**  
(1) 求组数、每组块数、标记位数。  
(2) 若每个缓存行需要 1 位有效位、1 位脏位，求标记存储总位数（只计标记、有效、脏）。  
(3) 若改为 4 路组相联（容量不变），标记总位数如何变化？
>> **Tip: 解答**
>> （1）因为是2路组相连，每组块数就是2；那么一组2个clock，大小为 $2 \times 64B=128B$，组数为 $64KiB / 128B = 512$ 组。计算tag：$32 - \log_2 {512} - log_2 {64} = 32-9-6=17$ 
>> （2）行数 x 每行总位数 ： $1024 \times (17 + 1 + 1) / 8 = 2432B$
>> （3）每组块数改为4，每组的大小为 $4 \times 64B=256B$，组数为 $64KiB / 256B = 256$ 组，因此index需要的位数就是 $\log_2{256} = 8$，计算tag：$32-8-log_2{64}=18$，由于行数（块数）不变，总位数 $1024 \times (18 + 1 + 1)=20480$ 位，增加了1024位

> **Note: 解题方法**
> - 针对这种组相联的问题，首先offset位数是 block size（以B为单位）的 log2，因为计算机memory address是以字节为单位的，例如block size=64B，那么里面的编号肯定是0x0,0x1...0x3f，每个编号里面存一个字节的数据，因此offset需要定位，就需要表示0-63，因此取对数计算
> - 其次，计算index位数，也就是组数的 $\log_2$，因为同一组里是全相联查询，所以index的作用是定位到给出的memory address是在哪一个组。组数的计算方法就是直接$\frac{Cache size}{block size \times blocks per set}$
> - 最后tag的位数$=32-offset-index$



### Block Replacement Policy & LRU
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000638.webp" alt="Pasted image 20260517000638" width="498" loading="lazy" />
问题是：组相联的cache，当某一组已经放满了，又来了一个数据，应该替换掉哪一个呢
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000810.webp" alt="Pasted image 20260517000810" width="501" loading="lazy" />
多路了LRU实现其实很困难，硬件难以知道那个才是最旧的数据，但是如果是2-way组相联，就很简单：
打一个lru label，代表最旧的数据，即要被替换的数据
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517000833.webp" alt="Pasted image 20260517000833" width="514" loading="lazy" />
### Average Memory Access Time（AMAT）
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260516233158.webp" alt="Pasted image 20260516233158" width="502" loading="lazy" />
为啥不把Hit Time拆分成Hit rate x hit time ? 
因为无论是否hit都需要支付hit time
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001016.webp" alt="Pasted image 20260517001016" width="496" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001028.webp" alt="Pasted image 20260517001028" width="498" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001038.webp" alt="Pasted image 20260517001038" width="423" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001051.webp" alt="Pasted image 20260517001051" width="433" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001110.webp" alt="Pasted image 20260517001110" width="440" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001120.webp" alt="Pasted image 20260517001120" width="451" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260517001134.webp" alt="Pasted image 20260517001134" width="462" loading="lazy" />


> **Example: 例1 （作业5 T5）**
> RISC‑V 处理器有 L1 和 L2 缓存：L1：命中时间 2 周期，缺失率 8%；L2：命中时间 12 周期，局部命中率 50%（即 L1 缺失中有一半在 L2 命中，另一半需访问主存）；主存访问时间 200 周期
> **问题：**
> (1) 计算全局 AMAT。
> (2) 若将 L2 局部命中率提升至 85%，AMAT 降低多少？
> >**Tip: 解答**
> >（1）直接套用上图公式
> >$$
> >\begin{aligned}
> >AMAT &= L1 Hit + L1missrate \times L1misspenalty \\
> >&= L1 Hit + L1missrate \times (L2Hit + L2missrate \times L2misspenalty) \\
> >&= 2 + 0.08 \times (12 + 0.5 \times 200) \\
> >&= 10.96 \quad cycles 
> >\end{aligned}
> >$$
> >（2）把上面公式的0.5改成0.15

# OS & Virtual Memory

 Hierarchy（放过很多次了）
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260522201528.webp" alt="Pasted image 20260522201528" width="495" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260522201602.webp" alt="Pasted image 20260522201602" width="502" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110321.webp" alt="Pasted image 20260523110321" width="511" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110439.webp" alt="Pasted image 20260523110439" width="510" loading="lazy" />

### OS Functions
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110508.webp" alt="Pasted image 20260523110508" width="512" loading="lazy" />

> **Note: 线程(Process) VS 进程（Threads）**
> - **进程 (Process):** 在操作系统眼里，运行起来的应用程序统称为“进程”。进程最大的特点是**内存隔离 (separate memory)**。OS 会为每个进程分配独立的虚拟内存空间，一个进程崩溃通常不会直接带走另一个进程。
>- **线程 (Thread):** 线程是进程内部的执行单元，它们**共享内存 (shared memory)**。
>- 这俩都能在 CPU 上（通过系统调度）实现**伪并发 (pseudo simultaneously)** 运行。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110532.webp" alt="Pasted image 20260523110532" width="511" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110836.webp" alt="Pasted image 20260523110836" width="519" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110907.webp" alt="Pasted image 20260523110907" width="515" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523110924.webp" alt="Pasted image 20260523110924" width="508" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523111028.webp" alt="Pasted image 20260523111028" width="499" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523111205.webp" alt="Pasted image 20260523111205" width="504" loading="lazy" />
当时间片（Time Slice）耗尽，硬件定时器就会“响”。这个“响声”是一个硬件中断（interrupt）
这个中断会强制 CPU 暂停当前的用户程序，将状态切换为管态（Supervisor Mode），并自动跳转回操作系统内核的 Trap Handler 中。
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523111607.webp" alt="Pasted image 20260523111607" width="501" loading="lazy" />

### Virtual Memory
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523115427.webp" alt="Pasted image 20260523115427" width="506" loading="lazy" />
### Physical Memory and Storage

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
### Memory Manager
问题的引入：

> **Note: 核心痛点**
> 1、 安全隔离
> 裸机（Bare Metal）状态下，CPU（Processor）发出的所有读取（Load）和写入（Store）指令，带的都是**真实的物理地址（Real physical addresses）**。
> - **核心痛点——毫无隐私与安全可言：** 如图所示，CPU 和内存之间没有任何安检措施。这意味着，任何一个运行的程序，都可以随心所欲地生成一个物理地址，去访问内存的**任何角落**。
>     - 它可以去读写其他程序的内存。
>     - 更致命的是，它可以去改写**操作系统的核心数据结构（OS data structures）**。如果一个普通程序（哪怕是因为写错了一个指针）覆盖了操作系统的代码，整台机器瞬间就会崩溃死机。
>
>- **引出解决思路：** 必须在 CPU 和真实物理内存（DRAM）之间设立一个“海关”或**翻译机制（Translation mechanism）**。所有程序发出的地址都必须经过操作系统的审查，确认“你有权限访问这块地盘”后，才能真正放行。
>
2、高效共享The Multiprogramming Challenge
>操作系统通过极快的“上下文切换（Context Switch）”在不同进程之间轮转 CPU 控制权。在切换时，只需要保存和恢复那几十个寄存器（Registers）的数据就行了，速度极快。
>CPU 核心可以分时复用，寄存器可以快速保存。**但是物理内存只有一个（There is only one!）** 操作系统想要给这 100 多个进程每个都制造一种“幻觉”——让每个进程都觉得自己拥有一个完整的、独占的 CPU（通过上下文切换实现）和一个完整的、独占的内存空间。
>
>并且由于不同的电脑内存大小不一样，有些软件会超出内存，虚拟内存会让进程认为自己有一个超大的内存空间
> 
> 

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523115312.webp" alt="Pasted image 20260523115312" width="528" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523115330.webp" alt="Pasted image 20260523115330" width="538" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523115348.webp" alt="Pasted image 20260523115348" width="536" loading="lazy" />

### Paged Memory
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


### Page Faults
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523130827.webp" alt="Pasted image 20260523130827" width="564" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523131259.webp" alt="Pasted image 20260523131259" width="551" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523131643.webp" alt="Pasted image 20260523131643" width="545" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523131959.webp" alt="Pasted image 20260523131959" width="551" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260523132017.webp" alt="Pasted image 20260523132017" width="565" loading="lazy" />
DISK只能接受write-back，因为write-through很慢

### Hierarchical Page Tables

> **Note: Page Table页表是一个类似字典的结构**
> Virtual Memory中的offset(后12位)在翻译过程中会透传，表示在某一页中的相对位置（offset）。那么将VM Address翻译成真实的Physical Memory Address就是需要查询Page table，因此页表的作用就是将 VM Address 映射为Physical Memory Address

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529162903.webp" alt="Pasted image 20260529162903" width="531" loading="lazy" />
问题的引入：单级的Page table，一个就需要4MB，如果有很多进程，会很占用内存！
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529163440.webp" alt="Pasted image 20260529163440" width="510" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529163540.webp" alt="Pasted image 20260529163540" width="502" loading="lazy" />

> **Note: PTE**
> 上面说了页表类似一个字典，这个字典是利用一块连续地址的内存实现，那么它的键实际上就是利用VPN在memory中找到的一个地址，然后这个memory中存储的就是一个Page Table Entry(PTE)，“值”。它是32位的，结构如上图，如果说它是一个叶子PTE节点，那么它里面存储PPN就可以直接找到真实的物理地址(PPN[1] + PPN[0] + offset拼接起来)；如果不是叶子PTE节点，那么它的PPN指向下一级页表的基地址，具体来说，是 PPN[0] 拼接 PPN[1] 拼接12位0

> **Tip: 寻址过程**
> 首先根据SPTBR查询一级页表 (L1) 在物理内存中的基地址Address1，然后访问memory address：$Address1 + (VPN[1] \times 4)$得到32位的L1 PTE，因为PTE中包含了PPN[1],PPN[0]等等，去除12位的状态位，得到$(PPN[0]+PPN[1])<<12$就是对应L2 Page Table在memory中的基地址：$Address2$。然后再访问$Address2 + (VPN[0] \times 4)$得到32位的L2 PTE，再根据其$(PPN[1] + PPN[0] + offset)$得到真实物理地址。
> - 上述过程中，PTE的R，W，X位都为0标记其不是一个叶子节点。如果V=0会报Page Fault
> - 上述过程中，$VPN[0],[1]$需要乘4是因为每一个PTE（页表的值）是32位的，而memory中一个address存储的是8位1字节，因此需要乘4
> - 上述过程中$PPN[0] + PPN[1]$代表拼接
> - 并且通过上述过程，我们还发现L2 Page Table的基地址的后12位都是0，事实上所有的Page Table的基地址都是


### Translation Lookaside Buffers（TLB）
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529174608.webp" alt="Pasted image 20260529174608" width="534" loading="lazy" />
问题：之前提到过，如果用1级页表，那么每次翻译虚拟内存需要2次访问内存；如果用2级页表，每次翻译虚拟内存需要2次访问内存，以此类推。所以我们需要一个buffer（为什么不叫cache是因为它出现的时间比cache早）
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529174739.webp" alt="Pasted image 20260529174739" width="525" loading="lazy" />
TLB 就是把多级页表寻址的最终结果（叶子 PPN + 权限位）**和**初始输入（VPN）直接绑定在一起的缓存。
也就是说，无论用的是几个级别的Page Table，直接拿原始的VPN去查，hit了查到的就是最终叶子节点的PPN.
上图中是一个全相联的TLB结构，直接拿VPN当作tag（索引），去TLB里找PPN，因为是全相联，会判断TLB中所有的tag有没有一个是等于VPN的
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529174804.webp" alt="Pasted image 20260529174804" width="516" loading="lazy" />

> **Note: TLB Reach （TLB 覆盖范围）**
> 这是这页 PPT 最关键的一个概念，直接决定了底层软件的性能上限。
>- **定义：** TLB 能同时映射的虚拟内存最大总和。
>- **公式：** **TLB Reach=TLB 条目数×页面大小 (Page Size)**
>- **举个例子：** 如果 TLB 有 64 项，页面大小是 4KB，那么 TLB Reach=64×4KB=256KB。
>- **现实中的性能灾难（TLB 颠簸）：** 如果你的程序在跑一个极其吃内存的算法（比如遍历一个 50MB 的大数组），而你的 TLB Reach 只有 256KB。这意味着 CPU 会在非常短的时间内跨越海量的页面。TLB 会疯狂发生 Miss，CPU 会把大量时间浪费在查内存页表上，导致性能暴跌。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529174920.webp" alt="Pasted image 20260529174920" width="507" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529174856.webp" alt="Pasted image 20260529174856" width="509" loading="lazy" />
（上图VPN被分为tag和index是因为这里使用的是组相联 or direct-map）

### TLBs in Datapath
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529195920.webp" alt="Pasted image 20260529195920" width="492" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529195932.webp" alt="Pasted image 20260529195932" width="521" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529195951.webp" alt="Pasted image 20260529195951" width="505" loading="lazy" />
### VM Performance
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529195443.webp" alt="Pasted image 20260529195443" width="484" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260529200105.webp" alt="Pasted image 20260529200105" width="477" loading="lazy" />

> **Note: Page Hit/Miss**
> 这里Page hit指的是数据在内存中
>Page Miss指的是该页不在内存中，触发Page fault，操作系统接管，去磁盘中读数据
>
>Page hit / miss：关心的是“页面本身是否在主存里”
>TLB hit / miss：关心的是“页表项是否在 TLB 里”
>所以Page hit可能是TLB hit也可能是TLB miss


> **Note: Demand Paging**
> 按需加载页，也就是上述说的Paged Memory的全部


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

> **Note: Memory Mapped IO**
> **Memory-Mapped I/O (MMIO)**，即**内存映射 I/O**，是计算机中 CPU 与外部设备（如网卡、显卡、硬盘控制器等）进行通信和数据交换的一种架构设计和技术。
>
>它的核心思想非常直接：**将外设的内部寄存器或设备内部的存储器，映射到 CPU 的主内存（RAM）物理地址空间中。**
>
>这样一来，在 CPU 看来，与外部设备打交道就如同读写普通的内存条一样。
>
> 它是如何工作的？
>
>1. **统一地址空间：** 计算机的物理地址空间不仅包含真实的内存条（RAM），还预留了一部分地址分配给各个外部设备。  
>2. **相同的指令集：** 当 CPU 想要向设备发送控制命令或读取数据时，它不需要使用特殊的 I/O 指令。它只需向被分配给该设备的特定“内存地址”发送常规的读写指令（如汇编语言中的 `LOAD` 或 `STORE`）。  
>3. **总线路由：** 计算机的主板芯片组或内存控制器会监听这些地址。如果 CPU 访问的地址属于物理 RAM，数据就会存入内存条；如果访问的地址属于某个外设的映射区域，硬件总线（如 PCIe 总线）就会将这次读写操作直接路由到对应的外设寄存器中。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530163555.webp" alt="Pasted image 20260530163555" width="499" loading="lazy" />
### I/O Polling
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530164343.webp" alt="Pasted image 20260530164343" width="490" loading="lazy" />
轮询机制
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530164332.webp" alt="Pasted image 20260530164332" width="503" loading="lazy" />
以及这里的andi是按位与，就是判断末位是否为1，为0就一直循环
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530164728.webp" alt="Pasted image 20260530164728" width="498" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530164739.webp" alt="Pasted image 20260530164739" width="482" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530164747.webp" alt="Pasted image 20260530164747" width="505" loading="lazy" />
polling一个disk会占用非常多的cpu时钟周期，所以我们对于从disk读取数据不应采用polling
轮询的效率不高

### I/O Interrupts

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530165305.webp" alt="Pasted image 20260530165305" width="496" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530165255.webp" alt="Pasted image 20260530165255" width="507" loading="lazy" />

> **Note: 低速率IO VS 高速率IO**
>刚才我们在代码中看到，轮询会让 CPU 陷入死循环（`Waitloop`），一直干等外设。这对于极其宝贵的 CPU 资源来说是巨大的浪费。因此，这页 PPT 根据**外设的数据传输速率（Data Rate）**，给出了三种不同的 I/O 处理策略：轮询（Polling）、中断（Interrupts）和直接内存访问（DMA）。
 >1. 针对低速设备 (Low data rate)
>
>- **代表设备：** 鼠标、键盘。
>- **PPT 策略：Use interrupts（使用中断）。**
>- **原理解释：** 人类敲击键盘或移动鼠标的速度，在动辄以 GHz 计时的 CPU 看来是极其缓慢的。如>果我们用轮询去检查键盘，CPU 可能会空转几亿次才等来一次按键。
>因此，更好的做法是**中断（Interrupt）**：CPU 平时该干嘛干嘛（比如渲染游戏画面、播放音乐）。当键盘被按下时，键盘硬件会向 CPU 发送一个电信号（中断信号），就像“拍了一下 CPU 的肩膀”。CPU 收到信号后，暂停手头的工作，花极短的时间把按键数据读进来，然后立刻恢复原先的工作。
>- **PPT 小字解读 ("Overhead of interrupts ends up being low")：**
    >虽然 CPU 每次处理中断都需要保存和恢复现场（这叫 Overhead，开销），但因为低速设备触>发中断的频率非常低，所以把时间拉长来看，这种开销几乎可以忽略不计。
>
 >2. 针对高速设备 (High data rate)
>- **代表设备：** 千兆网卡、固态硬盘。
>- **PPT 策略：Start with interrups... Switch to DMA（先用中断，数据来了切换到 DMA）。**
>- **原理解释：**
  >  高速设备的数据量极大。假设你在下载一部几十 GB 的电影，如果网卡每收到一个字节的数据都去“拍一次 CPU 的肩膀”（触发中断），CPU 就会被密集的“枪林弹雨”般的中断信号彻底淹没（这被称为**中断风暴**），导致系统卡死，什么活也干不了。
>
>因此，现代计算机采取了**两步走**的策略：
>1. **第一步（Start with interrupts）：** 当网卡没有数据时，CPU 不去管它（"If there is no data, >you don't do anything!"）。直到网卡收到第一批数据包，它发**一个中断**告诉 CPU：“老大，有大批数据要进来了！”
>2. **第二步（Switch to DMA）：** CPU 收到通知后，为了避免被后续源源不断的数据打断，它会唤醒主板上的一个小助手——**DMA 控制器（Direct Memory Access）**。
>CPU 会给 DMA 下达指令：“小弟，网卡那边有 1GB 的数据，你负责把它们直接搬运到内存地址 `0xXXXX`去，搬完再叫我。”
>交代完后，CPU 就可以转头去干别的重活了。**DMA 硬件会接管总线，直接在“网卡”和“内存”之间倒腾数据，全程不需要 CPU 参与。**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530170044.webp" alt="Pasted image 20260530170044" width="491" loading="lazy" />
在 PIO 模式下，外部设备和主内存（Main Memory）之间是不能直接讲话的。**每一个字节的数据搬运，都必须由 CPU 亲自执行 `lw` (Load Word) 和 `sw` (Store Word) 指令来完成。** CPU 先把数据从外设读到自己的寄存器里，然后再写到内存里。

缺点：
- 浪费 CPU 算力 (CPU has to execute all transfers...)
- 严重的速度不匹配 (Device speeds don't align...)
- 极高的能耗代价 (Energy cost of using beefy general-purpose CPU...)
### Direct Memory Access (DMA)
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530170926.webp" alt="Pasted image 20260530170926" width="463" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530170939.webp" alt="Pasted image 20260530170939" width="466" loading="lazy" />
可以说DMA就是CPU雇的一个打工人，在上述过程中，CPU只会接受到两次Interrupt：开始传输、结束。在数据传输过程中，CPU可以做别的事情
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530171257.webp" alt="Pasted image 20260530171257" width="342" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530171308.webp" alt="Pasted image 20260530171308" width="323" loading="lazy" />

# Parallelism

### Flynn Taxonomy（弗林分类法）

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
### SIMD Architecture
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530205831.webp" alt="Pasted image 20260530205831" width="513" loading="lazy" />
当你的程序中有大量相同类型的数据，且需要对它们做**一模一样的操作**时，就存在数据级并行。(Data-Level Parallelism)

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530205854.webp" alt="Pasted image 20260530205854" width="501" loading="lazy" />
硬件将 4 个 32 位的数字（X0 到 X3）像装箱子一样“打包”装进这一个超长寄存器里

XMM register是一个大宽度寄存器
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530211132.webp" alt="Pasted image 20260530211132" width="502" loading="lazy" />


> **Note: SSE**
> **SSE** 的全称是 **Streaming SIMD Extensions**（流式单指令多数据扩展）。
> SSE 其实就是 Intel 在 1999 年伴随 Pentium III 处理器推出的一套具体的 SIMD 指令集标准和硬件实现。
> - SSE 引入了全新的数据类型和指令，允许 CPU 将 **4 个单精度浮点数（32-bit float）** 打包塞进一个 128-bit 的 XMM 寄存器中，并用一条指令（如 `ADDPS`，Add Packed Single-precision）同时完成 4 个浮点数的加减乘除。
> 

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530211420.webp" alt="Pasted image 20260530211420" width="527" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260530211434.webp" alt="Pasted image 20260530211434" width="524" loading="lazy" />


> **Note: Intrinsics （内联函数 / 内置函数）**
> 问题：既然我们知道了 CPU 里有 SSE 这些极其强大的 SIMD 硬件指令，作为程序员，我们该如何在代码里调用它们？
>- **通俗解释:** 过去，如果你想压榨 CPU 的极限性能，用到 SSE 指令，你必须在 C 代码里手写晦涩的**内联汇编 (Inline Assembly)**。手写汇编不仅容易出错，还会破坏 C 编译器的优化过程（因为编译器看不懂你手写的汇编，无法帮你有效分配寄存器）。
>- **Intrinsics 的诞生:** Intel 和编译器厂商（如 GCC, Clang, MSVC）约定好了一套“暗号”。**Intrinsics 表面上看起来就像普通的 C/C++ 函数调用，但编译器在编译时，会把它们 100% 完美地翻译成对应的、特定的底层汇编指令。**
> - **优势 (One-to-one correspondence):** 也就是 PPT 里强调的“一一对应”。你调用一个 intrinsic 函数，底层的机器码就必然生成那条特定的 SSE 指令。它让你既能享受写 C 语言的便利（编译器帮你管寄存器），又能拥有写汇编级别的绝对硬件控制力。
> 

### Multicore
为什么需要多核心？
为了提升perfrormance，但是提升时钟频率已经到头了
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601182727.webp" alt="Pasted image 20260601182727" width="420" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601182745.webp" alt="Pasted image 20260601182745" width="413" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601183611.webp" alt="Pasted image 20260601183611" width="409" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601183625.webp" alt="Pasted image 20260601183625" width="427" loading="lazy" />

### Thread 
Thread：顺序执行的一系列指令流
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601183835.webp" alt="Pasted image 20260601183835" width="461" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601184350.webp" alt="Pasted image 20260601184350" width="449" loading="lazy" />

> **Note: separate registers**
> 线程有独立的寄存器是指：寄存器还是那32个固定的，只是线程切换的时候，需要保存当时的寄存器状态，加载某个线程的寄存器状态。在操作系统中，这被称为**上下文切换**

<mark>硬件线程</mark>：它是 CPU 中**真正能够拉取并执行指令的物理实体**。它包含了真实的硅片电路，如运算器、物理寄存器堆等。
- **数量限制**：数量是非常有限且固定的。比如我们常说一台电脑是“8核16线程”（支持同步多线程/超线程技术），这就意味着这台机器在物理层面上，最多只能同时提供 16 个硬件线程。
- **类比**：它们就像是共享办公室里**真实存在的“办公桌”**，只有坐在办公桌前才能干活。

<mark>软件线程</mark>：它是操作系统（或应用程序）创建的一系列指令

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601190553.webp" alt="Pasted image 20260601190553" width="496" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601190604.webp" alt="Pasted image 20260601190604" width="488" loading="lazy" />

### Multithreading
 <img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601192236.webp" alt="Pasted image 20260601192236" width="489" loading="lazy" />
 <img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601192301.webp" alt="Pasted image 20260601192301" width="486" loading="lazy" />
 Physical CPU就是传统我们理解的物理硬件CPU核心
 Logical CPU：硬件线程，一个cpu核心能有超过一个硬件线程，所以说Logical CPU > Physical CPU
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601193739.webp" alt="Pasted image 20260601193739" width="494" loading="lazy" />
logical threads就是上述的一个核心有多个硬件线程，因为它本质上是“填补物理核心的空闲时间”（比如等内存时切换线程），所以它不能让性能翻倍
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601193757.webp" alt="Pasted image 20260601193757" width="494" loading="lazy" />

### OpenMP
一个C语言的扩展，用于处理
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601201335.webp" alt="Pasted image 20260601201335" width="510" loading="lazy" />
 <img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601201351.webp" alt="Pasted image 20260601201351" width="503" loading="lazy" />
 可以看到右侧的 `thread 0, i = 0` 之后紧跟着是 `thread 1, i = 3`。这正是多线程并发执行的经典现象。因为 4 个线程在物理核心上是独立且同时（或交替）运行的，它们谁先跑到 `printf` 这一行，谁就把字打在屏幕上。这种不可预测性提醒我们：**在多线程里，绝对不能依赖代码的物理顺序来假设执行顺序。**
 <img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260601201449.webp" alt="Pasted image 20260601201449" width="500" loading="lazy" />
### Example： Computing $\pi$
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602001511.webp" alt="Pasted image 20260602001511" width="497" loading="lazy" />

> **Note: 数据竞争**
> - 每个线程都需要访问共享变量 `sum`
> - 如果线程 A 和线程 B 同时执行到了这一行，它们可能会**同时读取**到旧的 `sum` 值（比如都是 0.0）。接着，它们各自在自己的独立寄存器里做加法，然后先后写回内存。结果就是，后写回的值会**直接覆盖**掉前一个值，导致其中一个线程的计算成果凭空丢失了。最终算出来的 π 值绝对是错误的。

为了避免上述的“更新丢失”，我们必须保证同一时刻只能有一个线程去修改 `sum`。如果程序员采用最原始的加锁机制（比如互斥锁 Mutex 或临界区 Critical Section）把 `sum += ...` 这行代码包起来：
- 虽然答案算对了，但多线程每次循环到这里时，**都必须排队，一个接一个地执行累加**。
- 这就导致原本应该并行的代码，在这里变成了**串行（顺序）执行**，彻底抵消了多线程带来的性能优势。
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602002334.webp" alt="Pasted image 20260602002334" width="518" loading="lazy" />
修改后的代码如上图

> **Note: 并行区域与私有变量**
> 
>- `#pragma omp parallel`：注意，这里**没有**加 `for`。这表示启动一个并行区域，里面的代码会被 4 个线程**各自完整地执行一遍**。
>- `int id = omp_get_thread_num();`：因为这行代码在并行区域内，所以 `id` 是一个**局部变量**。每个线程都会拥有自己独立的一个 `id` 副本（0, 1, 2 或 3）。

`pi += sum[id]`这行代码会导致数据竞争，导致“更新丢失”，很多线程的 `sum[id]` 根本没被真正加进 `pi` 里，所以最终算出来的 π 值（3.1384...）比正确值小。


> **Note: `#pragma omp parallel`与`#pragma omp parallel for`**
> - 前者用来划定一个并行区域（Parallel Region）并唤醒一组线程，每个线程都会执行一遍{}区间的代码
> - 后者这个指令**必须紧挨着一个 `for` 循环**。它会自动把这个 `for` 循环的总迭代次数切碎，平均（或按照设定策略）分配给各个线程

### Synchronization
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602003611.webp" alt="Pasted image 20260602003611" width="460" loading="lazy" />
仅仅在C语言的层面上无法使用Lock解决数据竞争问题，比如下面这个例子：
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602003701.webp" alt="Pasted image 20260602003701" width="457" loading="lazy" />
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602003724.webp" alt="Pasted image 20260602003724" width="447" loading="lazy" />
（上图的代码y坐标表示时间，从上到下依次发生）
两个threads同时发现锁空闲，想要set lock，此时lock会被两个thread set

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602004225.webp" alt="Pasted image 20260602004225" width="478" loading="lazy" />

### Hardware Synchronization
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602005015.webp" alt="Pasted image 20260602005015" width="512" loading="lazy" />

> **Note: 原子操作**
> - 原子操作意味着“不可被打断的最小单位”。它要么完全执行，要么完全不执行，不存在“执行了一半”的中间态。
> - CPU 硬件提供了一种特殊的**单条指令 (Single instruction)**，它能够把“读取内存”和“写入内存”合并成一个动作。
> - 在这条特殊的指令执行期间，硬件级别的内存控制器会锁住这块共享内存，**绝对不允许 (No other access permitted)** 其他任何线程或物理核心插足。这就从物理电路上杜绝了更新丢失的问题。
> - 常见的两种硬件实现方案：原子交换、链接读与条件写

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602005550.webp" alt="Pasted image 20260602005550" width="580" loading="lazy" />
上述的amoadd指令的3个细分步骤，其实是一个原子指令，它拥有绝对的不可分割性
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260602010433.webp" alt="Pasted image 20260602010433" width="574" loading="lazy" />
`li t0, 1`加载立即数：将1加载到register t0

> **Note: amoswap**
>**参数拆解**：
>- `(a0)`: 目标内存地址。`a0` 寄存器里存着那把共享锁在内存中的真实物理地址。
>- `t0`: 我们要写进去的新值。也就是上一句准备好的 `1`。
>- `t1`: 用来接收被替换出来的旧值的目标寄存器。

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

### Shared Memory and Caches
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

> **Note: 总线嗅探与写失效**
> - **嗅探 (Snoop)**：在英文里是“偷听、窥探”的意思。在计算机里，所有的核心 Cache 都像长了耳朵一样，实时“监听”着公共数据总线上的动静。
> - **检查标签 (Checking for tags)**：当 P0 在总线上大喊“我要修改地址 1000”时（这被称为一次 Write transaction），P1 和 P2 的 Cache 听到了，就会立刻翻看自己的小本本（Tag 标签）：我有存地址 1000 的数据吗？
> - **作废/失效 (Invalidate)**：如果 P1 和 P2 发现自己确实存了地址 1000 的副本，它们**不会**去总线上要最新的数据，而是采取最简单暴力的做法——**直接把自己手里的旧数据打上一个“作废（Invalid）”的标记，当垃圾扔掉**

### Snoop缓存
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


### MSI
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619221637.webp" alt="Pasted image 20260619221637" width="497" loading="lazy" />
- **工作机制：** 当一个 CPU 要读数据时，数据被加载并标记为 **S (共享)**。如果要写数据，必须先通知所有其他拥有该数据的 CPU，让它们把状态变成 **I (无效)**，然后自己才能把状态变成 **M (修改)** 并写入。
- **致命痛点（为什么需要演进）：** 假设 CPU A 读取了一个数据（状态为 S），并且**只有 CPU A** 读取了它。紧接着，CPU A 想要修改这个数据。在 MSI 协议下，即使只有 A 拥有这份数据，它从 S 变成 M 的过程中，也必须向总线发一次广播（Invalidate 信号）。这种**无意义的广播严重浪费了总线带宽**。
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619222933.webp" alt="Pasted image 20260619222933" width="479" loading="lazy" />
### MESI
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260619223033.webp" alt="Pasted image 20260619223033" width="479" loading="lazy" />
为了解决 MSI 中“单机读写还要发广播”的痛点，引入了 **E (Exclusive, 独占)** 状态。
- **工作机制：** 当 CPU A 读取一个数据，如果系统发现**只有 CPU A** 读取了，就会把它标记为 **E (独占)**，而不是 S。
- **解决的痛点：** 此时如果 CPU A 想要修改这个数据，因为它是 E 状态，CPU A 知道绝对没有别人在用它，所以它可以**悄悄地**把状态从 E 变成 M，直接写入，**不需要在总线上发任何广播**。这极大地减少了串行程序在多核环境下的总线压力。


### MOESI缓存一致性协议：
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

### 伪共享
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


### 目录缓存
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
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260629235211.webp" alt="Pasted image 20260629235211" width="505" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630000431.webp" alt="Pasted image 20260630000431" width="507" loading="lazy" />
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

### 内存一致性模型(Memory Consistency Model)

#### 加速和缩放的类型(Types of Speedups and Scaling)

A. 问题的限制 (Problem Constrained) -> **强扩展 (Strong Scaling) / Amdahl 定律**
- **核心思想：** **总工作量（问题规模）是固定不变的。**
- **目标：** 疯狂加机器，只为了把这个**固定的任务**完成得越快越好（缩短执行时间）。
- 增加处理器数量和内存大小

$$S_{PC} = \frac{Time(1\text{ processor})}{Time(p\text{ processors})}$$

B. 时间的限制 (Time Constrained) -> **弱扩展 (Weak Scaling) / Gustafson 定律**
- **核心思想：** **我们能容忍的等待时间是固定不变的。**
- **目标：** 随着机器的增加，我们不强求把旧问题算得更快，而是**把问题规模同比例放大**，在相同的时间内做更多、更复杂的事情。
- 目标是增加问题规模
- 增加了处理器数量和内存大小
$$S_{TC} = \frac{Work(p\text{ processors})}{Work(1\text{ processor})}$$

#### 生产者与消费者
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630011013.webp" alt="Pasted image 20260630011013" width="427" loading="lazy" /><img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630011028.webp" alt="Pasted image 20260630011028" width="459" loading="lazy" />
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

#### 顺序一致性 **(Sequential Consistency, 简称 SC)**。

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630150849.webp" alt="Pasted image 20260630150849" width="594" loading="lazy" />
Lamport 的原话非常严谨，我们可以把它翻译并拆解为两条必须同时满足的铁律：
- **铁律一（全局串行化）：** _"the result of any execution is the same as if the operations of all the processors were executed in some sequential order"_ 不管这些处理器在物理上是怎么并行的，它们最终的执行结果，必须看起来像是**所有操作都被排成了一个全局的单步队列**，大家排队一个接一个地执行。
- **铁律二（局部不乱序）：** _"and the operations of each individual processor appear in the order specified by its program"_ 在这个全局队列中，如果我们只挑出某一个特定处理器（比如 P1）的操作来看，**P1 操作的先后顺序，必须和程序员在代码里写的一模一样**。绝对不允许硬件擅自把 P1 的第二行代码提到第一行代码前面去执行。
<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260630151324.webp" alt="Pasted image 20260630151324" width="562" loading="lazy" />
大多数真正的机器都不是SC

#### 存储缓冲区优化与TSO
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
