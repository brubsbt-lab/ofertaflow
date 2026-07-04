let produtoAtual = null;

let produtos = [];
        
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
                        const dados = await resposta.json();
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
                        atualizarListaProdutos();
                } catch (erro) {
                        console.error(erro);
                }
        }
        alert(`${produtos.length} produto(s) encontrado(s)!`);
}

function atualizarListaProdutos(){
        const lista =
                document.getElementById("listaProdutos");
        
        lista.innerHTML = "";
        
        produtos.forEach((produto,index)=>{
                lista.innerHTML +=`
                <div class="produto-item">
                <strong>${produto.nome}</strong>
                <br>
                🔥 ${produto.desconto}% OFF
                <br><br>
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
}

function removerProduto(index){
        produtos.splice(index,1);
        
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
