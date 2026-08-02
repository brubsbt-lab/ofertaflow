// ============================================================
// PUBLICACAO.JS — envio ao Telegram/Make e fluxo de publicação
// ============================================================

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
                        score: score.valor,
                        url: produto.url || ""
                });

                salvarHistoricoPublicacoes();
                atualizarHistoricoPublicacoes();
        }else{
                falhas++;
                logErros.unshift(`${hora} - Falha: ${produto.nome}`);
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
                if(produtos.length > 0){
                        selecionarProduto(Math.min(indice, produtos.length - 1), true);
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
                if(produtos.length > 0){
                        selecionarProduto(0, true);
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
                if(produtos.length > 0){
                        selecionarProduto(Math.min(indice, produtos.length - 1), true);
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
