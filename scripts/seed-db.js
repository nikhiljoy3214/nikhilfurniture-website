import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables in .env');
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // Sign in as admin to get auth privileges
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@nikhilfurniture.com',
    password: 'AdminNikhil@1995'
  });

  if (authError) {
    console.error('Authentication failed:', authError.message);
    process.exit(1);
  }
  console.log('Authenticated successfully as admin!');

  // Upload images
  const images = ['sofa.jpg', 'dining.jpg', 'bed.jpg', 'wardrobe.jpg'];
  const imageUrls = {};

  for (const img of images) {
    const filePath = path.resolve(process.cwd(), `src/assets/images/${img}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Error: Local image not found at ${filePath}`);
      process.exit(1);
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = 'image/jpeg';
    
    console.log(`Uploading ${img} to storage...`);
    const { data, error } = await supabase.storage
      .from('furniture')
      .upload(img, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });
      
    if (error) {
      console.error(`Error uploading ${img}:`, error.message);
    } else {
      console.log(`Uploaded ${img} successfully!`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('furniture')
      .getPublicUrl(img);
      
    imageUrls[img] = publicUrl;
  }

  console.log('Storage images uploaded. Public URLs:', imageUrls);

  // Generate 78 products (6 per category, 13 categories)
  const categories = [
    'Wooden Sofa Sets', 'Corner Sofa Sets', 'Wooden Dining Tables',
    'Dining Chairs', 'Wooden Cots', 'Wardrobes / Almirahs',
    'Teapoys', 'Wooden Benches', 'TV Units', 'Bookshelves',
    'Study Tables', 'Office Furniture', 'Customized Furniture'
  ];

  const woodTypes = ['Premium Teak Wood', 'Rosewood', 'Mahogany', 'Walnut Wood', 'Anjili', 'Jackwood'];
  const finishes = ['Natural Matte', 'Glossy Honey', 'Teak Gloss', 'Walnut Stain', 'Satin Wax Finish'];

  const products = [];
  let count = 0;

  for (const category of categories) {
    for (let i = 1; i <= 6; i++) {
      count++;
      const id = crypto.randomUUID();
      const wood = woodTypes[count % woodTypes.length];
      const finish = finishes[count % finishes.length];
      
      let name = '';
      let mainImg = '';
      let gallery = [];
      let features = [];
      let specs = {};
      let dimensions = '';

      if (category === 'Wooden Sofa Sets') {
        const names = ['Heritage Teak Sofa Set', 'Malabar Royal Sofa', 'Classic Kerala 3-Seater', 'Traditional Carved Sofa Set', 'Imperial Wood Sofa Set', 'Contemporary Teak Couch'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['sofa.jpg'];
        gallery = [imageUrls['sofa.jpg'], imageUrls['dining.jpg'], imageUrls['wardrobe.jpg']];
        features = ['Hand-carved premium backrest', 'High-density density foam support', 'Reinforced joinery for longevity', 'Termite resistant hardwood structure'];
        dimensions = '3-Seater: 180cm x 85cm x 90cm, Single: 85cm x 85cm x 90cm';
        specs = { 'Seating Capacity': '3+1+1', 'Cushion Included': 'Yes (Premium Fabric)', 'Warranty': '5 Years' };
      } 
      else if (category === 'Corner Sofa Sets') {
        const names = ['Royal Corner Sofa', 'L-Shape Premium Sectional', 'Grand Malabar Corner Suite', 'Nilambur Sectional Sofa', 'Modernist Corner Sofa', 'Imperial L-Couch'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['sofa.jpg'];
        gallery = [imageUrls['sofa.jpg'], imageUrls['dining.jpg'], imageUrls['wardrobe.jpg']];
        features = ['Modular layout options', 'Extra deep seating comfort', 'Premium performance fabric', 'Sturdy wooden legs'];
        dimensions = '240cm x 180cm x 85cm';
        specs = { 'Orientation': 'Reversible', 'Leg Material': wood, 'Seating Capacity': '6-7' };
      }
      else if (category === 'Wooden Dining Tables') {
        const names = ['Signature Dining Collection', 'Nilambur 6-Seater Table', 'Mahogany Oval Dining Table', 'Rustic Bench Dining Set', 'Heritage Round Dinner Table', 'Modern Solid Wood Dining Table'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['dining.jpg'];
        gallery = [imageUrls['dining.jpg'], imageUrls['sofa.jpg'], imageUrls['wardrobe.jpg']];
        features = ['Solid wood table top', 'Heat and water-resistant top coat', 'Elegant leg detailing', 'Perfect for family gatherings'];
        dimensions = '180cm x 90cm x 75cm';
        specs = { 'Seating Capacity': '6 Seater', 'Table Shape': i % 2 === 0 ? 'Rectangular' : 'Oval', 'Table Top Thickness': '40mm' };
      }
      else if (category === 'Dining Chairs') {
        const names = ['Elegance Dining Chair', 'Cushioned Rosewood Chair', 'Classic Slatted Chair', 'Heritage Carver Chair', 'Crossback Teak Chair', 'Modern Upholstered Chair'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['dining.jpg'];
        gallery = [imageUrls['dining.jpg'], imageUrls['sofa.jpg']];
        features = ['Ergonomic back support', 'Scratch-resistant nylon feet pads', 'Premium cushioning option', 'Tenon and mortise joinery'];
        dimensions = '45cm x 50cm x 100cm';
        specs = { 'Seat Height': '45cm', 'Upholstery Material': 'Premium Linen', 'Max Weight Capacity': '150kg' };
      }
      else if (category === 'Wooden Cots') {
        const names = ['Elegance Wooden Cot', 'Royal King Size Cot', 'Malabar Queen Bed', 'Classic Poster Cot', 'Traditional Kerala Cot', 'Modern Platform Bed'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['bed.jpg'];
        gallery = [imageUrls['bed.jpg'], imageUrls['wardrobe.jpg'], imageUrls['sofa.jpg']];
        features = ['Solid wood headboard and frame', 'Heavy-duty support slats', 'Zero creaking noise warranty', 'Under-bed clearance for storage'];
        dimensions = 'King: 180cm x 200cm, Queen: 150cm x 200cm';
        specs = { 'Recommended Mattress Size': '180cm x 200cm', 'Headboard Height': '120cm', 'Storage Included': 'No' };
      }
      else if (category === 'Wardrobes / Almirahs') {
        const names = ['Premium Kerala Wardrobe', 'Heritage Almirah with Mirror', '3-Door Teak Wardrobe', 'Royal 4-Door Wardrobe', 'Classic Bedroom Closet', 'Compact Wooden Wardrobe'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['wardrobe.jpg'];
        gallery = [imageUrls['wardrobe.jpg'], imageUrls['bed.jpg'], imageUrls['sofa.jpg']];
        features = ['Multi-shelf partition', 'Internal lockable drawer (Locker)', 'Brass fittings and handles', 'Integrated mirror and hanging rail'];
        dimensions = '120cm x 60cm x 200cm';
        specs = { 'Number of Doors': i % 2 === 0 ? '3 Doors' : '2 Doors', 'Mirror Included': 'Yes', 'Hanging Rail': 'Stainless Steel' };
      }
      else if (category === 'Teapoys') {
        const names = ['Walnut Teapoy', 'Classic Oval Coffee Table', 'Carved Rosewood Teapoy', 'Minimalist Coffee Table', 'Hexagonal Wood Teapoy', 'Teak End Table'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['dining.jpg'];
        gallery = [imageUrls['dining.jpg'], imageUrls['sofa.jpg']];
        features = ['Lower shelf for magazine storage', 'Tempered glass top option', 'Smooth rounded edges', 'Compact premium accent piece'];
        dimensions = '90cm x 50cm x 45cm';
        specs = { 'Shape': 'Oval', 'Table Top Type': 'Solid Wood', 'Assembly': 'Pre-assembled' };
      }
      else if (category === 'Wooden Benches') {
        const names = ['Classic Wooden Bench', 'Heritage Verandah Bench', 'Carved Dining Bench', 'Traditional Kerala Settee', 'Outdoor Teak Bench', 'Minimalist Corridor Bench'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['dining.jpg'];
        gallery = [imageUrls['dining.jpg'], imageUrls['sofa.jpg']];
        features = ['Traditional Kerala style (Padi)', 'Polished to resist weather', 'Perfect for corridors and porches', 'Extremely durable build'];
        dimensions = '150cm x 40cm x 45cm';
        specs = { 'Seating Capacity': '3-4 Persons', 'Backrest': i % 2 === 0 ? 'Yes' : 'No', 'Weight': '25kg' };
      }
      else if (category === 'TV Units') {
        const names = ['Console TV Unit', 'Teak Floating Media Center', 'Heritage Entertainment Cabinet', 'Modern Low-Line Stand', 'Classic TV Console', 'Corner TV Cabinet'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['wardrobe.jpg'];
        gallery = [imageUrls['wardrobe.jpg'], imageUrls['dining.jpg']];
        features = ['Wire management cutouts', 'Spacious open compartments', 'Soft-close cabinet doors', 'Elevated legs for floor cleaning'];
        dimensions = '160cm x 45cm x 55cm';
        specs = { 'Supported TV Size': 'Up to 65 inches', 'Cable Management': 'Yes', 'Drawers': '2 Soft-close' };
      }
      else if (category === 'Bookshelves') {
        const names = ['Vintage Library Shelf', 'Classic Open Bookcase', 'Royal Mahogany Bookshelf', 'Minimalist Divider Shelf', 'Slanted Designer Shelf', 'Compact Study Bookcase'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['wardrobe.jpg'];
        gallery = [imageUrls['wardrobe.jpg'], imageUrls['bed.jpg']];
        features = ['Deep adjustable shelves', 'Reinforced back panel', 'Tip-over safety hardware included', 'Glass doors to prevent dust'];
        dimensions = '90cm x 35cm x 180cm';
        specs = { 'Number of Shelves': '5 Shelves', 'Door Type': 'Glass sliding', 'Shelf Weight Limit': '35kg each' };
      }
      else if (category === 'Study Tables') {
        const names = ['Executive Study Desk', 'Teak Work Desk', 'Vintage Writing Bureau', 'Student Study Table', 'Compact Computer Table', 'Classic Drawer Desk'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['wardrobe.jpg'];
        gallery = [imageUrls['wardrobe.jpg'], imageUrls['dining.jpg']];
        features = ['Spacious keyboard drawer', 'Side filing cabinet drawer', 'Comfortable leg space design', 'Premium smooth desk finish'];
        dimensions = '120cm x 60cm x 75cm';
        specs = { 'Keyboard Tray': 'Yes', 'Drawers': '3 drawers with locks', 'Desktop Load Capacity': '100kg' };
      }
      else if (category === 'Office Furniture') {
        const names = ['Director Executive Desk', 'Solid Teak Office Credenza', 'Conference Board Table', 'Ergonomic Office Chair', 'Wooden File Cabinet', 'Receptionist Counter Desk'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['wardrobe.jpg'];
        gallery = [imageUrls['wardrobe.jpg'], imageUrls['dining.jpg']];
        features = ['Elegant office aesthetic', 'Heavy duty hardware', 'Designed for commercial use', 'Pre-installed cable grommets'];
        dimensions = '150cm x 75cm x 75cm';
        specs = { 'Application': 'Office/Commercial', 'Lockable Drawers': 'Yes', 'Wood Origin': 'Kerala Government Depot' };
      }
      else if (category === 'Customized Furniture') {
        const names = ['Custom Handcarved Mandir', 'Traditional Wooden Swing', 'Teak Wall Partition', 'Ornate Main Door Frame', 'Wooden Bar Cabinet', 'Custom Wardrobe Extension'];
        name = `${names[i-1]} - ${wood}`;
        mainImg = imageUrls['wardrobe.jpg'];
        gallery = [imageUrls['wardrobe.jpg'], imageUrls['sofa.jpg'], imageUrls['dining.jpg']];
        features = ['100% custom sizing as per site visit', 'Handcrafted detailing by local artisans', 'Lifetime warranty against manufacturing defects', 'Choice of hardware and knobs'];
        dimensions = 'Customized as per site specifications';
        specs = { 'Customization': '100% Made to Order', 'Lead Time': '4-6 weeks', 'Design Consultation': 'Free of cost' };
      }

      let basePrice = 25000;
      if (category === 'Wooden Sofa Sets') basePrice = 75000;
      else if (category === 'Corner Sofa Sets') basePrice = 95000;
      else if (category === 'Wooden Dining Tables') basePrice = 55000;
      else if (category === 'Dining Chairs') basePrice = 8500;
      else if (category === 'Wooden Cots') basePrice = 38000;
      else if (category === 'Wardrobes / Almirahs') basePrice = 65000;
      else if (category === 'Teapoys') basePrice = 12000;
      else if (category === 'Wooden Benches') basePrice = 14500;
      else if (category === 'TV Units') basePrice = 18500;
      else if (category === 'Bookshelves') basePrice = 28000;
      else if (category === 'Study Tables') basePrice = 16000;
      else if (category === 'Office Furniture') basePrice = 32000;
      else if (category === 'Customized Furniture') basePrice = 45000;

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const shortDesc = `Elegant, premium handcrafted ${category.toLowerCase()} made from high-quality ${wood} with a rich ${finish} finish.`;
      const detailedDesc = `Experience the unmatched durability and heritage craftsmanship of our ${name}. Made with precision by Kerala's finest artisans who bring over 30 years of woodworking experience, this ${category.toLowerCase().slice(0, -1)} combines traditional wood-joining techniques with modern ergonomics. The selected ${wood} is seasoned and treated for maximum pest and termite resistance, and coated in an exquisite ${finish} that highlights the wood's natural grain and texture. Perfect for premium homes in Kerala looking for a touch of timeless luxury.`;

      products.push({
        id,
        name,
        slug,
        short_description: shortDesc,
        detailed_description: detailedDesc,
        category,
        wood_type: wood,
        finish,
        dimensions,
        specifications: specs,
        features,
        featured_image: mainImg,
        gallery_images: gallery,
        seo_title: `${name} | Premium Wooden Furniture | Kerala`,
        seo_description: `Browse the ${name} by Nikhil Furniture. Handcrafted in Kerala using premium ${wood} with a high-end ${finish}. WhatsApp for pricing.`,
        alt_text: `${name} - Handcrafted from ${wood} by Nikhil Furniture Kerala`,
        tags: [category, wood, finish, 'Kerala Furniture', 'Handcrafted', 'Luxury Wood'],
        is_featured: i === 1,
        is_popular: i === 2,
        is_new_arrival: i === 3,
        sort_order: count,
        base_price: basePrice
      });
    }
  }

  console.log(`Inserting ${products.length} products into the database...`);
  
  // Truncate existing products
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('name', 'xyz');

  if (deleteError) {
    console.error('Error clearing products table:', deleteError.message);
  }

  // Insert in chunks
  const chunkSize = 10;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const { error: insertError } = await supabase
      .from('products')
      .insert(chunk);

    if (insertError) {
      console.error(`Error inserting chunk starting at index ${i}:`, insertError.message);
    } else {
      console.log(`Inserted products chunk ${i / chunkSize + 1} successfully.`);
    }
  }

  // Insert base site settings
  const siteSettings = {
    companyName: 'Nikhil Furniture',
    tagline: 'Crafting Timeless Wooden Furniture Since 1995',
    address: {
      line1: 'Pudukkad P.O.',
      line2: 'Thrissur',
      city: 'Thrissur',
      state: 'Kerala',
      pin: '680301'
    },
    phoneNumbers: ['9746321808', '9447241559', '9745334644'],
    whatsAppNumber: '9746321808',
    instagramUrl: 'https://www.instagram.com/nikhil__furniture',
    facebookUrl: 'https://www.facebook.com/profile.php?id=100065195572493',
    workingHours: '9:00 AM - 7:00 PM (Monday - Saturday)',
    email: 'info@nikhilfurniture.com'
  };

  console.log('Inserting global site settings...');
  const { error: settingsError } = await supabase
    .from('site_settings')
    .upsert({
      key: 'general',
      value: siteSettings
    });

  if (settingsError) {
    console.error('Error inserting site settings:', settingsError.message);
  } else {
    console.log('Site settings inserted successfully!');
  }

  console.log('Database seeding completed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
