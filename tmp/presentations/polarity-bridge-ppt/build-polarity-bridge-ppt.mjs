import fs from "node:fs/promises";
import path from "node:path";
import {
  Presentation,
  PresentationFile,
} from "file:///C:/Users/%E8%95%BE%E8%B5%9B/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const workspace = "C:\\Obsidion\\妙妙屋\\tmp\\presentations\\polarity-bridge-ppt";
const previewDir = path.join(workspace, "preview");
const layoutDir = path.join(workspace, "layout");
const finalPptx =
  "C:\\Obsidion\\妙妙屋\\04-课件\\试点产出\\2026-06-17-键的极性与分子极性-基础班-课件.pptx";

const colors = {
  navy: "#17324D",
  teal: "#2F7E79",
  mist: "#EAF2F4",
  amber: "#D88A2D",
  rose: "#F7ECE8",
  charcoal: "#1F2933",
  slate: "#5B6975",
  line: "#C7D3DB",
  white: "#FFFFFF",
  pale: "#F8FAFB",
};

const slideSize = { width: 1280, height: 720 };
const bodyFont = "SimSun";
const headingFont = "SimHei";
const formulaFont = "Times New Roman";

function hasChinese(text) {
  return /[\u3400-\u9FFF]/.test(text);
}

function pickFont(text, kind = "body") {
  if (!hasChinese(text)) {
    return formulaFont;
  }
  return kind === "heading" ? headingFont : bodyFont;
}

function pickProjectionFont(text, kind = "body") {
  if (!hasChinese(text)) {
    return formulaFont;
  }
  return headingFont;
}

async function writeBlob(filePath, blob) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function addFooter(slide, pageNum) {
  const footer = slide.shapes.add({
    geometry: "textbox",
    position: { left: 64, top: 684, width: 1152, height: 18 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  footer.text = `键的极性与分子极性 | 第一轮基础班桥梁增强课 | ${pageNum}`;
  footer.text.style = {
    fontSize: 10,
    color: colors.slate,
    alignment: "right",
    typeface: bodyFont,
  };
}

function addTitle(slide, kicker, title, subtitle = "") {
  const kickerBox = slide.shapes.add({
    geometry: "textbox",
    position: { left: 72, top: 54, width: 340, height: 22 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  kickerBox.text = kicker;
  kickerBox.text.style = {
    fontSize: 12,
    bold: true,
    color: colors.teal,
    typeface: pickFont(kicker, "heading"),
  };

  const titleBox = slide.shapes.add({
    geometry: "textbox",
    position: { left: 72, top: 82, width: 1000, height: 44 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  titleBox.text = title;
  titleBox.text.style = {
    fontSize: 28,
    bold: true,
    color: colors.navy,
    typeface: pickFont(title, "heading"),
  };

  if (subtitle) {
    const subtitleBox = slide.shapes.add({
      geometry: "textbox",
      position: { left: 72, top: 124, width: 1040, height: 28 },
      fill: "none",
      line: { style: "solid", fill: "none", width: 0 },
    });
    subtitleBox.text = subtitle;
    subtitleBox.text.style = {
      fontSize: 15,
      color: colors.slate,
      typeface: pickFont(subtitle, "body"),
    };
  }

  slide.shapes.add({
    geometry: "line",
    position: { left: 72, top: 158, width: 140, height: 0 },
    line: { style: "solid", fill: colors.amber, width: 4 },
  });
}

function addMixedText(slide, segments, position, fontSize = 20, bold = false, alignment = "left") {
  const box = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = {
    runs: segments.map((segment) => ({
      text: segment.text,
      style: {
        fontSize: segment.fontSize || fontSize,
        bold: segment.bold ?? bold,
        color: segment.color || colors.charcoal,
        typeface: segment.typeface || pickFont(segment.text, "body"),
      },
    })),
  };
  box.text.style = {
    fontSize,
    color: colors.charcoal,
    typeface: bodyFont,
    alignment,
  };
}

function addCard(slide, title, bodyLines, position, fill = colors.white, options = {}) {
  const titleFontSize = options.titleFontSize || 18;
  const bodyFontSize = options.bodyFontSize || 16;
  const titleTypeface = options.titleTypeface || pickFont(title, "heading");
  const bodyTypeface = options.bodyTypeface || bodyFont;
  slide.shapes.add({
    geometry: "roundRect",
    position,
    fill,
    line: { style: "solid", fill: colors.line, width: 1 },
    borderRadius: "rounded-2xl",
  });
  const titleBox = slide.shapes.add({
    geometry: "textbox",
    position: {
      left: position.left + 20,
      top: position.top + 18,
      width: position.width - 40,
      height: 26,
    },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  titleBox.text = title;
  titleBox.text.style = {
    fontSize: titleFontSize,
    bold: true,
    color: colors.navy,
    typeface: titleTypeface,
  };
  const bodyBox = slide.shapes.add({
    geometry: "textbox",
    position: {
      left: position.left + 20,
      top: position.top + 56,
      width: position.width - 40,
      height: position.height - 72,
    },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  bodyBox.text = bodyLines.map((line) => `• ${line}`).join("\n");
  bodyBox.text.style = {
    fontSize: bodyFontSize,
    color: colors.charcoal,
    typeface: bodyTypeface,
    breakLine: true,
  };
}

function addBulletList(slide, items, position, fontSize = 19, color = colors.charcoal) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = items.map((item) => `• ${item}`).join("\n");
  box.text.style = {
    fontSize,
    color,
    typeface: bodyFont,
    breakLine: true,
  };
}

function addTable(slide, rows, position, colWidths) {
  const rowHeight = position.height / rows.length;
  let top = position.top;
  for (let r = 0; r < rows.length; r += 1) {
    let left = position.left;
    for (let c = 0; c < rows[r].length; c += 1) {
      const isHeader = r === 0;
      const width = colWidths[c];
      slide.shapes.add({
        geometry: "rect",
        position: { left, top, width, height: rowHeight },
        fill: isHeader ? colors.mist : colors.white,
        line: { style: "solid", fill: colors.line, width: 1 },
      });
      const cell = slide.shapes.add({
        geometry: "textbox",
        position: {
          left: left + 8,
          top: top + 7,
          width: width - 16,
          height: rowHeight - 14,
        },
        fill: "none",
        line: { style: "solid", fill: "none", width: 0 },
      });
      cell.text = String(rows[r][c]);
      cell.text.style = {
        fontSize: isHeader ? 15 : 14,
        bold: isHeader,
        color: isHeader ? colors.navy : colors.charcoal,
        typeface: bodyFont,
        breakLine: true,
      };
      left += width;
    }
    top += rowHeight;
  }
}

function addFormulaText(slide, text, position, fontSize = 22, color = colors.navy) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    fontSize,
    italic: true,
    color,
    alignment: "center",
    typeface: formulaFont,
  };
}

function addPill(slide, text, position, fill = colors.white, color = colors.navy) {
  slide.shapes.add({
    geometry: "roundRect",
    position,
    fill,
    line: { style: "solid", fill: colors.line, width: 1 },
    borderRadius: "rounded-xl",
  });
  const box = slide.shapes.add({
    geometry: "textbox",
    position: {
      left: position.left + 12,
      top: position.top + 8,
      width: position.width - 24,
      height: position.height - 16,
    },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    fontSize: 14,
    bold: true,
    color,
    alignment: "center",
    typeface: pickProjectionFont(text, "body"),
  };
}

function addArrow(slide, left, top, width, color = colors.teal) {
  slide.shapes.add({
    geometry: "chevron",
    position: { left, top, width, height: 34 },
    fill: color,
    line: { style: "solid", fill: color, width: 1 },
  });
}

function addTeacherCue(slide, title, lines, position) {
  slide.shapes.add({
    geometry: "roundRect",
    position,
    fill: "#FFF7EA",
    line: { style: "solid", fill: "#E7C27B", width: 1 },
    borderRadius: "rounded-2xl",
  });
  const titleBox = slide.shapes.add({
    geometry: "textbox",
    position: {
      left: position.left + 18,
      top: position.top + 12,
      width: position.width - 36,
      height: 22,
    },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  titleBox.text = title;
  titleBox.text.style = {
    fontSize: 15,
    bold: true,
    color: "#8A5A12",
    typeface: pickProjectionFont(title, "heading"),
  };
  const body = slide.shapes.add({
    geometry: "textbox",
    position: {
      left: position.left + 18,
      top: position.top + 40,
      width: position.width - 36,
      height: position.height - 52,
    },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  body.text = lines.map((line) => `• ${line}`).join("\n");
  body.text.style = {
    fontSize: 15,
    color: colors.charcoal,
    typeface: pickProjectionFont(lines.join(" "), "body"),
    breakLine: true,
  };
}

function addDipolePair(slide, title, leftOrigin, topOrigin, labels) {
  slide.shapes.add({
    geometry: "roundRect",
    position: { left: leftOrigin, top: topOrigin, width: 500, height: 210 },
    fill: colors.white,
    line: { style: "solid", fill: colors.line, width: 1 },
    borderRadius: "rounded-2xl",
  });
  const titleBox = slide.shapes.add({
    geometry: "textbox",
    position: { left: leftOrigin + 18, top: topOrigin + 16, width: 460, height: 24 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  titleBox.text = title;
  titleBox.text.style = {
    fontSize: 18,
    bold: true,
    color: colors.navy,
    typeface: pickFont(title, "heading"),
    alignment: "center",
  };

  const leftAtom = slide.shapes.add({
    geometry: "ellipse",
    position: { left: leftOrigin + 80, top: topOrigin + 86, width: 54, height: 54 },
    fill: colors.mist,
    line: { style: "solid", fill: colors.teal, width: 2 },
  });
  leftAtom.text = labels[0];
  leftAtom.text.style = {
    fontSize: 18,
    bold: true,
    color: colors.navy,
    alignment: "center",
    typeface: formulaFont,
  };

  const centerAtom = slide.shapes.add({
    geometry: "ellipse",
    position: { left: leftOrigin + 222, top: topOrigin + 82, width: 62, height: 62 },
    fill: colors.rose,
    line: { style: "solid", fill: colors.amber, width: 2 },
  });
  centerAtom.text = labels[1];
  centerAtom.text.style = {
    fontSize: 20,
    bold: true,
    color: colors.navy,
    alignment: "center",
    typeface: formulaFont,
  };

  const rightAtom = slide.shapes.add({
    geometry: "ellipse",
    position: { left: leftOrigin + 366, top: topOrigin + 86, width: 54, height: 54 },
    fill: colors.mist,
    line: { style: "solid", fill: colors.teal, width: 2 },
  });
  rightAtom.text = labels[2];
  rightAtom.text.style = {
    fontSize: 18,
    bold: true,
    color: colors.navy,
    alignment: "center",
    typeface: formulaFont,
  };

  addArrow(slide, leftOrigin + 136, topOrigin + 96, 80);
  addArrow(slide, leftOrigin + 286, topOrigin + 96, 80);
}

function addBentMolecule(slide, title, leftOrigin, topOrigin, center, wing) {
  slide.shapes.add({
    geometry: "roundRect",
    position: { left: leftOrigin, top: topOrigin, width: 500, height: 210 },
    fill: colors.white,
    line: { style: "solid", fill: colors.line, width: 1 },
    borderRadius: "rounded-2xl",
  });
  const titleBox = slide.shapes.add({
    geometry: "textbox",
    position: { left: leftOrigin + 18, top: topOrigin + 16, width: 460, height: 24 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  titleBox.text = title;
  titleBox.text.style = {
    fontSize: 18,
    bold: true,
    color: colors.navy,
    alignment: "center",
    typeface: pickFont(title, "heading"),
  };

  const c = slide.shapes.add({
    geometry: "ellipse",
    position: { left: leftOrigin + 220, top: topOrigin + 90, width: 62, height: 62 },
    fill: colors.rose,
    line: { style: "solid", fill: colors.amber, width: 2 },
  });
  c.text = center;
  c.text.style = {
    fontSize: 20,
    bold: true,
    color: colors.navy,
    alignment: "center",
    typeface: formulaFont,
  };

  const t1 = slide.shapes.add({
    geometry: "ellipse",
    position: { left: leftOrigin + 110, top: topOrigin + 48, width: 54, height: 54 },
    fill: colors.mist,
    line: { style: "solid", fill: colors.teal, width: 2 },
  });
  t1.text = wing;
  t1.text.style = {
    fontSize: 18,
    bold: true,
    color: colors.navy,
    alignment: "center",
    typeface: formulaFont,
  };

  const t2 = slide.shapes.add({
    geometry: "ellipse",
    position: { left: leftOrigin + 338, top: topOrigin + 48, width: 54, height: 54 },
    fill: colors.mist,
    line: { style: "solid", fill: colors.teal, width: 2 },
  });
  t2.text = wing;
  t2.text.style = {
    fontSize: 18,
    bold: true,
    color: colors.navy,
    alignment: "center",
    typeface: formulaFont,
  };

  slide.shapes.add({
    geometry: "line",
    position: { left: leftOrigin + 162, top: topOrigin + 98, width: 88, height: 30 },
    line: { style: "solid", fill: colors.teal, width: 3 },
  });
  slide.shapes.add({
    geometry: "line",
    position: { left: leftOrigin + 280, top: topOrigin + 128, width: 88, height: -30 },
    line: { style: "solid", fill: colors.teal, width: 3 },
  });
  addArrow(slide, leftOrigin + 150, topOrigin + 82, 66);
  addArrow(slide, leftOrigin + 284, topOrigin + 82, 66);
}

async function main() {
  await fs.mkdir(previewDir, { recursive: true });
  await fs.mkdir(layoutDir, { recursive: true });

  const p = Presentation.create({ slideSize });

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    s.shapes.add({
      geometry: "rect",
      position: { left: 0, top: 0, width: 1280, height: 720 },
      fill: colors.mist,
      line: { style: "solid", fill: "none", width: 0 },
      opacity: 0.55,
    });
    s.shapes.add({
      geometry: "rect",
      position: { left: 0, top: 0, width: 1280, height: 150 },
      fill: colors.navy,
      line: { style: "solid", fill: "none", width: 0 },
    });
    const title = s.shapes.add({
      geometry: "textbox",
      position: { left: 78, top: 206, width: 760, height: 100 },
      fill: "none",
      line: { style: "solid", fill: "none", width: 0 },
    });
    title.text = "键的极性与分子极性";
    title.text.style = {
      fontSize: 34,
      bold: true,
      color: colors.navy,
      typeface: headingFont,
    };
    const sub = s.shapes.add({
      geometry: "textbox",
      position: { left: 78, top: 316, width: 780, height: 88 },
      fill: "none",
      line: { style: "solid", fill: "none", width: 0 },
    });
    sub.text =
      "第一轮基础班桥梁增强课 | 从电负性差出发，建立“先看键，再看形，最后看矢量和”的极性判断链";
    sub.text.style = {
      fontSize: 19,
      color: colors.slate,
      typeface: bodyFont,
    };
    addPill(s, "CO₂ vs H₂O", { left: 80, top: 442, width: 128, height: 34 }, colors.white, colors.navy);
    addPill(s, "BF₃ vs NH₃", { left: 222, top: 442, width: 128, height: 34 }, colors.white, colors.navy);
    addPill(s, "CCl₄ vs CH₂Cl₂", { left: 364, top: 442, width: 154, height: 34 }, colors.white, colors.navy);
    addTeacherCue(
      s,
      "投影定位",
      ["这是课堂投影稿，不是全文讲义", "重点：判断流程、分子对照、易错点收束"],
      { left: 876, top: 210, width: 304, height: 232 },
    );
    addFooter(s, 1);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "LESSON MAP", "本节问题与判断顺序", "有极性键的分子，一定有极性吗？");
    addCard(s, "课堂问题", ["为什么 H₂O 是极性分子，而 CO₂ 不是？", "为什么 CCl₄ 每根键都有极性，整体却无极性？"], { left: 72, top: 198, width: 514, height: 182 }, colors.mist, { bodyFontSize: 17 });
    addCard(s, "最短判断顺序", ["1. 这根键有没有极性", "2. 构型是否对称", "3. 各键矩能否抵消"], { left: 622, top: 198, width: 514, height: 182 }, colors.white, { bodyFontSize: 17 });
    addBulletList(s, ["这节课不是背一串结论，而是训练一个可迁移的判断流程", "后续遇到新分子，也要按同一顺序走，而不是只记见过的答案"], { left: 86, top: 430, width: 720, height: 90 }, 18);
    addTeacherCue(s, "教师提示", ["先问学生：分子极性和键极性是不是一回事", "让学生先说流程，再进例子"], { left: 836, top: 430, width: 300, height: 118 });
    addFooter(s, 2);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "THREE LAYERS", "三层概念先分家", "先分清谁在“拉电子”，谁在“整体偏向”");
    addTable(
      s,
      [
        ["概念", "研究对象", "核心问题", "一句话记忆"],
        ["电负性", "分子中的原子", "谁更会拉电子", "看原子"],
        ["键的极性", "某一根键", "电子云偏向哪一端", "看局部"],
        ["分子极性", "整个分子", "所有偏向加起来还剩不剩", "看整体"],
      ],
      { left: 72, top: 198, width: 880, height: 248 },
      [160, 200, 300, 220],
    );
    addCard(s, "为什么要分三层", ["很多错误都来自把“原子会拉电子”“某根键有偏向”“整个分子有偶极矩”混成一句话"], { left: 72, top: 486, width: 610, height: 122 }, colors.mist);
    addCard(s, "课堂口令", ["电负性看原子", "键极性看局部", "分子极性看整体"], { left: 714, top: 486, width: 422, height: 122 }, colors.white);
    addFooter(s, 3);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "BOND POLARITY", "键为什么会有极性", "先看成键原子的电负性差");
    addTable(
      s,
      [
        ["键", "电负性差", "课堂判断"],
        ["Cl-Cl", "0", "非极性键"],
        ["H-Cl", "中等", "极性键"],
        ["Na-Cl", "很大", "离子性很强"],
      ],
      { left: 72, top: 204, width: 420, height: 218 },
      [120, 120, 180],
    );
    addCard(s, "这里要立刻纠偏", ["极性键不等于离子键", "极性键只是电子偏了，离子键接近电子转过去"], { left: 526, top: 204, width: 610, height: 148 }, colors.mist);
    addCard(s, "给分子极性做准备", ["可以把一根极性键看成一个有方向的键矩", "后面问分子极性，本质是在问这些键矩加起来还剩不剩"], { left: 526, top: 380, width: 610, height: 148 }, colors.white);
    addTeacherCue(s, "课堂动作", ["这页不要停太久，目标只是建立“键矩”语言", "真正拉开差异的在后面 CO₂ / H₂O 对照"], { left: 72, top: 470, width: 420, height: 118 });
    addFooter(s, 4);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "COMPARE 1", "CO₂ vs H₂O", "同样都有极性键，整体结论却完全相反");
    addDipolePair(s, "CO₂：直线形，键矩完全抵消", 72, 198, ["O", "C", "O"]);
    addBentMolecule(s, "H₂O：V 形，键矩不能完全抵消", 708, 198, "O", "H");
    addCard(s, "这一组一定要讲透", ["局部极性不等于整体极性", "同样是两根极性键，构型不同，分子极性可能完全相反"], { left: 72, top: 448, width: 1064, height: 120 }, colors.mist);
    addFooter(s, 5);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "SYMMETRY", "对称构型常通向非极性", "第一轮最实用的课堂入口：先看是否高度对称");
    addTable(
      s,
      [
        ["分子", "构型", "键的极性", "分子极性"],
        ["CO₂", "直线形", "有", "非极性"],
        ["BF₃", "平面三角形", "有", "非极性"],
        ["CCl₄", "正四面体", "有", "非极性"],
        ["PF₅", "三角双锥", "有", "非极性"],
        ["XeF₄", "平面正方形", "有", "非极性"],
      ],
      { left: 72, top: 196, width: 660, height: 296 },
      [140, 200, 140, 180],
    );
    addCard(s, "课堂结论 1", ["构型完全对称时，极性键往往彼此抵消，分子可能无极性"], { left: 768, top: 206, width: 368, height: 122 }, colors.mist, { bodyFontSize: 17 });
    addCard(s, "课堂结论 2", ["这不是死背清单，而是用构型去判断矢量和"], { left: 768, top: 350, width: 368, height: 98 }, colors.white, { bodyFontSize: 17 });
    addTeacherCue(s, "板书建议", ["至少把 CO₂、BF₃、CCl₄ 画出来", "不要只投表格结论"], { left: 768, top: 472, width: 368, height: 110 });
    addFooter(s, 6);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "ASYMMETRY", "不对称构型常通向极性", "极性分子往往不是“有极性键”，而是“有剩下的键矩”");
    addTable(
      s,
      [
        ["分子", "构型", "课堂判断理由", "分子极性"],
        ["H₂O", "V 形", "两键矩夹角存在，不能完全抵消", "极性"],
        ["NH₃", "三角锥", "空间不对称", "极性"],
        ["CH₃Cl", "四面体但取代不对称", "C-Cl 键矩不能被其余键完全抵消", "极性"],
        ["SO₂", "V 形", "与 CO₂ 对照可看出构型差异", "极性"],
      ],
      { left: 72, top: 196, width: 760, height: 270 },
      [120, 160, 320, 160],
    );
    addCard(s, "课堂追问", ["如果骨架一样，但取代基不完全相同，还能不能简单说“对称”"], { left: 864, top: 210, width: 272, height: 116 }, colors.mist, { bodyFontSize: 17 });
    addCard(s, "这就引到下一页", ["CCl₄ 与 CH₂Cl₂ 都是四面体骨架，但极性结论不同"], { left: 864, top: 350, width: 272, height: 116 }, colors.white, { bodyFontSize: 17 });
    addFooter(s, 7);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "COMPARE 2", "CCl₄ vs CH₂Cl₂", "构型相同，不代表分子极性相同");
    addCard(s, "CCl₄", ["正四面体", "四个取代基完全相同", "四个 C-Cl 键矩彼此抵消", "非极性分子"], { left: 72, top: 204, width: 474, height: 250 }, colors.mist);
    addCard(s, "CH₂Cl₂", ["四面体骨架", "2 个 H + 2 个 Cl，取代不完全对称", "各键矩不能完全抵消", "极性分子"], { left: 590, top: 204, width: 546, height: 250 }, colors.white);
    addBulletList(s, ["这一页专门处理一个高频误区：'四面体分子一定非极性' 是错的", "真正该问的是：是否高度对称，取代是否相同"], { left: 86, top: 500, width: 1040, height: 70 }, 18);
    addFooter(s, 8);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "FLOW", "第一轮判断流程卡", "碰到常见主族分子，优先按这四步走");
    addCard(s, "Step 1", ["先写 Lewis 结构，确认中心原子周围电子对"], { left: 72, top: 214, width: 240, height: 150 }, colors.mist);
    addCard(s, "Step 2", ["用 VSEPR 判断空间构型"], { left: 334, top: 214, width: 240, height: 150 }, colors.white);
    addCard(s, "Step 3", ["判断每根键是否有极性"], { left: 596, top: 214, width: 240, height: 150 }, colors.mist);
    addCard(s, "Step 4", ["检查键矩能否因对称性而抵消"], { left: 858, top: 214, width: 278, height: 150 }, colors.white);
    addTable(
      s,
      [
        ["适合立刻练的分子", "这一步主要练什么"],
        ["CO₂ / H₂O", "同样有极性键，构型不同"],
        ["BF₃ / NH₃", "平面三角 vs 三角锥"],
        ["CCl₄ / CH₂Cl₂ / CH₃Cl", "同骨架下的取代对称性"],
      ],
      { left: 72, top: 404, width: 680, height: 188 },
      [250, 430],
    );
    addTeacherCue(s, "课堂用法", ["做题前先停在这一页", "让学生先口头报流程，不要直接报极性"], { left: 790, top: 406, width: 346, height: 186 });
    addFooter(s, 9);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "EXAMPLES", "例题承接页", "先讲最小对照，再进综合判断");
    addCard(s, "例题 1", ["比较 HCl、HBr、HI 三种键的极性大小规律"], { left: 72, top: 196, width: 332, height: 124 }, colors.mist, { bodyFontSize: 18 });
    addCard(s, "例题 2", ["判断 CO₂ 和 H₂O 的分子极性，并解释原因"], { left: 424, top: 196, width: 332, height: 124 }, colors.white, { bodyFontSize: 18 });
    addCard(s, "例题 3", ["判断 BF₃、NH₃、CCl₄、CH₃Cl 的分子极性"], { left: 776, top: 196, width: 360, height: 124 }, colors.mist, { bodyFontSize: 18 });
    addCard(s, "例题 4", ["判断 CO₂、SO₂、CH₂Cl₂、XeF₄ 的分子极性，并说明依据"], { left: 72, top: 360, width: 1064, height: 118 }, colors.white, { bodyFontSize: 18 });
    addTeacherCue(s, "页序建议", ["先 1 再 2，打透“局部 vs 整体”", "再 3、4，把构型和取代对称性都扫一遍"], { left: 72, top: 514, width: 1064, height: 92 });
    addFooter(s, 10);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "ERRORS", "易错点总表", "最后一轮快扫，最适合课堂收口");
    addTable(
      s,
      [
        ["错误想法", "为什么错", "正确理解"],
        ["有极性键就一定是极性分子", "忽略构型与矢量抵消", "先看键，再看形，再看和"],
        ["极性键就是离子键", "把“偏”误解成“转移”", "极性共价键仍然是共用电子"],
        ["对称就是看上去差不多", "没有先确定空间构型", "必须先确定 VSEPR 构型"],
        ["四面体分子一定非极性", "忽略取代是否相同", "只有高度对称且取代相同才易完全抵消"],
      ],
      { left: 72, top: 198, width: 1064, height: 292 },
      [250, 360, 454],
    );
    addCard(s, "推荐课堂动作", ["讲完这一页后，可以让学生回头给前面的例题逐一对照自己属于哪类错误"], { left: 72, top: 526, width: 1064, height: 78 }, colors.mist, { bodyFontSize: 17 });
    addFooter(s, 11);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "WRAP-UP", "本节收束", "先把判断顺序说顺，再追求做题速度");
    addCard(s, "下课前至少带走三句话", ["键的极性看电负性差", "分子极性看键矩矢量和", "构型对称性与取代对称性同样重要"], { left: 72, top: 202, width: 520, height: 210 }, colors.mist);
    addCard(s, "课后立刻自测", ["1. CO₂ / H₂O", "2. BF₃ / NH₃", "3. CCl₄ / CH₂Cl₂ / CH₃Cl"], { left: 624, top: 202, width: 512, height: 210 }, colors.white);
    addTeacherCue(s, "最后一句", ["一乱就回到流程卡：先键、再形、后矢量和", "这节桥梁课的目标不是多，而是把判断顺序固定住"], { left: 72, top: 456, width: 1064, height: 96 });
    addFooter(s, 12);
  }

  for (const [index, slide] of p.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(
      path.join(previewDir, `${stem}.png`),
      await p.export({ slide, format: "png", scale: 1 }),
    );
    await fs.writeFile(
      path.join(layoutDir, `${stem}.layout.json`),
      await (await slide.export({ format: "layout" })).text(),
    );
  }

  await writeBlob(
    path.join(previewDir, "deck-montage.webp"),
    await p.export({ format: "webp", montage: true, scale: 1 }),
  );

  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(finalPptx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
