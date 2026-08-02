// ============================================================
// INTERFACE.JS — abas, tema, modo desenvolvimento e bloqueio de tela
// ============================================================

// Controle de abas (OF-013: separar telas para reduzir poluição visual)
function mudarAba(nome){
        const abas = ["inicio", "buscar", "dia", "painel"];

        abas.forEach(aba => {
                document.getElementById(`aba-${aba}`).style.display =
                        aba === nome ? "block" : "none";
                document.getElementById(`abaBotao-${aba}`).classList.toggle(
                        "ativa",
                        aba === nome
                );
        });
}

function atualizarInterface(){
        atualizarListaProdutos();
        atualizarProximoProduto();
        atualizarEstatisticasDesconto();
        salvarFila();
        atualizarQualidadeFila();
        atualizarEconomiaFila();
        atualizarPainelControle();
        atualizarOfertaDoDia();
        atualizarDashboard();
        salvarSessao();
}

function bloquearInterface(){

    if(!document.getElementById("btnBuscar")){
        console.error("btnBuscar não encontrado");
        return;
    }

    if(!document.getElementById("btnTelegram")){
        console.error("btnTelegram não encontrado");
        return;
    }

    document.getElementById("btnBuscar").disabled = true;
    document.getElementById("btnTelegram").disabled = true;
    document.getElementById("overlayProcessamento").style.display = "flex";
}

function liberarInterface(){
        document.getElementById("btnBuscar").disabled = false;
        document.getElementById("btnTelegram").disabled = false;
        document.getElementById("overlayProcessamento").style.display = "none";
}

// OF-085: tema escuro
function alternarTema(){
        const escuro = document.body.classList.toggle("tema-escuro");
        localStorage.setItem("temaOfertaFlow", escuro ? "escuro" : "claro");
        document.getElementById("btnTema").textContent = escuro ? "Tema claro" : "Tema escuro";
}

function carregarTema(){
        const salvo = localStorage.getItem("temaOfertaFlow");
        if(salvo === "escuro"){
                document.body.classList.add("tema-escuro");
                document.getElementById("btnTema").textContent = "Tema claro";
        }
}

// Alternar rapidamente entre Modo Desenvolvimento (simula publicação) e Ao Vivo (publica de verdade)
function alternarModoDesenvolvimento(){
        if(MODO_DESENVOLVIMENTO){
                if(!confirm("Isso vai DESATIVAR o Modo Desenvolvimento.\n\nAs próximas publicações vão sair de verdade no Telegram. Continuar?")){
                        return;
                }
        }

        MODO_DESENVOLVIMENTO = !MODO_DESENVOLVIMENTO;
        localStorage.setItem("modoDesenvolvimentoOfertaFlow", MODO_DESENVOLVIMENTO ? "on" : "off");
        atualizarBotaoModoDesenvolvimento();
        mostrarToast(MODO_DESENVOLVIMENTO ? "Modo Desenvolvimento ativado" : "⚠️ Modo Ao Vivo ativado — publicações são reais");
}

function atualizarBotaoModoDesenvolvimento(){
        const botao = document.getElementById("btnModoDev");
        botao.textContent = MODO_DESENVOLVIMENTO ? "Modo: Desenvolvimento" : "Modo: Ao Vivo";
        botao.classList.toggle("aviso-ao-vivo", !MODO_DESENVOLVIMENTO);
}

function carregarModoDesenvolvimento(){
        const salvo = localStorage.getItem("modoDesenvolvimentoOfertaFlow");
        if(salvo !== null){
                MODO_DESENVOLVIMENTO = salvo === "on";
        }
        atualizarBotaoModoDesenvolvimento();
}
