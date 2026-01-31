import mysql from 'mysql2/promise';
import { createConnection } from 'mysql2/promise';

async function seedDatabase() {
  let connection;

  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Usar a DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não está definida');
    }

    // Parsear a DATABASE_URL
    const url = new URL(databaseUrl);
    const config = {
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: url.searchParams.get('ssl') ? JSON.parse(url.searchParams.get('ssl')) : false,
    };

    console.log(`📡 Conectando ao banco de dados: ${config.host}:${config.port}/${config.database}`);

    connection = await createConnection(config);
    console.log('✅ Conectado ao banco de dados');

    // Inserir tipos de imóveis
    const tiposImoveis = [
      { nome: 'Apartamento', slug: 'apartamento' },
      { nome: 'Casa', slug: 'casa' },
      { nome: 'Kitnet', slug: 'kitnet' },
      { nome: 'Estúdio', slug: 'estudio' },
    ];

    for (const tipo of tiposImoveis) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO tipos_imoveis (nome, slug) VALUES (?, ?)',
          [tipo.nome, tipo.slug]
        );
      } catch (e) {
        // Ignorar erros de duplicação
      }
    }
    console.log('✅ Tipos de imóveis processados');

    // Inserir características
    const caracteristicas = [
      { nome: 'Piscina', slug: 'piscina', icone: '🏊' },
      { nome: 'Pet Friendly', slug: 'pet-friendly', icone: '🐾' },
      { nome: 'Mobiliado', slug: 'mobiliado', icone: '🛋️' },
      { nome: 'Garagem', slug: 'garagem', icone: '🚗' },
      { nome: 'Ar Condicionado', slug: 'ar-condicionado', icone: '❄️' },
      { nome: 'Elevador', slug: 'elevador', icone: '🛗' },
    ];

    for (const caract of caracteristicas) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO caracteristicas (nome, slug, icone) VALUES (?, ?, ?)',
          [caract.nome, caract.slug, caract.icone]
        );
      } catch (e) {
        // Ignorar erros de duplicação
      }
    }
    console.log('✅ Características processadas');

    // Inserir imóveis de exemplo
    const imoveis = [
      {
        titulo: 'Apartamento Moderno em São Paulo - Centro',
        descricao: 'Lindo apartamento com 2 quartos, 1 banheiro, sala ampla e cozinha integrada. Localizado em prédio moderno com segurança 24h.',
        valorAluguel: 1200.00,
        tipoImovelId: 1,
        endereco: 'Av. Paulista, 1000',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01311-100',
        latitude: -23.5505,
        longitude: -46.6333,
        status: 'promocao',
        desconto: 15,
        seoSlug: 'apartamento-moderno-sao-paulo-centro',
        imagemPrincipal: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
        quartos: 2,
        banheiros: 1,
        areaTotal: 85,
        ativo: true,
      },
      {
        titulo: 'Casa Aconchegante em Vila Mariana',
        descricao: 'Casa com 3 quartos, 2 banheiros, sala, cozinha e quintal. Perfeita para famílias. Próxima a comércios e escolas.',
        valorAluguel: 2400.00,
        tipoImovelId: 2,
        endereco: 'Rua das Flores, 250',
        bairro: 'Vila Mariana',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '04016-040',
        latitude: -23.5896,
        longitude: -46.6294,
        status: 'imperdivel',
        desconto: 0,
        seoSlug: 'casa-aconchegante-vila-mariana',
        imagemPrincipal: 'https://images.unsplash.com/photo-1570129477492-45201003074e?w=600&h=400&fit=crop',
        quartos: 3,
        banheiros: 2,
        areaTotal: 150,
        ativo: true,
      },
      {
        titulo: 'Kitnet Prática no Bom Retiro',
        descricao: 'Kitnet com 1 quarto, 1 banheiro, cozinha e sala. Ideal para solteiros ou casais. Próxima a transporte público.',
        valorAluguel: 800.00,
        tipoImovelId: 3,
        endereco: 'Rua do Bom Retiro, 500',
        bairro: 'Bom Retiro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01124-000',
        latitude: -23.5310,
        longitude: -46.6150,
        status: 'disponivel',
        desconto: 0,
        seoSlug: 'kitnet-pratica-bom-retiro',
        imagemPrincipal: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
        quartos: 1,
        banheiros: 1,
        areaTotal: 40,
        ativo: true,
      },
      {
        titulo: 'Apartamento Espaçoso em Pinheiros',
        descricao: 'Apartamento com 2 quartos, 2 banheiros, sala, cozinha e varanda. Prédio com piscina e academia.',
        valorAluguel: 1700.00,
        tipoImovelId: 1,
        endereco: 'Rua Bandeira, 1200',
        bairro: 'Pinheiros',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '05429-000',
        latitude: -23.5606,
        longitude: -46.6827,
        status: 'imperdivel',
        desconto: 0,
        seoSlug: 'apartamento-espacoso-pinheiros',
        imagemPrincipal: 'https://images.unsplash.com/photo-1545324418-cc1a9db4be0f?w=600&h=400&fit=crop',
        quartos: 2,
        banheiros: 2,
        areaTotal: 95,
        ativo: true,
      },
      {
        titulo: 'Estúdio Moderno na Consolação',
        descricao: 'Estúdio com 1 ambiente, 1 banheiro, cozinha integrada. Localizado em região comercial com fácil acesso.',
        valorAluguel: 1000.00,
        tipoImovelId: 4,
        endereco: 'Av. Consolação, 800',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01302-000',
        latitude: -23.5479,
        longitude: -46.6596,
        status: 'promocao',
        desconto: 10,
        seoSlug: 'estudio-moderno-consolacao',
        imagemPrincipal: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=600&h=400&fit=crop',
        quartos: 0,
        banheiros: 1,
        areaTotal: 35,
        ativo: true,
      },
      {
        titulo: 'Casa Colonial em Vila Madalena',
        descricao: 'Casa charmosa com 2 quartos, 1 banheiro, sala, cozinha e pátio. Perfeita para quem busca tranquilidade.',
        valorAluguel: 1800.00,
        tipoImovelId: 2,
        endereco: 'Rua Aspicuelta, 350',
        bairro: 'Vila Madalena',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '05433-010',
        latitude: -23.5688,
        longitude: -46.6937,
        status: 'disponivel',
        desconto: 0,
        seoSlug: 'casa-colonial-vila-madalena',
        imagemPrincipal: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop',
        quartos: 2,
        banheiros: 1,
        areaTotal: 120,
        ativo: true,
      },
    ];

    for (const imovel of imoveis) {
      try {
        await connection.execute(
          `INSERT INTO imoveis (
            titulo, descricao, valor_aluguel, tipo_imovel_id, endereco, bairro, cidade, estado, cep,
            latitude, longitude, status, desconto, seo_slug, imagem_principal, quartos, banheiros, area_total, ativo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            imovel.titulo,
            imovel.descricao,
            imovel.valorAluguel,
            imovel.tipoImovelId,
            imovel.endereco,
            imovel.bairro,
            imovel.cidade,
            imovel.estado,
            imovel.cep,
            imovel.latitude,
            imovel.longitude,
            imovel.status,
            imovel.desconto,
            imovel.seoSlug,
            imovel.imagemPrincipal,
            imovel.quartos,
            imovel.banheiros,
            imovel.areaTotal,
            imovel.ativo,
          ]
        );
        console.log(`✅ Imóvel inserido: ${imovel.titulo}`);
      } catch (error) {
        console.warn(`⚠️ Erro ao inserir ${imovel.titulo}:`, error.message);
      }
    }

    console.log('🎉 Seed do banco de dados concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao fazer seed do banco de dados:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
