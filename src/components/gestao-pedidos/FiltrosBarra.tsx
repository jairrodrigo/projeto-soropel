import React from 'react';
import { Search } from 'lucide-react';
import { FiltrosPedidos } from '@/types';

interface FiltrosBarraProps {
  filtros: FiltrosPedidos;
  onUpdateFiltros: (novosFiltros: Partial<FiltrosPedidos>) => void;
}

export const FiltrosBarra: React.FC<FiltrosBarraProps> = ({ 
  filtros, 
  onUpdateFiltros 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => onUpdateFiltros({ busca: e.target.value })}
            placeholder="Buscar por pedido, cliente..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-3">
          <select
            value={filtros.status}
            onChange={(e) => onUpdateFiltros({ status: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">Todos os Status</option>
            <option value="producao">Em Produção</option>
            <option value="aguardando">Aguardando</option>
            <option value="atrasado">Atrasados</option>
            <option value="urgente">Urgentes</option>
            <option value="separado">Separados</option>
            <option value="finalizado">Finalizados</option>
          </select>

          <select
            value={filtros.prioridade}
            onChange={(e) => onUpdateFiltros({ prioridade: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">Todas Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>
    </div>
  );
};