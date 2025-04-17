<template>
    <div>
        <textarea rows="20" class="textarea textarea-bordered w-full" placeholder="请输入文档内容..."
            v-model="input"></textarea>
        <button class="btn btn-primary" @click="handleGenerate">
            转换为Word
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Document, Packer, Paragraph, TextRun, AlignmentType, PageNumber } from 'docx'
import { saveAs } from 'file-saver'

const input = ref('')

const handleGenerate = async () => {
  const lines = input.value.split("\n")
  const children = []

  let sectionCount = 0
  let subsectionCount = 0

  lines.forEach((line) => {
      line = line.trim()
      if (line.startsWith("# ")) {
          children.push(
              new Paragraph({
                  spacing: { line: 720, lineRule: "exact" },
                  alignment: AlignmentType.CENTER,
                  children: [
                      new TextRun({
                          text: line.replace("# ", ""),
                          font: "方正小标宋简体",
                          size: 44,
                          bold: false,
                          eastAsia: "方正小标宋简体",
                      }),
                  ],
              })
          )
      } else if (line.startsWith("## ")) {
          sectionCount++
          subsectionCount = 0
          const title = line.replace(/^##\s+/, "").replace(/^\S+、/, "")
          children.push(
              new Paragraph({
                  spacing: { line: 720, lineRule: "exact" },
                  children: [
                      new TextRun({
                          text: `${toChineseNumber(sectionCount)}、${title}`,
                          font: "黑体",
                          size: 32,
                          bold: false,
                          eastAsia: "黑体",
                      }),
                  ],
              })
          )
      } else if (line.startsWith("### ")) {
          subsectionCount++
          const title = line.replace(/^###\s+/, "").replace(/^（\S+）/, "")
          children.push(
              new Paragraph({
                  spacing: { line: 560, lineRule: "exact" },
                  children: [
                      new TextRun({
                          text: `（${toChineseNumber(subsectionCount)}）${title}`,
                          font: "楷体GB2312",
                          size: 32,
                          bold: true,
                          eastAsia: "楷体GB2312",
                      }),
                  ],
              })
          )
      } else if (line.length > 0) {
          children.push(
              new Paragraph({
                  spacing: { line: 560, lineRule: "exact" },
                  indent: { firstLineChars: 2 },
                  children: [
                      new TextRun({
                          text: line,
                          font: "仿宋GB2312",
                          size: 32,
                          eastAsia: "仿宋GB2312",
                      }),
                  ],
              })
          )
      }
  })

  const doc = new Document({
      sections: [
          {
              properties: {
                  page: {
                      margin: {
                          top: 2099,
                          bottom: 1984,
                          left: 1588,
                          right: 1472,
                      },
                  },
                  footers: {
                      default: new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [
                              new TextRun({
                                  children: ["——", PageNumber.CURRENT, "——"],
                                  font: "宋体",
                                  size: 28,
                                  eastAsia: "宋体",
                              }),
                          ],
                      }),
                  },
              },
              children,
          },
      ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, "电子商务改革五年规划.docx")
}

function toChineseNumber(n) {
    const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
    const units = ['', '十', '百', '千']
    if (n <= 10) return ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][n]
    const str = n.toString().split('').reverse()
    return str.map((s, i) => (s === '0' ? '' : chars[s] + units[i])).reverse().join('').replace(/^一十/, '十')
}

</script>

<style scoped>
.textarea {
    min-height: 300px;
}
</style>