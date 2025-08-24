# **App Name**: InvoiceFlow

## Core Features:

- User Authentication: Secure user authentication (email/password) with Firebase Auth.
- Invoice Creation: Creation of new invoices with multiple line items, including dynamic addition/removal of items and live total calculations.
- Line Item Management: Invoice form supports Product Name, Description, Price, and Quantity, with automatic line total calculation.
- Invoice Dashboard: Display a paginated list of invoices with key details and filtering/search options.
- Invoice Detail View: Detailed read-only view of individual invoices with options to edit, export as PDF, change status, and delete.
- PDF Export: Client-side PDF export of invoices using a library like react-to-print or jspdf.
- Invoice Number Generation: Smart invoice number generation that reasons about and conforms to INV-YYYY-##### pattern

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082) to evoke a sense of trust, professionalism, and modernity, aligning with financial operations.
- Background color: Light Lavender (#E6E6FA), a desaturated version of the primary hue to keep the focus on content while maintaining a consistent visual theme.
- Accent color: Soft Violet (#8A2BE2) for interactive elements and calls to action. Provides good contrast without being jarring.
- Body and headline font: 'Inter' (sans-serif) for a clean, modern, and readable interface. 'Inter' is used because its objective and neutral style promotes clarity and usability, aligning well with the professional context of invoice management.
- Crisp, professional line icons for actions and status indicators.
- Clean and structured layout with clear hierarchy and intuitive navigation.
- Subtle transitions and feedback animations for user interactions.