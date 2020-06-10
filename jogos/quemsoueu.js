class QuemSouEu {
    jogadores;
    canal;
    mensagem;
    statusJogoDM;
    //Construtor da classe
    constructor(mensagem, canal, jogadores){
        //Instaciando jogo
        console.log("Quem sou eu iniciado");
        this.mensagem = mensagem;
        this.jogadores = jogadores;
        this.canal = canal;
        //Instaciando nulo para os personagens de todos os jogadores
        this.jogadores.forEach(j=>{
            j["personagem"] = "";
        });
        //Enviando mensagem no privado para os jogadores
        for (var i = 0; i < jogadores.length; ++i){
            pos = -1;
            if (i===jogadores.length-1) pos = 0;
            else pos = i+1;
            jogadores[i].usuario.send(jogadores[pos].usuario.username + " " + mensagem.quemSera);
        }
        this.canal.send(mensagem.quemAguardando);
        this.statusJogoDM = 0;
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
        
    dm(indexCanal, msg){
        switch (this.statusJogoDM){
            //Aguardando jogadores informarem o personagem do do amigo
            case 0:
                var todosPersonagens = true;
                pos = -1;
                for (var i = 0; i < this.jogadores.length; i++){
                    if (this.jogadores[i].usuario.id===msg.author.id){
                        pos = i;
                        if (pos = this.jogadores.length-1) pos = 0;
                        else pos++;
                        console.log(this.jogadores);
                        this.jogadores[0].personagem = msg.content;
                    }
                    //Verificar se todos já possuem personagem
                    if (this.jogadores[i].personagem === "") todosPersonagens = false;
                }
                //Caso todos já tenham informado o personagem
                if (todosPersonagens){
                    console.log(this.jogadores);
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
                    this.statusJogoDM = 1;
                }
                //Caso falte alguém informar o personagem
                else{
                    msg.author.send(this.mensagem.quemEnviado);
                }
                break;
            default:
                //msg.author.send()
        }
    }
}
module.exports = QuemSouEu;