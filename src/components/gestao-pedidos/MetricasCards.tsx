import React from 'react';
import { Package, PlayCircle, Clock, AlertTriangle, Zap } from 'lucide-react';
import { MetricasPedidos } from '@/types';

interface MetricasCardsProps {
  metricas: MetricasPedidos;
  onFilterByStatus: (status: string) => void;
}

export const MetricasCards: React.FC<MetricasCardsProps> = ({ 
  metricas, 
  onFilterByStatus 
}) => {
  const cards = [
    {
      id: 'total',
      title: 'Total Pedidos',
      value: metricas.totalPedidos,
      color: 'blue',
      icon: Package,
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      onClick: () => onFilterByStatus('todos')
    },
    {
      id: 'producao',
      title: 'Em Produção',
      value: metricas.emProducao,
      color: 'green',
      icon: PlayCircle,
      borderColor: 'border-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      onClick: () => onFilterByStatus('producao')
    },
    {
      id: 'aguardando',
      title: 'Aguardando',
      value: metricas.aguardando,
      color: 'yellow',
      icon: Clock,
      borderColor: 'border-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      onClick: () => onFilterByStatus('aguardando')
    },
    {
      id: 'atrasados',
      title: 'Atrasados',
      value: metricas.atrasados,
      color: 'red',
      icon: AlertTriangle,
      borderColor: 'border-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      onClick: () => onFilterByStatus('atrasado')
    },
    {
      id: 'urgentes',
      title: 'Urgentes',
      value: metricas.urgentes,
      color: 'orange',
      icon: Zap,
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      onClick: () => onFilterByStatus('urgente')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-l-4 ${card.borderColor}`}
            onClick={card.onClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};