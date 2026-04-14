import { neon } from '@neondatabase/serverless';

const OLD_USERS: Array<{
  id: number;
  username: string;
  password: string;
  created_at: string;
}> = [
  {
    id: 1,
    username: "testuser123",
    password: "$2b$10$Qp.KfCnF4sOIcRMts1Ey.OBTJrCc21q9127hkKzh40zqTS/Q9NQLq",
    created_at: "2026-03-31T23:05:46.094156+08:00"
  },
  {
    id: 2,
    username: "test01",
    password: "$2b$10$7q12vBYfcpFJsoWYWgVUguuw8ICbGBYv71m0MyXKvM5fZFZEblGj2",
    created_at: "2026-03-31T23:07:11.846596+08:00"
  }
];

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrateUsers() {
  console.log('开始迁移用户数据...');
  
  try {
    await sql`DROP TABLE IF EXISTS users`;
  } catch {
    console.log('表不存在，跳过删除');
  }
  
  await sql`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX users_username_idx ON users(username)`;
  console.log('表创建完成');
  
  for (const user of OLD_USERS) {
    await sql`
      INSERT INTO users (id, username, password, created_at)
      VALUES (${user.id}, ${user.username}, ${user.password}, ${new Date(user.created_at)})
    `;
    console.log(`导入用户: ${user.username}`);
  }
  
  console.log('用户数据迁移完成！');
  
  const result = await sql`SELECT id, username, created_at FROM users`;
  console.log('当前数据库用户:', result);
  
  process.exit(0);
}

migrateUsers().catch((error) => {
  console.error('迁移失败:', error);
  process.exit(1);
});