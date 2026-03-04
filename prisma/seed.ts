import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Admin User ──────────────────────────────────────────────────────────────
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@institutojob.com.br' },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@IJB2026!', 12);
    await prisma.user.create({
      data: {
        email: 'admin@institutojob.com.br',
        passwordHash,
        name: 'Administrador IJB',
        role: 'admin',
      },
    });
    console.log('✅ Admin user created: admin@institutojob.com.br / Admin@IJB2026!');
  } else {
    console.log('ℹ️  Admin user already exists.');
  }

  // ─── Example Edition ─────────────────────────────────────────────────────────
  const existingEdition = await prisma.edition.findUnique({
    where: { volume_number: { volume: 1, number: 1 } },
  });

  if (!existingEdition) {
    await prisma.edition.create({
      data: {
        volume: 1,
        number: 1,
        year: 2026,
        focus:
          'Educação, Filosofia e Teologia: perspectivas integradoras para a formação humana integral',
        status: 'open',
        deadline: new Date('2026-06-30'),
      },
    });
    console.log('✅ Example edition created: Vol. 1, No. 1, 2026');
  } else {
    console.log('ℹ️  Example edition already exists.');
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
