import fs from "node:fs/promises";
import path from "node:path";
import {
  Presentation,
  PresentationFile,
} from "file:///C:/Users/%E8%95%BE%E8%B5%9B/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const workspace = "C:\\Obsidion\\妙妙屋\\tmp\\presentations\\gas-solution-ppt";
const previewDir = path.join(workspace, "preview");
const layoutDir = path.join(workspace, "layout");
const finalPptx =
  "C:\\Obsidion\\妙妙屋\\04-课件\\试点产出\\2026-06-16-气体与溶液-基础班-课件.pptx";
const diffusionImg =
  "C:\\Obsidion\\妙妙屋\\mineru\\03-教材书籍\\普通化学原理（第4版）\\普通化学原理第4版 1-200_images\\02c062a1739a8343cfc0e0ed080ed13703f107b5bd8a8be2d574ec70a02336e4.jpg";
const evaporationImg =
  "C:\\Obsidion\\妙妙屋\\mineru\\03-教材书籍\\普通化学原理（第4版）\\普通化学原理第4版 1-200_images\\2291ba80e884d9d8323e0a17f4fbbb8ed8eba14d1d43f40d30c25ce6dca753e0.jpg";

const colors = {
  navy: "#17324D",
  teal: "#2F7E79",
  mist: "#EAF2F4",
  amber: "#D88A2D",
  charcoal: "#1F2933",
  slate: "#5B6975",
  line: "#C7D3DB",
  white: "#FFFFFF",
};

const slideSize = { width: 1280, height: 720 };
const frame = { left: 64, top: 52, width: 1152, height: 616 };
const bodyFont = "Microsoft YaHei";
const headingFont = "Microsoft YaHei";
const formulaFont = "Times New Roman";

async function writeBlob(filePath, blob) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function loadImagePayload(filePath, mimeType = "image/jpeg") {
  return {
    data: new Uint8Array(await fs.readFile(filePath)),
    mimeType,
  };
}

function addFooter(slide, pageNum) {
  const footer = slide.shapes.add({
    geometry: "textbox",
    position: { left: 64, top: 684, width: 1152, height: 18 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  footer.text = `气体与溶液 基础班 | 第一轮工具链 | ${pageNum}`;
  footer.text.style = {
    fontSize: 10,
    color: colors.slate,
    alignment: "right",
    typeface: bodyFont,
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
    fontSize: 13,
    bold: true,
    color,
    alignment: "center",
    typeface: bodyFont,
  };
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
    fontSize: 14,
    bold: true,
    color: "#8A5A12",
    typeface: bodyFont,
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
    fontSize: 14,
    color: colors.charcoal,
    typeface: bodyFont,
    breakLine: true,
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
    typeface: headingFont,
  };

  const titleBox = slide.shapes.add({
    geometry: "textbox",
    position: { left: 72, top: 82, width: 940, height: 44 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  titleBox.text = title;
  titleBox.text.style = {
    fontSize: 28,
    bold: true,
    color: colors.navy,
    typeface: headingFont,
  };

  if (subtitle) {
    const subtitleBox = slide.shapes.add({
      geometry: "textbox",
      position: { left: 72, top: 124, width: 980, height: 28 },
      fill: "none",
      line: { style: "solid", fill: "none", width: 0 },
    });
    subtitleBox.text = subtitle;
    subtitleBox.text.style = {
      fontSize: 15,
      color: colors.slate,
      typeface: bodyFont,
    };
  }

  slide.shapes.add({
    geometry: "line",
    position: { left: 72, top: 158, width: 140, height: 0 },
    line: { style: "solid", fill: colors.amber, width: 4 },
  });
}

function addBulletList(slide, items, position, fontSize = 19) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = items.map((item) => `• ${item}`).join("\n");
  box.text.style = {
    fontSize,
    color: colors.charcoal,
    typeface: bodyFont,
    breakLine: true,
  };
}

function addCard(slide, title, bodyLines, position, fill = colors.white) {
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
    fontSize: 18,
    bold: true,
    color: colors.navy,
    typeface: headingFont,
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
    fontSize: 16,
    color: colors.charcoal,
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

function addGasBoxDiagram(slide, position) {
  slide.shapes.add({
    geometry: "roundRect",
    position,
    fill: colors.white,
    line: { style: "solid", fill: colors.line, width: 1 },
    borderRadius: "rounded-2xl",
  });
  slide.shapes.add({
    geometry: "rect",
    position: {
      left: position.left + 20,
      top: position.top + 32,
      width: position.width - 40,
      height: position.height - 68,
    },
    fill: "#F8FBFC",
    line: { style: "solid", fill: colors.teal, width: 2 },
  });
  const pts = [
    [0.12, 0.16],[0.32, 0.24],[0.72, 0.2],[0.18, 0.56],[0.5, 0.45],[0.82, 0.4],[0.34, 0.78],[0.68, 0.7],
  ];
  for (const [x, y] of pts) {
    slide.shapes.add({
      geometry: "ellipse",
      position: {
        left: position.left + 30 + (position.width - 60) * x,
        top: position.top + 44 + (position.height - 92) * y,
        width: 12,
        height: 12,
      },
      fill: colors.amber,
      line: { style: "solid", fill: colors.amber, width: 1 },
    });
  }
}

function addVaporPressureDiagram(slide, position) {
  slide.shapes.add({
    geometry: "roundRect",
    position,
    fill: colors.white,
    line: { style: "solid", fill: colors.line, width: 1 },
    borderRadius: "rounded-2xl",
  });
  slide.shapes.add({
    geometry: "rect",
    position: {
      left: position.left + 16,
      top: position.top + position.height * 0.58,
      width: position.width - 32,
      height: position.height * 0.18,
    },
    fill: colors.mist,
    line: { style: "solid", fill: colors.teal, width: 1 },
  });
  for (let i = 0; i < 6; i += 1) {
    slide.shapes.add({
      geometry: "ellipse",
      position: {
        left: position.left + 28 + i * 30,
        top: position.top + position.height * 0.62 + (i % 2) * 8,
        width: 12,
        height: 12,
      },
      fill: colors.teal,
      line: { style: "solid", fill: colors.teal, width: 1 },
    });
  }
  for (let i = 0; i < 4; i += 1) {
    slide.shapes.add({
      geometry: "ellipse",
      position: {
        left: position.left + 48 + i * 42,
        top: position.top + position.height * 0.42,
        width: 10,
        height: 10,
      },
      fill: colors.amber,
      line: { style: "solid", fill: colors.amber, width: 1 },
    });
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

function addFormulaCard(
  slide,
  title,
  formula,
  position,
  fill = colors.white,
  formulaSize = 22,
) {
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
      left: position.left + 18,
      top: position.top + 14,
      width: position.width - 36,
      height: 22,
    },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  titleBox.text = title;
  titleBox.text.style = {
    fontSize: 13,
    bold: true,
    color: colors.slate,
    typeface: bodyFont,
    alignment: "center",
  };
  addFormulaText(
    slide,
    formula,
    {
      left: position.left + 14,
      top: position.top + 36,
      width: position.width - 28,
      height: position.height - 46,
    },
    formulaSize,
    colors.navy,
  );
}

function addImageCard(slide, title, imagePayload, position, caption = "") {
  slide.shapes.add({
    geometry: "roundRect",
    position,
    fill: colors.white,
    line: { style: "solid", fill: colors.line, width: 1 },
    borderRadius: "rounded-2xl",
  });
  const titleBox = slide.shapes.add({
    geometry: "textbox",
    position: {
      left: position.left + 14,
      top: position.top + 10,
      width: position.width - 28,
      height: 18,
    },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  titleBox.text = title;
  titleBox.text.style = {
    fontSize: 12,
    bold: true,
    color: colors.slate,
    typeface: bodyFont,
    alignment: "center",
  };
  slide.images.add({
    ...imagePayload,
    position: {
      left: position.left + 12,
      top: position.top + 34,
      width: position.width - 24,
      height: position.height - (caption ? 58 : 46),
    },
    fit: "contain",
  });
  if (caption) {
    const captionBox = slide.shapes.add({
      geometry: "textbox",
      position: {
        left: position.left + 14,
        top: position.top + position.height - 22,
        width: position.width - 28,
        height: 14,
      },
      fill: "none",
      line: { style: "solid", fill: "none", width: 0 },
    });
    captionBox.text = caption;
    captionBox.text.style = {
      fontSize: 10,
      color: colors.slate,
      typeface: bodyFont,
      alignment: "center",
    };
  }
}

async function main() {
  await fs.mkdir(previewDir, { recursive: true });
  await fs.mkdir(layoutDir, { recursive: true });
  const diffusionAsset = await loadImagePayload(diffusionImg);
  const evaporationAsset = await loadImagePayload(evaporationImg);

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
      position: { left: 78, top: 208, width: 740, height: 100 },
      fill: "none",
      line: { style: "solid", fill: "none", width: 0 },
    });
    title.text = "气体与溶液（基础班）";
    title.text.style = {
      fontSize: 34,
      bold: true,
      color: colors.navy,
      typeface: headingFont,
    };
    const sub = s.shapes.add({
      geometry: "textbox",
      position: { left: 78, top: 316, width: 760, height: 80 },
      fill: "none",
      line: { style: "solid", fill: "none", width: 0 },
    });
    sub.text =
      "第一轮课堂投影首版 | 计算规范、理想气体、Dalton 分压、浓度换算、依数性主线";
    sub.text.style = {
      fontSize: 19,
      color: colors.slate,
      typeface: bodyFont,
    };
    const note = s.shapes.add({
      geometry: "roundRect",
      position: { left: 876, top: 206, width: 302, height: 238 },
      fill: colors.white,
      line: { style: "solid", fill: colors.line, width: 1 },
      borderRadius: "rounded-2xl",
    });
    const noteText = s.shapes.add({
      geometry: "textbox",
      position: { left: 900, top: 234, width: 252, height: 182 },
      fill: "none",
      line: { style: "solid", fill: "none", width: 0 },
    });
    noteText.text = [
      "投影定位",
      "• 讲工具链，不搬整篇讲义",
      "• 公式与表格强调快速扫读",
      "• 推导和细算保留板书",
    ].join("\n");
    noteText.text.style = {
      fontSize: 18,
      color: colors.charcoal,
      typeface: bodyFont,
      breakLine: true,
    };
    addPill(s, "理想气体", { left: 80, top: 440, width: 112, height: 34 }, colors.white);
    addPill(s, "Dalton 分压", { left: 204, top: 440, width: 128, height: 34 }, colors.white);
    addPill(s, "浓度换算", { left: 344, top: 440, width: 120, height: 34 }, colors.white);
    addPill(s, "依数性主线", { left: 476, top: 440, width: 128, height: 34 }, colors.white);
    addTeacherCue(
      s,
      "教师使用提醒",
      ["这版用于投影，不替代教师稿", "若学生跟不上，优先回到工具链总览页"],
      { left: 80, top: 506, width: 524, height: 92 },
    );
    addFooter(s, 1);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "LESSON MAP", "本节工具链", "先分类，再选公式，再核单位，再回看结果");
    addCard(s, "1. 理想气体", ["pV = nRT", "R 值必须和 p、V 单位匹配", "温度必须用 K"], { left: 72, top: 198, width: 250, height: 180 }, colors.mist);
    addCard(s, "2. Dalton 分压", ["混合气体先判恒容/恒压", "排水集气一定扣水蒸气压"], { left: 348, top: 198, width: 250, height: 180 }, colors.white);
    addCard(s, "3. 浓度换算", ["分清 w / c / b / x", "先选基准，再写定义"], { left: 624, top: 198, width: 250, height: 180 }, colors.mist);
    addCard(s, "4. 依数性", ["先抓根源：蒸气压是否下降", "第一轮以定性判断为主"], { left: 900, top: 198, width: 250, height: 180 }, colors.white);
    addBulletList(s, ["课堂节奏：工具链主线 + 代表例题 + 易错点收束", "PPT 负责条件表、总框架、题干提示；详细运算过程留板书"], { left: 86, top: 430, width: 720, height: 96 }, 18);
    addTeacherCue(
      s,
      "板书口令",
      ["先分类", "再统一单位", "再列方程", "最后回看结果是否合理"],
      { left: 834, top: 430, width: 302, height: 132 },
    );
    addFooter(s, 2);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "IDEAL GAS", "理想气体状态方程", "第一眼先看 T、p、V、R 是否在同一单位体系");
    s.shapes.add({
      geometry: "roundRect",
      position: { left: 72, top: 196, width: 360, height: 118 },
      fill: colors.navy,
      line: { style: "solid", fill: colors.navy, width: 0 },
      borderRadius: "rounded-2xl",
    });
    addFormulaText(s, "pV = nRT", { left: 112, top: 222, width: 280, height: 52 }, 34, colors.white);
    addBulletList(s, ["常用变形式见本页与板书", "密度法常回到 M = ρRT / p", "温度永远换成热力学温度 K"], { left: 72, top: 344, width: 150, height: 108 }, 17);
    addFormulaCard(s, "常用变形式", "n = pV / RT", { left: 82, top: 430, width: 146, height: 74 }, colors.white, 18);
    addGasBoxDiagram(s, { left: 238, top: 340, width: 206, height: 178 });
    addTable(
      s,
      [
        ["R 的数值", "p 单位", "V 单位", "课堂提醒"],
        ["8.31", "kPa", "dm³", "竞赛与普化计算最常用"],
        ["0.0821", "atm", "dm³", "英文资料常见"],
        ["8.314", "Pa", "m³", "SI 推导常用"],
        ["62.4", "mmHg", "dm³", "旧题偶见"],
      ],
      { left: 494, top: 206, width: 642, height: 250 },
      [120, 110, 110, 280],
    );
    addCard(s, "三句硬提醒", ["T 不能直接用 °C", "不要把 22.4 当成所有题的固定体积", "最后再统一检查有效数字"], { left: 494, top: 484, width: 642, height: 126 }, colors.mist);
    addTeacherCue(
      s,
      "板书顺序",
      ["先写 T = t + 273.15", "再写 p、V 单位并决定 R", "最后再写变形式"],
      { left: 72, top: 522, width: 370, height: 82 },
    );
    addFooter(s, 3);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "DALTON", "Dalton 分压与排水集气", "先分清总压、分压、干气压，再决定怎么代入");
    addCard(s, "核心关系", ["理想气体中：pᵢ = xᵢ · p总", "同温同压下：体积分数 = 摩尔分数"], { left: 72, top: 196, width: 324, height: 180 }, colors.mist);
    addFormulaCard(s, "总压关系", "p总 = Σpᵢ", { left: 114, top: 280, width: 152, height: 62 }, colors.white, 20);
    addCard(s, "排水集气校正", ["求物质的量时必须用干气压", "25 °C 常见 p(H₂O) = 3.17 kPa"], { left: 420, top: 196, width: 324, height: 180 }, colors.white);
    addFormulaCard(s, "干气压", "p干气 = p总 − p(H₂O)", { left: 454, top: 280, width: 254, height: 62 }, colors.mist, 18);
    addCard(s, "条件判断", ["恒容：先想分压", "恒压：先想分体积", "不同初压混合不能想当然直接相加"], { left: 768, top: 196, width: 368, height: 180 }, colors.mist);
    addImageCard(s, "教材图：NH₃ / HCl 扩散", diffusionAsset, { left: 878, top: 264, width: 216, height: 82 }, "图2.4  雾环偏向 HCl 一侧");
    addTable(
      s,
      [
        ["场景", "第一反应", "常见错法"],
        ["混合后求各组分贡献", "先判恒容还是恒压", "只看见 xi 就盲套公式"],
        ["排水法收集气体", "先扣水蒸气压", "直接把总压代入 pV=nRT"],
        ["不同初压气体连通", "回到状态方程重新算", "把原压强简单相加"],
      ],
      { left: 72, top: 418, width: 1064, height: 190 },
      [230, 330, 460],
    );
    addFooter(s, 4);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "CONCENTRATION", "四种浓度语言", "先分清分母是谁：溶液、溶剂、体积，还是总物质的量");
    addTable(
      s,
      [
        ["名称", "符号", "定义", "最常见场景"],
        ["质量分数", "w", "m溶质 / m溶液", "商品试剂标签"],
        ["物质的量浓度", "c", "n溶质 / V溶液", "实验室配液、滴定"],
        ["质量摩尔浓度", "b 或 m", "n溶质 / m溶剂", "依数性语言"],
        ["摩尔分数", "x", "ni / Σn", "理论推导、Raoult 定律"],
      ],
      { left: 72, top: 198, width: 1064, height: 262 },
      [180, 110, 304, 330],
    );
    addCard(s, "先抓分母", ["w 的分母是溶液质量", "b 的分母是溶剂质量", "c 的分母是溶液体积，不是加水体积"], { left: 72, top: 494, width: 496, height: 118 }, colors.mist);
    addCard(s, "课堂口径", ["换算题别跳步：先选基准，再写定义", "看到“定容”就提醒自己：不是“加固定体积的水”", "先看符号，再决定从质量还是体积入手"], { left: 600, top: 494, width: 536, height: 118 }, colors.white);
    addFooter(s, 5);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "WORKFLOW", "浓度换算主链", "把一题拆成可追踪的四步，而不是脑内跳跃");
    addCard(s, "Step 1 选基准", ["常选 100 g 溶液、1 kg 溶液或 1 dm³ 溶液", "保证质量、体积、物质的量能互相转"], { left: 72, top: 204, width: 240, height: 150 }, colors.mist);
    addCard(s, "Step 2 写定义", ["w = m质 / m液", "c = n质 / V液", "b = n质 / m剂", "x = ni / Σn"], { left: 334, top: 204, width: 240, height: 150 }, colors.white);
    addCard(s, "Step 3 补辅助量", ["常补：密度、摩尔质量、溶剂质量、体积", "必要时先从质量走到物质的量"], { left: 596, top: 204, width: 240, height: 150 }, colors.mist);
    addCard(s, "Step 4 再做换算", ["最后检查单位和数量级", "锚点公式放到下表统一看"], { left: 858, top: 204, width: 278, height: 150 }, colors.white);
    addTable(
      s,
      [
        ["课堂锚点公式", "提醒"],
        ["c = 1000ρw / M", "1000 来自 cm³ -> dm³；w 用小数"],
        ["b = w / [M(1−w)]", "分母是溶剂质量，不是溶液质量"],
        ["Π = cRT", "第一轮只要求理解“像气体方程”"],
      ],
      { left: 72, top: 400, width: 620, height: 190 },
      [260, 340],
    );
    addCard(s, "教师提示", ["这一页适合投影讲“总路线”", "细算过程请现场板书，不要把每一步都压进同一页"], { left: 732, top: 402, width: 404, height: 188 }, colors.mist);
    addFooter(s, 6);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "COLLIGATIVE", "依数性：先抓根源", "第一轮只要建立主线：溶质粒子数改变了溶剂蒸气压");
    addCard(s, "主逻辑", ["溶质加入 -> 溶剂蒸气压下降", "后面三项都可以回到这条主线理解"], { left: 72, top: 202, width: 330, height: 124 }, colors.mist);
    addCard(s, "四个结果", ["沸点升高", "凝固点降低", "渗透压", "蒸气压下降本身"], { left: 430, top: 202, width: 260, height: 124 }, colors.white);
    addCard(s, "本轮边界", ["会定性解释，不做复杂物化级推导", "电解质精确粒子数修正放到后续"], { left: 718, top: 202, width: 418, height: 124 }, colors.mist);
    addImageCard(s, "教材图：液面分子受力", evaporationAsset, { left: 928, top: 212, width: 178, height: 102 }, "图3.1  表面分子更易逸出");
    addTable(
      s,
      [
        ["现象", "课堂公式", "一句话解释"],
        ["蒸气压下降", "Δp = p* · x溶质", "表面可蒸发的溶剂比例下降"],
        ["沸点升高", "ΔT₍b₎ = K₍b₎ · m", "必须升到更高温度才能与外压相等"],
        ["凝固点降低", "ΔT₍f₎ = K₍f₎ · m", "液相更稳定，固液平衡温度下移"],
        ["渗透压", "Π = cRT", "半透膜两侧溶剂化学势差驱动"],
      ],
      { left: 72, top: 362, width: 1064, height: 240 },
      [170, 200, 694],
    );
    addFooter(s, 7);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "BOARD TEMPLATE", "板书模板：气体题四步法", "这一页专门服务课堂带做，不承担知识扩展");
    addCard(s, "Step 1 分类", ["纯气体 / 混合气体 / 排水集气 / 密度法", "先判条件，再决定入口"], { left: 72, top: 202, width: 250, height: 168 }, colors.mist);
    addCard(s, "Step 2 统一单位", ["T → K", "p、V 与 R 匹配", "必要时把 mL → dm³"], { left: 344, top: 202, width: 250, height: 168 }, colors.white);
    addCard(s, "Step 3 列方程", ["优先 pV = nRT", "混合气体补 Dalton", "排水法先扣 p(H₂O)"], { left: 616, top: 202, width: 250, height: 168 }, colors.mist);
    addCard(s, "Step 4 回看结果", ["数量级是否合理", "单位是否写对", "有效数字是否匹配"], { left: 888, top: 202, width: 248, height: 168 }, colors.white);
    addTable(
      s,
      [
        ["题型", "先写哪一句"],
        ["钢瓶气体题", "先把 MPa / °C / L 统一到 kPa / K / dm³"],
        ["排水集气题", "先写 p干气 = p总 − p(H₂O)"],
        ["密度法分子式题", "先写 M = ρRT / p"],
      ],
      { left: 72, top: 418, width: 650, height: 188 },
      [200, 450],
    );
    addTeacherCue(
      s,
      "投影用法",
      ["做例题前先停在这一页", "让学生先口头说出四步，再动笔"],
      { left: 760, top: 420, width: 376, height: 186 },
    );
    addFooter(s, 8);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "EXAMPLE 1", "例 1：钢瓶氧气题", "目标不是背答案，而是形成“先统一单位”的习惯");
    addCard(s, "题干", ["50 L 氧气钢瓶在 20 °C、1.5 MPa 时，估算钢瓶中剩余 O₂ 的质量。"], { left: 72, top: 198, width: 1064, height: 92 }, colors.mist);
    addCard(s, "解题流程", ["1. 先把 1.5 MPa 换成 1500 kPa", "2. 50 L 直接视为 50 dm³", "3. T = 293 K，选 R = 8.31", "4. 先求 n，再乘 M(O₂)"], { left: 72, top: 324, width: 494, height: 220 }, colors.white);
    addCard(s, "板书时强调", ["如果 p 用 MPa 却直接配 8.31，结果会错 1000 倍", "最后别忘有效数字和单位"], { left: 596, top: 324, width: 540, height: 220 }, colors.mist);
    addTeacherCue(
      s,
      "课堂动作",
      ["先让学生判断该选哪个 R", "不要一开始就给完整算式"],
      { left: 72, top: 562, width: 1064, height: 68 },
    );
    addFooter(s, 9);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "EXAMPLE 2", "例 2：排水集气求干燥 H₂", "看到“排水法”就自动触发：总压里混了水蒸气");
    addCard(s, "题干", ["25 °C、100.5 kPa 下，用排水法收集 H₂ 250 mL，已知 p(H₂O) = 3.17 kPa，求干燥 H₂ 的物质的量。"], { left: 72, top: 198, width: 1064, height: 96 }, colors.mist);
    addCard(s, "关键一步", ["p干气 = 100.5 - 3.17 = 97.33 kPa", "只有扣完水蒸气压，才允许代入气体方程"], { left: 72, top: 328, width: 472, height: 188 }, colors.white);
    addCard(s, "后续代入", ["V = 0.250 dm³", "T = 298 K", "n = pV / RT"], { left: 572, top: 328, width: 250, height: 188 }, colors.mist);
    addCard(s, "最容易错", ["直接把 100.5 kPa 代入", "体积没换成 dm³", "最后写成“湿气体的物质的量”"], { left: 850, top: 328, width: 286, height: 188 }, colors.white);
    addTeacherCue(
      s,
      "课堂口令",
      ["看到排水法，先别算，先扣水蒸气压", "这一题比的是流程稳定，不是心算速度"],
      { left: 72, top: 554, width: 1064, height: 70 },
    );
    addFooter(s, 10);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "EXAMPLE 3", "例 3：标签浓度到物质的量浓度", "这类题本质上是“质量分数 + 密度 + 摩尔质量”三件套");
    addCard(s, "题干", ["市售浓硫酸密度 1.84 g·cm⁻³，质量分数 98%，求其物质的量浓度。"], { left: 72, top: 198, width: 1064, height: 92 }, colors.mist);
    addCard(s, "模板公式", ["ρ 用 g·cm⁻³，w 用小数，M 用 g·mol⁻¹"], { left: 72, top: 326, width: 400, height: 188 }, colors.white);
    addFormulaText(s, "c = 1000ρw / M", { left: 108, top: 402, width: 250, height: 30 }, 22);
    addCard(s, "操作顺序", ["1. 先确认所求是 c", "2. 再确认已知量正好是 ρ、w、M", "3. 最后代入并判断数量级是否合理"], { left: 500, top: 326, width: 350, height: 188 }, colors.mist);
    addCard(s, "课堂提醒", ["“定容到 1 dm³”不等于“往 1 dm³ 水里加酸”", "如果题目继续要求 b 或 x，最好先选 100 g 溶液为基准"], { left: 878, top: 326, width: 258, height: 188 }, colors.white);
    addTeacherCue(
      s,
      "板书动作",
      ["先问：这道题用不用选基准？", "再问：定义里分母到底是谁？"],
      { left: 72, top: 548, width: 1064, height: 78 },
    );
    addFooter(s, 11);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "PRACTICE", "课堂练习承接页", "让学生先说方法，再独立落笔");
    addCard(s, "A 组：直接计算", ["1. 钢瓶氧气剩余质量", "2. 排水法 H₂ 的干气物质的量"], { left: 72, top: 202, width: 332, height: 180 }, colors.mist);
    addCard(s, "B 组：浓度换算", ["3. 37% 盐酸换算成 c", "4. 已知 w 和 ρ 继续求 b"], { left: 424, top: 202, width: 332, height: 180 }, colors.white);
    addCard(s, "C 组：判断题", ["5. 海水为什么更难结冰？", "6. 为什么排水法要扣 p(H₂O)？"], { left: 776, top: 202, width: 360, height: 180 }, colors.mist);
    addTeacherCue(
      s,
      "课堂安排",
      ["先做 A 组再转 B 组", "C 组适合当口头追问收尾", "若时间紧，至少保留 A1 + A2"],
      { left: 72, top: 430, width: 1064, height: 120 },
    );
    addFooter(s, 12);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "ERRORS", "易错点总表", "这一页建议上课末尾快扫一遍，再让学生自己补充");
    addTable(
      s,
      [
        ["易错点", "为什么错", "正确做法"],
        ["°C 直接代入气体方程", "T 必须是热力学温度", "先写 T = t + 273.15"],
        ["R 随手乱选", "R 依赖 p、V 单位体系", "先看 p、V 单位，再决定 R"],
        ["排水集气直接用总压", "收集的是湿气，混有水蒸气", "先算 p干气 = p总 - p(H₂O)"],
        ["把 b 的分母写成溶液质量", "质量摩尔浓度定义记错", "b 的分母只能是溶剂质量"],
        ["认为依数性看溶质种类", "第一轮没抓住“看粒子数”", "先问蒸气压是否下降，再判表现"],
      ],
      { left: 72, top: 194, width: 1064, height: 344 },
      [250, 360, 454],
    );
    addCard(s, "投影用法", ["讲评错题时，可让学生对照这一页给自己的错误分类", "讲义中的“易错点总表”可作为课后追踪区"], { left: 72, top: 566, width: 1064, height: 70 }, colors.mist);
    addFooter(s, 13);
  }

  {
    const s = p.slides.add();
    s.background.fill = colors.white;
    addTitle(s, "WRAP-UP", "本节收束", "投影负责收口，练熟仍要靠讲义和板书反复走流程");
    addCard(s, "下课前要能说出", ["气体题四步：分类 → 统一单位 → 列方程 → 回看结果", "浓度换算四步：选基准 → 写定义 → 补辅助量 → 再换算", "依数性判断法：先看是否是稀溶液，再抓蒸气压主线"], { left: 72, top: 202, width: 520, height: 240 }, colors.mist);
    addCard(s, "课后立刻自测", ["1. 钢瓶氧气题", "2. 排水集气题", "3. 质量分数 → c → b 的换算题"], { left: 624, top: 202, width: 512, height: 240 }, colors.white);
    addTeacherCue(
      s,
      "最后一句",
      ["先把流程说顺，再追求速度", "做题时一乱，就回到工具链总页"],
      { left: 72, top: 474, width: 520, height: 92 },
    );
    addCard(s, "当前版本定位", ["这版已经加入板书模板、练习承接和教师口令提示", "继续深化时，可再拆成三讲完整投影版"], { left: 624, top: 474, width: 512, height: 92 }, colors.white);
    addFooter(s, 14);
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
