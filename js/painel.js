// ============================================================
// PAINEL.JS — dashboard, painel de controle e estatísticas
// ============================================================

function atualizarOfertaDoDia(){
        const elemento = document.getElementById("ofertaDoDia");
        const botao = document.getElementById("btnPublicarOfertaDoDia");
        const oferta = obterOfertaDoDia();

        if(!oferta){
                elemento.innerHTML = "Nenhuma oferta na fila.";
                botao.disabled = true;
                return;
        }

        const score = calcularScore(oferta);

        elemento.innerHTML = `
                <strong>${obterIconeCategoria(oferta.nome)} ${oferta.nome}</strong><br>
                ${oferta.marca ? oferta.marca + " · " : ""}${oferta.desconto}% OFF · Score ${score.valor} ${selo(score.texto, score.nivel)}
        `;
        botao.disabled = false;
}

// OF-068/069: dashboard inicial com o resumo geral do app
function atualizarDashboard(){
        const resumo = document.getElementById("dashboardResumo");

        const proxima = diaPreparado.length > 0
                ? `${diaPreparado[0].horario} — ${diaPreparado[0].nome}`
                : "Nenhuma agendada";

        const ultima = ultimaPublicacao
                ? `${ultimaPublicacao.hora} - ${ultimaPublicacao.nome}`
                : "Nenhuma ainda";

        resumo.innerHTML = `
                Pendentes na fila: <b>${produtos.length}</b><br>
                Publicados: <b>${publicados}</b><br>
                Falhas: <b>${falhas}</b><br>
                Última publicação: <b>${ultima}</b><br>
                Próxima publicação agendada: <b>${proxima}</b>
        `;

        const elementoOferta = document.getElementById("dashboardOfertaDoDia");
        const oferta = obterOfertaDoDia();

        if(!oferta){
                elementoOferta.innerHTML = "Nenhuma oferta na fila.";
                return;
        }

        const score = calcularScore(oferta);
        elementoOferta.innerHTML = `
                <strong>${obterIconeCategoria(oferta.nome)} ${oferta.nome}</strong><br>
                ${oferta.desconto}% OFF · Score ${score.valor} ${selo(score.texto, score.nivel)}
        `;
}

// OF-013: Painel de Controle — visão geral de pendentes, publicados, falhas e última publicação
function atualizarPainelControle(){
        const painel = document.getElementById("painelControle");

        const ultima = ultimaPublicacao
                ? `${ultimaPublicacao.hora} - ${ultimaPublicacao.nome}`
                : "Nenhuma ainda";

        painel.innerHTML = `
                Pendentes: <b>${produtos.length}</b><br>
                Publicados: <b>${publicados}</b><br>
                Falhas: <b>${falhas}</b><br>
                Última publicação: <b>${ultima}</b>
        `;

        const log = document.getElementById("logErros");
        if(logErros.length === 0){
                log.innerHTML = "";
        }else{
                log.innerHTML = `
                        <br><b>Log de erros</b><br>
                        ${logErros.join("<br>")}
                `;
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
                Oferta: <b>${faixa40}</b><br>
                Super Oferta: <b>${faixa60}</b><br>
                Oferta Imperdível: <b>${faixa70}</b><br>
                Oferta Relâmpago: <b>${faixa80}</b>
        `;
}

function atualizarQualidadeFila(){

    if(produtos.length === 0){
        document.getElementById("qualidadeFila").innerHTML =
            "Fila vazia";
        return;
    }

    const media =
        produtos.reduce(
            (soma, produto) => soma + produto.desconto,
            0
        ) / produtos.length;

    let qualidade = "";

    if(media >= 80){
        qualidade = selo("Excelente", "alto");
    }else if(media >= 60){
        qualidade = selo("Boa", "medio");
    }else{
        qualidade = selo("Regular", "baixo");
    }

    document.getElementById("qualidadeFila").innerHTML =
        `Qualidade da fila: ${qualidade}`;
}

function atualizarEconomiaFila(){

    let economia = 0;

    for(const produto of produtos){
        economia +=
            Number(produto.precoOriginal) -
            Number(produto.precoAtual);
    }

    document.getElementById("economiaFila").innerHTML =
        `Economia total: <b>R$ ${formatarPreco(economia)}</b>`;
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

function atualizarHistoricoPublicacoes(){
        const elemento = document.getElementById("historicoPublicacoes");

        if(historicoPublicacoes.length === 0){
                elemento.innerHTML = "Nenhuma publicação registrada ainda.";
                return;
        }

        elemento.innerHTML = historicoPublicacoes.map(item => `
                <div class="produto-item">
                        <strong>${item.data} ${item.hora}</strong> — ${item.nome}${item.marca ? " · " + item.marca : ""}
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
