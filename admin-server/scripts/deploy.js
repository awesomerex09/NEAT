const { execSync } = require('child_process');
const ghpages = require('gh-pages');
const path = require('path');

console.log('Step 1: Committing and Pushing to GitHub (main branch)...');
try {
    execSync('git add .', { stdio: 'inherit', cwd: path.join(__dirname, '../../') });
    try {
        execSync('git commit -m "Auto deploy from admin-server"', { stdio: 'inherit', cwd: path.join(__dirname, '../../') });
    } catch (e) {
        console.log('"No changes to commit"');
    }
    execSync('git push origin main', { stdio: 'inherit', cwd: path.join(__dirname, '../../') });
} catch (error) {
    console.error('Error during git push:', error.message);
    process.exit(1);
}

console.log('Step 2: Deploying static client to GitHub Pages (gh-pages branch)...');
ghpages.publish(path.join(__dirname, '../../client'), {
  dotfiles: true
}, function(err) {
  if (err) {
      console.error('Error deploying to gh-pages:', err);
      process.exit(1);
  }
  console.log('🎉 Deployment successful! The site will be updated on github.io shortly.');
});
