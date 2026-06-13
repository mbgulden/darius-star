// js/ui/hud.js — Controls overlay, score/shield/weapon display, banter text
// Extracted from js/ui.js lines 1521–1544 (GRO-1062)
//
// The HUD is primarily DOM-based (#controls-overlay in index.html).
// This module contains the toggle function and its event listener.

export function toggleStatusPanel() {
    window.STATUS_EXPANDED = !window.STATUS_EXPANDED;
    const overlay = document.getElementById('controls-overlay');
    const btn = document.getElementById('controls-toggle');
    if (!overlay) return;
    if (window.STATUS_EXPANDED) {
        overlay.classList.add('expanded');
        if (btn) btn.textContent = '✕';
    } else {
        overlay.classList.remove('expanded');
        if (btn) btn.textContent = '⚙';
    }
}

// Click handler for the toggle button
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('controls-toggle');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleStatusPanel();
        });
    }
});

// ES Module bridge — publish exports to global scope for cross-module access
window.toggleStatusPanel = toggleStatusPanel;
