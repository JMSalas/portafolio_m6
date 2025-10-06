import { productFetch } from "./productFetch.js";

class ProductsUI {
    constructor (test = false) {
        this.formAddProduct = document.querySelector('#formAddProduct');
        this.nameInput = this.formAddProduct.querySelector('#nameInput');
        this.priceInput = this.formAddProduct.querySelector('#priceInput');
        this.quantityInput = this.formAddProduct.querySelector('#quantityInput');
        this.productTableBody = document.querySelector('tbody');
        this.emptyAlert = document.querySelector('#emptyAlert');
        this.updateProductModal = document.querySelector('#updateProduct');
        this.formUpdateProduct = this.updateProductModal.querySelector('#formUpdateProduct');
        this.newNameInput = this.formUpdateProduct.querySelector('#newNameInput');
        this.newPriceInput = this.formUpdateProduct.querySelector('#newPriceInput');
        this.newQuantityInput = this.formUpdateProduct.querySelector('#newQuantityInput');
        this.updateButton = this.updateProductModal.querySelector('#updateButton');
        this.spanId = this.updateProductModal.querySelector('#spanId');
        this.test = test;
        this.tableRow = undefined; // Fila de la tabla productos, seleccionada actualmente
    }

    // Cambiar la visibilidad de la tabla y la alerta de "Inventario vacío" cuando la tabla de productos este vacia 
    toogleAlertAndTable(isTableEmpty) {
        if (isTableEmpty) {
            this.productTableBody.parentElement.classList.toggle('d-none');
            emptyAlert.classList.toggle('d-none');  
        }
    }

    // Agregar un producto a la tabla de productos HTML
    addProduct(newProduct) {
        // Crear un nuevo elemento fila
        const tableRow = document.createElement('tr');
        // Agregar contenido HTML con informacion del producto agregado
        tableRow.innerHTML = `
            <th>${ newProduct.id }</th>
            <td data-product-name>${ newProduct.name }</td>
            <td data-product-price>${ newProduct.price }</td>
            <td data-product-quantity>${ newProduct.quantity }</td>
            <td class="smallColumn">
                <div class="d-flex justify-content-evenly">
                    <button class="btn btn-outline-primary" data-id="${ newProduct.id }" data-bs-toggle="modal" data-bs-target="#updateProduct"><i class="bi bi-pencil-square"></i> Edit</button>
                    <button class="btn btn-outline-danger" data-id="${ newProduct.id }" data-button="delete"><i class="bi bi-trash3-fill"></i> Delete</button>     
                </div>
            </td>
        `;

        // Verificar y cambiar visibilidad de la tabla y alerta de productos 
        this.toogleAlertAndTable (!this.productTableBody.childElementCount);
        // Agregar nueva fila a la tabla de productos
        this.productTableBody.appendChild(tableRow);
        this.formAddProduct.reset();
    }

   // Eliminar un producto de la tabla de productos HTML
    deleteProduct() {
        // Eliminar fila de productos seleccionada
        this.tableRow.remove();
        // Verificar y cambiar visibilidad de la tabla y alerta de productos 
        this.toogleAlertAndTable (!this.productTableBody.childElementCount);
    }

    // Cargar datos en Modal de Producto a Editar
    cargarDatosModal(productId) {
        // Transferir id al boton del modal
        this.updateButton.setAttribute('data-id',productId);
        // Actualizar span del Modal
        this.spanId.textContent = productId; 

        // Obtener las celdas de datos dentro de la fila
        const nameCell = this.tableRow.querySelector('[data-product-name]');
        const priceCell = this.tableRow.querySelector('[data-product-price]');
        const quantityCell = this.tableRow.querySelector('[data-product-quantity]');
        
        // Extraer valores y cargar en el Modal
        this.newNameInput.value = nameCell.textContent.trim();
        this.newPriceInput.value = priceCell.textContent.trim();
        this.newQuantityInput.value = quantityCell.textContent.trim();

        // Deshabilitar el botón de actualización al cargar los datos
        this.updateButton.disabled = true;
    }

    // Actualizar datos en la tabla productos con datos de producto actualizado
    updateProductTable(updatedProduct) {
        // Obtener las celdas de datos dentro de la fila
        const tdName = this.tableRow.querySelector('[data-product-name]');
        const tdPrice = this.tableRow.querySelector('[data-product-price]');
        const tdQuantity = this.tableRow.querySelector('[data-product-quantity]');

        tdName.textContent = updatedProduct.name;
        tdPrice.textContent = updatedProduct.price;
        tdQuantity.textContent = updatedProduct.quantity;
    }

    // Nuevo método para mostrar el error como un Toast
    showToast(message, type = 'danger', title = 'Error del Servidor') {
        const toastElement = document.querySelector('#toastError');
        const toastHeader = toastElement.querySelector('.toast-header strong');
        const toastBody = document.querySelector('#toastErrorMessage');

        // Actualizar el contenido y titulo
        toastHeader.textContent = title;
        toastBody.textContent = message;

        // Elimina cualquier clase de fondo anterior (peligro, éxito, etc.)
        toastElement.classList.remove('text-bg-danger', 'text-bg-success', 'text-bg-warning', 'text-bg-info');
        toastElement.classList.add(`text-bg-${type}`);
        
        // Inicializar y mostrar el Toast
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000 // Se oculta después de 5 segundos
        });
        toast.show();
    }

    // Agregar listeners a los elementos de la intefaz
    addListeners() {
        // Agregar EventListener al formulario agregar producto
        this.formAddProduct.addEventListener('submit', async (event) => {
            // Detener el envío tradicional del formulario
            event.preventDefault();

            // Preparar datos a enviar
            const data = {
                name : this.nameInput.value.trim(),
                price : this.priceInput.value,
                quantity : this.quantityInput.value
            };

            try {
                const newProduct =await productFetch('/products',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data) 
                    }
                );
                
                // Verificar que newProduct es un objeto válido.
                if (newProduct && typeof newProduct === 'object') {
                    this.addProduct(newProduct);
                    this.showToast(`Producto ${newProduct.name} (ID: ${newProduct.id}) agregado exitosamente.`, 'info', 'Operación Exitosa');
                } else {
                    throw new Error("El servidor no devolvió los datos del producto creado.");
                }
            } catch (error) {
                this.showToast(error.message);
            }
        });

        // Agregar EventListener 'click' al tbody de la tabla de productos si existe.
        // Determinar si el evento fue generado por un boton eliminar
        // Eliminar producto asociada al boton
        this.productTableBody.addEventListener('click',async(event) => {
            const btnDelete = event.target.closest('[data-button="delete"]');
            const btnEdit = event.target.closest('[data-bs-toggle="modal"]');

            if (btnDelete) {
                // Fila de la tabla productos que será eliminada
                this.tableRow = btnDelete.closest('tr');
                
                try {
                    // Enviar la solicitud DELETE usando productFetch
                    await productFetch(`/products/${this.test?999:btnDelete.dataset.id}`, 
                        {
                            method: 'DELETE'
                        }
                    );

                    this.deleteProduct();
                    this.showToast(`Producto ID: ${btnDelete.dataset.id} eliminado correctamente.`, 'info', 'Operación Exitosa');     
                }catch(error){
                    this.showToast(error.message);
                }
            }

            if (btnEdit) {
                // Fila de la tabla productos que será actualizada
                this.tableRow = btnEdit.closest('tr');
                this.cargarDatosModal(btnEdit.dataset.id);
            }
        }); 
       
        // Agregar EventListener al formulario editar tarea en el modal
        this.formUpdateProduct.addEventListener('submit', async (event) => {
            // Detener el envío tradicional del formulario
            event.preventDefault();
            
            // Preparar datos a enviar
            const data = {
                name : this.newNameInput.value.trim(),
                price : this.newPriceInput.value,
                quantity : this.newQuantityInput.value
            };
            
            try {
                // Enviar la solicitud POST usando Fetch
                const updatedProduct = await productFetch(`/products/${this.test?999:this.updateButton.dataset.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data) 
                });

                // Verificar que updatedProduct es un objeto válido.
                if (updatedProduct && typeof updatedProduct === 'object') {
                    this.updateProductTable(updatedProduct);
                    bootstrap.Modal.getOrCreateInstance(this.updateProductModal).hide();
                    this.showToast(`Producto ID: ${updatedProduct.id} actualizado a exitosamente.`, 'info', 'Operación Exitosa');
                } else {
                    throw new Error("El servidor no devolvió los datos del producto actualizado.");
                }
            } catch (error) {
                this.showToast(error.message);
            }
        });

        this.formUpdateProduct.addEventListener('input', () => {
            // Habilitar el botón si hay interacción con el formulario
            this.updateButton.disabled = false;
        });

    } // Fin addListeners
} // Fin clase

// MAIN
document.addEventListener("DOMContentLoaded", () => {
    const adminUI = new ProductsUI();
    adminUI.addListeners();
});