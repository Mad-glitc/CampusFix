import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Complaint from '../models/Complaint.js';
import Assignment from '../models/Assignment.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import LostFoundItem from '../models/LostFoundItem.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusfix';

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seeder] Connected successfully.');

    console.log('[Seeder] Clearing old records...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Complaint.deleteMany({}),
      Assignment.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      LostFoundItem.deleteMany({}),
    ]);

    console.log('[Seeder] Creating demo users with standard credentials (pwd: password123)...');
    const users = await User.create([
      {
        name: 'Alex Johnson',
        email: 'student@campus.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        phoneNumber: '9876543210',
      },
      {
        name: 'Prof. R. K. Sharma',
        email: 'admin@campusfix.edu',
        password: 'password123',
        role: 'admin',
        department: 'Dean of Student Welfare & Estate',
        phoneNumber: '9876543211',
      },
      {
        name: 'Rajesh Kumar',
        email: 'electrician@campusfix.edu',
        password: 'password123',
        role: 'staff',
        department: 'IT & Electrical Maintenance',
        phoneNumber: '9876543212',
        isPresent: true,
        shift: 'Morning Shift (08:00 - 16:30)',
        specialty: 'High-Voltage & Power Distribution',
        rating: 4.9,
      },
      {
        name: 'Mohan Lal',
        email: 'plumber@campusfix.edu',
        password: 'password123',
        role: 'staff',
        department: 'Plumbing & Sanitation',
        phoneNumber: '9876543213',
        isPresent: true,
        shift: 'General Shift (09:00 - 17:30)',
        specialty: 'Hydro-Pneumatics & Water Lines',
        rating: 4.8,
      },
      {
        name: 'Sunil Verma',
        email: 'carpenter@campusfix.edu',
        password: 'password123',
        role: 'staff',
        department: 'Civil & Furniture',
        phoneNumber: '9876543214',
        isPresent: true,
        shift: 'Morning Shift (08:00 - 16:30)',
        specialty: 'Structural Fixtures & Woodwork',
        rating: 4.7,
      },
      {
        name: 'Vikram Singh',
        email: 'hvac@campusfix.edu',
        password: 'password123',
        role: 'staff',
        department: 'HVAC & Climate Control',
        phoneNumber: '9876543215',
        isPresent: true,
        shift: 'Morning Shift (08:00 - 16:30)',
        specialty: 'Central Chillers & AC Units',
        rating: 4.9,
      },
      {
        name: 'Amit Patel',
        email: 'avtech@campusfix.edu',
        password: 'password123',
        role: 'staff',
        department: 'Smart Classroom & AV Tech',
        phoneNumber: '9876543216',
        isPresent: true,
        shift: 'Evening Shift (13:00 - 21:00)',
        specialty: 'Projectors & Digital Podiums',
        rating: 5.0,
      },
      {
        name: 'Deepa Nair',
        email: 'sanitation@campusfix.edu',
        password: 'password123',
        role: 'staff',
        department: 'Sanitation & Hygiene',
        phoneNumber: '9876543217',
        isPresent: false,
        shift: 'Off-Duty (On Approved Leave)',
        specialty: 'Facility Sanitization & Hygiene',
        rating: 4.8,
      },
    ]);

    const studentUser = users[0];
    const adminUser = users[1];
    const electricianStaff = users[2];
    const plumberStaff = users[3];

    console.log('[Seeder] Creating maintenance categories...');
    const categories = await Category.create([
      {
        name: 'IT & Smart Classrooms',
        slug: 'it_av',
        icon: 'Cpu',
        defaultSlaHours: 12,
        description: 'Projectors, smartboards, audio visual equipment, lab PCs',
      },
      {
        name: 'Electrical & Lighting',
        slug: 'electrical',
        icon: 'Zap',
        defaultSlaHours: 8,
        description: 'Power sockets, ceiling fans, corridor lighting, switchboards',
      },
      {
        name: 'Plumbing & Sanitation',
        slug: 'plumbing',
        icon: 'Droplet',
        defaultSlaHours: 6,
        description: 'Restroom pipes, taps, water coolers, drainage',
      },
      {
        name: 'Civil & Furniture',
        slug: 'furniture',
        icon: 'Hammer',
        defaultSlaHours: 48,
        description: 'Benches, whiteboards, door locks, window glass',
      },
      {
        name: 'HVAC & Air Conditioning',
        slug: 'hvac',
        icon: 'Wind',
        defaultSlaHours: 24,
        description: 'Lecture hall AC units, ventilation ducts, temperature controls',
      },
    ]);

    const itCat = categories[0];
    const electricalCat = categories[1];
    const plumbingCat = categories[2];

    console.log('[Seeder] Creating sample complaints and faculty demo scenarios...');
    
    // Flagship Demo Complaint 1: Broken Projector in Block C Room 304
    const complaint1 = await Complaint.create({
      trackingId: 'CF-2026-1042',
      title: 'Broken Classroom Projector in Block C Room 304',
      description: 'Projector display shuts down unexpectedly after 2 minutes. HDMI input cable port is mechanically loose and sparking occasionally.',
      category: itCat._id,
      location: {
        building: 'Block C (Engineering)',
        floor: '3rd Floor',
        room: 'Room 304',
        landmark: 'Ceiling mount near central podium',
      },
      priority: 'urgent',
      status: 'in_progress',
      student: studentUser._id,
      assignedStaff: electricianStaff._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
          uploadedAt: new Date(Date.now() - 3600000 * 2),
        },
      ],
    });

    // Complaint 2: Water leakage (Resolved)
    const complaint2 = await Complaint.create({
      trackingId: 'CF-2026-1015',
      title: 'Water pipe leakage in 2nd Floor East Washroom',
      description: 'Continuous water drip from main supply valve causing puddles in Block B corridor.',
      category: plumbingCat._id,
      location: {
        building: 'Block B (Science)',
        floor: '2nd Floor',
        room: 'Washroom East',
        landmark: 'Next to Chemistry Lab 2',
      },
      priority: 'high',
      status: 'resolved',
      student: studentUser._id,
      assignedStaff: plumberStaff._id,
      resolutionRemarks: 'Replaced cracked Teflon seal and tightening brass union valve. Pressure tested successfully.',
      resolvedAt: new Date(Date.now() - 3600000 * 12),
      feedback: {
        rating: 5,
        isSatisfied: 'satisfied',
        desiredChanges: 'None, resolved super quickly without messing up the floor.',
        comments: 'Great responsiveness from maintenance staff! The leak was stopped within an hour.',
        submittedAt: new Date(Date.now() - 3600000 * 6),
        submittedBy: studentUser._id,
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
          uploadedAt: new Date(Date.now() - 3600000 * 24),
        },
      ],
      resolvedImages: [
        {
          url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
          uploadedAt: new Date(Date.now() - 3600000 * 12),
        },
      ],
    });

    // Complaint 3: Ceiling Fan Grinding Noise (Submitted / Pending Triage)
    const complaint3 = await Complaint.create({
      trackingId: 'CF-2026-1088',
      title: 'Ceiling Fan Making Loud Grinding Noise',
      description: 'Classroom fan 3 wobbles at speed 4 and makes loud bearing friction noise.',
      category: electricalCat._id,
      location: {
        building: 'Block A (Main Admin)',
        floor: '1st Floor',
        room: 'Room 102',
        landmark: 'Middle row ceiling fixture',
      },
      priority: 'medium',
      status: 'submitted',
      student: studentUser._id,
    });

    // Flagship Demo Complaint 4: Power Trip in Computer Lab 3 (Resolved by Rajesh Kumar with Student Feedback)
    const complaint4 = await Complaint.create({
      trackingId: 'CF-2026-1033',
      title: 'Power Trip & Circuit Breaker Reset in Computer Lab 3',
      description: 'Central MCB kept tripping when 20 desktop workstations were booted simultaneously.',
      category: electricalCat._id,
      location: {
        building: 'Block C (Engineering)',
        floor: '2nd Floor',
        room: 'Computer Lab 3',
        landmark: 'Sub-distribution board near instructor console',
      },
      priority: 'high',
      status: 'resolved',
      student: studentUser._id,
      assignedStaff: electricianStaff._id,
      resolutionRemarks: 'Rebalanced 3-phase load across busbars and replaced faulty 32A C-curve breaker.',
      resolvedAt: new Date(Date.now() - 3600000 * 20),
      feedback: {
        rating: 5,
        isSatisfied: 'satisfied',
        desiredChanges: 'Can we also get an additional power extension cord for the back bench?',
        comments: 'Rajesh diagnosed the breaker within 15 minutes. Very professional and polite.',
        submittedAt: new Date(Date.now() - 3600000 * 10),
        submittedBy: studentUser._id,
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
          uploadedAt: new Date(Date.now() - 3600000 * 22),
        },
      ],
    });

    console.log('[Seeder] Creating sample Lost & Found listings...');
    await LostFoundItem.create([
      {
        type: 'lost',
        title: 'Space Grey MacBook 67W Charger & MagSafe Cable',
        category: 'Electronics',
        description: 'Apple original white cable with space grey 67W power adapter. Left on study table near window.',
        location: {
          building: 'Central Library',
          specificSpot: '2nd Floor Quiet Study Zone, Cubicle #18',
        },
        itemDate: new Date(Date.now() - 3600000 * 5),
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
        contact: {
          name: 'Alex Johnson',
          phone: '9876543210',
          email: 'student@campus.edu',
          handoverLocation: 'Call or WhatsApp if found. Reward offered.',
        },
        status: 'open',
        reportedBy: studentUser._id,
      },
      {
        type: 'found',
        title: 'Casio FX-991EX ClassWiz Scientific Calculator',
        category: 'Electronics',
        description: 'Black carbon-finish scientific calculator found on bench after Mathematics II lecture.',
        location: {
          building: 'Block B (Science)',
          specificSpot: 'Room 204, Row 3 Middle Desk',
        },
        itemDate: new Date(Date.now() - 3600000 * 8),
        imageUrl: 'https://images.unsplash.com/photo-1611117775350-ac3950990985?auto=format&fit=crop&w=600&q=80',
        contact: {
          name: 'Rajesh Kumar (Technician)',
          phone: '9876543212',
          email: 'electrician@campusfix.edu',
          handoverLocation: 'Handed over to Block B Security Desk (Ground Floor)',
        },
        status: 'open',
        reportedBy: electricianStaff._id,
      },
      {
        type: 'found',
        title: 'Titan Quartz Analog Watch (Brown Leather Strap)',
        category: 'Clothing & Accessories',
        description: 'Men watch with dark brown leather strap and white dial. Found near basketball court bleachers.',
        location: {
          building: 'Sports Complex',
          specificSpot: 'Outdoor Basketball Court Bench',
        },
        itemDate: new Date(Date.now() - 3600000 * 28),
        imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
        contact: {
          name: 'Estate Caretaker Desk',
          phone: '9876543211',
          email: 'admin@campusfix.edu',
          handoverLocation: 'Available for claim at Dean Office / Security Central Room',
        },
        status: 'claimed',
        claimedAt: new Date(Date.now() - 3600000 * 4),
        resolutionRemarks: 'Verified student ID card and handed back to rightful owner.',
        reportedBy: adminUser._id,
      },
    ]);

    console.log('[Seeder] Creating assignment audit records...');
    await Assignment.create([
      {
        complaint: complaint1._id,
        assignedBy: studentUser._id,
        assignedTo: studentUser._id,
        action: 'assigned',
        notes: 'Initial issue reported by student Alex Johnson.',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        complaint: complaint1._id,
        assignedBy: adminUser._id,
        assignedTo: electricianStaff._id,
        action: 'assigned',
        notes: 'Dispatched electrician Rajesh Kumar with Urgent priority.',
        createdAt: new Date(Date.now() - 3600000 * 1.5),
      },
      {
        complaint: complaint1._id,
        assignedBy: electricianStaff._id,
        assignedTo: electricianStaff._id,
        action: 'accepted',
        notes: 'Technician arrived on-site and commenced diagnostic.',
        createdAt: new Date(Date.now() - 3600000 * 1),
      },
    ]);

    console.log('[Seeder] Creating comments...');
    await Comment.create([
      {
        complaint: complaint1._id,
        author: electricianStaff._id,
        content: 'I have arrived in Room 304 and taken down the projector casing. Testing the internal power supply now.',
        createdAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        complaint: complaint1._id,
        author: studentUser._id,
        content: 'Thanks Rajesh! We have a seminar here at 2 PM, hoping it gets fixed before then.',
        createdAt: new Date(Date.now() - 3600000 * 0.8),
      },
    ]);

    console.log('========================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================================');
    console.log('DEMO ACCOUNTS READY FOR FACULTY VIVA:');
    console.log('1. 🎓 STUDENT:');
    console.log('   Email:    student@campus.edu');
    console.log('   Password: password123');
    console.log('2. 🛡️ ADMINISTRATOR:');
    console.log('   Email:    admin@campusfix.edu');
    console.log('   Password: password123');
    console.log('3. 🔧 MAINTENANCE TECHNICIAN:');
    console.log('   Email:    electrician@campusfix.edu');
    console.log('   Password: password123');
    console.log('--------------------------------------------------------');
    console.log('Flagship Demo Ticket: CF-2026-1042');
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

// Execute if run directly via CLI
if (process.argv[1]?.includes('seeder.js')) {
  seedDatabase();
}

export default seedDatabase;
