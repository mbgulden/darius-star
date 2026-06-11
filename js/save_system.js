// save_system.js — PLACEHOLDER (Jules building full implementation: GRO-1071)
// Provides CampaignSave global with stub methods to prevent crashes.
// Full implementation expected from Jules session (pending).

window.CampaignSave = {
    createBlank() {
        return { biomeLevel: 1, wave: 1, ship: 'interceptor', scrap: 0, score: 0, playTime: 0, deaths: 0, difficulty: 'normal', lastCheckpoint: null, upgrades: {} };
    },
    save(slotIndex, saveObj) {
        try {
            const saves = JSON.parse(localStorage.getItem('darius_star_saves') || '[null,null,null]');
            saves[slotIndex] = saveObj;
            localStorage.setItem('darius_star_saves', JSON.stringify(saves));
        } catch(e) { console.warn('CampaignSave.save failed:', e); }
    },
    load(slotIndex) {
        try {
            const saves = JSON.parse(localStorage.getItem('darius_star_saves') || '[null,null,null]');
            return saves[slotIndex] || null;
        } catch(e) { return null; }
    },
    loadAll() {
        try {
            return JSON.parse(localStorage.getItem('darius_star_saves') || '[null,null,null]');
        } catch(e) { return [null, null, null]; }
    },
    delete(slotIndex) {
        try {
            const saves = JSON.parse(localStorage.getItem('darius_star_saves') || '[null,null,null]');
            saves[slotIndex] = null;
            localStorage.setItem('darius_star_saves', JSON.stringify(saves));
        } catch(e) {}
    },
    summarize(slotIndex) {
        const save = this.load(slotIndex);
        if (!save) return null;
        return { biomeLevel: save.biomeLevel, wave: save.wave, ship: save.ship, scrap: save.scrap, score: save.score };
    },
    checkpoint(slotIndex, payload) {
        const save = this.load(slotIndex);
        if (save) { save.lastCheckpoint = payload; this.save(slotIndex, save); }
    },
    restoreCheckpoint(slotIndex) {
        const save = this.load(slotIndex);
        if (save && save.lastCheckpoint) { save.deaths = (save.deaths || 0) + 1; this.save(slotIndex, save); return save.lastCheckpoint; }
        return null;
    },
    autosave(slotIndex, payload) {
        this.save(slotIndex, payload);
    }
};
console.log('[PLACEHOLDER] save_system.js loaded — full implementation pending Jules GRO-1071');
