# Skyie Marketing OS — Brand Review UX Specification

**Version:** 1.0  
**Status:** Design Ready  
**Last Updated:** December 2025

---

## 1. Overview

The Brand Review UX is the primary interface for users to review, confirm, and manage their Brand Genome. It presents extracted brand attributes in an intuitive, guided workflow that builds user confidence while ensuring accuracy.

### 1.1 Design Principles

1. **Progressive Disclosure** — Show essential information first, details on demand
2. **Confidence Visualization** — Make extraction confidence visible and actionable
3. **Direct Manipulation** — Allow inline editing without modal dialogs
4. **Comparison Context** — Show source material alongside extracted values
5. **Non-Destructive** — All changes are versioned; nothing is ever truly lost

### 1.2 User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BRAND REVIEW WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │  Upload  │───▶│ Extract  │───▶│  Review  │───▶│ Confirm  │───▶│  Active  │
   │  Sources │    │ (async)  │    │ & Edit   │    │ & Lock   │    │  Genome  │
   └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
        │               │               │               │               │
        │               │               │               │               │
   Upload PDFs,    Background      Section-by-    Final review    Genome v1.0
   enter URLs,     processing      section        and sign-off    ready for use
   connect social  with progress   guided review                  in campaigns
```

---

## 2. Page Structure

### 2.1 Layout Grid

```
┌────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
│  ┌────────────┬─────────────────────────────────────────┬────────────────┐ │
│  │   Logo     │  Brand Name / Review Progress            │ Save / Publish │ │
│  └────────────┴─────────────────────────────────────────┴────────────────┘ │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────┬─────────────────────────────────────────────────────────┐│
│  │              │                                                         ││
│  │  NAVIGATION  │                  MAIN CONTENT AREA                      ││
│  │  SIDEBAR     │                                                         ││
│  │              │  ┌─────────────────────────────────────────────────────┐││
│  │  □ Identity  │  │                                                     │││
│  │  □ Colors    │  │              SECTION CONTENT                        │││
│  │  □ Typography│  │                                                     │││
│  │  □ Voice     │  │                                                     │││
│  │  □ Imagery   │  │                                                     │││
│  │  □ Compliance│  └─────────────────────────────────────────────────────┘││
│  │              │                                                         ││
│  │  ───────────│  ┌─────────────────────────────────────────────────────┐││
│  │              │  │              SOURCE PREVIEW PANEL                   │││
│  │  Confidence  │  │         (collapsible, shows extraction source)      │││
│  │  Score: 87%  │  └─────────────────────────────────────────────────────┘││
│  │              │                                                         ││
│  └──────────────┴─────────────────────────────────────────────────────────┘│
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Navigation Sidebar

```typescript
interface NavigationSection {
  id: string;
  label: string;
  icon: IconType;
  status: 'pending' | 'in_review' | 'confirmed' | 'has_issues';
  confidence: number; // 0-100
  issueCount: number;
  subsections?: {
    id: string;
    label: string;
    status: SectionStatus;
  }[];
}

const sections: NavigationSection[] = [
  {
    id: 'identity',
    label: 'Brand Identity',
    icon: 'building',
    status: 'confirmed',
    confidence: 95,
    issueCount: 0,
    subsections: [
      { id: 'name', label: 'Name & Tagline', status: 'confirmed' },
      { id: 'mission', label: 'Mission & Vision', status: 'confirmed' },
      { id: 'personality', label: 'Personality', status: 'in_review' },
    ],
  },
  {
    id: 'colors',
    label: 'Color System',
    icon: 'palette',
    status: 'in_review',
    confidence: 88,
    issueCount: 2,
    subsections: [
      { id: 'primary', label: 'Primary Colors', status: 'confirmed' },
      { id: 'secondary', label: 'Secondary Colors', status: 'has_issues' },
      { id: 'semantic', label: 'Semantic Colors', status: 'pending' },
    ],
  },
  // ... other sections
];
```

**Visual States:**

| Status       | Icon | Color  | Description              |
| ------------ | ---- | ------ | ------------------------ |
| `pending`    | ○    | Gray   | Not yet reviewed         |
| `in_review`  | ◐    | Blue   | Currently being reviewed |
| `confirmed`  | ●    | Green  | User has confirmed       |
| `has_issues` | ⚠    | Orange | Has unresolved issues    |

---

## 3. Component Specifications

### 3.1 Confidence Indicator

Shows extraction confidence for each field or section.

```typescript
interface ConfidenceIndicatorProps {
  value: number; // 0-1
  source: ExtractionSource;
  showDetails: boolean;
}

// Visual representation:
// [████████░░] 82%  Extracted from website
// [██████████] 98%  From brand guidelines PDF
// [███░░░░░░░] 35%  Low confidence - needs review
```

**Design:**

- Progress bar with color coding:
  - `>= 0.9`: Green (#34A853)
  - `>= 0.7`: Blue (#1A73E8)
  - `>= 0.5`: Yellow (#FBBC04)
  - `< 0.5`: Red (#EA4335)
- Tooltip shows source and extraction details
- Click to expand source preview panel

### 3.2 Editable Field Component

Inline editing with source comparison.

```tsx
interface EditableFieldProps {
  fieldPath: string; // e.g., "identity.tagline"
  label: string;
  value: string | string[];
  confidence: number;
  source: ExtractionSource;
  validation?: ValidationRule[];
  placeholder?: string;
  multiline?: boolean;
}

// States:
// 1. Display Mode (default)
// 2. Hover Mode (show edit affordance)
// 3. Edit Mode (inline editing)
// 4. Saving Mode (optimistic update)
// 5. Error Mode (validation failed)

function EditableField({ fieldPath, label, value, confidence, source }: EditableFieldProps) {
  return (
    <div className="editable-field">
      <div className="field-header">
        <label>{label}</label>
        <ConfidenceIndicator value={confidence} source={source} />
      </div>

      <div className="field-content">
        <div className="current-value" onClick={enableEditing}>
          {value || <span className="placeholder">Click to add</span>}
          <EditIcon className="edit-affordance" />
        </div>

        {isEditing && (
          <div className="edit-controls">
            <input value={editValue} onChange={handleChange} onBlur={saveAndClose} autoFocus />
            <ValidationFeedback errors={validationErrors} />
          </div>
        )}
      </div>

      {showSource && <SourcePreview source={source} highlight={value} />}
    </div>
  );
}
```

**Styling:**

```css
.editable-field {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 12px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.editable-field:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
}

.editable-field.editing {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
}

.editable-field.has-error {
  border-color: var(--error-color);
}

.edit-affordance {
  opacity: 0;
  transition: opacity 0.2s;
}

.editable-field:hover .edit-affordance {
  opacity: 0.5;
}
```

### 3.3 Color Swatch Component

For reviewing and editing brand colors.

```tsx
interface ColorSwatchProps {
  color: BrandColor;
  confidence: number;
  source: ExtractionSource;
  onEdit: (newColor: BrandColor) => void;
  onDelete?: () => void;
}

function ColorSwatch({ color, confidence, source, onEdit, onDelete }: ColorSwatchProps) {
  return (
    <div className="color-swatch-card">
      {/* Large color preview */}
      <div
        className="color-preview"
        style={{ backgroundColor: color.hex }}
        onClick={openColorPicker}
      >
        {/* Contrast text overlay showing hex */}
        <span className={getContrastClass(color.hex)}>{color.hex}</span>
      </div>

      {/* Color name and semantic meaning */}
      <div className="color-details">
        <EditableField label="Name" value={color.name} placeholder="e.g., Sky Blue" />
        <EditableField
          label="Usage"
          value={color.usage?.join(', ')}
          placeholder="Where should this color be used?"
        />
      </div>

      {/* Color format alternatives */}
      <div className="color-formats">
        <code>HEX: {color.hex}</code>
        <code>
          RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
        </code>
        {color.pantone && <code>Pantone: {color.pantone}</code>}
      </div>

      {/* Accessibility info */}
      <div className="accessibility-badges">
        {color.accessibility?.wcag_aa_on_white && <Badge variant="success">AA on White</Badge>}
        {color.accessibility?.wcag_aaa_on_white && <Badge variant="success">AAA on White</Badge>}
      </div>

      {/* Confidence and source */}
      <ConfidenceIndicator value={confidence} source={source} />
    </div>
  );
}
```

**Layout Grid for Colors:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PRIMARY COLOR                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │                        ████████████████                             ││
│  │                        ████████████████                             ││
│  │                        ████ #1A73E8 ███                             ││
│  │                        ████████████████                             ││
│  │                        ████████████████                             ││
│  │                                                                     ││
│  │  Name: Skyie Blue                                       ✓ Confirmed ││
│  │  Usage: Primary CTAs, Headers, Links                                ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │  HEX: #1A73E8  |  RGB: 26, 115, 232  |  HSL: 217°, 89%, 51%        ││
│  │  [AA ✓] [AAA ✗] Contrast on white: 4.5:1                           ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │  [████████░░] 92% confidence — Extracted from logo + website       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  SECONDARY COLORS                                                       │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │   ██████████  │  │   ██████████  │  │   + Add Color │               │
│  │   #174EA6     │  │   #34A853     │  │               │               │
│  │   Navy        │  │   Success     │  │               │               │
│  │   [░░░░░] 78% │  │   [████] 95%  │  │               │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Typography Preview Component

Live preview of font settings.

```tsx
interface TypographyPreviewProps {
  typography: TypographySystem;
  confidence: number;
}

function TypographyPreview({ typography, confidence }: TypographyPreviewProps) {
  return (
    <div className="typography-preview">
      {/* Font family selector */}
      <div className="font-family-section">
        <h3>Primary Font</h3>
        <FontSelector value={typography.primary_font} onChange={handleFontChange} />
        <div className="font-preview" style={{ fontFamily: typography.primary_font.family }}>
          The quick brown fox jumps over the lazy dog
          <br />
          ABCDEFGHIJKLMNOPQRSTUVWXYZ
          <br />
          abcdefghijklmnopqrstuvwxyz
          <br />
          0123456789 !@#$%^&*()
        </div>
      </div>

      {/* Type scale preview */}
      <div className="type-scale-section">
        <h3>Type Scale</h3>
        {Object.entries(typography.hierarchy).map(([level, style]) => (
          <TypeScaleRow
            key={level}
            level={level}
            style={style}
            onEdit={(newStyle) => handleStyleChange(level, newStyle)}
          />
        ))}
      </div>
    </div>
  );
}

function TypeScaleRow({ level, style }: { level: string; style: TypeStyle }) {
  const sampleText = {
    h1: 'Main Headline',
    h2: 'Section Header',
    h3: 'Subsection Title',
    body: 'Body text that forms the main content of your marketing materials.',
    caption: 'Caption or fine print text',
  };

  return (
    <div className="type-scale-row">
      <div className="level-label">{level}</div>
      <div
        className="level-preview"
        style={{
          fontSize: `${style.size_px}px`,
          fontWeight: style.weight,
          lineHeight: style.line_height,
          letterSpacing: style.letter_spacing,
        }}
      >
        {sampleText[level] || level}
      </div>
      <div className="level-specs">
        {style.size_px}px / {style.weight} / {style.line_height}
      </div>
      <button className="edit-button" onClick={() => openTypeEditor(level)}>
        Edit
      </button>
    </div>
  );
}
```

### 3.5 Voice & Tone Slider

Interactive sliders for voice parameters.

```tsx
interface VoiceSliderProps {
  parameter: keyof VoiceParameters;
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
  description: string;
  onChange: (value: number) => void;
}

function VoiceSlider({
  parameter,
  label,
  value,
  leftLabel,
  rightLabel,
  description,
  onChange,
}: VoiceSliderProps) {
  const examples = getExamplesForParameter(parameter, value);

  return (
    <div className="voice-slider">
      <div className="slider-header">
        <span className="parameter-label">{label}</span>
        <span className="parameter-value">{Math.round(value * 100)}%</span>
      </div>

      <div className="slider-track">
        <span className="left-label">{leftLabel}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={value * 100}
          onChange={(e) => onChange(parseInt(e.target.value) / 100)}
        />
        <span className="right-label">{rightLabel}</span>
      </div>

      <p className="parameter-description">{description}</p>

      {/* Live example based on current value */}
      <div className="example-output">
        <span className="example-label">Example output:</span>
        <blockquote>{examples[getExampleIndex(value)]}</blockquote>
      </div>
    </div>
  );
}

// Voice Parameters Section Layout
function VoiceParametersSection({ voice, onChange }: VoiceParametersSectionProps) {
  return (
    <div className="voice-parameters-section">
      <VoiceSlider
        parameter="formality"
        label="Formality"
        value={voice.formality}
        leftLabel="Casual"
        rightLabel="Formal"
        description="How formal or casual should the brand voice be?"
        onChange={(v) => onChange({ ...voice, formality: v })}
      />

      <VoiceSlider
        parameter="warmth"
        label="Warmth"
        value={voice.warmth}
        leftLabel="Distant"
        rightLabel="Warm"
        description="How approachable and friendly should the tone be?"
        onChange={(v) => onChange({ ...voice, warmth: v })}
      />

      <VoiceSlider
        parameter="confidence"
        label="Confidence"
        value={voice.confidence}
        leftLabel="Tentative"
        rightLabel="Authoritative"
        description="How assertive should claims and statements be?"
        onChange={(v) => onChange({ ...voice, confidence: v })}
      />

      <VoiceSlider
        parameter="technical_level"
        label="Technical Level"
        value={voice.technical_level}
        leftLabel="Layperson"
        rightLabel="Expert"
        description="What level of technical vocabulary should be used?"
        onChange={(v) => onChange({ ...voice, technical_level: v })}
      />

      <VoiceSlider
        parameter="humor"
        label="Humor"
        value={voice.humor}
        leftLabel="Serious"
        rightLabel="Playful"
        description="How much wit or playfulness is appropriate?"
        onChange={(v) => onChange({ ...voice, humor: v })}
      />
    </div>
  );
}
```

### 3.6 Vocabulary Management

Interactive lists for preferred/avoided/banned words.

```tsx
interface VocabularyListProps {
  title: string;
  words: string[];
  type: 'preferred' | 'avoid' | 'banned';
  onAdd: (word: string) => void;
  onRemove: (word: string) => void;
}

function VocabularyList({ title, words, type, onAdd, onRemove }: VocabularyListProps) {
  const colorMap = {
    preferred: { bg: '#E8F5E9', border: '#4CAF50', icon: '✓' },
    avoid: { bg: '#FFF3E0', border: '#FF9800', icon: '⚠' },
    banned: { bg: '#FFEBEE', border: '#F44336', icon: '✗' },
  };

  return (
    <div className="vocabulary-list" style={{ borderColor: colorMap[type].border }}>
      <h4>{title}</h4>
      <p className="list-description">
        {type === 'preferred' && 'Words and phrases to actively use'}
        {type === 'avoid' && 'Words to minimize or use carefully'}
        {type === 'banned' && 'Words that must never appear'}
      </p>

      <div className="word-chips">
        {words.map((word) => (
          <Chip
            key={word}
            label={word}
            icon={colorMap[type].icon}
            style={{ backgroundColor: colorMap[type].bg }}
            onDelete={() => onRemove(word)}
          />
        ))}
        <AddChip onAdd={onAdd} placeholder={`Add ${type} word...`} />
      </div>
    </div>
  );
}
```

### 3.7 Compliance Rules Preview

Visual representation of active compliance rules.

```tsx
interface ComplianceRuleCardProps {
  rule: ComplianceRule;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
}

function ComplianceRuleCard({ rule, onToggle, onEdit }: ComplianceRuleCardProps) {
  return (
    <div className={`compliance-rule-card ${rule.enforcement}`}>
      <div className="rule-header">
        <div className="rule-badge">
          {rule.enforcement === 'block' && <BlockIcon />}
          {rule.enforcement === 'warn' && <WarningIcon />}
          {rule.enforcement === 'log' && <InfoIcon />}
          <span>{rule.enforcement.toUpperCase()}</span>
        </div>
        <Toggle checked={true} onChange={onToggle} />
      </div>

      <h4 className="rule-id">{rule.rule_id}</h4>
      <p className="rule-description">{rule.description}</p>

      {rule.regulation && (
        <div className="regulation-tag">
          <LegalIcon />
          {rule.regulation}
        </div>
      )}

      <div className="rule-triggers">
        <span>Triggers when:</span>
        <ul>
          {rule.trigger_conditions?.map((condition, i) => (
            <li key={i}>
              <code>{condition}</code>
            </li>
          ))}
        </ul>
      </div>

      <button className="edit-rule-button" onClick={onEdit}>
        Configure Rule
      </button>
    </div>
  );
}
```

---

## 4. Interaction Patterns

### 4.1 Section Confirmation Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│  SECTION: Color System                                    Status: Review │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Content of section...]                                                 │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  ⓘ Review this section carefully. Once confirmed, changes will     │ │
│  │    require a new version.                                          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  [ Flag for Later Review ]     [ Request Expert Review ]     [ Confirm ] │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Source Comparison View

When user clicks on confidence indicator:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  SOURCE COMPARISON                                              [Close X]│
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  EXTRACTED VALUE                    │  SOURCE MATERIAL                   │
│  ─────────────────────────────────  │  ────────────────────────────────  │
│                                     │                                    │
│  Primary Color: #1A73E8             │  [Screenshot of website header     │
│  ████████████████████               │   with color highlighted]          │
│                                     │                                    │
│  Confidence: 92%                    │  Also found in:                    │
│  Extracted from: Website header     │  • Logo file (98% match)           │
│                                     │  • Brand guidelines p.12           │
│                                     │                                    │
│  ┌────────────────────────────────┐ │  ┌────────────────────────────────┐│
│  │ [Accept]  [Edit]  [Reject]     │ │  │ [View Full Source]             ││
│  └────────────────────────────────┘ │  └────────────────────────────────┘│
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Low Confidence Alert

When a field has confidence below threshold:

```tsx
function LowConfidenceAlert({ field, confidence, source }: LowConfidenceAlertProps) {
  return (
    <Alert variant="warning">
      <AlertIcon />
      <div className="alert-content">
        <strong>Low confidence extraction</strong>
        <p>
          We're {Math.round(confidence * 100)}% confident about this value. Please review the source
          material and confirm or correct.
        </p>
        <div className="alert-actions">
          <Button variant="outline" onClick={viewSource}>
            View Source
          </Button>
          <Button variant="primary" onClick={confirmValue}>
            Confirm Value
          </Button>
        </div>
      </div>
    </Alert>
  );
}
```

---

## 5. Responsive Behavior

### 5.1 Breakpoints

| Breakpoint | Width     | Layout Changes                             |
| ---------- | --------- | ------------------------------------------ |
| Desktop XL | >= 1440px | Full 3-column layout with source panel     |
| Desktop    | >= 1024px | 2-column with collapsible source panel     |
| Tablet     | >= 768px  | Single column with bottom sheet for source |
| Mobile     | < 768px   | Single column, simplified controls         |

### 5.2 Mobile Adaptations

- Navigation moves to bottom tab bar
- Color swatches stack vertically
- Voice sliders become full-width
- Source preview opens in modal
- Bulk actions accessible via FAB

---

## 6. Accessibility

### 6.1 Keyboard Navigation

| Key               | Action                              |
| ----------------- | ----------------------------------- |
| `Tab`             | Move between sections               |
| `Enter` / `Space` | Activate/edit focused field         |
| `Escape`          | Cancel edit, close panels           |
| `Ctrl + S`        | Save current changes                |
| `Ctrl + Enter`    | Confirm section                     |
| `Arrow keys`      | Adjust slider values (when focused) |

### 6.2 Screen Reader Announcements

```tsx
// Example: Announcing color swatch
<div
  role="button"
  aria-label={`${color.name} color, hex value ${color.hex}, ${confidence}% confidence, click to edit`}
  aria-describedby={`color-${color.hex}-description`}
>
  {/* Visual content */}
</div>
<div id={`color-${color.hex}-description`} className="sr-only">
  {color.usage?.join(', ')}.
  {color.accessibility?.wcag_aa_on_white ? 'Meets WCAG AA contrast requirements.' : ''}
</div>
```

### 6.3 Color Contrast

All interactive elements meet WCAG AAA (7:1) contrast requirements.

---

## 7. State Management

### 7.1 Data Structure

```typescript
interface BrandReviewState {
  // The genome being reviewed
  genome: BrandGenome;

  // Original extracted values (for comparison)
  originalGenome: BrandGenome;

  // Section-level state
  sections: {
    [sectionId: string]: {
      status: SectionStatus;
      confidence: number;
      lastReviewedAt: Date | null;
      reviewedBy: string | null;
      notes: string;
    };
  };

  // Field-level changes
  pendingChanges: {
    [fieldPath: string]: {
      originalValue: any;
      newValue: any;
      changedAt: Date;
      changedBy: string;
    };
  };

  // UI state
  ui: {
    activeSectionId: string;
    sourcePreviewOpen: boolean;
    sourcePreviewField: string | null;
    editingField: string | null;
    validationErrors: ValidationError[];
  };
}
```

### 7.2 Actions

```typescript
type BrandReviewAction =
  | { type: 'SET_FIELD_VALUE'; fieldPath: string; value: any }
  | { type: 'CONFIRM_SECTION'; sectionId: string }
  | { type: 'FLAG_FOR_REVIEW'; sectionId: string; note: string }
  | { type: 'OPEN_SOURCE_PREVIEW'; fieldPath: string }
  | { type: 'CLOSE_SOURCE_PREVIEW' }
  | { type: 'START_EDITING'; fieldPath: string }
  | { type: 'STOP_EDITING' }
  | { type: 'UNDO_CHANGE'; fieldPath: string }
  | { type: 'SUBMIT_FOR_APPROVAL' }
  | { type: 'PUBLISH_GENOME' };
```

---

## 8. API Integration

### 8.1 Auto-Save

```typescript
// Debounced auto-save on field changes
const AUTOSAVE_DELAY = 2000; // 2 seconds

function useAutoSave(genome: BrandGenome, pendingChanges: PendingChanges) {
  const debouncedSave = useMemo(
    () =>
      debounce(async (changes) => {
        await api.brands.patch(genome.id, changes);
        showToast('Changes saved');
      }, AUTOSAVE_DELAY),
    [genome.id]
  );

  useEffect(() => {
    if (Object.keys(pendingChanges).length > 0) {
      debouncedSave(pendingChanges);
    }
  }, [pendingChanges]);
}
```

### 8.2 Optimistic Updates

```typescript
function handleFieldChange(fieldPath: string, newValue: any) {
  // Immediately update UI
  dispatch({ type: 'SET_FIELD_VALUE', fieldPath, value: newValue });

  // Queue for auto-save (will be debounced)
  // On error, revert to original value
}
```

---

## 9. Error Handling

### 9.1 Validation Errors

Displayed inline below the affected field:

```tsx
<div className="validation-error">
  <ErrorIcon />
  <span>{error.message}</span>
  {error.suggestion && (
    <button onClick={() => applySuggestion(error.suggestion)}>
      Apply suggestion: {error.suggestion}
    </button>
  )}
</div>
```

### 9.2 Save Failures

```tsx
<Toast variant="error">
  <div>
    <strong>Failed to save changes</strong>
    <p>Your changes to {fieldName} couldn't be saved. They're stored locally.</p>
  </div>
  <div className="toast-actions">
    <Button onClick={retry}>Retry</Button>
    <Button onClick={discardLocal}>Discard</Button>
  </div>
</Toast>
```

---

## 10. Component Library Reference

All components use the Skyie Design System. Key dependencies:

- `@skyie/ui` — Core component library
- `@skyie/icons` — Icon set
- `@skyie/color-picker` — Color selection component
- `@skyie/font-picker` — Font selection with Google Fonts integration

```tsx
import { Button, Toggle, Slider, Chip, Badge, Alert, Toast, Modal, Tooltip } from '@skyie/ui';

import {
  EditIcon,
  CheckIcon,
  WarningIcon,
  ColorPaletteIcon,
  TypeIcon,
  VoiceIcon,
} from '@skyie/icons';
```

---

## 11. File References

This UX specification is designed to work with the following schema files:

- `brand-genome.schema.json` — JSON Schema for Brand Genome validation
- `campaign-blueprint.schema.json` — JSON Schema for Campaign Blueprint
- `openapi.yaml` — API specification for backend integration
- `types.ts` — TypeScript type definitions
- `golden-tests.yaml` — Enforcement engine test cases
