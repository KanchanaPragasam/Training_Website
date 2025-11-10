const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// Path to your courses XML file
const xmlFilePath = path.join(__dirname, 'src/assets/data/courses.xml');

// Base URL of your website
const baseUrl = 'https://www.yourdomain.com';

// Read XML
const parser = new xml2js.Parser({ explicitArray: true, mergeAttrs: true });

fs.readFile(xmlFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading XML file:', err);
    return;
  }

  parser.parseString(data, (err, result) => {
    if (err) {
      console.error('Error parsing XML:', err);
      return;
    }

    // Now attributes are merged, so slug is accessible directly
    const courses = result.courses.course || [];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Home page
    sitemap += `<url><loc>${baseUrl}/</loc><priority>1.0</priority></url>\n`;

    // Each course
    courses.forEach((c) => {
      const slug = c.slug; // now slug comes from attribute
      sitemap += `<url>\n`;
      sitemap += `  <loc>${baseUrl}/courses/${slug}</loc>\n`;
      sitemap += `  <priority>0.8</priority>\n`;
      sitemap += `</url>\n`;
    });

    sitemap += `</urlset>`;

    // Write sitemap.xml
    const sitemapPath = path.join(__dirname, 'src/assets/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('Sitemap generated successfully at src/assets/sitemap.xml');
  });
});
;
