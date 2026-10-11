import os

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 450" width="100%" height="100%" style="background-color: #0d1117; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <defs>
    <!-- Gradients -->
    <linearGradient id="grid-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="cyan-magenta" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe" />
      <stop offset="100%" stop-color="#4facfe" />
    </linearGradient>
    <linearGradient id="tension-grad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#00ffff" stop-opacity="0.2"/>
      <stop offset="50%" stop-color="#d946ef" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ff007f" stop-opacity="0.8"/>
    </linearGradient>
    <!-- Filters -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Grid -->
  <rect width="1000" height="450" fill="url(#grid-glow)" />
  <g stroke="#1e293b" stroke-width="0.5">
    <path d="M 0,50 L 1000,50 M 0,100 L 1000,100 M 0,150 L 1000,150 M 0,200 L 1000,200 M 0,250 L 1000,250 M 0,300 L 1000,300 M 0,350 L 1000,350 M 0,400 L 1000,400" />
    <path d="M 100,0 L 100,450 M 200,0 L 200,450 M 300,0 L 300,450 M 400,0 L 400,450 M 500,0 L 500,450 M 600,0 L 600,450 M 700,0 L 700,450 M 800,0 L 800,450 M 900,0 L 900,450" />
  </g>

  <!-- Diagram Title -->
  <text x="30" y="35" fill="#ffffff" font-size="16" font-weight="bold" letter-spacing="1">DARIUS STAR — 10-LEVEL PACING STRUCTURE</text>
  <text x="30" y="55" fill="#94a3b8" font-size="11">Standard Dialogue Flow &amp; Tension Curve Per Biome</text>

  <!-- Tension Curve Area Fill -->
  <path d="M 100,380 L 100,340 C 200,320 300,300 400,270 L 500,220 C 550,230 650,290 700,260 L 800,240 C 900,180 950,150 1000,100 L 1000,450 L 100,450 Z" fill="url(#tension-grad)" opacity="0.15" />

  <!-- Tension Curve Line -->
  <path d="M 100,340 C 200,320 300,300 400,270 L 500,220 C 550,230 650,290 700,260 L 800,240 C 900,180 950,150 1000,100" fill="none" stroke="#ff007f" stroke-width="3" filter="url(#glow)" />
  <text x="940" y="80" fill="#ff007f" font-size="11" font-weight="bold">Tension Peak</text>

  <!-- Level Nodes & Blocks -->
  
  <!-- Level 1: Briefing -->
  <g transform="translate(60, 290)">
    <rect x="0" y="0" width="80" height="70" rx="6" fill="#0b1329" stroke="#00ffff" stroke-width="1.5" />
    <text x="40" y="22" fill="#00ffff" font-size="13" font-weight="bold" text-anchor="middle">L 1</text>
    <text x="40" y="42" fill="#ffffff" font-size="10" text-anchor="middle">BRIEFING</text>
    <text x="40" y="55" fill="#94a3b8" font-size="8" text-anchor="middle">&amp; INTRO</text>
  </g>

  <!-- Level 2-4: Banter & Silence -->
  <g transform="translate(160, 270)">
    <rect x="0" y="0" width="220" height="70" rx="6" fill="#1e1b4b" stroke="#818cf8" stroke-width="1" stroke-dasharray="3,3" />
    <text x="110" y="20" fill="#a5b4fc" font-size="12" font-weight="bold" text-anchor="middle">L 2 – 4 (Banter &amp; Silence)</text>
    <text x="110" y="38" fill="#ffffff" font-size="9" text-anchor="middle">Gameplay &amp; Env. Storytelling</text>
    <text x="110" y="52" fill="#cbd5e1" font-size="8" text-anchor="middle">Breather Notes: Audio &amp; Score Focus</text>
  </g>

  <!-- Level 5: Mid-boss -->
  <g transform="translate(460, 170)">
    <rect x="0" y="0" width="80" height="70" rx="6" fill="#18001d" stroke="#d946ef" stroke-width="1.5" />
    <text x="40" y="22" fill="#d946ef" font-size="13" font-weight="bold" text-anchor="middle">L 5</text>
    <text x="40" y="42" fill="#ffffff" font-size="10" text-anchor="middle">MID-BOSS</text>
    <text x="40" y="55" fill="#f472b6" font-size="8" text-anchor="middle">REVELATION</text>
  </g>

  <!-- Level 6-9: Banter & Silence -->
  <g transform="translate(620, 210)">
    <rect x="0" y="0" width="220" height="70" rx="6" fill="#1e1b4b" stroke="#818cf8" stroke-width="1" stroke-dasharray="3,3" />
    <text x="110" y="20" fill="#a5b4fc" font-size="12" font-weight="bold" text-anchor="middle">L 6 – 9 (Banter &amp; Silence)</text>
    <text x="110" y="38" fill="#ffffff" font-size="9" text-anchor="middle">Action Pacing &amp; Character Bonds</text>
    <text x="110" y="52" fill="#cbd5e1" font-size="8" text-anchor="middle">High-stakes bans, no dialogue in waves</text>
  </g>

  <!-- Level 10: Biome Boss -->
  <g transform="translate(860, 80)">
    <rect x="0" y="0" width="100" height="70" rx="6" fill="#310411" stroke="#f43f5e" stroke-width="2" />
    <text x="50" y="22" fill="#f43f5e" font-size="13" font-weight="bold" text-anchor="middle">L 10</text>
    <text x="50" y="42" fill="#ffffff" font-size="10" text-anchor="middle">BIOME BOSS</text>
    <text x="50" y="55" fill="#fda4af" font-size="8" text-anchor="middle">MAJOR ADVANCE</text>
  </g>

  <!-- Connectors -->
  <path d="M 140,325 L 160,305" stroke="#00ffff" stroke-width="1.5" fill="none" />
  <path d="M 380,305 L 460,205" stroke="#818cf8" stroke-width="1.5" fill="none" />
  <path d="M 540,205 L 620,245" stroke="#d946ef" stroke-width="1.5" fill="none" />
  <path d="M 840,245 L 860,115" stroke="#818cf8" stroke-width="1.5" fill="none" />

  <!-- Legend -->
  <g transform="translate(30, 410)" font-size="10" fill="#94a3b8">
    <circle cx="10" cy="5" r="5" fill="#00ffff" />
    <text x="22" y="8">Level 1 Tentpole: Comms Briefing</text>

    <circle cx="230" cy="5" r="5" fill="#d946ef" />
    <text x="242" y="8">Level 5 Tentpole: Mid-boss &amp; Reveal</text>

    <circle cx="480" cy="5" r="5" fill="#f43f5e" />
    <text x="492" y="8">Level 10 Tentpole: Biome Boss</text>

    <circle cx="680" cy="5" r="5" fill="#818cf8" />
    <text x="692" y="8">Banter &amp; Silence Zones</text>
  </g>
</svg>"""

with open("/home/ubuntu/work/darius-star/docs/assets/pacing_map_flow.svg", "w") as f:
    f.write(svg_content)

print("SVG pacing flow diagram created successfully!")
