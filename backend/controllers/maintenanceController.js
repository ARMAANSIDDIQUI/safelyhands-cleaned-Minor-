const mongoose = require('mongoose');
const Service = require('../models/Service');
const TeamMember = require('../models/TeamMember');
const Investor = require('../models/Investor');
const CarouselItem = require('../models/CarouselItem');
const fs = require('fs');
const path = require('path');

// @desc    Seed database with default data
// @route   POST /api/maintenance/seed
// @access  Private/Admin
const seedDatabase = async (req, res) => {
    try {
        console.log('📦 Starting database seeding...');

        // Read services from JSON
        const servicesPath = path.join(__dirname, '..', 'data', 'services.json');
        if (!fs.existsSync(servicesPath)) {
            return res.status(404).json({ message: 'Services data file not found' });
        }

        const servicesData = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
        const services = servicesData.map(s => ({ ...s, isActive: true }));

        // Rich Team Data
        const teamData = [
            {
                name: 'Vaibhav Agrawal',
                title: 'Founder & CEO',
                image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/images_2.png',
                linkedin: 'https://linkedin.com',
                category: 'Leadership'
            },
            {
                name: 'Saurav Kumar',
                title: 'Co-founder & COO',
                image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/images_3.png',
                linkedin: 'https://linkedin.com',
                category: 'Leadership'
            },
            {
                name: 'Nishi Agrawal',
                title: 'Co-founder & CTO',
                image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/images_4.png',
                linkedin: 'https://linkedin.com',
                category: 'Leadership'
            },
            {
                name: 'Anjali Sharma',
                title: 'Growth & Strategy',
                image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/images_5.png',
                linkedin: 'https://linkedin.com',
                category: 'Business'
            },
            {
                name: 'Rahul Vats',
                title: 'Operations Manager',
                image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/images_2.png',
                linkedin: 'https://linkedin.com',
                category: 'Operations'
            },
            {
                name: 'Priyanka Das',
                title: 'Human Resources',
                image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/images_5.png',
                linkedin: 'https://linkedin.com',
                category: 'Human Resources'
            },
            {
                name: 'Vikram Singh',
                title: 'Lead Product Design',
                image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/images_3.png',
                linkedin: 'https://linkedin.com',
                category: 'Tech & Product'
            }
        ];

        const investorData = [
            { name: 'Magic Fund', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/svgs/MagicFund-5.svg', width: 130, height: 48 },
            { name: '2am VC', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/svgs/2amVC-6.svg', width: 55, height: 48 },
            { name: 'SAT', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/svgs/SAT-7.svg', width: 100, height: 48 },
            { name: '100x', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/svgs/100x-8.svg', width: 130, height: 48 },
            { name: 'Dholakia Ventures', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/svgs/Dholakia-9.svg', width: 130, height: 48 },
        ];

        const carouselData = [
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg01-2.jpg", order: 1 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg02-3.jpg", order: 2 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg03-4.jpg", order: 3 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg04-5.jpg", order: 4 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg05-6.jpg", order: 5 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg06-7.jpg", order: 6 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg07-8.jpg", order: 7 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg10-9.jpg", order: 9 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg11-10.jpg", order: 10 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg12-11.jpg", order: 11 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg13-12.jpg", order: 12 },
            { imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e6c33f1f-26f1-4bf2-92ba-b28a162e87df-broomees-com/assets/images/Sliderimg14-13.jpg", order: 13 }
        ];

        // Clear existing
        await Promise.all([
            Service.deleteMany({}),
            TeamMember.deleteMany({}),
            Investor.deleteMany({}),
            CarouselItem.deleteMany({})
        ]);

        // Insert new
        const [seededServices] = await Promise.all([
            Service.insertMany(services),
            TeamMember.insertMany(teamData),
            Investor.insertMany(investorData),
            CarouselItem.insertMany(carouselData)
        ]);

        res.json({
            message: 'Database seeded successfully',
            servicesCount: seededServices.length
        });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({ message: 'Seeding failed', error: error.message });
    }
};

// @desc    Migrate local data to MongoDB Atlas
// @route   POST /api/maintenance/migrate
// @access  Private/Admin
const migrateToAtlas = async (req, res) => {
    const SOURCE_URI = process.env.MONGODB_LOCAL;
    const DEST_URI = process.env.MONGODB_ATLAS;

    if (!SOURCE_URI || !DEST_URI) {
        return res.status(400).json({ message: 'Migration URIs not configured in .env' });
    }

    let sourceConn, destConn;
    const COLLECTIONS = ['users', 'services', 'bookings', 'workers', 'attendance'];

    try {
        sourceConn = await mongoose.createConnection(SOURCE_URI).asPromise();
        destConn = await mongoose.createConnection(DEST_URI).asPromise();

        const results = [];

        for (const colName of COLLECTIONS) {
            const sourceCol = sourceConn.db.collection(colName);
            const docs = await sourceCol.find({}).toArray();

            if (docs.length > 0) {
                const destCol = destConn.db.collection(colName);
                await destCol.deleteMany({});
                await destCol.insertMany(docs);
                results.push({ collection: colName, count: docs.length });
            } else {
                results.push({ collection: colName, count: 0, status: 'empty' });
            }
        }

        res.json({ message: 'Migration completed', results });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ message: 'Migration failed', error: error.message });
    } finally {
        if (sourceConn) await sourceConn.close();
        if (destConn) await destConn.close();
    }
};

module.exports = {
    seedDatabase,
    migrateToAtlas
};
