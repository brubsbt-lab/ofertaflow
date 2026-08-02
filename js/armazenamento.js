// ============================================================
// ARMAZENAMENTO.JS — persistência local (localStorage) e backup
// ============================================================

function salvarFila(){
        localStorage.setItem(
                "filaOfertaFlow",
                JSON.stringify(produtos)
        );
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
                selecionarProduto(indice, true);
        }

        if(diaPreparado.length > 0){
                renderizarPreparacaoDia(diaPreparado, 0);
        }
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

// OF-086/112/113: backup completo (fila, preparar o dia e histórico) em um arquivo JSON
function exportarBackup(){
        const dados = {
                versao: 1,
                exportadoEm: new Date().toISOString(),
                produtos: produtos,
                diaPreparado: diaPreparado,
                historicoPublicacoes: historicoPublicacoes,
                publicados: publicados,
                falhas: falhas,
                ultimaPublicacao: ultimaPublicacao,
                logErros: logErros
        };

        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dataArquivo = new Date().toISOString().slice(0, 10);

        link.href = url;
        link.download = `ofertaflow-backup-${dataArquivo}.json`;
        link.click();

        URL.revokeObjectURL(url);
        mostrarToast("Backup exportado!");
}

function importarBackup(evento){
        const arquivo = evento.target.files[0];
        if(!arquivo){
                return;
        }

        const leitor = new FileReader();
        leitor.onload = () => {
                try{
                        const dados = JSON.parse(leitor.result);

                        if(!confirm("Isso vai substituir a fila, o Preparar o Dia e o histórico atuais pelos do backup. Continuar?")){
                                return;
                        }

                        produtos = dados.produtos || [];
                        diaPreparado = dados.diaPreparado || [];
                        historicoPublicacoes = dados.historicoPublicacoes || [];
                        publicados = dados.publicados || 0;
                        falhas = dados.falhas || 0;
                        ultimaPublicacao = dados.ultimaPublicacao || null;
                        logErros = dados.logErros || [];
                        indiceSelecionado = produtos.length > 0 ? 0 : -1;

                        salvarHistoricoPublicacoes();
                        atualizarHistoricoPublicacoes();
                        atualizarInterface();
                        if(produtos.length > 0){
                                selecionarProduto(0, true);
                        }
                        if(diaPreparado.length > 0){
                                renderizarPreparacaoDia(diaPreparado, 0);
                        }

                        mostrarToast("Backup importado!");
                }catch(erro){
                        console.error(erro);
                        mostrarToast("Arquivo de backup inválido.", "erro");
                }
        };
        leitor.readAsText(arquivo);
        evento.target.value = "";
}
