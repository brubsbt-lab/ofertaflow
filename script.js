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
                `De: R$ ${produto.precoOriginal}`;
        document.getElementById("atual").innerHTML =
                `Por: R$ ${produto.precoAtual}`;
        document.getElementById("imagem").src = produto.imagem;
        document.getElementById("imagem").style.display = "block";
        document.getElementById("desconto").innerHTML =
                `🔥 ${produto.desconto}% OFF`;
        document.getElementById("descricao").value =
                `🔥 OFERTA
                
${produto.nome}
                
                🔥 ${produto.desconto}% OFF
                💰 De R$ ${produto.precoOriginal}
                ✅ Por apenas R$ ${produto.precoAtual}
                
                🛍️ Compre aqui:
                ${produto.url}
                
                🏃 Aproveite antes que acabe!`;
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
                                `De: R$ ${dados.precoOriginal}`;
                        
                        document.getElementById("atual").innerHTML =
                                `Por: R$ ${dados.precoAtual}`;
                        
                        document.getElementById("imagem").src = dados.imagem;
                        document.getElementById("imagem").style.display = "block";
                        
                        const original = parseFloat(dados.precoOriginal);
                        const atual = parseFloat(dados.precoAtual);
                        const desconto = Math.round(
                                ((original - atual) / original) * 100
                        );
                        
                        document.getElementById("desconto").innerHTML =
                                `🔥 ${desconto}% OFF`;
                        
                        document.getElementById("descricao").value =
                                `🔥 OFERTA
                                ${nomeLimpo}
                                🔥 ${desconto}% OFF
                                💰 De R$ ${dados.precoOriginal}
                                ✅ Por apenas R$ ${dados.precoAtual}
                                🛍️ Compre aqui:
                                ${url}
                                🏃 Aproveite antes que acabe!`;
                        
                        produtoAtual = {
                                url: url,
                                nome: nomeLimpo,
                                precoOriginal: dados.precoOriginal,
                                precoAtual: dados.precoAtual,
                                imagem: dados.imagem,
                                desconto: desconto
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
        if (indiceSelecionado === index) {
                indiceSelecionado--;
        } else if (indiceSelecionado === index - 1) {
                indiceSelecionado++;
        }
}

function moverParaBaixo(index){
        if (indiceSelecionado === index) {
                indiceSelecionado++;
        } else if (indiceSelecionado === index + 1) {
                indiceSelecionado--;
        }
}

function selecionarProduto(index){
        indiceSelecionado = index;
        produtoAtual = produtos[index];
        renderizarProduto(produtoAtual);
        atualizarListaProdutos();
}

async function publicarTelegram(){

    if(!produtoAtual){
        alert("Busque um produto primeiro.");
        return;
    }

    produtoAtual.descricao =
        document.getElementById("descricao").value;

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
            alert("✅ Oferta enviada para o Telegram!");
        }else{
            alert("Erro ao publicar.");
        }

    }catch(erro){
        console.error(erro);
        alert("Erro ao enviar para o Telegram.");
    }
}
