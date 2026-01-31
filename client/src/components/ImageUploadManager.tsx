import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Trash2, GripVertical } from "lucide-react";

interface ImageUploadManagerProps {
  imovelId: number;
}

/**
 * Componente para gerenciar upload e organização de imagens
 */
export function ImageUploadManager({ imovelId }: ImageUploadManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: imagens, isLoading, refetch } = trpc.media.listImagensImovel.useQuery({
    imovelId,
  });

  const uploadMutation = trpc.media.uploadImagemImovel.useMutation();
  const deleteMutation = trpc.media.deleteImagem.useMutation();
  const reorderMutation = trpc.media.reorderImagens.useMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida");
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = (e.target?.result as string).split(",")[1];

      try {
        await uploadMutation.mutateAsync({
          imovelId,
          base64Data,
          mimeType: file.type,
          ordem: (imagens?.length || 0) + 1,
        });

        // Recarregar lista de imagens
        await refetch();
        alert("Imagem enviada com sucesso!");
      } catch (error) {
        console.error("Erro ao fazer upload:", error);
        alert("Erro ao fazer upload da imagem");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta imagem?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        await refetch();
      } catch (error) {
        console.error("Erro ao deletar imagem:", error);
        alert("Erro ao deletar imagem");
      }
    }
  };

  const handleReorder = async (imageId: number, newOrder: number) => {
    if (!imagens) return;

    const updatedImagens = imagens.map((img, idx) => ({
      id: img.id,
      ordem: idx === imagens.findIndex((i) => i.id === imageId) ? newOrder : (img.ordem || 0),
    }));

    try {
      await reorderMutation.mutateAsync({
        imagens: updatedImagens,
      });
      await refetch();
    } catch (error) {
      console.error("Erro ao reordenar imagens:", error);
      alert("Erro ao reordenar imagens");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Imagens</CardTitle>
        <CardDescription>Faça upload e organize as imagens do imóvel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Área de Upload */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-700 font-medium mb-2">
            Arraste uma imagem aqui ou clique para selecionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Formatos suportados: JPG, PNG, WebP (máx 10MB)
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Selecionar Imagem
          </Button>
        </div>

        {/* Lista de Imagens */}
        {isLoading ? (
          <div className="text-center py-8">Carregando imagens...</div>
        ) : imagens && imagens.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Imagens Enviadas ({imagens.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {imagens.map((imagem, idx) => (
                <div
                  key={imagem.id}
                  className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-100"
                >
                  {/* Imagem */}
                  <img
                    src={imagem.url}
                    alt={`Imagem ${idx + 1}`}
                    className="w-full h-48 object-cover"
                  />

                  {/* Overlay com ações */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleReorder(imagem.id, Math.max(0, (imagem.ordem || 0) - 1))}
                      disabled={idx === 0}
                      title="Mover para cima"
                    >
                      <GripVertical className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(imagem.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Badge de ordem */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhuma imagem enviada ainda. Comece fazendo upload de uma imagem.
          </div>
        )}

        {/* Status de Upload */}
        {uploadMutation.isPending && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center text-blue-700">
            Enviando imagem... Por favor aguarde.
          </div>
        )}

        {uploadMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
            Erro ao enviar imagem. Tente novamente.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
