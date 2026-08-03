// ============================================================
// UTILITARIOS.JS — funções puras/auxiliares (OF-102)
// ============================================================

let toastTimeout = null;

function mostrarToast(mensagem, tipo){
        const toast = document.getElementById("toast");
        toast.textContent = mensagem;
        toast.className = tipo === "erro" ? "mostrar erro" : "mostrar";

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
                toast.className = "";
        }, 3000);
}

function obterIconeCategoria(nome){
        const nomeMin = (nome || "").toLowerCase();
        for(const item of ICONE_CATEGORIA){
                if(nomeMin.includes(item.termo)){
                        return item.icone;
                }
        }
        return ICONE_CATEGORIA_PADRAO;
}

function calcularScore(produto){
        const categoria = CATEGORIA_MARCA[produto.marca];
        const pesoMarca = categoria ? PESO_CATEGORIA[categoria] : PESO_MARCA_PADRAO;
        const valor = Math.round((produto.desconto * 0.7) + (pesoMarca * 0.3));

        let nivel = "";
        let texto = "";
        if(valor >= 70){
                nivel = "alto";
                texto = "Alto";
        }else if(valor >= 40){
                nivel = "medio";
                texto = "Médio";
        }else{
                nivel = "baixo";
                texto = "Baixo";
        }

        return { valor, nivel, texto };
}

// Selo colorido reutilizável (substitui os antigos emojis 🔴🟡🟢)
function selo(texto, nivel){
        return `<span class="selo selo-${nivel}">${texto}</span>`;
}

function formatarPreco(valor){
        return Number(valor).toLocaleString("pt-BR",{
                minimumFractionDigits:2,
                maximumFractionDigits:2
        });
}

// OF-017: rótulo automático da legenda conforme a faixa de desconto
function obterRotuloOferta(desconto){
        if(desconto >= 80){
                return "🚨 Oferta Relâmpago";
        }
        if(desconto >= 70){
                return "👑 Oferta Imperdível";
        }
        if(desconto >= 60){
                return "💥 Super Oferta";
        }
        return "🔥 Oferta";
}

// Parse Mode = HTML no Telegram: só precisa escapar & < > " pra não quebrar as tags de formatação
function escaparHTML(texto){
        return String(texto ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
}

function obterFaixaFiltro(desconto){
        if(desconto >= 80) return "relampago";
        if(desconto >= 70) return "imperdivel";
        if(desconto >= 60) return "super";
        return "oferta";
}

function minutosParaHora(minutos){
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

// ID único por item, necessário pra Data Store do Make identificar cada registro
function gerarIdUnico(){
        if(typeof crypto !== "undefined" && crypto.randomUUID){
                return crypto.randomUUID();
        }
        return `id-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

// Gera horários de postagem entre o início e o fim, variando o intervalo
// para não ficar sempre exatamente de 30 em 30 minutos.
function calcularHorarios(qtdProdutos, minutoInicio, minutoFim, intervaloBase, variacao){
        const horarios = [];
        let minutoAtual = minutoInicio;

        for(let i = 0; i < qtdProdutos; i++){
                if(minutoAtual > minutoFim){
                        break;
                }
                horarios.push(minutoAtual);
                const jitter = Math.round((Math.random() * 2 - 1) * variacao);
                minutoAtual += intervaloBase + jitter;
        }

        return horarios;
}
