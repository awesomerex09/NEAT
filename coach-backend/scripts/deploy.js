const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function deployProject() {
    try {
        console.log("Step 1: Reading local data...");
        const profilesPath = path.join(__dirname, '../../data/user_profiles.json');
        const schedulesPath = path.join(__dirname, '../../data/workout_schedules.json');
        
        const students = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
        const workouts = JSON.parse(fs.readFileSync(schedulesPath, 'utf8'));

        console.log("Step 2: Generating frontend static TS file...");
        const tsContent = `// Auto-generated from local JSON data\n\n` +
                          `export const STUDENT_PROFILES = ${JSON.stringify(students, null, 2)};\n\n` +
                          `export const WORKOUT_SCHEDULES = ${JSON.stringify(workouts, null, 2)};\n`;
        
        const frontendDataDir = path.join(__dirname, '../../client-frontend/src/data');
        if (!fs.existsSync(frontendDataDir)) {
            fs.mkdirSync(frontendDataDir, { recursive: true });
        }
        
        fs.writeFileSync(path.join(frontendDataDir, 'importedData.ts'), tsContent);

        console.log("Step 3: Building frontend for Production...");
        const frontendPath = path.join(__dirname, '../../client-frontend');
        execSync("npm run build", { cwd: frontendPath, stdio: 'inherit' });

        console.log("Step 4: Committing and Pushing to GitHub (main branch)...");
        const rootPath = path.join(__dirname, '../../');
        execSync("git add .", { cwd: rootPath, stdio: 'inherit' });
        execSync('git commit -m "Coach Auto Deploy: Update schedules and profiles" || echo "No changes to commit"', { cwd: rootPath, stdio: 'inherit' });
        execSync("git push origin main", { cwd: rootPath, stdio: 'inherit' });

        console.log("Step 5: Deploying to GitHub Pages (gh-pages branch)...");
        // Use gh-pages to deploy the dist folder. We'll run gh-pages from client-frontend.
        execSync("npx gh-pages -d dist", { cwd: frontendPath, stdio: 'inherit' });

        console.log("🎉 Deployment successful! The site will be updated on github.io shortly.");
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        process.exit(1);
    }
}

deployProject();
