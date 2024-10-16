const fs = require('fs');
const https = require('https');
const path = require('path');

// Directory where markdown files will be saved
const outputDir = path.join(__dirname, 'content/posts');
const archiveDir = path.join(__dirname, 'content/archive');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}
fs.writeFileSync(path.join(archiveDir, `_index.md`), "", 'utf8');
// Fetch JSON data from the feed URL
const feedUrl = 'https://simone-sanfilippo.micro.blog/feed.json';

https.get(feedUrl, (res) => {
  let data = '';

  // Collect the data from the stream
  res.on('data', chunk => {
    data += chunk;
  });

  // After receiving all data, process it
  res.on('end', () => {
    const feed = JSON.parse(data);

    // Loop through each post in the JSON feed
    feed.items.forEach(item => {
      // Extract necessary data from each post
      const { id, content_html, date_published, url, title } = item;
      console.log(`Date published: ${date_published}`)
      // Generate a clean filename based on the post URL or ID
      const filename = url.split('/').pop().replace('.html', '') || id.split('/').pop();
      const filePath = path.join(outputDir, `${filename}.md`);

const mdTitle = title?`title: "${title}"\n`:''

      // Create the markdown content with front matter (using external_url instead of url)
      const markdownContent = `---
${mdTitle}date: "${date_published}"
external_url: "${url}"
type: "post"
---
${content_html}
`;

      // Write the markdown content to a file
      fs.writeFileSync(filePath, markdownContent, 'utf8');
      console.log(`Generated ${filePath}`);
    });
  });

}).on('error', (err) => {
  console.error('Error fetching the JSON feed:', err.message);
});
