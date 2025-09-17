# UniManagePro

Hey there! 👋 This is our university's resource management system that makes booking labs, sports facilities, and other resources super simple. No more complicated forms or double-booking mishaps!

## 🚀 Getting Started

### The Easy Way (Recommended)
Just run the start script:
```powershell
# On Windows
.\start.ps1

# Or if you prefer Command Prompt
.\start.bat
```

### Manual Setup
If you're the tinkering type:
```bash
# Install dependencies
npm install

# Start the development servers
npm run dev
```
Then open: http://localhost:5000 in your favorite browser

## 🔍 What's Inside

### 📚 All Your Departments Covered
We've got all the academic bases covered:
- **Engineering**: From Civil to Electrical, all the labs you need
- **Sciences**: Chemistry, Physics, Bio - all the -ologies
- **Arts & More**: For when you need to get creative
- **Sports**: Courts and fields for when you need to burn off some steam

### ⚡ Quick Booking Magic
- **Pick a Day**: See the next 7 days at a glance
- **Time Slots**: Click to book, no more typing in times
- **Smart Hours**: Labs close at 3, sports at 7 - we remember so you don't have to
- **No Oops Moments**: Can't book what's not available

### 🏗️ Real Facilities
We didn't just make these up - these are the actual labs and spaces you can book:
- **Engineering**: Fluid Mechanics, Hydraulics, all the good stuff
- **Science Labs**: All the beakers and burners you'll ever need
- **Creative Spaces**: For when you need to make some noise (or art)

## 🛠️ Under the Hood

### Tech We're Using
- **Frontend**: React with TypeScript (because we like our code like we like our coffee - strongly typed)
- **Styling**: TailwindCSS for making things look good without the headache
- **Backend**: Express.js keeping things running smoothly
- **Database**: SQLite - simple, file-based, and just works
- **UI Components**: Radix UI for accessible, unstyled components

### Project Layout
```
UniManagePro/
├── client/          # All the frontend magic
├── server/          # Backend logic and API routes
├── shared/          # Types and utilities we use everywhere
└── unimanagepro.db  # Where all the data lives (don't delete this!)
```

## 🚧 Development Notes

- The SQLite database gets created automatically on first run
- Frontend runs on port 3000, backend on 5000
- Hot reload is enabled, so your changes show up instantly
- If something breaks, try deleting `unimanagepro.db` (you'll lose any test data)

## 📝 Need Help?

Found a bug? Have a feature idea? Open an issue and we'll take a look. Or better yet, submit a PR!

## License

MIT - go wild with it!
