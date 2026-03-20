# 🎨 @pack/neon-tokens

> OKLCH-based neon design tokens for the Pulse platform.

`@pack/neon-tokens` provides the colour palette and design tokens used by the **Pulse** frontend. All colours are defined in the OKLCH colour space for perceptual uniformity and vibrant neon gradients.

---

## 🎨 Palette

The token set defines **28 CSS custom properties** (`--ps-neon-01` through `--ps-neon-28`) spanning warm synth tones through violet neon.

```css
:root {
  --ps-neon-01: oklch(0.75 0.18 30);   /* warm synth */
  --ps-neon-14: oklch(0.82 0.22 150);  /* mid green  */
  --ps-neon-28: oklch(0.70 0.25 300);  /* deep violet */
  /* ... full palette in src/colors.css */
}
```

---

## 🔌 Usage

### CSS Import

```css
@import '@pack/neon-tokens/dist/index.css';
```

### Tailwind Integration

The Pulse frontend maps these tokens to Tailwind utility classes via its `tailwind.config.ts`, enabling usage like:

```html
<div class="bg-[var(--ps-neon-05)] text-[var(--ps-neon-22)]">
  Neon-styled content
</div>
```

---

## 🏗️ Project Structure

```
src/
├── index.css       # Entry point, imports colors.css
└── colors.css      # All 28 OKLCH token definitions
dist/
└── index.css       # Built output (PostCSS)
```

---

## 📋 Dependencies

| Dependency | Version |
|------------|---------|
| `postcss` | (build) |
