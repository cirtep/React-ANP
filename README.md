# React-ANP

Frontend web application built with **React.js + Tailwind CSS** for CV. Aneka Niaga Pratama (ANP). This dashboard supports sales forecasting and customer analytics to help decision-making processes across sales, product, and customer relationship domains.

---

## 🚀 Features

- 🔐 JWT-based authentication & protected routes
- 📈 Sales Forecasting UI integration (Prophet backend ready)
- 👤 Customer segmentation & loyalty visualization
- 📊 Interactive dashboards (monthly/quarterly trends, charts)
- 📥 Master data import (.csv, .xls, .xlsx) with full-screen overlay
- 🌐 Responsive layout (mobile-friendly)

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── context/          # AuthContext & hooks
├── pages/            # Main route views (Dashboard, CustomerDetail, Settings)
├── layouts/          # Dashboard layout for desktop & mobile
├── services/         # API integrations
├── utils/            # Formatter and helper functions
└── App.jsx           # Route definitions and layout binding
```

---

## ⚙️ Tech Stack

- **React** (Vite)
- **Tailwind CSS**
- **React Router v6**
- **Recharts** (data visualization)
- **Flask REST API** (external backend)
- **JWT (JSON Web Token)** for auth

---

## 🛠️ Setup & Run

```bash
# Clone the repo
git clone https://github.com/your-username/React-ANP.git
cd React-ANP

# Install dependencies
yarn install

# Setup environment variable
cp .env.example .env
# Edit VITE_BASE_URL in .env to match your Flask API

# Run development server
yarn  dev
```

---

## 📦 Build for Production

```bash
yarn build
```

---

## 📌 Notes

- This project communicates with a backend API (Flask + Prophet) hosted separately.
- Make sure you have a valid token from the `/login` endpoint to access protected routes.
- Customer import only available for `customer` master at `/api/import/customers` for now.

---

## 👨‍💻 Author

Developed with ❤️ by [Kei]  
For CV. Aneka Niaga Pratama, Makassar, Indonesia.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
