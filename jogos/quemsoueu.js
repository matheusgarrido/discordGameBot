class QuemSouEu {
    fimJogo = 100;
    jogadores;
    canal;
    mensagem;
    statusJogoDM;
    horaInicio;
    placar;
    //Construtor da classe
    constructor(mensagem, canal, jogadores){
        //Instaciando jogo
        console.log("Quem sou eu iniciado");
        this.mensagem = mensagem;
        this.jogadores = jogadores;
        this.canal = canal;
        this.placar = [];
        //Instaciando nulo para os personagens de todos os jogadores
        this.jogadores.forEach(j=>{
            j["personagem"] = "";
            j["horaFim"] = null;
        });
        //Enviando mensagem no privado para os jogadores
        for (var i = 0; i < jogadores.length; i++){
            pos = -1;
            if (i===jogadores.length-1) pos = 0;
            else pos = i+1;
            jogadores[i].usuario.send(jogadores[pos].usuario.username + " " + mensagem.quemSera);
        }
        this.canal.send(mensagem.quemAguardando);
        this.statusJogoDM = 1;
    }

    calcularMinutos(p){
        //Diferença em milésimos entre as datas
        var dif = this.horaInicio.getTime() - p.horaFim.getTime();
        //Convertendo para minutos
        var minutos = dif / 1000 / 60;
        //Exibindo na contagem sexagional (decimal para relógio)
        var min = Math.floor(Math.abs(minutos));
        var sec = Math.floor((Math.abs(minutos) * 60) % 60);
        var m = (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
        return m + " " + this.mensagem.minutos;
    }
        
    dm(indexCanal, msg, prefixo){
        switch (this.statusJogoDM){
            //Aguardando jogadores informarem o personagem do do amigo
            case 1:
                var todosPersonagens = true;
                var jogadoresPendentes = [];
                for (var i = 0; i < this.jogadores.length; i++){
                    if (this.jogadores[i].usuario.id===msg.author.id){
                        var pos = i;
                        if (pos === this.jogadores.length-1) pos = 0;
                        else pos++;
                        this.jogadores[pos].personagem = msg.content;
                    }
                    //Verificar se todos já possuem personagem, exceto o primeiro jogador
                    if (this.jogadores[i].personagem === "" && i>0){
                        todosPersonagens = false;
                        jogadoresPendentes.push(this.jogadores[i].usuario.username);
                    } 
                }
                //Agora sim verificar o primeiro jogador, senão quase sempre seria falso
                if (this.jogadores[0].personagem === "") todosPersonagens = false;
                //Caso todos já tenham informado o personagem
                if (todosPersonagens){
                    msg.author.send(this.mensagem.quemIniciando);
                    this.canal.send(this.mensagem.quemIniciando);
                    //Reordenar jogadores para iniciar partida
                    this.shuffle();
                    var ordem = this.mensagem.quemOrdenacao;
                    for (var i = 0; i < this.jogadores.length; i++){
                        ordem += "\n" + (i+1) + ". " + this.jogadores[i].usuario.username;
                        var personagens = this.mensagem.quemAmigos;
                        //Enviar lista dos personagens, ocultando o do receptor da mensagem
                        for (var i2 = 0; i2 < this.jogadores.length; i2++){
                            if (this.jogadores[i2].usuario.id!=this.jogadores[i].usuario.id){
                                personagens += "\n" + this.jogadores[i2].usuario.username +
                                    " -> **" + this.jogadores[i2].personagem + "**";
                            }
                        }
                        this.jogadores[i].usuario.send(personagens);
                    }
                    this.canal.send("**" + ordem + "**");
                    this.canal.send(this.mensagem.jogoIniciado, { tts: true });
                    this.canal.send(this.mensagem.quemDone);
                    this.statusJogoDM = 2;
                    this.horaInicio = new Date();
                }
                //Caso falte alguém informar o personagem
                else{
                    //Aguardando jogadores
                    msg.author.send(this.mensagem.quemEnviado);
                    //Listar quem ainda falta
                    this.canal.send(this.mensagem.quemFaltaEnviar + " " + jogadoresPendentes.join(", "));
                }
                break;
            //Caso a partida esteja em andamento
            case 2:
                if (msg.content.toLowerCase().startsWith(prefixo + " done")){
                    var todosTerminaram=true;
                    for (var j = 0; j < this.jogadores.length; j++){
                    //this.jogadores.forEach(function(j){
                        //Se terminou agora
                        if (this.jogadores[j].horaFim===null){
                            //Se o jogador terminou agora
                            if (this.jogadores[j].usuario.id===msg.author.id){
                                this.canal.send(this.jogadores[j].usuario.username + " " + this.mensagem.quemAcertou, { tts: true });
                                this.jogadores[j].horaFim = new Date();
                                this.placar.push({
                                    "username": this.jogadores[j].usuario.username,
                                    "personagem": this.jogadores[j].personagem,
                                    "horaFim": this.jogadores[j].horaFim
                                });
                            }
                            //Se algum amigo ainda não terminou
                            else{
                                todosTerminaram=false;
                            }
                        }
                    }
                    //Se todos já terminaram, aparecerá o placar
                    if (todosTerminaram) {
                        this.exibirPlacar();
                    }
                }
                break;
            default:
        }
        return this.statusJogoDM;
    }

    shuffle() {
        var j, x, i;
        for (i = this.jogadores.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = this.jogadores[i];
            this.jogadores[i] = this.jogadores[j];
            this.jogadores[j] = x;
        }
    }

    exibirPlacar(){
        console.log(this.placar);
        this.statusJogoDM = this.fimJogo;
        var msgPlacar = "**"+this.mensagem.quemResultadoTitulo+"**";
        for (var i = 0; i < this.placar.length; i++){
        //this.placar.forEach(function(p, index){
            msgPlacar += "\n";
            switch(i){
                case 0:
                    msgPlacar += ":first_place:";
                    break;
                case 1:
                    msgPlacar += ":second_place:";
                    break;
                case 2:
                    msgPlacar += ":third_place:";
                    break;
                default:
                    msgPlacar += (i+1) + ". ";
            }
            msgPlacar += this.placar[i].username + " " + this.mensagem.quemResultado + " " + this.calcularMinutos(this.placar[i]) + ".";
        };
        this.canal.send(msgPlacar);
        this.canal.send(":trophy: :trophy: :trophy: :trophy: :trophy: :trophy: :trophy: :trophy: :trophy:");
        this.canal.send(this.placar[0].personagem + " " + this.mensagem.ganhou + " " + this.mensagem.quemOps + " " + this.placar[0].username +
            " " + this.mensagem.ganhou, { tts: true });
        this.canal.send(":trophy: :trophy: :trophy: :trophy: :trophy: :trophy: :trophy: :trophy: :trophy:");
    }
}
module.exports = QuemSouEu;