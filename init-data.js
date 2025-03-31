// Inicializar dados de exemplo
(function() {
    // Verificar se já foi inicializado
    if (localStorage.getItem('dataInitialized')) {
        return;
    }
    
    console.log('Inicializando dados de exemplo...');
    
    // Usuários
    const users = [
        {
            id: '1',
            name: 'João Silva',
            email: 'joao@exemplo.com',
            password: 'senha123',
            role: 'admin',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Maria Oliveira',
            email: 'maria@exemplo.com',
            password: 'senha123',
            role: 'user',
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            name
