const UI = {
    showTab: function(tabName) {
        const tabs = ['today', 'upcoming', 'standings', 'teams', 'stats', 'admin'];
        tabs.forEach(t => {
            const tab = document.getElementById(t + 'Tab');
            if (tab) tab.classList.add('hidden');
        });
        const activeTab = document.getElementById(tabName + 'Tab');
        if (activeTab) activeTab.classList.remove('hidden');

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        if (event && event.target) event.target.classList.add('active');

        if (tabName === 'today') this.showTodayMatches();
        if (tabName === 'upcoming') this.showUpcomingMatches();
        if (tabName === 'standings') this.showStandings();
        if (tabName === 'teams') this.showTeams();
        if (tabName === 'stats') this.showStats();
    },

    showTodayMatches: function() {
        const container = document.getElementById('todayMatches');
        if (!Scheduler.currentLeague) {
            container.innerHTML = '<p class="text-muted text-center" style="padding:2rem">Selecciona una liga primero</p>';
            return;
        }

        const league = Scheduler.getLeague(Scheduler.currentLeague);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const todayMatches = league.matches.filter(m => {
            const d = new Date(m.startTime);
            return d >= todayStart && d <= todayEnd;
        }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        if (todayMatches.length === 0) {
            container.innerHTML = '<div class="text-center" style="padding:3rem;background:rgba(30,41,59,0.6);border-radius:0.75rem"><div style="font-size:3rem;margin-bottom:1rem">📅</div><h3 style="color:white">No hay partidos para hoy</h3></div>';
            return;
        }

        let html = '';
        todayMatches.forEach(match => {
            const startTime = new Date(match.startTime);
            const minute = Scheduler.getMatchMinute(match);
            const isLive = match.status === 'live' || (match.status === 'scheduled' && minute > 0 && minute < 94);
            const isFinished = match.status === 'finished';

            html += '<div class="match-card">';
            if (isLive) html += '<div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#ef4444,#f59e0b,#ef4444);animation:pulse 2s infinite"></div>';

            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">';
            html += '<div style="font-size:1.2rem;font-weight:700;color:white">' + startTime.toLocaleTimeString('es-ES', {hour:'2-digit',minute:'2-digit'}) + '</div>';
            
            if (isFinished) html += '<span class="status-badge status-finished">✓ FINALIZADO</span>';
            else if (isLive) html += '<span class="status-badge status-live">🔴 EN VIVO - MIN ' + minute + "'</span>";
            else html += '<span class="status-badge status-scheduled">PROGRAMADO</span>';
            html += '</div>';

            html += '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:center;padding:1rem;background:rgba(15,23,42,0.4);border-radius:0.5rem">';
            html += '<div style="text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:0.5rem">';
            html += '<span style="font-weight:700;color:white">' + match.home + '</span>';
            html += '<img src="' + getTeamLogo(match.home) + '" class="team-logo-sm" alt="">';
            html += '</div>';

            html += '<div style="text-align:center">';
            if (isFinished || isLive) {
                const homeG = isFinished ? match.homeGoals : (match.matchScript ? MatchLive.getCurrentState(match).homeGoals : 0);
                const awayG = isFinished ? match.awayGoals : (match.matchScript ? MatchLive.getCurrentState(match).awayGoals : 0);
                html += '<div style="font-size:2rem;font-weight:700;color:' + (isLive ? '#10b981' : 'white') + '">' + homeG + ' - ' + awayG + '</div>';
            } else {
                html += '<div style="font-size:1.5rem;color:#64748b">VS</div>';
            }
            html += '</div>';

            html += '<div style="text-align:left;display:flex;align-items:center;gap:0.5rem">';
            html += '<img src="' + getTeamLogo(match.away) + '" class="team-logo-sm" alt="">';
            html += '<span style="font-weight:700;color:white">' + match.away + '</span>';
            html += '</div></div>';

            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:1rem">';
            if (isLive) {
                html += '<button class="btn-primary btn-danger" onclick="UI.watchLive(\'' + match.id + '\')">🔺 Ver EN VIVO</button>';
            }
            html += '<button class="btn-primary btn-info" onclick="UI.showLineup(\'' + match.id + '\')">📋 Alineaciones</button>';
            html += '</div></div>';
        });

        container.innerHTML = html;
    },

    showUpcomingMatches: function() {
        const container = document.getElementById('upcomingMatches');
        if (!Scheduler.currentLeague) {
            container.innerHTML = '<p class="text-muted text-center" style="padding:2rem">Selecciona una liga primero</p>';
            return;
        }

        const league = Scheduler.getLeague(Scheduler.currentLeague);
        const now = new Date();
        const upcoming = league.matches.filter(m => m.status === 'scheduled' && new Date(m.startTime) > now)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).slice(0, 10);

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="text-muted text-center" style="padding:2rem">No hay próximos partidos</p>';
            return;
        }

        let html = '';
        upcoming.forEach(match => {
            const d = new Date(match.startTime);
            html += '<div class="match-card">';
            html += '<div style="color:#94a3b8;font-size:0.9rem;margin-bottom:0.5rem">' + d.toLocaleDateString('es-ES', {weekday:'long',day:'numeric',month:'long'}) + ' • ' + d.toLocaleTimeString('es-ES', {hour:'2-digit',minute:'2-digit'}) + '</div>';
            html += '<div style="font-size:1.1rem;font-weight:700;color:white;display:flex;align-items:center;justify-content:center;gap:0.5rem">';
            html += '<img src="' + getTeamLogo(match.home) + '" class="team-logo-sm" alt=""> ' + match.home;
            html += '<span style="color:#64748b;margin:0 0.5rem">vs</span>';
            html += '<img src="' + getTeamLogo(match.away) + '" class="team-logo-sm" alt=""> ' + match.away;
            html += '</div></div>';
        });

        container.innerHTML = html;
    },

    showStandings: function() {
        const container = document.getElementById('standingsTable');
        if (!Scheduler.currentLeague) {
            container.innerHTML = '<p class="text-muted text-center" style="padding:2rem">Selecciona una liga primero</p>';
            return;
        }

        const league = Scheduler.getLeague(Scheduler.currentLeague);
        const teams = [...league.teams].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
        });

        let html = '<table style="width:100%;border-collapse:collapse">';
        html += '<thead><tr style="background:rgba(30,41,59,0.6)"><th style="padding:0.75rem;text-align:left">POS</th><th style="padding:0.75rem;text-align:left">EQUIPO</th><th style="padding:0.75rem;text-align:center">PJ</th><th style="padding:0.75rem;text-align:center">PTS</th><th style="padding:0.75rem;text-align:center">DIF</th></tr></thead><tbody>';

        teams.forEach((team, i) => {
            const diff = team.goalsFor - team.goalsAgainst;
            html += '<tr style="border-bottom:1px solid rgba(100,116,139,0.3)">';
            html += '<td style="padding:0.75rem;font-weight:700">' + (i + 1) + '</td>';
            html += '<td style="padding:0.75rem"><div style="display:flex;align-items:center;gap:0.5rem"><img src="' + getTeamLogo(team.name) + '" class="team-logo-sm" alt=""><span style="font-weight:700">' + team.name + '</span></div></td>';
            html += '<td style="padding:0.75rem;text-align:center">' + team.played + '</td>';
            html += '<td style="padding:0.75rem;text-align:center;font-weight:900;color:#10b981">' + team.points + '</td>';
            html += '<td style="padding:0.75rem;text-align:center;font-weight:700;color:' + (diff > 0 ? '#10b981' : diff < 0 ? '#ef4444' : '#94a3b8') + '">' + (diff > 0 ? '+' : '') + diff + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    },

    showTeams: function() {
        const container = document.getElementById('teamsGrid');
        if (!Scheduler.currentLeague) {
            container.innerHTML = '<p class="text-muted text-center" style="padding:2rem">Selecciona una liga primero</p>';
            return;
        }

        const league = Scheduler.getLeague(Scheduler.currentLeague);
        let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem">';

        league.teams.forEach(team => {
            html += '<div class="match-card" style="border-color:' + team.color + ';cursor:pointer" onclick="UI.showTeamDetail(\'' + team.name.replace(/'/g, "\\'") + '\')">';
            html += '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">';
            html += '<img src="' + getTeamLogo(team.name) + '" class="team-logo" alt="">';
            html += '<div><div style="font-size:1.2rem;font-weight:700;color:white">' + team.name + '</div>';
            html += '<div style="color:#94a3b8;font-size:0.9rem">⭐ Nivel ' + team.level + ' • 👥 ' + (team.players ? team.players.length : 0) + ' jugadores</div></div></div>';
            html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;text-align:center">';
            html += '<div><div style="font-size:1.5rem;font-weight:900;color:#10b981">' + team.points + '</div><div style="font-size:0.7rem;color:#64748b">PTS</div></div>';
            html += '<div><div style="font-size:1.5rem;font-weight:900;color:white">' + team.played + '</div><div style="font-size:0.7rem;color:#64748b">PJ</div></div>';
            html += '<div><div style="font-size:1.5rem;font-weight:900;color:#10b981">' + team.wins + '</div><div style="font-size:0.7rem;color:#64748b">V</div></div>';
            html += '<div><div style="font-size:1.5rem;font-weight:900;color:#ef4444">' + team.losses + '</div><div style="font-size:0.7rem;color:#64748b">D</div></div>';
            html += '</div></div>';
        });

        html += '</div>';
        container.innerHTML = html;
    },

    showStats: function() {
        const container = document.getElementById('statsContent');
        container.innerHTML = '<div class="text-center" style="padding:3rem"><div style="font-size:3rem;margin-bottom:1rem">🏆</div><h3 style="color:white">Estadísticas de Jugadores</h3><p style="color:#94a3b8">Se mostrarán cuando haya partidos finalizados</p></div>';
    },

    showLineup: function(matchId) {
        alert('Ver alineaciones del partido ' + matchId);
    },

    showTeamDetail: function(teamName) {
        alert('Ver detalles de ' + teamName);
    },

    watchLive: function(matchId) {
        const match = Scheduler.getMatchById(matchId);
        if (!match) { alert('Partido no encontrado'); return; }

        const league = Scheduler.getLeague(match.leagueId);
        if (!league) return;

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'liveMatchModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#0a0e1a;z-index:10000;overflow-y:auto;padding:1rem';

        let html = '<div style="max-width:800px;margin:0 auto">';
        html += '<button onclick="document.getElementById(\'liveMatchModal\').remove();if(UI.liveInterval)clearInterval(UI.liveInterval)" style="position:fixed;top:1rem;right:1rem;background:#ef4444;border:none;color:white;padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;font-weight:700;z-index:200">✕ Cerrar</button>';

        html += '<div style="background:rgba(30,41,59,0.8);border-radius:1rem;padding:1.5rem;margin-top:2rem">';
        html += '<div id="liveScoreboard" style="text-align:center;margin-bottom:1.5rem"></div>';
        html += '<div id="liveCommentary" style="max-height:400px;overflow-y:auto"></div>';
        html += '</div></div>';

        modal.innerHTML = html;
        document.body.appendChild(modal);

        // Start live update
        this.updateLiveDisplay(match);
        this.liveInterval = setInterval(() => this.updateLiveDisplay(match), 1000);
    },

    liveInterval: null,

    updateLiveDisplay: function(match) {
        const state = MatchLive.getCurrentState(match);
        
        // Update scoreboard
        const scoreboard = document.getElementById('liveScoreboard');
        if (scoreboard) {
            let period = state.minute <= 45 ? '1ª Parte' : state.minute <= 90 ? '2ª Parte' : 'Tiempo Añadido';
            if (state.isFinished) period = 'FINAL';

            scoreboard.innerHTML = '<div style="color:#10b981;font-size:0.8rem;margin-bottom:0.5rem">' + period + '</div>' +
                '<div style="display:flex;justify-content:center;align-items:center;gap:1.5rem">' +
                '<div style="text-align:right"><img src="' + getTeamLogo(match.home) + '" style="width:40px;height:40px;margin-bottom:0.5rem"><div style="font-weight:700;color:white">' + match.home + '</div></div>' +
                '<div style="font-size:3rem;font-weight:900;color:' + (state.isFinished ? 'white' : '#10b981') + '">' + state.homeGoals + ' - ' + state.awayGoals + '</div>' +
                '<div style="text-align:left"><img src="' + getTeamLogo(match.away) + '" style="width:40px;height:40px;margin-bottom:0.5rem"><div style="font-weight:700;color:white">' + match.away + '</div></div></div>' +
                '<div style="color:#10b981;font-size:1.2rem;margin-top:0.5rem">' + (state.isFinished ? 'FINAL' : 'MIN ' + state.minute + "'") + '</div>';
        }

        // Update commentary
        const commentary = document.getElementById('liveCommentary');
        if (commentary) {
            let commHtml = '';
            [...state.events].reverse().forEach(e => {
                const color = MatchLive.getEventColor(e.type);
                commHtml += '<div style="border-left:3px solid ' + color + ';padding:0.5rem 1rem;margin-bottom:0.5rem;background:rgba(15,23,42,0.4);border-radius:0 0.25rem 0.25rem 0">' +
                    '<span style="color:' + color + ';font-weight:700;margin-right:0.5rem">' + e.minute + "'</span>" +
                    '<span style="color:white">' + MatchLive.formatEvent(e) + '</span></div>';
            });
            if (commHtml === '') commHtml = '<div style="color:#64748b;text-align:center;padding:2rem">El partido está comenzando...</div>';
            commentary.innerHTML = commHtml;
        }

        // Stop if finished
        if (state.isFinished && this.liveInterval) {
            clearInterval(this.liveInterval);
            this.liveInterval = null;
            Scheduler.finishMatch(match.id, state.homeGoals, state.awayGoals);
        }
    },

    updateAll: function() {
        this.showTodayMatches();
        this.showUpcomingMatches();
        this.showStandings();
        this.showTeams();
        this.showStats();
    }
};
