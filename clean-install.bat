@echo off
echo Cleaning up and reinstalling...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install
echo Done! Now run: npm run dev
