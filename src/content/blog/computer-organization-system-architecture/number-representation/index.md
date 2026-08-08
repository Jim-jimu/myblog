---
title: "Computer Organization: Number Representation"
description: "Course notes on binary, octal, decimal, hexadecimal, unsigned values, signed encodings, two's complement, and bias encoding."
publishDate: "2026-07-06"
tags: ["course-notes","computer-architecture"]
pinned: false
giscus: false
---

[Course index](../) · [Next: Floating Point](../floating-point/)

|**进制**|**英文名称**|**常见代码前缀**|**示例**|**说明**|
|---|---|---|---|---|
|**二进制**|**Binary**|`0b` 或 `0B`|`0b1010`|仅包含数字 0 和 1。|
|**八进制**|**Octal**|`0o` 或 `0O`<br><br>  <br><br>_(C/C++等语言中常以数字 `0` 开头)_|`0o17`<br><br>  <br><br>`017`|包含数字 0 到 7。|
|**十进制**|**Decimal**|无前缀（默认）|`10`|我们日常使用的数字系统，包含 0 到 9。|
|**十六进制**|**Hexadecimal** (常简称为 **Hex**)|`0x` 或 `0X`|`0x1A`<br><br>  <br><br>`0xFF`|包含 0 到 9，以及字母 A 到 F（大小写均可，代表 10 到 15）。|
例子：

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260424204312.webp" alt="Pasted image 20260424204312" width="539" loading="lazy" />

几种重要的编码方式：unsigned, sign and Magnitude, 1's complements, 2's complement, Bias Encoding

**Unsigned 与 Overflow**

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260424212206.webp" alt="Pasted image 20260424212206" width="434" loading="lazy" />

**Sign and Magnitude (原码)**

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260424212247.webp" alt="Pasted image 20260424212247" width="421" loading="lazy" />

有两个0，最高位表示符号，但是随着binary odometer递增，所表示的数有时候增加有时候减少
以 8 位为例：
- +5 的原码：`0000 0101`
- -5 的原码：`1000 0101`

**One's Complement（反码）**

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260424212716.webp" alt="Pasted image 20260424212716" width="419" loading="lazy" />

有两个0，最高位表示符号，是将sign and magnitude的负数中除了符号位取反，解决了原码 incrementing binary odometer的问题（从左到右，一个数的反码加1，这个数也加1）

**2's Complement（补码）**

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260424213029.webp" alt="Pasted image 20260424213029" width="406" loading="lazy" />

将反码的负数部分整体向左平移一位得到，解决了2个0的问题
补码的两种计算方法：

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260424213438.webp" alt="Pasted image 20260424213438" width="406" loading="lazy" />

**Bias Encoding**

<img src="../../../notes/computer-organization-system-architecture/images/pasted-image-20260424213537.webp" alt="Pasted image 20260424213537" width="400" loading="lazy" />

这里Bias是相对于Unsigned的，比如unsigned中01111表示+15，在bias=-15的情况下，01111表示0

---

[Course index](../) · [Next: Floating Point](../floating-point/)
