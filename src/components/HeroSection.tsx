import React from 'react';
import { Clock, Play, Bell, Video, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Timers Personalizados",
      description: "Crie timers com durações personalizadas e configurações únicas"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notificações Inteligentes",
      description: "Receba alertas sonoros e visuais nos intervalos que você definir"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Vídeos de Conclusão",
      description: "Configure vídeos para serem exibidos quando o timer for concluído"
    },
    {
      icon: <Volume2 className="w-6 h-6" />,
      title: "Sons Personalizados",
      description: "Use seus próprios arquivos de áudio para notificações"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-16">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <Clock className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Timer App
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Gerencie seu tempo com timers personalizados, notificações inteligentes 
            e recursos avançados para maximizar sua produtividade.
          </p>
          
          <div className="flex justify-center">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Começar Agora
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
              <div className="text-gray-600">Timers Ilimitados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">Personalizável</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-600">Configuração Necessária</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-gray-600 mb-8">
            Crie seu primeiro timer em menos de 1 minuto
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Criar Meu Primeiro Timer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
