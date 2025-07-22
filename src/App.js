
import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

// Ensure EmailJS is loaded in the HTML or dynamically
// <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>

function App() {
  // State for form inputs
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // State for quotation details
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [showQuotation, setShowQuotation] = useState(false);

  // State for email sending status
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(''); // 'success', 'error', ''

  // State for custom modal alerts
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'

  const [productRows, setProductRows] = useState([
    { selectedCategory: '', selectedProduct: '', quantity: 1 },
  ]);
  
  const handleAddProductRow = () => {
    setProductRows([
      ...productRows,
      { selectedCategory: '', selectedProduct: '', quantity: 1 },
    ]);
  };
  
  const handleProductRowChange = (index, field, value) => {
    const updatedRows = [...productRows];
    updatedRows[index][field] = value;
  
    // Reset the product if the category changes
    if (field === 'selectedCategory') {
      updatedRows[index].selectedProduct = '';
    }
  
    setProductRows(updatedRows);
  };

  const handleRemoveProductRow = (index) => {
    const updatedRows = productRows.filter((_, i) => i !== index);
    setProductRows(updatedRows);
  };

  // Hardcoded product data (you can fetch this from an API in a real app)
  const electricalProducts = [
    { id: 'product_electric_a', name: 'Light sockets', price: 100 },
    { id: 'product_electric_b', name: 'Premium Gizmo', price: 250 },
    { id: 'product_electric_c', name: 'Economy Gadget', price: 50 },
  ];
  
  const fireProducts = [
    { id: 'product_fire_a', name: 'Standard Gizmo', price: 100 },
    { id: 'product_fire_b', name: 'Premium Gizmo', price: 250 },
    { id: 'product_fire_c', name: 'Economy Gadget', price: 50 },
  ];
  
  const securityProducts = [
    { id: 'product_security_a', name: 'Standard Gizmo', price: 100 },
    { id: 'product_security_b', name: 'Premium Gizmo', price: 250 },
    { id: 'product_security_c', name: 'Economy Gadget', price: 50 },
  ];
  
  const cctvProducts = [
    { id: 'product_cctv_a', name: 'Standard Gizmo', price: 100 },
    { id: 'product_cctv_b', name: 'Premium Gizmo', price: 250 },
    { id: 'product_cctv_c', name: 'Economy Gadget', price: 50 },
  ];

  // Initialize EmailJS when the component mounts
  useEffect(() => {
    // Check if emailjs is available globally (loaded via script tag)
    if (emailjs) {
      // Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS Public Key
      emailjs.init('3rg98gIGz_OBbMa5z');
    } else {
      console.error("EmailJS SDK not loaded. Please ensure the script tag is present in index.html.");
      setModalMessage("EmailJS SDK not loaded. Please check console for details.");
      setModalType('error');
      setShowModal(true);
    }
  }, []);

  // Handle form submission for quotation generation
  const handleGenerateQuote = (e) => {
    e.preventDefault();
  
    // Basic validation
    if (!customerName || !customerEmail) {
      setModalMessage('Please fill in all required fields (Customer Name, Customer Email).');
      setModalType('error');
      setShowModal(true);
      return;
    }
  
    // Validate each product row
    for (const row of productRows) {
      if (!row.selectedCategory || !row.selectedProduct || row.quantity <= 0) {
        setModalMessage('Please ensure all product rows have a valid category, product, and positive quantity.');
        setModalType('error');
        setShowModal(true);
        return;
      }
    }
  
    console.log('Product Rows:', productRows); // Debugging log
  
    // Generate the list of products and calculate the total price
    const productList = productRows.map((row) => {
      const productList =
        row.selectedCategory === 'electrical'
          ? electricalProducts
          : row.selectedCategory === 'fire'
          ? fireProducts
          : row.selectedCategory === 'security'
          ? securityProducts
          : row.selectedCategory === 'cctv'
          ? cctvProducts
          : [];
  
      // Find the selected product
      const currentProduct = productList.find((p) => p.id === row.selectedProduct);
  
      // Handle undefined product
      if (!currentProduct) {
        console.error(`Product not found for ID: ${row.selectedProduct} in category: ${row.selectedCategory}`);
        setModalMessage('An error occurred while processing the products. Please check your selections.');
        setModalType('error');
        setShowModal(true);
        return null; // Stop processing this row
      }
  
      return {
        productName: currentProduct.name,
        category: row.selectedCategory,
        quantity: row.quantity,
        unitPrice: currentProduct.price,
        totalPrice: currentProduct.price * row.quantity,
      };
    });
  
    // Check for null rows (in case of errors)
    if (productList.includes(null)) {
      return;
    }
  
    // Calculate the total price for all products
    const totalPrice = productList.reduce((sum, product) => sum + product.totalPrice, 0);
  
    // Create the new quotation details
    const newQuotationDetails = {
      customerName,
      customerEmail,
      products: productList,
      totalPrice: totalPrice.toFixed(2),
      notes: notes || 'No additional notes.',
    };
  
    console.log('New Quotation Details:', newQuotationDetails); // Debugging log
  
    // Set quotation details
    setQuotationDetails(newQuotationDetails);
  
    // Show quotation
    setShowQuotation(true);
  };

  // Handle sending the email
  const handleSendEmail = async () => {
    if (!quotationDetails) {
      setModalMessage('Please generate a quotation first.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus('');

    // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual EmailJS IDs
    const serviceID = 'service_pn1qndm';
    const templateID = 'template_pwj8xdb';

    // Template parameters matching your EmailJS template variables
    const templateParams = {
      customer_name: quotationDetails.customerName,
      customer_email: quotationDetails.customerEmail,
      products: quotationDetails.products
        .map(
          (product) =>
            `Product: ${product.productName} (Category: ${product.category}), Quantity: ${product.quantity}, Unit Price: £${product.unitPrice.toFixed(
              2
            )}, Total Price: £${product.totalPrice.toFixed(2)}`
        )
        .join('\n'), // Join all product details into a single string
      total_price: `£${quotationDetails.totalPrice}`,
      notes: quotationDetails.notes || 'No additional notes.',
      // The 'to_email' should be your email address, configured in the EmailJS template
      // or you can pass it here if your template is set up to receive it dynamically.
      // For this example, assume 'to_email' is configured in the template itself.
    };
    console.log({templateParams})
    try {
      if (!emailjs) {
        throw new Error("EmailJS SDK is not initialized.");
      }
      await emailjs.send(serviceID, templateID, templateParams);
      setEmailStatus('success');
      setModalMessage('Quotation email sent successfully!');
      setModalType('success');
      setShowModal(true);
      // Optionally reset form after successful send
      resetForm();
    } catch (error) {
      console.error('Failed to send email:', error);
      setEmailStatus('error');
      setModalMessage(`Failed to send email: ${error.text || error.message || 'An unknown error occurred.'}`);
      setModalType('error');
      setShowModal(true);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Function to reset the form and quotation
  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setQuantity(1);
    setNotes('');
    setQuotationDetails(null);
    setShowQuotation(false);
    setEmailStatus('');
  };

  // Custom Modal Component
  const Modal = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const textColor = 'text-white';
    const borderColor = type === 'success' ? 'border-green-700' : type === 'error' ? 'border-red-700' : 'border-blue-700';

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`relative ${bgColor} ${textColor} p-6 rounded-lg shadow-xl border-2 ${borderColor} max-w-sm w-full text-center`}>
          <p className="text-lg font-semibold mb-4">{message}</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-white text-gray-800 rounded-md shadow-md hover:bg-gray-100 transition duration-300 ease-in-out"
          >
            Close
          </button>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans flex items-center justify-center">
      {showModal && (
        <Modal
          message={modalMessage}
          type={modalType}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          Customer Quotation
        </h1>

        {/* Quotation Form */}
        <form onSubmit={handleGenerateQuote} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="customerEmail"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john.doe@example.com"
                required
              />
            </div>
          </div>
          <hr className="my-6 border-t border-gray-300" />
          <div>
          {productRows.map((row, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end mb-4">
              {/* Category Dropdown */}
              <div className="col-span-4">
                <label htmlFor={`category-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id={`category-${index}`}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  value={row.selectedCategory}
                  onChange={(e) => handleProductRowChange(index, 'selectedCategory', e.target.value)}
                >
                  <option value="">Select a category</option>
                  <option value="electrical">Electrical</option>
                  <option value="fire">Fire</option>
                  <option value="security">Security</option>
                  <option value="cctv">CCTV</option>
                </select>
              </div>

              {/* Product Dropdown */}
              <div className="col-span-4">
                <label htmlFor={`product-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  id={`product-${index}`}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  value={row.selectedProduct}
                  onChange={(e) => handleProductRowChange(index, 'selectedProduct', e.target.value)}
                  disabled={!row.selectedCategory} // Disable if no category is selected
                >
                  <option value="">Select a product</option>
                  {(row.selectedCategory === 'electrical' ? electricalProducts :
                    row.selectedCategory === 'fire' ? fireProducts :
                    row.selectedCategory === 'security' ? securityProducts :
                    row.selectedCategory === 'cctv' ? cctvProducts : []
                  ).map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div className="col-span-3">
                <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id={`quantity-${index}`}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  value={row.quantity}
                  onChange={(e) =>
                    handleProductRowChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                />
              </div>

              {/* Remove Button */}
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveProductRow(index)}
                  className="mt-6 px-2 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition duration-300 ease-in-out flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 8a1 1 0 011-1h6a1 1 0 011 1v8a1 1 0 01-1 1H7a1 1 0 01-1-1V8zm3-3a1 1 0 112 0v1h2a1 1 0 110 2H5a1 1 0 110-2h2V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddProductRow}
              className="mt-6 px-2 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition duration-300 ease-in-out flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
          <hr className="my-6 border-t border-gray-300" />
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              rows="3"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific requirements or details..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Generate Quotation
          </button>
        </form>

        {/* Quotation Display */}
        {showQuotation && quotationDetails && (
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Generated Quotation</h2>
            <div className="bg-blue-50 p-6 rounded-lg shadow-inner border border-blue-200 space-y-3">
            <p className="text-gray-700 text-xl">
              Quote for: <strong className="text-gray-900">{quotationDetails.customerName} ({quotationDetails.customerEmail})</strong> 
            </p>

            <div className="mt-4">
              <strong className="text-gray-900">Products:</strong>
              <ul className="list-none list-inside text-gray-700">
                {quotationDetails.products.map((product, index) => (
                  <li key={index} className="mt-2">
                    <p>
                      <strong>Product:</strong> {product.productName} ({product.category})
                    </p>
                    <p>
                      <strong>Quantity:</strong> {product.quantity}
                    </p>
                    <p>
                      <strong>Unit Price:</strong> £{product.unitPrice.toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Price:</strong> £{product.totalPrice.toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-2xl font-bold text-blue-700 pt-4 border-t border-blue-200">
              Total Price: £{quotationDetails.totalPrice}
            </p>

            {quotationDetails.notes && (
              <p className="text-gray-600 italic mt-2">
                <strong className="text-gray-800">Notes:</strong> {quotationDetails.notes}
              </p>
            )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className={`flex items-center justify-center py-3 px-6 rounded-md shadow-md text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105
                  ${isSendingEmail ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                {isSendingEmail ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Send Quotation Email
                  </>
                )}
              </button>
              <button
                onClick={resetForm}
                className="flex items-center justify-center py-3 px-6 rounded-md shadow-md text-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.707 4.293a1 1 0 010 1.414L12.414 9l3.293 3.293a1 1 0 01-1.414 1.414L11 10.414l-3.293 3.293a1 1 0 01-1.414-1.414L9.586 9 6.293 5.707a1 1 0 011.414-1.414L11 7.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Reset Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
