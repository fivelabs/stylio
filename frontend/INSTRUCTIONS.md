Role: Act as a World-Class Senior Creative Technologist and Lead Frontend Engineer. Objective: Architect a high-fidelity, cinematic "1:1 Pixel Perfect" landing page for Stylio. Aesthetic Identity: "High-End salon managment SaaS" / "Beauty salon managment"
1. CORE DESIGN SYSTEM (STRICT)
  - Primary (Brand/Action): #8D7B68 // Warm Taupe (Unisex, earthy, premium)
  - Accent (Dark/Contrast): #1A1A1A // Carbon Black (Authority and sharp edges)
  - Background (Main Canvas): #FDFDFD // Alabaster (Clean, hygienic, spacious)
  - Surface (Cards/Modals): #F4F4F2 // Soft Sand (Subtle hierarchy)
  - Text (Primary): #2D2D2D // Deep Graphite (High readability, softer than pure black)
  - Success (Status): #A3B18A // Sage Green (Calm, professional confirmation)
  - Border/Divider: #E5E5E3 // Light Grey (Minimalist separation)
Typography: Headings: "Plus Jakarta Sans" & "Outfit" (Tracking tight). Drama/Emphasis: "Mozilla Headline"
Visual Texture: Implement a global CSS Noise overlay (SVG turbulence at 0.05 opacity) to eliminate flat digital gradients. Use a rounded-[2rem] to rounded-[3rem] radius system for all containers.
2. COMPONENT ARCHITECTURE & BEHAVIOR
A. NAVBAR (The Floating Island)
A fixed, pill-shaped pill container.
Morphing Logic: Transparent with white text at the hero top. Transitions into a white/60 glassmorphic blur with moss text and a subtle border upon scrolling.
B. HERO SECTION (Stylio (title), La plataforma de gestión todo en uno, diseñada para emprendedores del área de la estética. Organiza tu agenda, automatiza tus citas, fideliza a tus clientes y proyecta la imagen profesional que mereces. (description))
Visuals: 100dvh height. A solid background with an space for a video preview for marketing purposes.
Layout: Content pushed to the bottom-left third.
Typography: Large scale contrast.
Animation: GSAP staggered fade-up for all text parts.
C. FEATURES (The Precision Micro-UI Dashboard)
Replace standard cards with Interactive Functional Artifacts.
D. PRICING & FOOTER
One base tier, but we will offer some additional modules so pricing section should separate "base" platform pricing and can a selection of additional modules who will change the price. all should be configured into a JSON for the moment.
Footer: rounded-t-[4rem]. Include high-end utility links and a "System Operational" status indicator with a pulsing green dot.
3. TECHNICAL REQUIREMENTS
Tech Stack: React 19, Tailwind CSS, GSAP 3 (with ScrollTrigger), Lucide React.
Animation Lifecycle: Use gsap.context() within useEffect for all animations to ensure clean mounting/unmounting.
Micro-Interactions: Buttons must have a "magnetic" feel (subtle scale-up on hover) and utilize overflow-hidden with a sliding background layer for color transitions.
Code Quality: No placeholders. Use real image URLs from Unsplash. Ensure the dashboard cards in the Features section feel like functional software, not just static layouts.
Execution Directive: "Do not build a website; build a digital instrument. Every scroll should feel intentional, every animation should feel weighted and professional. Eradicate all generic AI patterns"