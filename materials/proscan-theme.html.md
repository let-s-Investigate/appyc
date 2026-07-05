<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ProScan — Design Theme</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<style>
  :root {
    /* Brand / Primary */
    --primary:        #3D5AFE;
    --primary-deep:   #2C3EE0;
    --primary-light:  #5B7BFF;
    --primary-soft:   #EAEEFF;

    /* Semantic */
    --success: #22C55E;
    --warning: #FFB020;
    --error:   #FF4D4F;
    --info:    #4D8BFF;

    /* Neutrals — Light */
    --text-primary:   #0D1326;
    --text-secondary: #6B7280;
    --border:         #E5E7EB;
    --surface:        #F6F7FB;
    --background:     #FFFFFF;

    /* Neutrals — Dark (app dark mode) */
    --dark-bg:      #0D0D12;
    --dark-surface: #16161C;
    --dark-border:  #26262E;
    --dark-text:    #F5F6FA;

    /* Spacing tokens */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;

    /* Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-pill: 999px;

    /* Shadow */
    --shadow-card: 0 4px 16px rgba(13, 19, 38, 0.06);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: var(--text-primary);
    background: var(--surface);
    line-height: 1.5;
    padding: var(--space-xl);
  }

  .wrap { max-width: 1080px; margin: 0 auto; }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
  }

  .panel {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    box-shadow: var(--shadow-card);
  }

  .eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--primary);
    margin-bottom: var(--space-md);
  }

  hr { border: none; border-top: 1px solid var(--border); margin: var(--space-lg) 0; }

  /* ---------- Brand ---------- */
  .brand { display: flex; align-items: center; gap: var(--space-md); }
  .brand-mark {
    width: 56px; height: 56px; border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--primary-light), var(--primary-deep));
    display: flex; align-items: center; justify-content: center;
  }
  .brand-mark svg { width: 30px; height: 30px; }
  .brand-name { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; }

  /* ---------- Colors ---------- */
  .sub { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-secondary); margin: var(--space-lg) 0 var(--space-sm); }
  .swatches { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); }
  .swatch .chip { height: 64px; border-radius: var(--radius-md); border: 1px solid rgba(0,0,0,0.05); }
  .swatch .name { font-size: 12px; font-weight: 600; margin-top: var(--space-sm); }
  .swatch .hex { font-size: 11px; color: var(--text-secondary); }

  /* ---------- Typography ---------- */
  .type-row {
    display: grid;
    grid-template-columns: 130px 1fr auto auto auto;
    align-items: baseline;
    gap: var(--space-md);
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--border);
  }
  .type-row:last-child { border-bottom: none; }
  .type-label { font-weight: 700; color: var(--text-primary); }
  .type-meta { font-size: 12px; color: var(--text-secondary); }
  .font-name { font-size: 44px; font-weight: 800; letter-spacing: -0.02em; }

  /* ---------- Tokens ---------- */
  .token-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-md); text-align: center; }
  .token .box { background: var(--primary-soft); border-radius: var(--radius-sm); margin: 0 auto var(--space-sm); }
  .token .lbl { font-size: 12px; font-weight: 600; }
  .token .val { font-size: 11px; color: var(--text-secondary); }

  .radius-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); text-align: center; }
  .radius .box { height: 56px; background: var(--primary); margin-bottom: var(--space-sm); }

  /* ---------- Buttons ---------- */
  .btn-row { display: flex; flex-wrap: wrap; gap: var(--space-md); align-items: center; }
  .btn {
    font-family: inherit; font-size: 16px; font-weight: 600;
    height: 52px; padding: 0 24px; border-radius: var(--radius-md);
    border: none; cursor: pointer;
  }
  .btn-primary { background: var(--primary); color: #fff; }
  .btn-secondary { background: var(--primary-soft); color: var(--primary-deep); }
  .btn-ghost { background: transparent; color: var(--primary); border: 1.5px solid var(--border); }
  .btn-pill { border-radius: var(--radius-pill); }
  .btn-meta { font-size: 12px; color: var(--text-secondary); margin-top: var(--space-sm); }

  /* ---------- Tool cards ---------- */
  .tools { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); }
  .tool { text-align: center; }
  .tool .ic {
    width: 56px; height: 56px; border-radius: var(--radius-pill);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto var(--space-sm); font-size: 22px;
  }
  .tool .nm { font-size: 12px; font-weight: 500; }
  .ic-peach { background: #FDEBDD; }
  .ic-mint  { background: #DDF3EC; }
  .ic-rose  { background: #FDE3E3; }
  .ic-blue  { background: var(--primary-soft); }

  /* ---------- Dark preview ---------- */
  .dark-card {
    background: var(--dark-bg);
    border: 1px solid var(--dark-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }
  .dark-card .file {
    background: var(--dark-surface);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    display: flex; align-items: center; gap: var(--space-md);
    margin-bottom: var(--space-md);
  }
  .dark-card .file:last-child { margin-bottom: 0; }
  .dark-card .thumb { width: 40px; height: 52px; background: #fff; border-radius: 6px; }
  .dark-card .ft { color: var(--dark-text); font-weight: 600; font-size: 14px; }
  .dark-card .fd { color: #8A8A94; font-size: 12px; }

  h2.section { grid-column: 1 / -1; font-size: 20px; font-weight: 700; margin-top: var(--space-md); }
  .full { grid-column: 1 / -1; }

  @media (max-width: 820px) {
    .grid { grid-template-columns: 1fr; }
    .type-row { grid-template-columns: 90px 1fr; }
    .type-row .type-meta:nth-child(n+3) { display: none; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="grid">

    <!-- BRAND -->
    <section class="panel">
      <div class="eyebrow">Brand</div>
      <div class="brand">
        <div class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="#fff" stroke-width="2"/>
            <circle cx="12" cy="12" r="3.2" fill="#fff"/>
            <path d="M12 3.2 14.2 8 9.8 8z" fill="#fff"/>
            <path d="M20.8 12 16 14.2 16 9.8z" fill="#fff"/>
          </svg>
        </div>
        <div class="brand-name">ProScan</div>
      </div>
      <hr/>
      <p class="type-meta">Scan, enhance, sign and organize documents. A fast, native, CamScanner-style document scanner.</p>
    </section>

    <!-- TYPOGRAPHY -->
    <section class="panel">
      <div class="eyebrow">Typography</div>
      <div class="sub">Font Family</div>
      <div class="font-name">Inter</div>
      <p class="type-meta" style="margin:8px 0 16px">Inter is a clean, highly legible sans-serif tuned for UI — friendly and precise at every size.</p>
      <div class="type-row"><span class="type-label" style="font-size:32px">H1</span><span class="type-meta">Page / Screen Title</span><span class="type-meta">32px</span><span class="type-meta">Bold</span><span class="type-meta">1.2</span></div>
      <div class="type-row"><span class="type-label" style="font-size:24px">H2</span><span class="type-meta">Section Title</span><span class="type-meta">24px</span><span class="type-meta">SemiBold</span><span class="type-meta">1.3</span></div>
      <div class="type-row"><span class="type-label" style="font-size:20px">H3</span><span class="type-meta">Card / Module Title</span><span class="type-meta">20px</span><span class="type-meta">SemiBold</span><span class="type-meta">1.3</span></div>
      <div class="type-row"><span class="type-label" style="font-size:16px">H4</span><span class="type-meta">Subheading</span><span class="type-meta">16px</span><span class="type-meta">Medium</span><span class="type-meta">1.4</span></div>
      <div class="type-row"><span class="type-label">Body Large</span><span class="type-meta">Important content</span><span class="type-meta">16px</span><span class="type-meta">Regular</span><span class="type-meta">1.6</span></div>
      <div class="type-row"><span class="type-label">Body Medium</span><span class="type-meta">Body text</span><span class="type-meta">14px</span><span class="type-meta">Regular</span><span class="type-meta">1.6</span></div>
      <div class="type-row"><span class="type-label">Body Small</span><span class="type-meta">Supporting text</span><span class="type-meta">13px</span><span class="type-meta">Regular</span><span class="type-meta">1.6</span></div>
      <div class="type-row"><span class="type-label">Caption</span><span class="type-meta">Labels, meta text</span><span class="type-meta">11px</span><span class="type-meta">Regular</span><span class="type-meta">1.4</span></div>
    </section>

    <!-- COLORS -->
    <section class="panel full">
      <div class="eyebrow">Colors</div>

      <div class="sub">Primary</div>
      <div class="swatches">
        <div class="swatch"><div class="chip" style="background:#3D5AFE"></div><div class="name">ProScan Blue</div><div class="hex">#3D5AFE</div></div>
        <div class="swatch"><div class="chip" style="background:#2C3EE0"></div><div class="name">Deep Blue</div><div class="hex">#2C3EE0</div></div>
        <div class="swatch"><div class="chip" style="background:#5B7BFF"></div><div class="name">Light Blue</div><div class="hex">#5B7BFF</div></div>
        <div class="swatch"><div class="chip" style="background:#EAEEFF"></div><div class="name">Soft Blue</div><div class="hex">#EAEEFF</div></div>
      </div>

      <div class="sub">Semantic</div>
      <div class="swatches">
        <div class="swatch"><div class="chip" style="background:#22C55E"></div><div class="name">Success</div><div class="hex">#22C55E</div></div>
        <div class="swatch"><div class="chip" style="background:#FFB020"></div><div class="name">Warning</div><div class="hex">#FFB020</div></div>
        <div class="swatch"><div class="chip" style="background:#FF4D4F"></div><div class="name">Error</div><div class="hex">#FF4D4F</div></div>
        <div class="swatch"><div class="chip" style="background:#4D8BFF"></div><div class="name">Info</div><div class="hex">#4D8BFF</div></div>
      </div>

      <div class="sub">Neutrals — Light</div>
      <div class="swatches">
        <div class="swatch"><div class="chip" style="background:#0D1326"></div><div class="name">Text Primary</div><div class="hex">#0D1326</div></div>
        <div class="swatch"><div class="chip" style="background:#6B7280"></div><div class="name">Text Secondary</div><div class="hex">#6B7280</div></div>
        <div class="swatch"><div class="chip" style="background:#E5E7EB"></div><div class="name">Border</div><div class="hex">#E5E7EB</div></div>
        <div class="swatch"><div class="chip" style="background:#F6F7FB"></div><div class="name">Surface</div><div class="hex">#F6F7FB</div></div>
      </div>

      <div class="sub">Neutrals — Dark Mode</div>
      <div class="swatches">
        <div class="swatch"><div class="chip" style="background:#0D0D12"></div><div class="name">Background</div><div class="hex">#0D0D12</div></div>
        <div class="swatch"><div class="chip" style="background:#16161C"></div><div class="name">Surface</div><div class="hex">#16161C</div></div>
        <div class="swatch"><div class="chip" style="background:#26262E"></div><div class="name">Border</div><div class="hex">#26262E</div></div>
        <div class="swatch"><div class="chip" style="background:#F5F6FA"></div><div class="name">Text</div><div class="hex">#F5F6FA</div></div>
      </div>
    </section>

    <!-- SPACING -->
    <section class="panel">
      <div class="eyebrow">Spacing Scale</div>
      <div class="token-grid">
        <div class="token"><div class="box" style="width:4px;height:4px"></div><div class="lbl">xs</div><div class="val">4px</div></div>
        <div class="token"><div class="box" style="width:8px;height:8px"></div><div class="lbl">sm</div><div class="val">8px</div></div>
        <div class="token"><div class="box" style="width:16px;height:16px"></div><div class="lbl">md</div><div class="val">16px</div></div>
        <div class="token"><div class="box" style="width:24px;height:24px"></div><div class="lbl">lg</div><div class="val">24px</div></div>
        <div class="token"><div class="box" style="width:32px;height:32px"></div><div class="lbl">xl</div><div class="val">32px</div></div>
      </div>
    </section>

    <!-- RADIUS -->
    <section class="panel">
      <div class="eyebrow">Border Radius</div>
      <div class="radius-grid">
        <div class="radius"><div class="box" style="border-radius:8px"></div><div class="lbl" style="font-size:12px;font-weight:600">sm</div><div class="val" style="font-size:11px;color:var(--text-secondary)">8px</div></div>
        <div class="radius"><div class="box" style="border-radius:12px"></div><div class="lbl" style="font-size:12px;font-weight:600">md</div><div class="val" style="font-size:11px;color:var(--text-secondary)">12px</div></div>
        <div class="radius"><div class="box" style="border-radius:16px"></div><div class="lbl" style="font-size:12px;font-weight:600">lg</div><div class="val" style="font-size:11px;color:var(--text-secondary)">16px</div></div>
        <div class="radius"><div class="box" style="border-radius:999px"></div><div class="lbl" style="font-size:12px;font-weight:600">pill</div><div class="val" style="font-size:11px;color:var(--text-secondary)">999px</div></div>
      </div>
    </section>

    <!-- BUTTONS -->
    <section class="panel full">
      <div class="eyebrow">Buttons</div>
      <div class="btn-row">
        <div><button class="btn btn-primary">Save PDF</button><div class="btn-meta">Primary · h52 · r12</div></div>
        <div><button class="btn btn-secondary">Add More Files</button><div class="btn-meta">Secondary · h52 · r12</div></div>
        <div><button class="btn btn-ghost">Cancel</button><div class="btn-meta">Ghost · h52 · r12</div></div>
        <div><button class="btn btn-primary btn-pill">Continue</button><div class="btn-meta">Pill · h52</div></div>
      </div>
    </section>

    <!-- DARK PREVIEW -->
    <section class="panel">
      <div class="eyebrow">Dark Mode · Recent Files</div>
      <div class="dark-card">
        <div class="file"><div class="thumb"></div><div><div class="ft">Job Application Letter</div><div class="fd">12/30/2023 · 09:41</div></div></div>
        <div class="file"><div class="thumb"></div><div><div class="ft">Requirements Document</div><div class="fd">12/29/2023 · 13:20</div></div></div>
        <div class="file"><div class="thumb"></div><div><div class="ft">Recommendation Letter</div><div class="fd">12/28/2023 · 14:56</div></div></div>
      </div>
    </section>

  </div>
</div>
</body>
</html>
