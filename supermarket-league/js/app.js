function createDemoLeague() {
    const supermarkets = TEAMS_CONFIG.map((t, i) => {
        const formation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
        const players = [];
        let playerIndex = 0;

        players.push({ number: 1, name: PLAYER_NAMES[(i * 11 + playerIndex++) % PLAYER_NAMES.length], position: 'POR' });
        for (let j = 0; j < formation.def; j++) players.push({ number: playerIndex + 1, name: PLAYER_NAMES[(i * 11 + playerIndex++) % PLAYER_NAMES.length], position: 'DEF' });
        for (let j = 0; j < formation.cen; j++) players.push({ number: playerIndex + 1, name: PLAYER_NAMES[(i * 11 + playerIndex++) % PLAYER_NAMES.length], position: 'CEN' });
        for (let j = 0; j < formation.del; j++) players.push({ number: playerIndex + 1, name: PLAYER_NAMES[(i * 11 + playerIndex++) % PLAYER_NAMES.length], position: 'DEL' });

        return { ...t, players };
    });

    const league = Scheduler.createLeague("Liga Supermercados 2026", supermarkets);
    const now = new Date();
    now.setHours(18, 0, 0, 0);
    Scheduler.generateFullSchedule(league.id, now, 1);
    Scheduler.currentLeague = league.id;
    Scheduler.save();
}

function populateLeagueSelector() {
    const selector = document.getElementById('leagueSelector');
    let html = '<option value="">-- Seleccionar Liga --</option>';
    Scheduler.leagues.forEach(league => {
        html += '<option value="' + league.id + '">' + league.name + '</option>';
    });
    selector.innerHTML = html;
    if (Scheduler.currentLeague) selector.value = Scheduler.currentLeague;
}

function handleLeagueChange() {
    Scheduler.currentLeague = document.getElementById('leagueSelector').value;
    Scheduler.save();
    UI.updateAll();
}

function createLiveMatchDemo() {
    if (!Scheduler.currentLeague) { alert('⚠ Primero selecciona una liga'); return; }
    const league = Scheduler.getLeague(Scheduler.currentLeague);
    if (!league || league.teams.length < 2) { alert('⚠ La liga necesita al menos 2 equipos'); return; }

    const team1 = league.teams[Math.floor(Math.random() * league.teams.length)];
    let team2;
    do { team2 = league.teams[Math.floor(Math.random() * league.teams.length)]; } while (team2.name === team1.name);

    const now = new Date();
    league.matches.unshift({
        id: 'match_demo_' + Date.now(),
        leagueId: league.id,
        home: team1.name, away: team2.name,
        homeColor: team1.color, awayColor: team2.color,
        startTime: now.toISOString(),
        status: 'scheduled', homeGoals: null, awayGoals: null, matchScript: null
    });
    Scheduler.save();
    alert('🔴 PARTIDO EN VIVO CREADO!\n\n' + team1.name + ' vs ' + team2.name);
    UI.showTab('today');
    UI.updateAll();
}

function clearAllData() {
    if (confirm('¿Borrar TODOS los datos?')) { Storage.clear(); location.reload(); }
}

function startLiveSync() {
    setInterval(() => {
        if (Scheduler.currentLeague) {
            Scheduler.getLiveMatches(Scheduler.currentLeague);
            Scheduler.save();
        }
    }, 1000);
}

function initApp() {
    console.log('=== SUPERMARKET LEAGUE PRO STARTING ===');
    Storage.clear();
    Scheduler.load();

    if (Scheduler.leagues.length === 0) createDemoLeague();
    if (!Scheduler.currentLeague && Scheduler.leagues.length > 0) {
        Scheduler.currentLeague = Scheduler.leagues[0].id;
        Scheduler.save();
    }

    populateLeagueSelector();
    UI.updateAll();
    startLiveSync();
    console.log('=== APP READY ===');
}

window.onload = initApp;
