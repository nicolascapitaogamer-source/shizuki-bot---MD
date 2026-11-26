import fs from 'fs';

const path = './escola_pokemon/config_escola.json';
const pokePath = './pokemon_users.json';

export function carregarEscola() {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify({}, null, 2));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (e) {
        return {};
    }
}

export function salvarEscola(dados) {
    fs.writeFileSync(path, JSON.stringify(dados, null, 2));
}

export function getAluno(sender) {
    const db = carregarEscola();
    if (!db[sender]) {
        db[sender] = {
            matriculado: true,
            medo: 100,
            nota: 0,
            aulas: 0,
            intervalo_liberado: false,
            parceiro: null,
            ultimaAula: 0
        };
        salvarEscola(db);
    }
    return db[sender];
}

export function classificarNota(nota) {
    if (nota <= 4) return "Precisa melhorar 😢";
    if (nota <= 6) return "Regular 😐";
    if (nota <= 8) return "Bom 😃";
    return "Excelente 🤩";
}

export function getParceiro(sender) {
    try {
        if (!fs.existsSync(pokePath)) return null;
        const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        const user = dbPoke[sender];
        
        if (!user || !user.time || user.time.length === 0) return null;
        
        const aluno = getAluno(sender);
        let parceiroSalvo = aluno.parceiro;
        
        if (!parceiroSalvo) {
            const primeiro = user.time[0].nome || user.time[0].name;
            const dbEscola = carregarEscola();
            dbEscola[sender].parceiro = primeiro;
            salvarEscola(dbEscola);
            return primeiro;
        }
        
        const termo = parceiroSalvo.toLowerCase();
        let pokeEncontrado = user.time.find(p => (p.nome || p.name).toLowerCase() === termo);
        if (!pokeEncontrado) pokeEncontrado = user.time.find(p => (p.nome || p.name).toLowerCase().startsWith(termo));
        if (!pokeEncontrado) pokeEncontrado = user.time.find(p => (p.nome || p.name).toLowerCase().includes(termo));
        
        if (pokeEncontrado) {
            const nomeReal = pokeEncontrado.nome || pokeEncontrado.name;
            if (nomeReal !== parceiroSalvo) {
                const dbEscola = carregarEscola();
                dbEscola[sender].parceiro = nomeReal;
                salvarEscola(dbEscola);
            }
            return nomeReal;
        }
        
        return user.time[0].nome || user.time[0].name;
    } catch (e) {
        return null;
    }
}
