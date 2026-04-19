import { createClient, Client } from '@libsql/client';

// ─── Client ───────────────────────────────────────────────────────────────────

let _client: Client | null = null;
let initPromise: Promise<void> | null = null;

function getClient(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

async function initSchema(): Promise<void> {
  const client = getClient();

  await client.batch([
    { sql: `CREATE TABLE IF NOT EXISTS authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        bio TEXT,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )` },
    { sql: `CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )` },
    { sql: `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL
      )` },
    { sql: `CREATE TABLE IF NOT EXISTS articles (
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
      )` },
    { sql: `CREATE TABLE IF NOT EXISTS article_tags (
        article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (article_id, tag_id)
      )` },
  ], 'write');

  for (const sql of [
    `ALTER TABLE articles ADD COLUMN author_id INTEGER REFERENCES authors(id)`,
    `ALTER TABLE articles ADD COLUMN publish_at DATETIME`,
  ]) {
    try { await client.execute(sql); } catch {}
  }

  const r = await client.execute('SELECT COUNT(*) as c FROM authors');
  if (Number(r.rows[0].c) === 0) {
    await client.batch([
      { sql: 'INSERT INTO authors (name, bio) VALUES (?, ?)', args: ['Editorial Team', 'The Horizon Analysis editorial team covers global markets, economic trends, and political developments.'] },
      { sql: 'INSERT INTO authors (name, bio) VALUES (?, ?)', args: ['Market Desk', 'Our market desk provides daily analysis of equities, commodities, and financial instruments.'] },
    ], 'write');
  }
}

async function ensureInit(): Promise<void> {
  if (!initPromise) initPromise = initSchema();
  return initPromise;
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

async function autoPublish(): Promise<void> {
  await getClient().execute(`
    UPDATE articles SET published = 1, publish_at = NULL
    WHERE publish_at IS NOT NULL AND publish_at <= datetime('now') AND published = 0
  `);
}

// ─── Articles ─────────────────────────────────────────────────────────────────

export async function getAllArticles(): Promise<Article[]> {
  await ensureInit();
  await autoPublish();
  const r = await getClient().execute(`${ARTICLE_SELECT} ORDER BY a.created_at DESC`);
  return r.rows as unknown as Article[];
}

export async function getPublishedArticles(section?: string): Promise<Article[]> {
  await ensureInit();
  await autoPublish();
  const r = section
    ? await getClient().execute({ sql: `${ARTICLE_SELECT} WHERE a.published = 1 AND a.section = ? ORDER BY a.created_at DESC`, args: [section] })
    : await getClient().execute(`${ARTICLE_SELECT} WHERE a.published = 1 ORDER BY a.created_at DESC`);
  return r.rows as unknown as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  await ensureInit();
  await autoPublish();
  const r = await getClient().execute({ sql: `${ARTICLE_SELECT} WHERE a.slug = ? AND a.published = 1`, args: [slug] });
  if (!r.rows[0]) return undefined;
  const article = r.rows[0] as unknown as Article;
  article.tags = await getArticleTags(article.id);
  return article;
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  await ensureInit();
  const r = await getClient().execute({ sql: `${ARTICLE_SELECT} WHERE a.id = ?`, args: [id] });
  if (!r.rows[0]) return undefined;
  const article = r.rows[0] as unknown as Article;
  article.tags = await getArticleTags(article.id);
  return article;
}

export async function getRelatedArticles(articleId: number, section: string, limit = 3): Promise<Article[]> {
  await ensureInit();
  const r = await getClient().execute({
    sql: `${ARTICLE_SELECT} WHERE a.published = 1 AND a.section = ? AND a.id != ? ORDER BY a.created_at DESC LIMIT ?`,
    args: [section, articleId, limit],
  });
  return r.rows as unknown as Article[];
}

export async function searchArticles(query: string): Promise<Article[]> {
  await ensureInit();
  await autoPublish();
  const like = `%${query}%`;
  const r = await getClient().execute({
    sql: `${ARTICLE_SELECT} WHERE a.published = 1 AND (a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?) ORDER BY a.created_at DESC`,
    args: [like, like, like],
  });
  return r.rows as unknown as Article[];
}

export async function getArticlesByTag(tagSlug: string): Promise<Article[]> {
  await ensureInit();
  await autoPublish();
  const r = await getClient().execute({
    sql: `${ARTICLE_SELECT}
      INNER JOIN article_tags at2 ON a.id = at2.article_id
      INNER JOIN tags t ON at2.tag_id = t.id
      WHERE a.published = 1 AND t.slug = ?
      ORDER BY a.created_at DESC`,
    args: [tagSlug],
  });
  return r.rows as unknown as Article[];
}

export async function getArticlesByAuthorName(name: string): Promise<Article[]> {
  await ensureInit();
  await autoPublish();
  const r = await getClient().execute({
    sql: `${ARTICLE_SELECT} WHERE a.published = 1 AND (au.name = ? OR a.author = ?) ORDER BY a.created_at DESC`,
    args: [name, name],
  });
  return r.rows as unknown as Article[];
}

export async function createArticle(data: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'author_bio' | 'author_avatar_url' | 'tags'>): Promise<Article> {
  await ensureInit();
  const r = await getClient().execute({
    sql: `INSERT INTO articles (title, slug, section, author, author_id, summary, content, cover_image_url, published, publish_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [data.title, data.slug, data.section, data.author, data.author_id ?? null, data.summary ?? null, data.content, data.cover_image_url ?? null, data.published, data.publish_at ?? null],
  });
  return (await getArticleById(Number(r.lastInsertRowid)))!;
}

export async function updateArticle(id: number, data: Record<string, unknown>): Promise<Article | undefined> {
  await ensureInit();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  await getClient().execute({
    sql: `UPDATE articles SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [...Object.values(data), id],
  });
  return getArticleById(id);
}

export async function deleteArticle(id: number): Promise<void> {
  await ensureInit();
  await getClient().execute({ sql: 'DELETE FROM articles WHERE id = ?', args: [id] });
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  await ensureInit();
  const r = await getClient().execute('SELECT * FROM tags ORDER BY name');
  return r.rows as unknown as Tag[];
}

export async function getTagBySlug(slug: string): Promise<Tag | undefined> {
  await ensureInit();
  const r = await getClient().execute({ sql: 'SELECT * FROM tags WHERE slug = ?', args: [slug] });
  return r.rows[0] as unknown as Tag | undefined;
}

export async function getOrCreateTag(name: string): Promise<Tag> {
  await ensureInit();
  const slug = generateSlug(name);
  await getClient().execute({ sql: 'INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)', args: [name.trim(), slug] });
  const r = await getClient().execute({ sql: 'SELECT * FROM tags WHERE slug = ?', args: [slug] });
  return r.rows[0] as unknown as Tag;
}

export async function deleteTag(id: number): Promise<void> {
  await ensureInit();
  await getClient().execute({ sql: 'DELETE FROM tags WHERE id = ?', args: [id] });
}

export async function getArticleTags(articleId: number): Promise<Tag[]> {
  await ensureInit();
  const r = await getClient().execute({
    sql: `SELECT t.* FROM tags t
          INNER JOIN article_tags at2 ON t.id = at2.tag_id
          WHERE at2.article_id = ? ORDER BY t.name`,
    args: [articleId],
  });
  return r.rows as unknown as Tag[];
}

export async function setArticleTags(articleId: number, tagNames: string[]): Promise<void> {
  await ensureInit();
  const client = getClient();
  await client.execute({ sql: 'DELETE FROM article_tags WHERE article_id = ?', args: [articleId] });
  for (const name of tagNames) {
    if (!name.trim()) continue;
    const tag = await getOrCreateTag(name.trim());
    await client.execute({ sql: 'INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)', args: [articleId, tag.id] });
  }
}

// ─── Authors ──────────────────────────────────────────────────────────────────

export async function getAllAuthors(): Promise<Author[]> {
  await ensureInit();
  const r = await getClient().execute('SELECT * FROM authors ORDER BY name');
  return r.rows as unknown as Author[];
}

export async function getAuthorById(id: number): Promise<Author | undefined> {
  await ensureInit();
  const r = await getClient().execute({ sql: 'SELECT * FROM authors WHERE id = ?', args: [id] });
  return r.rows[0] as unknown as Author | undefined;
}

export async function getAuthorByName(name: string): Promise<Author | undefined> {
  await ensureInit();
  const r = await getClient().execute({ sql: 'SELECT * FROM authors WHERE name = ?', args: [name] });
  return r.rows[0] as unknown as Author | undefined;
}

export async function createAuthor(data: Omit<Author, 'id' | 'created_at'>): Promise<Author> {
  await ensureInit();
  const r = await getClient().execute({
    sql: 'INSERT INTO authors (name, bio, avatar_url) VALUES (?, ?, ?)',
    args: [data.name, data.bio ?? null, data.avatar_url ?? null],
  });
  return (await getAuthorById(Number(r.lastInsertRowid)))!;
}

export async function updateAuthor(id: number, data: Partial<Omit<Author, 'id' | 'created_at'>>): Promise<Author | undefined> {
  await ensureInit();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  await getClient().execute({
    sql: `UPDATE authors SET ${fields} WHERE id = ?`,
    args: [...Object.values(data), id],
  });
  return getAuthorById(id);
}

export async function deleteAuthor(id: number): Promise<void> {
  await ensureInit();
  await getClient().execute({ sql: 'DELETE FROM authors WHERE id = ?', args: [id] });
}

// ─── Subscribers ──────────────────────────────────────────────────────────────

export async function addSubscriber(email: string): Promise<void> {
  await ensureInit();
  await getClient().execute({ sql: 'INSERT INTO subscribers (email) VALUES (?)', args: [email] });
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
