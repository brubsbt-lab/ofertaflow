let produtoAtual = null;

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
        
        produtos = [];        
        
        for (const url of urls) {
                if (!url) {
                        alert("Cole o link do produto.");
                        return;
                }
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
                        
                        atualizarListaProdutos();
                        
                } catch (erro) {
                        console.error(erro);
                }
        }
        if(produtos.length > 0){

    selecionarProduto(0);

        }
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
        produtos.splice(index,1);
        
        atualizarListaProdutos();
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
        atualizarListaProdutos();
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
        atualizarListaProdutos();
}

function selecionarProduto(index){
        salvarDescricaoAtual();
        indiceSelecionado = index;
        produtoAtual = produtos[index];
        renderizarProduto(produtoAtual);
        atualizarListaProdutos();
}

async function publicarTelegram(){
        if(indiceSelecionado < 0){
                alert("Busque um produto primeiro.");
                return;
        }
        const produto = produtos[indiceSelecionado];
        produto.descricao =
                document.getElementById("descricao").value;
        
        if (MODO_DESENVOLVIMENTO) {
                    console.log("📱 Simulação de publicação");
                    console.log(produtoAtual);
                    alert("🧪 Modo Desenvolvimento\n\nPublicação simulada com sucesso!");
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
                body:JSON.stringify(produtoAtual)
            }
        );

        if(resposta.ok){
                return true;
        }else{
                return false;
        }
    }catch(erro){
        console.error(erro);
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
                if(produtos.length > 0){
                        selecionarProduto(0);
                }else{
                        produtoAtual = null;
                        indiceSelecionado = -1;
                        atualizarListaProdutos();
                }
                atualizarListaProdutos();
                alert("✅ Produto publicado!");
        }else{
                alert("Erro ao publicar.");
        }
}
