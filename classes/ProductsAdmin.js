import { writeLocalFile, readLocalFile} from  '../utils/fileUtils.js';
import { Product } from './Product.js';

export class ProductsAdmin {
    constructor (path) {
        this.path = path;
    }
    
    async getProducts(method = 'READ') {
        const products = await readLocalFile(this.path);
        if (products === null) {
            throw new Error(`(${method}) No se pudo leer el archivo de datos.`);
        }
        return products;
    }

    async setProducts(products, method) {
        const success = await writeLocalFile(this.path, products);
        if (!success) {
            throw new Error(`(${method}) No se pudo escribir en el archivo de datos.`);
        }
        return success;
    }
    
    async addProduct(productData) {
        const method = 'CREATE';
        const products = await this.getProducts(method);
        let newID;

        if(products.length > 0) {
            // Encontrar el ID mas alto en caso que la lista este desordenada.
            const maxID = Math.max(...products.map(product => product.id));
            // Definir Proximo ID
            newID = maxID + 1;
        } else {
            // Si la lista está vacía, empezar en 1.
            newID = 1;
        }

        const { name, price, quantity } = productData
        const newProduct = new Product(newID, name, price, quantity);
        
        products.push(newProduct);

        await this.setProducts(products, method);
        return newProduct;
    }

    async updateProduct(id, newData) {
        const method = 'UPDATE';
        const products = await this.getProducts(method);
        const selectedProduct = products.find((product) => product.id == id);
        
        if (!selectedProduct)
            throw new Error(`Producto ID: ${id}, no encontrado. No se han actualizado productos`);

        selectedProduct.name = newData.name;
        selectedProduct.price = newData.price;
        selectedProduct.quantity = newData.quantity;
        
        await this.setProducts(products, method);
        return selectedProduct;
    }

    async deleteProduct(id) {
        const method = 'DELETE';
        const products = await this.getProducts(method);
        const selectedIndex = products.findIndex((product) => product.id == id);

        if (selectedIndex === -1)
            throw new Error(`Producto ID: ${id}, no encontrado. No se han eliminado productos`);

        products.splice(selectedIndex, 1);
        await this.setProducts(products, method);
        return true;
    }
}