import { useRef, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bus, MapPin, Bell, ShieldCheck, Users, Clock, ArrowRight,
  Smartphone, School, Award,
} from 'lucide-react';
import { motion, useInView, useSpring, useMotionValue, useTransform, useMotionValueEvent, type Variants } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import Lenis from 'lenis';
import { useAuth } from '@/contexts/AuthContext';
import FlowArt, { FlowSection } from '@/components/ui/story-scroll';
import heroImage from '../../designmd/ChatGPT Image 17 de jul. de 2026, 23_53_13.png';
import ScrollExpandMedia from '@/components/landing/ScrollExpandMedia';
import TextCursorProximity from '@/components/ui/text-cursor-proximity';
import { TiltCard } from '@/components/ui/tilt-card';
import { Button } from '@/components/ui/button';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => `${Math.floor(v)}${suffix}`);
  const [displayText, setDisplayText] = useState('0');

  useMotionValueEvent(display, 'change', setDisplayText);

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, value, spring]);

  return <span ref={ref}>{displayText}</span>;
}

const features = [
  { icon: MapPin, title: 'Veja onde o autocarro está', desc: 'Localização exacta no mapa com actualização a cada minuto. Nunca mais espere sem saber.', surface: 'bg-sky-card' },
  { icon: Bell, title: 'Alertas na hora certa', desc: 'Notificação quando o autocarro sai, chega à paragem ou quando o seu filho embarca.', surface: 'bg-peach-card' },
  { icon: ShieldCheck, title: 'Só vê o que deve ver', desc: 'Pais veem apenas os filhos. Motoristas só a sua rota. Dados protegidos de ponta a ponta.', surface: 'bg-sage-card' },
  { icon: Users, title: 'Gestão sem complicação', desc: 'Associe os seus filhos à rota certa em segundos. Sem papel, sem burocracia.', surface: 'bg-ash-gray' },
  { icon: Clock, title: 'Histórico de cada viagem', desc: 'Consulte horários, paragens, atrasos e estatísticas de qualquer dia anterior.', surface: 'bg-sky-card' },
  { icon: Bus, title: 'Várias rotas, uma escola', desc: 'Suporte a múltiplas rotas com atribuição inteligente de motoristas e veículos.', surface: 'bg-peach-card' },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    const pull = Math.min(d / 6, 10);
    const angle = Math.atan2(dy, dx);
    x.set(Math.cos(angle) * pull);
    y.set(Math.sin(angle) * pull);
  };

  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x, y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

const LandingPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const lenisRef = useRef<Lenis | null>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const missionParallaxRef = useRef<HTMLDivElement>(null);
  const featuresLabelRef = useRef<HTMLDivElement>(null);
  const benefitsLabelRef = useRef<HTMLDivElement>(null);
  const howLabelRef = useRef<HTMLDivElement>(null);
  const ctaLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true });
    lenis.on('scroll', () => ScrollTrigger.update());
    lenis.stop();
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = missionParallaxRef.current;
    if (!el) return;
    const trigger = el.closest('[data-flow-section]');
    if (!trigger) return;
    const st = ScrollTrigger.create({
      trigger,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const y = (self.progress - 0.5) * 100;
        el.style.transform = `translateY(${y}px) scale(1.05)`;
      },
    });
    return () => st.kill();
  }, []);

  const handleExpandChange = useCallback((expanded: boolean) => {
    if (expanded) {
      lenisRef.current?.start();
    } else {
      lenisRef.current?.stop();
    }
  }, []);

  if (authLoading) return null;
  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-bone text-charcoal font-[Inter] overflow-x-hidden">
      <style>{`
        .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      {/* ─── SCROLL-EXPAND HERO ─── */}
      <div className="relative">
        <ScrollExpandMedia
          mediaType="video"
          mediaSrc="/kling_bus_pov.mp4"
          bgImageSrc={heroImage}
          title="SafeBus"
          logoSrc="/logo.svg"
          scrollToExpand="Scroll para expandir"
          onExpandChange={handleExpandChange}
        >
        </ScrollExpandMedia>

        {/* Nav buttons */}
        <div className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-none">
          <Link
            to="/auth/login"
            className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white border border-white/30 rounded-full hover:bg-safebus-yellow hover:text-safebus-blue hover:border-safebus-yellow transition-all duration-300"
          >
            Entrar
          </Link>
          <Link
            to="/auth/register"
            className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-safebus-blue rounded-full hover:bg-safebus-yellow hover:text-safebus-blue transition-all duration-300"
          >
            Criar
          </Link>
        </div>
      </div>

      {/* ─── FLOW ART SCROLL SECTIONS ─── */}
      <FlowArt aria-label="SafeBus Apresentação">

        {/* MISSION */}
        <FlowSection aria-label="Missão" style={{ backgroundColor: '#1E3A8A', color: '#fff' }}>
          {/* Parallax image — right side */}
          <div
            ref={missionParallaxRef}
            className="absolute right-0 top-0 h-full w-1/2 pointer-events-none z-0 will-change-transform"
            style={{ clipPath: 'inset(0)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] via-[#1E3A8A]/70 to-transparent z-10 w-1/3" />
            <img
              src={heroImage}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div ref={missionRef} className="relative z-10">
            <TextCursorProximity
              label="01 — A Nossa Promessa"
              className="text-sm will-change-transform font-bold uppercase tracking-[0.2em]"
              styles={{
                transform: { from: "scale(1)", to: "scale(1.3)" },
                color: { from: "#FFFFFF", to: "#FBBF24" },
              }}
              falloff="gaussian"
              radius={80}
              containerRef={missionRef}
            />
          </div>
          <motion.h2
            className="serif text-[clamp(2.8rem,7vw,6rem)] font-bold leading-[0.88] uppercase tracking-tight cursor-default"
            initial={{ opacity: 0, y: 40, color: '#FFFFFF' }}
            whileInView={{ opacity: 1, y: 0, color: '#FFFFFF' }}
            whileHover={{ color: '#FBBF24' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            Onde Estão
            <br />
            Os Seus
            <br />
            Filhos?
          </motion.h2>
          <motion.p
            className="text-[clamp(1rem,1.4vw,1.25rem)] font-normal leading-[1.65] text-white/80 max-w-[55%]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            É a pergunta que todos os pais fazem todas as manhãs. O SafeBus mostra-lhe a resposta — em tempo real, do portão de casa até à escola.
          </motion.p>
        </FlowSection>

        {/* FEATURES */}
        <FlowSection
          aria-label="Funcionalidades"
          style={{
            backgroundImage:
              'linear-gradient(rgba(30,58,138,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,138,0.07) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            backgroundColor: '#f1efdf',
            color: '#212529',
          }}
        >
          <div ref={featuresLabelRef} className="relative z-10">
            <TextCursorProximity
              label="02 — Funcionalidades"
              className="text-sm will-change-transform font-bold uppercase tracking-[0.2em]"
              styles={{
                transform: { from: "scale(1)", to: "scale(1.3)" },
                color: { from: "#212529", to: "#1E3A8A" },
              }}
              falloff="gaussian"
              radius={80}
              containerRef={featuresLabelRef}
            />
          </div>
          <motion.h2
            className="serif text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.88] uppercase tracking-tight relative z-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            Tudo Que Precisa
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 w-full relative z-10"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              if (i === 0) {
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="sm:col-span-2 lg:col-span-2 row-span-1 group"
                    style={{ borderRadius: '24px' }}
                  >
                    <TiltCard tiltDegree={5} className="h-full">
                      <motion.div
                        className="relative overflow-hidden rounded-[24px] h-full shadow-sm transition-shadow duration-500"
                        style={{ backgroundColor: '#ffffff' }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, delay: 0 }}
                      >
                        <span className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-black/[0.04] pointer-events-none" />
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-safebus-blue via-safebus-yellow to-safebus-blue" />
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-safebus-blue/[0.03] rounded-full blur-2xl" />
                        <div className="p-[clamp(1.25rem,2vw,2rem)] relative">
                          <div className="flex items-start gap-4 mb-5">
                            <motion.div
                              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-safebus-blue/10 to-safebus-blue/5 flex items-center justify-center shadow-sm shrink-0"
                              whileHover={{ rotate: 10, scale: 1.05 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                            >
                              <Icon className="h-5 w-5 text-safebus-blue" aria-hidden="true" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[clamp(1.05rem,1.3vw,1.3rem)] font-semibold text-charcoal leading-[1.25] tracking-[-0.022em] mb-1">{f.title}</h3>
                              <p className="text-[clamp(0.85rem,1vw,1rem)] text-graphite leading-[1.55]">{f.desc}</p>
                            </div>
                          </div>
                          <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50/50 group-hover:shadow-md transition-shadow duration-500">
                            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 bg-white/60">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                              <span className="ml-2 text-[10px] text-gray-400 font-medium">safebus.app/mapa</span>
                            </div>
                            <div className="p-4 flex items-center justify-center min-h-[130px] bg-gradient-to-br from-safebus-blue/[0.04] to-white relative">
                              <div className="relative w-full max-w-[300px]">
                                <div className="h-[84px] rounded-lg bg-gradient-to-br from-safebus-blue/[0.07] to-gray-50 border border-gray-200/60 relative overflow-hidden">
                                  <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 300 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 50 Q 40 30 80 50 T 160 45 T 240 55 T 300 42" stroke="#1E3A8A" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                                    <circle cx="40" cy="40" r="2" fill="#1E3A8A" opacity="0.3" />
                                    <circle cx="90" cy="52" r="2" fill="#1E3A8A" opacity="0.3" />
                                    <circle cx="150" cy="44" r="2" fill="#1E3A8A" opacity="0.3" />
                                    <circle cx="210" cy="56" r="2" fill="#1E3A8A" opacity="0.3" />
                                    <circle cx="260" cy="40" r="2" fill="#1E3A8A" opacity="0.3" />
                                  </svg>
                                  <motion.div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                    animate={{ y: [-2, 2, -2] }}
                                    transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
                                  >
                                    <div className="relative">
                                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="drop-shadow-md relative z-10">
                                        <circle cx="12" cy="12" r="10" fill="#1E3A8A" />
                                        <circle cx="12" cy="12" r="5" fill="white" />
                                        <circle cx="12" cy="12" r="2" fill="#1E3A8A" />
                                        <path d="M12 22V16" stroke="white" strokeWidth="1.5" />
                                      </svg>
                                      <motion.span
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-safebus-blue/20 rounded-full blur-sm"
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.15, 0.3] }}
                                        transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
                                      />
                                    </div>
                                  </motion.div>
                                  <motion.div
                                    className="absolute bottom-2 left-3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]"
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
                                  />
                                  <motion.div
                                    className="absolute bottom-2 left-[18px] w-1.5 h-1.5 rounded-full bg-emerald-400/60"
                                    animate={{ opacity: [0.6, 0.2, 0.6] }}
                                    transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, delay: 0.3 }}
                                  />
                                  <motion.div
                                    className="absolute bottom-2 left-[28px] w-1 h-1 rounded-full bg-emerald-400/40"
                                    animate={{ opacity: [0.4, 0.1, 0.4] }}
                                    transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, delay: 0.6 }}
                                  />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <motion.span
                                    className="text-[9px] text-gray-400 bg-white/80 px-2 py-0.5 rounded-full border border-gray-100"
                                    whileHover={{ scale: 1.05 }}
                                  >284 activos</motion.span>
                                  <motion.span
                                    className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <motion.span
                                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
                                      animate={{ scale: [1, 1.4, 1] }}
                                      transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
                                    />
                                    Online
                                  </motion.span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </TiltCard>
                  </motion.div>
                );
              }
              const floatDelay = i * 0.4;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={i === 1 ? 'lg:col-start-3 lg:row-start-1 group' : 'group'}
                  style={{ borderRadius: '24px' }}
                >
                  <TiltCard tiltDegree={5} className="h-full">
                    <motion.div
                      className="relative overflow-hidden rounded-[24px] h-full bg-white shadow-sm transition-shadow duration-500 hover:shadow-[0_8px_40px_-8px_rgba(30,58,138,0.15)]"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity, delay: floatDelay }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } }}
                    >
                      <span className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-black/[0.04] pointer-events-none group-hover:ring-safebus-blue/20 transition-all duration-500" />
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-safebus-blue via-safebus-yellow to-safebus-blue"
                        initial={{ scaleX: 0, originX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.2 + i * 0.1 }}
                      />
                      <div className="p-[clamp(1.1rem,1.8vw,1.8rem)]">
                        <motion.div
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-safebus-blue/10 to-safebus-blue/5 flex items-center justify-center mb-[clamp(0.9rem,1.2vw,1.2rem)] shadow-sm"
                          whileHover={{ rotate: 12, scale: 1.08, backgroundColor: 'rgba(30,58,138,0.15)' }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          <Icon className="h-[18px] w-[18px] text-safebus-blue" aria-hidden="true" />
                        </motion.div>
                        <h3 className="text-[clamp(1rem,1.15vw,1.15rem)] font-semibold text-charcoal leading-[1.25] tracking-[-0.022em] mb-[6px]">{f.title}</h3>
                        <p className="text-[clamp(0.85rem,0.95vw,0.95rem)] text-graphite leading-[1.55]">{f.desc}</p>
                      </div>
                    </motion.div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </motion.div>
        </FlowSection>

        {/* BENEFITS */}
        <FlowSection
          aria-label="Porquê o SafeBus"
          style={{
            backgroundColor: '#0f1f4a',
            backgroundImage: `radial-gradient(ellipse 80% 60% at 30% 20%, rgba(251,191,36,0.05) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 80%, rgba(255,255,255,0.02) 0%, transparent 50%)`,
            color: '#fff',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`,
              opacity: 0.025,
            }}
          />
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute top-[15%] right-[10%] w-72 h-72 border border-white/[0.02] rounded-full" />
            <div className="absolute bottom-[20%] left-[5%] w-48 h-48 border border-white/[0.015] rounded-full" />
          </div>
          <div ref={benefitsLabelRef}>
            <TextCursorProximity
              label="03 — Porquê o SafeBus?"
              className="text-sm will-change-transform font-bold uppercase tracking-[0.2em]"
              styles={{
                transform: { from: 'scale(1)', to: 'scale(1.3)' },
                color: { from: '#FFFFFF', to: '#FBBF24' },
              }}
              falloff="gaussian"
              radius={80}
              containerRef={benefitsLabelRef}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-[90%]"
          >
            <h2 className="serif text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.88] uppercase tracking-tight mb-6">
              Pais em Paz,{' '}
              <span className="text-safebus-yellow">Crianças Seguras</span>
            </h2>
            <p className="text-white/40 text-[clamp(0.95rem,1.1vw,1.1rem)] leading-[1.6] max-w-[50ch]">
              Mais de 12 000 alunos já usam o SafeBus. Escolhem-nos pela tranquilidade que entregamos todos os dias.
            </p>
          </motion.div>

          {/* Pillars — editorial split */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid lg:grid-cols-3 gap-px w-full rounded-2xl overflow-hidden bg-white/[0.04]"
          >
            {[
              {
                icon: ShieldCheck,
                title: 'Segurança Total',
                desc: 'Criptografia de ponta a ponta. Cada pai vê apenas os seus filhos. Cada motorista só a sua rota. Zero compromissos.',
                stat: '98%',
                statLabel: 'sentem-se seguros',
              },
              {
                icon: Bell,
                title: 'Alertas em Tempo Real',
                desc: 'Notificação no instante em que o autocarro parte, chega à paragem, e quando o seu filho embarca ou desembarca.',
                stat: '< 30s',
                statLabel: 'tempo médio de alerta',
              },
              {
                icon: Users,
                title: 'Gestão Centralizada',
                desc: 'Escolas gerem rotas, motoristas e pais num único painel. Sem papel, sem chamadas, sem confusão.',
                stat: '3×',
                statLabel: 'mais eficiente',
              },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="relative bg-[#0f1f4a] p-6 sm:p-8 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center ring-1 ring-inset ring-white/[0.06]">
                        <Icon className="h-[17px] w-[17px] text-safebus-yellow" />
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
                    </div>
                    <h3 className="text-[clamp(1.1rem,1.25vw,1.25rem)] font-semibold leading-[1.2] tracking-[-0.022em] mb-3">{p.title}</h3>
                    <p className="text-white/45 text-[clamp(0.85rem,0.95vw,0.95rem)] leading-[1.6] mb-5">{p.desc}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="serif text-[clamp(1.8rem,3vw,2.5rem)] font-bold text-safebus-yellow leading-none">{p.stat}</span>
                      <span className="text-white/35 text-[clamp(0.7rem,0.75vw,0.75rem)] uppercase tracking-[0.1em]">{p.statLabel}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-6 sm:pt-8 border-t border-white/[0.04] w-full"
          >
            {[
              { icon: School, label: '284+', sub: 'Escolas' },
              { icon: Award, label: '12 000+', sub: 'Alunos' },
              { icon: Smartphone, label: '98%', sub: 'Satisfação' },
            ].map((t, i) => {
              const TIcon = t.icon;
              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center">
                    <TIcon className="h-3.5 w-3.5 text-white/30" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white/80">{t.label}</span>
                    <span className="text-xs text-white/30 ml-1.5">{t.sub}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </FlowSection>

        {/* HOW IT WORKS */}
        <FlowSection aria-label="Como Funciona" style={{ backgroundColor: '#f1efdf', color: '#212529' }}>
          <div ref={howLabelRef}>
            <TextCursorProximity
              label="04 — Como Funciona"
              className="text-sm will-change-transform font-bold uppercase tracking-[0.2em]"
              styles={{
                transform: { from: "scale(1)", to: "scale(1.3)" },
                color: { from: "#212529", to: "#1E3A8A" },
              }}
              falloff="gaussian"
              radius={80}
              containerRef={howLabelRef}
            />
          </div>
          <motion.h2
            className="serif text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.88] uppercase tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            Comece Em 3 Passos
          </motion.h2>
          <div className="relative w-full py-4 sm:py-8">
            <svg className="absolute top-[3.5rem] left-[15%] right-[15%] w-[70%] h-0.5 hidden sm:block" style={{ overflow: 'visible' }}>
              <motion.line
                x1="0" y1="0"
                x2="100%" y2="0"
                stroke="#1E3A8A"
                strokeWidth="2"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
              />
            </svg>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="grid sm:grid-cols-3 gap-8 sm:gap-12 w-full relative"
            >
              {[
                {
                  num: '01', title: 'Cria a sua Conta', desc: 'Leva menos de 5 minutos. Registe-se como escola, motorista ou pai e comece já.',
                  preview: (
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-gray-100 bg-gray-50">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="h-2.5 w-1/2 rounded bg-gray-200" />
                        <div className="h-8 rounded-lg border border-gray-200 bg-gray-50 flex items-center px-2">
                          <span className="text-[8px] text-gray-400">nome@escola.pt</span>
                        </div>
                        <div className="h-8 rounded-lg border border-gray-200 bg-gray-50 flex items-center px-2">
                          <span className="text-[8px] text-gray-400">••••••••</span>
                        </div>
                        <div className="h-7 rounded-lg bg-safebus-blue flex items-center justify-center">
                          <span className="text-[8px] text-white font-medium">Criar Conta</span>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  num: '02', title: 'Configura as Rotas', desc: 'Associe motoristas, veículos e alunos. Tudo num painel simples e rápido.',
                  preview: (
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-gray-100 bg-gray-50">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="ml-2 text-[7px] text-gray-400">safebus.app/dashboard</span>
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex gap-2">
                          <div className="h-6 flex-1 rounded-md border border-gray-200 bg-gray-50 flex items-center px-2">
                            <span className="text-[7px] text-gray-400">Rota A · 12 alunos</span>
                          </div>
                          <div className="w-6 h-6 rounded-md bg-safebus-yellow/20 flex items-center justify-center">
                            <span className="text-[7px] text-safebus-blue font-bold">+</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[7px] text-gray-500">Rota B · 8 alunos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-safebus-yellow" />
                          <span className="text-[7px] text-gray-500">Rota C · 15 alunos</span>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  num: '03', title: 'Acompanha em Tempo Real', desc: 'Veja os autocarros no mapa e receba notificações a cada paragem.',
                  preview: (
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-gray-100 bg-gray-50">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                      <div className="p-3">
                        <div className="h-16 rounded-lg bg-gradient-to-br from-safebus-blue/10 to-gray-100 border border-gray-200/50 relative overflow-hidden">
                          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 64" fill="none">
                            <path d="M0 40 Q50 20 100 40 T200 32" stroke="#1E3A8A" strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
                            <circle cx="40" cy="32" r="1.5" fill="#1E3A8A" />
                            <circle cx="100" cy="40" r="1.5" fill="#1E3A8A" />
                            <circle cx="160" cy="30" r="1.5" fill="#1E3A8A" />
                          </svg>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="8" fill="#1E3A8A" />
                              <circle cx="12" cy="12" r="3" fill="white" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[7px] text-gray-500">Online</span>
                          </div>
                          <span className="text-[7px] text-gray-400">a 2 min</span>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="text-center relative group"
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-[60px] h-[60px] rounded-full bg-safebus-blue text-white text-[20px] font-semibold mb-6 relative z-10 ring-2 ring-transparent group-hover:ring-safebus-yellow/30 transition-all duration-500"
                    whileHover={{ scale: 1.12 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    {s.num}
                  </motion.div>
                  <h3 className="text-[clamp(1.1rem,1.4vw,1.4rem)] font-semibold leading-[1.3] tracking-[-0.022em] mb-[8px]">{s.title}</h3>
                  <p className="text-[clamp(0.9rem,1vw,1rem)] text-graphite leading-[1.6] max-w-[30ch] mx-auto mb-4">{s.desc}</p>
                  <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] max-h-0 group-hover:max-h-[240px] opacity-0 group-hover:opacity-100">
                    <div className="origin-top transform scale-[0.92] group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
                      {s.preview}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </FlowSection>

        {/* CTA */}
        <FlowSection
          aria-label="Começar"
          style={{ backgroundColor: '#0a1538', color: '#fff' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
              opacity: 0.02,
            }}
          />

          <div ref={ctaLabelRef}>
            <TextCursorProximity
              label="✦ 05 — Vamos Começar"
              className="text-sm will-change-transform font-bold uppercase tracking-[0.2em]"
              styles={{
                transform: { from: "scale(1)", to: "scale(1.3)" },
                color: { from: "#FFFFFF", to: "#FBBF24" },
              }}
              falloff="gaussian"
              radius={80}
              containerRef={ctaLabelRef}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 w-full items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
              <h2 className="serif text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.88] uppercase tracking-tight mb-5">
                Junte-se a<br />
                <span className="text-safebus-yellow">284+ Escolas</span>
              </h2>
              <p className="text-white/40 text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.6] max-w-[38ch] mb-8">
                Gratuito para começar. Configuração em 5 minutos. Sem compromisso.
              </p>
              <div className="flex flex-wrap gap-3">
                <MagneticButton>
                  <Link to="/auth/register">
                    <Button className="relative overflow-hidden bg-safebus-yellow text-charcoal font-semibold text-[clamp(0.9rem,1vw,1rem)] px-7 py-[0.85rem] rounded-full shadow-lg group">
                      <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)]" />
                      <span className="relative z-10 inline-flex items-center gap-2 group-hover:text-charcoal transition-colors duration-300">
                        Começar Gratuitamente
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </span>
                    </Button>
                  </Link>
                </MagneticButton>
                <Link to="/pricing">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white/70 hover:border-white/50 hover:text-white text-[clamp(0.9rem,1vw,1rem)] font-medium px-7 py-[0.85rem] rounded-full bg-transparent"
                  >
                    Ver Planos
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-3"
            >
              {[
                { icon: School, title: 'Sou Escola', desc: 'Gerir rotas, motoristas e alunos num painel unificado.' },
                { icon: Users, title: 'Sou Pai/Mãe', desc: 'Acompanhar o percurso dos meus filhos em tempo real.' },
                { icon: Bus, title: 'Sou Motorista', desc: 'Receber a rota do dia e confirmar embarques.' },
              ].map((card, i) => {
                const CardIcon = card.icon;
                return (
                  <motion.div key={i} variants={fadeUp}>
                    <Link to="/auth/register" className="block group">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] group-hover:border-white/[0.08] group-hover:bg-white/[0.04] transition-all duration-300">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center shrink-0 ring-1 ring-white/[0.05] group-hover:ring-safebus-yellow/30 group-hover:bg-safebus-yellow/5 transition-all duration-300">
                          <CardIcon className="h-[18px] w-[18px] text-white/40 group-hover:text-safebus-yellow transition-colors duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[clamp(0.95rem,1.05vw,1.05rem)] font-semibold leading-[1.2] tracking-[-0.02em]">{card.title}</h3>
                            <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-safebus-yellow/60 group-hover:translate-x-0.5 transition-all duration-300" />
                          </div>
                          <p className="text-white/35 text-[clamp(0.8rem,0.85vw,0.85rem)] leading-[1.4] mt-0.5">{card.desc}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </FlowSection>

        {/* FOOTER */}
        <FlowSection aria-label="Rodapé" style={{ backgroundColor: '#1E3A8A', color: '#fff' }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid sm:grid-cols-3 gap-10 w-full"
          >
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-white/15 flex items-center justify-center">
                  <Bus className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-medium text-[clamp(0.9rem,1vw,1rem)] tracking-[-0.022em]">SafeBus</span>
              </div>
              <p className="text-white/40 text-[clamp(0.85rem,0.9vw,0.95rem)] leading-[1.6] max-w-[280px]">
                Segurança em cada trajeto. Plataforma de monitorização de transporte escolar em tempo real.
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <h4 className="text-[clamp(0.7rem,0.8vw,0.85rem)] font-semibold text-white/60 uppercase tracking-[0.025em] mb-4">Plataforma</h4>
              <div className="space-y-3">
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="block text-[clamp(0.85rem,0.9vw,0.95rem)] text-white/50 hover:text-white transition-colors">
                  Funcionalidades
                </button>
                <Link to="/pricing" className="block text-[clamp(0.85rem,0.9vw,0.95rem)] text-white/50 hover:text-white transition-colors">Preços</Link>
              </div>
            </motion.div>
            <motion.div variants={fadeUp}>
              <h4 className="text-[clamp(0.7rem,0.8vw,0.85rem)] font-semibold text-white/60 uppercase tracking-[0.025em] mb-4">Acesso</h4>
              <div className="space-y-3">
                <Link to="/auth/login" className="block text-[clamp(0.85rem,0.9vw,0.95rem)] text-white/50 hover:text-white transition-colors">Entrar</Link>
                <Link to="/auth/register" className="block text-[clamp(0.85rem,0.9vw,0.95rem)] text-white/50 hover:text-white transition-colors">Criar Conta</Link>
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <hr className="my-[2vw] border-none border-t border-white/10" />
            <p className="text-center text-[clamp(0.8rem,0.9vw,0.9rem)] text-white/30">&copy; {new Date().getFullYear()} SafeBus. Todos os direitos reservados.</p>
          </motion.div>
        </FlowSection>

      </FlowArt>
    </div>
  );
};

export default LandingPage;
