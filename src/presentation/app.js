
// ==========================================
// VALUE OBJECT: Dinheiro
// ==========================================
class Dinheiro {
    constructor(centavos) {
        this._centavos = Math.round(centavos);
    }

    static deFloat(valor) {
        return new Dinheiro(valor * 100);
    }

    get emCentavos() { return this._centavos; }
    get emReais() { return this._centavos / 100; }

    adicionar(outroDinheiro) {
        return new Dinheiro(this._centavos + outroDinheiro.emCentavos);
    }

    formatar() {
        return this.emReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}

// ==========================================
// ENTIDADES DO DOMÍNIO
// ==========================================
class Despesa {
    constructor(id, descricao, dinheiro, pagador) {
        this.id = id || Date.now() + Math.random().toString(36).substr(2, 5); // ID único para podermos apagar
        this.descricao = descricao;
        this.valor = dinheiro; 
        this.pagador = pagador.trim();
    }
}

class FundoReserva {
    constructor(metaInicialReais, saldoAtualCentavos = 0) {
        this.meta = Dinheiro.deFloat(metaInicialReais);
        this.saldoAtual = new Dinheiro(saldoAtualCentavos);
    }

    adicionarContribuicao(dinheiro) {
        this.saldoAtual = this.saldoAtual.adicionar(dinheiro);
    }
}

// ==========================================
// SERVIÇO DE DOMÍNIO: Com Armazenamento (LocalStorage)
// ==========================================
class SistemaFinancasColetivas {
    constructor() {
        this.despesas = [];
        this.fundo = new FundoReserva(1000.00);
        this.carregarDados(); // Carrega o que estiver salvo assim que o sistema inicia
    }

    adicionarDespesa(descricao, valorFloat, pagador) {
        const despesa = new Despesa(null, descricao, Dinheiro.deFloat(valorFloat), pagador);
        this.despesas.push(despesa);
        this.salvarDados(); // Salva no LocalStorage
    }

    // NOVA FUNÇÃO: Apagar um lançamento específico pelo ID
    removerDespesa(id) {
        this.despesas = this.despesas.filter(d => d.id !== id);
        this.salvarDados(); // Salva a lista atualizada
    }

    adicionarContribuicaoFundo(valorFloat) {
        this.fundo.adicionarContribuicao(Dinheiro.deFloat(valorFloat));
        this.salvarDados(); // Salva o novo saldo do fundo
    }

    obterParticipantes() {
        return [...new Set(this.despesas.map(d => d.pagador))];
    }

    // PERSISTÊNCIA: Salva os dados transformando os objetos em texto JSON
    salvarDados() {
        const dadosParaSalvar = {
            despesas: this.despesas.map(d => ({
                id: d.id,
                descricao: d.descricao,
                centavos: d.valor.emCentavos,
                pagador: d.pagador
            })),
            fundoCentavos: this.fundo.saldoAtual.emCentavos
        };
        localStorage.setItem('@Finans:dadosGrupo', JSON.stringify(dadosParaSalvar));
    }

    // PERSISTÊNCIA: Carrega o texto JSON e reconstrói os objetos de Verdade (com seus métodos)
    carregarDados() {
        const dadosSalvos = localStorage.getItem('@Finans:dadosGrupo');
        if (dadosSalvos) {
            const dadosParseados = JSON.parse(dadosSalvos);
            
            // Reconstrói a lista de despesas como instâncias da classe Despesa
            this.despesas = dadosParseados.despesas.map(d => 
                new Despesa(d.id, d.descricao, new Dinheiro(d.centavos), d.pagador)
            );
            
            // Reconstrói o Fundo de Reserva
            this.fundo = new FundoReserva(1000.00, dadosParseados.fundoCentavos || 0);
        }
    }

    calcularSaldosEClearing() {
        const participantes = this.obterParticipantes();
        if (participantes.length === 0) return { saldos: {}, transferencias: [] };

        let totalCentavos = 0;
        this.despesas.forEach(d => totalCentavos += d.valor.emCentavos);
        
        const quotaCentavos = Math.floor(totalCentavos / participantes.length);

        let balancos = {};
        participantes.forEach(p => {
            let pagoPorEle = 0;
            this.despesas.filter(d => d.pagador === p).forEach(d => pagoPorEle += d.valor.emCentavos);
            balancos[p] = pagoPorEle - quotaCentavos;
        });

        let devedores = [];
        let credores = [];

        for (let p in balancos) {
            if (balancos[p] < 0) devedores.push({ nome: p, debito: Math.abs(balancos[p]) });
            if (balancos[p] > 0) credores.push({ nome: p, credito: balancos[p] });
        }

        let transferencias = [];
        let i = 0, j = 0;
        while (i < devedores.length && j < credores.length) {
            let devedor = devedores[i];
            let credor = credores[j];

            let valorTransferido = Math.min(devedor.debito, credor.credito);
            
            transferencias.push({
                de: devedor.nome,
                para: credor.nome,
                valor: new Dinheiro(valorTransferido).formatar()
            });

            devedor.debito -= valorTransferido;
            credor.credito -= valorTransferido;

            if (devedor.debito === 0) i++;
            if (credor.credito === 0) j++;
        }

        return { saldos: balancos, transferencias: transferencias };
    }
}

// INSTANCIAÇÃO
const sistema = new SistemaFinancasColetivas();

// CONTROLADOR DA INTERFACE
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const balancesDiv = document.getElementById('balances');
const clearingDiv = document.getElementById('clearing-propostas');
const fundoForm = document.getElementById('fundo-form');

document.getElementById('meta-valor').innerText = sistema.fundo.meta.formatar();

expenseForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const desc = document.getElementById('description').value;
    const valor = Number.parseFloat(document.getElementById('amount').value);
    const pessoa = document.getElementById('person').value;

    sistema.adicionarDespesa(desc, valor, pessoa);
    expenseForm.reset();
    atualizarTela();
});

fundoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const valor = Number.parseFloat(document.getElementById('fundo-quantia').value);
    
    sistema.adicionarContribuicaoFundo(valor);
    fundoForm.reset();
    atualizarTela();
});

// RENDERIZAÇÃO DA TELA
function atualizarTela() {
    expenseList.innerHTML = '';
    
    sistema.despesas.forEach(d => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center animate__animated animate__fadeIn';
        
        // Adicionamos um botão de lixeira vermelho com a propriedade onclick chamando deletarDespesa
        li.innerHTML = `
            <span><b>${d.pagador}</b> pagou: ${d.descricao}</span>
            <div>
                <span class="badge badge-primary badge-pill mr-3">${d.valor.formatar()}</span>
                <button class="btn btn-sm btn-outline-danger" onclick="deletarDespesa('${d.id}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        expenseList.appendChild(li);
    });

    document.getElementById('fundo-acumulado').innerText = sistema.fundo.saldoAtual.formatar();

    const resultado = sistema.calcularSaldosEClearing();
    
    balancesDiv.innerHTML = '';
    for (let pessoa in resultado.saldos) {
        const saldoDinheiro = new Dinheiro(resultado.saldos[pessoa]);
        const corTexto = resultado.saldos[pessoa] >= 0 ? 'text-success' : 'text-danger';
        const sinal = resultado.saldos[pessoa] >= 0 ? 'A receber' : 'Deve';
        
        balancesDiv.innerHTML += `
            <div class="d-flex justify-content-between my-1 border-bottom">
                <span><b>${pessoa}</b> (${sinal})</span>
                <span class="${corTexto}"><b>${saldoDinheiro.formatar()}</b></span>
            </div>
        `;
    }

    clearingDiv.innerHTML = '';
    if (resultado.transferencias.length === 0) {
        clearingDiv.innerHTML = '<span class="text-muted">Tudo zerado por enquanto!</span>';
    } else {
        resultado.transferencias.forEach(t => {
            clearingDiv.innerHTML += `
                <div class="alert alert-warning p-2 mb-1 text-dark" style="font-size:0.9rem;">
                    <strong>${t.de}</strong> deve transferir <strong>${t.valor}</strong> para <strong>${t.para}</strong>
                </div>
            `;
        });
    }
}

// FUNÇÃO GLOBAL: Ativada ao clicar na lixeira
window.deletarDespesa = function(id) {
    if(confirm("Tem certeza que deseja apagar este lançamento?")) {
        sistema.removerDespesa(id);
        atualizarTela();
    }
}

// Renderiza os dados salvos assim que abre a página pela primeira vez
atualizarTela();