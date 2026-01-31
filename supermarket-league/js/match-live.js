const MatchLive = {
    currentMatch: null,
    displayInterval: null,

    generateMatchScript: function(match, league) {
        const homeTeam = league.teams.find(t => t.name === match.home);
        const awayTeam = league.teams.find(t => t.name === match.away);
        const script = { events: [], homeGoals: 0, awayGoals: 0 };
        const seed = this.hashCode(match.id);
        let rng = this.seededRandom(seed);
        const numEvents = 15 + Math.floor(rng() * 11);
        const usedMinutes = [];

        for (let i = 0; i < numEvents; i++) {
            let minute;
            do { minute = 1 + Math.floor(rng() * 93); } while (usedMinutes.includes(minute));
            usedMinutes.push(minute);

            const isHome = rng() < 0.5;
            const team = isHome ? homeTeam : awayTeam;
            const eventType = this.getRandomEventType(rng);
            const event = { minute, type: eventType, isHome, team: team.name, player: this.getRandomPlayer(team, null, rng), data: {} };

            if (eventType === 'goal') {
                if (isHome) script.homeGoals++; else script.awayGoals++;
                event.data.homeScore = script.homeGoals;
                event.data.awayScore = script.awayGoals;
                if (rng() < 0.6) event.data.assistant = this.getRandomPlayer(team, event.player, rng);
            }
            script.events.push(event);
        }

        script.events.sort((a, b) => a.minute - b.minute);
        return script;
    },

    hashCode: function(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash = hash & hash; }
        return Math.abs(hash);
    },

    seededRandom: function(seed) {
        return function() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    },

    getRandomEventType: function(rng) {
        const r = rng();
        if (r < 0.15) return 'goal';
        if (r < 0.28) return 'yellow';
        if (r < 0.30) return 'red';
        if (r < 0.45) return 'save';
        if (r < 0.55) return 'offside';
        if (r < 0.70) return 'corner';
        if (r < 0.85) return 'freekick';
        return 'danger';
    },

    getRandomPlayer: function(team, exclude, rng) {
        if (!team || !team.players || team.players.length === 0) {
            return { name: 'JUGADOR', number: Math.floor(rng() * 11) + 1, position: 'CEN' };
        }
        let available = team.players;
        if (exclude) available = team.players.filter(p => p.number !== exclude.number);
        if (available.length === 0) available = team.players;
        return available[Math.floor(rng() * available.length)];
    },

    getFinalScore: function(script) {
        if (!script) return { home: 0, away: 0 };
        return { home: script.homeGoals, away: script.awayGoals };
    },

    getCurrentState: function(match) {
        if (!match.matchScript) return { minute: 0, homeGoals: 0, awayGoals: 0, events: [] };
        const elapsedSeconds = Math.floor((new Date() - new Date(match.startTime)) / 1000);
        const currentMinute = Math.min(94, Math.floor((elapsedSeconds / 60) * 94));
        const passedEvents = match.matchScript.events.filter(e => e.minute <= currentMinute);
        let homeGoals = 0, awayGoals = 0;
        passedEvents.forEach(e => { if (e.type === 'goal') { if (e.isHome) homeGoals++; else awayGoals++; } });
        return { minute: currentMinute, homeGoals, awayGoals, events: passedEvents, isFinished: currentMinute >= 94 };
    },

    formatEvent: function(event) {
        const icons = { goal: '⚽', yellow: '🟨', red: '🟥', save: '🧤', offside: '🚩', corner: '🚩', freekick: '🎯', danger: '🔥' };
        const icon = icons[event.type] || '📋';
        const p = event.player;
        switch(event.type) {
            case 'goal':
                let text = icon + ' ¡GOOOOL de ' + event.team + '! Lo marca ' + p.name + ' (#' + p.number + ')';
                if (event.data.assistant) text += '. Asistencia de ' + event.data.assistant.name;
                return text + ' ' + event.data.homeScore + '-' + event.data.awayScore;
            case 'yellow': return icon + ' Tarjeta amarilla para ' + p.name + ' (#' + p.number + ')';
            case 'red': return icon + ' ¡EXPULSIÓN! ' + p.name + ' ve la roja';
            case 'save': return icon + ' ¡Gran parada del portero!';
            case 'offside': return icon + ' Fuera de juego de ' + p.name;
            case 'corner': return icon + ' Saque de esquina para ' + event.team;
            case 'freekick': return icon + ' Falta a favor de ' + event.team;
            case 'danger': return icon + ' ¡Peligro! ' + p.name + ' dispara pero falla';
            default: return '📋 Acción de ' + event.team;
        }
    },

    getEventColor: function(type) {
        const colors = { goal: '#10b981', yellow: '#eab308', red: '#ef4444', save: '#3b82f6', offside: '#64748b', corner: '#06b6d4', freekick: '#14b8a6', danger: '#f59e0b' };
        return colors[type] || '#64748b';
    }
};
