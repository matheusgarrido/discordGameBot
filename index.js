const Discord = require("discord.js");
const Canal = require("./canal.js");
const QuemSouEu = require("./jogos/quemsoueu.js");

const bot = new Discord.Client();
const token = "NzE5NjE5NTU5MDA2NTM1Njgw.Xt6Fbg.y1umpmXNziyyTp5OrY3Pq6Fa_7Y";
bot.login(token);

//Textos
mensagemJSON = null;
var mensagensBR = require('./dicionario/pt-br.json');

if ("br" === "br"){
    mensagemJSON = mensagensBR;
}

bot.on('ready', ()=>{
    console.log('Estou pronto para ser usado');
    bot.user.setActivity("-gb help", {type: "PLAYING"});
});
var jogo = 0;
var nomeJogo = "";
//Dados do usuário, personagem
var jogadores = [];
canais = [];
bot.on('message', msg=>{
    if (msg.author.id!=bot.user.id){
        var prefixo = "-gb";
        var texto = msg.content.toLowerCase();
        if (texto.startsWith("-gamebot")){
            prefixo = "-gamebot";
        }
        //Se for no canal coletivo
        if(msg.channel.type === "text"){
            //Comandos   
            if (texto.startsWith(prefixo)){
                // 1. Quem Sou Eu
                if (texto.startsWith(prefixo + " who")){
                    verificarNovoJogo(msg, 1, mensagemJSON.jogoQuemSouEu);
                }
                else if (texto.startsWith(prefixo + " password")){
                    verificarNovoJogo(msg, 2, mensagemJSON.jogoSenha);
                }
                //Lista de comandos
                else if (texto.startsWith(prefixo + " help")){
                    msg.channel.send(
                        mensagemJSON.listaComandos + "\n\n" + listaComandos()
                    );
                }
                //Lista de jogos
                else if(texto.startsWith(prefixo + " games")){
                    msg.channel.send(
                        mensagemJSON.listaJogos + "\n" + listaJogos()
                    );
                }
                //Entrar na partida
                else if(texto.startsWith(prefixo + " join")){
                    //Verificar se existe partida
                    pos = verificarPartida(msg.channel);
                    if (pos<0){
                        msg.channel.send(mensagemJSON.nenhumJogo);
                    }
                    else{
                        //Se o jogador não estiver na partida, será adicionado
                        jogadorEncontrado = verificarJogador(pos, msg.author.id);
                        if (jogadorEncontrado < 0){
                            msg.reply(mensagemJSON.jogadorJoin);
                            canais[pos].jogadores.push({"usuario": msg.author});
                        }
                    }
                }
                //Iniciar partida
                else if(texto.startsWith(prefixo + " start")){
                    pos = verificarPartida(msg.channel);
                    //Verificar se foi selecionado algum jogo
                    if (pos<0){
                        msg.channel.send(mensagemJSON.nenhumJogo);
                    }
                    // Verificar só há o anfitrião no jogo
                    else if (canais[pos].jogadores.length === 1) {
                        msg.channel.send(mensagemJSON.salaSozinho);
                    }
                    // Iniciar partida
                    else if (canais[pos].jogadores.length > 1){
                        canais[pos].partidaStart();
                    }
                }
                //Cancelar partida
                else if(texto.startsWith(prefixo + " cancel")){
                    //Verificar se foi selecionado algum jogo
                    pos = verificarPartida(msg.channel);
                    if (pos<0){
                        msg.channel.send(mensagemJSON.nenhumJogo);
                    }
                    //Verificar se a partida já está acontecendo
                    else if(canais[pos].partidaIniciada===1){
                        msg.channel.send(mensagemJSON.bloquearCancel);
                    }
                    //Excluir/cancelar partida
                    else if (canais[pos]){
                        canais.splice(pos, 1);
                        msg.channel.send(msg.author.username + " " + mensagemJSON.jogadorCancel);
                    }
                }
                //Sair da partida
                else if (texto.startsWith(prefixo + " leave")){
                    //Verificar se existe partida
                    posCanal = verificarPartida(msg.channel);
                    if (posCanal<0){
                        msg.channel.send(mensagemJSON.nenhumJogo);
                    }
                    else{
                        //Se o jogador estiver na partida, será excluído
                        posJogador = verificarJogador(posCanal, msg.author.id);
                        if (posJogador >= 0){
                            canais[posCanal].canal.send(msg.author.username + " " + mensagemJSON.jogadorLeave);
                            canais[posCanal].jogadores.splice(posJogador, 1);
                            //Se não houver mais nenhum jogador, a partida será encerrada
                            if (canais[posCanal].jogadores.length ===0 ){
                                canais.splice(posCanal, 1);
                                msg.channel.send(mensagemJSON.salaVazia, { tts: true });
                            }
                            else{
                                //Atribuir novo dono à sala
                                if (posJogador==0){
                                    canais[posCanal].canal.send(
                                        canais[posCanal].jogadores[posJogador].username +
                                        " " + mensagemJSON.novoDono
                                    );
                                }
                            }
                        }
                    }
                }
                //Encerrar partida
                else if (texto.startsWith(prefixo + " end")){
                    //Verificar se existe partida
                    posCanal = verificarPartida(msg.channel);
                    if (posCanal<0){
                        msg.channel.send(mensagemJSON.nenhumJogo);
                    }
                    else{
                        //Se o jogador for o líder da sala, poderá excluir
                        posJogador = verificarJogador(posCanal, msg.author.id);
                        if (posJogador === 0){
                            canais[posCanal].canal.send(msg.author.username + " " + mensagemJSON.jogadorEnd, { tts: true });
                            canais.splice(posCanal, 1);
                        }
                        //Se o jogador não for líder, será bloqueado da ação
                        else {
                            canais[posCanal].canal.send(mensagemJSON.jogadorEndCancel);
                        }
                    }
                }
                else if(texto.startsWith(prefixo + " done")){
                    //Verificar se existe partida
                    posCanal = verificarPartida(msg.channel);
                    if (posCanal<0){
                        msg.channel.send(mensagemJSON.nenhumJogo);
                    }
                    else{
                        canais[posCanal].jogo.partida.dm(posCanal, msg, prefixo);
                    }
                }
                //Lista de comandos
                else {
                    msg.channel.send(
                        "\t" + mensagemJSON.listaComandos + "\n\n" +
                        listaComandos()
                    );
                }
            }
        }
        //Se for no privado
        else if (msg.channel.type === "dm"){
            //Verificar canal que o jogador está jogando
            indexCanal = -1;
            canais.forEach(function(c, index) {
                c.jogadores.forEach(j => {
                    if (j.usuario.id===msg.author.id){
                        indexCanal = index;
                    }
                });
            });
            //Jogador não entrou em nenhuma sala
            if (indexCanal===-1){
                msg.author.send(mensagemJSON.semSala);
            }
            //Enviar código para o perfil;
            else{
                canais[indexCanal].jogo.partida.dm(indexCanal, msg, prefixo);
            }
        }
    }
});

function verificarNovoJogo(msg, codJogo, nomeJogo){
    nomeJogo = mensagemJSON.jogoQuemSouEu;
    pos = verificarPartida(msg.channel);
    //Verificar partida em andamento ou jogo selecionado
    if (pos>=0){
        msg.channel.send(mensagemJSON.jogadorSobreposicao + nomeJogo + mensagemJSON.jogadorSobreposicao2);
    }
    //Criar partida
    else{
        canais.push(new Canal(mensagemJSON, msg.channel, codJogo, nomeJogo, msg.author));
    }
}

function listaJogos(){
    return (
        //Quem Sou Eu
        //Lembrar de concatenar com o próximo jogo
        "01. :superhero: **" + mensagemJSON.jogoQuemSouEu + "**: -gb who\n" +
        //Mega Senha
        "02. :question: **" + mensagemJSON.jogoSenha + "**: -gb password\n"
        //Stop
        //"02. :octagonal_sign: **" + mensagemJSON.jogoStop + "**: -gb stop\n" +
        
        //Abecedário
        //"04. :a: **" + mensagemJSON.jogoAbc + "**: -gb abc"
    );
}

function listaComandos(){
    return(
        //Lista de jogos
        ":joystick: " + mensagemJSON.games + ": -gb games\n" + 
        mensagemJSON.gamesDescricao + "\n\n" +
        //Entrar na partida
        ":arrow_forward: " + mensagemJSON.join + ": -gb join\n" + 
        mensagemJSON.joinDescricao + "\n\n" +
        //Iniciar partida
        ":white_check_mark: " + mensagemJSON.start + ": -gb start\n" + 
        mensagemJSON.startDescricao + "\n\n" +
        //Cancelar partida
        ":x: " + mensagemJSON.cancel + ": -gb cancel\n" + 
        mensagemJSON.cancelDescricao + "\n\n" +
        //Sair da partida
        ":man_running: " + mensagemJSON.leave + ": -gb leave\n" + 
        mensagemJSON.leaveDescricao + "\n\n" +
        //Encerrar partida
        ":no_entry_sign: " + mensagemJSON.end + ": -gb end\n" + 
        mensagemJSON.endDescricao
    );
}

//Em
function shuffle() {
    var j, x, i;
    for (i = jogadores.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = jogadores[i];
        jogadores[i] = jogadores[j];
        jogadores[j] = x;
    }
}

//Verificar se já há alguma partida em execução
function verificarPartida(canal){
    if (canais.length>0){
        for (var i = 0; i < canais.length; i++){
            if(canais[i].canal.id===canal.id){
                return i;
            }
        }
    }
    return -1;
}
function verificarJogador(posCanal, idJogador){
    for (var i = 0; i < canais[posCanal].jogadores.length; i++){
        if(canais[posCanal].jogadores[i].usuario.id===idJogador){
            return i;
        }
    }
    return -1;
}