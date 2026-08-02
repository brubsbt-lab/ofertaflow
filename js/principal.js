// ============================================================
// PRINCIPAL.JS — ponto de entrada único da aplicação (OF-101)
// ============================================================

// Reúne tudo que precisa rodar quando o app abre, numa ordem clara e previsível.
function inicializarSistema(){
        document.getElementById("descricao")
                .addEventListener("input", salvarDescricaoAtual);

        carregarModoDesenvolvimento();
        carregarTema();
        carregarHistoricoPublicacoes();
        carregarFila();
}

inicializarSistema();
