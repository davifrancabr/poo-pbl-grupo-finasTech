//lista fixa de usuarios do site
const bancoUsuarios = [
    { email: "admin@finans.com", senha: "123" },
    { email: "usuario@teste.com", senha: "abc" }
];

// 1. Mapeando o formulário do HTML
const formLogin = document.getElementById('form-login');

// 2. Escutando o momento em que o usuário clica em "Logar"
formLogin.addEventListener('submit', function(event) {
    // Impede a página de recarregar sozinha
    event.preventDefault();

    
    const emailDigitado = document.getElementById('usuario').value;
    const senhaDigitada = document.getElementById('senha').value;

    // Busca na nossa lista se existe o email E a senha correspondente
    const usuarioValido = bancoUsuarios.find(usuario => 
        usuario.email === emailDigitado && usuario.senha === senhaDigitada
    );

   
    if (usuarioValido) {
        alert("Login feito com sucesso! Bem-vindo."); 
        globalThis.location.href = "teste.html"; 
    } else {
        alert("E-mail ou senha incorretos! Tente novamente.");
    }
});