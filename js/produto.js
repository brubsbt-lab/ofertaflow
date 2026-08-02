// ============================================================
// PRODUTO.JS — geração de descrição, renderização e ações do produto
// ============================================================

function renderizarProduto(produto){
        document.getElementById("nome").innerHTML =
                `${obterIconeCategoria(produto.nome)} ${produto.nome}`;
        document.getElementById("original").innerHTML =
                `De: R$ ${formatarPreco(produto.precoOriginal)}`;
        document.getElementById("atual").innerHTML =
                `Por: R$ ${formatarPreco(produto.precoAtual)}`;
        document.getElementById("imagem").src = produto.imagem;
        document.getElementById("imagem").style.display = "block";
        document.getElementById("descricao").value =
                produto.descricao;

        const score = calcularScore(produto);
        document.getElementById("infoOferta").innerHTML =
                `${produto.desconto}% OFF · Score ${score.valor} ${selo(score.texto, score.nivel)}`;
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

// Legenda única e padronizada: Tipo de oferta / Descrição / Desconto / De (riscado) / Por (negrito) / Link
function gerarDescricao(produto){
        const nome = escaparHTML(`${obterIconeCategoria(produto.nome)} ${produto.nome}`);
        const precoOriginal = escaparHTML(formatarPreco(produto.precoOriginal));
        const precoAtual = escaparHTML(formatarPreco(produto.precoAtual));
        const url = escaparHTML(produto.url);

        return `${obterRotuloOferta(produto.desconto)}

${nome}

🔻 ${produto.desconto}% OFF

De: <s>R$ ${precoOriginal}</s>
Por: <b>R$ ${precoAtual}</b>

🔗 <a href="${url}">Ver oferta</a>`;
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
        const nome = escaparHTML(`${obterIconeCategoria(produto.nome)} ${produto.nome}`);
        const precoOriginal = escaparHTML(formatarPreco(produto.precoOriginal));
        const precoAtual = escaparHTML(formatarPreco(produto.precoAtual));
        const url = escaparHTML(produto.url);

        return `🏆 OFERTA DO DIA

${nome}

🔻 ${produto.desconto}% OFF

De: <s>R$ ${precoOriginal}</s>
Por: <b>R$ ${precoAtual}</b>

🔗 <a href="${url}">Ver oferta</a>`;
}

// OF-040: garante que o link do produto sempre apareça na legenda enviada,
// mesmo que a descrição tenha sido editada manualmente e o link removido por engano
function garantirUrlNaDescricao(produto){
        const urlEscapada = escaparHTML(produto.url);
        if(produto.url && !produto.descricao.includes(urlEscapada)){
                produto.descricao = `${produto.descricao}\n\n🔗 <a href="${urlEscapada}">Ver oferta</a>`;
        }
        return produto;
}

function produtoJaPublicado(produto){
        return historicoPublicacoes.some(item => item.url && item.url === produto.url);
}

function contarUrlNaFila(url){
        return produtos.filter(p => p.url === url).length;
}

// OF-110: pré-visualização de como a legenda vai aparecer no Telegram (negrito/riscado renderizados)
function renderizarPreviaMarkdown(texto){
        return texto.replace(/\n/g, "<br>");
}

function mostrarPreviaPublicacao(){
        const painel = document.getElementById("previaPublicacao");

        if(painel.style.display === "block"){
                painel.style.display = "none";
                return;
        }

        if(indiceSelecionado < 0 || !produtos[indiceSelecionado]){
                mostrarToast("Selecione um produto primeiro.", "erro");
                return;
        }

        const produto = produtos[indiceSelecionado];
        const texto = document.getElementById("descricao").value;
        const html = renderizarPreviaMarkdown(texto);

        painel.innerHTML = `
                <img src="${produto.imagem}" style="max-width:100%;border-radius:8px;margin-bottom:8px;">
                <div>${html}</div>
        `;
        painel.style.display = "block";
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

// OF-072: copiar apenas o link do produto selecionado, sem o resto da legenda
async function copiarLink(){
        if(indiceSelecionado < 0 || !produtos[indiceSelecionado]){
                mostrarToast("Selecione um produto primeiro.", "erro");
                return;
        }

        const url = produtos[indiceSelecionado].url;

        try{
                if(navigator.clipboard && window.isSecureContext){
                        await navigator.clipboard.writeText(url);
                        mostrarToast("✅ Link copiado!");
                }else{
                        throw new Error("clipboard indisponível");
                }
        }catch(erro){
                console.error(erro);
                mostrarToast("Não foi possível copiar automaticamente: " + url, "erro");
        }
}
