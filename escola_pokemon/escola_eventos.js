const eventos = {
    bons: [
        { msg: "Você encontrou um Pokémon perdido e o ajudou a voltar pra casa! (Ganhou +1 nota)", tipo: "nota", valor: 1 },
        { msg: "Você ajudou o professor a organizar a biblioteca. Ele te agradeceu! (Ganhou +1 nota)", tipo: "nota", valor: 1 },
        { msg: "Você fez amizade com um aluno novo! (Ganhou +1 nota)", tipo: "nota", valor: 1 }
    ],
    ruins: [
        { msg: "Um Pokémon selvagem apareceu do nada e te deu um susto! (Seu medo aumentou)", tipo: "medo", valor: 10 },
        { msg: "Você presenciou uma briga entre dois Pokémons e ficou apavorado! (Seu medo aumentou)", tipo: "medo", valor: 15 },
        { msg: "Você tropeçou e caiu na frente de todo mundo no intervalo. Que vergonha! (Ganhou 0 nota)", tipo: "nada", valor: 0 }
    ]
};

export function sortearEvento(medoAtual) {
    const chanceRuim = medoAtual > 50 ? 0.7 : 0.3;
    const rolagem = Math.random();

    if (rolagem < chanceRuim) {
        return eventos.ruins[Math.floor(Math.random() * eventos.ruins.length)];
    } else {
        return eventos.bons[Math.floor(Math.random() * eventos.bons.length)];
    }
}
