let produtoAtual = null;

// OF-021: aviso discreto que aparece e some sozinho, sem travar a tela pedindo OK
let toastTimeout = null;

function mostrarToast(mensagem, tipo){
        const toast = document.getElementById("toast");
        toast.textContent = mensagem;
        toast.className = tipo === "erro" ? "mostrar erro" : "mostrar";

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
                toast.className = "";
        }, 3000);
}

// Controle de abas (OF-013: separar telas para reduzir poluição visual)
function mudarAba(nome){
        const abas = ["buscar", "dia", "painel"];

        abas.forEach(aba => {
                document.getElementById(`aba-${aba}`).style.display =
                        aba === nome ? "block" : "none";
                document.getElementById(`abaBotao-${aba}`).classList.toggle(
                        "ativa",
                        aba === nome
                );
        });
}

let historico = [];

let totalFila = 0;

let publicados = 0;

let indiceSelecionado = -1;

let produtos = [];

// OF-011: configuração da preparação do dia
const DIA_HORA_INICIO = 9;
const DIA_HORA_FIM = 21;
const DIA_INTERVALO_BASE = 30;
const DIA_VARIACAO = 8;

let diaPreparado = [];

// OF-013: estado do Painel de Controle
let falhas = 0;
let ultimaPublicacao = null;
let logErros = [];
let historicoPublicacoes = [];

// OF-014: Score da Oferta = 70% desconto + 30% peso da categoria da marca (0-100).
// Categoria vem da letra final da sua tabela (SS = grife internacional, C = popular).
// SS e S ficam comentadas por enquanto: o app só trabalha com Dafiti hoje, que não vende essas grifes.
// Quando expandir pra outro marketplace que venda grife internacional, é só descomentar.
const CATEGORIA_MARCA = {
        // "Chanel": "SS", "Louis Vuitton": "SS", "Gucci": "SS", "Prada": "SS",
        // "Jimmy Choo": "SS", "Christian Louboutin": "SS", "Balenciaga": "SS",
        // "Saint Laurent": "SS", "Aquazzura": "SS", "Mach & Mach": "SS",
        // "Manolo Blahnik": "SS", "Miu Miu": "SS", "Giuseppe Zanotti": "SS",
        // "Valentino": "SS", "Dolce & Gabbana": "SS", "Fendi": "SS",
        // "Salvatore Ferragamo": "SS",

        // "Timberland": "S", "Emporio Armani": "S", "Kate Spade": "S",
        // "Zeferino": "S", "Tory Burch": "S", "Michael Kors": "S", "UGG": "S",

        "Luiza Barcelos": "A", "Carmen Steffens": "A", "Animale": "A",
        "Guess": "A", "Cecconelo": "A", "Carrano": "A", "Arezzo": "A",
        "Ellus": "A", "Schutz": "A", "Santa Lolla": "A", "Capodarte": "A",
        "Lança Perfume": "A", "Dumond": "A", "Corello": "A",
        "Loucos & Santos": "A", "Constance": "A", "Jorge Bischoff": "A",

        "Via Marte": "B", "Via Uno": "B", "Luz da Lua": "B", "AnaCapri": "B",
        "Bottero": "B", "Usaflex": "B", "Crocs": "B",

        "Ramarim": "C", "Beira Rio": "C", "Dakota": "C", "Modare": "C",
        "Vizzano": "C", "Havaianas": "C", "Moleca": "C", "Melissa": "C"
};

const PESO_CATEGORIA = {
        // SS: 100,
        // S: 80,
        A: 60,
        B: 40,
        C: 20
};

const PESO_MARCA_PADRAO = 30; // marca fora da tabela

// OF-019: ícone automático conforme o tipo de calçado, detectado pelo nome do produto
const ICONE_CATEGORIA = [
        { termo: "sandália", icone: "👡" },
        { termo: "sandalia", icone: "👡" },
        { termo: "anabela", icone: "👡" },
        { termo: "scarpin", icone: "👠" },
        { termo: "mule", icone: "👠" },
        { termo: "salto", icone: "👠" },
        { termo: "tênis", icone: "👟" },
        { termo: "tenis", icone: "👟" },
        { termo: "bota", icone: "👢" },
        { termo: "sapatilha", icone: "🥿" },
        { termo: "chinelo", icone: "🩴" },
        { termo: "rasteira", icone: "🩴" },
        { termo: "papete", icone: "🩴" }
];
const ICONE_CATEGORIA_PADRAO = "👠";

function obterIconeCategoria(nome){
        const nomeMin = (nome || "").toLowerCase();
        for(const item of ICONE_CATEGORIA){
                if(nomeMin.includes(item.termo)){
                        return item.icone;
                }
        }
        return ICONE_CATEGORIA_PADRAO;
}

function calcularScore(produto){
        const categoria = CATEGORIA_MARCA[produto.marca];
        const pesoMarca = categoria ? PESO_CATEGORIA[categoria] : PESO_MARCA_PADRAO;
        const valor = Math.round((produto.desconto * 0.7) + (pesoMarca * 0.3));

        let rotulo = "";
        if(valor >= 70){
                rotulo = "🔴 Alto";
        }else if(valor >= 40){
                rotulo = "🟡 Médio";
        }else{
                rotulo = "🟢 Baixo";
        }

        return { valor, rotulo };
}

const MODO_DESENVOLVIMENTO = true;

const produtosTeste = [
        {
                nome: "Sandália Feminina Santa Lolla Salto Bloco Caramelo",
                marca: "Santa Lolla",
                precoOriginal: "199.90",
                precoAtual: "104.99",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Scarpin Schutz Verniz Preto",
                marca: "Schutz",
                precoOriginal: "359.90",
                precoAtual: "179.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Tênis Jorge Bischoff Croco Off White",
                marca: "Jorge Bischoff",
                precoOriginal: "499.90",
                precoAtual: "249.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Bota Arezzo Cano Curto",
                marca: "Arezzo",
                precoOriginal: "699.90",
                precoAtual: "349.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Sandália Via Marte Nude",
                marca: "Via Marte",
                precoOriginal: "189.90",
                precoAtual: "99.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Sapatilha Cecconelo Verniz Nude",
                marca: "Cecconelo",
                precoOriginal: "159.90",
                precoAtual: "119.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Chinelo Havaianas Slim",
                marca: "Havaianas",
                precoOriginal: "49.90",
                precoAtual: "34.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Bota Carmen Steffens Cano Longo",
                marca: "Carmen Steffens",
                precoOriginal: "599.90",
                precoAtual: "269.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Tênis Vizzano Chunky Branco",
                marca: "Vizzano",
                precoOriginal: "259.90",
                precoAtual: "142.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Sandália Capodarte Salto Fino",
                marca: "Capodarte",
                precoOriginal: "329.90",
                precoAtual: "115.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Scarpin Carrano Couro Preto",
                marca: "Carrano",
                precoOriginal: "279.90",
                precoAtual: "78.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Mule Dumond Verniz",
                marca: "Dumond",
                precoOriginal: "349.90",
                precoAtual: "62.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Papete Melissa Transparente",
                marca: "Melissa",
                precoOriginal: "179.90",
                precoAtual: "89.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        }
];

function renderizarProduto(produto){
        document.getElementById("nome").innerHTML =
                `${obterIconeCategoria(produto.nome)} ${produto.nome}`;
        document.getElementById("original").innerHTML =
                `De: R$ ${formatarPreco(produto.precoOriginal)}`;
        document.getElementById("atual").innerHTML =
                `Por: R$ ${formatarPreco(produto.precoAtual)}`;
        document.getElementById("imagem").src = produto.imagem;
        document.getElementById("imagem").style.display = "block";
        document.getElementById("desconto").innerHTML =
                `${obterRotuloOferta(produto.desconto)} - ${produto.desconto}% OFF`;
        document.getElementById("descricao").value =
                produto.descricao;

        const score = calcularScore(produto);
        document.getElementById("scoreOferta").innerHTML =
                `⭐ Score: <b>${score.valor}</b> ${score.rotulo}`;
};

function salvarDescricaoAtual(){
        if(
                indiceSelecionado >= 0 &&
                produtos[indiceSelecionado]
        ){
                produtos[indiceSelecionado].descricao =
                        document.getElementById("descricao").value;
        }
}

function formatarPreco(valor){
        return Number(valor).toLocaleString("pt-BR",{
                minimumFractionDigits:2,
                maximumFractionDigits:2
        });
}

// OF-017: rótulo automático da legenda conforme a faixa de desconto
function obterRotuloOferta(desconto){
        if(desconto >= 80){
                return "👑 Oferta Imperdível";
        }
        if(desconto >= 70){
                return "🚨 Oferta Relâmpago";
        }
        if(desconto >= 60){
                return "💥 Super Oferta";
        }
        if(desconto >= 40){
                return "🔥 Oferta";
        }
        return "🔥 Oferta";
}

// OF-018: modelos diferentes de legenda
const MODELOS_LEGENDA = [
        {
                nome: "Padrão",
                gerar: (p) => `${obterRotuloOferta(p.desconto)}

${obterIconeCategoria(p.nome)} ${p.nome}

🔥 ${p.desconto}% OFF

💰 De R$ ${formatarPreco(p.precoOriginal)}
✅ Por apenas R$ ${formatarPreco(p.precoAtual)}

🛍️ Compre aqui:
${p.url}

🏃 Aproveite antes que acabe!`
        },
        {
                nome: "Direto",
                gerar: (p) => `${obterRotuloOferta(p.desconto)}
${obterIconeCategoria(p.nome)} ${p.nome}

De R$ ${formatarPreco(p.precoOriginal)} por apenas R$ ${formatarPreco(p.precoAtual)} (${p.desconto}% OFF)

👉 Garanta o seu:
${p.url}

⏰ Estoque limitado!`
        },
        {
                nome: "Emocional",
                gerar: (p) => `Apaixonada por um look assim? 😍

${obterIconeCategoria(p.nome)} ${p.nome} está com ${p.desconto}% de desconto!

De R$ ${formatarPreco(p.precoOriginal)}
Por R$ ${formatarPreco(p.precoAtual)}

Corre que é por tempo limitado:
${p.url}`
        },
        {
                nome: "Destaques",
                gerar: (p) => `${obterRotuloOferta(p.desconto)}

✔️ ${obterIconeCategoria(p.nome)} ${p.nome}
✔️ ${p.desconto}% de desconto
✔️ De R$ ${formatarPreco(p.precoOriginal)} → R$ ${formatarPreco(p.precoAtual)}

📲 ${p.url}`
        }
];

let modeloLegendaAtual = localStorage.getItem("modeloLegendaOfertaFlow") || "auto";

function definirModeloLegenda(valor){
        modeloLegendaAtual = valor;
        localStorage.setItem("modeloLegendaOfertaFlow", valor);
}

function gerarDescricao(produto){
        const indice = modeloLegendaAtual === "auto"
                ? Math.floor(Math.random() * MODELOS_LEGENDA.length)
                : parseInt(modeloLegendaAtual);

        return MODELOS_LEGENDA[indice].gerar(produto);
}

// OF-016: Oferta do Dia = produto com maior Score da Oferta na fila atual
function obterOfertaDoDia(){
        if(produtos.length === 0){
                return null;
        }

        let melhor = produtos[0];
        let melhorScore = calcularScore(melhor).valor;

        for(const produto of produtos){
                const score = calcularScore(produto).valor;
                if(score > melhorScore){
                        melhor = produto;
                        melhorScore = score;
                }
        }

        return melhor;
}

function gerarDescricaoOfertaDoDia(produto){
        return `🏆 OFERTA DO DIA 🏆

${obterIconeCategoria(produto.nome)} ${produto.nome}

🔥 ${produto.desconto}% OFF

💰 De R$ ${formatarPreco(produto.precoOriginal)}
✅ Por apenas R$ ${formatarPreco(produto.precoAtual)}

🛍️ Compre aqui:
${produto.url}

🏃 Corre que é por tempo limitado!`;
}

function atualizarOfertaDoDia(){
        const elemento = document.getElementById("ofertaDoDia");
        const botao = document.getElementById("btnPublicarOfertaDoDia");
        const oferta = obterOfertaDoDia();

        if(!oferta){
                elemento.innerHTML = "⚪ Nenhuma oferta na fila.";
                botao.disabled = true;
                return;
        }

        const score = calcularScore(oferta);

        elemento.innerHTML = `
                <strong>${obterIconeCategoria(oferta.nome)} ${oferta.nome}</strong><br>
                ${oferta.marca ? "🏷️ " + oferta.marca + "<br>" : ""}
                🔥 ${oferta.desconto}% OFF &nbsp; ⭐ Score: ${score.valor} ${score.rotulo}
        `;
        botao.disabled = false;
}

// OF-040: garante que o link do produto sempre apareça na legenda enviada,
// mesmo que a descrição tenha sido editada manualmente e o link removido por engano
function garantirUrlNaDescricao(produto){
        if(produto.url && !produto.descricao.includes(produto.url)){
                produto.descricao = `${produto.descricao}\n\n🔗 ${produto.url}`;
        }
        return produto;
}

async function publicarOfertaDoDia(){
        const oferta = obterOfertaDoDia();
        if(!oferta){
                mostrarToast("Nenhuma oferta na fila.", "erro");
                return;
        }

        if(!confirm(`Publicar agora?\n\n${oferta.nome}\n${oferta.desconto}% OFF`)){
                return;
        }

        const indice = produtos.indexOf(oferta);
        const produtoDestaque = garantirUrlNaDescricao({
                ...oferta,
                descricao: gerarDescricaoOfertaDoDia(oferta)
        });

        const publicado = await publicarTelegram(produtoDestaque);
        registrarPublicacao(produtoDestaque, publicado);

        if(publicado){
                adicionarHistorico(`🏆 ${oferta.nome} (Oferta do Dia)`);
                produtos.splice(indice, 1);
                publicados++;
                atualizarProgresso();
                if(produtos.length > 0){
                        selecionarProduto(Math.min(indice, produtos.length - 1));
                }else{
                        produtoAtual = null;
                        indiceSelecionado = -1;
                }
                atualizarInterface();
                mostrarToast("🏆 Oferta do Dia publicada!");
        }else{
                atualizarInterface();
                mostrarToast("Erro ao publicar.", "erro");
        }
}
        
function minutosParaHora(minutos){
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

// Gera horários de postagem entre o início e o fim, variando o intervalo
// para não ficar sempre exatamente de 30 em 30 minutos.
function calcularHorarios(qtdProdutos, minutoInicio, minutoFim, intervaloBase, variacao){
        const horarios = [];
        let minutoAtual = minutoInicio;

        for(let i = 0; i < qtdProdutos; i++){
                if(minutoAtual > minutoFim){
                        break;
                }
                horarios.push(minutoAtual);
                const jitter = Math.round((Math.random() * 2 - 1) * variacao);
                minutoAtual += intervaloBase + jitter;
        }

        return horarios;
}

async function prepararDia(){
        const urls = document
                .getElementById("url")
                .value
                .split("\n")
                .map(l => l.trim())
                .filter(l => l !== "");

        if(urls.length === 0){
                mostrarToast("Cole os links dos produtos.", "erro");
                return;
        }

        let manterAnteriores = false;
        if(diaPreparado.length > 0){
                const substituir = confirm(
                        "Já existe uma fila do dia preparada.\n\nOK = Substituir\nCancelar = Adicionar aos que já foram preparados"
                );
                manterAnteriores = !substituir;
        }

        salvarDescricaoAtual();
        bloquearInterface();
        document.getElementById("statusBusca").style.display = "block";

        const produtosDoDia = [];

        for(const [i, url] of urls.entries()){
                document.getElementById("statusBusca").innerHTML =
                        `<span class="spinner"></span>Buscando produto ${i + 1} de ${urls.length}...`;
                try{
                        let dados;
                        if(MODO_DESENVOLVIMENTO){
                                dados = produtosTeste[produtosDoDia.length % produtosTeste.length];
                        }else{
                                const resposta = await fetch(
                                        "https://hook.us2.make.com/9h9tic2oo03ftyghkomkjyu90if73i4w",
                                        {
                                                method: "POST",
                                                headers: {
                                                        "Content-Type": "application/json"
                                                },
                                                body: JSON.stringify({ url: url })
                                        }
                                );
                                dados = await resposta.json();
                        }

                        const nomeLimpo = dados.nome
                                .replace(" - Compre Agora | Dafiti Brasil", "")
                                .trim();

                        const original = parseFloat(dados.precoOriginal);
                        const atual = parseFloat(dados.precoAtual);
                        const desconto = Math.round(
                                ((original - atual) / original) * 100
                        );

                        const produto = {
                                url: url,
                                nome: nomeLimpo,
                                marca: dados.marca || "",
                                precoOriginal: dados.precoOriginal,
                                precoAtual: dados.precoAtual,
                                imagem: dados.imagem,
                                desconto: desconto
                        };
                        produto.descricao = gerarDescricao(produto);

                        produtosDoDia.push(produto);
                }catch(erro){
                        console.error(erro);
                }
        }

        document.getElementById("statusBusca").style.display = "none";
        liberarInterface();

        if(produtosDoDia.length === 0){
                mostrarToast("Nenhum produto encontrado.", "erro");
                return;
        }

        const minutoFimBase = DIA_HORA_FIM * 60;
        let minutoInicio;

        if(manterAnteriores && diaPreparado.length > 0){
                const ultimoItem = diaPreparado[diaPreparado.length - 1];
                const [h, m] = ultimoItem.horario.split(":").map(Number);
                const jitter = Math.round((Math.random() * 2 - 1) * DIA_VARIACAO);
                minutoInicio = Math.min((h * 60 + m) + DIA_INTERVALO_BASE + jitter, minutoFimBase);
        }else{
                const agora = new Date();
                const agoraMin = agora.getHours() * 60 + agora.getMinutes();
                const minutoInicioBase = DIA_HORA_INICIO * 60;

                minutoInicio = agoraMin > minutoInicioBase
                        ? Math.min(Math.ceil(agoraMin / 5) * 5, minutoFimBase)
                        : minutoInicioBase;
        }

        const horariosMin = calcularHorarios(
                produtosDoDia.length,
                minutoInicio,
                minutoFimBase,
                DIA_INTERVALO_BASE,
                DIA_VARIACAO
        );

        const novosItens = produtosDoDia.slice(0, horariosMin.length).map((produto, i) => ({
                ...produto,
                horario: minutosParaHora(horariosMin[i])
        }));

        diaPreparado = manterAnteriores
                ? diaPreparado.concat(novosItens)
                : novosItens;

        const naoCoube = produtosDoDia.length - novosItens.length;

        renderizarPreparacaoDia(diaPreparado, naoCoube);
        salvarSessao();
}

// Envia o lote inteiro (array com produto + horário) em uma única chamada.
// No Make: este webhook deve gravar cada item numa Data Store (ou Google Sheets),
// e um segundo cenário agendado (Scheduler nativo, não Sleep) publica quando o horário chegar.
async function enviarDiaParaMake(){
        if(diaPreparado.length === 0){
                mostrarToast("Prepare o dia antes de enviar.", "erro");
                return;
        }

        diaPreparado = diaPreparado.map(item => garantirUrlNaDescricao(item));

        if(MODO_DESENVOLVIMENTO){
                console.log("📅 Simulação de envio do lote para o Make");
                console.log(diaPreparado);
                mostrarToast(`🧪 Simulação: ${diaPreparado.length} produto(s) seriam enviados para o Make.`);
                return;
        }

        try{
                const resposta = await fetch(
                        "https://hook.us2.make.com/SUBSTITUA_PELO_WEBHOOK_DA_FILA_DO_DIA",
                        {
                                method: "POST",
                                headers: {
                                        "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ itens: diaPreparado })
                        }
                );

                if(resposta.ok){
                        mostrarToast("✅ Fila do dia enviada para o Make!");
                }else{
                        mostrarToast("Erro ao enviar a fila do dia.", "erro");
                }
        }catch(erro){
                console.error(erro);
                mostrarToast("Erro ao enviar a fila do dia.", "erro");
        }
}

function renderizarPreparacaoDia(itens, naoCoube){
        const resultado = document.getElementById("resultadoPreparacaoDia");
        const lista = document.getElementById("listaHorariosDia");

        if(itens.length === 0){
                resultado.innerHTML = "⚪ Nenhum produto preparado.";
                lista.innerHTML = "";
                return;
        }

        const primeiro = itens[0].horario;
        const ultimo = itens[itens.length - 1].horario;
        const duracaoMin =
                (parseInt(ultimo.split(":")[0]) * 60 + parseInt(ultimo.split(":")[1])) -
                (parseInt(primeiro.split(":")[0]) * 60 + parseInt(primeiro.split(":")[1]));
        const horasDuracao = Math.floor(duracaoMin / 60);
        const minutosDuracao = duracaoMin % 60;

        let aviso = "";
        if(naoCoube > 0){
                aviso = `<br>⚠️ ${naoCoube} produto${naoCoube !== 1 ? "s" : ""} não coube${naoCoube !== 1 ? "ram" : ""} no período (09h–21h). Reduza a fila, diminua o intervalo ou prepare o restante amanhã.`;
        }

        resultado.innerHTML = `
                📦 ${itens.length} produto${itens.length !== 1 ? "s" : ""} agendado${itens.length !== 1 ? "s" : ""}<br>
                🕐 Primeira postagem: <b>${primeiro}</b><br>
                🕐 Última postagem: <b>${ultimo}</b><br>
                ⏱ Duração total: <b>${horasDuracao}h${minutosDuracao > 0 ? minutosDuracao + "min" : ""}</b>
                ${aviso}
        `;

        lista.innerHTML = itens.map((item, i) =>
                `<div class="produto-item">
                        <strong>${item.horario}</strong> — ${item.nome}
                </div>`
        ).join("");
}



async function buscarProduto() {

    const urls = document
    .getElementById("url")
    .value
    .split("\n")
    .map(l => l.trim())
    .filter(l => l !== "");

        salvarDescricaoAtual();

        if(produtos.length > 0){
                const limpar = confirm(
                        "Deseja limpar a fila atual?\n\nOK = Limpar\nCancelar = Adicionar à fila"
                );
                
                if(limpar){
                        const confirmar = confirm(
                                "⚠️ Você perderá todas as descrições editadas.\n\nDeseja continuar?"
                        );
                        if(!confirmar){
                                return;
                        }
                        
                        produtos = [];
                        indiceSelecionado = -1;
                        publicados = 0;
                        atualizarInterface();
                }
        } 
        bloquearInterface();
        
        for (const [i, url] of urls.entries()) {
                if (!url) {
                        mostrarToast("Cole o link do produto.", "erro");
                        return;
                }
                document.getElementById("statusBusca").style.display = "block";
                document.getElementById("statusBusca").innerHTML =
                        `<span class="spinner"></span>Buscando produto ${i + 1} de ${urls.length}...`;
                try {
                        let dados;
                        if (MODO_DESENVOLVIMENTO) {
                                dados = produtosTeste[
                                        produtos.length % produtosTeste.length
                                        ];
                        } else {
                                const resposta = await fetch(
                                        "https://hook.us2.make.com/9h9tic2oo03ftyghkomkjyu90if73i4w",
                                        {
                                                method: "POST",
                                                headers: {
                                                        "Content-Type": "application/json"
                                                },
                                                
                                                body: JSON.stringify({
                                                        url: url
                                                })
                                        }
                                );
                                dados = await resposta.json();
                        }
                        const nomeLimpo = dados.nome
                                .replace(" - Compre Agora | Dafiti Brasil", "")
                                .trim();
                        
                        document.getElementById("nome").innerHTML = nomeLimpo;
                        
                        document.getElementById("original").innerHTML =
                                `De: R$ ${formatarPreco(dados.precoOriginal)}`;
                        
                        document.getElementById("atual").innerHTML =
                                `Por: R$ ${formatarPreco(dados.precoAtual)}`;
                        
                        document.getElementById("imagem").src = dados.imagem;
                        document.getElementById("imagem").style.display = "block";
                        
                        const original = parseFloat(dados.precoOriginal);
                        const atual = parseFloat(dados.precoAtual);
                        const desconto = Math.round(
                                ((original - atual) / original) * 100
                        );
                        
                        document.getElementById("desconto").innerHTML =
                                `${obterRotuloOferta(desconto)} - ${desconto}% OFF`;
                        
                        produtoAtual = {
                                url: url,
                                nome: nomeLimpo,
                                marca: dados.marca || "",
                                precoOriginal: dados.precoOriginal,
                                precoAtual: dados.precoAtual,
                                imagem: dados.imagem,
                                desconto: desconto
                        };
                        produtoAtual.descricao = gerarDescricao(produtoAtual);
                        document.getElementById("descricao").value =
                                produtoAtual.descricao;
                        produtos.push(produtoAtual);
                        
                        renderizarProduto(produtoAtual);
                        
                        atualizarInterface();
                        
                } catch (erro) {
                        console.error(erro);
                        document.getElementById("statusBusca").style.display = "none";
                }
        }
        if(produtos.length > 0){

    selecionarProduto(0);
        }
        publicados = 0;
        
        atualizarProgresso();

        document.getElementById("statusBusca").style.display = "none";
        
        liberarInterface();
        
        mostrarToast(`${produtos.length} produto(s) encontrado(s)!`);
}

function atualizarListaProdutos(){
        const lista =
                document.getElementById("listaProdutos");
        
        lista.innerHTML = "";
        
        produtos.forEach((produto,index)=>{
                const score = calcularScore(produto);
                lista.innerHTML +=`
                <div class="produto-item ${
                        index === indiceSelecionado ? "selecionado" : ""
                }" data-indice="${index}">
                <span class="arrastar">⠿</span>
                <strong>${index + 1}º</strong> - ${obterIconeCategoria(produto.nome)} ${produto.nome}
                <br>
                ${obterRotuloOferta(produto.desconto)} - ${produto.desconto}% OFF &nbsp; ⭐ Score: ${score.valor} ${score.rotulo}
                <br><br>
                
                <button onclick="selecionarProduto(${index})">
                👁️ Selecionar
                </button>
                
                <button onclick="moverParaCima(${index})">
                ⬆️
                </button>
                
                <button onclick="moverParaBaixo(${index})">
                ⬇️
                </button>
                
                <button onclick="removerProduto(${index})">
                ❌
                </button>
                `;
        });
        document.getElementById("tituloFila").innerHTML =
                `📦 Produtos carregados (${produtos.length})`;

        ativarArrastarSoltar();
}

// OF-033: reordenar a fila arrastando (funciona com toque no celular via Pointer Events)
function ativarArrastarSoltar(){
        const lista = document.getElementById("listaProdutos");
        let itemArrastando = null;

        lista.querySelectorAll(".produto-item .arrastar").forEach((alca) => {
                alca.onpointerdown = (evento) => {
                        evento.preventDefault();
                        itemArrastando = alca.closest(".produto-item");
                        itemArrastando.classList.add("arrastando");
                };
        });

        lista.onpointermove = (evento) => {
                if(!itemArrastando){
                        return;
                }
                const alvo = document.elementFromPoint(evento.clientX, evento.clientY);
                const itemAlvo = alvo ? alvo.closest(".produto-item") : null;
                if(!itemAlvo || itemAlvo === itemArrastando){
                        return;
                }
                const rect = itemAlvo.getBoundingClientRect();
                const depoisDoMeio = evento.clientY > rect.top + rect.height / 2;
                if(depoisDoMeio){
                        itemAlvo.after(itemArrastando);
                }else{
                        itemAlvo.before(itemArrastando);
                }
        };

        const finalizarArrasto = () => {
                if(!itemArrastando){
                        return;
                }
                itemArrastando.classList.remove("arrastando");

                const produtoSelecionado = indiceSelecionado >= 0
                        ? produtos[indiceSelecionado]
                        : null;

                const novaOrdem = Array.from(
                        lista.querySelectorAll(".produto-item")
                ).map(el => produtos[parseInt(el.dataset.indice)]);

                produtos = novaOrdem;

                if(produtoSelecionado){
                        indiceSelecionado = produtos.indexOf(produtoSelecionado);
                }

                itemArrastando = null;
                atualizarInterface();
        };

        lista.onpointerup = finalizarArrasto;
        lista.onpointerleave = finalizarArrasto;
}

function removerProduto(indice){

    if(!confirm("Deseja realmente remover este produto da fila?")){
        return;
    }

    const nomeProduto = produtos[indice].nome;

    produtos.splice(indice,1);

    adicionarHistorico(`❌ ${nomeProduto}`);

    atualizarInterface();

    if(produtos.length > 0){
        selecionarProduto(0);
    }else{
        produtoAtual = null;
        indiceSelecionado = -1;
    }

}

function moverParaCima(indice){
        if(indice === 0) return;
        [produtos[indice - 1], produtos[indice]] =
                [produtos[indice], produtos[indice - 1]];
        if (indiceSelecionado === indice) {
                indiceSelecionado--;
        } else if (indiceSelecionado === indice - 1) {
                indiceSelecionado++;
        }
        atualizarInterface();
}

function moverParaBaixo(indice){
        if(indice === produtos.length - 1) return;
        [produtos[indice], produtos[indice + 1]] =
                [produtos[indice + 1], produtos[indice]];
        if (indiceSelecionado === indice) {
                indiceSelecionado++;
        } else if (indiceSelecionado === indice + 1) {
                indiceSelecionado--;
        }
        atualizarInterface();
}

function selecionarProduto(indice){
        salvarDescricaoAtual();
        indiceSelecionado = indice;
        const itemSelecionado =
                document.querySelector(".produtoSelecionado");
        if(itemSelecionado){
                itemSelecionado.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                });
        }
        produtoAtual = produtos[indice];
        renderizarProduto(produtoAtual);
        atualizarInterface();
}

async function publicarTelegram(produto){
        bloquearInterface();
        if(!produto){
                liberarInterface();
                mostrarToast("Nenhum produto para publicar.", "erro");
                return false;
        }

        if (MODO_DESENVOLVIMENTO) {
                    console.log("📱 Simulação de publicação");
                    console.log(produto);;
                    mostrarToast("🧪 Simulação: publicação simulada com sucesso!");
                    liberarInterface();
                return true;
        }

    try{
        const resposta = await fetch(
            "https://hook.us2.make.com/ziofxokbbynercs7pz56qwh1gunhvkml",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(produto)
            }
        );

        liberarInterface();
        return resposta.ok;
    }catch(erro){
        console.error(erro);
        liberarInterface();
            return false;
    }
}

// OF-013: registra o resultado de uma tentativa de publicação para o Painel de Controle
function registrarPublicacao(produto, sucesso){
        const agora = new Date();
        const hora = agora.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
        });

        if(sucesso){
                ultimaPublicacao = { nome: produto.nome, hora: hora };

                const data = agora.toLocaleDateString("pt-BR");
                const score = calcularScore(produto);

                historicoPublicacoes.unshift({
                        data: data,
                        hora: hora,
                        nome: produto.nome,
                        marca: produto.marca || "",
                        desconto: produto.desconto,
                        score: score.valor
                });

                salvarHistoricoPublicacoes();
                atualizarHistoricoPublicacoes();
        }else{
                falhas++;
                logErros.unshift(`${hora} - ❌ ${produto.nome}`);
        }
}

// OF-010: publica sempre o produto selecionado no momento, onde quer que ele esteja na fila
async function publicarSelecionado(){
        if(indiceSelecionado < 0 || !produtos[indiceSelecionado]){
                mostrarToast("Selecione um produto primeiro.", "erro");
                return;
        }

        salvarDescricaoAtual();

        const indice = indiceSelecionado;
        const produto = garantirUrlNaDescricao(produtos[indice]);

        if(!confirm(`Publicar agora?\n\n${produto.nome}\n${produto.desconto}% OFF`)){
                return;
        }

        const publicado = await publicarTelegram(produto);
        registrarPublicacao(produto, publicado);

        if(publicado){
                adicionarHistorico(`✅ ${produto.nome}`);
                produtos.splice(indice, 1);
                publicados++;
                atualizarProgresso();
                if(produtos.length > 0){
                        selecionarProduto(Math.min(indice, produtos.length - 1));
                }else{
                        produtoAtual = null;
                        indiceSelecionado = -1;
                        atualizarInterface();
                }
                mostrarToast("✅ Produto publicado!");
        }else{
                atualizarInterface();
                mostrarToast("Erro ao publicar.", "erro");
        }
}

// OF-007.2: publica sempre o primeiro da fila, na ordem, independente do que estiver selecionado na tela
async function publicarProximo(){
        if(produtos.length === 0){
                mostrarToast("Fila vazia.", "erro");
                return;
        }

        if(indiceSelecionado === 0){
                salvarDescricaoAtual();
        }

        const produto = garantirUrlNaDescricao(produtos[0]);

        if(!confirm(`Publicar agora?\n\n${produto.nome}\n${produto.desconto}% OFF`)){
                return;
        }

        const publicado = await publicarTelegram(produto);
        registrarPublicacao(produto, publicado);

        if(publicado){
                adicionarHistorico(`✅ ${produto.nome}`);
                produtos.shift();
                publicados++;
                atualizarProgresso();
                if(produtos.length > 0){
                        selecionarProduto(0);
                }else{
                        produtoAtual = null;
                        indiceSelecionado = -1;
                        atualizarInterface();
                }
                mostrarToast("✅ Produto publicado!");
        }else{
                atualizarInterface();
                mostrarToast("Erro ao publicar.", "erro");
        }
}

function atualizarContadorFila(){
        totalFila = produtos.length + publicados;
        document.getElementById("contadorFila").innerHTML =
                `📦 Fila: ${produtos.length} produto${produtos.length !== 1 ? "s" : ""}`;
}

function atualizarProgresso(){
        document.getElementById("barraProgresso").max =
                totalFila;
        document.getElementById("barraProgresso").value =
                publicados;
        document.getElementById("progressoTexto").innerHTML =
                `${publicados} de ${totalFila} publicados`;
}

function atualizarInterface(){
        atualizarListaProdutos();
        atualizarContadorFila();
        atualizarResumo();
        atualizarProximoProduto();
        atualizarEstatisticasDesconto();
        atualizarTempoEstimado();
        salvarFila();
        atualizarQualidadeFila();
        atualizarEconomiaFila();
        atualizarEstatisticasSessao();
        atualizarPainelControle();
        atualizarOfertaDoDia();
        salvarSessao();
}

// OF-013: Painel de Controle — visão geral de pendentes, publicados, falhas e última publicação
function atualizarPainelControle(){
        const painel = document.getElementById("painelControle");

        const ultima = ultimaPublicacao
                ? `${ultimaPublicacao.hora} - ${ultimaPublicacao.nome}`
                : "Nenhuma ainda";

        painel.innerHTML = `
                ⏳ Pendentes: <b>${produtos.length}</b><br>
                ✅ Publicados: <b>${publicados}</b><br>
                ❌ Falhas: <b>${falhas}</b><br>
                🕐 Última publicação: <b>${ultima}</b>
        `;

        const log = document.getElementById("logErros");
        if(logErros.length === 0){
                log.innerHTML = "";
        }else{
                log.innerHTML = `
                        <br>⚠️ <b>Log de erros</b><br>
                        ${logErros.join("<br>")}
                `;
        }
}

function atualizarResumo(){

    const total = produtos.length;

    let mediaDesconto = 0;

    if(total > 0){
        mediaDesconto =
            Math.round(
                produtos.reduce(
                    (soma, produto) => soma + produto.desconto,
                    0
                ) / total
            );
    }

    document.getElementById("resumoFila").innerHTML = `
        📦 Produtos: <b>${total}</b><br>
        ✅ Publicados: <b>${publicados}</b><br>
        ⏳ Restantes: <b>${total}</b><br>
        🔥 Desconto médio: <b>${mediaDesconto}%</b>
    `;
}

function atualizarProximoProduto(){
        const elemento =
                document.getElementById("nomeProximo");
        if(produtos.length === 0){
                elemento.innerHTML = "Fila vazia";
                return;
        }
        elemento.innerHTML = `${obterIconeCategoria(produtos[0].nome)} ${produtos[0].nome}`;
}

function atualizarTempoEstimado(){

    const minutos = produtos.length * 2;

    document.getElementById("tempoEstimado").innerHTML =
        `⏱ Tempo estimado: ${minutos} min`;
}

async function copiarDescricao(){
        const textarea = document.getElementById("descricao");
        try{
                if(navigator.clipboard && window.isSecureContext){
                        await navigator.clipboard.writeText(textarea.value);
                }else{
                        textarea.select();
                        textarea.setSelectionRange(0, 999999);
                        document.execCommand("copy");
                }
                mostrarToast("✅ Descrição copiada!");
        }catch(erro){
                console.error(erro);
                textarea.select();
                textarea.setSelectionRange(0, 999999);
                mostrarToast("Selecione e copie manualmente (Ctrl+C ou Copiar).", "erro");
        }
}

function atualizarEstatisticasDesconto(){
        let faixa40 = 0; // 40% a 59%
        let faixa60 = 0; // 60% a 69%
        let faixa70 = 0; // 70% a 79%
        let faixa80 = 0; // 80% ou mais

        for(const produto of produtos){
                if(produto.desconto >= 80){
                        faixa80++;
                }else if(produto.desconto >= 70){
                        faixa70++;
                }else if(produto.desconto >= 60){
                        faixa60++;
                }else if(produto.desconto >= 40){
                        faixa40++;
                }
        }

        document.getElementById("estatisticasDesconto").innerHTML = `
        🔥 40-59%: ${faixa40}<br>
        💥 60-69%: ${faixa60}<br>
        🚨 70-79%: ${faixa70}<br>
        👑 80%+: ${faixa80}
        `;
}

function bloquearInterface(){

    if(!document.getElementById("btnBuscar")){
        console.error("btnBuscar não encontrado");
        return;
    }

    if(!document.getElementById("btnTelegram")){
        console.error("btnTelegram não encontrado");
        return;
    }

    document.getElementById("btnBuscar").disabled = true;
    document.getElementById("btnTelegram").disabled = true;
}

function liberarInterface(){
        document.getElementById("btnBuscar").disabled = false;
        document.getElementById("btnTelegram").disabled = false;
}

function salvarFila(){
        localStorage.setItem(
                "filaOfertaFlow",
                JSON.stringify(produtos)
        );
}

// OF-031: retomar a sessão de onde parou (seleção, publicados, painel, preparar o dia)
function salvarSessao(){
        localStorage.setItem("sessaoOfertaFlow", JSON.stringify({
                publicados: publicados,
                indiceSelecionado: indiceSelecionado,
                diaPreparado: diaPreparado,
                falhas: falhas,
                ultimaPublicacao: ultimaPublicacao,
                logErros: logErros
        }));
}

function carregarSessao(){
        const salvo = localStorage.getItem("sessaoOfertaFlow");
        if(!salvo){
                return null;
        }

        const dados = JSON.parse(salvo);
        publicados = dados.publicados || 0;
        diaPreparado = dados.diaPreparado || [];
        falhas = dados.falhas || 0;
        ultimaPublicacao = dados.ultimaPublicacao || null;
        logErros = dados.logErros || [];

        return dados.indiceSelecionado;
}

// OF-015: histórico permanente de publicações (sobrevive ao fechar/recarregar o app)
const HISTORICO_PUBLICACOES_LIMITE = 200;

function salvarHistoricoPublicacoes(){
        if(historicoPublicacoes.length > HISTORICO_PUBLICACOES_LIMITE){
                historicoPublicacoes = historicoPublicacoes.slice(0, HISTORICO_PUBLICACOES_LIMITE);
        }
        localStorage.setItem(
                "historicoPublicacoesOfertaFlow",
                JSON.stringify(historicoPublicacoes)
        );
}

function carregarHistoricoPublicacoes(){
        const salvo = localStorage.getItem("historicoPublicacoesOfertaFlow");
        historicoPublicacoes = salvo ? JSON.parse(salvo) : [];
        atualizarHistoricoPublicacoes();
}

function atualizarHistoricoPublicacoes(){
        const elemento = document.getElementById("historicoPublicacoes");

        if(historicoPublicacoes.length === 0){
                elemento.innerHTML = "⚪ Nenhuma publicação registrada ainda.";
                return;
        }

        elemento.innerHTML = historicoPublicacoes.map(item => `
                <div class="produto-item">
                        <strong>${item.data} ${item.hora}</strong><br>
                        ${item.nome}${item.marca ? " — " + item.marca : ""}<br>
                        🔥 ${item.desconto}% OFF &nbsp; ⭐ Score: ${item.score}
                </div>
        `).join("");
}

function limparHistoricoPublicacoes(){
        if(!confirm("Isso vai apagar todo o histórico permanente de publicações. Continuar?")){
                return;
        }
        historicoPublicacoes = [];
        salvarHistoricoPublicacoes();
        atualizarHistoricoPublicacoes();
}

function carregarFila(){
        const indiceSalvo = carregarSessao();

        const filaSalva =
                localStorage.getItem("filaOfertaFlow");
        if(filaSalva){
                produtos = JSON.parse(filaSalva);
        }

        atualizarInterface();

        if(produtos.length > 0){
                const indice = (indiceSalvo !== null && indiceSalvo !== undefined && produtos[indiceSalvo])
                        ? indiceSalvo
                        : 0;
                selecionarProduto(indice);
        }

        if(diaPreparado.length > 0){
                renderizarPreparacaoDia(diaPreparado, 0);
        }
}

function adicionarHistorico(texto){
        const agora = new Date();

    const hora =
        agora.toLocaleTimeString("pt-BR",{
            hour:"2-digit",
            minute:"2-digit"
        });

    historico.unshift(`${hora} - ${texto}`);

    document.getElementById("historicoSessao").innerHTML =
        historico.join("<br>");

}

function atualizarQualidadeFila(){

    if(produtos.length === 0){
        document.getElementById("qualidadeFila").innerHTML =
            "⚪ Fila vazia";
        return;
    }

    const media =
        produtos.reduce(
            (soma, produto) => soma + produto.desconto,
            0
        ) / produtos.length;

    let qualidade = "";

    if(media >= 80){
        qualidade = "🔴 Excelente";
    }else if(media >= 60){
        qualidade = "🟡 Boa";
    }else{
        qualidade = "🟢 Regular";
    }

    document.getElementById("qualidadeFila").innerHTML =
        `Qualidade da fila: <b>${qualidade}</b>`;
}

function atualizarEconomiaFila(){

    let economia = 0;

    for(const produto of produtos){
        economia +=
            Number(produto.precoOriginal) -
            Number(produto.precoAtual);
    }

    document.getElementById("economiaFila").innerHTML =
        `💰 Economia total: <b>R$ ${formatarPreco(economia)}</b>`;
}

function atualizarEstatisticasSessao(){

    document.getElementById("estatisticasSessao").innerHTML = `
        <br>
        📊 Resumo da sessão<br>
        ✅ Publicações: <b>${publicados}</b><br>
        📦 Produtos restantes: <b>${produtos.length}</b>
    `;

}
document.getElementById("descricao")
        .addEventListener("input", salvarDescricaoAtual);

document.getElementById("modeloLegenda").value = modeloLegendaAtual;

carregarHistoricoPublicacoes();
carregarFila();
