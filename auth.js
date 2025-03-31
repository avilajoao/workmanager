// Módulo de autenticação
const auth = {
    // Verificar se o usuário está autenticado
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        // Verificar se o token expirou
        const expiresAt = localStorage.getItem('expiresAt');
        if (!expiresAt) return false;
        
        return new Date(expiresAt) > new Date();
    },
    
    // Obter token
    getToken() {
        return localStorage.getItem('token');
    },
    
    // Obter usuário atual
    getCurrentUser() {
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    },
    
    // Login
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
                throw new Error(error.message || 'Falha no login');
            }
            
            const data = await response.json();
            
            // Salvar dados de autenticação
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('expiresAt', data.expiresAt);
            
            return data.user;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    },
    
    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiresAt');
        
        // Redirecionar para a página de login
        window.location.href = '/login.html';
    },
    
    // Registrar novo usuário
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
            console.error('Erro no registro:', error);
            throw error;
        }
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
            
            // Atualizar dados de autenticação
            localStorage.setItem('token', data.token);
            localStorage.setItem('expiresAt', data.expiresAt);
            
            return true;
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            this.logout();
            return false;
        }
    },
    
    // Inicializar autenticação
    init() {
        // Verificar autenticação em cada página
        if (!this.isAuthenticated() && !window.location.pathname.includes('login.html')) {
            // Redirecionar para login se não estiver autenticado
            window.location.href = '/login.html';
            return;
        }
        
        // Configurar renovação automática de token
        if (this.isAuthenticated()) {
            const expiresAt = new Date(localStorage.getItem('expiresAt'));
            const now = new Date();
            const timeUntilExpiry = expiresAt - now;
            
            // Se o token expira em menos de 5 minutos, renovar agora
            if (timeUntilExpiry < 5 * 60 * 1000) {
                this.refreshToken();
            } else {
                // Agendar renovação para 5 minutos antes da expiração
                const timeToRefresh = timeUntilExpiry - (5 * 60 * 1000);
                setTimeout(() => this.refreshToken(), timeToRefresh);
            }
        }
    }
};

// Inicializar autenticação quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
});
