import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, MapPin, Bell, ShieldCheck, Users, Clock, ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  { icon: MapPin, title: 'Rastreamento em Tempo Real', desc: 'Acompanhe a localização exata dos autocarros escolares no mapa com atualização a cada minuto.' },
  { icon: Bell, title: 'Notificações Inteligentes', desc: 'Receba alertas quando o autocarro estiver próximo, atrasado ou quando o seu filho embarcar/desembarcar.' },
  { icon: ShieldCheck, title: 'Segurança Total', desc: 'Sistema protegido com autenticação por role — pais veem apenas os filhos, motoristas só a sua rota.' },
  { icon: Users, title: 'Gestão de Alunos', desc: 'Cadastro completo de alunos, pais e motoristas com vinculação por rota e código de ativação.' },
  { icon: Clock, title: 'Histórico de Viagens', desc: 'Consulte o histórico completo de cada viagem: horários, paragens, atrasos e estatísticas.' },
  { icon: Bus, title: 'Múltiplas Rotas', desc: 'Suporte a várias rotas por escola, com atribuição inteligente de veículos e motoristas.' },
];

const stats = [
  { value: '100+', label: 'Autocarros Monitorizados' },
  { value: '50+', label: 'Escolas Parceiras' },
  { value: '5.000+', label: 'Alunos Protegidos' },
  { value: '98%', label: 'Taxa de Disponibilidade' },
];

const steps = [
  { num: '1', title: 'Crie a sua Conta', desc: 'Registe-se como escola, motorista ou pai. O processo é rápido e seguro.' },
  { num: '2', title: 'Configure as Rotas', desc: 'Atribua motoristas, veículos e alunos às rotas escolares da sua instituição.' },
  { num: '3', title: 'Acompanhe em Tempo Real', desc: 'Veja no mapa a localização dos autocarros e receba notificações em cada etapa.' },
];

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-safebus-blue to-safebus-blue-dark flex items-center justify-center shadow-md">
                <Bus className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-safebus-blue">SafeBus</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollTo('features')} className="text-sm font-medium text-gray-600 hover:text-safebus-blue transition-colors">Funcionalidades</button>
              <button onClick={() => scrollTo('how-it-works')} className="text-sm font-medium text-gray-600 hover:text-safebus-blue transition-colors">Como Funciona</button>
              <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-safebus-blue transition-colors">Preços</Link>
              <Link to="/auth/login" className="text-sm font-medium text-gray-600 hover:text-safebus-blue transition-colors">Entrar</Link>
              <Link to="/auth/register">
                <Button className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue-dark font-semibold text-sm shadow-md shadow-safebus-yellow/20">
                  Começar Grátis
                </Button>
              </Link>
            </nav>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600 hover:text-safebus-blue">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <button onClick={() => scrollTo('features')} className="block w-full text-left text-sm font-medium text-gray-600 py-2">Funcionalidades</button>
            <button onClick={() => scrollTo('how-it-works')} className="block w-full text-left text-sm font-medium text-gray-600 py-2">Como Funciona</button>
            <Link to="/pricing" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 py-2">Preços</Link>
            <Link to="/auth/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 py-2">Entrar</Link>
            <Link to="/auth/register" onClick={() => setMenuOpen(false)} className="block">
              <Button className="w-full bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue-dark font-semibold">Começar Grátis</Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-safebus-blue via-safebus-blue-dark to-safebus-blue" />
          <div className="absolute top-20 left-10 w-96 h-96 bg-safebus-yellow/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-white/90">Sistema em Produção</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Segurança em<br />
                <span className="text-safebus-yellow">Cada Trajeto</span>
              </h1>

              <p className="text-lg text-white/70 max-w-xl leading-relaxed">
                Plataforma inteligente de monitorização e gestão de transporte escolar.
                Acompanhe em tempo real a localização dos autocarros, receba notificações e
                garanta a segurança dos seus alunos em cada viagem.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue-dark font-bold text-base px-8 py-6 shadow-xl shadow-safebus-yellow/30">
                    Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base">
                    Já tenho conta
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 text-white/50 text-sm">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-safebus-yellow/80 to-safebus-yellow border-2 border-safebus-blue flex items-center justify-center text-[10px] font-bold text-safebus-blue-dark">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span>+5.000 alunos protegidos</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-safebus-yellow/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 w-full max-w-md">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-safebus-yellow/20 rounded-xl">
                      <Bus className="h-6 w-6 text-safebus-yellow" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Autocarro em Rota</p>
                      <p className="text-white/60 text-sm">Atualizado há 30 segundos</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                        <span className="text-white text-sm">Paragem Atual</span>
                      </div>
                      <span className="text-white font-semibold text-sm">Escola Central</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-safebus-yellow" />
                        <span className="text-white/70 text-sm">Próxima Paragem</span>
                      </div>
                      <span className="text-white/70 text-sm">5 min</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-white/70 text-sm">Alunos a Bordo</span>
                      </div>
                      <span className="text-white font-semibold text-sm">12</span>
                    </div>
                  </div>

                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-300 text-sm font-medium">Viagem segura — condutor verificado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => scrollTo('features')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70 transition-colors animate-bounce"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </section>

      {/* Stats */}
      <section className="relative -mt-20 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-safebus-blue">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-safebus-blue uppercase tracking-widest">Funcionalidades</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
              Tudo o que precisa para gerir o transporte escolar
            </h2>
            <p className="text-gray-500 mt-4 text-lg">
              Uma plataforma completa com ferramentas para pais, escolas e motoristas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-safebus-blue/30 hover:shadow-lg hover:shadow-safebus-blue/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-safebus-blue/10 flex items-center justify-center mb-4 group-hover:bg-safebus-blue group-hover:scale-110 transition-all duration-300">
                    <Icon className="h-6 w-6 text-safebus-blue group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-safebus-blue uppercase tracking-widest">Como Funciona</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
              Comece em 3 passos simples
            </h2>
            <p className="text-gray-500 mt-4 text-lg">
              Do registo ao acompanhamento em tempo real em minutos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-safebus-blue/20" />
                )}
                <div className="w-24 h-24 rounded-full bg-safebus-blue/5 border-2 border-safebus-blue/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-safebus-blue">{s.num}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-safebus-blue to-safebus-blue-dark rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-safebus-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Pronto para transformar o transporte escolar?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
        Junte-se a dezenas de escolas que já confiam no SafeBus para proteger os seus alunos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth/register">
                  <Button size="lg" className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue-dark font-bold text-base px-8 py-6 shadow-xl shadow-safebus-yellow/30">
                    Criar Conta Gratuita <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base">
                    Ver Planos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-safebus-blue to-safebus-blue-dark flex items-center justify-center">
                  <Bus className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-safebus-blue">SafeBus</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Segurança em cada trajeto. Plataforma de monitorização de transporte escolar em tempo real.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Plataforma</h4>
              <div className="space-y-2">
                <button onClick={() => scrollTo('features')} className="block text-sm text-gray-500 hover:text-safebus-blue">Funcionalidades</button>
                <button onClick={() => scrollTo('how-it-works')} className="block text-sm text-gray-500 hover:text-safebus-blue">Como Funciona</button>
                <Link to="/pricing" className="block text-sm text-gray-500 hover:text-safebus-blue">Preços</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Acesso</h4>
              <div className="space-y-2">
                <Link to="/auth/login" className="block text-sm text-gray-500 hover:text-safebus-blue">Entrar</Link>
                <Link to="/auth/register" className="block text-sm text-gray-500 hover:text-safebus-blue">Criar Conta</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SafeBus. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
