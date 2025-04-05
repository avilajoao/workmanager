// auth.js - Gerenciamento de autenticação

const auth = (function() {
    // Verificar se o usuário está autenticado
    function isAuthenticated() {
        return localStorage.getItem('authToken') !== null;
    }
    
    // Obter token de autenticação
    function getToken() {
        return localStorage.getItem('authToken');
    }
    
    // Obter dados do usuário atual
    function getCurrentUser() {
        const userString = localStorage.getItem('currentUser');
        return userString ? JSON.parse(userString) : null;
    }
    
    // Fazer login
    function login(email, password) {
        return fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Credenciais inválidas');
            }
            return response.json();
        })
        .then(data => {
            // Salvar token e dados do usuário
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            // Redirecionar para a página principal
            window.location.href = 'home.html';
            
            return { success: true };
        })
        .catch(error => {
            console.error('Erro de login:', error);
            return { 
                success: false, 
                message: error.message || 'Falha ao fazer login. Verifique suas credenciais.'
            };
        });
    }
    
    // Fazer logout
    function logout() {
        // Limpar dados de autenticação
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        // Redirecionar para a página de login
        window.location.href = 'login.html';
    }
    
    // API pública
    return {
        isAuthenticated,
        getToken,
        getCurrentUser,
        login,
        logout
    };
})();

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    auth.login(email, password).then(result => {
        if (!result.success) {
            // Exibir mensagem de erro
            const errorElement = document.getElementById('loginError');
            errorElement.textContent = result.message;
            errorElement.classList.remove('hidden');
        }
        // Não precisamos redirecionar aqui, pois a função auth.login já faz isso
    });
});
