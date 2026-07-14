// js/telemetry.js — Playable First-Session Telemetry MVP
// Design: Adapter-based architecture with local/debug sinks, privacy-safe fields, and robust error isolation.

// Base Adapter Interface
class TelemetryAdapter {
    send(event) {
        // Override in subclasses
    }
}

// Console Debug Adapter for Local/Debug logging
class ConsoleDebugTelemetryAdapter extends TelemetryAdapter {
    send(event) {
        console.log('[Telemetry Debug Sink]', event);
    }
}

// Local Storage Adapter for queueing events
class LocalStorageTelemetryAdapter extends TelemetryAdapter {
    constructor(storageKey = 'darius_star_telemetry_events') {
        super();
        this.storageKey = storageKey;
    }

    send(event) {
        try {
            if (typeof localStorage === 'undefined' || !localStorage) {
                return;
            }
            let existing = localStorage.getItem(this.storageKey);
            let queue = [];
            if (existing) {
                try {
                    queue = JSON.parse(existing);
                    if (!Array.isArray(queue)) {
                        queue = [];
                    }
                } catch (e) {
                    queue = [];
                }
            }
            queue.push(event);
            localStorage.setItem(this.storageKey, JSON.stringify(queue));
        } catch (err) {
            // Silently isolate storage failures (e.g. private browsing, full storage)
            console.warn('[Telemetry Storage Unavailable]', err);
        }
    }
}

// Multiplexing Adapter to send to multiple destinations
class MultiTelemetryAdapter extends TelemetryAdapter {
    constructor(adapters = []) {
        super();
        this.adapters = adapters;
    }

    send(event) {
        for (const adapter of this.adapters) {
            try {
                adapter.send(event);
            } catch (err) {
                console.warn('[Telemetry Adapter Send Error]', err);
            }
        }
    }
}

// Telemetry System Singleton (Top-level scope, visible globally)
const Telemetry = {
    _sessionId: null,
    _startTime: null,
    _adapter: null,

    // Expose classes for testability / extensions
    ConsoleDebugTelemetryAdapter,
    LocalStorageTelemetryAdapter,
    MultiTelemetryAdapter,

    init(adapter) {
        try {
            this._adapter = adapter || new MultiTelemetryAdapter([
                new ConsoleDebugTelemetryAdapter(),
                new LocalStorageTelemetryAdapter()
            ]);
        } catch (err) {
            console.warn('[Telemetry Init Error]', err);
        }
    },

    startSession(shipType, difficulty) {
        try {
            this._sessionId = this._generateUUID();
            this._startTime = Date.now();

            const safeSourcePath = this._getPrivacySafeSourcePath();

            this.logEvent('session_start', {
                shipType: shipType || 'unknown',
                difficulty: difficulty || 'normal',
                sourcePath: safeSourcePath
            });
        } catch (err) {
            console.warn('[Telemetry startSession Error]', err);
        }
    },

    logEvent(eventName, payload = {}) {
        try {
            if (!this._adapter) {
                this.init();
            }

            const timestamp = new Date().toISOString();
            const duration = this._startTime ? Math.round((Date.now() - this._startTime) / 1000) : 0;

            const event = {
                eventId: this._generateUUID(),
                eventName: eventName,
                timestamp: timestamp,
                payload: {
                    sessionId: this._sessionId || 'none',
                    durationSeconds: duration,
                    ...payload
                }
            };

            this._adapter.send(event);
        } catch (err) {
            console.warn('[Telemetry logEvent Error]', err);
        }
    },

    _generateUUID() {
        return 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    _getPrivacySafeSourcePath() {
        try {
            if (typeof window === 'undefined' || !window.location) {
                return '/';
            }
            const url = new URL(window.location.href);
            // Retain only specific game & standard marketing traffic parameters (No personal data/PII allowed)
            const safeParams = ['utm_source', 'utm_medium', 'utm_campaign', 'launch', 'mode', 'biome', 'level'];
            const searchParams = new URLSearchParams();
            
            for (const param of safeParams) {
                if (url.searchParams.has(param)) {
                    searchParams.set(param, url.searchParams.get(param));
                }
            }
            
            const paramsStr = searchParams.toString();
            return url.pathname + (paramsStr ? '?' + paramsStr : '');
        } catch (e) {
            return '/';
        }
    }
};

// Attach to global window scope
if (typeof window !== 'undefined') {
    window.Telemetry = Telemetry;
}

// For Node.js unit testing compatibility (only export if module/exports exist)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Telemetry;
} else if (typeof exports !== 'undefined') {
    exports.Telemetry = Telemetry;
}
