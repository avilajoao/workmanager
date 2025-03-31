// Módulo de autenticação
const auth = {
    // Verificar se o usuário está autenticado
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const expiresAt = localStorage.getItem('expiresAt');
        
        if (!token || !expiresAt) {
            return false;
        }
        
        // Verificar se o token expirou
        const now = new Date();
        const expiration = new Date(expiresAt);
        
        return now < expiration;
    },
    
    // Obter token de autenticação
    getToken() {
        return localStorage.getItem('token');
    },
    
    // Obter usuário atual
    getCurrentUser() {
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    },
    
    // Fazer login
    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Falha na autenticação');
            }
            
            const data = await response.json();
            
            // Salvar dados de autenticação
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('expiresAt', data.expiresAt);
            
            return data.user;
        } catch (error) {
            console.error('Erro de login:', error);
            throw error;
        }
    },
    
    // Fazer registro
    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Falha no registro');
            }
            
            const data = await response.json();
            
            // Salvar dados de autenticação
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('expiresAt', data.expiresAt);
            
            return data.user;
        } catch (error) {
            console.error('Erro de registro:', error);
            throw error;
        }
    },
    
    // Fazer logout
    logout() {
        // Limpar dados de autenticação
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiresAt');
        
        // Redirecionar para a página de login
        window.location.href = 'login.html';
    },
    
    // Renovar token
    async refreshToken() {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Falha ao renovar token');
            }
            
            const data = await response.json();
            
            // Atualizar token e data de expiração
            localStorage.setItem('token', data.token);
            localStorage.setItem('expiresAt', data.expiresAt);
            
            return data.token;
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            this.logout();
            throw error;
        }
    }
};
