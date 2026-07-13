import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check system process env variables first (common in CI/CD platforms like Vercel)
let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  // Read .env file in the root as a local fallback
  const envPath = path.resolve(__dirname, '../.env');
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        if (line.startsWith('VITE_SUPABASE_URL=')) {
          supabaseUrl = line.split('=')[1].trim();
        }
        if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
          supabaseKey = line.split('=')[1].trim();
        }
      }
    }
  } catch (e) {
    console.warn('Could not read .env file, checking system process.env...:', e.message);
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase URL or Anon Key. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/products', priority: '0.9', changefreq: 'daily' },
  { path: '/categories', priority: '0.8', changefreq: 'weekly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/manufacturing', priority: '0.8', changefreq: 'monthly' },
  { path: '/gallery', priority: '0.8', changefreq: 'weekly' },
  { path: '/testimonials', priority: '0.7', changefreq: 'weekly' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.3', changefreq: 'monthly' },
  { path: '/terms-conditions', priority: '0.3', changefreq: 'monthly' }
];

async function generate() {
  console.log('Generating Sitemap...');
  const siteUrl = 'https://nikhilfurniture.com';
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // Add Static Pages
  for (const p of STATIC_PAGES) {
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}${p.path}</loc>\n`;
    xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
    xml += `    <priority>${p.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Fetch Categories
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/categories?select=name,thumbnail_image`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (res.ok) {
      const categories = await res.json();
      for (const cat of categories) {
        const catUrl = `${siteUrl}/products?category=${encodeURIComponent(cat.name)}`;
        xml += `  <url>\n`;
        xml += `    <loc>${catUrl}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        if (cat.thumbnail_image) {
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${cat.thumbnail_image}</image:loc>\n`;
          xml += `      <image:title>${cat.name} Category Showcase</image:title>\n`;
          xml += `    </image:image>\n`;
        }
        xml += `  </url>\n`;
      }
    }
  } catch (err) {
    console.error('Failed to fetch categories for sitemap:', err.message);
  }

  // Fetch Products
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=name,slug,featured_image,short_description`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (res.ok) {
      const products = await res.json();
      for (const p of products) {
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/products/${p.slug}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        if (p.featured_image) {
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${p.featured_image}</image:loc>\n`;
          xml += `      <image:title>${p.name} - Handcrafted Solid Wood Furniture</image:title>\n`;
          xml += `      <image:caption>${p.short_description || ''}</image:caption>\n`;
          xml += `    </image:image>\n`;
        }
        xml += `  </url>\n`;
      }
    }
  } catch (err) {
    console.error('Failed to fetch products for sitemap:', err.message);
  }

  xml += '</urlset>\n';

  const outDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml);
  console.log('Sitemap generated successfully in public/sitemap.xml!');

  // Generate robots.txt
  let robots = `User-agent: *\n`;
  robots += `Allow: /\n`;
  robots += `Disallow: /admin/\n`;
  robots += `Disallow: /admin/*\n`;
  robots += `Disallow: /*?*\n`; // Disallow indexing of raw parameters to prevent duplicate query crawl loops
  robots += `Allow: /products?category=*\n`; // Allow filtered category landing routes
  robots += `\n`;
  robots += `Sitemap: ${siteUrl}/sitemap.xml\n`;

  fs.writeFileSync(path.join(outDir, 'robots.txt'), robots);
  console.log('robots.txt generated successfully in public/robots.txt!');
}

generate();
