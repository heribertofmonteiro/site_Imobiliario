import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, DollarSign, Download } from "lucide-react";

/**
 * Página de Analytics e Relatórios
 * Acesso restrito a usuários com role 'admin'
 */
export default function Analytics() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("visualizacoes");

  // Verificar se é admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="visualizacoes" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Visualizações
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="bairro" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Por Bairro
            </TabsTrigger>
            <TabsTrigger value="receita" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Receita
            </TabsTrigger>
          </TabsList>

          {/* Visualizações Tab */}
          <TabsContent value="visualizacoes">
            <VisualizacoesTab />
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <LeadsTab />
          </TabsContent>

          {/* Bairro Tab */}
          <TabsContent value="bairro">
            <BairroTab />
          </TabsContent>

          {/* Receita Tab */}
          <TabsContent value="receita">
            <ReceitaTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/**
 * Aba de Visualizações
 */
function VisualizacoesTab() {
  const { data: relatorio, isLoading } = trpc.analytics.getRelatorioVisualizacoes.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }

  if (!relatorio) {
    return <div className="text-center py-8 text-red-600">Erro ao carregar dados</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Visualizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{relatorio.totalVisualizacoes}</div>
            <p className="text-xs text-gray-500 mt-1">{relatorio.periodo}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Média por Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{relatorio.mediaVisualizacoes}</div>
            <p className="text-xs text-gray-500 mt-1">Visualizações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Imóvel Mais Visto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-gray-900 truncate">
              {relatorio.topImoveis[0]?.titulo || "N/A"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {relatorio.topImoveis[0]?.visualizacoes || 0} visualizações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Top Imóveis */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Imóveis Mais Visualizados</CardTitle>
          <CardDescription>Ranking de popularidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">#</th>
                  <th className="text-left px-4 py-2 font-semibold">Título</th>
                  <th className="text-left px-4 py-2 font-semibold">Visualizações</th>
                  <th className="text-left px-4 py-2 font-semibold">Valor</th>
                  <th className="text-left px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.topImoveis.map((imovel, idx) => (
                  <tr key={imovel.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-600">#{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{imovel.titulo}</td>
                    <td className="px-4 py-3">{imovel.visualizacoes || 0}</td>
                    <td className="px-4 py-3">R$ {imovel.valor}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        imovel.status === "disponivel" ? "bg-green-100 text-green-800" :
                        imovel.status === "promocao" ? "bg-blue-100 text-blue-800" :
                        imovel.status === "imperdivel" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {imovel.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Aba de Leads
 */
function LeadsTab() {
  const { data: relatorio, isLoading } = trpc.analytics.getRelatorioLeads.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }

  if (!relatorio) {
    return <div className="text-center py-8 text-red-600">Erro ao carregar dados</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{relatorio.totalLeads}</div>
            <p className="text-xs text-gray-500 mt-1">Contatos recebidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Novos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{relatorio.novo}</div>
            <p className="text-xs text-gray-500 mt-1">Não respondidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Respondidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{relatorio.respondido}</div>
            <p className="text-xs text-gray-500 mt-1">Conversões</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{relatorio.taxaConversao}%</div>
            <p className="text-xs text-gray-500 mt-1">Leads respondidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Pizza Simulado */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Leads</CardTitle>
          <CardDescription>Status dos contatos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Novos</span>
                <span className="text-sm font-semibold">{relatorio.novo}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{
                    width: `${(relatorio.novo / relatorio.totalLeads) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Respondidos</span>
                <span className="text-sm font-semibold">{relatorio.respondido}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(relatorio.respondido / relatorio.totalLeads) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Descartados</span>
                <span className="text-sm font-semibold">{relatorio.descartado}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${(relatorio.descartado / relatorio.totalLeads) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Aba de Performance por Bairro
 */
function BairroTab() {
  const { data: relatorio, isLoading } = trpc.analytics.getRelatorioPerformanceBairro.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }

  if (!relatorio) {
    return <div className="text-center py-8 text-red-600">Erro ao carregar dados</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Bairro</CardTitle>
        <CardDescription>Total de {relatorio.totalBairros} bairros</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Bairro</th>
                <th className="text-left px-4 py-2 font-semibold">Total</th>
                <th className="text-left px-4 py-2 font-semibold">Visualizações</th>
                <th className="text-left px-4 py-2 font-semibold">Valor Médio</th>
                <th className="text-left px-4 py-2 font-semibold">Disponível</th>
                <th className="text-left px-4 py-2 font-semibold">Alugado</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.porBairro.map((bairro) => (
                <tr key={bairro.bairro} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{bairro.bairro}</td>
                  <td className="px-4 py-3">{bairro.total}</td>
                  <td className="px-4 py-3">{bairro.visualizacoes}</td>
                  <td className="px-4 py-3">R$ {bairro.valor_medio}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                      {bairro.disponivel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                      {bairro.alugado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Aba de Receita
 */
function ReceitaTab() {
  const { data: relatorio, isLoading } = trpc.analytics.getRelatorioReceita.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }

  if (!relatorio) {
    return <div className="text-center py-8 text-red-600">Erro ao carregar dados</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              R$ {relatorio.receitaTotal.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-gray-500 mt-1">{relatorio.periodo}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Alugada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {relatorio.receitaAlugado.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-gray-500 mt-1">Imóveis alugados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{relatorio.taxaOcupacao}%</div>
            <p className="text-xs text-gray-500 mt-1">Imóveis ocupados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Imóveis Alugados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{relatorio.imoveisAlugados}</div>
            <p className="text-xs text-gray-500 mt-1">
              {relatorio.imoveisDisponiveis} disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Receita */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Receita</CardTitle>
          <CardDescription>Receita por status de imóvel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Alugado</span>
                <span className="text-sm font-semibold">
                  R$ {relatorio.receitaAlugado.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${(relatorio.receitaAlugado / relatorio.receitaTotal) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Disponível</span>
                <span className="text-sm font-semibold">
                  R$ {relatorio.receitaDisponivel.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{
                    width: `${(relatorio.receitaDisponivel / relatorio.receitaTotal) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
