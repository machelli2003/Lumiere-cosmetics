require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const readline = require('readline');

const User = require('../models/User');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Interactive prompt (used for credentials and optionally Mongo URI)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const ask = (question, defaultValue) => new Promise((resolve) => {
    if (process.env[question]) return resolve(process.env[question]);
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(prompt, answer => resolve(answer || defaultValue));
});

const isValidMongoUri = (uri) => /^mongodb(\+srv)?:\/\//.test(uri);

const getMongoUri = async () => {
    let uri = process.env.MONGO_URI || '';
    if (!isValidMongoUri(uri)) {
        const defaultLocal = 'mongodb://localhost:27017/lumiere_cosmetics';
        uri = await ask('MONGO_URI', defaultLocal);
    }
    if (!isValidMongoUri(uri)) {
        throw new Error('Invalid MongoDB URI. Must start with "mongodb://" or "mongodb+srv://"');
    }
    return uri;
};

// Will log a masked version after resolution

const brands = [
    { name: 'Charlotte Tilbury', slug: 'charlotte-tilbury', description: 'Iconic British luxury makeup brand known for timeless glamour.', origin: 'UK', isFeatured: true },
    { name: 'La Mer', slug: 'la-mer', description: 'Ultra-luxury skincare powered by Miracle Broth.', origin: 'USA', isFeatured: true },
    { name: 'Sulwhasoo', slug: 'sulwhasoo', description: 'Holistic Korean beauty wisdom rooted in hanbang botanicals.', origin: 'South Korea', isFeatured: true },
    { name: 'NARS', slug: 'nars', description: 'High-performance, boldly pigmented color cosmetics.', origin: 'USA', isFeatured: false },
    { name: 'Sisley Paris', slug: 'sisley-paris', description: 'Pioneering phyto-cosmetic formulations from Paris.', origin: 'France', isFeatured: true },
];

const categories = [
    { name: 'Skincare', slug: 'skincare', isFeatured: true },
    { name: 'Makeup', slug: 'makeup', isFeatured: true },
    { name: 'Serums', slug: 'serums', isFeatured: true },
    { name: 'Moisturizers', slug: 'moisturizers', isFeatured: false },
    { name: 'Foundations', slug: 'foundations', isFeatured: false },
    { name: 'Lip Color', slug: 'lip-color', isFeatured: true },
    { name: 'Eye Makeup', slug: 'eye-makeup', isFeatured: false },
    { name: 'Cleansers', slug: 'cleansers', isFeatured: false },
];

const generateProducts = (brands, categories) => {
    const skincareId = categories.find(c => c.slug === 'skincare')?._id;
    const makeupId = categories.find(c => c.slug === 'makeup')?._id;
    const serumsId = categories.find(c => c.slug === 'serums')?._id;
    const lipId = categories.find(c => c.slug === 'lip-color')?._id;
    const moistId = categories.find(c => c.slug === 'moisturizers')?._id;

    const ctBrand = brands.find(b => b.slug === 'charlotte-tilbury')?._id;
    const laMerBrand = brands.find(b => b.slug === 'la-mer')?._id;
    const sulBrand = brands.find(b => b.slug === 'sulwhasoo')?._id;
    const narsBrand = brands.find(b => b.slug === 'nars')?._id;
    const sisleyBrand = brands.find(b => b.slug === 'sisley-paris')?._id;

    return [
        {
            name: 'Magic Cream Moisturizer',
            slug: 'charlotte-tilbury-magic-cream',
            description: 'The Magic Cream is Charlotte iconic secret weapon. Supercharged with Charlotte exclusive Magic Matrix complex, skin is smoother, plumper and more radiant from the very first application.',
            shortDescription: 'Multi-award winning luxury face cream for plump, radiant skin.',
            brand: ctBrand, category: moistId,
            basePrice: 1250000, compareAtPrice: 1450000,
            stock: 50, tags: ['moisturizer', 'anti-aging', 'luxury'],
            skinType: ['all'], isFeatured: true, isBestSeller: true,
            images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800', isPrimary: true }],
            averageRating: 4.8, reviewCount: 124, totalSold: 89,
        },
        {
            name: 'Creme de la Mer Moisturizing Cream',
            slug: 'la-mer-creme-moisturizing',
            description: 'The legendary formula that started it all. This intensely moisturizing cream is powered by our nutrient-rich Miracle Broth to help renew skin energy, bringing new life to its look.',
            shortDescription: 'The original ultra-luxury moisturizer powered by Miracle Broth.',
            brand: laMerBrand, category: moistId,
            basePrice: 4500000, compareAtPrice: null,
            stock: 30, tags: ['moisturizer', 'luxury', 'anti-aging', 'hydrating'],
            skinType: ['dry', 'combination', 'normal'], isFeatured: true,
            images: [{ url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800', isPrimary: true }],
            averageRating: 4.9, reviewCount: 287, totalSold: 203,
        },
        {
            name: 'First Care Activating Serum',
            slug: 'sulwhasoo-first-care-serum',
            description: 'The iconic first step of Sulwhasoo skincare ritual. Enriched with Jaum Activator containing five core medicinal plants, it restores skin optimal condition for subsequent products to work more effectively.',
            shortDescription: 'The essential first step for balanced, radiant Korean skin ritual.',
            brand: sulBrand, category: serumsId,
            basePrice: 1800000, compareAtPrice: 2100000,
            stock: 45, tags: ['serum', 'korean-beauty', 'anti-aging', 'brightening'],
            skinType: ['all'], isFeatured: true, isBestSeller: true, isNewArrival: false,
            images: [{ url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800', isPrimary: true }],
            averageRating: 4.7, reviewCount: 196, totalSold: 155,
        },
        {
            name: 'Soft Matte Complete Foundation',
            slug: 'nars-soft-matte-foundation',
            description: 'A full-coverage, long-wearing formula that creates a natural matte finish without creasing or settling into lines. Buildable coverage with a skin-like texture.',
            shortDescription: 'Full-coverage, long-wearing matte foundation for all skin types.',
            brand: narsBrand, category: makeupId,
            basePrice: 980000, compareAtPrice: null,
            stock: 0, hasVariants: true,
            variants: [
                { name: 'Shade', value: 'Deauville', sku: 'NARS-SMF-DEA', price: 980000, stock: 15 },
                { name: 'Shade', value: 'Syracuse', sku: 'NARS-SMF-SYR', price: 980000, stock: 8 },
                { name: 'Shade', value: 'Barcelona', sku: 'NARS-SMF-BAR', price: 980000, stock: 0 },
                { name: 'Shade', value: 'Stromboli', sku: 'NARS-SMF-STR', price: 980000, stock: 22 },
            ],
            tags: ['foundation', 'makeup', 'full-coverage', 'matte'],
            skinType: ['oily', 'combination'], isFeatured: true,
            images: [{ url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', isPrimary: true }],
            averageRating: 4.5, reviewCount: 312, totalSold: 178,
        },
        {
            name: 'Black Loulou Lipstick',
            slug: 'charlotte-tilbury-black-loulou-lipstick',
            description: 'Charlotte iconic lipstick collection. An ultra-flattering formula enriched with hyaluronic acid, vitamin E, and a conditioning complex. This velvety-matte finish delivers bold color that lasts all day.',
            shortDescription: 'Iconic velvety-matte lipstick with hydrating formula.',
            brand: ctBrand, category: lipId,
            basePrice: 720000, compareAtPrice: null,
            stock: 0, hasVariants: true,
            variants: [
                { name: 'Shade', value: 'Pillow Talk', sku: 'CT-LIP-PT', price: 720000, stock: 40 },
                { name: 'Shade', value: 'Walk of Shame', sku: 'CT-LIP-WOS', price: 720000, stock: 25 },
                { name: 'Shade', value: 'Nude Romance', sku: 'CT-LIP-NR', price: 720000, stock: 18 },
                { name: 'Shade', value: 'Very Victoria', sku: 'CT-LIP-VV', price: 720000, stock: 30 },
            ],
            tags: ['lipstick', 'makeup', 'long-lasting'],
            skinType: ['all'], isBestSeller: true,
            images: [{ url: 'https://images.unsplash.com/photo-1586495777744-4e6232bf4e66?w=800', isPrimary: true }],
            averageRating: 4.6, reviewCount: 445, totalSold: 392,
        },
        {
            name: 'Black Rose Cream Mask',
            slug: 'sisley-black-rose-cream-mask',
            description: 'A luxurious rose-scented cream mask that intensely nourishes and deeply revitalizes the complexion overnight. Wake up to visibly younger, glowing skin enriched with black rose extract.',
            shortDescription: 'Overnight luxury mask with black rose extract for radiant renewal.',
            brand: sisleyBrand, category: skincareId,
            basePrice: 3200000, compareAtPrice: null,
            stock: 20, tags: ['mask', 'overnight', 'anti-aging', 'luxury', 'rose'],
            skinType: ['dry', 'normal'], isFeatured: true, isNewArrival: true,
            images: [{ url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800', isPrimary: true }],
            averageRating: 4.9, reviewCount: 78, totalSold: 45,
        },
        {
            name: 'Concentrated Serum',
            slug: 'la-mer-concentrated-serum',
            description: 'A concentrated dose of Miracle Broth helps visibly reduce wrinkles, firm skin, and restore an intensely youthful radiance. Its advanced formula penetrates deeply to address multiple signs of aging.',
            shortDescription: 'Ultra-concentrated anti-aging serum with Miracle Broth.',
            brand: laMerBrand, category: serumsId,
            basePrice: 5800000, compareAtPrice: null,
            stock: 15, tags: ['serum', 'anti-aging', 'luxury', 'firming'],
            skinType: ['all'], isFeatured: false,
            images: [{ url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800', isPrimary: true }],
            averageRating: 4.8, reviewCount: 134, totalSold: 67,
        },
        {
            name: 'Concentrated Ginseng Renewing Serum',
            slug: 'sulwhasoo-ginseng-serum',
            description: 'Harnessing the power of 6-year-old Korean red ginseng, this intensive anti-aging serum firms, lifts and brightens skin for a visibly younger complexion. Formulated with exclusive Ginsenomics technology.',
            shortDescription: 'Premium ginseng serum for visible firming and brightening.',
            brand: sulBrand, category: serumsId,
            basePrice: 3500000, compareAtPrice: 4000000,
            stock: 25, tags: ['serum', 'ginseng', 'anti-aging', 'firming', 'brightening'],
            skinType: ['all'], isNewArrival: true,
            images: [{ url: 'https://images.unsplash.com/photo-1585184394271-4c0a47dc59c9?w=800', isPrimary: true }],
            averageRating: 4.7, reviewCount: 89, totalSold: 54,
        },
    ];
};

const seed = async () => {
    try {
        const resolvedMongoUri = await getMongoUri();
        console.log('Using MONGO_URI:', resolvedMongoUri.replace(/:([^:@]+)@/, ':****@'));
        await mongoose.connect(resolvedMongoUri);
        console.log('Connected to MongoDB');

        // Ask user whether to seed mock/sample data. Default: no.
        const seedMock = (await ask('SEED_MOCK', 'no')).toString().toLowerCase();
        if (['y', 'yes', 'true', '1'].includes(seedMock)) {
            await Promise.all([
                User.deleteMany({}),
                Brand.deleteMany({}),
                Category.deleteMany({}),
                Product.deleteMany({}),
                Cart.deleteMany({}),
            ]);
            console.log('Cleared existing data');

            const createdBrands = await Brand.insertMany(brands);
            console.log('Seeded ' + createdBrands.length + ' brands');

            const createdCategories = await Category.insertMany(categories);
            console.log('Seeded ' + createdCategories.length + ' categories');

            const productData = generateProducts(createdBrands, createdCategories);
            const createdProducts = await Product.insertMany(productData);
            console.log('Seeded ' + createdProducts.length + ' products');

            // Prompt for or read admin/test credentials from environment
            const adminEmail = await ask('ADMIN_EMAIL', 'admin@lumiere.com');
            const adminPassword = await ask('ADMIN_PASSWORD', null);
            const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || null;
            const testEmail = await ask('TEST_USER_EMAIL', 'sophie@example.com');
            const testPassword = await ask('TEST_USER_PASSWORD', null);

            if (!adminPassword) console.log('No admin password provided — you will be prompted to set one when creating users in production.');
            if (!testPassword) console.log('No test user password provided — skipping printing of any passwords.');

            // Use User.create so the pre-save hook hashes the password correctly
            const adminData = {
                firstName: 'Lumiere',
                lastName: 'Admin',
                email: adminEmail,
                role: 'admin',
                isEmailVerified: true,
            };
            if (adminPasswordHash) adminData.password = adminPasswordHash;
            else if (adminPassword) adminData.password = adminPassword;

            // Create admin only if it doesn't already exist — update if present
            let admin = await User.findOne({ email: adminData.email }).select('+password');
            if (admin) {
                const updates = { role: 'admin', isEmailVerified: true };
                if (adminPasswordHash) updates.password = adminPasswordHash;
                else if (adminPassword) updates.password = adminPassword;
                await User.findByIdAndUpdate(admin._id, updates, { new: true });
                admin = await User.findById(admin._id);
            } else {
                if (adminPasswordHash) adminData.password = adminPasswordHash;
                else if (adminPassword) adminData.password = adminPassword;
                admin = await User.create(adminData);
            }

            const testUserData = {
                firstName: 'Sophie',
                lastName: 'Nguyen',
                email: testEmail,
                role: 'user',
                isEmailVerified: true,
            };
            if (testPassword) testUserData.password = testPassword;

            // Create test user if not exists
            let testUser = await User.findOne({ email: testUserData.email }).select('+password');
            if (testUser) {
                testUser = await User.findByIdAndUpdate(testUser._id, testUserData, { new: true });
            } else {
                if (testPassword) testUserData.password = testPassword;
                testUser = await User.create(testUserData);
            }

            await Cart.create({ user: admin._id, items: [] });
            await Cart.create({ user: testUser._id, items: [] });

            console.log('Seeded users');
            console.log('Database seeded successfully!');
            console.log(`Admin created: ${admin.email}`);
            console.log(`Test user created: ${testUser.email}`);
        } else {
            // Optionally create an admin user if the developer wants
            const createAdmin = (await ask('CREATE_ADMIN', 'no')).toString().toLowerCase();
            if (['y', 'yes', 'true', '1'].includes(createAdmin)) {
                const adminEmail = await ask('ADMIN_EMAIL', 'admin@lumiere.com');
                const adminPassword = await ask('ADMIN_PASSWORD', null);
                const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || null;
                const adminData = {
                    firstName: 'Lumiere',
                    lastName: 'Admin',
                    email: adminEmail,
                    role: 'admin',
                    isEmailVerified: true,
                };
                if (adminPasswordHash) adminData.password = adminPasswordHash;
                else if (adminPassword) adminData.password = adminPassword;
                // Check if admin exists; update role if present
                let admin = await User.findOne({ email: adminData.email }).select('+password');
                if (admin) {
                    await User.findByIdAndUpdate(admin._id, { role: 'admin', isEmailVerified: true }, { new: true });
                    console.log('Admin user already exists, updated to admin:', admin.email);
                } else {
                    if (adminPasswordHash) adminData.password = adminPasswordHash;
                    else if (adminPassword) adminData.password = adminPassword;
                    admin = await User.create(adminData);
                    await Cart.create({ user: admin._id, items: [] });
                    console.log('Admin user created:', admin.email);
                }
            } else {
                console.log('No mock data seeded. Database left empty.');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        try { rl.close(); } catch (e) {}
        process.exit(1);
    }
};

seed();