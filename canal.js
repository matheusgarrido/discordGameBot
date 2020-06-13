const QuemSouEu = require("./jogos/quemsoueu.js");

class Canal {
    canal;
    jogo;
    mensagem;
    jogadores;
    partidaStatus;
    //Construtor da classe
    constructor(mensagem, dadosCanal, codJogo, tituloJogo, anfitriao){
        //Instaciando classe
        this.canal = dadosCanal;
        this.jogo = {"id": codJogo, "titulo": tituloJogo};
        this.mensagem = mensagem;
        this.jogadores = [{"usuario": anfitriao}];
        //anfitriao.setActivity("-gb help ou -gb ajuda", {type: "PLAYING"});
        //anfitriao.presence.status = "Jogando " + tituloJogo;
        this.partidaStatus = 0;
        //Mensagem Convite
        this.canal.send(
            anfitriao.username + " " + this.mensagem.jogadorInvite + this.jogo.titulo + ".\n",
            { tts: true }
        );
        this.canal.send(this.mensagem.jogadorInvite2);
    }
    
    mensagem(texto){
        this.canal.send(texto);
    }

    //Embaralhar ordem da fila de jogadores
    shuffle() {
        var j, x, i;
        for (i = this.jogadores.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = this.jogadores[i];
            this.jogadores[i] = this.jogadores[j];
            this.jogadores[j] = x;
        }
    }

    //Iniciar partida do jogo selecionado
    partidaStart(){
        var listaJogadores = "";
        this.jogadores.forEach(function (j, index) {
            listaJogadores += "\n" + (index+1) + ". " + j.usuario.username;
        });
        this.canal.send(this.mensagem.jogadores + listaJogadores);
        this.partidaStatus = 1;
        this.shuffle();
        switch (this.jogo.id){
            case 1:
                console.log(this.jogadores);
                this.jogo.partida = new QuemSouEu(this.mensagem, this.canal, this.jogadores);
                break;
        }
    }

    partidaRestart(msg){
        this.shuffle();
        switch(this.jogo.id){
            case 1:
                if (this.placar.length===0){
                    this.canal.send(msg.author.username + " " + this.mensagem.quemRefazerPersonagem, { tts: true });
                }
                break;
        }
        this.partidaStart();
    }
}
module.exports = Canal;