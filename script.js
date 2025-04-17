document.addEventListener('DOMContentLoaded', () => {
    // Função para validar URL
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Função para aplicar fallback em imagens quebradas
    function applyImageErrorHandling(img) {
        img.onerror = () => {
            img.src = 'https://via.placeholder.com/250x250?text=Imagem+Indisponível';
        };
    }

    async function loadSavedData() {
        try {
            const response = await fetch('public/admin/products.json'); // Adjust the path as necessary
            if (!response.ok) throw new Error('Network response was not ok');
            const savedProducts = await response.json();
            const productContainer = document.querySelector('#materiais .row');
            productContainer.innerHTML = ''; // Clear existing products
            savedProducts.forEach(product => {
                // Validar URL da imagem
                if (product.image && !isValidUrl(product.image)) {
                    product.image = 'https://via.placeholder.com/250x250?text=Imagem+Indisponível';
                }
                const card = createProductCard(product);
                productContainer.appendChild(card);
                const img = card.querySelector('img.card-img-top');
                applyImageErrorHandling(img);
            });
        } catch (error) {
            console.error('Error loading products:', error);
        }

        try {
            const response = await fetch('public/admin/contact.json'); // Adjust the path as necessary
            if (!response.ok) throw new Error('Network response was not ok');
            const savedPhone = await response.json();
            document.getElementById('phoneDisplay').textContent = savedPhone;
            document.getElementById('phoneInput').value = savedPhone;
            document.getElementById('contactPhoneLink').href = `tel:+55${savedPhone.replace(/\D/g, '')}`;
        } catch (error) {
            console.error('Error loading phone:', error);
        }
    }

    loadSavedData();

    // Create product card dynamically
    function createProductCard(product) {
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 col-lg-3';
        const card = document.createElement('div');
        card.className = 'card h-100 product-card';
        card.tabIndex = 0;
        card.role = 'button';
        card.dataset.name = product.name;
        card.dataset.color = product.color;
        card.dataset.description = product.description;
        card.dataset.quantity = product.quantity;

        const imageSrc = product.image || 'https://via.placeholder.com/250x250?text=Imagem+Indisponível';

        card.innerHTML = `
            <img src="${imageSrc}" class="card-img-top" alt="${product.name}" style="height: 250px; object-fit: contain;" />
            <div class="card-body">
                <input type="checkbox" class="form-check-input product-checkbox d-none" style="position: absolute; top: 10px; right: 10px;" />
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text text-success fw-bold">${product.price}</p>
                <p class="card-text text-warning product-description">${product.description}</p>
            </div>
        `;

        col.appendChild(card);
        return col;
    }

    // Login form handling
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginNavItem = document.getElementById('loginNavItem');
    const editNavItem = document.getElementById('editNavItem');
    const addProductNavItem = document.getElementById('addProductNavItem');
    const deleteProductNavItem = document.getElementById('deleteProductNavItem');
    const editButton = document.getElementById('editButton');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (username === 'Davi Ferreira' && password === 'ADM') {
            loginError.classList.add('d-none');
            loginNavItem.classList.add('d-none');
            editNavItem.classList.remove('d-none');
            addProductNavItem.classList.remove('d-none');
            deleteProductNavItem.classList.remove('d-none');
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
            enableEditing();
        } else {
            loginError.classList.remove('d-none');
        }
    });

    // Enable editing mode
    function enableEditing() {
        editButton.textContent = 'Salvar Alterações';
        let editing = true;

        const phoneDisplay = document.getElementById('phoneDisplay');
        const phoneInput = document.getElementById('phoneInput');
        phoneDisplay.classList.add('d-none');
        phoneInput.classList.remove('d-none');

        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            makeCardEditable(card);
            card.querySelector('.product-checkbox').classList.remove('d-none');
        });

        editButton.onclick = () => {
            if (editing) {
                productCards.forEach(card => {
                    saveCardChanges(card);
                });
                // Call the new save function here
                saveData(products, phoneInput.value.trim());
                editButton.textContent = 'Editar Site';
                editing = false;

                phoneDisplay.classList.remove('d-none');
                phoneInput.classList.add('d-none');
                productCards.forEach(card => {
                    removeCardEditing(card);
                    card.querySelector('.product-checkbox').classList.add('d-none');
                });
            } else {
                phoneDisplay.classList.add('d-none');
                phoneInput.classList.remove('d-none');
                productCards.forEach(card => {
                    makeCardEditable(card);
                    card.querySelector('.product-checkbox').classList.remove('d-none');
                });
                editButton.textContent = 'Salvar Alterações';
                editing = true;
            }
        };
    }

    function makeCardEditable(card) {
        // Name
        const name = card.dataset.name;
        const nameElem = card.querySelector('.card-title');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-control mb-1';
        nameInput.value = name;
        nameInput.dataset.field = 'name';
        nameElem.style.display = 'none';
        nameElem.parentNode.insertBefore(nameInput, nameElem);

        // Price
        const priceElem = card.querySelector('.card-text.text-success');
        const priceText = priceElem.textContent.replace('R$ ', '').replace(',', '.');
        const priceInput = document.createElement('input');
        priceInput.type = 'number';
        priceInput.step = '0.01';
        priceInput.className = 'form-control mb-1';
        priceInput.value = priceText;
        priceInput.dataset.field = 'price';
        priceElem.style.display = 'none';
        priceElem.parentNode.insertBefore(priceInput, priceElem);

        // Description
        const description = card.dataset.description;
        const descElem = card.querySelector('.card-text.text-warning');
        const descInput = document.createElement('textarea');
        descInput.className = 'form-control mb-1';
        descInput.value = description;
        descInput.dataset.field = 'description';
        descElem.style.display = 'none';
        descElem.parentNode.insertBefore(descInput, descElem);

        // Color
        const color = card.dataset.color;
        const colorInput = document.createElement('input');
        colorInput.type = 'text';
        colorInput.className = 'form-control mb-1';
        colorInput.value = color;
        colorInput.dataset.field = 'color';
        descElem.parentNode.insertBefore(colorInput, descInput.nextSibling);

        // Quantity
        const quantity = card.dataset.quantity;
        const quantityInput = document.createElement('input');
        quantityInput.type = 'text';
        quantityInput.className = 'form-control mb-1';
        quantityInput.value = quantity;
        quantityInput.dataset.field = 'quantity';
        descElem.parentNode.insertBefore(quantityInput, colorInput.nextSibling);

        // Image (URL only)
        const imgElem = card.querySelector('img.card-img-top');
        const imgSrc = imgElem.src;
        const imgUrlInput = document.createElement('input');
        imgUrlInput.type = 'url';
        imgUrlInput.className = 'form-control mb-1';
        imgUrlInput.value = imgSrc;
        imgUrlInput.dataset.field = 'imageUrl';
        imgUrlInput.placeholder = 'Insira a URL da imagem';
        imgUrlInput.required = true;
        imgElem.style.border = '2px solid #ffc107';
        imgElem.parentNode.insertBefore(imgUrlInput, imgElem.nextSibling);
    }

    function saveCardChanges(card) {
        const inputs = card.querySelectorAll('input[data-field], textarea[data-field]');
        let newImageSrc = null;

        for (const input of inputs) {
            const field = input.dataset.field;
            const value = input.value.trim();
            switch (field) {
                case 'name':
                    card.dataset.name = value;
                    card.querySelector('.card-title').textContent = value;
                    break;
                case 'price':
                    const formattedPrice = 'R$ ' + parseFloat(value).toFixed(2).replace('.', ',');
                    card.querySelector('.card-text.text-success').textContent = formattedPrice;
                    break;
                case 'description':
                    card.dataset.description = value;
                    card.querySelector('.card-text.text-warning').textContent = value;
                    break;
                case 'color':
                    card.dataset.color = value;
                    break;
                case 'quantity':
                    card.dataset.quantity = value;
                    break;
                case 'imageUrl':
                    if (value && isValidUrl(value)) {
                        newImageSrc = value;
                    } else {
                        newImageSrc = 'https://via.placeholder.com/250x250?text=Imagem+Indisponível';
                    }
                    break;
            }
        }

        if (newImageSrc) {
            const img = card.querySelector('img.card-img-top');
            img.src = newImageSrc;
            applyImageErrorHandling(img);
        }
    }

    function removeCardEditing(card) {
        const inputs = card.querySelectorAll('input[data-field], textarea[data-field]');
        inputs.forEach(input => input.remove());
        card.querySelector('.card-title').style.display = '';
        card.querySelector('.card-text.text-success').style.display = '';
        card.querySelector('.card-text.text-warning').style.display = '';
        const imgElem = card.querySelector('img.card-img-top');
        imgElem.style.border = '';
    }

    // Add product
    const addProductButton = document.getElementById('addProductButton');
    const addProductForm = document.getElementById('addProductForm');
    const addProductModal = new bootstrap.Modal(document.getElementById('addProductModal'));

    addProductButton.addEventListener('click', () => {
        addProductModal.show();
    });

    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const imageUrl = document.getElementById('productImageUrl').value.trim();

        if (!imageUrl || !isValidUrl(imageUrl)) {
            alert('Por favor, insira uma URL de imagem válida.');
            return;
        }

        const newProduct = {
            name: document.getElementById('productName').value.trim(),
            price: 'R$ ' + parseFloat(document.getElementById('productPrice').value).toFixed(2).replace('.', ','),
            description: document.getElementById('productDescription').value.trim(),
            color: document.getElementById('productColor').value.trim(),
            quantity: document.getElementById('productQuantity').value.trim(),
            image: imageUrl
        };

        const productContainer = document.querySelector('#materiais .row');
        const card = createProductCard(newProduct);
        productContainer.appendChild(card);

        const img = card.querySelector('img.card-img-top');
        applyImageErrorHandling(img);

        // Call the new save function here
        saveData(products, phoneInput.value.trim());
        addProductForm.reset();
        addProductModal.hide();
    });

    // Delete products
    const deleteProductButton = document.getElementById('deleteProductButton');
    deleteProductButton.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('Selecione pelo menos um produto para excluir.');
            return;
        }
        if (confirm('Tem certeza que deseja excluir os produtos selecionados?')) {
            checkboxes.forEach(checkbox => {
                checkbox.closest('.col-sm-6').remove();
            });
            // Call the new save function here
            saveData(products, phoneInput.value.trim());
        }
    });

    // Image error handling para imagens iniciais
    const productImages = document.querySelectorAll('.product-card img');
    productImages.forEach(img => {
        applyImageErrorHandling(img);
    });

    // Bootstrap carousel
    const carouselElement = document.querySelector('#carouselBanner');
    if (carouselElement) {
        new bootstrap.Carousel(carouselElement, {
            interval: 5000,
            ride: 'carousel',
            pause: 'hover',
            wrap: true
        });
    }

    // Search form
    const searchForm = document.querySelector('form.d-flex');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchForm.querySelector('input[type="search"]').value.trim().toLowerCase();
            if (query) {
                const productCards = document.querySelectorAll('.product-card');
                productCards.forEach(card => {
                    const name = card.dataset.name.toLowerCase();
                    card.parentElement.style.display = name.includes(query) ? '' : 'none';
                });
            }
        });
    }

    // Product card click for modal
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card && !e.target.classList.contains('product-checkbox')) {
            document.getElementById('modal-product-name').textContent = card.dataset.name;
            document.getElementById('modal-product-color').textContent = card.dataset.color;
            document.getElementById('modal-product-description').textContent = card.dataset.description;
            document.getElementById('modal-product-quantity').textContent = card.dataset.quantity;
            const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
            modal.show();
        }
    });

    // Quotation form
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('arquivo');
    const fileNameDisplay = document.getElementById('nome-arquivo');

    dropArea.addEventListener('click', () => fileInput.click());
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });
    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
    });
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            updateFileName();
        }
    });
    fileInput.addEventListener('change', updateFileName);

    function updateFileName() {
        fileNameDisplay.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : '';
    }

    // Quotation form submission
    const formCotacao = document.getElementById('form-cotacao');
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmacaoModal'));
    const confirmEmail = document.getElementById('confirm-email');
    const confirmTelefone = document.getElementById('confirm-telefone');
    const confirmArquivo = document.getElementById('confirm-arquivo');
    const enviarCotacaoBtn = document.getElementById('enviar-cotacao');

    formCotacao.addEventListener('submit', (e) => {
        e.preventDefault();
        confirmEmail.textContent = document.getElementById('email').value;
        confirmTelefone.textContent = document.getElementById('telefone').value;
        confirmArquivo.textContent = fileNameDisplay.textContent || 'Nenhum arquivo selecionado';
        confirmModal.show();
    });

    enviarCotacaoBtn.addEventListener('click', () => {
        alert('Cotação enviada com sucesso!');
        confirmModal.hide();
        formCotacao.reset();
        fileNameDisplay.textContent = '';
    });
});
