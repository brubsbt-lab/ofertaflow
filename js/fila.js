// ============================================================
// FILA.JS — gerenciamento da fila de produtos
// ============================================================

// OF-102: utilitárias da fila (limparFila, duplicarProduto, removerProduto, etc.
// estão todas neste arquivo, cada uma cuidando de uma única responsabilidade)
function limparFila(){
        produtos = [];
        indiceSelecionado = -1;
        publicados = 0;
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

// OF-114: duplicar um produto da fila (útil quando quer postar o mesmo item em dois horários)
function duplicarProduto(indice){
        const copia = { ...produtos[indice] };
        produtos.splice(indice + 1, 0, copia);
        atualizarInterface();
        mostrarToast("Produto duplicado!");
}

// OF-080: embaralhar a ordem da fila (Fisher-Yates), preservando qual produto está selecionado
function embaralharFila(){
        if(produtos.length < 2){
                return;
        }
        if(!confirm("Embaralhar a ordem da fila?")){
                return;
        }

        const produtoSelecionado = indiceSelecionado >= 0 ? produtos[indiceSelecionado] : null;

        for(let i = produtos.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * (i + 1));
                [produtos[i], produtos[j]] = [produtos[j], produtos[i]];
        }

        if(produtoSelecionado){
                indiceSelecionado = produtos.indexOf(produtoSelecionado);
        }

        atualizarInterface();
        mostrarToast("Fila embaralhada!");
}

function filtrarFila(valor){
        filtroFila = valor;
        atualizarListaProdutos();
}

// OF-115: pesquisa por nome ou marca dentro da fila
function pesquisarFila(valor){
        buscaFila = valor.trim().toLowerCase();
        atualizarListaProdutos();
}

function ordenarFila(criterio){
        if(criterio === "manual"){
                return;
        }

        const produtoSelecionado = indiceSelecionado >= 0 ? produtos[indiceSelecionado] : null;

        if(criterio === "desconto"){
                produtos.sort((a, b) => b.desconto - a.desconto);
        }else if(criterio === "score"){
                produtos.sort((a, b) => calcularScore(b).valor - calcularScore(a).valor);
        }else if(criterio === "nome"){
                produtos.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        }

        if(produtoSelecionado){
                indiceSelecionado = produtos.indexOf(produtoSelecionado);
        }

        atualizarInterface();
}

function atualizarListaProdutos(){
        const lista =
                document.getElementById("listaProdutos");
        
        lista.innerHTML = "";
        
        produtos.forEach((produto,index)=>{
                if(filtroFila !== "todos" && obterFaixaFiltro(produto.desconto) !== filtroFila){
                        return;
                }
                if(buscaFila && !(
                        produto.nome.toLowerCase().includes(buscaFila) ||
                        (produto.marca || "").toLowerCase().includes(buscaFila)
                )){
                        return;
                }

                const score = calcularScore(produto);

                const avisos = [];
                if(produtoJaPublicado(produto)){
                        avisos.push(selo("Já publicado antes", "medio"));
                }
                if(contarUrlNaFila(produto.url) > 1){
                        avisos.push(selo("Link duplicado", "alto"));
                }

                lista.innerHTML +=`
                <div class="produto-item ${
                        index === indiceSelecionado ? "selecionado" : ""
                }" data-indice="${index}">
                <span class="arrastar">⠿</span>
                <strong>${index + 1}º</strong> - ${obterIconeCategoria(produto.nome)} ${produto.nome}
                <br>
                ${produto.desconto}% OFF · Score ${score.valor} ${selo(score.texto, score.nivel)}
                ${avisos.length > 0 ? "<br>" + avisos.join(" ") : ""}
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
                
                <button onclick="duplicarProduto(${index})">
                ⧉
                </button>
                
                <button onclick="removerProduto(${index})">
                ❌
                </button>
                `;
        });
        document.getElementById("tituloFila").innerHTML =
                `Produtos carregados (${produtos.length})`;

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

function atualizarProximoProduto(){
        const elemento =
                document.getElementById("nomeProximo");
        if(produtos.length === 0){
                elemento.innerHTML = "Fila vazia";
                return;
        }
        elemento.innerHTML = `${obterIconeCategoria(produtos[0].nome)} ${produtos[0].nome}`;
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
                        
                        limparFila();
                }
        } 
        bloquearInterface();

        let sucessosImportacao = 0;
        let falhasImportacao = 0;

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
                        sucessosImportacao++;
                        
                } catch (erro) {
                        console.error(erro);
                        falhasImportacao++;
                        document.getElementById("statusBusca").style.display = "none";
                }
        }
        if(produtos.length > 0){

    selecionarProduto(0);
        }
        publicados = 0;
        

        document.getElementById("statusBusca").style.display = "none";
        
        liberarInterface();
        
        mostrarToast(
                falhasImportacao > 0
                        ? `${sucessosImportacao} de ${urls.length} importado(s), ${falhasImportacao} falhou/falharam.`
                        : `${sucessosImportacao} produto(s) encontrado(s)!`,
                falhasImportacao > 0 ? "erro" : undefined
        );
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

        const falhasBusca = urls.length - produtosDoDia.length;
        if(falhasBusca > 0){
                mostrarToast(`${produtosDoDia.length} de ${urls.length} importado(s), ${falhasBusca} falhou/falharam.`, "erro");
        }

        const minutoFimBase = DIA_HORA_FIM * 60;
        const minutoInicioBase = DIA_HORA_INICIO * 60;
        let minutoInicio;

        if(manterAnteriores && diaPreparado.length > 0){
                const ultimoItem = diaPreparado[diaPreparado.length - 1];
                const [h, m] = ultimoItem.horario.split(":").map(Number);
                const jitter = Math.round((Math.random() * 2 - 1) * DIA_VARIACAO);
                const proximoMinuto = (h * 60 + m) + DIA_INTERVALO_BASE + jitter;

                // Se não coube mais no período de hoje, começa às 9h do próximo dia em vez de espremer no fim.
                minutoInicio = proximoMinuto < minutoFimBase ? proximoMinuto : minutoInicioBase;
        }else{
                const agora = new Date();
                const agoraMin = agora.getHours() * 60 + agora.getMinutes();

                // Dentro do período (9h-21h): começa a partir de agora. Fora do período (antes das 9h
                // ou depois das 21h): começa às 9h (hoje, se ainda não chegou lá, ou do próximo dia).
                minutoInicio = (agoraMin > minutoInicioBase && agoraMin < minutoFimBase)
                        ? Math.ceil(agoraMin / 5) * 5
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

function renderizarPreparacaoDia(itens, naoCoube){
        const resultado = document.getElementById("resultadoPreparacaoDia");
        const lista = document.getElementById("listaHorariosDia");

        if(itens.length === 0){
                resultado.innerHTML = "Nenhum produto preparado.";
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
                aviso = `<br>${naoCoube} produto${naoCoube !== 1 ? "s" : ""} não coube${naoCoube !== 1 ? "ram" : ""} no período (09h–21h). Reduza a fila, diminua o intervalo ou prepare o restante amanhã.`;
        }

        resultado.innerHTML = `
                ${itens.length} produto${itens.length !== 1 ? "s" : ""} · ${primeiro} às ${ultimo} · dura ${horasDuracao}h${minutosDuracao > 0 ? minutosDuracao + "min" : ""}
                ${aviso}
        `;

        lista.innerHTML = itens.map((item, i) =>
                `<div class="produto-item">
                        <strong>${item.horario}</strong> — ${item.nome}
                </div>`
        ).join("");
}
