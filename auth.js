// auth.js - Gerenciamento de autenticação
window.auth = window.auth || (function() {
    console.log('Inicializando módulo de autenticação');
    
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
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Verificar credenciais (simulado)
                if (email === 'admin@constructflow.com' && password === 'senha123') {
                    const user = {
                        id: 1,
                        name: 'Carlos Oliveira',
                        role: 'Gerente de Projetos',
                        email: email
                    };
                    
                    localStorage.setItem('authToken', 'token-simulado-123456');
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    console.log('Login realizado com sucesso', user);
                    resolve({ success: true, user });
                } else {
                    console.warn('Tentativa de login com credenciais inválidas');
                    reject(new Error('Credenciais inválidas'));
                }
            }, 500);
        });
    }
    
    // Fazer logout
    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        console.log('Logout realizado com sucesso');
        window.location.href = 'login.html';
    }
    
    // Criar usuário profissional para desenvolvimento
    (function createProfessionalUser() {
        if (!localStorage.getItem('authToken') || !localStorage.getItem('currentUser')) {
            console.log('Criando usuário profissional para desenvolvimento');
            
            const professionalUser = {
                id: 1,
                name: 'Carlos Oliveira',
                role: 'Gerente de Projetos',
                email: 'admin@constructflow.com'
            };
            
            localStorage.setItem('authToken', 'token-simulado-123456');
            localStorage.setItem('currentUser', JSON.stringify(professionalUser));
        }
    })();
    
    console.log('Módulo de autenticação inicializado com sucesso');
    
    // API pública
    return {
        isAuthenticated,
        getToken,
        getCurrentUser,
        login,
        logout
    };
})();
