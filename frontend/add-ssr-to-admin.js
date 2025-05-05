const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
  './src/pages/adminUI',
  './src/pages/components'
];

// Function to add getServerSideProps to a file if it doesn't already have it
function addGetServerSideProps(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if it already has getServerSideProps
    if (content.includes('getServerSideProps')) {
      console.log(`Skipping ${filePath} - already has getServerSideProps`);
      return;
    }
    
    // For TypeScript files, add proper typing
    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    
    // Create the getServerSideProps function with proper TypeScript typing if needed
    const ssrFunction = isTypeScript 
      ? `
export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};
`
      : `
export async function getServerSideProps(context) {
  return {
    props: {}, // Will be passed to the page component as props
  }
}
`;

    // Add the function near the end of the file
    let newContent;
    if (content.includes('export default')) {
      // Add before export default
      newContent = content.replace(
        /(export default .+[;]?\s*$)/, 
        `${ssrFunction}\n$1`
      );
    } else {
      // Add at the end
      newContent = content + ssrFunction;
    }
    
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process all files in a directory recursively
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Recurse into subdirectories
      processDirectory(itemPath);
    } else if (stats.isFile() && /\.(jsx?|tsx?)$/.test(item)) {
      // Process JS/TS/JSX/TSX files
      addGetServerSideProps(itemPath);
    }
  });
}

// Process each directory
directories.forEach(dir => {
  console.log(`Processing directory: ${dir}`);
  processDirectory(dir);
});

console.log('Done processing all files.');