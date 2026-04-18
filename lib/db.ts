import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'horizon.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      bio TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      section TEXT NOT NULL,
      author TEXT NOT NULL,
      author_id INTEGER REFERENCES authors(id),
      summary TEXT,
      content TEXT NOT NULL,
      cover_image_url TEXT,
      published INTEGER DEFAULT 0,
      publish_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS article_tags (
      article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, tag_id)
    );
  `);

  // Migrate existing articles table columns
  for (const sql of [
    `ALTER TABLE articles ADD COLUMN author_id INTEGER REFERENCES authors(id)`,
    `ALTER TABLE articles ADD COLUMN publish_at DATETIME`,
  ]) {
    try { database.exec(sql); } catch {}
  }

  // Seed default authors
  const count = (database.prepare('SELECT COUNT(*) as c FROM authors').get() as { c: number }).c;
  if (count === 0) {
    database.prepare('INSERT INTO authors (name, bio) VALUES (?, ?)').run(
      'Editorial Team',
      'The Horizon Analysis editorial team covers global markets, economic trends, and political developments.'
    );
    database.prepare('INSERT INTO authors (name, bio) VALUES (?, ?)').run(
      'Market Desk',
      'Our market desk provides daily analysis of equities, commodities, and financial instruments.'
    );
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type Author = {
  id: number;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export type Article = {
  id: number;
  title: string;
  slug: string;
  section: 'economy' | 'politics' | 'equities' | 'others';
  author: string;
  author_id: number | null;
  summary: string | null;
  content: string;
  cover_image_url: string | null;
  published: number;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
  author_bio?: string | null;
  author_avatar_url?: string | null;
  tags?: Tag[];
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

const ARTICLE_SELECT = `
  SELECT a.*, COALESCE(au.name, a.author) as author, au.bio as author_bio, au.avatar_url as author_avatar_url
  FROM articles a
  LEFT JOIN authors au ON a.author_id = au.id
`;

function mapRow(row: any): Article {
  return { ...row };
}

function autoPublish() {
  getDb().prepare(`
    UPDATE articles SET published = 1, publish_at = NULL
    WHERE publish_at IS NOT NULL AND publish_at <= datetime('now') AND published = 0
  `).run();
}

// ─── Articles ─────────────────────────────────────────────────────────────────

export function getAllArticles(): Article[] {
  autoPublish();
  return (getDb().prepare(`${ARTICLE_SELECT} ORDER BY a.created_at DESC`).all() as any[]).map(mapRow);
}

export function getPublishedArticles(section?: string): Article[] {
  autoPublish();
  if (section) {
    return (getDb().prepare(`${ARTICLE_SELECT} WHERE a.published = 1 AND a.section = ? ORDER BY a.created_at DESC`).all(section) as any[]).map(mapRow);
  }
  return (getDb().prepare(`${ARTICLE_SELECT} WHERE a.published = 1 ORDER BY a.created_at DESC`).all() as any[]).map(mapRow);
}

export function getArticleBySlug(slug: string): Article | undefined {
  autoPublish();
  const row = getDb().prepare(`${ARTICLE_SELECT} WHERE a.slug = ? AND a.published = 1`).get(slug) as any;
  if (!row) return undefined;
  const article = mapRow(row);
  article.tags = getArticleTags(article.id);
  return article;
}

export function getArticleById(id: number): Article | undefined {
  const row = getDb().prepare(`${ARTICLE_SELECT} WHERE a.id = ?`).get(id) as any;
  if (!row) return undefined;
  const article = mapRow(row);
  article.tags = getArticleTags(article.id);
  return article;
}

export function getRelatedArticles(articleId: number, section: string, limit = 3): Article[] {
  return (getDb()
    .prepare(`${ARTICLE_SELECT} WHERE a.published = 1 AND a.section = ? AND a.id != ? ORDER BY a.created_at DESC LIMIT ?`)
    .all(section, articleId, limit) as any[]).map(mapRow);
}

export function searchArticles(query: string): Article[] {
  autoPublish();
  const like = `%${query}%`;
  return (getDb()
    .prepare(`${ARTICLE_SELECT} WHERE a.published = 1 AND (a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?) ORDER BY a.created_at DESC`)
    .all(like, like, like) as any[]).map(mapRow);
}

export function getArticlesByTag(tagSlug: string): Article[] {
  autoPublish();
  return (getDb().prepare(`
    ${ARTICLE_SELECT}
    INNER JOIN article_tags at2 ON a.id = at2.article_id
    INNER JOIN tags t ON at2.tag_id = t.id
    WHERE a.published = 1 AND t.slug = ?
    ORDER BY a.created_at DESC
  `).all(tagSlug) as any[]).map(mapRow);
}

export function getArticlesByAuthorName(name: string): Article[] {
  autoPublish();
  return (getDb()
    .prepare(`${ARTICLE_SELECT} WHERE a.published = 1 AND (au.name = ? OR a.author = ?) ORDER BY a.created_at DESC`)
    .all(name, name) as any[]).map(mapRow);
}

export function createArticle(data: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'author_bio' | 'author_avatar_url' | 'tags'>): Article {
  const result = getDb().prepare(`
    INSERT INTO articles (title, slug, section, author, author_id, summary, content, cover_image_url, published, publish_at)
    VALUES (@title, @slug, @section, @author, @author_id, @summary, @content, @cover_image_url, @published, @publish_at)
  `).run(data);
  return getArticleById(result.lastInsertRowid as number)!;
}

export function updateArticle(id: number, data: Record<string, unknown>): Article | undefined {
  const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
  getDb().prepare(`UPDATE articles SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({ ...data, id });
  return getArticleById(id);
}

export function deleteArticle(id: number): void {
  getDb().prepare('DELETE FROM articles WHERE id = ?').run(id);
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export function getAllTags(): Tag[] {
  return getDb().prepare('SELECT * FROM tags ORDER BY name').all() as Tag[];
}

export function getTagBySlug(slug: string): Tag | undefined {
  return getDb().prepare('SELECT * FROM tags WHERE slug = ?').get(slug) as Tag | undefined;
}

export function getOrCreateTag(name: string): Tag {
  const slug = generateSlug(name);
  getDb().prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)').run(name.trim(), slug);
  return getDb().prepare('SELECT * FROM tags WHERE slug = ?').get(slug) as Tag;
}

export function deleteTag(id: number): void {
  getDb().prepare('DELETE FROM tags WHERE id = ?').run(id);
}

export function getArticleTags(articleId: number): Tag[] {
  return getDb().prepare(`
    SELECT t.* FROM tags t
    INNER JOIN article_tags at2 ON t.id = at2.tag_id
    WHERE at2.article_id = ? ORDER BY t.name
  `).all(articleId) as Tag[];
}

export function setArticleTags(articleId: number, tagNames: string[]): void {
  const database = getDb();
  database.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId);
  for (const name of tagNames) {
    if (!name.trim()) continue;
    const tag = getOrCreateTag(name.trim());
    database.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)').run(articleId, tag.id);
  }
}

// ─── Authors ──────────────────────────────────────────────────────────────────

export function getAllAuthors(): Author[] {
  return getDb().prepare('SELECT * FROM authors ORDER BY name').all() as Author[];
}

export function getAuthorById(id: number): Author | undefined {
  return getDb().prepare('SELECT * FROM authors WHERE id = ?').get(id) as Author | undefined;
}

export function getAuthorByName(name: string): Author | undefined {
  return getDb().prepare('SELECT * FROM authors WHERE name = ?').get(name) as Author | undefined;
}

export function createAuthor(data: Omit<Author, 'id' | 'created_at'>): Author {
  const result = getDb().prepare('INSERT INTO authors (name, bio, avatar_url) VALUES (@name, @bio, @avatar_url)').run(data);
  return getAuthorById(result.lastInsertRowid as number)!;
}

export function updateAuthor(id: number, data: Partial<Omit<Author, 'id' | 'created_at'>>): Author | undefined {
  const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
  getDb().prepare(`UPDATE authors SET ${fields} WHERE id = @id`).run({ ...data, id });
  return getAuthorById(id);
}

export function deleteAuthor(id: number): void {
  getDb().prepare('DELETE FROM authors WHERE id = ?').run(id);
}

// ─── Subscribers ──────────────────────────────────────────────────────────────

export function addSubscriber(email: string): void {
  getDb().prepare('INSERT INTO subscribers (email) VALUES (?)').run(email);
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
