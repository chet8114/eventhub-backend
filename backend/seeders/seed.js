require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Role, Event } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ force: true });
    console.log('✅ Tables recreated');

    // Seed roles
    await Role.bulkCreate([
      { role_name: 'admin' },
      { role_name: 'user' },
      { role_name: 'staff' },
    ]);
    console.log('✅ Roles seeded');

    // Seed admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventmanager.com',
      password: adminPassword,
      role: 'admin',
    });
    console.log('✅ Admin created — email: admin@eventmanager.com / password: admin123');

    // Seed staff user
    const staffPassword = await bcrypt.hash('staff123', 12);
    await User.create({
      name: 'Staff Member',
      email: 'staff@eventmanager.com',
      password: staffPassword,
      role: 'staff',
    });
    console.log('✅ Staff created — email: staff@eventmanager.com / password: staff123');

    // Seed demo user
    const userPassword = await bcrypt.hash('user123', 12);
    await User.create({
      name: 'John Doe',
      email: 'user@eventmanager.com',
      password: userPassword,
      role: 'user',
    });
    console.log('✅ Demo user created — email: user@eventmanager.com / password: user123');

    // Seed sample events
    const events = [
      {
        title: 'Tech Innovation Summit 2026',
        description: 'Join industry leaders to explore cutting-edge technology trends, AI breakthroughs, and the future of digital transformation. Featuring keynote speakers from top tech companies worldwide.',
        location: 'Bangalore International Exhibition Centre',
        category: 'Conference',
        event_date: new Date('2026-05-15T09:00:00'),
        capacity: 500,
        available_seats: 500,
        image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        created_by_admin_id: admin.id,
      },
      {
        title: 'React & Node.js Masterclass',
        description: 'A hands-on workshop covering advanced React patterns, Node.js performance optimization, and full-stack architecture best practices. Bring your laptop!',
        location: 'WeWork Galaxy, Residency Road',
        category: 'Workshop',
        event_date: new Date('2026-05-20T10:00:00'),
        capacity: 80,
        available_seats: 80,
        image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        created_by_admin_id: admin.id,
      },
      {
        title: 'Startup Networking Meetup',
        description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts. Share ideas, find co-founders, and grow your network in the vibrant Bangalore startup ecosystem.',
        location: 'The Lalit Ashok, Kumara Krupa Road',
        category: 'Meetup',
        event_date: new Date('2026-05-25T18:00:00'),
        capacity: 150,
        available_seats: 150,
        image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
        created_by_admin_id: admin.id,
      },
      {
        title: 'Cloud Computing Seminar',
        description: 'Deep dive into AWS, Azure, and GCP cloud architectures. Learn about serverless computing, containerization, and cloud-native development strategies.',
        location: 'NIMHANS Convention Centre',
        category: 'Seminar',
        event_date: new Date('2026-06-01T09:30:00'),
        capacity: 300,
        available_seats: 300,
        image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        created_by_admin_id: admin.id,
      },
      {
        title: 'Live Music Festival',
        description: 'An evening of live music featuring local and international artists. Food stalls, art installations, and an unforgettable atmosphere under the stars.',
        location: 'Palace Grounds, Bangalore',
        category: 'Concert',
        event_date: new Date('2026-06-10T17:00:00'),
        capacity: 2000,
        available_seats: 2000,
        image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        created_by_admin_id: admin.id,
      },
      {
        title: 'Corporate Cricket Tournament',
        description: 'Inter-company cricket championship. Form your team, compete for the trophy, and enjoy a day of sportsmanship and team bonding.',
        location: 'M. Chinnaswamy Stadium',
        category: 'Sports',
        event_date: new Date('2026-06-15T08:00:00'),
        capacity: 400,
        available_seats: 400,
        image_url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
        created_by_admin_id: admin.id,
      },
    ];

    await Event.bulkCreate(events);
    console.log('✅ Sample events seeded');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Login Credentials:');
    console.log('  Admin: admin@eventmanager.com / admin123');
    console.log('  Staff: staff@eventmanager.com / staff123');
    console.log('  User:  user@eventmanager.com / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
