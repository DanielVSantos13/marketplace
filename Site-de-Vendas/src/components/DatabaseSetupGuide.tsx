import { useState, useEffect } from 'react';
import { Database, AlertTriangle, CheckCircle, Copy } from 'lucide-react';

export default function DatabaseSetupGuide() {
  const [copied, setCopied] = useState(false);
  const sql = `-- Script de criação do banco de dados para Supabase (PostgreSQL)

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS "Categoria" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS "Produto" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "estoque" INTEGER NOT NULL,
    "imagemUrl" TEXT,
    "vendedor" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS "Pedido" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "clienteNome" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "transacaoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS "ItemPedido" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "pedidoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnit" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS "Avaliacao" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "produtoId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- Índices e Relacionamentos
CREATE UNIQUE INDEX IF NOT EXISTS "Categoria_nome_key" ON "Categoria"("nome");

-- Adicionar FKs se não existirem (usando blocos anônimos para segurança)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Produto_categoriaId_fkey') THEN
        ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ItemPedido_pedidoId_fkey') THEN
        ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ItemPedido_produtoId_fkey') THEN
        ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Avaliacao_produtoId_fkey') THEN
        ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Inserir categorias iniciais
INSERT INTO "Categoria" (nome) VALUES 
('Eletrônicos'), ('Vestuário'), ('Casa e Decoração'), ('Esportes'), ('Livros')
ON CONFLICT (nome) DO NOTHING;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-orange-100 p-8 space-y-6 shadow-sm">
      <div className="flex items-center gap-4 text-orange-600">
        <div className="bg-orange-50 p-3 rounded-2xl">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Banco de Dados não configurado</h2>
          <p className="text-orange-800/60 text-sm">As tabelas necessárias não foram encontradas no seu Supabase.</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Para que o marketplace funcione, você precisa executar o script SQL abaixo no seu painel do Supabase:
        </p>
        
        <ol className="list-decimal list-inside text-sm text-gray-500 space-y-1 ml-2">
          <li>Acesse o seu projeto no <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 underline">Dashboard do Supabase</a></li>
          <li>No menu lateral, clique em <b>SQL Editor</b>, crie uma <b>New Query</b>, cole o código abaixo e clique em <b>Run</b></li>
          <li>No menu lateral, clique em <b>Storage</b></li>
          <li>Clique em <b>New Bucket</b> e crie um bucket chamado <b>marketplace</b></li>
          <li><b>IMPORTANTE:</b> Marque o bucket como <b>Public</b> para que as imagens fiquem visíveis</li>
          <li><b>POLÍTICAS DE ACESSO (RLS):</b> Se você não conseguir deletar ou criar produtos, vá em <b>Authentication -&gt; Policies</b> e desabilite o RLS para as tabelas ou adicione políticas de <b>Full Access</b> para usuários anônimos (apenas para testes).</li>
        </ol>

        <div className="relative group">
          <pre className="bg-gray-900 text-gray-300 p-6 rounded-2xl text-xs overflow-x-auto max-h-60 font-mono">
            {sql}
          </pre>
          <button 
            onClick={copyToClipboard}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-all backdrop-blur-md flex items-center gap-2 text-xs"
          >
            {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar SQL'}
          </button>
        </div>
      </div>
    </div>
  );
}
