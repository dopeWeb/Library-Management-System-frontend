const SERVER = "https://library-management-system-vndd.onrender.com/";

const showToast = (message, type = 'success') => {
    Toastify({
        text: message,
        duration: 5000,
        className: type,
        style: {
            background: type === 'success' ? 'green' : '#B22222'
        },
        offset: {
            x: 20,
            y: 20
        },
    }).showToast();
};


const displayToastOnceForBooks = () => {
    // Check if the toast for displaying books has been shown in this session
    if (!sessionStorage.getItem('toastShownForBooks')) {
        // Show the toast message
        showToast("This may take a few seconds", 'info');
        // Mark that the toast has been shown for books
        sessionStorage.setItem('toastShownForBooks', 'true');
    }
};

const displayToastOnceForCustomers = () => {
    // Check if the toast for displaying customers has been shown in this session
    if (!sessionStorage.getItem('toastShownForCustomers')) {
        // Show the toast message
        showToast("This may take a few seconds", 'info');
        // Mark that the toast has been shown for customers
        sessionStorage.setItem('toastShownForCustomers', 'true');
    }
};

const formatAge = (age) => {
    return age > 999 ? 999 : age; // Limit age to a maximum of 3 digits
};

const formatYearPublished = (year) => {
    return year.toString().slice(0, 4); // Ensure the year is up to 4 digits
};

const formatDate = (dateString) => {
    // Check if the date string is valid
    if (!dateString || new Date(dateString).toString() === 'Invalid Date') {
        return 'Not returned yet'; // Return this message if the date is invalid
    }

    // Options for displaying the date and time
    const options = {
        year: 'numeric',
        month: 'long', // Full month name (e.g., January)
        day: 'numeric', // Day of the month
        hour: '2-digit', // 2-digit hour
        minute: '2-digit', // 2-digit minute
        second: '2-digit', // 2-digit second

    };
    // Specify 'en-US' locale to ensure the output is in English
    return new Date(dateString).toLocaleString('en-US', options);
};

const addCustomer = () => {
    const name = document.getElementById('customerName').value.trim();
    const city = document.getElementById('customerCity').value.trim();
    const age = parseInt(document.getElementById('customerAge').value, 10);
    const email = document.getElementById('customerEmail').value.trim();

    // Basic validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !city || isNaN(age) || !email) {
        showToast("Please ensure all fields are filled out correctly.");
        return;
    }

    if (age < 0 || age > 999) {
        showToast("Age can only contain up to 3 numbers.");
        return;
    }

    if (!emailPattern.test(email)) {
        showToast("Email must be valid.");
        return;
    }

    axios.post(SERVER + 'add_customer', {
        name: name,
        city: city,
        age: age,
        email: email
    }).then(response => {
        showToast(response.data.message);
        // Clear input fields
        document.getElementById('customerName').value = '';
        document.getElementById('customerCity').value = '';
        document.getElementById('customerAge').value = '';
        document.getElementById('customerEmail').value = '';
    }).catch(error => {
        handleError(error);
    });
};

const addBook = () => {
    const name = document.getElementById('bookName').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const yearPublished = parseInt(document.getElementById('bookYearPublished').value, 10);
    const type = parseInt(document.getElementById('bookType').value, 10);

    // Basic validation
    if (!name || !author || isNaN(yearPublished) || isNaN(type)) {
        showToast("Please ensure all fields are filled out correctly.");
        return;
    }

    if (yearPublished < 1000 || yearPublished > 9999) {
        showToast("The Year Published must contain 4 digits.");
        return;
    }

    axios.post(SERVER + 'add_book', {
        name: name,
        author: author,
        yearPublished: yearPublished,
        type: type
    }).then(response => {
        showToast(response.data.message);
        // Clear input fields
        document.getElementById('bookName').value = '';
        document.getElementById('bookAuthor').value = '';
        document.getElementById('bookYearPublished').value = '';
        document.getElementById('bookType').value = '';
    }).catch(error => {
        handleError(error);
    });
};

const loanBook = () => {
    const bookName = document.getElementById('loanBookName').value;
    const customerEmail = document.getElementById('loanCustomerEmail').value;

    if (!bookName || !customerEmail) {
        showToast("Both Book Name and Customer Email are required.", 'error');
        return;
    }

    axios.post(SERVER + 'loan_book', {
        bookName: bookName,
        customerEmail: customerEmail
    }).then(response => {
        showToast(response.data.message);
    }).catch(error => {
        handleError(error);
    });
};

const returnBook = () => {
    const bookName = document.getElementById('returnBookName').value;
    const customerEmail = document.getElementById('returnCustomerEmail').value;

    if (!bookName || !customerEmail) {
        showToast("Both Book Name and Customer Email are required.", 'error');
        return;
    }

    axios.post(SERVER + 'return_book', {
        bookName: bookName,
        customerEmail: customerEmail
    }).then(response => {
        showToast(response.data.message);
    }).catch(error => {
        handleError(error);
    });
};

const displayAllBooks = () => {
    displayToastOnceForBooks(); // Show the toast only once for books

    axios.get(SERVER + 'display_all_books')
        .then(response => {
            const booksDisplay = document.getElementById('booksDisplay');
            booksDisplay.innerHTML = "<ul>" + response.data.map(book =>
                `<li>Name: ${book.name}, Author: ${book.author}, Year Published: ${book.yearPublished}, Type: ${book.type}</li>`
            ).join('') + "</ul>";
        })
        .catch(error => {
            showToast("Error fetching books.", 'error');
        });
};

const displayAllCustomers = () => {
    displayToastOnceForCustomers(); // Show the toast only once for customers

    axios.get(SERVER + 'display_all_customers')
        .then(response => {
            const customersDisplay = document.getElementById('customersDisplay');
            customersDisplay.innerHTML = "<ul>" + response.data.map(customer =>
                `<li>Name: ${customer.name}, City: ${customer.city}, Age: ${customer.age}, Email: ${customer.email}</li>`
            ).join('') + "</ul>";
        })
        .catch(error => {
            showToast("Error fetching customers.", 'error');
        });
};



const displayAllLoans = () => {
    axios.get(SERVER + 'display_all_loans')
        .then(response => {
            const loansDisplay = document.getElementById('loansDisplay');
            loansDisplay.innerHTML = ""; // Clear previous content

            if (response.data.length === 0) {
                showToast("No books are loaned, you can loan a book.");
                return;
            }

            loansDisplay.innerHTML = "<ul>" + response.data.map(loan =>
                `<li><strong>Customer ID:</strong> ${loan.custId},<br>
                <strong>Customer Name:</strong> ${loan.customerName},<br>
                <strong>Book ID:</strong> ${loan.bookId},<br>
                <strong>Book Name:</strong> ${loan.bookName},<br>
                <strong>Loan Date:</strong> ${formatDate(loan.loanDate)},<br>
                <strong>Return Date:</strong> ${formatDate(loan.returnDate)}</li>`
            ).join('') + "</ul>";
        })
        .catch(error => {
            handleError(error);
        });
};

const displayLateLoans = () => {
    axios.get(SERVER + 'late_loans')
        .then(response => {
            const lateLoansDisplay = document.getElementById('lateLoansDisplay');
            lateLoansDisplay.innerHTML = ""; // Clear previous content

            if (response.data.length === 0) {
                showToast("No late books are loaned, you can loan a book.");
                return;
            }

            lateLoansDisplay.innerHTML = "<ul>" + response.data.map(loan =>
                `<li><strong>Book ID:</strong> ${loan.book_id},<br>
                <strong>Book Name:</strong> ${loan.book_name},<br>
                <strong>Book Type:</strong> ${loan.book_type},<br>
                <strong>Customer ID:</strong> ${loan.customer_id},<br>
                <strong>Customer Name:</strong> ${loan.customer_name},<br>
                <strong>Loan Date:</strong> ${formatDate(loan.loan_date)},<br>
                <strong>Due Date:</strong> ${formatDate(loan.due_date)}</li>`
            ).join('') + "</ul>";
        })
        .catch(error => {
            handleError(error);
        });
};



const findBookByName = () => {
    const bookName = document.getElementById('findBookName').value;

    if (!bookName) {
        showToast("Book name is required.", 'error');
        return;
    }

    axios.post(SERVER + 'find_book_by_name', {
        name: bookName
    }).then(response => {
        const foundBooksDisplay = document.getElementById('foundBooksDisplay');
        foundBooksDisplay.innerHTML = "<ul>" + response.data.map(book =>
            `<li>Name: ${book.name}, Author: ${book.author}, Year Published: ${book.yearPublished}, Type: ${book.type}</li>`
        ).join('') + "</ul>";
    }).catch(error => {
        handleError(error);
    });
};

const findCustomerByName = () => {
    const customerName = document.getElementById('findCustomerName').value;

    if (!customerName) {
        showToast("Customer name is required.", 'error');
        return;
    }

    axios.post(SERVER + 'find_customer_by_name', {
        name: customerName
    }).then(response => {
        const foundCustomersDisplay = document.getElementById('foundCustomersDisplay');
        foundCustomersDisplay.innerHTML = "<ul>" + response.data.map(customer =>
            `<li>Name: ${customer.name}, City: ${customer.city}, Age: ${customer.age}, Email: ${customer.email}</li>`
        ).join('') + "</ul>";
    }).catch(error => {
        handleError(error);
    });
};

const removeBook = () => {
    const bookName = document.getElementById('removeBookName').value.trim();

    if (!bookName) {
        showToast("Book name is required.", 'error');
        return;
    }

    axios.delete(SERVER + 'remove_book', {
        data: { bookName }
    }).then(response => {
        showToast(response.data.message);
        document.getElementById('removeBookName').value = ''; // Clear input
    }).catch(error => {
        handleError(error);
    });
};

const removeCustomer = () => {
    const customerEmail = document.getElementById('removeCustomerEmail').value.trim();

    if (!customerEmail) {
        showToast("Customer email is required.", 'error');
        return;
    }

    axios.delete(SERVER + 'remove_customer', {
        data: { customerEmail }
    }).then(response => {
        showToast(response.data.message);
        document.getElementById('removeCustomerEmail').value = ''; // Clear input
    }).catch(error => {
        handleError(error);
    });
};

const restoreBook = () => {
    const bookName = document.getElementById('restoreBookName').value.trim();

    if (!bookName) {
        showToast("Book name is required.", 'error');
        return;
    }

    axios.post(SERVER + 'restore_book', { bookName })
        .then(response => {
            showToast(response.data.message);
            document.getElementById('restoreBookName').value = ''; // Clear input
        })
        .catch(error => {
            handleError(error);
        });
};

const restoreCustomer = () => {
    const customerEmail = document.getElementById('restoreCustomerEmail').value.trim();

    if (!customerEmail) {
        showToast("Customer email is required.", 'error');
        return;
    }

    axios.post(SERVER + 'restore_customer', { customerEmail })
        .then(response => {
            showToast(response.data.message);
            document.getElementById('restoreCustomerEmail').value = ''; // Clear input
        })
        .catch(error => {
            handleError(error);
        });
};


const updateBook = () => {
    const bookName = document.getElementById('updateBookName').value.trim();
    const newName = document.getElementById('newBookName').value.trim();
    const author = document.getElementById('updateBookAuthor').value.trim();
    const yearPublished = parseInt(document.getElementById('updateBookYearPublished').value, 10);
    const type = parseInt(document.getElementById('updateBookType').value, 10);

    if (yearPublished < 1000 || yearPublished > 9999) {
        showToast("The Year Published must contain 4 digits.");
        return;
    }

    // Basic validation
    if (!bookName) {
        showToast("Original book name is required.", 'error');
        return;
    }

    // Check if new name is provided
    if (newName) {
        // Check if new name already exists
        axios.post(SERVER + 'check_book_exists', { newName })
            .then(response => {
                if (response.data.exists) {
                    showToast("A book with this name already exists.", 'error');
                    return;
                } else {
                    // Proceed to update the book
                    updateBookDetails();
                }
            })
            .catch(error => {
                handleError(error);
            });
    } else {
        // If no new name, just update other details
        updateBookDetails();
    }

    const updateBookDetails = () => {
        axios.put(SERVER + 'update_book', {
            bookName: bookName,
            newName: newName,
            author: author,
            yearPublished: yearPublished,
            type: type
        }).then(response => {
            showToast(response.data.message);
            // Clear input fields
            document.getElementById('updateBookName').value = '';
            document.getElementById('newBookName').value = '';
            document.getElementById('updateBookAuthor').value = '';
            document.getElementById('updateBookYearPublished').value = '';
            document.getElementById('updateBookType').value = '';
        }).catch(error => {
            handleError(error);
        });
    };
};



const updateCustomer = () => {
    const customerEmail = document.getElementById('updateCustomerEmail').value.trim();
    const newName = document.getElementById('updateCustomerName').value.trim();
    const city = document.getElementById('updateCustomerCity').value.trim();
    const age = parseInt(document.getElementById('updateCustomerAge').value, 10);
    const newEmail = document.getElementById('updateCustomerNewEmail').value.trim();


    if (age < 0 || age > 999) {
        showToast("Age can only contain up to 3 numbers.");
        return;
    }


    // Check if new email is provided
    if (newEmail) {
        // Check if new email already exists
        axios.post(SERVER + 'check_customer_exists', { newEmail })
            .then(response => {
                if (response.data.exists) {
                    showToast("Email already exists.", 'error');
                    return;
                } else {
                    // Proceed to update the customer
                    updateCustomerDetails(customerEmail, newName, city, age, newEmail);
                }
            })
            .catch(error => {
                handleError(error);
            });
    } else {
        // Proceed to update if no new email is provided
        updateCustomerDetails(customerEmail, newName, city, age, newEmail);
    }
};




const updateCustomerDetails = (customerEmail, newName, city, age, newEmail) => {
    axios.put(SERVER + 'update_customer', {
        customerEmail: customerEmail,
        name: newName,
        city: city,
        age: age,
        newEmail: newEmail
    }).then(response => {
        showToast(response.data.message);
        // Clear input fields
        document.getElementById('updateCustomerEmail').value = '';
        document.getElementById('updateCustomerName').value = '';
        document.getElementById('updateCustomerCity').value = '';
        document.getElementById('updateCustomerAge').value = '';
        document.getElementById('updateCustomerNewEmail').value = '';
    }).catch(error => {
        handleError(error);
    });
};

const getLoanedBooks = () => {
    const bookName = document.getElementById('bookNameInput').value; // Get the book name input

    if (!bookName) {
        showToast("Please provide a book name.");
        return;
    }

    axios.get(`${SERVER}/find_loaned_books?name=${bookName}`)
        .then(response => {
            const loanedBooksDisplay = document.getElementById('loanedBooksDisplay');
            loanedBooksDisplay.innerHTML = ""; // Clear previous content

            // Check if response has a data property and its length
            if (Array.isArray(response.data) && response.data.length === 0) {
                showToast("No loaned books found.");
                return;
            }

            const formattedResults = response.data.map(bookInfo =>
                `<li>
                    <strong>Book ID:</strong> ${bookInfo.book_id},<br>
                    <strong>Book Name:</strong> ${bookInfo.book_name},<br>
                    <strong>Author:</strong> ${bookInfo.author},<br>
                    <strong>Year Published:</strong> ${bookInfo.year_published},<br>
                    <strong>Type:</strong> ${bookInfo.type},<br>
                    <strong>Loan Date:</strong> ${formatDate(bookInfo.loan_date)},<br>
                    <strong>Loaned to:</strong> ${bookInfo.customer.name},<br>
                    <strong>City:</strong> ${bookInfo.customer.city},<br>
                    <strong>Age:</strong> ${bookInfo.customer.age},<br>
                    <strong>Email:</strong> ${bookInfo.customer.email}
                </li>`
            ).join('');

            loanedBooksDisplay.innerHTML = "<ul>" + formattedResults + "</ul>";
        })
        .catch(error => {
            // Check if the error response indicates a 404
            if (error.response && error.response.status === 404) {
                showToast("No loaned books found.");
            } else {
                showToast(error.response.data.message || "An error occurred."); // Handle other errors
            }
        });
};



const getCustomersWithLoanedBooks = () => {
    const customerName = document.getElementById('customerNameInput').value; // Get the customer name input

    if (!customerName) {
        showToast("Please provide a customer name.");
        return;
    }

    axios.get(`${SERVER}/customers_with_loaned_books?name=${customerName}`)
        .then(response => {
            // Format the results
            const formattedResults = response.data.map(customer => {
                return `
                    <div>
                        <strong>Name:</strong> ${customer.customer_name}<br>
                        <strong>City:</strong> ${customer.city}<br>
                        <strong>Age:</strong> ${customer.age}<br>
                        <strong>Email:</strong> ${customer.email}<br>
                        <strong>Loaned Books:</strong><br>
                        <ul>
                            <li>
                                <strong>Book ID:</strong> ${customer.book_id},<br>
                                <strong>Book Name:</strong> ${customer.book_name},<br>
                                <strong>Book Type:</strong> ${customer.book_type},<br>
                                <strong>Loan Date:</strong> ${formatDate(customer.loan_date)}
                            </li>
                        </ul>
                    </div>
                `;
            }).join('<hr>'); // Separate customers with horizontal lines

            document.getElementById('customersWithLoanedBooksDisplay').innerHTML = formattedResults;
            document.getElementById('customerNameInput').value = ''; // Clear the input field
        })
        .catch(error => {
            showToast(error.response.data.message || "An error occurred."); // Handle error
        });
};



const collapsibles = document.querySelectorAll(".collapsible");
collapsibles.forEach((collapsible) => {
    collapsible.addEventListener("click", function () {
        this.classList.toggle("active");
        const content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
});

const handleError = (error) => {
    if (error.response) {
        // Server responded with a status other than 2xx
        showToast(error.response.data.message || "An error occurred.", 'error');
    } else if (error.request) {
        // Request was made but no response was received
        showToast("No response from server.", 'error');
    } else {
        // Something happened in setting up the request
        showToast("Error: " + error.message, 'error');
    }
};

