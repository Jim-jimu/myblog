---
title: "Computer Organization: Floating Point"
description: "Course notes on floating-point representation, IEEE 754, special values, denormals, rounding, and floating-point addition."
publishDate: "2026-07-06"
tags: ["course-notes","computer-architecture"]
pinned: false
giscus: false
---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: Number Representation](../computer-organization-system-architecture-number-representation/) · [Next: RISC-V Assembly](../computer-organization-system-architecture-risc-v-assembly/)

小数点不需要fixed，而是floating

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424234057.webp" alt="Pasted image 20260424234057" width="398" loading="lazy" />

符号位+指数+尾数

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424234141.webp" alt="Pasted image 20260424234141" width="397" loading="lazy" />

**Underflow（下溢）** 是指计算结果的绝对值**太小，无限接近于 0**，以至于超出了当前浮点数格式所能表示的最小非零值的范围。
underflow可能会导致数字清零

## **IEEE 754**

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424234722.webp" alt="Pasted image 20260424234722" width="391" loading="lazy" />

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424234816.webp" alt="Pasted image 20260424234816" width="394" loading="lazy" />

IEEE754指数为什么使用Bias Notation

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424234847.webp" alt="Pasted image 20260424234847" width="387" loading="lazy" />

根据bias encoding，一般bias取值为$-(2^{N-1} -1 )$ 在这里就是$-127$ ，也就是说指数会存储真实数字加上127，最后计算的时候就要减去127
注意：Exponent为0和11111111时为特殊情况，后面介绍

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260424235632.webp" alt="Pasted image 20260424235632" width="377" loading="lazy" />

## Special Numbers
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
$$
(1+1 \times 2^{-23}) \times 2^{-125},(1+2 \times 2^{-23}) \times 2^{-125}...
$$
我们发现stride从 $2^{-149}$ 变成了 $2^{-148}$ 
也就是说，每次exponent加1，stride就会翻倍。

浮点数在数轴上的分布特征：**越靠近 0，浮点数分布得越密集（stride 越小）；数字的绝对值越大，浮点数分布得越稀疏（stride 越大）。** 这种步长在计算机科学中被称为 **ULP (Unit in the Last Place)**

总结

<img src="../../notes/computer-organization-system-architecture/images/pasted-image-20260425003653.webp" alt="Pasted image 20260425003653" width="366" loading="lazy" />

（神奇之处在于这个表格从上到下是除了sign外的31位二进制递增的，所表示的数也在递增）

例1: （1）IEEE754单精度如何表示1？ （2）什么时候IEEE754单精度能表示的相邻的两个数间隔为1？

## Rounding and Addition

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

---

[Course index](../computer-organization-system-architecture-notes/) · [Previous: Number Representation](../computer-organization-system-architecture-number-representation/) · [Next: RISC-V Assembly](../computer-organization-system-architecture-risc-v-assembly/)
