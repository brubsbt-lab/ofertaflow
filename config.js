// ============================================================
// CONFIG.JS — Estado global e constantes do OfertaFlow
// ============================================================

let produtoAtual = null;
let historico = [];


let publicados = 0;

let indiceSelecionado = -1;

let produtos = [];

// OF-011: configuração da preparação do dia
const DIA_HORA_INICIO = 9;
const DIA_HORA_FIM = 21;
const DIA_INTERVALO_BASE = 30;
const DIA_VARIACAO = 8;

let diaPreparado = [];

// OF-013: estado do Painel de Controle
let falhas = 0;
let ultimaPublicacao = null;
let logErros = [];
let historicoPublicacoes = [];

const CATEGORIA_MARCA = {
        // "Chanel": "SS", "Louis Vuitton": "SS", "Gucci": "SS", "Prada": "SS",
        // "Jimmy Choo": "SS", "Christian Louboutin": "SS", "Balenciaga": "SS",
        // "Saint Laurent": "SS", "Aquazzura": "SS", "Mach & Mach": "SS",
        // "Manolo Blahnik": "SS", "Miu Miu": "SS", "Giuseppe Zanotti": "SS",
        // "Valentino": "SS", "Dolce & Gabbana": "SS", "Fendi": "SS",
        // "Salvatore Ferragamo": "SS",

        // "Timberland": "S", "Emporio Armani": "S", "Kate Spade": "S",
        // "Zeferino": "S", "Tory Burch": "S", "Michael Kors": "S", "UGG": "S",

        "Luiza Barcelos": "A", "Carmen Steffens": "A", "Animale": "A",
        "Guess": "A", "Cecconelo": "A", "Carrano": "A", "Arezzo": "A",
        "Ellus": "A", "Schutz": "A", "Santa Lolla": "A", "Capodarte": "A",
        "Lança Perfume": "A", "Dumond": "A", "Corello": "A",
        "Loucos & Santos": "A", "Constance": "A", "Jorge Bischoff": "A",

        "Via Marte": "B", "Via Uno": "B", "Luz da Lua": "B", "AnaCapri": "B",
        "Bottero": "B", "Usaflex": "B", "Crocs": "B",

        "Ramarim": "C", "Beira Rio": "C", "Dakota": "C", "Modare": "C",
        "Vizzano": "C", "Havaianas": "C", "Moleca": "C", "Melissa": "C"
};

const PESO_CATEGORIA = {
        // SS: 100,
        // S: 80,
        A: 60,
        B: 40,
        C: 20
};

const PESO_MARCA_PADRAO = 30; // marca fora da tabela

const ICONE_CATEGORIA = [
        { termo: "sandália", icone: "👡", hashtag: "sandalia" },
        { termo: "sandalia", icone: "👡", hashtag: "sandalia" },
        { termo: "anabela", icone: "👡", hashtag: "anabela" },
        { termo: "scarpin", icone: "👠", hashtag: "scarpin" },
        { termo: "mule", icone: "👠", hashtag: "mule" },
        { termo: "salto", icone: "👠", hashtag: "saltoalto" },
        { termo: "tênis", icone: "👟", hashtag: "tenis" },
        { termo: "tenis", icone: "👟", hashtag: "tenis" },
        { termo: "bota", icone: "👢", hashtag: "bota" },
        { termo: "sapatilha", icone: "🥿", hashtag: "sapatilha" },
        { termo: "chinelo", icone: "🩴", hashtag: "chinelo" },
        { termo: "rasteira", icone: "🩴", hashtag: "rasteira" },
        { termo: "papete", icone: "🩴", hashtag: "papete" }
];
const ICONE_CATEGORIA_PADRAO = "👠";

let MODO_DESENVOLVIMENTO = true;

const produtosTeste = [
        {
                nome: "Sandália Feminina Santa Lolla Salto Bloco Caramelo",
                marca: "Santa Lolla",
                precoOriginal: "199.90",
                precoAtual: "104.99",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Scarpin Schutz Verniz Preto",
                marca: "Schutz",
                precoOriginal: "359.90",
                precoAtual: "179.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Tênis Jorge Bischoff Croco Off White",
                marca: "Jorge Bischoff",
                precoOriginal: "499.90",
                precoAtual: "249.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Bota Arezzo Cano Curto",
                marca: "Arezzo",
                precoOriginal: "699.90",
                precoAtual: "349.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Sandália Via Marte Nude",
                marca: "Via Marte",
                precoOriginal: "189.90",
                precoAtual: "99.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Sapatilha Cecconelo Verniz Nude",
                marca: "Cecconelo",
                precoOriginal: "159.90",
                precoAtual: "119.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Chinelo Havaianas Slim",
                marca: "Havaianas",
                precoOriginal: "49.90",
                precoAtual: "34.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Bota Carmen Steffens Cano Longo",
                marca: "Carmen Steffens",
                precoOriginal: "599.90",
                precoAtual: "269.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Tênis Vizzano Chunky Branco",
                marca: "Vizzano",
                precoOriginal: "259.90",
                precoAtual: "142.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Sandália Capodarte Salto Fino",
                marca: "Capodarte",
                precoOriginal: "329.90",
                precoAtual: "115.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Scarpin Carrano Couro Preto",
                marca: "Carrano",
                precoOriginal: "279.90",
                precoAtual: "78.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Mule Dumond Verniz",
                marca: "Dumond",
                precoOriginal: "349.90",
                precoAtual: "62.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        },
        {
                nome: "Papete Melissa Transparente",
                marca: "Melissa",
                precoOriginal: "179.90",
                precoAtual: "89.90",
                imagem: "https://static.dafiti.com.br/p/Santa-Lolla-Sandalia-Feminina-Santa-Lolla-Salto-Bloco-Caramelo-7806-17271841-1-zoom.jpg"
        }
];

let filtroFila = "todos";
let buscaFila = "";

const HISTORICO_PUBLICACOES_LIMITE = 200;
