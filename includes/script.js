function enviarWhatsApp() {
      const nome = document.getElementById("nome").value;
      const telefone = document.getElementById("telefone").value;
      const mensagem = document.getElementById("mensagem").value;
      const texto = `Olá, meu nome é ${nome} (%2B${telefone}). Quero falar com vocês: ${mensagem}`;
      const link = `https://wa.me/5566999366313?text=${encodeURIComponent(texto)}`;
      window.open(link, "_blank");
    }