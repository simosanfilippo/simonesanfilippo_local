const fs = require('fs');
const https = require('https');
const path = require('path');
const entities = require('entities'); // Importa la libreria per decodificare le entità HTML

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

// Fetch JSON data from the WordPress API feed URL
const feedUrl = 'https://public-api.wordpress.com/wp/v2/sites/simonesanfilippo.art.blog/posts';

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
    feed.forEach(item => {
      // Extract necessary data from each post
      const { id, content, date, link, title } = item;
      // console.log(`Date published: ${date}`);

      // Decode HTML entities in the content and title
      let postContent = entities.decodeHTML(content.rendered);
      let postTitle = title?.rendered ? entities.decodeHTML(title.rendered) : '';

      // Optional: Remove specific unwanted HTML entities (like &nbsp; or &#8211;)
      postContent = postContent.replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '–');

      // Generate a clean filename based on the post slug or ID
      console.log(`item.slug: ${item.slug}. id: ${id}`)
      const filename = item.slug || id.toString();
      const filePath = path.join(outputDir, `${filename}.md`);

      const mdTitle = postTitle ? `title: "${postTitle}"\n` : '';
      // Create the markdown content with front matter (using link as external_url)
      const markdownContent = `---
${mdTitle}date: "${date}"
external_url: "${link}"
type: "post"
---
${postContent}
`;

      // Write the markdown content to a file
      fs.writeFileSync(filePath, markdownContent, 'utf8');
      // console.log(`Generated ${filePath}`);
    });
  });

}).on('error', (err) => {
  console.error('Error fetching the JSON feed:', err.message);
});
