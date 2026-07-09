let produtoAtual = null;

let historico = [];

let totalFila = 0;

let publicados = 0;

let indiceSelecionado = -1;

let produtos = [];

const MODO_DESENVOLVIMENTO = true;

const produtosTeste = [
        {
                nome: "Sandália Feminina Santa Lolla Salto Bloco Caramelo",
                precoOriginal: "199.90",
                precoAtual: "104.99",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Scarpin Schutz Verniz Preto",
                precoOriginal: "359.90",
                precoAtual: "179.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Tênis Jorge Bischoff Croco Off White",
                precoOriginal: "499.90",
                precoAtual: "249.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Bota Arezzo Cano Curto",
                precoOriginal: "699.90",
                precoAtual: "349.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Sandália Via Marte Nude",
                precoOriginal: "189.90",
                precoAtual: "99.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        }
];

function renderizarProduto(produto){
        document.getElementById("nome").innerHTML = produto.nome;
        document.getElementById("original").innerHTML =
                `De: R$ ${formatarPreco(produto.precoOriginal)}`;
        document.getElementById("atual").innerHTML =
                `Por: R$ ${formatarPreco(produto.precoAtual)}`;
        document.getElementById("imagem").src = produto.imagem;
        document.getElementById("imagem").style.display = "block";
        document.getElementById("desconto").innerHTML =
                `🔥 ${produto.desconto}% OFF`;
        document.getElementById("descricao").value =
                produto.descricao;
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
        
async function buscarProduto() {

    const urls = document
    .getElementById("url")
    .value
    .split("\n")
    .map(l => l.trim())
    .filter(l => l !== "");
        
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
        
        for (const url of urls) {
                if (!url) {
                        alert("Cole o link do produto.");
                        return;
                }
                document.getElementById("statusBusca").style.display = "block";
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
                                `🔥 ${desconto}% OFF`;
                        
                        const descricaoPadrao =
`🔥 OFERTA

${nomeLimpo}

🔥 ${desconto}% OFF

💰 De R$ ${dados.precoOriginal}
✅ Por apenas R$ ${dados.precoAtual}

🛍️ Compre aqui:
${url}

🏃 Aproveite antes que acabe!`;

                        document.getElementById("descricao").value = descricaoPadrao;
                        
                        produtoAtual = {
                                url: url,
                                nome: nomeLimpo,
                                precoOriginal: dados.precoOriginal,
                                precoAtual: dados.precoAtual,
                                imagem: dados.imagem,
                                desconto: desconto,
                                descricao: descricaoPadrao
                        };
                        
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
        
        alert(`${produtos.length} produto(s) encontrado(s)!`);
}

function atualizarListaProdutos(){
        const lista =
                document.getElementById("listaProdutos");
        
        lista.innerHTML = "";
        
        produtos.forEach((produto,index)=>{
                lista.innerHTML +=`
                <div class="produto-item ${
                        index === indiceSelecionado ? "selecionado" : ""
                }">
                <strong>${index + 1}º</strong> - ${produto.nome}
                <br>
                🔥 ${produto.desconto}% OFF
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
}

function removerProduto(index){

        if(!confirm("Deseja realmente remover este produto da fila?")){
                return;
        }
        
        produtos.splice(index,1);
        
        atualizarInterface();
}

function moverParaCima(index){
        if(index === 0) return;
        [produtos[index - 1], produtos[index]] =
                [produtos[index], produtos[index - 1]];
        if (indiceSelecionado === index) {
                indiceSelecionado--;
        } else if (indiceSelecionado === index - 1) {
                indiceSelecionado++;
        }
        atualizarInterface();
}

function moverParaBaixo(index){
        if(index === produtos.length - 1) return;
        [produtos[index], produtos[index + 1]] =
                [produtos[index + 1], produtos[index]];
        if (indiceSelecionado === index) {
                indiceSelecionado++;
        } else if (indiceSelecionado === index + 1) {
                indiceSelecionado--;
        }
        atualizarInterface();
}

function selecionarProduto(index){
        salvarDescricaoAtual();
        indiceSelecionado = index;
        const itemSelecionado =
                document.querySelector(".produtoSelecionado");
        if(itemSelecionado){
                itemSelecionado.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                });
        }
        produtoAtual = produtos[index];
        renderizarProduto(produtoAtual);
        atualizarInterface();
}

async function publicarTelegram(){
        bloquearInterface();
        if(indiceSelecionado < 0){
                alert("Busque um produto primeiro.");
                return;
        }
        const produto = produtos[indiceSelecionado];
        produto.descricao =
                document.getElementById("descricao").value;
        
        if (MODO_DESENVOLVIMENTO) {
                    console.log("📱 Simulação de publicação");
                    console.log(produto);;
                    alert("🧪 Modo Desenvolvimento\n\nPublicação simulada com sucesso!");
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

        if(resposta.ok){
                liberarInterface();
                return true;
        }else{
                liberarInterface();
                return false;
        }
    }catch(erro){
        console.error(erro);
        liberarInterface();
            return false;
    }
}

async function publicarProximo(){
        if(produtos.length === 0){
                alert("Fila vazia.");
                return;
        }
        indiceSelecionado = 0;
        const publicado = await publicarTelegram();
        if(publicado){
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
                atualizarInterface();
                alert("✅ Produto publicado!");
                adicionarHistorico(`✅ ${produtoAtual.nome}`);
        }else{
                alert("Erro ao publicar.");
        }
}

function atualizarContadorFila(){
        totalFila = produtos.length;
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
}

function atualizarResumo(){
        document.getElementById("resumoFila").innerHTML = `
        Produtos na fila: <b>${produtos.length}</b><br>
        Publicados: <b>${publicados}</b><br>
        Restantes: <b>${produtos.length}</b>
        `;
}

function atualizarProximoProduto(){
        const elemento =
                document.getElementById("nomeProximo");
        if(produtos.length === 0){
                elemento.innerHTML = "Fila vazia";
                return;
        }
        elemento.innerHTML = produtos[0].nome;
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
                alert("✅ Descrição copiada!");
        }catch(erro){
                console.error(erro);
                textarea.select();
                textarea.setSelectionRange(0, 999999);
                alert("Selecione e copie manualmente (Ctrl+C ou Copiar).");
        }
}

function atualizarEstatisticasDesconto(){
        let acima40 = 0;
        let acima50 = 0;
        let acima60 = 0;
        
        for(const produto of produtos){

        if(produto.desconto >= 40) acima40++;
        if(produto.desconto >= 50) acima50++;
        if(produto.desconto >= 60) acima60++;
        }
        
        document.getElementById("estatisticasDesconto").innerHTML = `
        🔥 40%+: ${acima40}<br>
        🔥 50%+: ${acima50}<br>
        🔥 60%+: ${acima60}
        `;
}

function bloquearInterface(){

    if(!document.getElementById("btnBuscar")){
        alert("btnBuscar não encontrado");
        return;
    }

    if(!document.getElementById("btnTelegram")){
        alert("btnTelegram não encontrado");
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

function carregarFila(){
        const filaSalva =
                localStorage.getItem("filaOfertaFlow");
        if(!filaSalva){
                return;
        }
        produtos = JSON.parse(filaSalva);
        atualizarInterface();
        if(produtos.length > 0){
                selecionarProduto(0);
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
carregarFila();
