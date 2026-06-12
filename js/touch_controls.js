// touch_controls.js — Mobile touch controls for Darius Star
// Virtual omnidirectional joystick (left side) + action buttons (right side)
// Multi-touch: move AND fire simultaneously
// Loaded after ui.js so `keys` global is accessible
// GRO-1162: Ned — Add mobile touch controls

(function() {
    'use strict';

    // Detect touch capability
    var hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!hasTouch) return;

    // --- Virtual Joystick State ---
    var JOYSTICK_DEADZONE = 14;    // px — ignore tiny movements
    var JOYSTICK_MAX_RADIUS = 55;  // px — max drag distance for full tilt
    var JOYSTICK_DIAG_THRESHOLD = 0.38; // normalized — when to trigger both axes
    var joystickTouchId = null;
    var joystickBaseX = 0;
    var joystickBaseY = 0;
    var joystickActive = false;

    // Direction key state (kept separate so we can clear atomically)
    var joyUp = false, joyDown = false, joyLeft = false, joyRight = false;

    function isInLeftZone(touchX, touchY) {
        var rect = canvas.getBoundingClientRect();
        var relX = (touchX - rect.left) / rect.width;
        return relX < 0.40;
    }

    function isInCanvas(touchX, touchY) {
        var rect = canvas.getBoundingClientRect();
        return touchX >= rect.left && touchX <= rect.right &&
               touchY >= rect.top && touchY <= rect.bottom;
    }

    function applyJoystickKeys() {
        keys['w'] = joyUp;
        keys['s'] = joyDown;
        keys['a'] = joyLeft;
        keys['d'] = joyRight;
    }

    function releaseJoystickKeys() {
        joyUp = joyDown = joyLeft = joyRight = false;
        keys['w'] = false;
        keys['s'] = false;
        keys['a'] = false;
        keys['d'] = false;
    }

    function processJoystickMove(touchX, touchY) {
        var dx = touchX - joystickBaseX;
        var dy = touchY - joystickBaseY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < JOYSTICK_DEADZONE) {
            joyUp = joyDown = joyLeft = joyRight = false;
            applyJoystickKeys();
            return;
        }

        // Clamp and normalize for proportional control
        var clampedDist = Math.min(dist, JOYSTICK_MAX_RADIUS);
        var scale = clampedDist / dist;
        var ndx = dx * scale / JOYSTICK_MAX_RADIUS; // -1..1
        var ndy = dy * scale / JOYSTICK_MAX_RADIUS; // -1..1

        // Map to cardinal directions with diagonal threshold
        var threshold = JOYSTICK_DIAG_THRESHOLD;
        joyUp    = ndy < -threshold;
        joyDown  = ndy >  threshold;
        joyLeft  = ndx < -threshold;
        joyRight = ndx >  threshold;

        applyJoystickKeys();
    }

    // --- Action Buttons ---
    var buttonContainer = null;
    var buttonStates = {}; // key -> { activeTouches: Set }

    function createActionButton(label, key, styles) {
        var el = document.createElement('div');
        el.className = 'touch-action-btn';
        el.textContent = label;

        var defaultStyles = {
            position: 'absolute',
            pointerEvents: 'auto',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'manipulation',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Courier New', monospace",
            letterSpacing: '1px',
            fontWeight: 'bold',
            transition: 'all 0.08s',
            zIndex: '101'
        };

        Object.keys(defaultStyles).forEach(function(k) {
            el.style[k] = defaultStyles[k];
        });
        Object.keys(styles).forEach(function(k) {
            if (k === 'activeBg' || k === 'activeBorder' || k === 'activeShadow') return;
            el.style[k] = styles[k];
        });

        buttonStates[key] = { activeTouches: new Set() };

        function press() {
            keys[key] = true;
            el.style.background = styles.activeBg || 'rgba(0, 255, 255, 0.5)';
            el.style.borderColor = styles.activeBorder || '#00ffff';
            el.style.color = '#ffffff';
            el.style.boxShadow = styles.activeShadow || '0 0 15px rgba(0, 255, 255, 0.4)';
        }

        function release() {
            if (buttonStates[key].activeTouches.size === 0) {
                keys[key] = false;
                el.style.background = styles.background;
                el.style.borderColor = styles.borderColor;
                el.style.color = styles.color;
                el.style.boxShadow = 'none';
            }
        }

        el.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            buttonStates[key].activeTouches.add(e.pointerId);
            el.setPointerCapture(e.pointerId);
            press();
        });

        el.addEventListener('pointerup', function(e) {
            e.preventDefault();
            e.stopPropagation();
            buttonStates[key].activeTouches.delete(e.pointerId);
            release();
        });

        el.addEventListener('pointerleave', function(e) {
            buttonStates[key].activeTouches.delete(e.pointerId);
            release();
        });

        el.addEventListener('pointercancel', function(e) {
            buttonStates[key].activeTouches.delete(e.pointerId);
            release();
        });

        // Prevent scrolling on buttons
        el.addEventListener('touchstart', function(e) { e.preventDefault(); e.stopPropagation(); });
        el.addEventListener('touchmove', function(e) { e.preventDefault(); e.stopPropagation(); });

        return el;
    }

    function createButtonContainer() {
        var container = document.getElementById('game-container');
        if (!container) return;

        // Remove old button container if it exists
        var old = document.getElementById('touch-action-buttons');
        if (old) old.remove();

        buttonContainer = document.createElement('div');
        buttonContainer.id = 'touch-action-buttons';
        // GRO-1472: CSS Grid vertical panel — fixed bottom-right, 8px gaps
        // FIRE (72x56), DODGE (48x48), SPEC (48x48) stacked vertically
        buttonContainer.style.cssText =
            'display:grid; grid-template-columns:72px; grid-template-rows:48px 48px 56px; ' +
            'gap:8px; position:fixed; bottom:16px; right:16px; ' +
            'z-index:100; pointer-events:none;';
        container.appendChild(buttonContainer);

        // SPEC weapon button — top (48x48), purple
        buttonContainer.appendChild(createActionButton('SPEC', 'k', {
            width: '48px', height: '48px',
            borderRadius: '10px',
            background: 'rgba(176, 38, 255, 0.15)',
            border: '2px solid rgba(176, 38, 255, 0.40)',
            borderColor: 'rgba(176, 38, 255, 0.40)',
            color: 'rgba(176, 38, 255, 0.70)',
            fontSize: '11px',
            activeBg: 'rgba(176, 38, 255, 0.45)',
            activeBorder: '#b026ff',
            activeShadow: '0 0 14px rgba(176, 38, 255, 0.5)'
        }));

        // DODGE button — middle (48x48), green
        buttonContainer.appendChild(createActionButton('DODGE', 'e', {
            width: '48px', height: '48px',
            borderRadius: '10px',
            background: 'rgba(0, 255, 170, 0.15)',
            border: '2px solid rgba(0, 255, 170, 0.40)',
            borderColor: 'rgba(0, 255, 170, 0.40)',
            color: 'rgba(0, 255, 170, 0.70)',
            fontSize: '11px',
            activeBg: 'rgba(0, 255, 170, 0.45)',
            activeBorder: '#00ffaa',
            activeShadow: '0 0 14px rgba(0, 255, 170, 0.5)'
        }));

        // FIRE button — bottom (72x56), red, largest
        buttonContainer.appendChild(createActionButton('FIRE', ' ', {
            width: '72px', height: '56px',
            borderRadius: '12px',
            background: 'rgba(255, 0, 85, 0.15)',
            border: '2px solid rgba(255, 0, 85, 0.40)',
            borderColor: 'rgba(255, 0, 85, 0.40)',
            color: 'rgba(255, 0, 85, 0.70)',
            fontSize: '14px',
            activeBg: 'rgba(255, 0, 85, 0.45)',
            activeBorder: '#ff0055',
            activeShadow: '0 0 20px rgba(255, 0, 85, 0.6)'
        }));

        // Toggle button — small handle above the grid to collapse/expand action buttons
        var toggleBtn = document.createElement('div');
        toggleBtn.id = 'touch-toggle';
        toggleBtn.textContent = '▼';
        toggleBtn.style.cssText =
            'position:fixed; bottom:168px; right:16px; ' +
            'width:72px; height:20px; z-index:102; pointer-events:auto; ' +
            'background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.20); ' +
            'border-radius:4px 4px 0 0; color:rgba(255,255,255,0.45); font-size:10px; ' +
            'display:flex; align-items:center; justify-content:center; ' +
            'cursor:pointer; user-select:none; touch-action:manipulation;';
        var buttonsVisible = true;
        toggleBtn.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            buttonsVisible = !buttonsVisible;
            toggleBtn.textContent = buttonsVisible ? '▼' : '▲';
            // Toggle visibility of all action buttons (not the toggle itself)
            var btns = buttonContainer.querySelectorAll('.touch-action-btn');
            for (var i = 0; i < btns.length; i++) {
                btns[i].style.display = buttonsVisible ? 'flex' : 'none';
            }
            // Adjust toggle position when collapsed
            toggleBtn.style.bottom = buttonsVisible ? '168px' : '16px';
            toggleBtn.style.borderRadius = buttonsVisible ? '4px 4px 0 0' : '4px';
        });
        toggleBtn.addEventListener('touchstart', function(e) { e.preventDefault(); e.stopPropagation(); });
        container.appendChild(toggleBtn);

        console.log('[Darius Star] Touch action buttons created (CSS Grid layout)');
    }

    // --- Canvas Touch Handlers for Virtual Joystick ---
    // Use the global canvas variable (defined in game_loop.js)
    function attachJoystickHandlers() {
        if (typeof canvas === 'undefined') {
            // Retry — canvas may not be defined yet if this script loads before game_loop.js
            setTimeout(attachJoystickHandlers, 100);
            return;
        }

        canvas.addEventListener('touchstart', function(e) {
            // Only active during gameplay
            if (typeof currentScreen === 'undefined' || currentScreen !== SCREENS.PLAYING) return;

            for (var i = 0; i < e.changedTouches.length; i++) {
                var touch = e.changedTouches[i];
                var tx = touch.clientX;
                var ty = touch.clientY;

                // Check if touch is in the left 40% of canvas
                if (isInLeftZone(tx, ty) && isInCanvas(tx, ty) && joystickTouchId === null) {
                    joystickTouchId = touch.identifier;
                    joystickBaseX = tx;
                    joystickBaseY = ty;
                    joystickActive = true;
                    break;
                }
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', function(e) {
            if (!joystickActive) return;

            for (var i = 0; i < e.changedTouches.length; i++) {
                var touch = e.changedTouches[i];
                if (touch.identifier === joystickTouchId) {
                    processJoystickMove(touch.clientX, touch.clientY);
                    break;
                }
            }
        }, { passive: true });

        canvas.addEventListener('touchend', function(e) {
            for (var i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === joystickTouchId) {
                    joystickTouchId = null;
                    joystickActive = false;
                    releaseJoystickKeys();
                    break;
                }
            }
        });

        canvas.addEventListener('touchcancel', function(e) {
            // Release joystick if the tracked touch was cancelled
            var found = false;
            for (var i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === joystickTouchId) {
                    found = true;
                    break;
                }
            }
            if (found) {
                joystickTouchId = null;
                joystickActive = false;
                releaseJoystickKeys();
            }
        });

        console.log('[Darius Star] Virtual joystick handlers attached');
    }

    // --- Initialization ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createButtonContainer();
            attachJoystickHandlers();
        });
    } else {
        createButtonContainer();
        attachJoystickHandlers();
    }

    console.log('[Darius Star] touch_controls.js loaded — virtual joystick + action buttons (FIRE/SPEC/DODGE)');
})();
