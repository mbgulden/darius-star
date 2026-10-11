# AGY Audit Report: Mobile Touch Controls
**Verdict**: NEEDS_FIXES  
**Target File**: [js/touch_controls.js](file:///home/ubuntu/work/darius-star/js/touch_controls.js)  
**Reference Issue**: GRO-1472  

---

## 1. Executive Summary
This report analyzes the CSS Grid redesign of the mobile touch controls implemented in `js/touch_controls.js`. While the layout successfully attempts to replace the old absolute positioning setup with a vertical grid layout, several critical layout and styling bugs break the layout's functionality:
1. The use of `position: fixed` causes significant off-canvas rendering and browser overlap bugs on mobile devices when not in fullscreen mode.
2. The hardcoded `position: absolute` on action buttons breaks the CSS Grid layout itself, forcing all buttons to stack on top of each other at the container's top-left.
3. The hardcoded toggle button position overlaps with the action buttons when the panel is expanded.

---

## 2. Detailed Findings

### A. Viewport Centering & Off-Canvas Rendering
* **File Reference**: [index.css](file:///home/ubuntu/work/darius-star/css/game.css#L42-L61) and [js/touch_controls.js:L178-180](file:///home/ubuntu/work/darius-star/js/touch_controls.js#L178-L180)
* **Finding**: `#game-container` is styled as a responsive container centered inside the viewport, constrained by `max-height: calc(100vh - 120px)`.
* **The Bug**: `buttonContainer` (defined in `js/touch_controls.js` line 179) and `toggleBtn` (defined in `js/touch_controls.js` line 230) use `position: fixed; bottom: 16px; right: 16px;`.
* **Impact**: When the viewport height is larger than the game container (leaving blank space above and below the canvas), the action buttons float at the bottom-right corner of the browser window instead of inside the game container. This causes them to render "off-canvas" in the empty space below the actual game screen.

### B. CSS Grid Flow Broken by Absolute Positioned Children
* **File Reference**: [js/touch_controls.js:L90](file:///home/ubuntu/work/darius-star/js/touch_controls.js#L90)
* **Finding**: Inside `createActionButton()`, `defaultStyles` specifies `position: 'absolute'`. Custom styles passed for the buttons (SPEC, DODGE, FIRE) do not override the `position` attribute.
* **The Bug**: Grid items that are absolutely positioned do not participate in grid layout. They are removed from normal flow and aligned to the container's padding edge. Since they do not have placement properties (`grid-row`/`grid-column`) or offset properties (`top`/`left`), they all stack on top of each other at the top-left of the grid container.
* **Impact**: The CSS Grid definition `grid-template-rows: 48px 48px 56px; gap: 8px;` is completely bypassed. All three buttons (SPEC, DODGE, and FIRE) stack on top of each other, making SPEC and DODGE unreachable because the larger FIRE button (72x56) overlays them.

### C. Toggle Button Position Overlap
* **File Reference**: [js/touch_controls.js:L226-235](file:///home/ubuntu/work/darius-star/js/touch_controls.js#L226-L235) and [L248](file:///home/ubuntu/work/darius-star/js/touch_controls.js#L248)
* **Finding**: The toggle button is styled with `position: fixed; bottom: 168px; right: 16px; height: 20px;`.
* **The Bug**: The grid container's bottom is at `16px` and has a total height of `48px + 48px + 56px + 8px + 8px = 168px` (when expanded). The top of the container is therefore at `16px + 168px = 184px`. The toggle button sits between `bottom: 168px` and `bottom: 188px`.
* **Impact**: The toggle button overlaps the SPEC button (which sits at the top of the vertical panel), blocking clicks to it.

---

## 3. Recommended Fixes

To resolve these layout bugs, the touch buttons must be positioned relative to the game container, and absolute positioning must be removed from the action buttons to restore grid flow.

### Recommended Code Changes:

1. **Remove absolute positioning from buttons to restore grid layout flow**:
   * **Location**: [js/touch_controls.js:L90](file:///home/ubuntu/work/darius-star/js/touch_controls.js#L90)
   * **Change**: Change `position: 'absolute'` to `position: 'relative'` (or remove it entirely to use default `static` positioning).
   ```diff
   -            position: 'absolute',
   +            position: 'relative',
   ```

2. **Update Button Container style**:
   * **Location**: [js/touch_controls.js:L179](file:///home/ubuntu/work/darius-star/js/touch_controls.js#L179)
   * **Change**: Replace `position:fixed` with `position:absolute`.
   ```diff
   -            'gap:8px; position:fixed; bottom:16px; right:16px; ' +
   +            'gap:8px; position:absolute; bottom:16px; right:16px; ' +
   ```

3. **Update Toggle Button style and position**:
   * **Location**: [js/touch_controls.js:L230](file:///home/ubuntu/work/darius-star/js/touch_controls.js#L230) and [L248](file:///home/ubuntu/work/darius-star/js/touch_controls.js#L248)
   * **Change**: Replace `position:fixed` with `position:absolute`. Adjust `bottom` to `188px` (height of container 168px + offset 16px + 4px gap) when expanded to prevent overlapping SPEC.
   ```diff
   -            'position:fixed; bottom:168px; right:16px; ' +
   +            'position:absolute; bottom:188px; right:16px; ' +
   ```
   * And in event listener:
   ```diff
   -            toggleBtn.style.bottom = buttonsVisible ? '168px' : '16px';
   +            toggleBtn.style.bottom = buttonsVisible ? '188px' : '16px';
   ```
