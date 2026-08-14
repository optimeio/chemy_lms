# Certificate Layout & Design Reference

## Official Certificate Template Specifications

### Physical Dimensions
- **Width**: 1050 pixels (desktop rendering)
- **Height**: 750 pixels (desktop rendering)
- **Aspect Ratio**: ~1.4:1 (landscape)
- **Print Size**: 11" × 8.5" (A4 landscape equivalent)

### Color Scheme
```
Background: Certificate Template Image (/public/certificate-template.png)
├─ Gold Border Frame (from image)
├─ White/Cream Interior (from image)
└─ Text Color: Black (#000000)

Supporting Text Color: Dark Gray (#333333)
Underline Color: Black (#000000)
Border Thickness: 1.5px solid
```

## Layout Structure

### Complete Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    [120px Top Padding - Certificate Template]              │
│                                                                             │
│                            [80px Side Padding]                             │
│                                                                             │
│                     THIS IS TO CERTIFY THAT                               │
│                     (11px, Bold, Spaced 1.5px)                           │
│                          [15px Gap]                                        │
│                                                                             │
│                     John Doe Smith                                         │
│                     (26px, Bold, Serif, Centered)                        │
│                     (minHeight: 40px for vertical centering)              │
│                          [12px Gap]                                        │
│                                                                             │
│                              of                                            │
│                     (12px, Regular, Centered)                            │
│                          [8px Gap]                                         │
│                                                                             │
│                     Department of Computer Science                        │
│                     (13px, Regular, Serif, Centered)                     │
│                     (minHeight: 30px for vertical centering)              │
│                          [12px Gap]                                        │
│                                                                             │
│                           studying in                                      │
│                     (12px, Regular, Centered)                            │
│                          [8px Gap]                                         │
│                                                                             │
│                     Anna University, Chennai                              │
│                     (13px, Regular, Serif, Centered)                     │
│                     (minHeight: 30px for vertical centering)              │
│                          [15px Gap]                                        │
│                                                                             │
│               has successfully completed the Student Development            │
│                           Programme on                                     │
│                     (12px, Regular, lineHeight 1.6)                       │
│                          [8px Gap]                                         │
│                                                                             │
│                       IoT with Arduino and Embedded Systems                │
│                     (14px, Bold, Serif, Centered)                        │
│                     (minHeight: 35px for vertical centering)              │
│                          [12px Gap]                                        │
│                                                                             │
│                   conducted by Tamil Nadu Skill Development                 │
│                        Corporation (TNSDC)                                │
│                     in association with The SM Groups at                  │
│                          ANNA UNIVERSITY                                   │
│                     during the Academic Year 2025-2026                    │
│                     (11-12px, Regular, lineHeight 1.5)                    │
│                                                                             │
│                          [20px Gap]                                        │
│                                                                             │
│  Training Duration: _______________      Issue Date: 13/08/2025          │
│  (11px Bold, Left align)             (11px Bold, Right align)            │
│  (Underline: 1.5px solid black)      (Underline: 1.5px solid black)      │
│  (Gap between: 50px)                 (minHeight: 20px)                    │
│                                                                             │
│                          [20px Gap]                                        │
│                                                                             │
│                                                  Managing Director, TNSDC  │
│                                                  (11px Bold, Right align)  │
│                                                  (marginBottom: 35px)      │
│                                                  (marginRight: 30px)       │
│                                                                             │
│              *This is Eligible under Career Advancement Scheme            │
│              (10px Italic, Right align, Color: #333)                      │
│                                                                             │
│                          [100px Bottom Padding]                           │
│                          [80px Side Padding]                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Spacing Hierarchy

### Vertical Spacing (Gaps)
```
Header Section:
  "THIS IS TO CERTIFY THAT" → Name: 15px
  Name → "of": 12px
  "of" → Department: 8px
  Department → "studying in": 12px
  "studying in" → College: 8px
  College → Course Text: 15px
  Course Text → Course Title: 8px
  Course Title → TNSDC Text: 12px

Bottom Section:
  Content → Divider: 20px
  Date Row → Signature: 20px
  Signature → Footer: 15px

Horizontal Padding:
  Top: 120px
  Sides: 80px
  Bottom: 100px
```

### Font Size Hierarchy
```
Title Elements:
  "THIS IS TO CERTIFY THAT": 11px (Bold, Letter-spacing: 1.5px)

Primary Content:
  Student Name: 26px (Bold, Letter-spacing: 0.8px)
  Course Title: 14px (Bold)
  ANNA UNIVERSITY: 12px (Bold)

Secondary Content:
  Department/College: 13px
  Course Completion Text: 12px
  TNSDC Information: 11px

Tertiary Content:
  "of" / "studying in" / Date Labels: 12px
  Footer Text: 10px (Italic)

Line Heights:
  Title/Name: 1.2
  Large Text: 1.3-1.4
  Regular Text: 1.5-1.6
  Compact Text: 1.8
```

## Component Sections

### Section 1: Header (Centered)
```
THIS IS TO CERTIFY THAT
├─ Font Size: 11px
├─ Font Weight: 600 (Bold)
├─ Letter Spacing: 1.5px
├─ Text Align: Center
└─ Margin Bottom: 15px
```

### Section 2: Student Name (Centered)
```
[STUDENT FULL NAME]
├─ Font Size: 26px
├─ Font Weight: Bold
├─ Line Height: 1.2
├─ Letter Spacing: 0.8px
├─ Word Wrap: break-word
├─ Min Height: 40px
├─ Vertical Center: Flexbox
└─ Margin Bottom: 12px
```

### Section 3: Department Info (Centered)
```
of
├─ Font Size: 12px
├─ Text Align: Center
└─ Margin Bottom: 8px

[DEPARTMENT NAME]
├─ Font Size: 13px
├─ Line Height: 1.3
├─ Word Wrap: break-word
├─ Min Height: 30px
├─ Vertical Center: Flexbox
└─ Margin Bottom: 12px
```

### Section 4: College Info (Centered)
```
studying in
├─ Font Size: 12px
├─ Text Align: Center
└─ Margin Bottom: 8px

[COLLEGE/UNIVERSITY NAME]
├─ Font Size: 13px
├─ Line Height: 1.3
├─ Word Wrap: break-word
├─ Min Height: 30px
├─ Vertical Center: Flexbox
└─ Margin Bottom: 15px
```

### Section 5: Course Completion (Centered)
```
has successfully completed the Student Development
Programme on
├─ Font Size: 12px
├─ Line Height: 1.6
├─ Text Align: Center
└─ Margin Bottom: 8px

[COURSE TITLE]
├─ Font Size: 14px
├─ Font Weight: Bold
├─ Letter Spacing: 0.2px
├─ Word Wrap: break-word
├─ Min Height: 35px
├─ Vertical Center: Flexbox
└─ Margin Bottom: 12px
```

### Section 6: TNSDC Information (Centered)
```
conducted by Tamil Nadu Skill Development Corporation (TNSDC)
in association with The SM Groups at
ANNA UNIVERSITY
during the Academic Year [YEAR]
├─ Font Size: 11px
├─ Line Height: 1.5
├─ Text Align: Center
└─ "ANNA UNIVERSITY": 12px Bold
```

### Section 7: Training Duration & Issue Date (Grid)
```
Layout: 2-Column Grid
Gap: 50px

Left Column (Training Duration):
├─ Text Align: Left
├─ Label: "Training Duration:"
│  ├─ Font Size: 11px
│  ├─ Font Weight: 600
│  └─ Margin Bottom: 8px
└─ Underline: 1.5px solid #000
   └─ Min Height: 20px

Right Column (Issue Date):
├─ Text Align: Right
├─ Label: "Issue Date:"
│  ├─ Font Size: 11px
│  ├─ Font Weight: 600
│  └─ Margin Bottom: 8px
└─ Underline/Value: 1.5px solid #000
   └─ Min Height: 20px
   └─ Text Center: DD/MM/YYYY
```

### Section 8: Signature & Footer (Right-Aligned)
```
Managing Director, TNSDC
├─ Font Size: 11px
├─ Font Weight: 600
├─ Text Align: Right
├─ Margin Bottom: 35px
└─ Margin Right: 30px
   [30px space for signature]

*This is Eligible under Career Advancement Scheme
├─ Font Size: 10px
├─ Font Style: Italic
├─ Text Align: Right
├─ Color: #333333
└─ Margin Right: 10px
```

## CSS Styling Reference

### Container Styles
```css
display: flex;
flexDirection: column;
boxSizing: border-box;
fontFamily: 'serif' /* Georgia, Garamond, or system default */;
color: '#000000';
backgroundColor: transparent; /* Shows background image */
backgroundImage: url('/certificate-template.png');
backgroundSize: 'cover';
backgroundPosition: 'center';
backgroundRepeat: 'no-repeat';
width: '1050px';
minWidth: '1050px';
height: '750px';
padding: '120px 80px 100px 80px';
boxShadow: '0 4px 12px rgba(0,0,0,0.1)';
```

### Text Container Styles
```css
/* Centered text containers */
display: flex;
flexDirection: column;
alignItems: center;
justifyContent: center;
textAlign: center;
wordWrap: break-word;
marginBottom: <gap>;

/* For controlled height */
minHeight: <height>;
display: flex;
alignItems: center;
justifyContent: center;
```

### Border Styles
```css
/* Underlines for signature areas */
borderBottom: '1.5px solid #000000';
marginTop: '8px';
paddingBottom: '2px';
minHeight: '20px';
```

## Responsive Design Notes

### Desktop (1050x750px)
- Full layout as specified
- All elements visible
- No text wrapping needed for typical names
- Print quality: Excellent

### Tablet (70-90% of original)
- Reduce padding proportionally
- Maintain font size hierarchy
- Text may wrap for longer names
- Print quality: Good

### Mobile (50-60% of original)
- Significantly reduced padding
- Consider single-column layout
- Most text will wrap
- Preview only (not optimal for printing)

## Print Specifications

### Print Size: A4 Landscape
- Physical: 11" × 8.5" (297mm × 210mm)
- Margins: 0.5" all sides
- DPI: 300 for high quality
- Paper: Matte finish recommended
- Color Mode: RGB or CMYK

### Print CSS (Optional)
```css
@media print {
  .certificate {
    width: 11in;
    height: 8.5in;
    margin: 0;
    padding: 0.5in 0.75in;
  }
  
  body {
    margin: 0;
    padding: 0;
  }
}
```

## Quality Assurance Checklist

### Text Alignment
- [ ] All text centered in certificate
- [ ] No text running into borders
- [ ] Proper spacing between sections
- [ ] Student name prominent and readable
- [ ] Department/College clearly labeled

### Spacing & Padding
- [ ] Top padding: 120px
- [ ] Side padding: 80px
- [ ] Bottom padding: 100px
- [ ] Vertical gaps consistent
- [ ] No crowding or large empty spaces

### Typography
- [ ] Font sizes match specification
- [ ] Font weights correct (Bold where needed)
- [ ] Line heights appropriate
- [ ] Letter spacing applied correctly
- [ ] Text color consistent (black primary, gray secondary)

### Layout
- [ ] Certificate dimensions: 1050×750px
- [ ] Flexbox layout working correctly
- [ ] Grid layout for columns working
- [ ] All elements vertically centered as intended
- [ ] Text wrapping working for long names

### Visual Elements
- [ ] Background image displaying correctly
- [ ] Golden border frame visible
- [ ] No distortion or scaling issues
- [ ] Shadow effect visible for depth
- [ ] Colors accurate to official template

---

**Reference Document Version**: 1.0
**Last Updated**: August 13, 2025
**Created For**: Chemy LMS Certificate System v1.0
