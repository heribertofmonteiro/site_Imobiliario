import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Home, MessageSquare, Settings, LogOut } from "lucide-react";

/**
 * Admin Panel - Painel de Administração
 * Acesso restrito a usuários com role 'admin'
 */
export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Verificar se é admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não tem permissão para acessar o painel de administração.</p>
          <Button onClick={() => setLocation("/")}>Voltar para Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="imoveis" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Imóveis
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="promocoes" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Promoções
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          {/* Imóveis Tab */}
          <TabsContent value="imoveis">
            <ImoveisTab />
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <LeadsTab />
          </TabsContent>

          {/* Promoções Tab */}
          <TabsContent value="promocoes">
            <PromocoesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/**
 * Dashboard Tab - Estatísticas gerais
 */
function DashboardTab() {
  const { data: stats, isLoading } = trpc.admin.getDashboardStats.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Carregando estatísticas...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Erro ao carregar estatísticas</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total de Imóveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{stats.totalImoveis}</div>
          <p className="text-xs text-gray-500 mt-1">Imóveis cadastrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{stats.totalLeads}</div>
          <p className="text-xs text-gray-500 mt-1">Contatos recebidos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Leads Novos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">{stats.leadsNaoRespondidos}</div>
          <p className="text-xs text-gray-500 mt-1">Não respondidos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Mais Visualizado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold text-gray-900 truncate">
            {stats.imovelMaisVisto?.titulo || "N/A"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.imovelMaisVisto?.visualizacoes || 0} visualizações
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Imóveis Tab - Listagem e gerenciamento de imóveis
 */
function ImoveisTab() {
  const [page, setPage] = useState(1);
  const { data: imoveis, isLoading } = trpc.admin.listImoveis.useQuery({
    page,
    limit: 10,
  });

  const deleteImovelMutation = trpc.admin.deleteImovel.useMutation();

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este imóvel?")) {
      await deleteImovelMutation.mutateAsync({ id });
      // Recarregar lista
      window.location.reload();
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando imóveis...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gerenciar Imóveis</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">+ Novo Imóvel</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Imóveis</CardTitle>
          <CardDescription>Total: {imoveis?.total || 0} imóveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Título</th>
                  <th className="text-left px-4 py-2 font-semibold">Valor</th>
                  <th className="text-left px-4 py-2 font-semibold">Status</th>
                  <th className="text-left px-4 py-2 font-semibold">Visualizações</th>
                  <th className="text-left px-4 py-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {imoveis?.data?.map((imovel: any) => (
                  <tr key={imovel.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{imovel.titulo}</td>
                    <td className="px-4 py-3">R$ {imovel.valorAluguel}</td>
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
                    <td className="px-4 py-3">{imovel.visualizacoes}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Button size="sm" variant="outline">Editar</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(imovel.id)}
                      >
                        Deletar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-600">
              Página {page} de {Math.ceil((imoveis?.total || 0) / 10)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil((imoveis?.total || 0) / 10)}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Leads Tab - Gerenciamento de contatos
 */
function LeadsTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { data: leads, isLoading } = trpc.admin.listLeads.useQuery({
    page,
    limit: 10,
    status: statusFilter,
  });

  const updateStatusMutation = trpc.admin.updateLeadStatus.useMutation();

  const handleUpdateStatus = async (id: number, status: "novo" | "respondido" | "descartado") => {
    await updateStatusMutation.mutateAsync({ id, status });
    window.location.reload();
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando leads...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gerenciar Leads</h2>
        <select
          value={statusFilter || ""}
          onChange={(e) => setStatusFilter(e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Todos os status</option>
          <option value="novo">Novo</option>
          <option value="respondido">Respondido</option>
          <option value="descartado">Descartado</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>Total: {leads?.total || 0} leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Nome</th>
                  <th className="text-left px-4 py-2 font-semibold">Email</th>
                  <th className="text-left px-4 py-2 font-semibold">Telefone</th>
                  <th className="text-left px-4 py-2 font-semibold">Status</th>
                  <th className="text-left px-4 py-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {leads?.data?.map((lead: any) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{lead.nome}</td>
                    <td className="px-4 py-3">{lead.email}</td>
                    <td className="px-4 py-3">{lead.telefone}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.statusContato}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value as any)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option value="novo">Novo</option>
                        <option value="respondido">Respondido</option>
                        <option value="descartado">Descartado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline">Ver Detalhes</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-600">
              Página {page} de {Math.ceil((leads?.total || 0) / 10)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil((leads?.total || 0) / 10)}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Promoções Tab - Configurar promoções e ofertas
 */
function PromocoesTab() {
  const [page, setPage] = useState(1);
  const { data: imoveis, isLoading } = trpc.admin.listImoveis.useQuery({
    page,
    limit: 10,
  });

  const configurePromotionMutation = trpc.admin.configurePromotion.useMutation();

  const handleConfigurePromotion = async (
    imovelId: number,
    status: "disponivel" | "alugado" | "promocao" | "imperdivel",
    desconto: number
  ) => {
    await configurePromotionMutation.mutateAsync({
      imovelId,
      status,
      desconto,
    });
    window.location.reload();
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando imóveis...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Configurar Promoções e Ofertas</h2>

      <Card>
        <CardHeader>
          <CardTitle>Imóveis para Promoção</CardTitle>
          <CardDescription>Configure promoções e ofertas imperdíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {imoveis?.data?.map((imovel: any) => (
              <div key={imovel.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{imovel.titulo}</h3>
                    <p className="text-sm text-gray-600">R$ {imovel.valorAluguel}/mês</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    imovel.status === "disponivel" ? "bg-green-100 text-green-800" :
                    imovel.status === "promocao" ? "bg-blue-100 text-blue-800" :
                    imovel.status === "imperdivel" ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {imovel.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      defaultValue={imovel.status}
                      onChange={(e) => {
                        const status = e.target.value as any;
                        const desconto = prompt("Desconto (%):", String(imovel.desconto || 0));
                        if (desconto !== null) {
                          handleConfigurePromotion(imovel.id, status, parseInt(desconto));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="promocao">Promoção</option>
                      <option value="imperdivel">Oferta Imperdível</option>
                      <option value="alugado">Alugado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Desconto (%)</label>
                    <input
                      type="number"
                      defaultValue={imovel.desconto || 0}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                      onClick={() => {
                        const status = (document.querySelector(`select[data-imovel="${imovel.id}"]`) as HTMLSelectElement)?.value || imovel.status;
                        const desconto = prompt("Desconto (%):", String(imovel.desconto || 0));
                        if (desconto !== null) {
                          handleConfigurePromotion(imovel.id, status as any, parseInt(desconto));
                        }
                      }}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
