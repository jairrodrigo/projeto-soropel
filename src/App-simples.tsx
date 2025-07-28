import React from 'react'

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🏭 Sistema Soropel - TESTE DEPLOY
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#007bff' }}>✅ Deploy Funcionando!</h2>
        <p>Se você está vendo esta mensagem, o deploy foi bem-sucedido!</p>
        
        <ul>
          <li>✅ React carregando</li>
          <li>✅ TypeScript compilando</li>  
          <li>✅ Vercel deployando</li>
          <li>✅ CSS aplicado</li>
        </ul>
        
        <button 
          onClick={() => alert('JavaScript funcionando!')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Teste Interatividade
        </button>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Build: {new Date().toISOString()}
      </div>
    </div>
  )
}

export default App