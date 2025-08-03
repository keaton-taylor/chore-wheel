# 🧹 Chore Wheel Web App

A simple, web-based Chore Wheel designed for families with multiple children. This app dynamically rotates daily chores among children, ensures chores aren't repeated the next day, and provides a clean, user-friendly interface with Tailwind CSS.

## 👨‍👩‍👧‍👦 Features

- Assigns chores to each child with fair rotation
- Hattie (youngest) gets a tailored, age-appropriate set of tasks
- Prevents the same chore from repeating the next day
- Lock mechanism prevents chore reassignment more than once per 24 hours (CST)
- Built with HTML, JavaScript, and Tailwind CSS
- Lightweight and easy to deploy on GitHub Pages or Netlify

## 📁 Project Structure

```
├── chore-wheel.html      # Main HTML file
├── main.js               # JavaScript logic for chore assignment
├── README.md             # This file
```

## 🚀 How to Use

1. Clone or download this repository.
2. Open `chore-wheel.html` in your browser.
3. Click the **Assign Chores** button to rotate and display new daily tasks.
4. The lock prevents reassigning chores more than once per day.

## 🌐 Hosting

To deploy this project:

### GitHub Pages
- Push your code to GitHub.
- In repo settings, enable GitHub Pages and set the source to your root or `/docs` folder.
- Visit the generated URL to view your app.

### Netlify
- Drag and drop the folder into Netlify Drop (https://app.netlify.com/drop)
- Or connect your GitHub repo to Netlify for auto-deploy

## 🔧 Customization

You can:
- Add or change names in the `kids` array in `main.js`
- Modify the `fullChores` and `hattieChores` arrays
- Add logging, download, or even Firebase integration

## 📝 License

MIT — free to modify and share.
