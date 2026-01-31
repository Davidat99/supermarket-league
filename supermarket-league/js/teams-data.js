const TEAMS_CONFIG = [
    { name: "Mercadona FC", color: "#4CAF50", level: 3, logoFile: "mercadona.svg" },
    { name: "Carrefour United", color: "#004E9A", level: 2, logoFile: "carrefour.svg" },
    { name: "Lidl CF", color: "#0050AA", level: 2, logoFile: "lidl.svg" },
    { name: "DIA Market CF", color: "#E30613", level: 1, logoFile: "dia.svg" },
    { name: "Alcampo Athletic", color: "#E4002B", level: 2, logoFile: "alcampo.svg" },
    { name: "Aldi FC", color: "#00529B", level: 2, logoFile: "aldi.svg" },
    { name: "Ahorramás CF", color: "#E31837", level: 1, logoFile: "ahorramas.svg" },
    { name: "Alimerka SD", color: "#009639", level: 1, logoFile: "alimerka.svg" },
    { name: "Consum United", color: "#E94E1B", level: 1, logoFile: "consum.svg" },
    { name: "Eroski SD", color: "#E30613", level: 1, logoFile: "eroski.svg" }
];

const PLAYER_NAMES = [
    "GARCÍA", "LÓPEZ", "MARTÍN", "GONZÁLEZ", "RODRÍGUEZ", "FERNÁNDEZ",
    "PÉREZ", "SÁNCHEZ", "RAMÍREZ", "TORRES", "FLORES", "RIVERA",
    "GÓMEZ", "DÍAZ", "CRUZ", "MORALES", "REYES", "JIMÉNEZ"
];

const FORMATIONS = [
    { def: 4, cen: 3, del: 3 }, { def: 4, cen: 4, del: 2 },
    { def: 3, cen: 5, del: 2 }, { def: 5, cen: 3, del: 2 }
];

function getTeamLogo(teamName) {
    const team = TEAMS_CONFIG.find(t => t.name === teamName);
    return team && team.logoFile ? 'assets/logos/' + team.logoFile : 'assets/logos/default.svg';
}

function getTeamColor(teamName) {
    const team = TEAMS_CONFIG.find(t => t.name === teamName);
    return team ? team.color : '#64748b';
}
