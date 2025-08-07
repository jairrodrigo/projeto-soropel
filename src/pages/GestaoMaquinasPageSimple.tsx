// Página Gestão de Máquinas - Versão Simplificada para Teste
import React from 'react'

export const GestaoMaquinasPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        🏭 Gestão de Máquinas
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Página de gestão de máquinas carregada com sucesso!
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Status do Sistema</h2>
        <ul className="space-y-2">
          <li>✅ Página carregada</li>
          <li>✅ React funcionando</li>
          <li>✅ TailwindCSS aplicado</li>
          <li>✅ Navegação funcional</li>
        </ul>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          <strong>Teste:</strong> Se você consegue ver esta página, o sistema está funcionando! 
          Agora podemos implementar as funcionalidades completas.
        </p>
      </div>
    </div>
  )
}

export default GestaoMaquinasPage
