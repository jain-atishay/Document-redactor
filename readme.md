# 📄 Document Redactor - Office Add-in

A Microsoft Word Add-in that automatically redacts sensitive information from documents while tracking all changes.

![Document Redactor Demo](Screenshot.png)

## 🎯 Features

- ✅ **Automatic Redaction**: Detects and redacts emails, phone numbers, and SSNs
- ✅ **Track Changes**: All modifications are tracked using Word's Track Changes API (1.5+)
- ✅ **Confidential Header**: Automatically adds "CONFIDENTIAL DOCUMENT" header
- ✅ **Smart Detection**: Prevents double-redaction with intelligent content analysis
- ✅ **Modern UI**: Clean, responsive interface built with React and TypeScript
- ✅ **Custom Styling**: Hand-crafted CSS with no external libraries

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Microsoft Word (Desktop or Online)

### Installation

1. Clone the repository:
```bash
   git clone https://github.com/jain-atishay/document-redactor.git
   cd document-redactor
```

2. Install dependencies:
```bash
   npm install
```

3. Start the development server:
```bash
   npm start
```

4. The add-in will automatically attempt to sideload in Word. If it doesn't, follow the [manual sideloading instructions](https://learn.microsoft.com/office/dev/add-ins/testing/sideload-office-add-ins-for-testing).

## 📋 How to Use

1. Open a Word document containing sensitive information
2. Open the Document Redactor add-in from the task pane
3. Click "Redact Document"
4. Review the redacted content with tracked changes
5. Accept changes when ready to finalize

## 🔒 What Gets Redacted

- **Email Addresses**: `user@example.com` → `[EMAIL REDACTED]`
- **Phone Numbers**: `(555) 123-4567` → `[PHONE REDACTED]`
- **Social Security Numbers**: `123-45-6789` → `[SSN REDACTED]`

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Office API**: Office.js (Word API 1.5+)
- **Styling**: Custom CSS (no external libraries)

## 📁 Project Structure
```
document-redactor/
├── public/
│   ├── manifest.xml          # Add-in manifest
│   └── certificates/         # SSL certificates for local dev
├── src/
│   ├── services/
│   │   └── redactor.ts       # Core redaction logic
│   ├── App.tsx               # Main React component
│   ├── App.css               # Custom styling
│   └── main.tsx              # Entry point
├── index.html
├── package.json
└── vite.config.ts
```

## 🧪 Testing

Test with the included sample document or your own:
```bash
# The repository includes a sample document for testing
Document-To-Be-Redacted.docx
```

## 📝 License

MIT License - feel free to use this project for learning and development.

## 👤 Author

**Atishay Jain**

- GitHub: [@jain-atishay](https://github.com/jain-atishay)

## 🙏 Acknowledgments
- Built with [Office Add-ins documentation](https://docs.microsoft.com/office/dev/add-ins/)
