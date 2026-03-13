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
  TrendingDown,
  
  Repeat,
  UserCheck,
  Hourglass,
  Brain,
  Shield,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ─── Hero ─────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background min-h-[90vh] flex items-center">
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
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base px-8 h-14 rounded-xl">
                Agendar Apresentação
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="font-semibold text-base px-8 h-14 rounded-xl border-border">
                Ver Proposta Completa
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

// ─── CTA ──────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-secondary text-secondary-foreground">
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
    <div className="min-h-screen bg-background font-body">
      <HeroSection />
      <ProblemSection />
      <PoliticalCostSection />
      <SolutionSection />
      <HowItWorksSection />
      <ImpactSection />
      <CitizenImpactSection />
      <ManagerImpactSection />
      <ImplementationSection />
      <CTASection />
      <Footer />
    </div>
  );
}
