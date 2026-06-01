const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const Exam = require('./models/Exam');
const Timetable = require('./models/Timetable');
require('dotenv').config();

const subjects = ['Mathematics', 'Operating Systems', 'Database Systems', 'Computer Networks', 'Software Engineering', 'Algorithms', 'Cloud Computing', 'Artificial Intelligence'];
const priorities = ['High', 'Med', 'Low'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const colors = ['#7c3aed', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // We won't clear everything to avoid deleting user's own data, 
        // but we'll remove existing test users to avoid duplicates
        const testEmails = Array.from({ length: 10 }, (_, i) => `user${i + 1}@test.com`);
        const existingTestUsers = await User.find({ email: { $in: testEmails } });
        const existingIds = existingTestUsers.map(u => u._id);

        await Task.deleteMany({ userId: { $in: existingIds } });
        await Exam.deleteMany({ userId: { $in: existingIds } });
        await Timetable.deleteMany({ userId: { $in: existingIds } });
        await User.deleteMany({ email: { $in: testEmails } });

        console.log('Cleaned up previous test data.');

        for (let i = 1; i <= 10; i++) {
            const email = `user${i}@test.com`;
            const name = `Test User ${i}`;
            
            // Create User
            const user = new User({
                name,
                email,
                password: 'password123' // Will be hashed by pre-save hook
            });
            await user.save();
            console.log(`Created user: ${email}`);

            // Create 3-5 Tasks
            const taskCount = getRandomInt(3, 5);
            for (let t = 0; t < taskCount; t++) {
                await Task.create({
                    title: `${getRandom(subjects)} Assignment ${t + 1}`,
                    description: `This is a mock assignment for ${name}`,
                    priority: getRandom(priorities),
                    isCompleted: Math.random() > 0.7,
                    userId: user._id,
                    dueDate: new Date(Date.now() + getRandomInt(1, 14) * 24 * 60 * 60 * 1000)
                });
            }

            // Create 2 Exams
            for (let e = 0; e < 2; e++) {
                await Exam.create({
                    name: `${getRandom(subjects)} ${e === 0 ? 'Mid-Sem' : 'Finals'}`,
                    subject: getRandom(subjects),
                    date: new Date(Date.now() + getRandomInt(5, 30) * 24 * 60 * 60 * 1000),
                    color: getRandom(colors),
                    progress: getRandomInt(0, 80),
                    userId: user._id
                });
            }

            // Create Timetable (5-8 classes)
            const ttCount = getRandomInt(5, 8);
            const usedSlots = new Set();
            while (usedSlots.size < ttCount) {
                const day = getRandom(days);
                const timeIdx = getRandomInt(0, 4);
                const slotKey = `${day}-${timeIdx}`;
                
                if (!usedSlots.has(slotKey)) {
                    usedSlots.add(slotKey);
                    await Timetable.create({
                        day,
                        timeIdx,
                        subject: getRandom(subjects),
                        room: `Room ${getRandomInt(101, 505)}`,
                        userId: user._id
                    });
                }
            }
        }

        console.log('Successfully seeded 10 mock users and their data!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
