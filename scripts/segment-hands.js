const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateAllPieces() {
  const width = 1024;
  const height = 1024;
  const outDir = path.join(__dirname, '../apps/web/public/hands');

  // ==========================================
  // 1. LEFT HAND SEGMENTATION
  // ==========================================
  const leftPng = path.join(outDir, 'left-hand.png');

  const leftPinkyMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 0,0
        L 355,0
        L 355,488
        C 355,510 340,530 310,530
        C 270,530 240,510 240,480
        L 0,480
        Z
      " fill="white" />
    </svg>
  `;

  const leftRingMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 355,0
        L 457,0
        L 457,430
        C 457,460 440,485 410,485
        C 375,485 355,460 355,488
        Z
      " fill="white" />
    </svg>
  `;

  const leftMiddleMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 457,0
        L 565,0
        L 565,424
        C 565,450 545,470 511,470
        C 475,470 457,450 457,430
        Z
      " fill="white" />
    </svg>
  `;

  const leftIndexMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 565,0
        L 750,0
        L 750,300
        L 699,584
        C 675,540 655,490 620,490
        C 585,490 565,455 565,424
        Z
      " fill="white" />
    </svg>
  `;

  const leftThumbMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 699,0
        L 1024,0
        L 1024,700
        C 900,700 800,660 740,630
        C 690,600 690,570 699,584
        Z
      " fill="white" />
    </svg>
  `;

  const leftPalmMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 0,1024
        L 1024,1024
        L 1024,670
        C 880,670 780,640 730,610
        L 699,584
        C 670,510 650,450 617,450
        C 580,450 565,424 565,424
        C 540,435 520,440 511,440
        C 485,440 465,430 457,430
        C 435,445 420,455 406,455
        C 380,455 365,450 355,488
        C 335,500 315,505 295,505
        C 260,505 240,488 240,488
        L 0,488
        Z
      " fill="white" />
    </svg>
  `;

  const leftPieces = [
    { name: 'left-pinky.png', mask: leftPinkyMask },
    { name: 'left-ring.png', mask: leftRingMask },
    { name: 'left-middle.png', mask: leftMiddleMask },
    { name: 'left-index.png', mask: leftIndexMask },
    { name: 'left-thumb.png', mask: leftThumbMask },
    { name: 'left-palm.png', mask: leftPalmMask },
  ];

  for (const p of leftPieces) {
    const outBuf = await sharp(leftPng)
      .composite([{ input: Buffer.from(p.mask), blend: 'dest-in' }])
      .png()
      .toBuffer();
    const webpName = p.name.replace('.png', '.webp');
    await sharp(outBuf).webp({ quality: 92 }).toFile(path.join(outDir, webpName));
    await sharp(outBuf).toFile(path.join(outDir, p.name));
  }
  console.log('Left hand pieces generated successfully.');

  // ==========================================
  // 2. RIGHT HAND SEGMENTATION
  // ==========================================
  const rightPng = path.join(outDir, 'right-hand.png');

  // Right thumb: webT: (360, 577)
  const rightThumbMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 0,0
        L 360,0
        L 360,577
        C 340,610 320,630 290,630
        C 240,630 180,600 180,580
        L 0,580
        Z
      " fill="white" />
    </svg>
  `;

  // Right index: between webT (360, 577) and web3 (475, 412)
  const rightIndexMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 300,0
        L 475,0
        L 475,412
        C 475,445 450,480 418,480
        C 385,480 365,530 360,577
        L 300,300
        Z
      " fill="white" />
    </svg>
  `;

  // Right middle: between web3 (475, 412) and web2 (584, 413)
  const rightMiddleMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 475,0
        L 584,0
        L 584,413
        C 584,440 560,465 530,465
        C 495,465 475,440 475,412
        Z
      " fill="white" />
    </svg>
  `;

  // Right ring: between web2 (584, 413) and web1 (684, 465)
  const rightRingMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 584,0
        L 684,0
        L 684,465
        C 684,475 665,485 634,485
        C 600,485 584,445 584,413
        Z
      " fill="white" />
    </svg>
  `;

  // Right pinky: from web1 (684, 465) to outer edge (800, 465)
  const rightPinkyMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 684,0
        L 1024,0
        L 1024,465
        L 771,465
        C 771,495 750,515 725,515
        C 695,515 684,490 684,465
        Z
      " fill="white" />
    </svg>
  `;

  // Right palm:
  const rightPalmMask = `
    <svg width="${width}" height="${height}">
      <path d="
        M 0,1024
        L 1024,1024
        L 1024,465
        L 771,465
        C 755,490 740,500 725,500
        C 700,500 684,465 684,465
        C 665,455 650,445 634,445
        C 605,445 584,413 584,413
        C 565,425 550,430 530,430
        C 505,430 485,420 475,412
        C 450,440 435,445 418,445
        C 390,445 375,510 360,577
        C 340,595 320,610 290,610
        C 255,610 240,577 240,577
        L 0,577
        Z
      " fill="white" />
    </svg>
  `;

  const rightPieces = [
    { name: 'right-thumb.png', mask: rightThumbMask },
    { name: 'right-index.png', mask: rightIndexMask },
    { name: 'right-middle.png', mask: rightMiddleMask },
    { name: 'right-ring.png', mask: rightRingMask },
    { name: 'right-pinky.png', mask: rightPinkyMask },
    { name: 'right-palm.png', mask: rightPalmMask },
  ];

  for (const p of rightPieces) {
    const outBuf = await sharp(rightPng)
      .composite([{ input: Buffer.from(p.mask), blend: 'dest-in' }])
      .png()
      .toBuffer();
    const webpName = p.name.replace('.png', '.webp');
    await sharp(outBuf).webp({ quality: 92 }).toFile(path.join(outDir, webpName));
    await sharp(outBuf).toFile(path.join(outDir, p.name));
  }
  console.log('Right hand pieces generated successfully.');

  // Recomposite right hand test
  await sharp(path.join(outDir, 'right-thumb.png'))
    .composite([
      { input: path.join(outDir, 'right-index.png') },
      { input: path.join(outDir, 'right-middle.png') },
      { input: path.join(outDir, 'right-ring.png') },
      { input: path.join(outDir, 'right-pinky.png') },
      { input: path.join(outDir, 'right-palm.png') },
    ])
    .png()
    .toFile(path.join(outDir, 'right-recomposite-test.png'));
  console.log('Right hand recomposite test generated.');
}

generateAllPieces().catch(console.error);
