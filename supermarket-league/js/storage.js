const Storage = {
    KEYS: { LEAGUES: 'leagueSchedulerData', BETTING: 'bettingData' },
    save: function(key, data) {
        try { localStorage.setItem(key, JSON.stringify(data)); return true; }
        catch (e) { console.error('Storage save error:', e); return false; }
    },
    load: function(key) {
        try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : null; }
        catch (e) { console.error('Storage load error:', e); return null; }
    },
    clear: function() { try { localStorage.clear(); return true; } catch (e) { return false; } }
};
