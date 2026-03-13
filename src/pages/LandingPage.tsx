import {
  Building2,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  ArrowDown,
  Users,
  Heart,
  CheckCircle2,
  Cpu,
  ListChecks,
  BarChart3,
  AlertTriangle,
  Eye,
  Megaphone,
  Vote,
  UserX,
  RefreshCw,
  Frown,
  Zap,
  MapPin,
  Calendar,
  MonitorSmartphone,
  Stethoscope,
  ArrowRight,
  Search,
  ClipboardList,
  Timer,
  UserCheck,
  Brain,
  Phone,
  Mail,
  Lock,
  Server,
  ScanEye,
  Plug,
  LayoutDashboard,
  Mic,
  Newspaper,
  CircleCheckBig,
  Quote,
  TrendingUp,
  HeartPulse,
  Globe,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/domain/enums/user-role";

// ─── Animated Section Wrapper ─────────────────────────────
function AnimatedSection({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────
const navItems = [
  { label: "Problema", href: "#problema" },
  { label: "Solução", href: "#solucao" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Impacto", href: "#impacto" },
  { label: "Demo", href: "#demo" },
  { label: "Preço", href: "#preco" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-transparent"}`}>
      <div className="container flex items-center justify-between h-16">
        <a href="#" className="font-display text-xl font-extrabold text-foreground">
          Fila Zero <span className="text-primary">Saúde</span>
        </a>

        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex border-border font-semibold"
            onClick={() => navigate("/app")}
          >
            Ver Demo
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground font-semibold">
            <a href="#contato">Agendar Reunião</a>
          </Button>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate();
  return (
    <section id="hero" className="relative overflow-hidden bg-background min-h-[90vh] flex items-center pt-20">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-secondary/5" />
      <div className="container relative z-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="border-l border-border pl-3">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Gestão Municipal</p>
                <p className="text-sm font-semibold text-foreground">Secretaria de Saúde</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-4 py-1.5 text-sm font-semibold">
              <Zap className="h-4 w-4" />
              Projeto Estratégico
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight">
              <span className="text-foreground">Programa</span><br />
              <span className="text-foreground">Fila Zero </span>
              <span className="text-primary">Saúde</span>
            </h1>

            <div className="w-16 h-1.5 rounded-full bg-primary" />

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Tecnologia e Inteligência para <strong className="text-foreground">Reduzir Filas</strong> e Aceleração do Atendimento no <strong className="text-foreground">SUS</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base px-8 h-14 rounded-xl" asChild>
                <a href="#contato">
                  Agendar Apresentação
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="font-semibold text-base px-8 h-14 rounded-xl border-border" onClick={() => navigate("/app")}>
                Ver Demo da Plataforma
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 rounded-full border-[6px] border-muted bg-card shadow-2xl flex flex-col items-center justify-center gap-4">
                <MonitorSmartphone className="h-16 w-16 text-secondary" />
                <p className="font-display text-xl font-bold text-foreground">Saúde Digital</p>
                <p className="text-sm text-muted-foreground">Eficiência & Dados</p>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 right-8 h-10 w-10 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-destructive" />
              </div>
              <div className="absolute bottom-8 -left-4 h-10 w-10 rounded-full bg-secondary/10 border-2 border-secondary/30 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 bg-secondary text-secondary-foreground rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-amber-300" />
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">Localidade</p>
              <p className="font-semibold">Município de ____________</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-amber-300" />
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider opacity-80">Vigência</p>
              <p className="font-semibold">Ano 2026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section Header ───────────────────────────────────────
function SectionHeader({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div className="mb-12">
      <p className="text-xs font-bold tracking-[0.2em] uppercase text-secondary mb-2">{subtitle}</p>
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground">{title}</h2>
    </div>
  );
}

// ─── O Problema Real ──────────────────────────────────────
function ProblemSection() {
  const causes = [
    { icon: ClipboardList, text: "Encaminhamentos mal direcionados" },
    { icon: Clock, text: "Exames solicitados tarde demais" },
    { icon: FileText, text: "Dados clínicos desorganizados" },
    { icon: ListChecks, text: "Falta de priorização inteligente" },
    { icon: UserCheck, text: "Especialistas recebendo pacientes sem preparo" },
  ];

  const consequences = [
    { icon: Users, title: "Filas Longas", desc: "Pacientes aguardam meses por uma consulta que poderia ser resolvida antes." },
    { icon: RefreshCw, title: "Retornos & Retrabalho", desc: "Consultas improdutivas geram novos agendamentos desnecessários, ocupando a agenda." },
    { icon: Frown, title: "Insatisfação Popular", desc: "A percepção de mau atendimento gera desgaste político e reclamações na ouvidoria." },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <SectionHeader subtitle="Diagnóstico Inicial" title="O Problema Real" />

        <div className="bg-secondary/5 border-l-4 border-secondary rounded-r-xl p-6 mb-12 max-w-4xl">
          <p className="text-lg md:text-xl text-foreground">
            Hoje, o maior gargalo da saúde pública <span className="text-destructive font-bold">não é falta de médico</span>.
          </p>
          <p className="text-muted-foreground mt-1">A ineficiência está nos processos de gestão e regulação do acesso.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">
              <Search className="h-4 w-4" /> Causas (Gargalos)
            </h3>
            <div className="space-y-3">
              {causes.map((c, i) => (
                <Card key={i} className="border-border shadow-sm">
                  <CardContent className="flex items-center gap-4 p-4">
                    <c.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-foreground">{c.text}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-destructive mb-6">
              <AlertTriangle className="h-4 w-4" /> Consequências
            </h3>
            <div className="space-y-4">
              {consequences.map((c, i) => (
                <div key={i} className="bg-destructive/5 border border-destructive/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <c.icon className="h-5 w-5 text-destructive" />
                    <h4 className="font-display font-bold text-destructive">{c.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Custo Político ───────────────────────────────────────
function PoliticalCostSection() {
  const crises = [
    { icon: Megaphone, title: "Reclamação na Ouvidoria", desc: "Aumento exponencial de protocolos de insatisfação que geram estatísticas negativas para a gestão." },
    { icon: Building2, title: "Pressão no Gabinete", desc: "Demandas individuais chegam diretamente ao prefeito e secretários, travando a agenda estratégica." },
    { icon: Vote, title: "Exposição na Câmara", desc: "Requerimentos de vereadores e uso da tribuna para expor falhas no atendimento à população." },
    { icon: UserX, title: "Desgaste Eleitoral", desc: "A saúde é o principal critério de avaliação pública. Filas corroem a aprovação do governo." },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <SectionHeader subtitle="Impacto na Gestão" title="O Custo Político da Fila" />

        <p className="text-muted-foreground mb-4 text-lg border-l-4 border-destructive pl-4">
          Fila longa significa crise institucional:
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl">
          {crises.map((c, i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardContent className="p-6 flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <c.icon className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-foreground mb-1">{c.title}</h4>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conclusion card */}
        <div className="max-w-md ml-auto">
          <Card className="border-primary/20 bg-card shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-primary mx-auto flex items-center justify-center">
                <BarChart3 className="h-7 w-7 text-primary-foreground" />
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">A Conclusão é Clara</p>
              <p className="font-display text-xl font-bold text-foreground">
                Reduzir fila é<br />
                <span className="text-primary">Ganho Técnico</span>
                <br />&<br />
                <span className="text-primary">Ganho Político</span>
              </p>
              <div className="w-8 h-0.5 bg-muted mx-auto" />
              <p className="text-sm text-muted-foreground">Transforme o maior problema da cidade na sua maior vitória de gestão.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ─── A Solução ────────────────────────────────────────────
function SolutionSection() {
  const pillars = [
    { icon: ClipboardList, title: "Antes da Consulta", desc: "Coleta estruturada de dados clínicos e histórico do paciente na ponta, garantindo informações completas desde o início." },
    { icon: Cpu, title: "Durante o Encaminhamento", desc: "Algoritmos validam a necessidade real do encaminhamento e sugerem condutas alternativas na Atenção Básica quando possível." },
    { icon: ListChecks, title: "Na Organização da Fila", desc: "Classificação de risco dinâmica. A fila deixa de ser por ordem de chegada e passa a ser por gravidade e urgência clínica." },
    { icon: Stethoscope, title: "Suporte ao Especialista", desc: "O médico recebe o paciente com exames prévios já solicitados e um resumo clínico, evitando consultas de retorno vazias." },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <SectionHeader subtitle="Tecnologia & Inovação" title="A Solução" />

        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-12">
          <div className="max-w-3xl">
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Inteligência Clínica <span className="text-primary">Antes</span> do Encaminhamento
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              O Programa Fila Zero Saúde não apenas organiza a fila, ele a qualifica. Adicionamos uma camada de triagem digital inteligente que garante que apenas quem realmente precisa chegue ao especialista, e com os dados corretos.
            </p>
          </div>
          <div className="border border-border rounded-xl px-6 py-4 bg-card shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Tecnologia</p>
            <p className="font-display text-2xl font-bold text-secondary">Trya.ai</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => (
            <Card key={i} className="border-border shadow-sm text-center">
              <CardContent className="p-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-secondary/10 mx-auto flex items-center justify-center">
                  <p.icon className="h-8 w-8 text-secondary" />
                </div>
                <h4 className="font-display font-bold text-sm uppercase tracking-wide text-foreground">{p.title}</h4>
                <div className="w-8 h-0.5 bg-muted mx-auto" />
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Como Funciona ────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: 1, icon: ClipboardList, title: "Coleta Estruturada de Dados", desc: "Médico da UBS preenche protocolo clínico digital padronizado." },
    { num: 2, icon: Cpu, title: "Análise Clínica Automatizada", desc: "IA verifica gravidade e valida critérios de encaminhamento." },
    { num: 3, icon: Filter, title: "Sugestão de Exames", desc: "Sistema solicita exames prévios antes do encaminhamento." },
    { num: 4, icon: ListChecks, title: "Classificação de Prioridade", desc: "IA define urgência real para organizar a fila de espera." },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <SectionHeader subtitle="Fluxo na UBS" title="Como Funciona na Prática" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-display font-bold text-lg shadow-md">
                  {s.num}
                </div>
              </div>
              <Card className="border-border shadow-sm pt-8">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-secondary/10 mx-auto flex items-center justify-center">
                    <s.icon className="h-7 w-7 text-secondary" />
                  </div>
                  <h4 className="font-display font-bold text-foreground">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
              {i < 3 && (
                <ChevronRight className="hidden lg:block absolute top-1/2 -right-4 h-6 w-6 text-muted-foreground/40" />
              )}
            </div>
          ))}
        </div>

        {/* Result banner */}
        <div className="bg-primary rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 text-primary-foreground">
          <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Resultado</p>
            <p className="font-display text-xl md:text-2xl font-bold">Paciente já chega preparado para o especialista</p>
            <p className="opacity-80 mt-1">Fim dos retornos improdutivos. Consulta 100% resolutiva na primeira visita.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Impacto Esperado ─────────────────────────────────────
function ImpactSection() {
  const metrics = [
    { category: "Eficiência", value: "20–35%", label: "Redução no Tempo Médio de Fila", desc: "Menos tempo de espera para o cidadão.", color: "text-primary", icon: Timer },
    { category: "Triagem", value: "15–30%", label: "Redução em Encaminhamentos Desnecessários", desc: "Filtro inteligente antes da especialidade.", color: "text-secondary", icon: Filter },
    { category: "Produtividade", value: "↓", label: "Retornos Improdutivos", desc: "Consultas mais assertivas na primeira vez. Redução drástica.", color: "text-primary", icon: RefreshCw },
    { category: "Qualidade", value: "↑", label: "Resolutividade Atenção Básica", desc: "Mais problemas resolvidos no próprio UBS. Aumento significativo.", color: "text-secondary", icon: UserCheck },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <SectionHeader subtitle="Resultados Projetados" title="Impacto Esperado" />

        <div className="bg-secondary/5 border-l-4 border-secondary rounded-r-xl p-4 mb-12 max-w-3xl">
          <p className="text-muted-foreground">Experiência projetada para municípios de médio porte (100k – 300k hab)</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {metrics.map((m, i) => (
            <Card key={i} className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <span className={`text-sm font-bold uppercase tracking-wider ${m.color}`}>{m.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-4xl md:text-5xl font-extrabold text-foreground">{m.value}</p>
                    <p className="font-semibold text-foreground mt-2">{m.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                  </div>
                  <m.icon className="h-12 w-12 text-muted-foreground/20 flex-shrink-0" />
                </div>
                <div className={`h-1 w-full mt-6 rounded-full ${i % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── O que muda para o Cidadão ────────────────────────────
function CitizenImpactSection() {
  const benefits = [
    { icon: Zap, title: "Encaminhamento Rápido", desc: "Priorização inteligente reduz o tempo de fila drasticamente." },
    { icon: FileText, title: "Diagnóstico Antecipado", desc: "Exames já prontos na primeira consulta com o especialista." },
    { icon: CheckCircle2, title: "Menos Retornos", desc: "Alta resolutividade elimina idas e vindas desnecessárias." },
    { icon: Heart, title: "Menos Sofrimento", desc: "Atendimento humanizado que respeita o tempo do cidadão." },
  ];

  const problems = [
    "Diagnóstico tardio e agravamento",
    "Ansiedade e incerteza para a família",
    "Descrença no serviço público",
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <SectionHeader subtitle="Impacto Social" title="O que Muda para o Cidadão" />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Today */}
          <div>
            <div className="inline-block bg-foreground text-background rounded-full px-4 py-1 text-sm font-semibold mb-6">
              Situação Atual
            </div>
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-display font-bold text-foreground text-lg">Hoje</h4>
                </div>
                <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-8 text-center mb-6">
                  <p className="font-display text-5xl font-extrabold text-destructive">2 a 4</p>
                  <p className="font-bold text-foreground mt-2">Meses de Espera</p>
                </div>
                <ul className="space-y-3">
                  {problems.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="h-5 w-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-destructive text-xs">✕</span>
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* With program */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <h4 className="font-display font-bold text-foreground text-lg">Com o Programa</h4>
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Novo Padrão</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <Card key={i} className="border-primary/10 bg-primary/5">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <b.icon className="h-5 w-5 text-primary" />
                      <h5 className="font-display font-bold text-foreground">{b.title}</h5>
                    </div>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── O que muda para o Gestor ─────────────────────────────
function ManagerImpactSection() {
  const blindSpots = [
    "Decisões baseadas em 'feeling'",
    "Dificuldade em justificar verbas",
    "Reatividade a crises e imprensa",
  ];

  const capabilities = [
    { icon: Clock, title: "Dados em Tempo Real", desc: "Painéis atualizados instantaneamente para decisões rápidas.", color: "bg-secondary/10 text-secondary" },
    { icon: AlertTriangle, title: "Relatório de Gargalos", desc: "Identificação exata de onde a fila trava e porquê.", color: "bg-destructive/10 text-destructive" },
    { icon: Users, title: "Monitoramento por Especialidade", desc: "Visão granular da demanda em ortopedia, cardiologia, etc.", color: "bg-primary/10 text-primary" },
    { icon: FileText, title: "Base para Prestação de Contas", desc: "Transparência total e relatórios auditáveis para órgãos de controle.", color: "bg-amber-100 text-amber-700" },
    { icon: BarChart3, title: "Argumento para Repasse Federal", desc: "Dados técnicos robustos para solicitar verbas estaduais e federais.", color: "bg-purple-100 text-purple-700" },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <SectionHeader subtitle="Eficiência e Controle" title="O que Muda para o Gestor" />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Traditional */}
          <div>
            <div className="inline-block bg-foreground text-background rounded-full px-4 py-1 text-sm font-semibold mb-6">
              Gestão Tradicional
            </div>
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-display font-bold text-foreground">Pontos Cegos</h4>
                </div>
                <div className="bg-muted rounded-xl p-8 text-center mb-6">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-display font-bold text-muted-foreground text-sm uppercase tracking-wider">
                    Sem Métricas<br />em Tempo Real
                  </p>
                </div>
                <ul className="space-y-3">
                  {blindSpots.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="text-destructive">✕</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Smart management */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <Brain className="h-4 w-4 text-secondary-foreground" />
              </div>
              <h4 className="font-display font-bold text-foreground text-lg">Gestão Inteligente</h4>
              <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Controle Total</span>
            </div>
            <div className="space-y-3">
              {capabilities.map((c, i) => (
                <Card key={i} className="border-border shadow-sm">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`h-10 w-10 rounded-xl ${c.color} flex items-center justify-center flex-shrink-0`}>
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">{c.title}</h5>
                      <p className="text-sm text-muted-foreground">{c.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Modelo de Implementação ──────────────────────────────
function ImplementationSection() {
  const phases = [
    {
      num: 1,
      duration: "30 Dias",
      title: "Diagnóstico",
      subtitle: "Preparação e Planejamento",
      heading: "Entendimento do Cenário Atual",
      items: [
        "Mapeamento detalhado das filas existentes",
        "Análise dos fluxos de encaminhamento atuais",
        "Levantamento de dados e integração de sistemas",
      ],
      bg: "bg-secondary",
    },
    {
      num: 2,
      duration: "6 Meses",
      title: "Piloto",
      subtitle: "Teste Controlado e Ajustes",
      heading: "Prova de Conceito Real",
      items: [
        "Implementação em 3 a 5 UBS selecionadas",
        "Foco em 1 especialidade prioritária (Ex: Ortopedia ou Cardiologia)",
        "Monitoramento intensivo de resultados iniciais",
      ],
      bg: "bg-primary",
    },
    {
      num: 3,
      duration: "Contínuo",
      title: "Expansão",
      subtitle: "Escala para Rede Municipal",
      heading: "Consolidação do Modelo",
      items: [
        "Aplicação em todas as UBS do município",
        "Inclusão de todas as especialidades médicas",
        "Estabelecimento de novos protocolos padrão",
      ],
      bg: "bg-foreground",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <SectionHeader subtitle="Cronograma e Etapas" title="Modelo de Implementação" />

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {phases.map((p) => (
            <div key={p.num} className="relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                <div className={`h-12 w-12 rounded-full ${p.bg} text-background flex items-center justify-center font-display font-bold text-xl shadow-lg`}>
                  {p.num}
                </div>
              </div>
              <Card className="border-border shadow-sm pt-10 h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <span className="inline-block bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {p.duration}
                    </span>
                    <h4 className="font-display text-2xl font-bold text-foreground mt-3">{p.title}</h4>
                    <p className="text-sm text-muted-foreground">{p.subtitle}</p>
                  </div>

                  <div className={`${p.num === 3 ? 'bg-foreground text-background' : 'bg-secondary/10 text-secondary'} rounded-lg p-3 text-center text-sm font-semibold`}>
                    {p.heading}
                  </div>

                  <ul className="space-y-3">
                    {p.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4 max-w-3xl mx-auto">
          <span className="text-2xl">💡</span>
          <p className="text-sm text-amber-800">
            O modelo em fases reduz riscos de implementação e permite ajustes rápidos antes da escala total.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Modelo de Contratação ─────────────────────────────────
function PricingSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <SectionHeader subtitle="Viabilidade Financeira" title="Modelo de Contratação" />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Formats */}
          <div>
            <h3 className="flex items-center gap-2 font-display font-bold text-foreground text-lg mb-6">
              <FileText className="h-5 w-5 text-secondary" /> Formatos Sugeridos
            </h3>

            <Card className="border-border shadow-sm mb-4">
              <CardContent className="p-6 flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-display font-bold text-foreground">Licença por Habitante</h4>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full uppercase">Recomendado</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Ideal para cobertura total do município. Valor escala conforme o porte da cidade, garantindo previsibilidade orçamentária.</p>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-muted-foreground text-sm my-4">ou</p>

            <Card className="border-border shadow-sm">
              <CardContent className="p-6 flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-foreground">Licença por UBS</h4>
                  <p className="text-sm text-muted-foreground">Focado em projetos piloto ou implementação gradual por distritos de saúde. Cobrança por unidade de saúde ativa.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Example */}
          <div className="space-y-6">
            <Card className="bg-secondary text-secondary-foreground border-0 shadow-lg">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-xl flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Exemplo Prático
                  </h4>
                  <span className="bg-secondary-foreground/20 px-3 py-1 rounded-full text-sm font-semibold">Município Médio Porte</span>
                </div>

                <div className="flex justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-70">População</p>
                    <p className="font-display text-4xl font-extrabold">150.000</p>
                    <p className="text-sm opacity-80">habitantes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider opacity-70">Investimento Anual</p>
                    <p className="font-display">
                      <span className="text-sm">R$</span> <span className="text-4xl font-extrabold">2</span> <span className="text-sm">a R$</span> <span className="text-4xl font-extrabold">4</span>
                    </p>
                    <p className="text-sm opacity-80">por habitante / ano</p>
                  </div>
                </div>

                <div className="bg-secondary-foreground/10 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="text-sm opacity-80">Custo Total Estimado</p>
                    <p className="font-display font-bold text-lg">R$ 300.000 a R$ 600.000 / ano</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">Impacto no Orçamento da Saúde</h4>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Alta Viabilidade
                  </span>
                </div>
                <p className="text-primary font-bold mb-2">↓ 0,5%</p>
                <div className="w-full bg-muted rounded-full h-3 mb-4">
                  <div className="bg-secondary h-3 rounded-full" style={{ width: '0.5%', minWidth: '8px' }} />
                </div>
                <p className="text-sm text-muted-foreground">
                  O investimento representa <strong className="text-foreground">menos de 0,5%</strong> do orçamento médio anual da saúde, com alto retorno em eficiência e satisfação.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Diferenciais e Integração ────────────────────────────
function IntegrationSection() {
  const legacySystems = [
    { title: "e-SUS / PEC", desc: "Base de dados oficial mantida" },
    { title: "SISREG", desc: "Fluxo regulatório preservado" },
    { title: "Prontuário", desc: "Sem migração de legado" },
  ];

  const capabilities = [
    { icon: Plug, title: "Integração API", desc: "Conecta aos dados sem romper processos atuais." },
    { icon: Cpu, title: "IA Clínica", desc: "Algoritmos que analisam prioridades reais." },
    { icon: ListChecks, title: "Saneamento", desc: "Limpa duplicidades e organiza a fila automaticamente." },
    { icon: LayoutDashboard, title: "Dashboard", desc: "Visão gerencial que os sistemas antigos não têm." },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <SectionHeader subtitle="Tecnologia Segura" title="Diferenciais e Integração" />

        <Card className="border-border shadow-sm mb-8">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-[1fr_auto_2fr] gap-8 items-start">
              {/* Legacy */}
              <div>
                <h3 className="font-display font-bold text-foreground text-lg mb-6 flex items-center gap-2">
                  <span className="text-muted-foreground">◉</span> Não Substitui
                </h3>
                <div className="space-y-3">
                  {legacySystems.map((s, i) => (
                    <Card key={i} className="border-border">
                      <CardContent className="p-4">
                        <h5 className="font-semibold text-foreground">{s.title}</h5>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center h-full">
                <div className="h-8 w-8 rounded-full border-2 border-secondary flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-secondary" />
                </div>
              </div>

              {/* New capabilities */}
              <div>
                <h3 className="font-display font-bold text-foreground text-lg mb-6 flex items-center gap-2">
                  <span className="text-secondary">◐</span> Integra e Adiciona Inteligência
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {capabilities.map((c, i) => (
                    <Card key={i} className="border-l-2 border-l-primary border-border">
                      <CardContent className="p-4 space-y-2">
                        <c.icon className="h-6 w-6 text-secondary" />
                        <h5 className="font-semibold text-foreground">{c.title}</h5>
                        <p className="text-sm text-muted-foreground">{c.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom benefits */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-primary border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-display font-bold text-foreground">Baixo Risco Político</h4>
                <p className="text-sm text-muted-foreground">Sem "virada de chave" traumática. O atendimento não para durante a implantação.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-display font-bold text-foreground">Alta Visibilidade</h4>
                <p className="text-sm text-muted-foreground">Resultados rápidos e perceptíveis para a população em curto prazo.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ─── Segurança e Conformidade ─────────────────────────────
function SecuritySection() {
  const items = [
    { icon: ListChecks, title: "LGPD & Conformidade", badge: "100% Adequado", badgeColor: "bg-primary/10 text-primary", desc: "Total aderência à Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Tratamento de dados com bases legais claras, anonimização para relatórios estatísticos e respeito aos direitos dos titulares.", tags: ["Consentimento", "Finalidade"] },
    { icon: Lock, title: "Dados Criptografados", badge: "Militar", badgeColor: "bg-secondary/10 text-secondary", desc: "Segurança técnica avançada. Todos os dados são criptografados tanto em trânsito (TLS 1.3) quanto em repouso (AES-256).", tags: ["End-to-End", "SSL/TLS"] },
    { icon: Server, title: "Hospedagem Segura", badge: "Tier III", badgeColor: "bg-muted text-muted-foreground", desc: "Infraestrutura em nuvem certificada (ISO 27001), com redundância geográfica e backups automáticos. Alta disponibilidade (SLA 99.9%).", tags: ["ISO 27001", "SLA 99.9%"] },
    { icon: ScanEye, title: "Acesso Auditável", badge: "Rastreável", badgeColor: "bg-amber-50 text-amber-700", desc: "Governança total. O sistema mantém logs imutáveis de todas as ações: quem acessou, quando acessou e qual dado foi visualizado.", tags: ["Logs", "Governança"] },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <SectionHeader subtitle="Proteção de Dados" title="Segurança e Conformidade" />

        <p className="text-lg text-muted-foreground mb-12 max-w-4xl">
          A infraestrutura do Programa Fila Zero Saúde foi desenhada priorizando a <strong className="text-foreground">privacidade do paciente</strong> e a <strong className="text-foreground">soberania dos dados municipais</strong>, atendendo aos mais rigorosos padrões legais.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {items.map((item, i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <span className={`${item.badgeColor} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-display font-bold text-foreground text-lg">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                <div className="flex gap-2">
                  {item.tags.map((tag, j) => (
                    <span key={j} className="border border-border text-muted-foreground text-xs px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── O Ganho Político ─────────────────────────────────────
function PoliticalGainSection() {
  const outcomes = [
    { icon: Newspaper, title: "Manchete Positiva", desc: 'Notícia de impacto na imprensa local e regional, mudando a pauta de "reclamação" para "solução".' },
    { icon: Mic, title: "Discurso Forte", desc: "Argumento técnico irrefutável para entrevistas, debates e prestação de contas nas redes sociais." },
    { icon: CircleCheckBig, title: "Plano Cumprido", desc: "Validação de promessa de campanha com entrega mensurável antes do final do mandato.", highlight: true },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <SectionHeader subtitle="Resultados & Narrativa" title="O Ganho Político" />

        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-block bg-muted text-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-6">O Prefeito Anuncia</span>

          <div className="relative bg-muted/50 border border-border rounded-2xl p-8 md:p-12">
            <Quote className="absolute top-4 left-6 h-10 w-10 text-muted-foreground/20" />
            <Quote className="absolute bottom-4 right-6 h-10 w-10 text-muted-foreground/20 rotate-180" />
            <p className="font-display text-2xl md:text-3xl text-foreground leading-relaxed">
              Em <span className="text-primary font-bold">6 meses</span> reduzimos a fila de especialidades em <span className="bg-primary/10 text-primary font-extrabold px-2 py-1 rounded-lg">28%</span>.
            </p>
          </div>

          <ArrowDown className="h-6 w-6 text-muted-foreground mx-auto my-6" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Isso se transforma em:</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {outcomes.map((o, i) => (
            <Card key={i} className={`border-border shadow-sm ${o.highlight ? 'border-t-4 border-t-primary' : ''}`}>
              <CardContent className="p-6 text-center space-y-4">
                <div className={`h-14 w-14 rounded-full mx-auto flex items-center justify-center ${o.highlight ? 'bg-primary text-primary-foreground' : 'bg-secondary/10 text-secondary'}`}>
                  <o.icon className="h-7 w-7" />
                </div>
                <h4 className="font-display font-bold text-foreground">{o.title}</h4>
                <p className="text-sm text-muted-foreground">{o.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Projeção de Impacto Local ────────────────────────────
function LocalImpactSection() {
  const chartData = [
    { name: "Hoje (Cenário Atual)", dias: 90, fill: "hsl(0, 84%, 60%)" },
    { name: "Em 6 Meses", dias: 60, fill: "hsl(40, 90%, 55%)" },
    { name: "Em 12 Meses", dias: 45, fill: "hsl(160, 68%, 40%)" },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <SectionHeader subtitle="Simulação Prática" title="Projeção de Impacto Local" />

        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">
          {/* Scenario */}
          <Card className="border-l-4 border-l-secondary border-border">
            <CardContent className="p-8 space-y-6">
              <h3 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-secondary" /> Cenário Base
              </h3>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Município (Simulação)</p>
                <p className="flex items-center gap-2 mt-1">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-display text-3xl font-extrabold text-foreground">120.000</span>
                  <span className="text-sm text-muted-foreground">habitantes</span>
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Especialidade Crítica</p>
                <p className="font-display font-bold text-foreground text-lg mt-1 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-muted-foreground" /> Ortopedia
                </p>
                <p className="text-destructive text-sm font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Fila de 1.200 pacientes
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Situação Atual</p>
                <p className="flex items-center gap-2 mt-1">
                  <Clock className="h-5 w-5 text-destructive" />
                  <span className="font-display text-3xl font-extrabold text-destructive">90 Dias</span>
                </p>
                <p className="text-sm text-muted-foreground">Tempo médio de espera para 1ª consulta</p>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-foreground text-lg">Redução do Tempo de Espera (Previsão)</h3>
              <span className="border border-border text-secondary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Meta: Eficiência Máxima
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={80}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: 'Dias de Espera', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
                  <Bar dataKey="dias" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-end mt-4">
              <span className="border-2 border-primary text-primary font-display font-bold text-xl px-4 py-2 rounded-xl">
                -50% <span className="text-xs uppercase tracking-wider font-normal">em 12 meses</span>
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <Card className="border-border bg-secondary/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="font-display text-2xl font-bold text-secondary">6</span>
                  <div>
                    <p className="text-xs font-bold text-secondary uppercase">Curto Prazo (6 Meses)</p>
                    <p className="text-sm text-foreground">Redução para <strong className="text-primary">60 dias</strong></p>
                    <p className="text-xs text-muted-foreground">Otimização de agenda e triagem</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-primary/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="font-display text-2xl font-bold text-primary">12</span>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase">Médio Prazo (1 Ano)</p>
                    <p className="text-sm text-foreground">Redução para <strong className="text-primary">45 dias</strong></p>
                    <p className="text-xs text-muted-foreground">Estabilização do fluxo inteligente</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Visão de Longo Prazo ─────────────────────────────────
function VisionSection() {
  const pillars = [
    { icon: BarChart3, title: "Saúde Baseada em Dados", desc: 'Decisões de gestão tomadas com inteligência em tempo real, eliminando o "achismo" e direcionando recursos para onde salvam mais vidas.' },
    { icon: HeartPulse, title: "Atenção Básica Resolutiva", desc: "Fortalecimento das UBSs com suporte diagnóstico rápido, reduzindo a pressão sobre hospitais e especialidades." },
    { icon: Globe, title: "Referência Nacional", desc: "Município reconhecido como modelo de inovação em gestão de saúde pública no país." },
    { icon: Handshake, title: "Saúde como Legado", desc: "Construção de uma rede de saúde que transcende mandatos, com processos inteligentes e sustentáveis." },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader subtitle="O Legado da Gestão" title="Visão de Longo Prazo" />
            <div className="w-16 h-1.5 rounded-full bg-primary mb-8" />
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Mais do que reduzir filas hoje, o Programa Fila Zero Saúde planta as bases para um sistema de saúde pública moderno, humano e eficiente.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {pillars.map((p, i) => (
                <Card key={i} className="border-t-2 border-t-secondary border-border">
                  <CardContent className="p-5 space-y-3">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <p.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <h4 className="font-display font-bold text-foreground">{p.title}</h4>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right - Quote & CTA */}
          <div className="space-y-6 lg:pt-20">
            <Card className="bg-secondary text-secondary-foreground border-0 shadow-lg">
              <CardContent className="p-8 space-y-6">
                <h3 className="font-display text-2xl font-bold">A Referência do Futuro</h3>
                <p className="opacity-90 leading-relaxed italic">
                  "Transformar a dificuldade de hoje no exemplo de amanhã. Este é o compromisso de uma gestão que olha para as pessoas."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-foreground text-background border-0 shadow-lg">
              <CardContent className="p-8 space-y-4">
                <p className="text-xs uppercase tracking-widest text-primary">Próximo Passo</p>
                <h3 className="font-display text-2xl font-bold">Iniciar Diagnóstico</h3>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <p className="text-sm opacity-80">Cronograma pronto para execução imediata em 2026.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Demo Channels ────────────────────────────────────────
function DemoSection() {
  const navigate = useNavigate();
  const { loginWithCPF, loginWithCredentials } = useAuth();

  const handleDemoLogin = async (role: string) => {
    try {
      if (role === 'citizen') {
        await loginWithCPF('123.456.789-00', '0000');
        navigate('/app');
      } else if (role === 'professional') {
        await loginWithCredentials('carlos@ubs.gov.br', 'demo', UserRole.PROFESSIONAL);
        navigate('/profissional');
      } else if (role === 'manager') {
        await loginWithCredentials('ana@saude.gov.br', 'demo', UserRole.MANAGER);
        navigate('/gestor');
      } else if (role === 'admin') {
        await loginWithCredentials('admin@filazero.com', 'demo', UserRole.ADMIN);
        navigate('/admin');
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  const channels = [
    {
      icon: Users,
      label: 'Canal do Paciente',
      description: 'Acolhimento clínico com IA, jornada de cuidado e acompanhamento',
      role: 'citizen',
      color: 'bg-primary/10 text-primary',
      cta: 'Entrar como Paciente',
    },
    {
      icon: Stethoscope,
      label: 'Canal do Médico',
      description: 'Revisão de pacotes clínicos, validação de exames e encaminhamentos',
      role: 'professional',
      color: 'bg-secondary/10 text-secondary',
      cta: 'Entrar como Médico',
    },
    {
      icon: Building2,
      label: 'Canal do Gestor de UBS',
      description: 'Dashboard de resolutividade, fluxo da rede e gargalos operacionais',
      role: 'manager',
      color: 'bg-accent text-accent-foreground',
      cta: 'Entrar como Gestor',
    },
    {
      icon: LayoutDashboard,
      label: 'Admin da Plataforma',
      description: 'Gestão SaaS de prefeituras, unidades de saúde e métricas da plataforma',
      role: 'admin',
      color: 'bg-muted text-foreground',
      cta: 'Entrar como Admin',
    },
  ];

  return (
    <section id="demo" className="py-20 md:py-28 bg-background">
      <div className="container">
        <SectionHeader subtitle="Demo Funcional" title="Teste Todos os Canais da Plataforma" />
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Cada tipo de usuário tem seu próprio canal com funcionalidades específicas. 
          Clique para experimentar o sistema completo em modo demonstração.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((ch) => (
            <Card key={ch.label} className="group cursor-pointer hover:shadow-lg transition-all hover:border-primary/30"
              onClick={() => handleDemoLogin(ch.role)}>
              <CardContent className="p-6 space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ch.color}`}>
                  <ch.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{ch.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{ch.description}</p>
                </div>
                <Button variant="outline" className="w-full font-display group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {ch.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            <Lock className="inline h-3 w-3 mr-1" />
            Modo demonstração — dados fictícios. Use qualquer email/senha para acessar.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────
function CTASection() {
  return (
    <section id="contato" className="py-20 md:py-28 bg-secondary text-secondary-foreground">
      <div className="container text-center space-y-8 max-w-3xl">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold">
          Transforme a saúde do seu município
        </h2>
        <p className="text-lg opacity-90">
          Agende uma apresentação personalizada e descubra como o Programa Fila Zero Saúde pode reduzir filas, melhorar indicadores e gerar resultados concretos para sua gestão.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="bg-primary-foreground text-secondary hover:bg-primary-foreground/90 font-semibold text-base px-8 h-14 rounded-xl">
            <Phone className="mr-2 h-5 w-5" />
            Agendar Apresentação
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-base px-8 h-14 rounded-xl">
            <Mail className="mr-2 h-5 w-5" />
            Solicitar Proposta
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-8 bg-foreground text-background/60">
      <div className="container flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
        <p>Programa Fila Zero Saúde</p>
        <p>Ano 2026</p>
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-body scroll-smooth">
      <Navbar />
      <HeroSection />
      <AnimatedSection id="problema"><ProblemSection /></AnimatedSection>
      <AnimatedSection><PoliticalCostSection /></AnimatedSection>
      <AnimatedSection id="solucao"><SolutionSection /></AnimatedSection>
      <AnimatedSection id="como-funciona"><HowItWorksSection /></AnimatedSection>
      <AnimatedSection id="impacto"><ImpactSection /></AnimatedSection>
      <AnimatedSection><CitizenImpactSection /></AnimatedSection>
      <AnimatedSection><ManagerImpactSection /></AnimatedSection>
      <AnimatedSection id="implementacao"><ImplementationSection /></AnimatedSection>
      <AnimatedSection id="preco"><PricingSection /></AnimatedSection>
      <AnimatedSection><IntegrationSection /></AnimatedSection>
      <AnimatedSection id="seguranca"><SecuritySection /></AnimatedSection>
      <AnimatedSection><PoliticalGainSection /></AnimatedSection>
      <AnimatedSection><LocalImpactSection /></AnimatedSection>
      <AnimatedSection><VisionSection /></AnimatedSection>
      <AnimatedSection id="demo"><DemoSection /></AnimatedSection>
      <CTASection />
      <Footer />
    </div>
  );
}
