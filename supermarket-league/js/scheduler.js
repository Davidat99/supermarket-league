const Scheduler = {
    leagues: [],
    currentLeague: null,

    createLeague: function(name, teams) {
        const league = {
            id: 'league_' + Date.now(),
            name: name,
            teams: teams.map(t => ({
                name: t.name, color: t.color, level: t.level, players: t.players || [],
                points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0
            })),
            matches: []
        };
        this.leagues.push(league);
        this.save();
        return league;
    },

    generateFullSchedule: function(leagueId, startDate, hoursGap) {
        const league = this.getLeague(leagueId);
        if (!league) return;
        hoursGap = hoursGap || 1;
        const teams = league.teams;
        const n = teams.length;
        const matches = [];
        const currentDate = new Date(startDate);
        currentDate.setHours(18, 0, 0, 0);

        const allPairings = [];
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                allPairings.push({ home: teams[i], away: teams[j] });
            }
        }
        for (let k = 0; k < n; k++) {
            for (let m = k + 1; m < n; m++) {
                allPairings.push({ home: teams[m], away: teams[k] });
            }
        }

        while (allPairings.length > 0) {
            const teamsPlayingToday = [];
            let currentHour = 18;

            for (let p = 0; p < allPairings.length; p++) {
                const pairing = allPairings[p];
                if (!teamsPlayingToday.includes(pairing.home.name) && !teamsPlayingToday.includes(pairing.away.name)) {
                    const matchDate = new Date(currentDate);
                    matchDate.setHours(currentHour, 0, 0, 0);
                    matches.push({
                        id: 'match_' + Date.now() + '_' + p + '_' + Math.random(),
                        leagueId: leagueId,
                        home: pairing.home.name, away: pairing.away.name,
                        homeColor: pairing.home.color, awayColor: pairing.away.color,
                        startTime: matchDate.toISOString(),
                        status: 'scheduled', homeGoals: null, awayGoals: null, matchScript: null
                    });
                    teamsPlayingToday.push(pairing.home.name, pairing.away.name);
                    currentHour += hoursGap;
                    allPairings.splice(p, 1);
                    p--;
                    if (teamsPlayingToday.length >= n) break;
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        league.matches = matches;
        this.save();
        return matches;
    },

    getLeague: function(leagueId) { return this.leagues.find(l => l.id === leagueId) || null; },

    getMatchById: function(matchId) {
        for (const league of this.leagues) {
            const match = league.matches.find(m => m.id === matchId);
            if (match) return match;
        }
        return null;
    },

    getMatchMinute: function(match) {
        if (match.status === 'finished') return 94;
        const elapsed = Math.floor((new Date() - new Date(match.startTime)) / 1000);
        if (elapsed < 0) return 0;
        return Math.min(Math.floor((elapsed / 60) * 94), 94);
    },

    getLiveMatches: function(leagueId) {
        const league = this.getLeague(leagueId);
        if (!league) return [];
        const now = new Date();
        const liveMatches = [];

        for (const match of league.matches) {
            const elapsed = Math.floor((now - new Date(match.startTime)) / 1000);
            if (match.status === 'scheduled' && elapsed >= 0 && elapsed <= 60) {
                match.status = 'live';
                if (!match.matchScript) match.matchScript = MatchLive.generateMatchScript(match, league);
                liveMatches.push(match);
            } else if (match.status === 'live') {
                if (elapsed > 60) {
                    const finalScore = MatchLive.getFinalScore(match.matchScript);
                    this.finishMatch(match.id, finalScore.home, finalScore.away);
                } else {
                    liveMatches.push(match);
                }
            }
        }
        return liveMatches;
    },

    finishMatch: function(matchId, homeGoals, awayGoals) {
        const match = this.getMatchById(matchId);
        if (!match) return;
        match.status = 'finished';
        match.homeGoals = homeGoals;
        match.awayGoals = awayGoals;

        const league = this.getLeague(match.leagueId);
        if (!league) return;

        const homeTeam = league.teams.find(t => t.name === match.home);
        const awayTeam = league.teams.find(t => t.name === match.away);

        if (homeTeam && awayTeam) {
            homeTeam.played++; awayTeam.played++;
            homeTeam.goalsFor += homeGoals; homeTeam.goalsAgainst += awayGoals;
            awayTeam.goalsFor += awayGoals; awayTeam.goalsAgainst += homeGoals;

            if (homeGoals > awayGoals) { homeTeam.wins++; homeTeam.points += 3; awayTeam.losses++; }
            else if (awayGoals > homeGoals) { awayTeam.wins++; awayTeam.points += 3; homeTeam.losses++; }
            else { homeTeam.draws++; awayTeam.draws++; homeTeam.points++; awayTeam.points++; }
        }
        this.save();
    },

    save: function() {
        Storage.save(Storage.KEYS.LEAGUES, { leagues: this.leagues, currentLeague: this.currentLeague });
    },

    load: function() {
        const data = Storage.load(Storage.KEYS.LEAGUES);
        if (data) { this.leagues = data.leagues || []; this.currentLeague = data.currentLeague || null; }
    }
};
