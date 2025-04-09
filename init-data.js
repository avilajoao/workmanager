// init-data.js - Inicialização de dados de exemplo
(function() {
    // Verificar se os dados já foram inicializados
    if (localStorage.getItem('dataInitialized')) {
        console.log('Dados já inicializados anteriormente');
        return;
    }
    
    console.log('Inicializando dados de exemplo...');
    
    // Projetos de exemplo
    const projects = [
        {
            id: 1,
            name: 'Residencial Vila Verde',
            description: 'Condomínio residencial com 120 unidades',
            status: 'in-progress',
            startDate: '2023-01-15',
            endDate: '2024-06-30',
            budget: 15000000,
            createdAt: '2023-01-10T10:00:00Z',
            updatedAt: '2023-01-10T10:00:00Z'
        },
        {
            id: 2,
            name: 'Edifício Comercial Centro',
            description: 'Torre comercial com 18 andares',
            status: 'planning',
            startDate: '2023-04-01',
            endDate: '2025-03-31',
            budget: 22000000,
            createdAt: '2023-02-20T14:30:00Z',
            updatedAt: '2023-02-20T14:30:00Z'
        },
        {
            id: 3,
            name: 'Reforma Shopping Plaza',
            description: 'Reforma e ampliação de shopping center',
            status: 'on-hold',
            startDate: '2023-03-10',
            endDate: '2023-12-15',
            budget: 8500000,
            createdAt: '2023-02-28T09:15:00Z',
            updatedAt: '2023-02-28T09:15:00Z'
        }
    ];
    
    // Salvar projetos no localStorage
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Marcar dados como inicializados
    localStorage.setItem('dataInitialized', 'true');
    
    console.log('Dados de exemplo inicializados com sucesso');
})();
