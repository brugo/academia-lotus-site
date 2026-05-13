-- Adiciona a coluna target_page para diferenciar se o depoimento é para a Home ou Cursos
ALTER TABLE testimonials ADD COLUMN target_page TEXT DEFAULT 'home';
